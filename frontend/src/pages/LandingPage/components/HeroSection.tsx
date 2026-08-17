import { SparklesIcon } from '@heroicons/react/24/outline'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-amber2/20 blur-3xl" />
        <div className="absolute -bottom-24 right-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
        <div className="flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
            <SparklesIcon className="h-4 w-4 text-amber2" />
            Role-based onboarding support for startups
          </div>

          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-offwhite sm:text-5xl">
            Reckon Group of Company onboarding that answers instantly—
            <span className="text-amber2"> for every role</span>.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">

            Reduce repetitive HR questions, guide employees through Day 1 → Week 1 → Month 1,
            and give your team more time for real work.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-2xl bg-amber2 px-6 py-3 text-ink font-semibold shadow-soft hover:opacity-95 transition"
            >
              Book a live product demo
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-offwhite font-semibold hover:bg-white/10 transition"
            >
              See features
            </a>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { k: 'Instant answers', v: '24/7' },
              { k: 'Role-based checklists', v: 'Day 1 → Month 1' },
              { k: 'Admin analytics', v: 'Reduced query load' }
            ].map((x) => (
              <div key={x.k} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold text-offwhite">{x.k}</div>
                <div className="mt-1 text-xs text-white/60">{x.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-offwhite">Example onboarding chat</div>
              <div className="text-xs text-white/60">Demo mode</div>
            </div>

            <div className="mt-4 space-y-3 rounded-2xl bg-ink/50 p-4 ring-1 ring-white/5">
              <div className="flex items-start justify-end gap-2">
                <div className="max-w-[80%] rounded-2xl bg-amber2/90 px-4 py-2 text-ink">
                  Where do I find the IT setup checklist for week 1?
                </div>
                <div className="mt-1 h-8 w-8 rounded-full bg-white/10 ring-1 ring-white/10" />
              </div>

              <div className="flex items-start gap-2">
                <div className="h-8 w-8 rounded-full bg-white/10 ring-1 ring-white/10" />
                <div className="max-w-[80%] rounded-2xl bg-white/5 px-4 py-2">
                  <div className="text-xs font-semibold text-amber2">Reckon</div>

                  <div className="mt-1 text-sm text-offwhite/90">
                    For Week 1 (Engineering):
                    <ul className="mt-1 list-disc pl-5 text-sm text-offwhite/80">
                      <li>Confirm laptop/login credentials</li>
                      <li>Install required tools (repo, IDE, VPN)</li>
                      <li>Access HR portal + mandatory trainings</li>
                    </ul>
                    Want me to generate a personalized task list?
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {['Leave policy', 'Documents needed', 'First-day checklist', 'IT setup'].map((c) => (
                  <button
                    key={c}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 hover:bg-white/10 transition"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/5 p-3">
              <div className="h-10 w-10 rounded-2xl bg-amber2/20" />
              <div className="flex-1">
                <div className="h-3 w-2/3 rounded bg-white/10" />
                <div className="mt-2 h-3 w-1/2 rounded bg-white/10" />
              </div>
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

