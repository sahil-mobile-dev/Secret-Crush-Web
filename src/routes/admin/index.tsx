import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, getCountFromServer } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogOut, Check, X, Shield, Users, Hourglass, Heart, RefreshCw, Share2, Search, Trash2, Crown, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
});

interface AdminRecord {
  uid: string;
  email: string;
  role: string;
  status: string;
  createdAt: any;
}

interface UserRecord {
  uid: string;
  name: string;
  phone?: string;
  phoneNumber?: string;
  normalizedPhone?: string;
  email?: string | null;
  age?: number;
  referralCode?: string;
  referredBy?: string | null;
  createdAt: any;
}

interface ReferralRecord {
  id: string;
  referrerId: string;
  refereeId: string;
  status: string;
  createdAt: any;
}

interface WaitlistRecord {
  id: string;
  name: string;
  mobile: string;
  instagram: string | null;
  timestamp: any;
}

function AdminDashboardPage() {
  const { user, userData, logout } = useAuth();
  const navigate = useNavigate();

  // Selected tab state
  const [activeTab, setActiveTab] = useState<"dashboard" | "waitlist">("dashboard");

  // Real-time lists
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [appUsers, setAppUsers] = useState<UserRecord[]>([]);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [waitlistMembers, setWaitlistMembers] = useState<WaitlistRecord[]>([]);

  // Selected user for referral history detail
  const [selectedUserForReferral, setSelectedUserForReferral] = useState<UserRecord | null>(null);

  // Helper functions for avatars
  const getInitials = (email: string) => {
    if (!email) return "?";
    return email.split("@")[0].substring(0, 2).toUpperCase();
  };

  const getAvatarBg = (email: string) => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return `oklch(0.92 0.04 ${h})`;
  };

  const getAvatarTextColor = (email: string) => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return `oklch(0.45 0.15 ${h})`;
  };

  // Count/Aggregate stats
  const [crushesCount, setCrushesCount] = useState<number | null>(null);
  const [matchesCount, setMatchesCount] = useState<number | null>(null);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [fetchingStats, setFetchingStats] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Search filter states
  const [userSearch, setUserSearch] = useState("");
  const [waitlistSearch, setWaitlistSearch] = useState("");

  // Sort states
  const [sortBy, setSortBy] = useState<"date" | "completed" | "codes" | "total">("date");

  // Fetch count aggregations
  const fetchAggregatedStats = async () => {
    setFetchingStats(true);
    try {
      // 1. Crushes count
      const crushesColl = collection(db, "crushes");
      const crushesSnap = await getCountFromServer(crushesColl);
      setCrushesCount(crushesSnap.data().count);

      // 2. Matches count
      const matchesColl = collection(db, "matches");
      const matchesSnap = await getCountFromServer(matchesColl);
      setMatchesCount(matchesSnap.data().count);

      // 3. Waitlist count (fallback helper)
      const waitlistColl = collection(db, "waitlist");
      const waitlistSnap = await getCountFromServer(waitlistColl);
      setWaitlistCount(waitlistSnap.data().count);
    } catch (error) {
      console.error("Error fetching aggregated statistics:", error);
    } finally {
      setFetchingStats(false);
    }
  };

  useEffect(() => {
    fetchAggregatedStats();

    // 1. Subscribe to admins collection
    const adminsColl = collection(db, "admins");
    const unsubAdmins = onSnapshot(
      adminsColl,
      (snapshot) => {
        const list: AdminRecord[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as AdminRecord);
        });
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setAdmins(list);
      },
      (error) => {
        console.error("Admins subscription error:", error);
        toast.error("Failed to sync administrators list.");
      }
    );

    // 2. Subscribe to users collection
    const usersColl = collection(db, "users");
    const unsubUsers = onSnapshot(
      usersColl,
      (snapshot) => {
        const list: UserRecord[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as UserRecord);
        });
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setAppUsers(list);
      },
      (error) => {
        console.error("Users subscription error:", error);
        toast.error("Failed to sync registered app users.");
      }
    );

    // 3. Subscribe to referrals collection
    const referralsColl = collection(db, "referrals");
    const unsubReferrals = onSnapshot(
      referralsColl,
      (snapshot) => {
        const list: ReferralRecord[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as ReferralRecord);
        });
        setReferrals(list);
      },
      (error) => {
        console.error("Referrals subscription error:", error);
      }
    );

    // 4. Subscribe to waitlist collection
    const waitlistColl = collection(db, "waitlist");
    const unsubWaitlist = onSnapshot(
      waitlistColl,
      (snapshot) => {
        const list: WaitlistRecord[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...(doc.data() as Omit<WaitlistRecord, "id">) });
        });
        list.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
        setWaitlistMembers(list);
        setWaitlistCount(list.length);
      },
      (error) => {
        console.error("Waitlist subscription error:", error);
        toast.error("Failed to sync waitlist members.");
      }
    );

    return () => {
      unsubAdmins();
      unsubUsers();
      unsubReferrals();
      unsubWaitlist();
    };
  }, []);

  const handleApprove = async (targetUid: string) => {
    setActionLoading(targetUid);
    try {
      const userRef = doc(db, "admins", targetUid);
      await updateDoc(userRef, {
        status: "approved",
        role: "admin",
      });
      toast.success("User approved as admin successfully!");
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Failed to approve user.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (targetUid: string) => {
    if (!confirm("Are you sure you want to reject this registration request?")) return;
    setActionLoading(targetUid);
    try {
      const userRef = doc(db, "admins", targetUid);
      await updateDoc(userRef, {
        status: "rejected",
      });
      toast.success("Registration request rejected.");
    } catch (error) {
      console.error("Rejection error:", error);
      toast.error("Failed to reject user.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAdminDoc = async (targetUid: string, targetEmail: string) => {
    if (targetUid === user?.uid) {
      toast.error("You cannot delete yourself.");
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete the admin record for ${targetEmail}? This will allow them to auto-provision a new request if they log in again.`)) return;
    setActionLoading(targetUid);
    try {
      const userRef = doc(db, "admins", targetUid);
      await deleteDoc(userRef);
      toast.success("Admin record permanently deleted.");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete admin record.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveAdmin = async (targetUid: string, targetEmail: string) => {
    if (targetUid === user?.uid) {
      toast.error("You cannot remove yourself as admin.");
      return;
    }
    if (!confirm(`Are you sure you want to remove admin privileges for ${targetEmail}?`)) return;
    setActionLoading(targetUid);
    try {
      const userRef = doc(db, "admins", targetUid);
      await deleteDoc(userRef);
      toast.success("Administrator privileges removed.");
    } catch (error) {
      console.error("Remove admin error:", error);
      toast.error("Failed to remove admin.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteWaitlist = async (docId: string) => {
    if (!confirm("Are you sure you want to remove this entry from the waitlist?")) return;
    setActionLoading(docId);
    try {
      const waitlistDocRef = doc(db, "waitlist", docId);
      await deleteDoc(waitlistDocRef);
      toast.success("Waitlist entry removed successfully.");
    } catch (error) {
      console.error("Delete waitlist error:", error);
      toast.error("Failed to delete waitlist entry.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully.");
      navigate({ to: "/admin/login", replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out.");
    }
  };

  // Helper lookup: find user's referrer name
  const findReferrerName = (code: string | null | undefined) => {
    if (!code) return "None";
    const found = appUsers.find((u) => u.referralCode === code);
    return found ? `${found.name} (${code})` : code;
  };

  // Filter lists based on search
  const filteredUsers = appUsers.filter((u) => {
    const term = userSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      (u.name || "").toLowerCase().includes(term) ||
      (u.phone || u.phoneNumber || u.normalizedPhone || "").toLowerCase().includes(term) ||
      (u.referralCode || "").toLowerCase().includes(term) ||
      (u.referredBy || "").toLowerCase().includes(term)
    );
  });

  // Sort filtered users dynamically based on selected metric
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "date") {
      return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    }
    if (sortBy === "completed") {
      const countA = referrals.filter((r) => r.referrerId === a.uid).length;
      const countB = referrals.filter((r) => r.referrerId === b.uid).length;
      return countB - countA;
    }
    if (sortBy === "codes") {
      const countA = appUsers.filter((u) => u.referredBy === a.referralCode).length;
      const countB = appUsers.filter((u) => u.referredBy === b.referralCode).length;
      return countB - countA;
    }
    if (sortBy === "total") {
      const compA = referrals.filter((r) => r.referrerId === a.uid).length;
      const codeA = appUsers.filter((u) => u.referredBy === a.referralCode).length;
      const compB = referrals.filter((r) => r.referrerId === b.uid).length;
      const codeB = appUsers.filter((u) => u.referredBy === b.referralCode).length;
      return (compB + codeB) - (compA + codeA);
    }
    return 0;
  });

  // Find top referrer's UID for the visual crown highlight
  const getTopReferrerUid = () => {
    if (appUsers.length === 0) return null;
    let topUid: string | null = null;
    let maxVal = -1;

    appUsers.forEach((u) => {
      let val = 0;
      if (sortBy === "completed") {
        val = referrals.filter((r) => r.referrerId === u.uid).length;
      } else if (sortBy === "codes") {
        val = appUsers.filter((item) => item.referredBy === u.referralCode).length;
      } else if (sortBy === "total") {
        const comp = referrals.filter((r) => r.referrerId === u.uid).length;
        const code = appUsers.filter((item) => item.referredBy === u.referralCode).length;
        val = comp + code;
      }
      
      if (val > 0 && val > maxVal) {
        maxVal = val;
        topUid = u.uid;
      }
    });

    return topUid;
  };

  const topReferrerUid = getTopReferrerUid();

  const filteredWaitlist = waitlistMembers.filter((w) => {
    const term = waitlistSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      (w.name || "").toLowerCase().includes(term) ||
      (w.mobile || "").toLowerCase().includes(term) ||
      (w.instagram || "").toLowerCase().includes(term)
    );
  });

  const pendingAdmins = admins.filter((a) => a.status === "pending");
  const approvedAdmins = admins.filter((a) => a.status === "approved" || a.role === "admin");
  const rejectedAdmins = admins.filter((a) => a.status === "rejected");

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Decorative blurred blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[30rem] w-[30rem] rounded-full bg-primary/5 blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute top-1/2 -right-40 h-[35rem] w-[35rem] rounded-full bg-primary/10 blur-[150px]" aria-hidden />

      {/* Header bar */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary animate-pulse-soft">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-medium tracking-tight">Secret Crush</h1>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-muted-foreground md:inline-block">
              Logged in as: <span className="font-semibold text-foreground">{user?.email}</span>
            </span>
            <Button onClick={handleLogout} variant="ghost" size="sm" className="h-8 gap-2 border border-border/50 text-xs">
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        
        {/* Navigation Tabs */}
        <div className="mb-8 flex flex-wrap gap-2 border-b border-border/40 pb-4">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-primary text-primary-foreground shadow"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70"
            }`}
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab("waitlist")}
            className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "waitlist"
                ? "bg-primary text-primary-foreground shadow"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70"
            }`}
          >
            Waitlist Signups ({waitlistMembers.length})
          </button>
        </div>

        {/* Tab 1: Dashboard Overview */}
        {activeTab === "dashboard" && (
          <div className="space-y-12 animate-fade-up">
            {/* Stats grid */}
            <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              <Card className="border-border/60 bg-card/60 shadow-[var(--shadow-card)] backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-sky-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">{appUsers.length}</div>
                  <p className="mt-1 text-[10px] text-muted-foreground">Registered on app</p>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/60 shadow-[var(--shadow-card)] backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Crushes Added</CardTitle>
                  <Heart className="h-4 w-4 text-primary fill-current" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">
                    {crushesCount !== null ? crushesCount.toLocaleString() : "..."}
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">Crushes sent secretly</p>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/60 shadow-[var(--shadow-card)] backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Matches Found</CardTitle>
                  <RefreshCw className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">
                    {matchesCount !== null ? matchesCount.toLocaleString() : "..."}
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">Mutual crushes matching</p>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/60 shadow-[var(--shadow-card)] backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Total Referrals</CardTitle>
                  <Share2 className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">{referrals.length}</div>
                  <p className="mt-1 text-[10px] text-muted-foreground">Completed referrals</p>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/60 shadow-[var(--shadow-card)] backdrop-blur relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Waitlist Size</CardTitle>
                  <Hourglass className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">
                    {waitlistCount !== null ? waitlistCount.toLocaleString() : "..."}
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">Public web waitlist</p>
                </CardContent>
              </Card>
            </section>

            {/* Administrators & Requests Row */}
            <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
              
              {/* Approved Admins Column */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-500" />
                  <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground">
                    Active Administrators
                  </h2>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold ml-1">
                    {approvedAdmins.length}
                  </Badge>
                </div>
                
                <Card className="border-border/60 bg-card/40 p-5 shadow-[var(--shadow-card)] backdrop-blur-md rounded-2xl">
                  <div className="space-y-3">
                    {approvedAdmins.length === 0 ? (
                      <p className="text-center text-xs text-muted-foreground py-8">No active administrators.</p>
                    ) : (
                      approvedAdmins.map((item) => {
                        const initials = getInitials(item.email);
                        const bg = getAvatarBg(item.email);
                        const color = getAvatarTextColor(item.email);
                        return (
                          <div key={item.uid} className="flex items-center justify-between rounded-xl border border-border/40 bg-card/50 p-4 transition-all hover:bg-card/90 hover:shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-sm font-semibold shadow-inner" style={{ backgroundColor: bg, color: color }}>
                                {initials}
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="font-semibold text-foreground text-sm">{item.email}</span>
                                  {item.uid === user?.uid && (
                                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-[9px] font-bold uppercase tracking-wider py-0 px-1.5 border-none">
                                      You
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Admin Account</p>
                              </div>
                            </div>
                            <div>
                              {item.uid !== user?.uid ? (
                                <Button
                                  onClick={() => handleRemoveAdmin(item.uid, item.email)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-xs text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors"
                                  disabled={actionLoading === item.uid}
                                >
                                  Revoke
                                </Button>
                              ) : (
                                <span className="text-[9px] font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full uppercase tracking-wider">Owner</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Card>
              </section>

              {/* Pending Requests Column */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Hourglass className="h-5 w-5 text-amber-500" />
                  <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground">
                    Pending Requests
                  </h2>
                  {pendingAdmins.length > 0 && (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 border-amber-500/20 font-bold animate-pulse-soft">
                      {pendingAdmins.length} New
                    </Badge>
                  )}
                </div>
                
                <Card className="border-border/60 bg-card/40 p-5 shadow-[var(--shadow-card)] backdrop-blur-md rounded-2xl">
                  <div className="space-y-3">
                    {pendingAdmins.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border/60 rounded-xl bg-card/25">
                        <Check className="h-8 w-8 text-emerald-500 mb-2" />
                        <p className="text-sm font-semibold text-foreground">All Caught Up!</p>
                        <p className="text-xs text-muted-foreground mt-0.5">No pending admin registration requests.</p>
                      </div>
                    ) : (
                      pendingAdmins.map((item) => {
                        const initials = getInitials(item.email);
                        const bg = getAvatarBg(item.email);
                        const color = getAvatarTextColor(item.email);
                        const dateStr = item.createdAt?.seconds
                          ? new Date(item.createdAt.seconds * 1000).toLocaleDateString()
                          : "Unknown";
                        return (
                          <div key={item.uid} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 transition-all hover:bg-amber-500/10 hover:shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-sm font-semibold shadow-inner" style={{ backgroundColor: bg, color: color }}>
                                {initials}
                              </div>
                              <div>
                                <span className="font-semibold text-foreground text-sm">{item.email}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 text-[9px] font-bold uppercase tracking-wider py-0 px-1.5 border-none">
                                    Pending
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground">Requested: {dateStr}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                onClick={() => handleApprove(item.uid)}
                                size="sm"
                                variant="crush"
                                className="h-8 px-3 text-xs flex items-center gap-1"
                                disabled={actionLoading === item.uid}
                              >
                                <Check className="h-3.5 w-3.5" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleReject(item.uid)}
                                size="sm"
                                variant="destructive"
                                className="h-8 px-3 text-xs bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-500 flex items-center gap-1"
                                disabled={actionLoading === item.uid}
                              >
                                <X className="h-3.5 w-3.5" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Rejected Requests Subsection */}
                  {rejectedAdmins.length > 0 && (
                    <div className="mt-6 border-t border-border/40 pt-4">
                      <details className="group">
                        <summary className="flex items-center justify-between text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none">
                          <span className="flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500/80" />
                            Rejected Requests ({rejectedAdmins.length})
                          </span>
                          <span className="transition-transform group-open:rotate-180 text-[10px]">▼</span>
                        </summary>
                        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                          {rejectedAdmins.map((item) => {
                            const initials = getInitials(item.email);
                            const bg = getAvatarBg(item.email);
                            const color = getAvatarTextColor(item.email);
                            return (
                              <div key={item.uid} className="flex items-center justify-between rounded-xl border border-red-500/10 bg-red-500/5 p-3 text-xs">
                                <div className="flex items-center gap-2.5">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-serif text-xs font-semibold shadow-inner" style={{ backgroundColor: bg, color: color }}>
                                    {initials}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-foreground text-xs leading-none">{item.email}</p>
                                    <p className="text-[9px] text-muted-foreground mt-0.5">Rejected Request</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    onClick={async () => {
                                      setActionLoading(item.uid);
                                      try {
                                        await updateDoc(doc(db, "admins", item.uid), { status: "pending" });
                                        toast.success("Request moved back to pending.");
                                      } catch (err) {
                                        toast.error("Failed to update status.");
                                      } finally {
                                        setActionLoading(null);
                                      }
                                    }}
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-[10px] text-amber-600 hover:bg-amber-500/10"
                                    disabled={actionLoading === item.uid}
                                  >
                                    Re-evaluate
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteAdminDoc(item.uid, item.email)}
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-[10px] text-red-500 hover:bg-red-500/10"
                                    disabled={actionLoading === item.uid}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </details>
                    </div>
                  )}
                </Card>
              </section>

            </div>

            {/* App Users & Referrals Section */}
            <section className="space-y-6 pt-4 border-t border-border/40">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-sky-500" />
                  <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground">
                    App Users & Referrals
                  </h2>
                  <Badge variant="secondary" className="bg-sky-500/10 text-sky-600 border-sky-500/20 font-bold ml-2">
                    {appUsers.length} Total
                  </Badge>
                </div>
                
                {/* Glassmorphic Search and Sort toolbar */}
                <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/45 p-4 shadow-[var(--shadow-card)] backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative flex-1 max-w-lg">
                    <Search className="absolute top-3 left-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, phone, email, or referral code..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-10 pr-14 h-10 bg-background/50 border-border/80 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-xl"
                    />
                    {userSearch && (
                      <button
                        onClick={() => setUserSearch("")}
                        className="absolute right-3.5 top-2.5 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-[10px] whitespace-nowrap">Sort By:</span>
                    <div className="flex flex-wrap rounded-xl border border-border/80 bg-background/40 p-1 gap-1">
                      {[
                        { value: "date", label: "📅 Registration Date" },
                        { value: "completed", label: "🏆 Completed Referrals" },
                        { value: "codes", label: "🎟️ Codes Entered" },
                        { value: "total", label: "🌟 Total Invites" }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSortBy(opt.value as any)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                            sortBy === opt.value
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Users table wrapper */}
              <Card className="border-border/60 bg-card/60 shadow-[var(--shadow-card)] backdrop-blur overflow-hidden rounded-2xl">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-secondary/20">
                      <TableRow>
                        <TableHead className="py-4 pl-6">User Profile</TableHead>
                        <TableHead className="py-4">Age</TableHead>
                        <TableHead className="py-4">Referral Code</TableHead>
                        <TableHead className="py-4">Referred By</TableHead>
                        <TableHead className="py-4 text-center">Referrals (Completed)</TableHead>
                        <TableHead className="py-4 text-center">Referrals (Code Entered)</TableHead>
                        <TableHead className="py-4">Registered Date</TableHead>
                        <TableHead className="py-4 text-right pr-6">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-36 text-center text-muted-foreground">
                            {userSearch ? "No users match your search." : "No registered users in the database."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedUsers.map((item) => {
                          const completedCount = referrals.filter((r) => r.referrerId === item.uid).length;
                          const codeCount = appUsers.filter((u) => u.referredBy === item.referralCode).length;
                          const dateStr = item.createdAt?.seconds
                            ? new Date(item.createdAt.seconds * 1000).toLocaleDateString()
                            : "Unknown";
                          const phoneStr = item.phone || item.phoneNumber || item.normalizedPhone || "No Phone";
                          
                          return (
                            <TableRow key={item.uid} className="transition-all hover:bg-muted/30 border-b border-border/20">
                              <TableCell className="py-4 pl-6">
                                <div>
                                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                                    {item.name || "N/A"}
                                    {item.uid === topReferrerUid && (
                                      <span title="Top Referrer 👑">
                                        <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500 animate-[bounce_2s_infinite]" />
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{phoneStr}</p>
                                  {item.email && <p className="text-[10px] text-muted-foreground">{item.email}</p>}
                                </div>
                              </TableCell>
                              <TableCell className="py-4">{item.age || "N/A"}</TableCell>
                              <TableCell className="py-4">
                                <Badge variant="outline" className="font-mono bg-background/50 uppercase text-xs py-0.5 border-border/80">
                                  {item.referralCode || "N/A"}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4 text-xs font-medium text-foreground/80">
                                {findReferrerName(item.referredBy)}
                              </TableCell>
                              <TableCell className="py-4 text-center font-bold text-sm">
                                <span className={completedCount > 0 ? "text-emerald-600 font-semibold" : "text-muted-foreground"}>
                                  {completedCount}
                                </span>
                              </TableCell>
                              <TableCell className="py-4 text-center font-bold text-sm">
                                <span className={codeCount > 0 ? "text-primary font-semibold" : "text-muted-foreground"}>
                                  {codeCount}
                                </span>
                              </TableCell>
                              <TableCell className="py-4 text-muted-foreground text-xs">{dateStr}</TableCell>
                              <TableCell className="py-4 text-right pr-6">
                                <Button
                                  variant="softOutline"
                                  size="sm"
                                  className="h-7 px-3 text-xs text-primary hover:bg-primary/15 transition-colors border border-primary/20 hover:border-primary/40 rounded-lg"
                                  onClick={() => setSelectedUserForReferral(item)}
                                >
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </section>
          </div>
        )}

        {/* Tab 3: Public Waitlist Signups */}
        {activeTab === "waitlist" && (
          <div className="space-y-4 animate-fade-up">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground flex items-center gap-2">
                <Hourglass className="h-5 w-5 text-amber-500" /> Waitlist Members
              </h2>
              
              <div className="relative w-full max-w-sm">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search waitlist..."
                  value={waitlistSearch}
                  onChange={(e) => setWaitlistSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Card className="border-border/60 bg-card/60 shadow-[var(--shadow-card)] backdrop-blur overflow-hidden rounded-2xl">
              <Table>
                <TableHeader className="bg-secondary/20">
                  <TableRow>
                    <TableHead className="pl-6 py-4">Name</TableHead>
                    <TableHead className="py-4">Mobile Number</TableHead>
                    <TableHead className="py-4">Instagram ID</TableHead>
                    <TableHead className="py-4">Joined Date</TableHead>
                    <TableHead className="text-right pr-6 py-4">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWaitlist.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        {waitlistSearch ? "No waitlist members match your search." : "No waitlist entries found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWaitlist.map((item) => {
                      const dateStr = item.timestamp?.seconds
                        ? new Date(item.timestamp.seconds * 1000).toLocaleDateString()
                        : "Unknown";
                      return (
                        <TableRow key={item.id} className="transition-all hover:bg-muted/30 border-b border-border/20">
                          <TableCell className="font-medium text-foreground pl-6 py-4">{item.name}</TableCell>
                          <TableCell className="py-4">{item.mobile}</TableCell>
                          <TableCell className="py-4">
                            {item.instagram ? (
                              <Badge variant="secondary" className="bg-pink-500/5 text-pink-600 border-pink-500/10 font-mono text-[10px]">
                                {item.instagram}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground py-4">{dateStr}</TableCell>
                          <TableCell className="text-right pr-6 py-4">
                            <Button
                              onClick={() => handleDeleteWaitlist(item.id)}
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2.5 text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors rounded-lg"
                              disabled={actionLoading === item.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}
      </main>

      {/* Referral History Dialog */}
      <Dialog
        open={!!selectedUserForReferral}
        onOpenChange={(open) => !open && setSelectedUserForReferral(null)}
      >
        <DialogContent className="max-w-2xl border-border/60 bg-card/95 shadow-[var(--shadow-card)] backdrop-blur-xl max-h-[85vh] overflow-y-auto">
          {selectedUserForReferral && (() => {
            // Find who referred this user
            const referrerInfo = findReferrerName(selectedUserForReferral.referredBy);
            
            // Gather all referee UIDs from both sources
            const refereeUids = new Set<string>();
            appUsers.forEach((u) => {
              if (u.referredBy && u.referredBy === selectedUserForReferral.referralCode) {
                refereeUids.add(u.uid);
              }
            });
            referrals.forEach((r) => {
              if (r.referrerId === selectedUserForReferral.uid) {
                refereeUids.add(r.refereeId);
              }
            });
            
            const refereeList = Array.from(refereeUids).map((uid) => {
              const userDoc = appUsers.find((u) => u.uid === uid);
              if (userDoc) return userDoc;
              const refRecord = referrals.find((r) => r.refereeId === uid);
              return {
                uid,
                name: "Unknown User",
                phone: "N/A",
                createdAt: refRecord?.createdAt || null,
              } as UserRecord;
            });

            return (
              <>
                <DialogHeader className="space-y-1">
                  <DialogTitle className="font-serif text-2xl tracking-tight text-primary">
                    Referral Details & History
                  </DialogTitle>
                  <DialogDescription>
                    Referrals and history for <span className="font-semibold text-foreground">{selectedUserForReferral.name || "N/A"}</span>
                  </DialogDescription>
                </DialogHeader>

                {/* Profile info block */}
                <div className="grid gap-4 rounded-2xl border border-border/40 bg-secondary/20 p-4 text-sm sm:grid-cols-2 mt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">User Name</p>
                    <p className="font-semibold text-foreground">{selectedUserForReferral.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Contact</p>
                    <p className="font-semibold text-foreground">
                      {selectedUserForReferral.phone || selectedUserForReferral.phoneNumber || selectedUserForReferral.normalizedPhone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Their Referral Code</p>
                    <Badge variant="outline" className="font-mono bg-background/50 font-semibold uppercase mt-0.5">
                      {selectedUserForReferral.referralCode || "N/A"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Referred By</p>
                    <p className="font-semibold text-foreground mt-0.5">{referrerInfo}</p>
                  </div>
                </div>

                {/* Referral stats */}
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-600">
                      {referrals.filter((r) => r.referrerId === selectedUserForReferral.uid).length}
                    </p>
                    <p className="text-[10px] uppercase font-semibold tracking-wider text-emerald-700">Completed Referrals</p>
                  </div>
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {appUsers.filter((u) => u.referredBy === selectedUserForReferral.referralCode).length}
                    </p>
                    <p className="text-[10px] uppercase font-semibold tracking-wider text-primary">Codes Entered</p>
                  </div>
                </div>

                {/* Referees Table */}
                <div className="space-y-2 mt-4">
                  <h4 className="font-serif text-lg font-medium text-foreground">Referred Users History</h4>
                  <div className="rounded-xl border border-border/40 overflow-hidden bg-background max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader className="bg-secondary/20">
                        <TableRow>
                          <TableHead>Referee</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-right">Joined Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {refereeList.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center text-xs text-muted-foreground">
                              No referral history found for this user.
                            </TableCell>
                          </TableRow>
                        ) : (
                          refereeList.map((referee) => {
                            const isCompleted = referrals.some(
                              (r) => r.referrerId === selectedUserForReferral.uid && r.refereeId === referee.uid
                            );
                            const refereePhone = referee.phone || referee.phoneNumber || referee.normalizedPhone || "No Phone";
                            const joinedDateStr = referee.createdAt?.seconds
                              ? new Date(referee.createdAt.seconds * 1000).toLocaleDateString()
                              : "Unknown";
                            
                            return (
                              <TableRow key={referee.uid} className="hover:bg-muted/10 text-xs">
                                <TableCell>
                                  <div>
                                    <p className="font-semibold text-foreground">{referee.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{refereePhone}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  {isCompleted ? (
                                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] uppercase font-bold py-0">
                                      Completed
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] uppercase font-bold py-0">
                                      Code Entered
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">{joinedDateStr}</TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
