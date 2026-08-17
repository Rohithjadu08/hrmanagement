export default function FeatureGrid() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-14">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-offwhite">Everything your HR team needs</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
            Designed for startups: lightweight, fast, and easy to maintain. The UI looks enterprise-grade,
            but the system stays simple for your team.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            title: 'Virtual HR Chatbot',
            desc: 'Real-time onboarding answers with typing indicator, timestamps, and quick-reply chips.'
          },
          {
            title: 'Role-based personalization',
            desc: 'Tailored guidance using employee role + onboarding stage (Day 1 / Week 1 / Month 1).' 
          },
          {
            title: 'Knowledge base updates',
            desc: 'HR can add/edit FAQs without code changes (scaffolded for admin UI).' 
          },
          {
            title: 'Employee checklist & progress',
            desc: 'Personalized tasks with progress tracking so employees always know what’s next.' 
          },
          {
            title: 'Dashboard analytics',
            desc: 'See reduced query load, common questions, and onboarding progress per employee.' 
          },
          {
            title: 'Modular AI service',
            desc: 'Swap AI providers/models later. API contract stays the same.' 
          }
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft transition hover:bg-white/7"
          >
            <div className="text-lg font-semibold text-offwhite">{f.title}</div>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

