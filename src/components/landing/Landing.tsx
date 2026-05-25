import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Privacy } from "./Privacy";
import { HowItWorks } from "./HowItWorks";
import { Waitlist } from "./Waitlist";
import { FAQ } from "./FAQ";
import { Footer } from "./Footer";
import { FloatingHearts } from "./FloatingHearts";

export function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <FloatingHearts />
      <Navbar />
      <main>
        <Hero />
        <Privacy />
        <HowItWorks />
        <Waitlist />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}