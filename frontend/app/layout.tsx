import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillSync AI",
  description:
    "AI-powered career development platform for resumes, jobs, interviews, projects and career roadmaps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}