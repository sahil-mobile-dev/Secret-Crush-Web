import { Outlet, createFileRoute, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, userData, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    const path = location.pathname;
    const isLoginPath = path === "/admin/login";
    const isPendingPath = path === "/admin/pending";

    if (!user) {
      // Not logged in: must go to /admin/login
      if (!isLoginPath) {
        navigate({ to: "/admin/login", replace: true });
      }
    } else {
      // Logged in: check Firestore user doc status
      if (userData) {
        if (userData.status === "pending" || userData.status === "rejected") {
          // Pending or rejected users can only visit /admin/pending
          if (!isPendingPath) {
            navigate({ to: "/admin/pending", replace: true });
          }
        } else if (userData.status === "approved" || userData.role === "admin") {
          // Approved admins are redirected away from login/pending to the dashboard
          if (isLoginPath || isPendingPath) {
            navigate({ to: "/admin", replace: true });
          }
        }
      }
    }
  }, [user, userData, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
        {/* Decorative ambient glow */}
        <div className="pointer-events-none absolute -top-20 -left-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        
        <div className="animate-pulse-soft font-serif text-3xl text-primary tracking-wide">
          Secret Crush
        </div>
        <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
          Loading Admin Portal
        </p>
        <div className="mt-6 h-1 w-24 overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-1/2 animate-[pulse-soft_1.5s_infinite] rounded-full bg-primary" />
        </div>
      </div>
    );
  }

  const path = location.pathname;
  const isLoginPath = path === "/admin/login";
  const isPendingPath = path === "/admin/pending";

  // Prevent flashing protected views while redirection triggers
  if (!user && !isLoginPath) {
    return null;
  }

  if (user && userData) {
    if ((userData.status === "pending" || userData.status === "rejected") && !isPendingPath) {
      return null;
    }
    if ((userData.status === "approved" || userData.role === "admin") && (isLoginPath || isPendingPath)) {
      return null;
    }
  }

  return <Outlet />;
}
