import { Heart, Instagram, Twitter } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="relative border-t border-border/60 bg-card/40 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 py-10 md:flex-row md:px-10">
        <Link to="/" hash="home" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-soft)]">
            <Heart className="h-4 w-4 fill-primary-foreground text-primary-foreground" />
          </span>
          <span className="font-serif text-xl font-medium tracking-tight">Secret Crush</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
          <Link to="/privacy-policy" className="transition-colors hover:text-primary">Privacy Policy</Link>
          <Link to="/terms-of-use" className="transition-colors hover:text-primary">Terms of Use</Link>
          <Link to="/" hash="faq" className="transition-colors hover:text-primary">FAQ</Link>
          <Link to="/" hash="waitlist" className="transition-colors hover:text-primary">Contact</Link>
        </nav>

        <div className="flex items-center gap-3">
          <SocialIcon><Instagram className="h-4 w-4" /></SocialIcon>
          <SocialIcon><Twitter className="h-4 w-4" /></SocialIcon>
          <SocialIcon>
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.42a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.21z" />
            </svg>
          </SocialIcon>
        </div>
      </div>
      <div className="border-t border-border/40 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Secret Crush. All rights reserved.
      </div>
    </footer>
  );
}

function SocialIcon({ children }: { children: React.ReactNode }) {
  return (
    <a
      href="#"
      className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-background/60 text-muted-foreground transition-all hover:border-primary/40 hover:text-primary"
    >
      {children}
    </a>
  );
}