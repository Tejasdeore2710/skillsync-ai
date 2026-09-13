"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mainNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "⌂",
  },
  {
    name: "Resume Analyzer",
    href: "/resume",
    icon: "▣",
  },
  {
    name: "Job Matching",
    href: "/jobs",
    icon: "⌕",
  },
  {
    name: "AI Interview",
    href: "/interview",
    icon: "◉",
  },
  {
    name: "AI Projects",
    href: "/projects",
    icon: "◆",
  },
  {
    name: "Career Roadmap",
    href: "/roadmap",
    icon: "↗",
  },
];

const secondaryNavigation = [
  {
    name: "Profile",
    href: "/profile",
    icon: "◎",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: "⚙",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col overflow-hidden bg-[#111827] text-white">
      {/* Logo */}
      <div className="flex h-[78px] shrink-0 items-center border-b border-white/10 px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#635bff] to-[#8b5cf6] text-lg font-bold shadow-lg shadow-[#635bff]/20">
            S
          </div>

          <div>
            <h1 className="text-[17px] font-bold tracking-tight">
              SkillSync
              <span className="text-[#8b7cff]"> AI</span>
            </h1>

            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500">
              Career Intelligence
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
          Workspace
        </p>

        <nav className="space-y-1">
          {mainNavigation.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-[#635bff] text-white shadow-lg shadow-[#635bff]/20"
                    : "text-gray-400 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base ${
                    active
                      ? "bg-white/15 text-white"
                      : "bg-white/[0.04] text-gray-400 group-hover:text-white"
                  }`}
                >
                  {item.icon}
                </span>

                <span>{item.name}</span>

                {item.name === "Resume Analyzer" && (
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                      active
                        ? "bg-white/15 text-white"
                        : "bg-[#635bff]/15 text-[#9b95ff]"
                    }`}
                  >
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* AI Assistant */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-gradient-to-br from-[#635bff]/20 to-[#8b5cf6]/10 p-4">
          <div className="mb-2.5 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#635bff] text-sm">
              ✦
            </div>

            <div>
              <p className="text-xs font-semibold text-white">
                SkillSync AI
              </p>

              <p className="text-[10px] text-gray-400">
                Your career copilot
              </p>
            </div>
          </div>

          <p className="text-[11px] leading-5 text-gray-400">
            Analyze your skills, improve your resume and build your career
            faster.
          </p>
        </div>

        {/* Account */}
        <div className="mt-5">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
            Account
          </p>

          <nav className="space-y-1">
            {secondaryNavigation.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-white/[0.08] text-white"
                      : "text-gray-400 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-sm">
                    {item.icon}
                  </span>

                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#635bff] to-[#8b5cf6] text-sm font-bold">
            T
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              Tejas
            </p>

            <p className="truncate text-[10px] text-gray-500">
              Career Explorer
            </p>
          </div>

          <button
            type="button"
            title="Logout"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/[0.08] hover:text-white"
          >
            ↪
          </button>
        </div>
      </div>
    </aside>
  );
}