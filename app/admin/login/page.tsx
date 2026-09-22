"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/admin/dashboard");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Login failed. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-2xl bg-paper p-8">
        <Link href="/" className="focus-ring inline-block rounded-sm">
          <Logo />
        </Link>
        <h1 className="mt-6 font-display text-2xl font-semibold text-ink">
          Admin sign in
        </h1>
        <p className="mt-1 font-body text-sm text-slate">
          Manage bookings and services.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block font-body text-sm font-medium text-ink/80">
              Username
            </label>
            <input
              required
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shx-input"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-body text-sm font-medium text-ink/80">
              Password
            </label>
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shx-input"
            />
          </div>

          {error && (
            <p role="alert" className="font-body text-sm text-amber-dim">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="focus-ring w-full rounded-full bg-ink px-6 py-3 font-body text-sm font-semibold text-cream disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-5 font-body text-xs text-slate">
          Demo credentials: <span className="font-medium">admin</span> /{" "}
          <span className="font-medium">shinex2026</span>
        </p>
      </div>
    </main>
  );
}
