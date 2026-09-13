"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../../lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fc]">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#635bff] to-[#8b5cf6] text-lg font-bold text-white shadow-lg">
            S
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#635bff]/20 border-t-[#635bff]" />

            <span className="text-xs font-medium text-[#6b7280]">
              Loading SkillSync AI...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}