import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingHearts } from "@/components/landing/FloatingHearts";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-xs text-muted-foreground mb-8 uppercase tracking-widest">
              Last updated: May 25, 2026
            </p>

            <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">1. Introduction</h2>
                <p>
                  Welcome to Secret Crush. We understand that your privacy is of utmost importance,
                  especially when it comes to personal feelings and relationships. This Privacy Policy
                  explains how we collect, use, and protect your information when you use our website
                  and mobile application.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">2. Information We Collect</h2>
                <p className="mb-2">
                  To provide our matching service, we collect the minimum amount of personal data required:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong className="text-foreground">Authentication Details:</strong> Your mobile number is used to create and secure your account.
                  </li>
                  <li>
                    <strong className="text-foreground">Profile Information:</strong> Your name and optional Instagram handle, which are used to represent you to matches.
                  </li>
                  <li>
                    <strong className="text-foreground">Crush Lists:</strong> The identities/handles of the crushes you add. This information is kept strictly confidential and encrypted on our servers.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">3. How Matches Work (Confidentiality)</h2>
                <p className="mb-3">
                  Our core feature is built around complete confidentiality:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Your crushes will <strong className="text-primary italic">never</strong> be notified that you added them, unless they also add you to their crush list.
                  </li>
                  <li>
                    Matches are only revealed if the crush connection is mutual (a double-opt-in).
                  </li>
                  <li>
                    No public directories, search capabilities, or user profiles are browseable by other users who have not matched with you.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">4. How We Use Your Data</h2>
                <p className="mb-2">
                  We use the information we collect solely to:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Verify your phone number and secure your account.</li>
                  <li>Perform the secret match verification.</li>
                  <li>Send match notification alerts.</li>
                  <li>We never sell or rent your personal data to advertisers or third parties.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">5. Data Retention</h2>
                <p>
                  You have full control over your list. You can remove a crush or delete your account
                  at any time. Once deleted, your account data and any active crush listings are
                  permanently removed from our production databases.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">6. Security Measures</h2>
                <p>
                  We implement industry-standard administrative, physical, and electronic security
                  measures designed to protect your information from unauthorized access. However,
                  no security system is impenetrable, and we cannot guarantee the absolute security
                  of our databases.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">7. Updates to This Policy</h2>
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes
                  by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <div className="pt-6 border-t border-border/40 text-xs text-muted-foreground text-center">
                If you have any questions about this Privacy Policy, please contact us at privacy@secretcrush.app.
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
