"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "../components/AppLayout";
import { apiRequest } from "../../lib/api";
import { getToken } from "../../lib/auth";

const interviewTypes = [
  {
    id: "technical",
    title: "Technical Interview",
    description: "DSA, programming, frameworks & technical concepts",
    icon: "⌘",
  },
  {
    id: "behavioral",
    title: "Behavioral Interview",
    description: "Communication, leadership & situational questions",
    icon: "◉",
  },
  {
    id: "mixed",
    title: "Technical + Behavioral",
    description: "A complete interview experience like a real company",
    icon: "✦",
  },
];

const difficulties = [
  {
    id: "easy",
    title: "Easy",
    description: "Entry-level friendly",
  },
  {
    id: "medium",
    title: "Medium",
    description: "Industry standard",
  },
  {
    id: "hard",
    title: "Hard",
    description: "Challenging interview",
  },
];

const durations = ["15 min", "30 min", "45 min", "60 min"];

const recentInterviews = [
  {
    role: "Software Engineer",
    type: "Technical + Behavioral",
    score: 82,
    date: "Recently",
    status: "Completed",
  },
  {
    role: "Frontend Developer",
    type: "Technical Interview",
    score: 76,
    date: "2 days ago",
    status: "Completed",
  },
  {
    role: "Full Stack Developer",
    type: "Behavioral Interview",
    score: 88,
    date: "5 days ago",
    status: "Completed",
  },
];

export default function InterviewPage() {
  const [selectedType, setSelectedType] = useState("mixed");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [selectedDuration, setSelectedDuration] = useState("30 min");
  const [showSetup, setShowSetup] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState("");

  const router = useRouter();

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1400px]">
        {/* ================= PAGE HEADER ================= */}
        <section className="mb-7">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#635bff]" />

                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#635bff]">
                  AI Interview Intelligence
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
                Practice interviews like the real thing
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6b7280]">
                Your AI interviewer asks personalized questions, evaluates
                your answers and gives you actionable feedback to improve
                before your next real interview.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSetup(true)}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#635bff] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#635bff]/20 transition hover:bg-[#5046e5]"
            >
              <span>✦</span>
              Start AI Interview
            </button>
          </div>
        </section>

        {/* ================= HERO ================= */}
        <section className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#111827] via-[#171d3b] to-[#312e81] p-6 text-white shadow-xl sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-lg backdrop-blur">
                  ✦
                </div>

                <div>
                  <p className="text-xs font-semibold text-white">
                    SkillSync AI Interviewer
                  </p>
                  <p className="mt-0.5 text-[10px] text-gray-400">
                    Your personal interview coach
                  </p>
                </div>
              </div>

              <h2 className="max-w-2xl text-2xl font-bold leading-tight sm:text-3xl">
                Get interview-ready with an AI that actually challenges you.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-300">
                Practice realistic technical and behavioral interviews based
                on your resume, target role and experience level.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  "Personalized questions",
                  "Real-time evaluation",
                  "Detailed feedback",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-[11px] font-medium text-gray-200"
                  >
                    <span className="text-[#a78bfa]">✓</span>
                    {item}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowSetup(true)}
                className="mt-7 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#312e81] transition hover:bg-gray-100"
              >
                Prepare for Interview →
              </button>
            </div>

            {/* AI INTERVIEWER VISUAL */}
            <div className="relative hidden lg:block">
              <div className="mx-auto w-[260px] rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-2xl backdrop-blur">
                <div className="rounded-2xl bg-[#0f172a] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-gray-400">
                      AI INTERVIEWER
                    </span>

                    <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Live
                    </span>
                  </div>

                  <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#635bff] to-[#8b5cf6] shadow-2xl shadow-[#635bff]/30">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-3xl">
                      ✦
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl bg-white/[0.05] p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#635bff]" />
                      <span className="text-[10px] font-semibold text-gray-400">
                        AI is listening...
                      </span>
                    </div>

                    <div className="flex h-7 items-end justify-center gap-1">
                      {[12, 22, 15, 28, 18, 25, 14, 22, 11, 19].map(
                        (height, index) => (
                          <span
                            key={index}
                            className="w-1 rounded-full bg-[#8b5cf6]"
                            style={{ height: `${height}px` }}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 shadow-xl backdrop-blur">
                <p className="text-[9px] uppercase tracking-wider text-gray-400">
                  Current Score
                </p>
                <p className="mt-0.5 text-lg font-bold text-white">82%</p>
              </div>

              <div className="absolute -right-3 top-8 rounded-xl border border-white/10 bg-white/10 px-4 py-3 shadow-xl backdrop-blur">
                <p className="text-[9px] uppercase tracking-wider text-gray-400">
                  Questions
                </p>
                <p className="mt-0.5 text-lg font-bold text-white">8 / 10</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= STATS ================= */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Interviews Completed",
              value: "8",
              sub: "Across all interview types",
              icon: "◉",
              iconClass: "bg-[#635bff]/10 text-[#635bff]",
            },
            {
              label: "Average Score",
              value: "82%",
              sub: "↑ 8% from your first interview",
              icon: "↗",
              iconClass: "bg-[#10b981]/10 text-[#10b981]",
            },
            {
              label: "Questions Practiced",
              value: "64",
              sub: "Technical & behavioral",
              icon: "⌘",
              iconClass: "bg-[#8b5cf6]/10 text-[#8b5cf6]",
            },
            {
              label: "Interview Readiness",
              value: "Good",
              sub: "Keep practicing to reach excellent",
              icon: "✦",
              iconClass: "bg-[#f59e0b]/10 text-[#f59e0b]",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconClass}`}
              >
                {stat.icon}
              </div>

              <p className="mt-5 text-xs font-medium text-[#6b7280]">
                {stat.label}
              </p>

              <p className="mt-1 text-2xl font-bold tracking-tight text-[#111827]">
                {stat.value}
              </p>

              <p className="mt-1 text-[10px] text-[#9ca3af]">{stat.sub}</p>
            </div>
          ))}
        </section>

        {/* ================= MAIN GRID ================= */}
        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          {/* START INTERVIEW CARD */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#635bff]">
                  Recommended
                </p>

                <h2 className="mt-2 text-lg font-bold text-[#111827]">
                  Start a new interview
                </h2>

                <p className="mt-1 max-w-lg text-xs leading-5 text-[#6b7280]">
                  SkillSync will use your profile and resume to create a
                  personalized interview.
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#635bff]/10 text-[#635bff]">
                ✦
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[#f8f9fc] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">
                  Role
                </p>

                <p className="mt-2 text-sm font-semibold text-[#111827]">
                  Software Engineer
                </p>

                <p className="mt-1 text-[10px] text-[#9ca3af]">
                  Based on your profile
                </p>
              </div>

              <div className="rounded-xl bg-[#f8f9fc] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">
                  Type
                </p>

                <p className="mt-2 text-sm font-semibold text-[#111827]">
                  Technical + Behavioral
                </p>

                <p className="mt-1 text-[10px] text-[#9ca3af]">
                  Complete interview
                </p>
              </div>

              <div className="rounded-xl bg-[#f8f9fc] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">
                  Duration
                </p>

                <p className="mt-2 text-sm font-semibold text-[#111827]">
                  30 minutes
                </p>

                <p className="mt-1 text-[10px] text-[#9ca3af]">
                  Approximately 10 questions
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 rounded-xl border border-[#e5e7eb] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#10b981]/10 text-[#10b981]">
                  ✓
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#111827]">
                    Resume connected
                  </p>

                  <p className="mt-0.5 text-[10px] text-[#9ca3af]">
                    AI will personalize questions using your experience
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-[#10b981]/10 px-3 py-1.5 text-[10px] font-bold text-[#10b981]">
                Ready
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowSetup(true)}
              className="mt-5 w-full rounded-xl bg-[#635bff] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#635bff]/15 transition hover:bg-[#5046e5]"
            >
              Configure & Start Interview ✦
            </button>
          </div>

          {/* WHAT AI EVALUATES */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#635bff]">
                AI Evaluation
              </p>

              <h2 className="mt-2 text-lg font-bold text-[#111827]">
                What SkillSync evaluates
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#6b7280]">
                Every interview is analyzed across multiple dimensions.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {[
                {
                  title: "Technical Knowledge",
                  value: 86,
                  icon: "⌘",
                },
                {
                  title: "Problem Solving",
                  value: 78,
                  icon: "◇",
                },
                {
                  title: "Communication",
                  value: 84,
                  icon: "◉",
                },
                {
                  title: "Confidence",
                  value: 80,
                  icon: "✦",
                },
              ].map((item) => (
                <div key={item.title}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f3f4f6] text-xs text-[#635bff]">
                        {item.icon}
                      </span>

                      <span className="text-xs font-semibold text-[#374151]">
                        {item.title}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-[#111827]">
                      {item.value}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[#eef0f5]">
                    <div
                      className="h-full rounded-full bg-[#635bff] transition-all"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-[#f8f9fc] p-4">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#635bff]/10 text-[#635bff]">
                  ✦
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#111827]">
                    AI feedback after every interview
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-[#6b7280]">
                    Get strengths, weaknesses, improvement suggestions and
                    question-by-question feedback.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= RECENT INTERVIEWS ================= */}
        <section className="mt-6 rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#111827]">
                Recent Interviews
              </h2>

              <p className="mt-1 text-xs text-[#9ca3af]">
                Review your previous interview performance
              </p>
            </div>

            <button
              type="button"
              className="rounded-xl border border-[#e5e7eb] bg-white px-3.5 py-2 text-xs font-semibold text-[#374151] transition hover:bg-[#f9fafb]"
            >
              View History →
            </button>
          </div>

          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[650px]">
              <div className="grid grid-cols-[1.4fr_1.3fr_0.6fr_0.8fr_0.8fr] gap-4 border-b border-[#f3f4f6] px-3 pb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                  Interview
                </p>

                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                  Type
                </p>

                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                  Score
                </p>

                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                  Status
                </p>

                <p className="text-right text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                  Date
                </p>
              </div>

              <div className="divide-y divide-[#f3f4f6]">
                {recentInterviews.map((interview) => (
                  <div
                    key={`${interview.role}-${interview.date}`}
                    className="grid grid-cols-[1.4fr_1.3fr_0.6fr_0.8fr_0.8fr] items-center gap-4 px-3 py-4 transition hover:bg-[#fafbff]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#635bff]/10 text-xs font-bold text-[#635bff]">
                        {interview.role.charAt(0)}
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-[#111827]">
                          {interview.role}
                        </p>

                        <p className="mt-0.5 text-[10px] text-[#9ca3af]">
                          AI Interview
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-[#6b7280]">
                      {interview.type}
                    </p>

                    <p className="text-sm font-bold text-[#111827]">
                      {interview.score}%
                    </p>

                    <span className="w-fit rounded-full bg-[#10b981]/10 px-2.5 py-1 text-[9px] font-bold text-[#10b981]">
                      {interview.status}
                    </span>

                    <p className="text-right text-[10px] text-[#9ca3af]">
                      {interview.date}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= SETUP MODAL ================= */}
        {showSetup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111827]/65 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
              {/* MODAL HEADER */}
              <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#e5e7eb] bg-white px-6 py-5 sm:px-8">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#635bff]/10 text-[#635bff]">
                      ✦
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#635bff]">
                      AI Interview Setup
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-bold text-[#111827]">
                    Configure your interview
                  </h2>

                  <p className="mt-1 text-xs text-[#6b7280]">
                    Choose how you want SkillSync AI to interview you.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (isStarting) return;
                    setShowSetup(false);
                    setStartError("");
                  }}
                  disabled={isStarting}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-[#9ca3af] transition hover:bg-[#f3f4f6] hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ×
                </button>
              </div>

              <div className="space-y-7 p-6 sm:p-8">
                {/* ROLE */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#374151]">
                    Target Role
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3">
                    <span className="text-sm text-[#635bff]">⌘</span>

                    <div>
                      <p className="text-sm font-semibold text-[#111827]">
                        Software Engineer
                      </p>

                      <p className="text-[10px] text-[#9ca3af]">
                        Detected from your profile
                      </p>
                    </div>

                    <span className="ml-auto rounded-full bg-[#10b981]/10 px-2.5 py-1 text-[9px] font-bold text-[#10b981]">
                      Profile Match
                    </span>
                  </div>
                </div>

                {/* INTERVIEW TYPE */}
                <div>
                  <div className="mb-3">
                    <label className="text-xs font-semibold text-[#374151]">
                      Interview Type
                    </label>

                    <p className="mt-1 text-[10px] text-[#9ca3af]">
                      Select the areas you want to practice.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {interviewTypes.map((type) => {
                      const selected = selectedType === type.id;

                      return (
                        <button
                          type="button"
                          key={type.id}
                          onClick={() => setSelectedType(type.id)}
                          className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                            selected
                              ? "border-[#635bff] bg-[#635bff]/5 shadow-sm"
                              : "border-[#e5e7eb] bg-white hover:border-[#cfd3e1] hover:bg-[#fafbff]"
                          }`}
                        >
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm ${
                              selected
                                ? "bg-[#635bff] text-white"
                                : "bg-[#f3f4f6] text-[#635bff]"
                            }`}
                          >
                            {type.icon}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[#111827]">
                              {type.title}
                            </p>

                            <p className="mt-1 text-[10px] leading-5 text-[#6b7280]">
                              {type.description}
                            </p>
                          </div>

                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                              selected
                                ? "border-[#635bff] bg-[#635bff]"
                                : "border-[#d1d5db]"
                            }`}
                          >
                            {selected && (
                              <span className="text-[10px] text-white">✓</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* DIFFICULTY + DURATION */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-3 block text-xs font-semibold text-[#374151]">
                      Difficulty
                    </label>

                    <div className="space-y-2">
                      {difficulties.map((difficulty) => {
                        const selected =
                          selectedDifficulty === difficulty.id;

                        return (
                          <button
                            type="button"
                            key={difficulty.id}
                            onClick={() =>
                              setSelectedDifficulty(difficulty.id)
                            }
                            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                              selected
                                ? "border-[#635bff] bg-[#635bff]/5"
                                : "border-[#e5e7eb] hover:bg-[#fafbff]"
                            }`}
                          >
                            <div>
                              <p className="text-xs font-semibold text-[#111827]">
                                {difficulty.title}
                              </p>

                              <p className="mt-0.5 text-[9px] text-[#9ca3af]">
                                {difficulty.description}
                              </p>
                            </div>

                            {selected && (
                              <span className="text-xs font-bold text-[#635bff]">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-xs font-semibold text-[#374151]">
                      Interview Duration
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      {durations.map((duration) => {
                        const selected = selectedDuration === duration;

                        return (
                          <button
                            type="button"
                            key={duration}
                            onClick={() => setSelectedDuration(duration)}
                            className={`rounded-xl border px-3 py-3 text-xs font-semibold transition ${
                              selected
                                ? "border-[#635bff] bg-[#635bff]/5 text-[#635bff]"
                                : "border-[#e5e7eb] text-[#374151] hover:bg-[#fafbff]"
                            }`}
                          >
                            {duration}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* REAL INTERVIEW FEATURES */}
                <div className="rounded-2xl border border-[#e5e7eb] bg-[#f8f9fc] p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#635bff]/10 text-[#635bff]">
                      ✦
                    </div>

                    <div>
                      <p className="text-xs font-bold text-[#111827]">
                        Real interview mode
                      </p>

                      <p className="mt-1 text-[10px] leading-5 text-[#6b7280]">
                        Camera, microphone, AI voice interviewer, live
                        transcript and real-time evaluation will be available
                        when the interview starts.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {[
                      "📷 Camera analysis",
                      "🎙️ Voice interaction",
                      "✦ AI follow-up questions",
                      "📝 Live transcript",
                    ].map((feature) => (
                      <div
                        key={feature}
                        className="rounded-xl bg-white px-3 py-2.5 text-[10px] font-medium text-[#6b7280]"
                      >
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {startError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium leading-5 text-red-600">
                    {startError}
                  </div>
                )}

                {/* FOOTER */}
                <div className="flex flex-col-reverse gap-3 border-t border-[#e5e7eb] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSetup(false);
                      setStartError("");
                    }}
                    disabled={isStarting}
                    className="rounded-xl border border-[#e5e7eb] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (isStarting) return;

                      const token = getToken();

                      if (!token) {
                        router.push("/login");
                        return;
                      }

                      setIsStarting(true);
                      setStartError("");

                      try {
                        const response = await apiRequest<any>("/interviews", {
                          method: "POST",
                          token,
body: JSON.stringify({
  targetRole: "Software Engineer",
  type: selectedType,
  difficulty: selectedDifficulty,
  duration: Number.parseInt(selectedDuration, 10),
}),
                        });

                        const interview =
                          response?.data?.interview ??
                          response?.data ??
                          response?.interview ??
                          response;

                        const interviewId = interview?._id ?? interview?.id;

                        if (!interviewId) {
                          throw new Error(
                            "Interview was created, but no interview ID was returned."
                          );
                        }

                        setShowSetup(false);
                        router.push(
                          `/interview/session?id=${encodeURIComponent(interviewId)}`
                        );
                      } catch (error) {
                        setStartError(
                          error instanceof Error
                            ? error.message
                            : "Unable to start the interview. Please try again."
                        );
                      } finally {
                        setIsStarting(false);
                      }
                    }}
                    disabled={isStarting}
                    className="rounded-xl bg-[#635bff] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#635bff]/20 transition hover:bg-[#5046e5] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isStarting ? "Creating Interview..." : "Continue to Interview →"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}