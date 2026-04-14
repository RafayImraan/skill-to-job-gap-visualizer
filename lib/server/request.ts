const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function trimToUndefined(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function asTrimmedString(value: unknown, maxLength: number) {
  const trimmed = trimToUndefined(value);

  if (!trimmed) {
    return "";
  }

  return trimmed.slice(0, maxLength);
}

export function requireTrimmedString(value: unknown, field: string, maxLength: number) {
  const trimmed = trimToUndefined(value);

  if (!trimmed) {
    throw new Error(`${field} is required.`);
  }

  if (trimmed.length > maxLength) {
    throw new Error(`${field} must be ${maxLength} characters or fewer.`);
  }

  return trimmed;
}

export function optionalTrimmedString(value: unknown, field: string, maxLength: number) {
  const trimmed = trimToUndefined(value);

  if (!trimmed) {
    return "";
  }

  if (trimmed.length > maxLength) {
    throw new Error(`${field} must be ${maxLength} characters or fewer.`);
  }

  return trimmed;
}

export function requireBoolean(value: unknown, field: string) {
  if (typeof value !== "boolean") {
    throw new Error(`${field} must be a boolean.`);
  }

  return value;
}

export function validateEmail(value: unknown) {
  const email = requireTrimmedString(value, "Email", 254).toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Email is invalid.");
  }

  return email;
}

export function validatePassword(value: unknown) {
  const password = requireTrimmedString(value, "Password", 128);

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  return password;
}

export function validateOptionalUrl(value: unknown, field: string) {
  const url = optionalTrimmedString(value, field, 2048);

  if (!url) {
    return "";
  }

  try {
    const parsed = new URL(url);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error(`${field} must start with http:// or https://.`);
    }

    return parsed.toString();
  } catch {
    throw new Error(`${field} must be a valid URL.`);
  }
}

export function validateGithubUsername(value: unknown) {
  const username = optionalTrimmedString(value, "GitHub username", 39);

  if (!username) {
    return "";
  }

  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)) {
    throw new Error("GitHub username is invalid.");
  }

  return username;
}

export function validateIntegerInRange(value: unknown, field: string, min: number, max: number, fallback?: number) {
  if (value === undefined || value === null || value === "") {
    if (fallback !== undefined) {
      return fallback;
    }

    throw new Error(`${field} is required.`);
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    throw new Error(`${field} must be a number.`);
  }

  const normalized = Math.round(numericValue);
  if (normalized < min || normalized > max) {
    throw new Error(`${field} must be between ${min} and ${max}.`);
  }

  return normalized;
}

export function getRequestClientId(request: Request, sessionUserId?: string | null) {
  if (sessionUserId) {
    return `user:${sessionUserId}`;
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwarded = forwardedFor?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const userAgent = request.headers.get("user-agent")?.trim() ?? "unknown";

  return `ip:${forwarded || realIp || "unknown"}:${userAgent.slice(0, 120)}`;
}

export function enforceRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    throw new Error(`RATE_LIMIT:${retryAfterSeconds}`);
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);
}

export function getRetryAfterSeconds(error: unknown) {
  if (!(error instanceof Error) || !error.message.startsWith("RATE_LIMIT:")) {
    return null;
  }

  const seconds = Number(error.message.slice("RATE_LIMIT:".length));
  return Number.isFinite(seconds) ? Math.max(1, Math.round(seconds)) : 60;
}
