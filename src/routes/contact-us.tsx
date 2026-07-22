import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Phone, Mail, Building2, Instagram } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingHearts } from "@/components/landing/FloatingHearts";

export const Route = createFileRoute("/contact-us")({
  head: () => ({
    meta: [
      { title: "Contact Us — Secret Crush by ARCTURYN PRIVATE LIMITED" },
      { name: "description", content: "Contact ARCTURYN PRIVATE LIMITED in Ahmedabad, India for Secret Crush support, corporate inquiries, and official support." },
      { property: "og:title", content: "Contact Us — Secret Crush by ARCTURYN PRIVATE LIMITED" },
      { property: "og:description", content: "Contact ARCTURYN PRIVATE LIMITED in Ahmedabad, India for Secret Crush support and inquiries." },
      { property: "og:url", content: "https://mysecretcrush.in/contact-us" },
    ],
    links: [
      { rel: "canonical", href: "https://mysecretcrush.in/contact-us" },
    ],
  }),
  component: ContactUsPage,
});

function ContactUsPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <FloatingHearts />
      <Navbar />
      <main className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-6">
        {/* Decorative blurred background */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute top-40 right-10 h-[28rem] w-[28rem] rounded-full bg-[oklch(0.88_0.09_25)]/20 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-4xl">
          {/* Back button */}
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
                <Mail className="h-3.5 w-3.5" /> Get in Touch
              </span>
              <h1 className="font-serif text-4xl leading-tight tracking-tight md:text-5xl text-foreground mb-3">
                Contact Us
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed">
                Have questions about Secret Crush, business partnerships, or compliance inquiries? Feel free to reach out to our legal operating entity <strong className="text-foreground">ARCTURYN PRIVATE LIMITED</strong>.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-background/60 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-foreground">Legal Entity</h3>
                    <p className="text-xs text-muted-foreground">Operating Company</p>
                  </div>
                </div>
                <div className="text-sm font-semibold text-foreground">
                  ARCTURYN PRIVATE LIMITED
                </div>
                <p className="text-xs text-muted-foreground">
                  Registered in Ahmedabad, Gujarat, India
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/60 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-foreground">Phone Support</h3>
                    <p className="text-xs text-muted-foreground">Mon–Fri 10:00 AM – 6:00 PM IST</p>
                  </div>
                </div>
                <div className="text-sm font-semibold text-foreground">
                  <a href="tel:+919978333880" className="hover:text-primary transition-colors">
                    +91 9978333880
                  </a>
                </div>
                <p className="text-xs text-muted-foreground">
                  Official registered contact number
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/60 p-6 space-y-4 md:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-foreground">Registered Office Address</h3>
                    <p className="text-xs text-muted-foreground">Official Headquarters</p>
                  </div>
                </div>
                <div className="text-sm leading-relaxed text-foreground font-medium">
                  ARCTURYN PRIVATE LIMITED<br />
                  411, 4th Floor, SHREEYA AMALGA, Thaltej Road,<br />
                  Ahmedabad, Gujarat, India 380054
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/60 p-6 space-y-4 md:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-foreground">Email Communications</h3>
                    <p className="text-xs text-muted-foreground">For support & legal compliance</p>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground">General Support: </span>
                    <a href="mailto:info@mysecretcrush.in" className="text-primary font-medium hover:underline">
                      info@mysecretcrush.in
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/60 p-6 space-y-4 md:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Instagram className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-foreground">Official Instagram Page</h3>
                    <p className="text-xs text-muted-foreground">Connect with us on social media</p>
                  </div>
                </div>
                <div className="text-sm">
                  <a
                    href="https://www.instagram.com/mysecretcrush.official/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-medium hover:underline flex items-center gap-1.5"
                  >
                    @mysecretcrush.official ↗
                  </a>
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
