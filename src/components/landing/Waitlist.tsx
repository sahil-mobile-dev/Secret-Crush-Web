import { useState, useEffect } from "react";
import { User, Phone, Instagram, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import envelope from "@/assets/envelope-heart.png";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getCountFromServer } from "firebase/firestore";

export function Waitlist() {
  const [submitted, setSubmitted] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCount() {
      try {
        const coll = collection(db, "waitlist");
        const snapshot = await getCountFromServer(coll);
        setCount(snapshot.data().count);
      } catch (error) {
        console.error("Error fetching waitlist count:", error);
        setCount(0);
      }
    }
    fetchCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const mobile = formData.get("mobile") as string;
    const instagram = formData.get("instagram") as string;

    try {
      await addDoc(collection(db, "waitlist"), {
        name,
        mobile: "+91" + mobile.trim(),
        instagram: instagram.trim() || null,
        timestamp: serverTimestamp(),
      });
      setSubmitted(true);
      setCount((prev) => (prev !== null ? prev + 1 : 1));
    } catch (error) {
      console.error("Error saving waitlist entry:", error);
      alert("Something went wrong. Please try again!");
    }
  };

  return (
    <section id="waitlist" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div
          className="relative overflow-hidden rounded-[2.5rem] border border-border/60 px-8 py-14 md:px-16 md:py-20"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="pointer-events-none absolute -top-20 -right-10 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-80 w-80 rounded-full bg-[oklch(0.88_0.08_30)]/40 blur-3xl" />

          <div className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_1fr_0.7fr]">
            <div>
              <h2 className="font-serif text-4xl leading-tight tracking-tight md:text-5xl">
                What if your <br />
                <span className="italic text-primary">crush</span> joins too?
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
                Be among the first to experience Secret Crush.
              </p>

              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-background shadow-sm"
                      style={{
                        background: `linear-gradient(135deg, oklch(0.82 0.12 ${i * 25}), oklch(0.7 0.15 ${i * 18}))`,
                      }}
                    />
                  ))}
                </div>
                <div>
                  <p className="text-lg font-semibold text-primary">
                    {count !== null ? count.toLocaleString() : "..."}
                  </p>
                  <p className="text-xs text-muted-foreground">people on the waitlist</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card/80 p-7 shadow-[var(--shadow-card)] backdrop-blur-xl">
              <h3 className="font-serif text-2xl font-medium text-primary">Join the waitlist</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get early access when we launch.
              </p>

              {submitted ? (
                <div className="mt-6 rounded-2xl bg-[var(--gradient-soft)] p-6 text-center">
                  <p className="font-serif text-xl text-primary">You're in 💌</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We'll whisper when it's time.
                  </p>
                </div>
              ) : (
                <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
                  <Field name="name" icon={<User className="h-4 w-4" />} placeholder="Your Name" required />
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1 rounded-xl border border-input bg-background/80 px-3 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      +91
                    </div>
                    <div className="flex-1">
                      <Field name="mobile" placeholder="Mobile Number" type="tel" required />
                    </div>
                  </div>
                  <Field
                    name="instagram"
                    icon={<Instagram className="h-4 w-4" />}
                    placeholder="Instagram ID (Optional)"
                  />

                  <Button type="submit" variant="crush" size="pillLg" className="mt-2 w-full">
                    Reserve My Spot <Send className="ml-1 h-4 w-4" />
                  </Button>

                  <p className="flex items-center justify-center gap-1.5 pt-1 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    We respect your privacy. No spam. Ever.
                  </p>
                </form>
              )}
            </div>

            <div className="hidden lg:block">
              <img
                src={envelope}
                alt="Envelope with love letter"
                width={768}
                height={768}
                loading="lazy"
                className="mx-auto w-full max-w-xs animate-float-delayed"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  icon,
  ...props
}: { icon?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-input bg-background/80 px-3.5 py-3 transition-all focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15">
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <input
        {...props}
        className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}