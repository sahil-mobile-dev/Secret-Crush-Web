import { Heart, Instagram } from "lucide-react";
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
          <Link to="/about-us" className="transition-colors hover:text-primary">About Us</Link>
          <Link to="/contact-us" className="transition-colors hover:text-primary">Contact Us</Link>
          <Link to="/privacy-policy" className="transition-colors hover:text-primary">Privacy Policy</Link>
          <Link to="/terms-of-use" className="transition-colors hover:text-primary">Terms of Use</Link>
          <Link to="/" hash="faq" className="transition-colors hover:text-primary">FAQ</Link>
        </nav>

        <div className="flex items-center gap-3">
          <SocialIcon href="https://www.instagram.com/mysecretcrush.official/" ariaLabel="Instagram">
            <Instagram className="h-4 w-4" />
          </SocialIcon>
        </div>
      </div>
      <div className="border-t border-border/40 py-6 px-6 text-center text-xs text-muted-foreground space-y-1.5">
        <p className="font-medium text-foreground/90">
          Secret Crush is a brand owned and operated by <span className="font-semibold text-primary">ARCTURYN PRIVATE LIMITED</span>.
        </p>
        <p className="text-muted-foreground/80">
          Registered Address: 411, 4th Floor, SHREEYA AMALGA, Thaltej Road, Ahmedabad, Gujarat, India 380054
        </p>
        <p className="pt-1 text-muted-foreground/60">
          © {new Date().getFullYear()} ARCTURYN PRIVATE LIMITED. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function SocialIcon({ children, href = "#", ariaLabel }: { children: React.ReactNode; href?: string; ariaLabel?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-background/60 text-muted-foreground transition-all hover:border-primary/40 hover:text-primary"
    >
      {children}
    </a>
  );
}