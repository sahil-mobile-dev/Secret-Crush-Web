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
                  <svg viewBox="0 0 170 170" className="h-7 w-7 fill-foreground text-foreground">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.13-1.92-14.39-6.15-3.41-2.73-7.38-7.5-11.91-14.31-9.92-14.88-14.88-29.88-14.88-44.99 0-16.19 4.74-29.61 14.24-40.24 9.5-10.63 20.91-15.99 34.22-16.09 6.23 0 13.06 1.84 20.49 5.53 7.43 3.69 11.96 5.53 13.59 5.53 1.28 0 5.66-1.74 13.12-5.23 7.47-3.49 13.91-5.11 19.34-4.87 15.34 1.15 27.23 6.94 35.65 17.38-12.75 7.72-19.05 18.23-18.9 31.52.15 10.37 3.96 19.07 11.43 26.11 7.47 7.04 16.27 10.96 26.4 11.75-2.22 6.43-5.06 12.39-8.52 17.89zM119.22 9.87c0 8.27-2.93 15.65-8.8 21.36-5.88 5.71-12.78 8.87-20.7 9.48.15-7.91 3.22-15.19 9.21-21.2C104.91 13.5 111.9 10.36 119.22 9.87z" />
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