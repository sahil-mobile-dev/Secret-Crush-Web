import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingHearts } from "@/components/landing/FloatingHearts";

export const Route = createFileRoute("/terms-of-use")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Secret Crush by ARCTURYN PRIVATE LIMITED" },
      { name: "description", content: "Terms of Use and Service Agreement for Secret Crush, owned and operated by ARCTURYN PRIVATE LIMITED." },
      { property: "og:title", content: "Terms of Use — Secret Crush by ARCTURYN PRIVATE LIMITED" },
      { property: "og:description", content: "Terms of Use and Service Agreement for Secret Crush, owned and operated by ARCTURYN PRIVATE LIMITED." },
      { property: "og:url", content: "https://mysecretcrush.in/terms-of-use" },
    ],
    links: [
      { rel: "canonical", href: "https://mysecretcrush.in/terms-of-use" },
    ],
  }),
  component: TermsOfUsePage,
});

function TermsOfUsePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <FloatingHearts />
      <Navbar />
      <main className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-6">
        {/* Decorative blurred blobs */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute top-40 right-10 h-[28rem] w-[28rem] rounded-full bg-[oklch(0.88_0.09_25)]/20 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-3xl">
          {/* Back button */}
          <div className="mb-8 animate-fade-up">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </Link>
          </div>

          <div className="animate-fade-up [animation-delay:100ms] rounded-3xl border border-border/60 bg-card/70 p-8 md:p-12 backdrop-blur shadow-[var(--shadow-card)]">
            <h1 className="font-serif text-4xl leading-tight tracking-tight md:text-5xl text-foreground mb-2">
              Terms of Use
            </h1>
            <p className="text-xs text-muted-foreground mb-8 uppercase tracking-widest">
              Last updated: May 25, 2026
            </p>

            <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">1. Agreement to Terms & Service Provider</h2>
                <p>
                  By accessing or using Secret Crush, you agree to be bound by these Terms of Use and all applicable laws and regulations. Secret Crush is owned and operated by <strong className="text-foreground">ARCTURYN PRIVATE LIMITED</strong>, having its registered office at 411, 4th Floor, SHREEYA AMALGA, Thaltej Road, Ahmedabad, Gujarat, India 380054 ("Company", "we", "us", or "our"). If you do not agree with any of these terms, you are prohibited from using or accessing this site or service.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">2. Eligibility</h2>
                <p>
                  You must be at least 13 years of age to use our service. By using Secret Crush,
                  you represent and warrant that you meet this age requirement and have the legal capacity
                  to enter into these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">3. Account & Verification</h2>
                <p className="mb-2">
                  When register/creating an account, you agree to:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Provide accurate, current, and complete information.</li>
                  <li>Maintain the security of your authentication details.</li>
                  <li>Promptly notify us if you discover any unauthorized use of your account.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">4. Rules of Conduct</h2>
                <p className="mb-2">
                  To ensure a safe and pleasant environment, you agree not to:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Impersonate any person or entity, including fake social media handles or numbers.</li>
                  <li>Use the service to stalk, harass, abuse, or spam other individuals.</li>
                  <li>Attempt to bypass security measures or reverse engineer the matching logic.</li>
                  <li>Create multiple accounts to manipulate the crush limits.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">5. Service Limitations</h2>
                <p>
                  We offer a limit of up to 3 crushes per account to keep choices meaningful and reduce
                  unwanted spam. We reserve the right to modify crush limits, suspend accounts, or
                  discontinue features at our discretion without prior notice.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">6. Disclaimer of Warranties</h2>
                <p>
                  Secret Crush is provided on an "as is" and "as available" basis. We make no warranties,
                  expressed or implied, regarding the accuracy, completeness, or reliability of the service.
                  We do not warrant that matches will be successful or that the platform will be error-free.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
                <p>
                  In no event shall ARCTURYN PRIVATE LIMITED, Secret Crush, or its directors and officers be liable for any damages (including, without limitation, damages for loss of data, emotional distress, or business interruption) arising out of the use or inability to use the platform.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">8. Governing Law & Jurisdiction</h2>
                <p>
                  These Terms of Use shall be governed by and construed in accordance with the laws of India. Any legal action, suit, or proceeding arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the courts located in Ahmedabad, Gujarat, India.
                </p>
              </section>

              <div className="pt-6 border-t border-border/40 text-xs text-muted-foreground text-center space-y-1.5">
                <p className="font-semibold text-foreground">
                  Service Provider: ARCTURYN PRIVATE LIMITED
                </p>
                <p>
                  411, 4th Floor, SHREEYA AMALGA, Thaltej Road, Ahmedabad, Gujarat, India 380054 | Tel: +91 9978333880
                </p>
                <p className="pt-1">
                  If you have questions regarding these Terms, please contact us at <a href="mailto:info@secretcrush.app" className="text-primary hover:underline">info@secretcrush.app</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
