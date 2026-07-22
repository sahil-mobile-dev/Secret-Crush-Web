import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, ShieldCheck, Heart, MapPin, Phone, Mail } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingHearts } from "@/components/landing/FloatingHearts";

export const Route = createFileRoute("/about-us")({
  head: () => ({
    meta: [
      { title: "About Us — Secret Crush by ARCTURYN PRIVATE LIMITED" },
      { name: "description", content: "Learn about the Secret Crush by ARCTURYN PRIVATE LIMITED, the technology company behind Secret Crush based in Ahmedabad, India." },
      { property: "og:title", content: "About Us — Secret Crush by ARCTURYN PRIVATE LIMITED" },
      { property: "og:description", content: "Learn about Secret Crush by ARCTURYN PRIVATE LIMITED, the technology company behind Secret Crush based in Ahmedabad, India." },
      { property: "og:url", content: "https://mysecretcrush.in/about-us" },
    ],
    links: [
      { rel: "canonical", href: "https://mysecretcrush.in/about-us" },
    ],
  }),
  component: AboutUsPage,
});

function AboutUsPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <FloatingHearts />
      <Navbar />
      <main className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-6">
        {/* Decorative background gradients */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute top-40 right-10 h-[28rem] w-[28rem] rounded-full bg-[oklch(0.88_0.09_25)]/20 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-4xl">
          {/* Back link */}
          <div className="mb-8 animate-fade-up">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </Link>
          </div>

          <div className="animate-fade-up [animation-delay:100ms] rounded-3xl border border-border/60 bg-card/70 p-8 md:p-12 backdrop-blur shadow-[var(--shadow-card)] space-y-10">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-4">
                <Building2 className="h-3.5 w-3.5" /> Legal Entity & Company Overview
              </span>
              <h1 className="font-serif text-4xl leading-tight tracking-tight md:text-5xl text-foreground mb-4">
                About ARCTURYN PRIVATE LIMITED
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground">
                <strong className="text-foreground">ARCTURYN PRIVATE LIMITED</strong> is a technology company based in Ahmedabad, Gujarat, India. Our flagship digital platform, <strong className="font-semibold text-primary">Secret Crush</strong>, is designed to bring privacy, confidentiality, and authentic connections to digital social interactions.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 pt-2">
              <div className="rounded-2xl border border-border/50 bg-background/50 p-6 space-y-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Heart className="h-5 w-5 fill-primary/20 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-medium text-foreground">Our Flagship Brand</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Secret Crush</strong> is a proprietary social connection platform that allows users to express interest in friends or acquaintances secretly. Connections are only revealed when interest is mutual (double-opt-in), maintaining zero rejection anxiety.
                </p>
              </div>

              <div className="rounded-2xl border border-border/50 bg-background/50 p-6 space-y-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-medium text-foreground">Corporate Governance & Compliance</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Operating with absolute transparency and regulatory compliance, ARCTURYN PRIVATE LIMITED strictly adheres to data protection standards, user privacy guidelines, and Indian corporate law.
                </p>
              </div>
            </div>

            <div className="border-t border-border/40 pt-8 space-y-6">
              <h2 className="font-serif text-2xl text-foreground">Corporate Verification Information</h2>
              <p className="text-sm text-muted-foreground">
                For partners, regulatory bodies, and verification teams (including Meta Business Verification), here is our official business identification:
              </p>

              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div className="rounded-xl border border-border/40 bg-card/40 p-4 flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Legal Entity Name</div>
                    <div className="font-semibold text-foreground mt-0.5">ARCTURYN PRIVATE LIMITED</div>
                  </div>
                </div>

                <div className="rounded-xl border border-border/40 bg-card/40 p-4 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Business Type</div>
                    <div className="font-semibold text-foreground mt-0.5">Private Limited Company</div>
                  </div>
                </div>

                <div className="rounded-xl border border-border/40 bg-card/40 p-4 flex items-start gap-3 sm:col-span-2">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Registered Office Address</div>
                    <div className="font-semibold text-foreground mt-0.5">
                      411, 4th Floor, SHREEYA AMALGA, Thaltej Road, Ahmedabad, Gujarat, India 380054
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border/40 bg-card/40 p-4 flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Phone Contact</div>
                    <div className="font-semibold text-foreground mt-0.5">+91 9978333880</div>
                  </div>
                </div>

                <div className="rounded-xl border border-border/40 bg-card/40 p-4 flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Official Email</div>
                    <div className="font-semibold text-foreground mt-0.5">info@mysecretcrush.in</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
