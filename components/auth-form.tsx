"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { login, register } from "@/lib/api";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";
  const [name, setName] = useState("");
  const [email, setEmail] = useState(mode === "sign-in" ? "ayesha@example.com" : "");
  const [password, setPassword] = useState(mode === "sign-in" ? "demo12345" : "");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    try {
      if (mode === "sign-in") {
        await login({ email, password });
      } else {
        await register({ name, email, password });
      }

      router.push(nextPath);
      router.refresh();
    } catch (submissionError) {
      setStatus("error");
      setError(submissionError instanceof Error ? submissionError.message : "Something went wrong.");
    }
  }

  return (
    <div className="page-shell" style={{ padding: "48px 0 64px" }}>
      <div className="surface panel" style={{ maxWidth: 560, margin: "0 auto", borderRadius: 28 }}>
        <div className="eyebrow">Protected Access</div>
        <h1 className="section-title" style={{ fontSize: "2rem", marginTop: 18 }}>
          {mode === "sign-in" ? "Sign in to your dashboard" : "Create your account"}
        </h1>
        <p className="section-copy">
          {mode === "sign-in"
            ? "Use the seeded demo account or sign in with a profile you created locally."
            : "Create a local account to unlock protected dashboard routes and personal profile data."}
        </p>

        <form onSubmit={handleSubmit} className="feedback-list" style={{ marginTop: 24 }}>
          {mode === "sign-up" ? (
            <label className="feedback-item">
              <div className="muted">Name</div>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                style={{ width: "100%", marginTop: 10, background: "transparent", border: 0, color: "var(--text)" }}
              />
            </label>
          ) : null}

          <label className="feedback-item">
            <div className="muted">Email</div>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              style={{ width: "100%", marginTop: 10, background: "transparent", border: 0, color: "var(--text)" }}
            />
          </label>

          <label className="feedback-item">
            <div className="muted">Password</div>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              style={{ width: "100%", marginTop: 10, background: "transparent", border: 0, color: "var(--text)" }}
            />
          </label>

          {status === "error" ? <p style={{ color: "var(--red)", margin: 0 }}>{error}</p> : null}

          <div className="cta-row">
            <button className="button-primary" type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Working..." : mode === "sign-in" ? "Sign In" : "Create Account"}
            </button>
            <Link className="button-secondary" href={mode === "sign-in" ? "/auth/sign-up" : "/auth/sign-in"}>
              {mode === "sign-in" ? "Create account" : "I already have an account"}
            </Link>
          </div>
        </form>

        {mode === "sign-in" ? (
          <div className="feedback-item" style={{ marginTop: 24 }}>
            <strong>Demo account</strong>
            <p className="section-copy" style={{ marginTop: 8 }}>
              Email: `ayesha@example.com` | Password: `demo12345`
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
