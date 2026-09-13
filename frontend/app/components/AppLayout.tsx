"use client";

import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AuthGuard from "./AuthGuard";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#f7f8fc]">
        <Sidebar />

        <div className="min-h-screen pl-[260px]">
          <Topbar />

          <main className="min-h-[calc(100vh-78px)] p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}