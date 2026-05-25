import { Apple, Play, PlayCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroPhones from "@/assets/hero-phones.png";

export function Hero() {
  return (
    <section
      id="home"
      className="relative isolate overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32"
      style={{ background: "var(--gradient-hero)" }}
    >
      {/* Decorative blurred blobs */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute top-40 right-10 h-[28rem] w-[28rem] rounded-full bg-[oklch(0.88_0.09_25)]/40 blur-3xl" aria-hidden />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-2 md:px-10">
        {/* Left */}
        <div className="animate-fade-up">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Some feelings deserve privacy
          </p>
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-foreground md:text-7xl">
            Your Crush.<br />
            Still a <span className="italic text-primary">Secret.</span>
          </h1>
          <p className="mt-7 max-w-md text-lg leading-relaxed text-muted-foreground">
            Add your crushes secretly.<br />
            We'll only tell you if it's mutual.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild variant="crush" size="pillLg">
              <a href="#waitlist">
                Join Waitlist <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="softOutline" size="pillLg">
              <a href="#how">
                <PlayCircle className="mr-1 h-5 w-5 text-primary" /> Watch Teaser
              </a>
            </Button>
          </div>

          <div className="mt-10">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Coming soon on
            </p>
            <div className="flex flex-wrap gap-3">
              <StoreBadge
                icon={<Apple className="h-7 w-7 fill-foreground text-foreground" />}
                small="Download on the"
                large="App Store"
              />
              <StoreBadge
                icon={<Play className="h-6 w-6 fill-primary text-primary" />}
                small="GET IT ON"
                large="Google Play"
              />
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="relative animate-fade-up [animation-delay:200ms]">
          <div className="pointer-events-none absolute inset-0 -z-10 mx-auto h-[80%] w-[80%] translate-y-10 rounded-full bg-[var(--gradient-primary)] opacity-30 blur-3xl" />
          <img
            src={heroPhones}
            alt="Secret Crush app shown on two iPhones — match screen and add-your-crush form"
            width={1280}
            height={1280}
            className="relative mx-auto w-full max-w-xl animate-float drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}

function StoreBadge({
  icon,
  small,
  large,
}: {
  icon: React.ReactNode;
  small: string;
  large: string;
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-3 rounded-2xl border border-border bg-card/70 px-5 py-3 backdrop-blur transition-all hover:shadow-[var(--shadow-card)]"
    >
      {icon}
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{small}</span>
        <span className="text-sm font-semibold text-foreground">{large}</span>
      </span>
    </button>
  );
}