"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AuthCredentialsInput,
  AuthSessionResponse,
  DashboardOverviewResponse,
  GithubAnalysisResponse,
  GithubProjectSuggestion,
  InterviewPrepResponse,
  MarketTrendsResponse,
  ProjectAnalysisResponse,
  ProfileMeResponse,
  ProfileSummaryResponse,
  ProfileUpdateInput,
  ProjectInput,
  RoadmapResponse,
  ResumeRewriteResponse,
  ResumeUploadResponse,
  SettingsResponse,
  SkillGapResponse,
} from "@/lib/types";

async function fetchJson<T>(input: RequestInfo | URL): Promise<T> {
  const response = await fetch(input, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

async function sendJson<T>(url: string, method: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const json = (await response.json()) as { error?: string };
      if (json.error) {
        message = json.error;
      }
    } catch {}

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: () => fetchJson<DashboardOverviewResponse>("/api/dashboard/overview"),
  });
}

export function useSkillGaps(userId = "demo-user") {
  return useQuery({
    queryKey: ["skill-gaps", userId],
    queryFn: () => fetchJson<SkillGapResponse>(`/api/skills/gaps?userId=${encodeURIComponent(userId)}`),
  });
}

export function useGithubAnalysis(username?: string) {
  return useQuery({
    queryKey: ["github-analysis", username],
    queryFn: () =>
      fetchJson<GithubAnalysisResponse>(
        username ? `/api/github/analyze?username=${encodeURIComponent(username)}` : "/api/github/analyze",
      ),
  });
}

export function useMarketTrends() {
  return useQuery({
    queryKey: ["market-trends"],
    queryFn: () => fetchJson<MarketTrendsResponse>("/api/market/trends"),
  });
}

export function useInterviewPrep() {
  return useQuery({
    queryKey: ["interview-prep"],
    queryFn: () => fetchJson<InterviewPrepResponse>("/api/interview/prep"),
  });
}

export function useProjectAnalysis() {
  return useQuery({
    queryKey: ["project-analysis"],
    queryFn: () => fetchJson<ProjectAnalysisResponse>("/api/projects/analyze"),
  });
}

export function useGithubProjectSuggestions() {
  return useQuery({
    queryKey: ["github-project-suggestions"],
    queryFn: () => fetchJson<GithubProjectSuggestion[]>("/api/projects/suggestions"),
  });
}

export function useResumePreview() {
  return useQuery({
    queryKey: ["resume-preview"],
    queryFn: () => fetchJson<ResumeUploadResponse>("/api/uploadResume"),
  });
}

export function useProfileSummary() {
  return useQuery({
    queryKey: ["profile-summary"],
    queryFn: () => fetchJson<ProfileSummaryResponse>("/api/profile/summary"),
  });
}

export function useRoadmap() {
  return useQuery({
    queryKey: ["roadmap"],
    queryFn: () => fetchJson<RoadmapResponse>("/api/roadmap/generate"),
  });
}

export function useDashboardQueryClient() {
  return useQueryClient();
}

export function useProfileMe() {
  return useQuery({
    queryKey: ["profile-me"],
    queryFn: () => fetchJson<ProfileMeResponse>("/api/profile/me"),
  });
}

export function useSettingsData() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => fetchJson<SettingsResponse>("/api/settings"),
  });
}

export function useAuthSession() {
  return useQuery({
    queryKey: ["auth-session"],
    queryFn: () => fetchJson<AuthSessionResponse>("/api/auth/session"),
  });
}

export function login(input: AuthCredentialsInput) {
  return sendJson<AuthSessionResponse>("/api/auth/login", "POST", input);
}

export function register(input: AuthCredentialsInput) {
  return sendJson<AuthSessionResponse>("/api/auth/register", "POST", input);
}

export function logout() {
  return sendJson<{ ok: boolean }>("/api/auth/logout", "POST");
}

export function updateProfile(input: ProfileUpdateInput) {
  return sendJson<ProfileMeResponse>("/api/profile/me", "PATCH", input);
}

export async function uploadResume(input: { file?: File; text?: string }) {
  const formData = new FormData();

  if (input.file) {
    formData.append("file", input.file);
  }

  if (input.text) {
    formData.append("text", input.text);
  }

  const response = await fetch("/api/uploadResume", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const json = (await response.json()) as { error?: string };
      if (json.error) {
        message = json.error;
      }
    } catch {}

    throw new Error(message);
  }

  return (await response.json()) as ResumeUploadResponse;
}

export function restoreResumeVersion(snapshotId: string) {
  return sendJson<ResumeUploadResponse>("/api/uploadResume", "PATCH", { snapshotId });
}

export function generateResumeRewrite(input: { targetRole?: string; jobDescription?: string }) {
  return sendJson<ResumeRewriteResponse>("/api/resume/rewrite", "POST", input);
}

export function persistResumeRewrite(input: { rewriteText: string; label?: string; apply?: boolean }) {
  return sendJson<ResumeUploadResponse>("/api/resume/rewrite", "PATCH", input);
}

export function createProject(input: ProjectInput) {
  return sendJson<{ ok: true }>("/api/projects", "POST", input);
}

export function updateProject(projectId: string, input: ProjectInput) {
  return sendJson<{ ok: true }>(`/api/projects/${projectId}`, "PATCH", input);
}

export function deleteProject(projectId: string) {
  return sendJson<{ ok: true }>(`/api/projects/${projectId}`, "DELETE");
}

export function updateRoadmapMilestone(input: { dayNumber: number; isCompleted: boolean }) {
  return sendJson<RoadmapResponse>("/api/roadmap/generate", "POST", input);
}
