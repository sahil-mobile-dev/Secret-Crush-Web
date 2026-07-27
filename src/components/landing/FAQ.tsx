import { useState } from "react";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "Will my crush ever know I added them?",
    a: "Never. Your additions stay completely private and are only revealed if the feeling is mutual.",
  },
  {
    q: "How do you protect my privacy?",
    a: "We encrypt your data, never show screenshots, and never share who added whom unless there's a match.",
  },
  {
    q: "How many crushes can I add?",
    a: "You can add up to 3 crushes at a time. Quality over quantity.",
  },
  {
    q: "When is Secret Crush launching?",
    a: "We're launching soon. Join the waitlist to be one of the first to know.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6 md:px-10">
        <div className="text-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Frequently asked
          </p>
          <h2 className="font-serif text-4xl leading-tight tracking-tight md:text-5xl">
            Soft answers to your <span className="italic text-primary">quiet</span> questions.
          </h2>
        </div>

        <div className="mt-14 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur transition-all"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-medium text-foreground">{f.q}</span>
                  <Plus
                    className={`h-5 w-5 shrink-0 text-primary transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-500 ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
