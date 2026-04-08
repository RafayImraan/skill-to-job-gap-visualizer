import type { ResumeUploadResponse } from "@/lib/types";

const ATS_KEYWORDS = ["TypeScript", "React", "Next.js", "REST API", "SQL", "Docker", "CI/CD", "Testing"];
const WEAK_PHRASES = ["responsible for", "worked on", "helped with", "involved in"];

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function detectWeakPhrases(text: string) {
  const lower = text.toLowerCase();
  return WEAK_PHRASES.filter((phrase) => lower.includes(phrase));
}

function detectMissingKeywords(text: string) {
  const lower = text.toLowerCase();
  return ATS_KEYWORDS.filter((keyword) => !lower.includes(keyword.toLowerCase()));
}

function buildFindings(text: string): ResumeUploadResponse["findings"] {
  const weakPhrases = detectWeakPhrases(text);
  const missingKeywords = detectMissingKeywords(text);
  const findings: ResumeUploadResponse["findings"] = [];

  findings.push({
    title: "Missing role keywords",
    detail:
      missingKeywords.length > 0
        ? `Add ${missingKeywords.slice(0, 5).join(", ")} to better match internship and frontend-role requirements.`
        : "Your resume includes the core benchmark keywords for the current frontend-role template.",
    confidence: "High confidence",
    severity: missingKeywords.length > 0 ? "red" : "green",
  });

  findings.push({
    title: "Weak action verbs",
    detail:
      weakPhrases.length > 0
        ? `Replace phrases like ${weakPhrases.slice(0, 3).map((item) => `"${item}"`).join(", ")} with stronger outcome verbs.`
        : "Action verbs look strong and specific across the sampled resume text.",
    confidence: "Medium confidence",
    severity: weakPhrases.length > 0 ? "amber" : "green",
  });

  findings.push({
    title: "Impact statements",
    detail: /\d/.test(text)
      ? "Quantified impact exists in the resume text, which strengthens ATS and recruiter signal."
      : "Add measurable outcomes like speed gains, user counts, delivery timelines, or issue reduction.",
    confidence: "High confidence",
    severity: /\d/.test(text) ? "green" : "violet",
  });

  return findings;
}

export function analyzeResumeText(text: string): ResumeUploadResponse {
  const cleaned = normalizeWhitespace(text);
  const missingKeywords = detectMissingKeywords(cleaned);
  const weakPhrases = detectWeakPhrases(cleaned);
  const keywordCoverage = Math.round(((ATS_KEYWORDS.length - missingKeywords.length) / ATS_KEYWORDS.length) * 100);
  const atsScore = Math.max(28, Math.min(96, keywordCoverage - weakPhrases.length * 4 + (/\d/.test(cleaned) ? 8 : 0)));
  const suggestedSkills = ATS_KEYWORDS.filter((keyword) => cleaned.toLowerCase().includes(keyword.toLowerCase())).slice(0, 6);

  return {
    extractedText: cleaned,
    suggestedSkills,
    atsScore,
    findings: buildFindings(cleaned),
    keywordCoverage,
    missingKeywords,
    weakPhrases,
    history: [],
    comparison: {
      previousAtsScore: null,
      currentAtsScore: atsScore,
      delta: 0,
    },
  };
}

export async function extractResumeText(fileBuffer: Buffer, mimeType: string, fileName: string) {
  if (mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: fileBuffer });
    const result = await parser.getText();
    await parser.destroy();
    return normalizeWhitespace(result.text);
  }

  return normalizeWhitespace(fileBuffer.toString("utf8"));
}
