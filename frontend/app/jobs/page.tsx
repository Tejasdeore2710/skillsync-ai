"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import AppLayout from "../components/AppLayout";
import { apiRequest } from "../../lib/api";
import { getToken } from "../../lib/auth";

interface JobMatch {
  _id?: string;

  jobTitle?: string;
  title?: string;
  role?: string;

  company?: string;
  companyName?: string;

  location?: string;
  jobLocation?: string;

  description?: string;
  jobDescription?: string;

  matchScore?: number;
  score?: number;

  matchedSkills?: string[];
  skills?: string[];
  requiredSkills?: string[];

  missingSkills?: string[];

  salary?: string;
  salaryRange?: string;

  jobType?: string;
  employmentType?: string;

  applyUrl?: string;
  applicationUrl?: string;
  url?: string;

  createdAt?: string;

  recommendation?: string;
  recommendationText?: string;
}

interface JobMatchResponse {
  success?: boolean;
  message?: string;

  data?:
    | JobMatch[]
    | {
        matches?: JobMatch[];
        jobMatches?: JobMatch[];
        jobMatch?: JobMatch;
      };

  jobMatches?: JobMatch[];
  matches?: JobMatch[];
  jobMatch?: JobMatch;
}

function getJobTitle(job: JobMatch): string {
  return job.jobTitle || job.title || job.role || "Software Engineer";
}

function getCompany(job: JobMatch): string {
  return job.company || job.companyName || "Company";
}

function getLocation(job: JobMatch): string {
  return job.location || job.jobLocation || "India";
}

function getScore(job: JobMatch): number {
  const value = Number(job.matchScore ?? job.score ?? 0);

  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function getSkills(job: JobMatch): string[] {
  if (Array.isArray(job.matchedSkills)) {
    return job.matchedSkills;
  }

  if (Array.isArray(job.skills)) {
    return job.skills;
  }

  if (Array.isArray(job.requiredSkills)) {
    return job.requiredSkills;
  }

  return [];
}

function getDescription(job: JobMatch): string {
  return (
    job.description ||
    job.jobDescription ||
    "This role matches your current skills and career profile."
  );
}

function getApplyUrl(job: JobMatch): string {
  return job.applyUrl || job.applicationUrl || job.url || "";
}

function getRecommendation(job: JobMatch): string {
  return (
    job.recommendation ||
    job.recommendationText ||
    "Review the job requirements and focus on improving the missing skills before applying."
  );
}

function normalizeJobList(response: JobMatchResponse): JobMatch[] {
  if (Array.isArray(response.jobMatches)) {
    return response.jobMatches;
  }

  if (Array.isArray(response.matches)) {
    return response.matches;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (response.data && !Array.isArray(response.data)) {
    if (Array.isArray(response.data.matches)) {
      return response.data.matches;
    }

    if (Array.isArray(response.data.jobMatches)) {
      return response.data.jobMatches;
    }

    if (response.data.jobMatch) {
      return [response.data.jobMatch];
    }
  }

  if (response.jobMatch) {
    return [response.jobMatch];
  }

  return [];
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false);

  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [minimumScore, setMinimumScore] = useState("0");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("match");

  const [selectedJob, setSelectedJob] = useState<JobMatch | null>(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await apiRequest<JobMatchResponse>("/job-matches", {
        method: "GET",
        token,
      });

      const jobList = normalizeJobList(response);

      setJobs(jobList);
    } catch (err) {
      console.error("Job matching error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load job matches"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const analyzeJob = async () => {
    try {
      setGenerating(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      if (!jobTitle.trim()) {
        throw new Error("Job title is required");
      }

      if (!jobDescription.trim()) {
        throw new Error("Job description is required");
      }

      await apiRequest("/job-matches/analyze", {
        method: "POST",
        token,
        body: JSON.stringify({
          jobTitle: jobTitle.trim(),
          company: company.trim(),
          jobDescription: jobDescription.trim(),
        }),
      });

      setJobTitle("");
      setCompany("");
      setJobDescription("");

      setShowAnalyzeModal(false);

      await loadJobs();
    } catch (err) {
      console.error("Job analysis error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to analyze this job"
      );
    } finally {
      setGenerating(false);
    }
  };

  const locations = useMemo(() => {
    const values = jobs
      .map((job) => getLocation(job))
      .filter(Boolean);

    return Array.from(new Set(values));
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    const searchValue = search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter((job) => {
        const searchableText = [
          getJobTitle(job),
          getCompany(job),
          getLocation(job),
          getDescription(job),
          ...getSkills(job),
          ...(job.missingSkills || []),
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(searchValue);
      });
    }

    const minimum = Number(minimumScore);

    result = result.filter((job) => getScore(job) >= minimum);

    if (locationFilter !== "all") {
      result = result.filter(
        (job) => getLocation(job) === locationFilter
      );
    }

    if (sortBy === "match") {
      result.sort((a, b) => getScore(b) - getScore(a));
    }

    if (sortBy === "recent") {
      result.sort((a, b) => {
        const first = new Date(a.createdAt || 0).getTime();
        const second = new Date(b.createdAt || 0).getTime();

        return second - first;
      });
    }

    return result;
  }, [
    jobs,
    search,
    minimumScore,
    locationFilter,
    sortBy,
  ]);

  const averageScore = useMemo(() => {
    if (jobs.length === 0) {
      return 0;
    }

    const total = jobs.reduce(
      (sum, job) => sum + getScore(job),
      0
    );

    return Math.round(total / jobs.length);
  }, [jobs]);

  const strongMatches = useMemo(() => {
    return jobs.filter((job) => getScore(job) >= 80).length;
  }, [jobs]);

  const goodMatches = useMemo(() => {
    return jobs.filter((job) => {
      const score = getScore(job);
      return score >= 60 && score < 80;
    }).length;
  }, [jobs]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1500px]">

        {/* HEADER */}
        <section className="mb-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#10b981]" />

                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#10b981]">
                  AI JOB INTELLIGENCE
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
                Analyze jobs that fit you
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
                SkillSync AI compares your resume with job descriptions and
                shows how strongly your skills match each opportunity.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setError("");
                setShowAnalyzeModal(true);
              }}
              disabled={generating}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#635bff] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#635bff]/20 transition hover:bg-[#5046e5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                {generating
                  ? "Analyzing..."
                  : "✦ Find New Matches"}
              </span>
            </button>

          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#fecaca] bg-[#fff7f7] p-4">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ef4444]/10 text-sm font-bold text-[#ef4444]">
              !
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#991b1b]">
                Unable to complete job matching
              </p>

              <p className="mt-1 break-words text-xs leading-5 text-[#b91c1c]">
                {error}
              </p>

              <button
                type="button"
                onClick={loadJobs}
                className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#635bff] shadow-sm ring-1 ring-[#e5e7eb] transition hover:bg-[#f9fafb]"
              >
                Try Again
              </button>
            </div>

          </div>
        )}

        {/* OVERVIEW CARDS */}
        <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#635bff]/10 text-[#635bff]">
                ⌕
              </div>

              <span className="rounded-full bg-[#635bff]/10 px-2.5 py-1 text-[10px] font-bold text-[#635bff]">
                AI
              </span>

            </div>

            <p className="mt-5 text-xs font-medium text-[#6b7280]">
              Total Matches
            </p>

            <p className="mt-1 text-3xl font-bold tracking-tight text-[#111827]">
              {jobs.length}
            </p>

            <p className="mt-1 text-[11px] text-[#9ca3af]">
              Opportunities analyzed for you
            </p>
          </div>

          {/* STRONG */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981]">
                ✓
              </div>

              <span className="rounded-full bg-[#10b981]/10 px-2.5 py-1 text-[10px] font-bold text-[#10b981]">
                Strong
              </span>

            </div>

            <p className="mt-5 text-xs font-medium text-[#6b7280]">
              Strong Matches
            </p>

            <p className="mt-1 text-3xl font-bold tracking-tight text-[#111827]">
              {strongMatches}
            </p>

            <p className="mt-1 text-[11px] text-[#9ca3af]">
              80%+ compatibility
            </p>
          </div>

          {/* GOOD */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f59e0b]/10 text-[#f59e0b]">
                ◉
              </div>

              <span className="rounded-full bg-[#f59e0b]/10 px-2.5 py-1 text-[10px] font-bold text-[#f59e0b]">
                Good
              </span>

            </div>

            <p className="mt-5 text-xs font-medium text-[#6b7280]">
              Good Matches
            </p>

            <p className="mt-1 text-3xl font-bold tracking-tight text-[#111827]">
              {goodMatches}
            </p>

            <p className="mt-1 text-[11px] text-[#9ca3af]">
              60–79% compatibility
            </p>
          </div>

          {/* AVERAGE */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b5cf6]/10 text-[#8b5cf6]">
                ✦
              </div>

              <span className="rounded-full bg-[#8b5cf6]/10 px-2.5 py-1 text-[10px] font-bold text-[#8b5cf6]">
                AI
              </span>

            </div>

            <p className="mt-5 text-xs font-medium text-[#6b7280]">
              Average Match
            </p>

            <p className="mt-1 text-3xl font-bold tracking-tight text-[#111827]">
              {averageScore}
              <span className="ml-1 text-sm font-medium text-[#9ca3af]">
                %
              </span>
            </p>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eef0f5]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#635bff] to-[#8b5cf6] transition-all duration-500"
                style={{
                  width: `${averageScore}%`,
                }}
              />
            </div>

          </div>

        </section>

        {/* AI INSIGHT */}
        <section className="mb-7 overflow-hidden rounded-2xl bg-gradient-to-br from-[#111827] via-[#1b2140] to-[#312e81] p-6 text-white shadow-xl">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg">
                ✦
              </div>

              <div>

                <p className="text-sm font-bold">
                  SkillSync AI Match Insight
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  {jobs.length > 0
                    ? "Your strongest opportunities are ready to explore."
                    : "Your profile is ready for targeted opportunities."}
                </h2>

                <p className="mt-2 max-w-2xl text-xs leading-5 text-white/60">
                  {jobs.length > 0
                    ? `You currently have ${strongMatches} strong ${
                        strongMatches === 1 ? "match" : "matches"
                      }. Focus on the highest-scoring roles and improve the missing skills shown in each analysis.`
                    : "Analyze a job description and SkillSync AI will compare it with your uploaded resume to calculate your compatibility."}
                </p>

              </div>

            </div>

            <Link
              href="/resume"
              className="shrink-0 rounded-xl bg-white px-5 py-3 text-center text-xs font-bold !text-[#111827] transition hover:bg-white/90"
            >
              Improve Resume →
            </Link>

          </div>

        </section>

        {/* SEARCH + FILTERS */}
        <section className="mb-6 rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">

          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_150px]">

            <div className="flex items-center rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4">

              <span className="mr-3 text-[#9ca3af]">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search jobs, companies, skills..."
                className="w-full bg-transparent py-3 text-sm text-[#111827] outline-none placeholder:text-[#9ca3af]"
              />

            </div>

            <select
              value={minimumScore}
              onChange={(event) =>
                setMinimumScore(event.target.value)
              }
              className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3 py-3 text-sm text-[#374151] outline-none focus:border-[#635bff]"
            >
              <option value="0">
                All match scores
              </option>

              <option value="80">
                80%+ Match
              </option>

              <option value="70">
                70%+ Match
              </option>

              <option value="60">
                60%+ Match
              </option>
            </select>

            <select
              value={locationFilter}
              onChange={(event) =>
                setLocationFilter(event.target.value)
              }
              className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3 py-3 text-sm text-[#374151] outline-none focus:border-[#635bff]"
            >
              <option value="all">
                All locations
              </option>

              {locations.map((location) => (
                <option
                  key={location}
                  value={location}
                >
                  {location}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
              className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3 py-3 text-sm text-[#374151] outline-none focus:border-[#635bff]"
            >
              <option value="match">
                Best Match
              </option>

              <option value="recent">
                Recent
              </option>
            </select>

          </div>

        </section>

        {/* JOB LIST */}
        <section>

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-[#111827]">
                Recommended for you
              </h2>

              <p className="mt-1 text-xs text-[#9ca3af]">
                {filteredJobs.length}{" "}
                {filteredJobs.length === 1
                  ? "opportunity"
                  : "opportunities"}{" "}
                matching your filters
              </p>
            </div>

            {jobs.length > 0 && (
              <button
                type="button"
                onClick={loadJobs}
                disabled={loading}
                className="rounded-xl border border-[#e5e7eb] bg-white px-4 py-2.5 text-xs font-semibold text-[#374151] transition hover:bg-[#f9fafb] disabled:opacity-50"
              >
                ↻ Refresh
              </button>
            )}

          </div>

          {/* LOADING */}
          {loading ? (
            <div className="grid gap-5 xl:grid-cols-2">

              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-[330px] animate-pulse rounded-2xl border border-[#e5e7eb] bg-white"
                />
              ))}

            </div>

          ) : filteredJobs.length === 0 ? (

            /* EMPTY STATE */
            <div className="rounded-2xl border border-dashed border-[#d1d5db] bg-white px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#635bff]/10 text-xl text-[#635bff]">
                ⌕
              </div>

              <h3 className="mt-5 text-lg font-bold text-[#111827]">
                {jobs.length === 0
                  ? "No job matches yet"
                  : "No job matches found"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6b7280]">
                {jobs.length === 0
                  ? "Analyze a job description and SkillSync AI will compare it with your resume."
                  : "We couldn't find opportunities matching your current filters. Try changing the filters."}
              </p>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setShowAnalyzeModal(true);
                }}
                disabled={generating}
                className="mt-6 rounded-xl bg-[#635bff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5046e5] disabled:opacity-60"
              >
                {generating
                  ? "Analyzing..."
                  : "Analyze a Job"}
              </button>

            </div>

          ) : (

            /* JOB CARDS */
            <div className="grid gap-5 xl:grid-cols-2">

              {filteredJobs.map((job, index) => {

                const score = getScore(job);
                const skills = getSkills(job);
                const missingSkills = Array.isArray(
                  job.missingSkills
                )
                  ? job.missingSkills
                  : [];

                const applyUrl = getApplyUrl(job);

                const scoreColor =
                  score >= 80
                    ? "text-[#10b981]"
                    : score >= 60
                    ? "text-[#f59e0b]"
                    : "text-[#635bff]";

                const barColor =
                  score >= 80
                    ? "bg-[#10b981]"
                    : score >= 60
                    ? "bg-[#f59e0b]"
                    : "bg-[#635bff]";

                return (
                  <article
                    key={
                      job._id ||
                      `${getCompany(job)}-${getJobTitle(
                        job
                      )}-${index}`
                    }
                    className="group rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >

                    {/* TOP */}
                    <div className="flex items-start justify-between gap-4">

                      <div className="flex min-w-0 gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#635bff]/10 to-[#8b5cf6]/10 text-lg font-bold text-[#635bff]">
                          {getCompany(job)
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">

                          <h3 className="truncate text-base font-bold text-[#111827]">
                            {getJobTitle(job)}
                          </h3>

                          <p className="mt-1 text-xs font-medium text-[#635bff]">
                            {getCompany(job)}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#9ca3af]">

                            <span>
                              ◉ {getLocation(job)}
                            </span>

                            {job.jobType && (
                              <span>
                                • {job.jobType}
                              </span>
                            )}

                            {job.employmentType && (
                              <span>
                                • {job.employmentType}
                              </span>
                            )}

                          </div>

                        </div>

                      </div>

                      {/* SCORE */}
                      <div className="shrink-0 text-right">

                        <div
                          className={`text-2xl font-bold ${scoreColor}`}
                        >
                          {score}%
                        </div>

                        <p className="text-[10px] font-medium text-[#9ca3af]">
                          Match
                        </p>

                      </div>

                    </div>

                    {/* SCORE BAR */}
                    <div className="mt-5">

                      <div className="mb-2 flex items-center justify-between">

                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">
                          Compatibility
                        </span>

                        <span className="text-[10px] font-semibold text-[#6b7280]">
                          {score}/100
                        </span>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[#eef0f5]">

                        <div
                          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                          style={{
                            width: `${score}%`,
                          }}
                        />

                      </div>

                    </div>

                    {/* DESCRIPTION */}
                    <p className="mt-5 line-clamp-3 text-xs leading-5 text-[#6b7280]">
                      {getDescription(job)}
                    </p>

                    {/* MATCHING SKILLS */}
                    {skills.length > 0 && (
                      <div className="mt-5">

                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                          Matching Skills
                        </p>

                        <div className="flex flex-wrap gap-2">

                          {skills
                            .slice(0, 6)
                            .map((skill, skillIndex) => (
                              <span
                                key={`${skill}-${skillIndex}`}
                                className="rounded-lg bg-[#f3f4f6] px-2.5 py-1.5 text-[10px] font-medium text-[#4b5563]"
                              >
                                {skill}
                              </span>
                            ))}

                        </div>

                      </div>
                    )}

                    {/* MISSING SKILLS */}
                    {missingSkills.length > 0 && (
                      <div className="mt-4">

                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                          Skills to Improve
                        </p>

                        <div className="flex flex-wrap gap-2">

                          {missingSkills
                            .slice(0, 4)
                            .map((skill, skillIndex) => (
                              <span
                                key={`${skill}-${skillIndex}`}
                                className="rounded-lg bg-[#fff7ed] px-2.5 py-1.5 text-[10px] font-medium text-[#c2410c]"
                              >
                                + {skill}
                              </span>
                            ))}

                        </div>

                      </div>
                    )}

                    {/* FOOTER */}
                    <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#f1f2f5] pt-5">

                      <div className="min-w-0">

                        {job.salaryRange ? (
                          <p className="text-xs font-semibold text-[#374151]">
                            {job.salaryRange}
                          </p>
                        ) : job.salary ? (
                          <p className="text-xs font-semibold text-[#374151]">
                            {job.salary}
                          </p>
                        ) : (
                          <p className="text-[11px] text-[#9ca3af]">
                            Personalized AI match
                          </p>
                        )}

                      </div>

                      <div className="flex shrink-0 gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedJob(job)
                          }
                          className="rounded-xl border border-[#e5e7eb] bg-white px-4 py-2.5 text-xs font-semibold text-[#374151] transition hover:bg-[#f9fafb]"
                        >
                          Details
                        </button>

                        {applyUrl ? (
                          <a
                            href={applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl bg-[#111827] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#1f2937]"
                          >
                            Apply →
                          </a>
                        ) : null}

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

        </section>

        {/* ANALYZE JOB MODAL */}
        {showAnalyzeModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/60 px-4 py-6 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                if (!generating) {
                  setShowAnalyzeModal(false);
                }
              }
            }}
          >

            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#e5e7eb] bg-white shadow-2xl">

              {/* MODAL HEADER */}
              <div className="flex items-start justify-between border-b border-[#eef0f4] px-6 py-5">

                <div>

                  <div className="mb-2 flex items-center gap-2">

                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#635bff]/10 text-[#635bff]">
                      ✦
                    </span>

                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#635bff]">
                      AI JOB ANALYSIS
                    </span>

                  </div>

                  <h2 className="text-xl font-bold tracking-tight text-[#111827]">
                    Analyze a job opportunity
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-[#6b7280]">
                    Paste the job details and SkillSync AI will compare them
                    with your uploaded resume.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!generating) {
                      setShowAnalyzeModal(false);
                    }
                  }}
                  disabled={generating}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-lg text-[#9ca3af] transition hover:bg-[#f3f4f6] hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Close"
                >
                  ×
                </button>

              </div>

              {/* MODAL BODY */}
              <div className="space-y-5 px-6 py-6">

                <div className="grid gap-4 sm:grid-cols-2">

                  {/* JOB TITLE */}
                  <div>

                    <label className="mb-2 block text-xs font-semibold text-[#374151]">
                      Job Title{" "}
                      <span className="text-[#ef4444]">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(event) =>
                        setJobTitle(event.target.value)
                      }
                      placeholder="e.g. Software Engineer"
                      disabled={generating}
                      className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#635bff] focus:bg-white focus:ring-4 focus:ring-[#635bff]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                  </div>

                  {/* COMPANY */}
                  <div>

                    <label className="mb-2 block text-xs font-semibold text-[#374151]">
                      Company
                    </label>

                    <input
                      type="text"
                      value={company}
                      onChange={(event) =>
                        setCompany(event.target.value)
                      }
                      placeholder="e.g. Google"
                      disabled={generating}
                      className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#635bff] focus:bg-white focus:ring-4 focus:ring-[#635bff]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                  </div>

                </div>

                {/* DESCRIPTION */}
                <div>

                  <label className="mb-2 block text-xs font-semibold text-[#374151]">
                    Job Description{" "}
                    <span className="text-[#ef4444]">
                      *
                    </span>
                  </label>

                  <textarea
                    value={jobDescription}
                    onChange={(event) =>
                      setJobDescription(event.target.value)
                    }
                    placeholder="Paste the complete job description here..."
                    rows={9}
                    disabled={generating}
                    className="w-full resize-none rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-sm leading-6 text-[#111827] outline-none transition focus:border-[#635bff] focus:bg-white focus:ring-4 focus:ring-[#635bff]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <p className="mt-2 text-[10px] text-[#9ca3af]">
                    Include responsibilities, required skills and
                    qualifications for a better AI match.
                  </p>

                </div>

                {/* INFO */}
                <div className="rounded-xl border border-[#e5e7eb] bg-[#f8f7ff] p-4">

                  <div className="flex gap-3">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#635bff]/10 text-[#635bff]">
                      ✦
                    </div>

                    <div>

                      <p className="text-xs font-semibold text-[#374151]">
                        What SkillSync AI analyzes
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-[#6b7280]">
                        Your resume skills, experience, projects and
                        qualifications will be compared against the job
                        requirements.
                      </p>

                    </div>

                  </div>

                </div>

                {/* ACTIONS */}
                <div className="flex flex-col-reverse gap-3 border-t border-[#eef0f4] pt-5 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={() => {
                      if (!generating) {
                        setShowAnalyzeModal(false);
                      }
                    }}
                    disabled={generating}
                    className="rounded-xl border border-[#e5e7eb] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={analyzeJob}
                    disabled={
                      generating ||
                      !jobTitle.trim() ||
                      !jobDescription.trim()
                    }
                    className="rounded-xl bg-[#635bff] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#635bff]/20 transition hover:bg-[#5046e5] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {generating
                      ? "Analyzing with AI..."
                      : "Analyze Job ✦"}
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* JOB DETAILS MODAL */}
        {selectedJob && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/60 px-4 py-6 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedJob(null);
              }
            }}
          >

            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[#e5e7eb] bg-white shadow-2xl">

              {/* HEADER */}
              <div className="flex items-start justify-between border-b border-[#eef0f4] px-6 py-5">

                <div className="flex min-w-0 gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#635bff]/10 to-[#8b5cf6]/10 text-lg font-bold text-[#635bff]">
                    {getCompany(selectedJob)
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">

                    <h2 className="text-xl font-bold text-[#111827]">
                      {getJobTitle(selectedJob)}
                    </h2>

                    <p className="mt-1 text-sm font-medium text-[#635bff]">
                      {getCompany(selectedJob)}
                    </p>

                    <p className="mt-1 text-xs text-[#9ca3af]">
                      ◉ {getLocation(selectedJob)}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedJob(null)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-lg text-[#9ca3af] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
                  aria-label="Close details"
                >
                  ×
                </button>

              </div>

              <div className="space-y-6 px-6 py-6">

                {/* SCORE */}
                <div className="rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] p-5">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
                        AI Compatibility Score
                      </p>

                      <p className="mt-1 text-sm text-[#6b7280]">
                        How closely this opportunity matches your profile.
                      </p>
                    </div>

                    <div
                      className={`text-3xl font-bold ${
                        getScore(selectedJob) >= 80
                          ? "text-[#10b981]"
                          : getScore(selectedJob) >= 60
                          ? "text-[#f59e0b]"
                          : "text-[#635bff]"
                      }`}
                    >
                      {getScore(selectedJob)}%
                    </div>

                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e5e7eb]">

                    <div
                      className={`h-full rounded-full ${
                        getScore(selectedJob) >= 80
                          ? "bg-[#10b981]"
                          : getScore(selectedJob) >= 60
                          ? "bg-[#f59e0b]"
                          : "bg-[#635bff]"
                      }`}
                      style={{
                        width: `${getScore(selectedJob)}%`,
                      }}
                    />

                  </div>

                </div>

                {/* DESCRIPTION */}
                <div>

                  <h3 className="text-sm font-bold text-[#111827]">
                    Job Description
                  </h3>

                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#6b7280]">
                    {getDescription(selectedJob)}
                  </p>

                </div>

                {/* SKILLS */}
                {getSkills(selectedJob).length > 0 && (
                  <div>

                    <h3 className="text-sm font-bold text-[#111827]">
                      Matching Skills
                    </h3>

                    <div className="mt-3 flex flex-wrap gap-2">

                      {getSkills(selectedJob).map(
                        (skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="rounded-lg bg-[#ecfdf5] px-3 py-2 text-xs font-medium text-[#047857]"
                          >
                            ✓ {skill}
                          </span>
                        )
                      )}

                    </div>

                  </div>
                )}

                {/* MISSING */}
                {Array.isArray(
                  selectedJob.missingSkills
                ) &&
                  selectedJob.missingSkills.length > 0 && (
                    <div>

                      <h3 className="text-sm font-bold text-[#111827]">
                        Skills to Improve
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2">

                        {selectedJob.missingSkills.map(
                          (skill, index) => (
                            <span
                              key={`${skill}-${index}`}
                              className="rounded-lg bg-[#fff7ed] px-3 py-2 text-xs font-medium text-[#c2410c]"
                            >
                              + {skill}
                            </span>
                          )
                        )}

                      </div>

                    </div>
                  )}

                {/* AI RECOMMENDATION */}
                <div className="rounded-2xl bg-gradient-to-br from-[#111827] to-[#312e81] p-5 text-white">

                  <div className="flex gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                      ✦
                    </div>

                    <div>

                      <p className="text-xs font-bold">
                        SkillSync AI Recommendation
                      </p>

                      <p className="mt-2 text-xs leading-6 text-white/70">
                        {getRecommendation(selectedJob)}
                      </p>

                    </div>

                  </div>

                </div>

                {/* FOOTER */}
                <div className="flex flex-col-reverse gap-3 border-t border-[#eef0f4] pt-5 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedJob(null)
                    }
                    className="rounded-xl border border-[#e5e7eb] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#f9fafb]"
                  >
                    Close
                  </button>

                  {getApplyUrl(selectedJob) && (
                    <a
                      href={getApplyUrl(selectedJob)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-[#635bff] px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-[#635bff]/20 transition hover:bg-[#5046e5]"
                    >
                      View Job / Apply →
                    </a>
                  )}

                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </AppLayout>
  );
}