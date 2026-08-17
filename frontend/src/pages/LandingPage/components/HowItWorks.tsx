export default function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-4 pb-16 pt-2">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-offwhite">How it works</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
            A lightweight onboarding flow your startups can actually maintain.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            n: '01',
            title: 'Choose your role & stage',
            desc: 'Employees select their department and onboarding phase so answers are accurate.'
          },
          {
            n: '02',
            title: 'Chat instantly with Virtual HR',
            desc: 'Ask questions about leave, documents, IT setup, and first-day steps.'
          },
          {
            n: '03',
            title: 'Track progress & reduce HR load',
            desc: 'Employees get checklists; admins see analytics and update FAQs without code.'
          }
        ].map((s) => (
          <div key={s.n} className="relative rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="absolute -top-3 left-6 rounded-2xl bg-amber2/15 px-3 py-1 text-xs font-bold text-amber2 ring-1 ring-amber2/20">
              {s.n}
            </div>
            <div className="pt-3 text-lg font-semibold text-offwhite">{s.title}</div>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

