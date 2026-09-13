"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AppLayout from "../components/AppLayout";
import { apiRequest } from "../../lib/api";
import { getToken } from "../../lib/auth";

interface Activity {
  _id?: string;
  type?: string;
  message?: string;
  description?: string;
  createdAt?: string;
}

interface RoadmapData {
  total?: number;
  completed?: number;
  inProgress?: number;
  latest?: unknown;
}

interface DashboardData {
  resumeScore?: number;
  jobMatches?: number;
  interviews?: number;
  projects?: number;
  roadmaps?: number | RoadmapData;
  careerProgress?: number;
  recentActivities?: Activity[];
}

interface DashboardResponse {
  success: boolean;
  message?: string;
  data?: DashboardData;
  dashboard?: DashboardData;
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await apiRequest<DashboardResponse>("/dashboard", {
          method: "GET",
          token,
        });

        const dashboardData =
          response.data || response.dashboard || null;

        if (!dashboardData) {
          throw new Error("Dashboard data not received");
        }

        setDashboard(dashboardData);
      } catch (err) {
        console.error("Dashboard error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const resumeScore = dashboard?.resumeScore ?? 0;
  const jobMatches = dashboard?.jobMatches ?? 0;
  const interviews = dashboard?.interviews ?? 0;
  const projects = dashboard?.projects ?? 0;

  /*
   * Backend currently may return roadmaps either as:
   * 1. number
   * 2. object: { total, completed, inProgress, latest }
   *
   * Normalize it once here so JSX always receives a number.
   */
  const roadmapCount =
    typeof dashboard?.roadmaps === "number"
      ? dashboard.roadmaps
      : dashboard?.roadmaps?.total ?? 0;

  const careerProgress = dashboard?.careerProgress ?? 0;

  const activities = Array.isArray(dashboard?.recentActivities)
    ? dashboard.recentActivities
    : [];

  const formatActivity = (activity: Activity) => {
    if (activity.message) {
      return activity.message;
    }

    if (activity.description) {
      return activity.description;
    }

    switch (activity.type) {
      case "resume_upload":
        return "Resume uploaded";

      case "resume_analysis":
        return "Resume analyzed";

      case "job_match":
        return "Job matching completed";

      case "interview":
        return "Interview practice completed";

      case "project":
        return "Project activity completed";

      case "roadmap":
        return "Career roadmap updated";

      case "profile_update":
        return "Profile updated";

      default:
        return "Career activity completed";
    }
  };

  const formatDate = (date?: string) => {
    if (!date) {
      return "Recently";
    }

    const created = new Date(date);

    if (Number.isNaN(created.getTime())) {
      return "Recently";
    }

    const now = new Date();
    const diff = now.getTime() - created.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    if (hours < 24) {
      return `${hours} hr ago`;
    }

    if (days < 7) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }

    return created.toLocaleDateString();
  };

  const activityIcon = (type?: string) => {
    switch (type) {
      case "resume_upload":
        return "▣";

      case "resume_analysis":
        return "✓";

      case "job_match":
        return "⌕";

      case "interview":
        return "◉";

      case "project":
        return "◆";

      case "roadmap":
        return "↗";

      default:
        return "✦";
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-[calc(100vh-130px)] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#635bff] to-[#8b5cf6] text-xl font-bold text-white shadow-lg">
              S
            </div>

            <div className="mt-5 flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#635bff]/20 border-t-[#635bff]" />

              <span className="text-sm font-medium text-[#6b7280]">
                Loading your career dashboard...
              </span>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex min-h-[calc(100vh-130px)] items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
              !
            </div>

            <h2 className="mt-4 text-lg font-bold text-[#111827]">
              Unable to load dashboard
            </h2>

            <p className="mt-2 text-sm text-[#6b7280]">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-[#635bff] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5046e5]"
            >
              Try Again
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* ================= HEADER ================= */}

        <section className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#10b981]" />

              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#10b981]">
                Career Dashboard
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#111827]">
              Your career at a glance
            </h1>

            <p className="mt-2 text-sm text-[#6b7280]">
              Track your progress and let AI help you become job-ready.
            </p>
          </div>

          <Link
            href="/resume"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#635bff] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#635bff]/20 transition hover:bg-[#5046e5]"
          >
            <span>✦</span>
            Ask SkillSync AI
          </Link>
        </section>

        {/* ================= STATS ================= */}

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {/* Resume */}

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#635bff]/10 text-[#635bff]">
                ▣
              </div>

              <span className="rounded-full bg-[#10b981]/10 px-2.5 py-1 text-[10px] font-bold text-[#10b981]">
                AI
              </span>
            </div>

            <p className="mt-5 text-xs font-medium text-[#6b7280]">
              Resume Score
            </p>

            <div className="mt-1 flex items-end gap-1">
              <span className="text-3xl font-bold text-[#111827]">
                {resumeScore}
              </span>

              <span className="mb-1 text-sm text-[#9ca3af]">
                /100
              </span>
            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#eef0f5]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#635bff] to-[#8b5cf6]"
                style={{
                  width: `${Math.min(Math.max(resumeScore, 0), 100)}%`,
                }}
              />
            </div>

            <p className="mt-2 text-[11px] text-[#9ca3af]">
              Based on your latest analysis
            </p>
          </div>

          {/* Jobs */}

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981]">
                ⌕
              </div>

              <span className="rounded-full bg-[#10b981]/10 px-2.5 py-1 text-[10px] font-bold text-[#10b981]">
                Live
              </span>
            </div>

            <p className="mt-5 text-xs font-medium text-[#6b7280]">
              Job Matches
            </p>

            <div className="mt-1">
              <span className="text-3xl font-bold text-[#111827]">
                {jobMatches}
              </span>
            </div>

            <p className="mt-5 text-[11px] text-[#9ca3af]">
              Opportunities matching your profile
            </p>
          </div>

          {/* Interviews */}

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f59e0b]/10 text-[#f59e0b]">
                ◉
              </div>

              <span className="rounded-full bg-[#f59e0b]/10 px-2.5 py-1 text-[10px] font-bold text-[#f59e0b]">
                Practice
              </span>
            </div>

            <p className="mt-5 text-xs font-medium text-[#6b7280]">
              Interviews
            </p>

            <div className="mt-1">
              <span className="text-3xl font-bold text-[#111827]">
                {interviews}
              </span>
            </div>

            <p className="mt-5 text-[11px] text-[#9ca3af]">
              AI interview sessions completed
            </p>
          </div>

          {/* Projects */}

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8b5cf6]/10 text-[#8b5cf6]">
                ◆
              </div>

              <span className="rounded-full bg-[#8b5cf6]/10 px-2.5 py-1 text-[10px] font-bold text-[#8b5cf6]">
                AI
              </span>
            </div>

            <p className="mt-5 text-xs font-medium text-[#6b7280]">
              Projects
            </p>

            <div className="mt-1">
              <span className="text-3xl font-bold text-[#111827]">
                {projects}
              </span>
            </div>

            <p className="mt-5 text-[11px] text-[#9ca3af]">
              Projects and AI recommendations
            </p>
          </div>
        </section>

        {/* ================= MAIN GRID ================= */}

        <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">

          {/* Resume Performance */}

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#111827]">
                  Resume Performance
                </h2>

                <p className="mt-1 text-xs text-[#9ca3af]">
                  Your latest AI resume score
                </p>
              </div>

              <Link
                href="/resume"
                className="rounded-xl border border-[#e5e7eb] px-3 py-2 text-xs font-semibold text-[#635bff] transition hover:bg-[#f9fafb]"
              >
                Analyze Resume
              </Link>
            </div>

            <div className="mt-8 flex items-end gap-3">
              <span className="text-5xl font-bold tracking-tight text-[#111827]">
                {resumeScore}
              </span>

              <span className="mb-2 text-sm text-[#9ca3af]">
                /100
              </span>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#eef0f5]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#635bff] to-[#8b5cf6] transition-all duration-700"
                style={{
                  width: `${Math.min(Math.max(resumeScore, 0), 100)}%`,
                }}
              />
            </div>

            <div className="mt-3 flex justify-between text-[10px] text-[#9ca3af]">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3">

              <div className="rounded-xl bg-[#f8f9fc] p-3">
                <p className="text-[10px] text-[#9ca3af]">
                  Job Matches
                </p>

                <p className="mt-1 text-lg font-bold text-[#111827]">
                  {jobMatches}
                </p>
              </div>

              <div className="rounded-xl bg-[#f8f9fc] p-3">
                <p className="text-[10px] text-[#9ca3af]">
                  Interviews
                </p>

                <p className="mt-1 text-lg font-bold text-[#111827]">
                  {interviews}
                </p>
              </div>

              <div className="rounded-xl bg-[#f8f9fc] p-3">
                <p className="text-[10px] text-[#9ca3af]">
                  Roadmaps
                </p>

                <p className="mt-1 text-lg font-bold text-[#111827]">
                  {roadmapCount}
                </p>
              </div>

            </div>
          </div>

          {/* Career Progress */}

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#111827]">
                  Career Progress
                </h2>

                <p className="mt-1 text-xs text-[#9ca3af]">
                  Your overall career journey
                </p>
              </div>

              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-[6px] border-[#e9e7ff]">
                <div
                  className="absolute inset-[-6px] rounded-full border-[6px] border-transparent border-t-[#635bff] border-r-[#635bff]"
                  style={{
                    transform: `rotate(${careerProgress * 1.8 - 45}deg)`,
                  }}
                />

                <span className="text-sm font-bold text-[#111827]">
                  {careerProgress}%
                </span>
              </div>
            </div>

            <div className="mt-7 space-y-5">

              {/* Resume Progress */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#374151]">
                    Resume
                  </span>

                  <span className="text-[10px] font-semibold text-[#9ca3af]">
                    {resumeScore}%
                  </span>
                </div>

                <div className="h-2 rounded-full bg-[#eef0f5]">
                  <div
                    className="h-full rounded-full bg-[#635bff]"
                    style={{
                      width: `${Math.min(
                        Math.max(resumeScore, 0),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Interview Progress */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#374151]">
                    Interview Preparation
                  </span>

                  <span className="text-[10px] font-semibold text-[#9ca3af]">
                    {Math.min(interviews * 10, 100)}%
                  </span>
                </div>

                <div className="h-2 rounded-full bg-[#eef0f5]">
                  <div
                    className="h-full rounded-full bg-[#10b981]"
                    style={{
                      width: `${Math.min(interviews * 10, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Project Progress */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#374151]">
                    Projects
                  </span>

                  <span className="text-[10px] font-semibold text-[#9ca3af]">
                    {Math.min(projects * 10, 100)}%
                  </span>
                </div>

                <div className="h-2 rounded-full bg-[#eef0f5]">
                  <div
                    className="h-full rounded-full bg-[#8b5cf6]"
                    style={{
                      width: `${Math.min(projects * 10, 100)}%`,
                    }}
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ================= BOTTOM GRID ================= */}

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">

          {/* Recent Activities */}

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#111827]">
                  Recent Activity
                </h2>

                <p className="mt-1 text-xs text-[#9ca3af]">
                  Your latest career actions
                </p>
              </div>

              <span className="rounded-full bg-[#f8f9fc] px-3 py-1.5 text-[10px] font-semibold text-[#6b7280]">
                {activities.length} activities
              </span>
            </div>

            <div className="mt-5">
              {activities.length === 0 ? (
                <div className="rounded-xl bg-[#f8f9fc] p-6 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#635bff]/10 text-[#635bff]">
                    ✦
                  </div>

                  <p className="mt-3 text-sm font-semibold text-[#374151]">
                    No activity yet
                  </p>

                  <p className="mt-1 text-xs text-[#9ca3af]">
                    Start using SkillSync AI to see your activity here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activities.slice(0, 5).map((activity, index) => (
                    <div
                      key={
                        activity._id ||
                        `${activity.type || "activity"}-${index}`
                      }
                      className="flex items-center gap-4 rounded-xl p-3 transition hover:bg-[#f8f9fc]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#635bff]/10 text-sm text-[#635bff]">
                        {activityIcon(activity.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#374151]">
                          {formatActivity(activity)}
                        </p>

                        <p className="mt-1 text-[10px] text-[#9ca3af]">
                          {formatDate(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI Insight */}

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111827] via-[#1b1d3a] to-[#312e81] p-6 text-white shadow-lg">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#635bff]/20 blur-2xl" />

            <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-[#8b5cf6]/20 blur-2xl" />

            <div className="relative">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg">
                  ✦
                </div>

                <div>
                  <p className="text-sm font-bold">
                    SkillSync AI Insight
                  </p>

                  <p className="text-[10px] text-white/50">
                    Personalized for your career
                  </p>
                </div>
              </div>

              <h3 className="mt-7 text-xl font-bold leading-7">
                Keep building momentum.
              </h3>

              <p className="mt-3 text-sm leading-6 text-white/65">
                Your career dashboard tracks your progress across resumes,
                job opportunities, interviews and projects. Keep improving
                the areas with the biggest impact.
              </p>

              <div className="mt-6 space-y-3">

                <Link
                  href="/resume"
                  className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-xs font-semibold transition hover:bg-white/15"
                >
                  <span>Improve your resume</span>
                  <span>→</span>
                </Link>

                <Link
                  href="/jobs"
                  className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-xs font-semibold transition hover:bg-white/15"
                >
                  <span>Explore job matches</span>
                  <span>→</span>
                </Link>

                <Link
                  href="/interview"
                  className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-xs font-semibold transition hover:bg-white/15"
                >
                  <span>Practice an AI interview</span>
                  <span>→</span>
                </Link>

              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}