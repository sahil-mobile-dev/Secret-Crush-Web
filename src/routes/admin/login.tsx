import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, collection, query, limit, getDoc, getDocs, writeBatch, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Lock, Mail, UserPlus, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Sign In Flow
        await signInWithEmailAndPassword(auth, email.trim(), password);
        toast.success("Successfully logged in!");
        // The AdminLayout effect will handle redirects
      } else {
        // Register Flow
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;

        // Check if metadata config exists to determine if the first admin is already registered
        const configRef = doc(db, "metadata", "config");
        const configSnap = await getDoc(configRef);
        const isFirstUser = !configSnap.exists();

        // Create atomic write batch for user and config (if first user)
        const batch = writeBatch(db);
        const userDocRef = doc(db, "admins", user.uid);
        
        batch.set(userDocRef, {
          uid: user.uid,
          email: user.email || email.trim(),
          role: isFirstUser ? "admin" : "pending",
          status: isFirstUser ? "approved" : "pending",
          createdAt: serverTimestamp(),
        });

        if (isFirstUser) {
          const configDocRef = doc(db, "metadata", "config");
          batch.set(configDocRef, {
            firstAdminUid: user.uid,
            adminCreated: true,
            createdAt: serverTimestamp(),
          });
        }

        await batch.commit();

        if (isFirstUser) {
          toast.success("Registration successful! You are the first user and have been approved as Admin.");
          navigate({ to: "/admin", replace: true });
        } else {
          toast.success("Registration request submitted! Please wait for admin approval.");
          navigate({ to: "/admin/pending", replace: true });
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let message = "An unexpected error occurred.";
      if (error.code === "auth/email-already-in-use") {
        message = "This email is already in use.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email format.";
      } else if (error.code === "auth/weak-password") {
        message = "Password is too weak.";
      } else if (error.code === "auth/invalid-credential") {
        message = "Invalid email or password.";
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 md:py-24">
      {/* Visual background decorations */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-primary/15 blur-3xl" aria-hidden />
      
      {/* Floating ambient hearts */}
      <div className="pointer-events-none absolute top-12 left-12 animate-float text-primary/10">
        <Heart className="h-10 w-10 fill-current" />
      </div>
      <div className="pointer-events-none absolute bottom-12 right-12 animate-float-delayed text-primary/10">
        <Heart className="h-14 w-14 fill-current" />
      </div>

      <Card className="w-full max-w-md border-border/60 bg-card/75 shadow-[var(--shadow-card)] backdrop-blur-xl animate-fade-up">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Heart className="h-6 w-6 fill-current animate-pulse-soft" />
          </div>
          <CardTitle className="font-serif text-3xl tracking-tight text-foreground">
            {isLogin ? "Admin Sign In" : "Register Admin"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Access the Secret Crush management dashboard"
              : "Register to request administrator privileges"}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              variant="crush"
              className="w-full font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : isLogin ? (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register Account
                </>
              )}
            </Button>

            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-widest text-primary hover:opacity-85 transition-opacity"
              onClick={() => {
                setIsLogin(!isLogin);
              }}
              disabled={loading}
            >
              {isLogin
                ? "Don't have an account? Register"
                : "Already registered? Sign In"}
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
