"use client";

import { ChangeEvent, DragEvent, useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { getToken } from "../../lib/auth";

const API_URL = "http://localhost:5000/api";

interface Education {
  degree?: string;
  institution?: string;
  year?: string | number;
}

interface Experience {
  company?: string;
  role?: string;
  duration?: string;
  description?: string;
}

interface Project {
  name?: string;
  description?: string;
  technologies?: string[];
}

interface Resume {
  _id?: string;
  fileName?: string;
  originalName?: string;
  fileUrl?: string;
  parsedText?: string;
  skills?: string[];
  education?: Education[];
  experience?: Experience[];
  projects?: Project[];
  certifications?: string[];
  resumeScore?: number;
  suggestions?: string[];
}

interface ResumeResponse {
  success?: boolean;
  message?: string;
  resume?: Resume | null;
  data?: Resume | null;
}

export default function ResumePage() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    loadResume();
  }, []);

  async function loadResume() {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const response = await fetch(`${API_URL}/resumes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: ResumeResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load resume");
      }

      const loadedResume = data.resume ?? data.data ?? null;

      setResume(loadedResume);

      if (loadedResume?.originalName) {
        setFileName(loadedResume.originalName);
      } else if (loadedResume?.fileName) {
        setFileName(loadedResume.fileName);
      }
    } catch (err) {
      console.error("Resume loading error:", err);

      const message =
        err instanceof Error ? err.message : "Unable to load resume";

      // No resume uploaded yet is not treated as a fatal error.
      if (
        message.toLowerCase().includes("not found") ||
        message.toLowerCase().includes("no resume")
      ) {
        setResume(null);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  function validateFile(file: File) {
    if (file.type !== "application/pdf") {
      setError("Only PDF resumes are supported.");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Resume size must be less than 5 MB.");
      return false;
    }

    return true;
  }

  async function uploadResume(file: File) {
    if (!validateFile(file)) {
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");
      setFileName(file.name);

      const token = getToken();

      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch(`${API_URL}/resumes/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data: ResumeResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Resume upload failed");
      }

      const uploadedResume = data.resume ?? data.data ?? null;

      if (!uploadedResume) {
        throw new Error("Resume was uploaded but analysis data was not returned.");
      }

      setResume(uploadedResume);
      setSuccess("Resume uploaded and analyzed successfully.");
    } catch (err) {
      console.error("Resume upload error:", err);

      setError(
        err instanceof Error ? err.message : "Unable to upload resume"
      );
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    uploadResume(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    uploadResume(file);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  }

  const score = Math.max(
    0,
    Math.min(100, Number(resume?.resumeScore ?? 0))
  );

  const skills = resume?.skills ?? [];
  const education = resume?.education ?? [];
  const experience = resume?.experience ?? [];
  const projects = resume?.projects ?? [];
  const certifications = resume?.certifications ?? [];
  const suggestions = resume?.suggestions ?? [];

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1500px]">
        {/* PAGE HEADER */}
        <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#10b981]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#10b981]">
                AI Resume Intelligence
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#111827]">
              Resume Analyzer
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
              Upload your resume and let SkillSync AI analyze your profile,
              identify improvement areas and make your resume more job-ready.
            </p>
          </div>

          {resume && (
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-[#e5e7eb] bg-white px-4 py-2.5 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">
                  Current Score
                </p>
                <p className="mt-0.5 text-lg font-bold text-[#111827]">
                  {score}
                  <span className="ml-1 text-xs font-medium text-[#9ca3af]">
                    /100
                  </span>
                </p>
              </div>

              <label className="cursor-pointer rounded-xl bg-[#635bff] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#635bff]/20 transition hover:bg-[#5046e5]">
                Analyze New Resume
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
            </div>
          )}
        </div>

        {/* ALERTS */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ef4444]/10 text-sm font-bold text-[#ef4444]">
              !
            </div>

            <div>
              <p className="text-sm font-semibold text-[#991b1b]">
                Something went wrong
              </p>
              <p className="mt-1 text-xs text-[#b91c1c]">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto text-sm text-[#b91c1c] hover:text-[#7f1d1d]"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#a7f3d0] bg-[#ecfdf5] p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#10b981]/10 text-sm font-bold text-[#10b981]">
              ✓
            </div>

            <div>
              <p className="text-sm font-semibold text-[#065f46]">
                Analysis complete
              </p>
              <p className="mt-1 text-xs text-[#047857]">{success}</p>
            </div>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="ml-auto text-sm text-[#047857] hover:text-[#065f46]"
            >
              ×
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#635bff] to-[#8b5cf6] text-lg font-bold text-white shadow-lg">
                S
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#635bff]/20 border-t-[#635bff]" />
                <span className="text-sm font-medium text-[#6b7280]">
                  Loading your resume...
                </span>
              </div>
            </div>
          </div>
        ) : !resume ? (
          /* EMPTY STATE / UPLOAD */
          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative overflow-hidden rounded-3xl border bg-white p-8 shadow-sm transition md:p-12 ${
                dragActive
                  ? "border-[#635bff] bg-[#635bff]/[0.03] shadow-lg"
                  : "border-[#e5e7eb]"
              }`}
            >
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#635bff]/5 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[#8b5cf6]/5 blur-3xl" />

              <div className="relative flex min-h-[430px] flex-col items-center justify-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#635bff]/10 to-[#8b5cf6]/10 text-3xl text-[#635bff]">
                  ↑
                </div>

                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#635bff]">
                  AI Resume Analysis
                </p>

                <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#111827]">
                  Upload your resume
                </h2>

                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#6b7280]">
                  Drop your PDF resume here and SkillSync AI will analyze your
                  skills, experience, education, projects and overall resume
                  quality.
                </p>

                <label className="mt-8 cursor-pointer rounded-xl bg-[#635bff] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#635bff]/20 transition hover:bg-[#5046e5]">
                  {uploading ? "Analyzing..." : "Choose PDF Resume"}
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                </label>

                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <span className="rounded-full bg-[#f3f4f6] px-3 py-1 text-[11px] font-medium text-[#6b7280]">
                    PDF only
                  </span>
                  <span className="rounded-full bg-[#f3f4f6] px-3 py-1 text-[11px] font-medium text-[#6b7280]">
                    Max 5 MB
                  </span>
                  <span className="rounded-full bg-[#f3f4f6] px-3 py-1 text-[11px] font-medium text-[#6b7280]">
                    AI powered
                  </span>
                </div>

                {fileName && uploading && (
                  <div className="mt-6 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3">
                    <p className="text-xs font-medium text-[#374151]">
                      {fileName}
                    </p>
                    <p className="mt-1 text-[10px] text-[#9ca3af]">
                      AI is analyzing your resume...
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-[#e5e7eb] bg-[#111827] p-7 text-white shadow-sm">
              <div className="flex h-full flex-col">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#635bff] text-lg shadow-lg shadow-[#635bff]/20">
                  ✦
                </div>

                <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[#9b95ff]">
                  What you get
                </p>

                <h3 className="mt-2 text-xl font-bold">
                  Your resume, understood by AI.
                </h3>

                <div className="mt-7 space-y-4">
                  {[
                    ["01", "Resume Score", "Overall resume quality score."],
                    ["02", "Skill Analysis", "Identify your strongest skills."],
                    ["03", "ATS Insights", "Improve resume compatibility."],
                    ["04", "AI Suggestions", "Actionable improvement tips."],
                    ["05", "Career Profile", "Understand your professional profile."],
                  ].map(([number, title, description]) => (
                    <div key={number} className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[10px] font-bold text-[#a5a0ff]">
                        {number}
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-white">
                          {title}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-5 text-gray-400">
                          {description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-8">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-[11px] leading-5 text-gray-400">
                      SkillSync AI analyzes your resume using your existing
                      career profile and provides personalized recommendations
                      to improve your chances of getting shortlisted.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ANALYZED RESUME */
          <div className="space-y-6">
            {/* TOP SUMMARY */}
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              {/* SCORE */}
              <div className="relative overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white p-7 shadow-sm">
                <div className="absolute right-[-40px] top-[-40px] h-36 w-36 rounded-full bg-[#635bff]/5 blur-3xl" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#635bff]">
                        Resume Health
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-[#111827]">
                        Overall Resume Score
                      </h2>
                    </div>

                    <div className="rounded-full bg-[#10b981]/10 px-3 py-1 text-[10px] font-bold text-[#059669]">
                      AI ANALYZED
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-7">
                    <div className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full bg-[#f3f1ff]">
                      <div
                        className="absolute inset-2 rounded-full"
                        style={{
                          background: `conic-gradient(#635bff ${
                            score * 3.6
                          }deg, #e9e7ff ${score * 3.6}deg)`,
                        }}
                      />

                      <div className="absolute inset-[10px] flex items-center justify-center rounded-full bg-white">
                        <div className="text-center">
                          <p className="text-4xl font-bold text-[#111827]">
                            {score}
                          </p>
                          <p className="text-[10px] font-medium text-[#9ca3af]">
                            out of 100
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#111827]">
                        {score >= 80
                          ? "Strong resume"
                          : score >= 60
                            ? "Good foundation"
                            : "Needs improvement"}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-[#6b7280]">
                        {score >= 80
                          ? "Your resume has a strong structure and good career signals."
                          : score >= 60
                            ? "Your resume has a solid foundation, but there are areas that can be improved."
                            : "There are several areas where your resume can be significantly improved."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-7">
                    <div className="mb-2 flex justify-between">
                      <span className="text-[11px] font-medium text-[#6b7280]">
                        Resume quality
                      </span>
                      <span className="text-[11px] font-bold text-[#635bff]">
                        {score}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[#eef0f5]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#635bff] to-[#8b5cf6]"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RESUME FILE / OVERVIEW */}
              <div className="rounded-3xl border border-[#e5e7eb] bg-white p-7 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9ca3af]">
                      Resume Overview
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-[#111827]">
                      {resume.originalName ||
                        resume.fileName ||
                        "Uploaded Resume"}
                    </h2>

                    <p className="mt-1 text-xs text-[#9ca3af]">
                      Analyzed by SkillSync AI
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#635bff]/10 text-lg text-[#635bff]">
                    ▣
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <OverviewCard label="Skills" value={skills.length} />
                  <OverviewCard label="Experience" value={experience.length} />
                  <OverviewCard label="Projects" value={projects.length} />
                  <OverviewCard
                    label="Certifications"
                    value={certifications.length}
                  />
                </div>

                {resume.fileUrl && (
                  <a
                    href={resume.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 py-2.5 text-xs font-semibold text-[#374151] transition hover:bg-[#f9fafb]"
                  >
                    View uploaded resume
                    <span>↗</span>
                  </a>
                )}
              </div>
            </div>

            {/* SKILLS */}
            <section className="rounded-3xl border border-[#e5e7eb] bg-white p-7 shadow-sm">
              <SectionHeading
                eyebrow="Professional Skills"
                title="Skills detected by AI"
                description="Technologies and professional skills identified from your resume."
              />

              {skills.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-xl border border-[#ddd9ff] bg-[#f6f5ff] px-4 py-2.5 text-xs font-semibold text-[#5b52e8]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <EmptySection text="No skills were detected." />
              )}
            </section>

            {/* EXPERIENCE + EDUCATION */}
            <div className="grid gap-6 xl:grid-cols-2">
              <section className="rounded-3xl border border-[#e5e7eb] bg-white p-7 shadow-sm">
                <SectionHeading
                  eyebrow="Work History"
                  title="Experience"
                  description="Professional experience extracted from your resume."
                />

                <div className="mt-6 space-y-5">
                  {experience.length > 0 ? (
                    experience.map((item, index) => (
                      <div
                        key={index}
                        className="relative border-l-2 border-[#e5e7eb] pl-5"
                      >
                        <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-[#635bff] ring-4 ring-[#635bff]/10" />

                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-bold text-[#111827]">
                              {item.role || "Role"}
                            </h3>

                            <p className="mt-1 text-xs font-medium text-[#635bff]">
                              {item.company || "Company"}
                            </p>
                          </div>

                          {item.duration && (
                            <span className="rounded-full bg-[#f3f4f6] px-2.5 py-1 text-[10px] font-medium text-[#6b7280]">
                              {item.duration}
                            </span>
                          )}
                        </div>

                        {item.description && (
                          <p className="mt-3 text-xs leading-5 text-[#6b7280]">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <EmptySection text="No experience information detected." />
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-[#e5e7eb] bg-white p-7 shadow-sm">
                <SectionHeading
                  eyebrow="Academic Background"
                  title="Education"
                  description="Education details identified from your resume."
                />

                <div className="mt-6 space-y-4">
                  {education.length > 0 ? (
                    education.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] p-4"
                      >
                        <div className="flex gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8b5cf6]/10 text-sm text-[#8b5cf6]">
                            ◇
                          </div>

                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-[#111827]">
                              {item.degree || "Degree"}
                            </h3>

                            <p className="mt-1 text-xs text-[#6b7280]">
                              {item.institution || "Institution"}
                            </p>

                            {item.year && (
                              <p className="mt-2 text-[10px] font-semibold text-[#9ca3af]">
                                {item.year}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptySection text="No education information detected." />
                  )}
                </div>
              </section>
            </div>

            {/* PROJECTS */}
            <section className="rounded-3xl border border-[#e5e7eb] bg-white p-7 shadow-sm">
              <SectionHeading
                eyebrow="Portfolio Intelligence"
                title="Projects"
                description="Projects and technologies identified from your resume."
              />

              {projects.length > 0 ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {projects.map((project, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] p-5 transition hover:border-[#d8d3ff] hover:bg-[#fbfaff]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#635bff]/10 text-sm text-[#635bff]">
                          ◆
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-[#111827]">
                            {project.name || "Project"}
                          </h3>

                          {project.description && (
                            <p className="mt-2 text-xs leading-5 text-[#6b7280]">
                              {project.description}
                            </p>
                          )}

                          {project.technologies &&
                            project.technologies.length > 0 && (
                              <div className="mt-4 flex flex-wrap gap-1.5">
                                {project.technologies.map((technology, i) => (
                                  <span
                                    key={`${technology}-${i}`}
                                    className="rounded-lg bg-white px-2.5 py-1 text-[10px] font-semibold text-[#6b7280] shadow-sm ring-1 ring-[#e5e7eb]"
                                  >
                                    {technology}
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptySection text="No projects were detected." />
              )}
            </section>

            {/* CERTIFICATIONS */}
            <section className="rounded-3xl border border-[#e5e7eb] bg-white p-7 shadow-sm">
              <SectionHeading
                eyebrow="Credentials"
                title="Certifications"
                description="Professional certifications detected from your resume."
              />

              {certifications.length > 0 ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {certifications.map((certification, index) => (
                    <div
                      key={`${certification}-${index}`}
                      className="flex items-center gap-3 rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] p-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#10b981]/10 text-sm text-[#10b981]">
                        ✓
                      </div>

                      <p className="text-xs font-semibold leading-5 text-[#374151]">
                        {certification}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptySection text="No certifications were detected." />
              )}
            </section>

            {/* AI SUGGESTIONS */}
            <section className="overflow-hidden rounded-3xl border border-[#ddd9ff] bg-gradient-to-br from-[#f7f5ff] via-white to-[#faf8ff] p-7 shadow-sm">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#635bff] text-sm text-white shadow-md shadow-[#635bff]/20">
                      ✦
                    </div>

                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#635bff]">
                      SkillSync AI
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-bold text-[#111827]">
                    AI Improvement Suggestions
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-[#6b7280]">
                    Personalized recommendations generated from your resume
                    analysis.
                  </p>
                </div>

                <div className="rounded-xl bg-white px-4 py-2 text-center shadow-sm ring-1 ring-[#e5e7eb]">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Suggestions
                  </p>
                  <p className="mt-0.5 text-lg font-bold text-[#635bff]">
                    {suggestions.length}
                  </p>
                </div>
              </div>

              {suggestions.length > 0 ? (
                <div className="mt-7 grid gap-3">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex gap-4 rounded-2xl border border-[#e5e7eb] bg-white p-4"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#635bff]/10 text-xs font-bold text-[#635bff]">
                        {index + 1}
                      </div>

                      <p className="text-xs leading-6 text-[#4b5563]">
                        {suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-[#e5e7eb] bg-white p-5">
                  <p className="text-xs text-[#6b7280]">
                    No AI suggestions were returned for this analysis.
                  </p>
                </div>
              )}
            </section>

            {/* BOTTOM CTA */}
            <div className="flex flex-col justify-between gap-5 rounded-3xl bg-[#111827] p-7 text-white shadow-sm md:flex-row md:items-center">
              <div>
                <p className="text-sm font-bold">Ready for the next step?</p>
                <p className="mt-1 text-xs text-gray-400">
                  Use your optimized profile to discover better job matches.
                </p>
              </div>

              <a
                href="/jobs"
                className="inline-flex items-center justify-center rounded-xl bg-[#635bff] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#5046e5]"
              >
                Find Matching Jobs
                <span className="ml-2">→</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function OverviewCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] p-4">
      <p className="text-[10px] font-medium text-[#9ca3af]">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#111827]">{value}</p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9ca3af]">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-lg font-bold text-[#111827]">{title}</h2>

      <p className="mt-1 text-xs leading-5 text-[#6b7280]">{description}</p>
    </div>
  );
}

function EmptySection({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d1d5db] bg-[#f9fafb] p-6 text-center">
      <p className="text-xs text-[#9ca3af]">{text}</p>
    </div>
  );
}