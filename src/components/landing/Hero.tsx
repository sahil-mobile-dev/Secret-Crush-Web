import { PlayCircle, ArrowRight } from "lucide-react";
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
                icon={
                  <svg viewBox="0 0 16 16" className="h-7 w-7 fill-foreground text-foreground">
                    <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282" />
                  </svg>
                }
                small="Download on the"
                large="App Store"
              />
              <StoreBadge
                icon={
                  <svg viewBox="0 0 466 511.98" className="h-6 w-6">
                    <g fillRule="nonzero">
                      <path fill="#EA4335" d="M199.9 237.8 1.4 470.17c7.22 24.57 30.16 41.81 55.8 41.81 11.16 0 20.93-2.79 29.3-8.37l244.16-139.46L199.9 237.8z"/>
                      <path fill="#FBBC04" d="m433.91 205.1-104.65-60-111.61 110.22 113.01 108.83 104.64-58.6c18.14-9.77 30.7-29.3 30.7-50.23-1.4-20.93-13.95-40.46-32.09-50.22z"/>
                      <path fill="#34A853" d="M199.42 273.45 329.27 145.1 87.9 8.37C79.53 2.79 68.36 0 57.2 0 30.7 0 6.98 18.14 1.4 41.86l198.02 231.59z"/>
                      <path fill="#4285F4" d="M1.39 41.86C0 46.04 0 51.63 0 57.2v397.64c0 5.57 0 9.76 1.4 15.34l216.27-214.86L1.39 41.86z"/>
                    </g>
                  </svg>
                }
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