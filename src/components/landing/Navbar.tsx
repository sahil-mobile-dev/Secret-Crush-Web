import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", hash: "home", label: "Home" },
  { to: "/", hash: "how", label: "How It Works" },
  { to: "/", hash: "privacy", label: "Privacy" },
  { to: "/", hash: "faq", label: "FAQ" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl bg-background/70 border-b border-border/60"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <Link to="/" hash="home" className="flex items-center gap-2">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-soft)]">
            <Heart className="h-4 w-4 fill-primary-foreground text-primary-foreground" />
          </span>
          <span className="font-serif text-xl font-medium tracking-tight">Secret Crush</span>
        </Link>

        <ul className="hidden items-center gap-10 md:flex">
          {links.map((l) => (
            <li key={l.label}>
              <Link
                to={l.to}
                hash={l.hash}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <Button asChild variant="crush" size="pill">
          <Link to="/" hash="waitlist">Join Waitlist</Link>
        </Button>
      </nav>
    </header>
  );
}