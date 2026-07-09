import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, LogOut, Heart, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const Route = createFileRoute("/admin/pending")({
  component: AdminPendingPage,
});

function AdminPendingPage() {
  const { logout, userData } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      toast.success("Logged out successfully.");
      navigate({ to: "/admin/login", replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const handleResubmit = async () => {
    if (!userData?.uid) return;
    setResubmitting(true);
    try {
      const userRef = doc(db, "admins", userData.uid);
      await updateDoc(userRef, {
        status: "pending",
      });
      toast.success("Request resubmitted successfully!");
    } catch (error) {
      console.error("Resubmission error:", error);
      toast.error("Failed to resubmit. Please contact system owner.");
    } finally {
      setResubmitting(false);
    }
  };

  const isRejected = userData?.status === "rejected";

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      {/* Decorative blurred blobs */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-primary/15 blur-3xl" aria-hidden />

      {/* Floating ambient hearts */}
      <div className="pointer-events-none absolute top-16 right-16 animate-float text-primary/10">
        <Heart className="h-12 w-12 fill-current" />
      </div>

      <Card className="w-full max-w-md border-border/60 bg-card/75 shadow-[var(--shadow-card)] backdrop-blur-xl animate-fade-up text-center">
        <CardHeader className="space-y-2">
          {isRejected ? (
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500 animate-pulse-soft">
              <AlertTriangle className="h-7 w-7" />
            </div>
          ) : (
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 animate-pulse-soft">
              <Clock className="h-7 w-7" />
            </div>
          )}
          <CardTitle className="font-serif text-3xl tracking-tight text-foreground">
            {isRejected ? "Request Declined" : "Approval Pending"}
          </CardTitle>
          <CardDescription>
            {isRejected 
              ? "Your administrator request has been rejected" 
              : "Your account is currently waiting for administrator review"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isRejected ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-left text-sm leading-relaxed text-muted-foreground animate-fade-in">
              <p className="font-medium text-red-600 mb-1">What does this mean?</p>
              <p>
                An administrator reviewed and declined your request for admin privileges.
                If you believe this was a mistake, or if your context has changed, you can resubmit a new request for approval.
              </p>
              {userData?.email && (
                <p className="mt-3 text-xs border-t border-red-500/10 pt-2 text-primary font-medium">
                  Registered Email: <span className="text-foreground">{userData.email}</span>
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-left text-sm leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground mb-1">What happens next?</p>
              <p>
                An existing system administrator must review and accept your registration request.
                Once they approve your request, you will automatically be granted access to the Admin Panel.
              </p>
              {userData?.email && (
                <p className="mt-3 text-xs border-t border-amber-500/10 pt-2 text-primary font-medium">
                  Registered Email: <span className="text-foreground">{userData.email}</span>
                </p>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          {isRejected && (
            <Button
              onClick={handleResubmit}
              variant="crush"
              className="w-full font-medium"
              disabled={resubmitting}
            >
              {resubmitting ? "Resubmitting Request..." : "Resubmit Request"}
            </Button>
          )}
          <Button
            onClick={handleLogout}
            variant="softOutline"
            className="w-full font-medium"
            disabled={loggingOut || resubmitting}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {loggingOut ? "Signing Out..." : "Sign Out"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
