export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-4xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#635bff] to-[#8b5cf6] text-2xl font-bold text-white shadow-lg">
            S
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#635bff]">
            AI Career Platform
          </p>

          <h1 className="text-5xl font-bold tracking-tight text-[#111827] sm:text-6xl">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-[#635bff] to-[#8b5cf6] bg-clip-text text-transparent">
              SkillSync AI
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#6b7280]">
            Your AI-powered career companion for resume optimization,
            personalized job matching, interview preparation, projects and
            career roadmaps.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button className="rounded-xl bg-[#635bff] px-7 py-3.5 font-semibold text-white shadow-lg shadow-[#635bff]/20 transition hover:bg-[#5046e5]">
              Get Started
            </button>

            <button className="rounded-xl border border-[#e5e7eb] bg-white px-7 py-3.5 font-semibold text-[#374151] shadow-sm transition hover:bg-gray-50">
              Explore Platform
            </button>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Resume AI",
                description: "Analyze and improve your resume.",
              },
              {
                title: "Job Matching",
                description: "Find opportunities matching your skills.",
              },
              {
                title: "AI Interview",
                description: "Practice realistic interviews.",
              },
              {
                title: "Career Roadmap",
                description: "Build a personalized career path.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-[#e5e7eb] bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 h-10 w-10 rounded-xl bg-[#635bff]/10" />

                <h2 className="font-semibold text-[#111827]">
                  {feature.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}