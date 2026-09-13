"use client";

import { useState } from "react";

export default function Topbar() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-[78px] items-center justify-between border-b border-[#e5e7eb] bg-white/95 px-6 backdrop-blur-xl lg:px-8">
      {/* Left Section */}
      <div>
        <p className="text-xs font-medium text-[#9ca3af]">
          AI Career Platform
        </p>

        <h2 className="mt-0.5 text-lg font-bold tracking-tight text-[#111827]">
          Welcome back, Tejas 👋
        </h2>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden items-center rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 md:flex md:w-[220px] lg:w-[260px]">
          <span className="mr-2 text-sm text-[#9ca3af]">⌕</span>

          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#9ca3af]"
          />

          <span className="ml-2 rounded-md border border-[#e5e7eb] bg-white px-1.5 py-0.5 text-[9px] font-medium text-[#9ca3af]">
            /
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e7eb] bg-white text-[#6b7280] transition hover:bg-[#f9fafb] hover:text-[#111827]"
            aria-label="Notifications"
          >
            <span className="text-lg">♢</span>

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#635bff] ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-[320px] overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-xl shadow-black/10">
              <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
                <h3 className="text-sm font-semibold text-[#111827]">
                  Notifications
                </h3>

                <span className="rounded-full bg-[#635bff]/10 px-2 py-1 text-[10px] font-semibold text-[#635bff]">
                  2 New
                </span>
              </div>

              <div className="divide-y divide-[#f3f4f6]">
                <div className="flex gap-3 p-4 transition hover:bg-[#f9fafb]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#10b981]/10 text-sm text-[#10b981]">
                    ✓
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#111827]">
                      Resume analysis completed
                    </p>

                    <p className="mt-1 text-[11px] leading-4 text-[#6b7280]">
                      Your resume has been analyzed by SkillSync AI.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-4 transition hover:bg-[#f9fafb]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#635bff]/10 text-sm text-[#635bff]">
                    ✦
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#111827]">
                      New job matches available
                    </p>

                    <p className="mt-1 text-[11px] leading-4 text-[#6b7280]">
                      SkillSync found opportunities matching your profile.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full border-t border-[#e5e7eb] px-4 py-3 text-xs font-semibold text-[#635bff] transition hover:bg-[#f9fafb]"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hidden h-8 w-px bg-[#e5e7eb] sm:block" />

        {/* User Profile */}
        <button
          type="button"
          className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-[#f9fafb]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#635bff] to-[#8b5cf6] text-sm font-bold text-white shadow-sm">
            T
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-[#111827]">Tejas</p>

            <p className="text-[10px] text-[#9ca3af]">
              Career Explorer
            </p>
          </div>

          <span className="hidden text-xs text-[#9ca3af] sm:block">
            ▾
          </span>
        </button>
      </div>
    </header>
  );
}