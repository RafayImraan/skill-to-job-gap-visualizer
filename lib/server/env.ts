const emptyToUndefined = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const serverEnv = {
  databaseUrl: emptyToUndefined(process.env.DATABASE_URL),
  appUrl: emptyToUndefined(process.env.NEXT_PUBLIC_APP_URL),
  supabaseUrl: emptyToUndefined(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: emptyToUndefined(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  supabaseServiceRoleKey: emptyToUndefined(process.env.SUPABASE_SERVICE_ROLE_KEY),
  openAiApiKey: emptyToUndefined(process.env.OPENAI_API_KEY),
  ollamaBaseUrl: emptyToUndefined(process.env.OLLAMA_BASE_URL) ?? "http://127.0.0.1:11434",
  ollamaModel: emptyToUndefined(process.env.OLLAMA_MODEL) ?? "qwen2.5:7b-instruct",
  githubToken: emptyToUndefined(process.env.GITHUB_TOKEN),
  authSecret: emptyToUndefined(process.env.AUTH_SECRET) ?? "dev-only-auth-secret-change-me",
};

export function hasDatabaseUrl() {
  return Boolean(serverEnv.databaseUrl);
}

export function hasSupabaseConfig() {
  return Boolean(serverEnv.supabaseUrl && serverEnv.supabaseAnonKey);
}
