import { UserCircle2, HeartHandshake, BellRing } from "lucide-react";

const steps = [
  {
    n: "1",
    icon: UserCircle2,
    title: "Create your profile",
    desc: "Sign up with your number and tell us a bit about you.",
  },
  {
    n: "2",
    icon: HeartHandshake,
    title: "Add your crushes",
    desc: "Add up to 3 crushes. We keep it secret.",
  },
  {
    n: "3",
    icon: BellRing,
    title: "Get notified if it's mutual",
    desc: "We'll only notify you when the feeling is mutual.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      className="relative py-24 md:py-32"
      style={{ background: "var(--gradient-soft)" }}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            How it works
          </p>
          <h2 className="font-serif text-4xl leading-tight tracking-tight md:text-5xl">
            It's simple, private and safe.
          </h2>
        </div>

        <div className="relative mt-16 grid gap-8 md:grid-cols-3">
          <div className="pointer-events-none absolute left-0 right-0 top-24 hidden md:block">
            <div className="mx-auto h-px w-2/3 border-t-2 border-dashed border-primary/30" />
          </div>

          {steps.map((s) => (
            <div
              key={s.n}
              className="relative rounded-3xl border border-border/60 bg-card/80 p-8 text-center backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
            >
              <div className="relative mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-[var(--gradient-soft)] shadow-[var(--shadow-card)]">
                <s.icon className="h-9 w-9 text-primary" />
                <span className="absolute -top-2 -right-2 grid h-7 w-7 place-items-center rounded-full bg-[var(--gradient-primary)] text-xs font-semibold text-primary-foreground shadow-[var(--shadow-soft)]">
                  {s.n}
                </span>
              </div>
              <h3 className="font-serif text-xl font-medium text-foreground">{s.title}</h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}