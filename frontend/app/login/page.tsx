"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../lib/api";
import { saveToken } from "../../lib/auth";

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!data.token) {
        throw new Error("Authentication token was not received");
      }

      saveToken(data.token);

      router.push("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Branding */}
        <section className="relative hidden overflow-hidden bg-[#111827] lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#635bff]/20 blur-3xl" />

          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-[#8b5cf6]/15 blur-3xl" />

          <div className="relative p-10">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#635bff] to-[#8b5cf6] text-lg font-bold text-white">
                S
              </div>

              <div>
                <h1 className="text-lg font-bold text-white">
                  SkillSync <span className="text-[#9b95ff]">AI</span>
                </h1>

                <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                  Career Intelligence
                </p>
              </div>
            </Link>
          </div>

          <div className="relative px-10 pb-20">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#635bff]/15 text-xl text-[#a5a0ff]">
              ✦
            </div>

            <h2 className="max-w-lg text-4xl font-bold leading-tight tracking-tight text-white">
              Build your career with{" "}
              <span className="text-[#8b7cff]">AI.</span>
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-gray-400">
              Analyze your resume, discover better job opportunities, practice
              interviews and follow a personalized career roadmap.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "AI-powered resume analysis",
                "Personalized job matching",
                "Realistic AI interviews",
                "Smart career roadmaps",
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 text-sm text-gray-300"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#10b981]/10 text-xs text-[#10b981]">
                    ✓
                  </span>

                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="relative px-10 pb-8 text-xs text-gray-600">
            © 2026 SkillSync AI
          </div>
        </section>

        {/* Login */}
        <section className="flex min-h-screen items-center justify-center px-6 py-10">
          <div className="w-full max-w-[430px]">
            <div className="mb-10 flex justify-center lg:hidden">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#635bff] to-[#8b5cf6] text-lg font-bold text-white">
                  S
                </div>

                <span className="text-lg font-bold text-[#111827]">
                  SkillSync <span className="text-[#635bff]">AI</span>
                </span>
              </Link>
            </div>

            <div className="mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#635bff]">
                Welcome back
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-[#111827]">
                Sign in to SkillSync
              </h1>

              <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                Continue your journey toward becoming job-ready.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-semibold text-[#374151]"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-xl border border-[#e5e7eb] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#635bff] focus:ring-4 focus:ring-[#635bff]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold text-[#374151]"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-semibold text-[#635bff] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-[#e5e7eb] bg-white px-4 pr-12 text-sm text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#635bff] focus:ring-4 focus:ring-[#635bff]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-[#9ca3af] hover:text-[#374151]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 accent-[#635bff]"
                />

                <label
                  htmlFor="remember"
                  className="text-xs text-[#6b7280]"
                >
                  Remember me
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#635bff] text-sm font-semibold text-white shadow-lg shadow-[#635bff]/20 transition hover:bg-[#5046e5] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#e5e7eb]" />

              <span className="text-[11px] text-[#9ca3af]">OR</span>

              <div className="h-px flex-1 bg-[#e5e7eb]" />
            </div>

            <button
              type="button"
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#e5e7eb] bg-white text-sm font-semibold text-[#374151] transition hover:bg-[#f9fafb]"
            >
              <span className="text-base">G</span>
              Continue with Google
            </button>

            <p className="mt-8 text-center text-sm text-[#6b7280]">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-[#635bff] hover:underline"
              >
                Create an account
              </Link>
            </p>

            <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-[#9ca3af]">
              <span>🔒</span>
              Your data is securely protected
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}