import { Lock, Heart, EyeOff, Smile } from "lucide-react";

const items = [
  {
    icon: Lock,
    title: "Your crush stays hidden forever.",
    desc: "They'll never know you added them.",
  },
  {
    icon: Heart,
    title: "We only reveal mutual matches.",
    desc: "If they added you too, it's a match.",
  },
  {
    icon: EyeOff,
    title: "No screenshots. No exposure.",
    desc: "Your privacy is our promise.",
  },
  {
    icon: Smile,
    title: "No awkwardness.",
    desc: "Just meaningful connections.",
  },
];

export function Privacy() {
  return (
    <section id="privacy" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            We keep it private
          </p>
          <h2 className="font-serif text-4xl leading-tight tracking-tight md:text-5xl">
            Some feelings are better left secret…<br />
            unless they're <span className="italic text-primary">mutual.</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div
              key={it.title}
              className="group relative rounded-3xl border border-border/60 bg-card/70 p-7 backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
            >
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--gradient-soft)] text-primary">
                <it.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-base font-semibold leading-snug text-foreground">
                {it.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}