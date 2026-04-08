import { generateOllamaJson } from "@/lib/server/local-ai";
import { analyzeResumeText } from "@/lib/server/resume";
import type { ResumeRewriteResponse } from "@/lib/types";

type ResumeRewriteInput = {
  resumeText: string;
  targetRole?: string | null;
  jobDescription?: string | null;
};

const STRONG_VERB_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bresponsible for\b/gi, "Led"],
  [/\bworked on\b/gi, "Built"],
  [/\bhelped with\b/gi, "Improved"],
  [/\binvolved in\b/gi, "Delivered"],
];

function normalizeSentence(value: string) {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (!trimmed) return "";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function splitIntoBullets(text: string) {
  const bullets = text
    .split(/\n|\u2022|-/)
    .map((item) => normalizeSentence(item))
    .filter((item) => item.length > 24);

  if (bullets.length > 0) {
    return bullets.slice(0, 4);
  }

  return text
    .split(/[.!?]/)
    .map((item) => normalizeSentence(item))
    .filter((item) => item.length > 24)
    .slice(0, 4);
}

function strengthenBullet(input: string, targetRole: string, hasMetrics: boolean) {
  let output = input;

  for (const [pattern, replacement] of STRONG_VERB_REPLACEMENTS) {
    output = output.replace(pattern, replacement);
  }

  if (!/\b(react|next\.js|typescript|sql|api|testing|docker)\b/i.test(output)) {
    output = output.replace(
      /\.$/,
      ` using ${targetRole.includes("frontend") ? "React, TypeScript, and reusable UI patterns" : "modern engineering best practices"}.`,
    );
  }

  if (!hasMetrics) {
    output = output.replace(
      /\.$/,
      " Add a measurable result such as response time, conversion gain, users served, or issues reduced.",
    );
  }

  return normalizeSentence(output);
}

function deriveStrengths(resumeText: string) {
  const lower = resumeText.toLowerCase();
  const strengths = [];

  if (/\breact|next\.js|typescript\b/i.test(resumeText)) strengths.push("Strong frontend stack evidence");
  if (/\bapi|backend|sql|database\b/i.test(resumeText)) strengths.push("Has application and data-layer exposure");
  if (/\bdeploy|vercel|netlify|aws|docker\b/i.test(resumeText)) strengths.push("Shows shipping or deployment signal");
  if (/\d/.test(resumeText)) strengths.push("Includes quantified impact");

  if (strengths.length === 0) {
    strengths.push("Has baseline technical project experience");
  }

  if (lower.includes("team") || lower.includes("collabor")) {
    strengths.push("Mentions collaboration or cross-functional delivery");
  }

  return strengths.slice(0, 4);
}

function buildFallbackRewrite(input: ResumeRewriteInput): ResumeRewriteResponse {
  const targetRole = input.targetRole?.trim() || "Frontend Engineer";
  const analysis = analyzeResumeText(input.resumeText);
  const bullets = splitIntoBullets(input.resumeText);
  const improvedBullets = bullets.map((bullet) => strengthenBullet(bullet, targetRole.toLowerCase(), /\d/.test(bullet)));
  const jobText = `${targetRole} ${input.jobDescription ?? ""}`.toLowerCase();
  const recommendedKeywords = Array.from(
    new Set(
      [
        "TypeScript",
        "React",
        "Next.js",
        "REST API",
        "SQL",
        "Testing",
        "Docker",
        "CI/CD",
        "Performance",
        "Accessibility",
      ].filter((keyword) => jobText.includes(keyword.toLowerCase()) || analysis.missingKeywords.includes(keyword)),
    ),
  ).slice(0, 6);

  const matchScore = Math.max(
    32,
    Math.min(
      94,
      Math.round(
        analysis.atsScore * 0.55 +
          analysis.keywordCoverage * 0.2 +
          (recommendedKeywords.length > 0 ? 18 : 8) +
          deriveStrengths(input.resumeText).length * 3,
      ),
    ),
  );

  return {
    mode: "fallback",
    targetRole,
    matchScore,
    summary: input.jobDescription?.trim()
      ? `This rewrite is tuned for ${targetRole} using your stored resume plus the job brief you provided. The biggest lift comes from stronger action verbs, tighter keyword alignment, and adding measurable outcomes.`
      : `This rewrite is tuned for ${targetRole} using your stored resume. The biggest lift comes from stronger action verbs, tighter keyword alignment, and adding measurable outcomes.`,
    improvedBullets:
      improvedBullets.length > 0
        ? improvedBullets
        : [`Built recruiter-ready ${targetRole} proof with clearer ownership, stronger verbs, and measurable project impact.`],
    recommendedKeywords,
    missingKeywords: analysis.missingKeywords.slice(0, 6),
    strengths: deriveStrengths(input.resumeText),
  };
}

function parseAiResponse(raw: string, fallback: ResumeRewriteResponse) {
  try {
    const parsed = JSON.parse(raw) as Partial<ResumeRewriteResponse>;
    return {
      ...fallback,
      ...parsed,
      mode: "ai" as const,
      improvedBullets:
        parsed.improvedBullets?.filter((item): item is string => typeof item === "string" && item.trim().length > 0) ??
        fallback.improvedBullets,
      recommendedKeywords:
        parsed.recommendedKeywords?.filter((item): item is string => typeof item === "string" && item.trim().length > 0) ??
        fallback.recommendedKeywords,
      missingKeywords:
        parsed.missingKeywords?.filter((item): item is string => typeof item === "string" && item.trim().length > 0) ??
        fallback.missingKeywords,
      strengths:
        parsed.strengths?.filter((item): item is string => typeof item === "string" && item.trim().length > 0) ??
        fallback.strengths,
    };
  } catch {
    return fallback;
  }
}

async function generateOllamaRewrite(input: ResumeRewriteInput, fallback: ResumeRewriteResponse) {
  const prompt = `
Return strict JSON only with keys:
mode, targetRole, matchScore, summary, improvedBullets, recommendedKeywords, missingKeywords, strengths.

Target role: ${input.targetRole ?? "Frontend Engineer"}
Job description:
${input.jobDescription ?? "Not provided"}

Resume:
${input.resumeText}

Rules:
- matchScore must be a number from 0 to 100
- improvedBullets must contain 3 to 5 concise recruiter-ready bullets
- recommendedKeywords, missingKeywords, strengths should each contain 3 to 6 short strings
- summary should be 2 sentences max
`.trim();

  const payload = await generateOllamaJson<ResumeRewriteResponse>(prompt);
  if (!payload) {
    return fallback;
  }

  return parseAiResponse(JSON.stringify(payload), fallback);
}

export async function generateResumeRewrite(input: ResumeRewriteInput): Promise<ResumeRewriteResponse> {
  const fallback = buildFallbackRewrite(input);
  return generateOllamaRewrite(input, fallback);
}

export function generateFallbackResumeRewrite(input: ResumeRewriteInput): ResumeRewriteResponse {
  return buildFallbackRewrite(input);
}
