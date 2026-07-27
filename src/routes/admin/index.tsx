import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getCountFromServer,
  query,
  orderBy,
  Timestamp,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LogOut,
  Check,
  X,
  Shield,
  Users,
  Hourglass,
  Heart,
  RefreshCw,
  Share2,
  Search,
  Trash2,
  Crown,
  AlertTriangle,
  Trophy,
  Plus,
  Loader2,
  Calendar,
  Sparkles,
  Pencil,
  Copy,
  Eye,
  FileJson,
  HeartHandshake,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { contestService, ContestRecord, RewardInput } from "@/lib/contest-service";

// Zod schemas for contest validation
const rewardSchema = z
  .object({
    rankFrom: z.number({ invalid_type_error: "Must be a number" }).min(1, "Must be >= 1"),
    rankTo: z.number({ invalid_type_error: "Must be a number" }).min(1, "Must be >= 1"),
    reward: z.string().min(1, "Reward is required"),
  })
  .refine((data) => data.rankTo >= data.rankFrom, {
    message: "To must be >= From",
    path: ["rankTo"],
  });

const formSchema = z
  .object({
    name: z.string().min(1, "Contest Name is required"),
    contestCode: z
      .string()
      .min(1, "Contest Code is required")
      .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, hyphens & underscores allowed"),
    description: z.string(),
    startAt: z.string().min(1, "Start Date is required"),
    endAt: z.string().min(1, "End Date is required"),
    winnerType: z.enum(["referrals", "points"], {
      required_error: "Winner Criteria is required",
    }),
    rewards: z.array(rewardSchema).min(1, "At least one reward is required"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startAt);
      const end = new Date(data.endAt);
      return start < end;
    },
    {
      message: "Start Date must be before End Date",
      path: ["startAt"],
    },
  )
  .refine(
    (data) => {
      const sorted = [...data.rewards].sort((a, b) => a.rankFrom - b.rankFrom);
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].rankTo >= sorted[i + 1].rankFrom) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Reward rank ranges must not overlap",
      path: ["rewards"],
    },
  );

type FormValues = z.infer<typeof formSchema>;

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
  completedAt?: any;
}

interface WaitlistRecord {
  id: string;
  name: string;
  mobile: string;
  instagram: string | null;
  timestamp: any;
}

interface CrushRecord {
  id: string;
  fromUserId?: string;
  toUserId?: string | null;
  targetPhone?: string;
  normalizedPhone?: string;
  targetName?: string;
  crushName?: string;
  status?: string;
  revealed?: boolean;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

interface MatchRecord {
  id: string;
  users?: string[];
  crushId?: string | null;
  user1Id?: string;
  user2Id?: string;
  status?: string;
  createdAt?: any;
  matchedAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

function AdminDashboardPage() {
  const { user, userData, logout } = useAuth();
  const navigate = useNavigate();

  // Selected tab state
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "crushes" | "matches" | "waitlist" | "contests"
  >("dashboard");

  // Real-time crushes and matches lists
  const [crushesList, setCrushesList] = useState<CrushRecord[]>([]);
  const [matchesList, setMatchesList] = useState<MatchRecord[]>([]);

  // Search & Filter states for crushes and matches
  const [crushesSearch, setCrushesSearch] = useState("");
  const [matchesSearch, setMatchesSearch] = useState("");
  const [crushesStatusFilter, setCrushesStatusFilter] = useState<string>("all");
  const [matchesStatusFilter, setMatchesStatusFilter] = useState<string>("all");

  // Raw data inspection modal state
  const [selectedRawDoc, setSelectedRawDoc] = useState<{
    type: "Crush" | "Match";
    data: Record<string, any>;
  } | null>(null);

  // Contests list states
  const [contests, setContests] = useState<ContestRecord[]>([]);
  const [loadingContests, setLoadingContests] = useState(true);

  // Dialog State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingContest, setEditingContest] = useState<ContestRecord | null>(null);

  const formatDateForInput = (timestamp: any) => {
    if (!timestamp) return "";
    const d = typeof timestamp.toDate === "function" ? timestamp.toDate() : new Date(timestamp);
    const pad = (num: number) => num.toString().padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Form Setup
  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contestCode: "",
      description: "",
      startAt: "",
      endAt: "",
      winnerType: undefined,
      rewards: [{ rankFrom: 1, rankTo: 1, reward: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rewards",
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      // Only check code existence if creating or changing code
      if (!editingContest || editingContest.contestCode !== data.contestCode) {
        const exists = await contestService.checkContestCodeExists(data.contestCode);
        if (exists) {
          setError("contestCode", {
            type: "manual",
            message: "This contest code is already taken.",
          });
          setIsSubmitting(false);
          return;
        }
      }

      if (editingContest) {
        await contestService.updateContest(
          editingContest.id,
          {
            name: data.name,
            contestCode: data.contestCode,
            description: data.description,
            winnerType: data.winnerType,
            startAt: new Date(data.startAt),
            endAt: new Date(data.endAt),
          },
          data.rewards,
        );
        toast.success("Contest updated successfully!");
      } else {
        await contestService.createContest(
          {
            name: data.name,
            contestCode: data.contestCode,
            description: data.description,
            winnerType: data.winnerType,
            startAt: new Date(data.startAt),
            endAt: new Date(data.endAt),
            createdBy: user.email || user.uid,
          },
          data.rewards,
        );
        toast.success("Contest created successfully!");
      }

      setIsCreateOpen(false);
      setEditingContest(null);
      reset();
    } catch (error) {
      console.error("Error saving contest:", error);
      toast.error("An error occurred while saving the contest.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWinnerTypeLabel = (type: string) => {
    switch (type) {
      case "referrals":
        return "Referral Count";
      case "points":
        return "Points System (Complete Registrations)";
      default:
        return type;
    }
  };

  const formatDate = (
    date: Date | string | number | { toDate?: () => Date } | null | undefined,
  ) => {
    if (!date) return "N/A";
    const hasToDate =
      typeof date === "object" &&
      date !== null &&
      "toDate" in date &&
      typeof (date as { toDate: unknown }).toDate === "function";
    const d = hasToDate
      ? (date as { toDate: () => Date }).toDate()
      : new Date(date as Date | string | number);
    return d.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

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
  const [selectedContestId, setSelectedContestId] = useState<string>("all");

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
      },
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
      },
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
      },
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
      },
    );

    // 5. Subscribe to contests collection
    const contestsColl = collection(db, "contests");
    const contestsQuery = query(contestsColl, orderBy("createdAt", "desc"));
    const unsubContests = onSnapshot(
      contestsQuery,
      (snapshot) => {
        const list: ContestRecord[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...(doc.data() as Omit<ContestRecord, "id">) });
        });
        setContests(list);
        setLoadingContests(false);
      },
      (error) => {
        console.error("Contests subscription error:", error);
        toast.error("Failed to sync contests list.");
        setLoadingContests(false);
      },
    );

    // 6. Subscribe to crushes collection
    const crushesColl = collection(db, "crushes");
    const unsubCrushes = onSnapshot(
      crushesColl,
      (snapshot) => {
        const list: CrushRecord[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...(doc.data() as Omit<CrushRecord, "id">) });
        });
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setCrushesList(list);
        setCrushesCount(list.length);
      },
      (error) => {
        console.error("Crushes subscription error:", error);
      },
    );

    // 7. Subscribe to matches collection
    const matchesColl = collection(db, "matches");
    const unsubMatches = onSnapshot(
      matchesColl,
      (snapshot) => {
        const list: MatchRecord[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...(doc.data() as Omit<MatchRecord, "id">) });
        });
        list.sort(
          (a, b) =>
            (b.createdAt?.seconds || b.matchedAt?.seconds || 0) -
            (a.createdAt?.seconds || a.matchedAt?.seconds || 0),
        );
        setMatchesList(list);
        setMatchesCount(list.length);
      },
      (error) => {
        console.error("Matches subscription error:", error);
      },
    );

    return () => {
      unsubAdmins();
      unsubUsers();
      unsubReferrals();
      unsubWaitlist();
      unsubContests();
      unsubCrushes();
      unsubMatches();
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
    if (
      !confirm(
        `Are you sure you want to permanently delete the admin record for ${targetEmail}? This will allow them to auto-provision a new request if they log in again.`,
      )
    )
      return;
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

  // Helper lookup: find user details by UID or phone number
  const findUserByUidOrPhone = (identifier?: string | null) => {
    if (!identifier) return null;
    const cleanIdentifier = identifier.trim().toLowerCase();
    return (
      appUsers.find((u) => {
        const uidMatches = u.uid && u.uid.toLowerCase() === cleanIdentifier;
        const phoneMatches =
          (u.phone && u.phone.toLowerCase() === cleanIdentifier) ||
          (u.phoneNumber && u.phoneNumber.toLowerCase() === cleanIdentifier) ||
          (u.normalizedPhone && u.normalizedPhone.toLowerCase() === cleanIdentifier);
        return uidMatches || phoneMatches;
      }) || null
    );
  };

  const copyToClipboard = (text: string, label: string = "ID") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Filtered crushes list based on search and status
  const filteredCrushes = crushesList.filter((c) => {
    const currentStatus = (c.status || "pending").toLowerCase();
    if (crushesStatusFilter !== "all" && currentStatus !== crushesStatusFilter) {
      return false;
    }

    const term = crushesSearch.toLowerCase().trim();
    if (!term) return true;

    const senderUser = findUserByUidOrPhone(c.fromUserId);
    const recipientUser = findUserByUidOrPhone(c.toUserId || c.normalizedPhone || c.targetPhone);

    return (
      (c.id || "").toLowerCase().includes(term) ||
      (c.fromUserId || "").toLowerCase().includes(term) ||
      (c.toUserId || "").toLowerCase().includes(term) ||
      (c.targetPhone || c.normalizedPhone || "").toLowerCase().includes(term) ||
      (c.targetName || c.crushName || "").toLowerCase().includes(term) ||
      currentStatus.includes(term) ||
      (senderUser?.name || "").toLowerCase().includes(term) ||
      (senderUser?.phone || senderUser?.phoneNumber || "").toLowerCase().includes(term) ||
      (senderUser?.email || "").toLowerCase().includes(term) ||
      (recipientUser?.name || "").toLowerCase().includes(term) ||
      (recipientUser?.phone || recipientUser?.phoneNumber || "").toLowerCase().includes(term)
    );
  });

  // Filtered matches list based on search and status
  const filteredMatches = matchesList.filter((m) => {
    const currentStatus = (m.status || "matched").toLowerCase();
    if (matchesStatusFilter !== "all" && currentStatus !== matchesStatusFilter) {
      return false;
    }

    const term = matchesSearch.toLowerCase().trim();
    if (!term) return true;

    const user1Id = m.users?.[0] || m.user1Id;
    const user2Id = m.users?.[1] || m.user2Id;
    const user1 = findUserByUidOrPhone(user1Id);
    const user2 = findUserByUidOrPhone(user2Id);

    return (
      (m.id || "").toLowerCase().includes(term) ||
      (m.crushId || "").toLowerCase().includes(term) ||
      currentStatus.includes(term) ||
      (m.users || []).some((uId: string) => uId.toLowerCase().includes(term)) ||
      (user1?.name || "").toLowerCase().includes(term) ||
      (user1?.phone || user1?.phoneNumber || "").toLowerCase().includes(term) ||
      (user1?.email || "").toLowerCase().includes(term) ||
      (user2?.name || "").toLowerCase().includes(term) ||
      (user2?.phone || user2?.phoneNumber || "").toLowerCase().includes(term) ||
      (user2?.email || "").toLowerCase().includes(term)
    );
  });

  // Helper lookup: find user's referrer name
  const findReferrerName = (code: string | null | undefined) => {
    if (!code) return "None";
    const found = appUsers.find((u) => u.referralCode === code);
    return found ? `${found.name} (${code})` : code;
  };

  // Helper to extract seconds from any Timestamp or Date format
  const getTimestampSeconds = (ts: any) => {
    if (!ts) return 0;
    if (typeof ts.seconds === "number") return ts.seconds;
    if (typeof ts.toDate === "function") return Math.floor(ts.toDate().getTime() / 1000);
    return Math.floor(new Date(ts).getTime() / 1000);
  };

  // Helper to check if a timestamp is within a specific contest timeframe
  const isWithinContestTimeframe = (ts: any, contest: ContestRecord | null | undefined) => {
    if (!contest) return true;
    const sec = getTimestampSeconds(ts);
    const startSec = getTimestampSeconds(contest.startAt);
    const endSec = getTimestampSeconds(contest.endAt);
    return sec >= startSec && sec <= endSec;
  };

  const selectedContest = contests.find((c) => c.id === selectedContestId);

  // Filter lists based on search and selected contest
  const filteredUsers = appUsers.filter((u) => {
    // 1. Contest Code Filter (users participate by entering the contest code at registration)
    if (selectedContest) {
      if (u.referredBy !== selectedContest.contestCode) {
        return false;
      }
    }

    // 2. Search term filter
    const term = userSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      (u.name || "").toLowerCase().includes(term) ||
      (u.phone || u.phoneNumber || u.normalizedPhone || "").toLowerCase().includes(term) ||
      (u.referralCode || "").toLowerCase().includes(term) ||
      (u.referredBy || "").toLowerCase().includes(term)
    );
  });

  // Sort filtered users dynamically based on selected metric and selected contest timeframe
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "date") {
      return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    }
    if (sortBy === "completed") {
      const countA = referrals.filter(
        (r) => r.referrerId === a.uid && isWithinContestTimeframe(r.createdAt || r.completedAt, selectedContest)
      ).length;
      const countB = referrals.filter(
        (r) => r.referrerId === b.uid && isWithinContestTimeframe(r.createdAt || r.completedAt, selectedContest)
      ).length;
      return countB - countA;
    }
    if (sortBy === "codes") {
      const countA = appUsers.filter(
        (u) => u.referredBy === a.referralCode && isWithinContestTimeframe(u.createdAt, selectedContest)
      ).length;
      const countB = appUsers.filter(
        (u) => u.referredBy === b.referralCode && isWithinContestTimeframe(u.createdAt, selectedContest)
      ).length;
      return countB - countA;
    }
    if (sortBy === "total") {
      const compA = referrals.filter(
        (r) => r.referrerId === a.uid && isWithinContestTimeframe(r.createdAt || r.completedAt, selectedContest)
      ).length;
      const codeA = appUsers.filter(
        (u) => u.referredBy === a.referralCode && isWithinContestTimeframe(u.createdAt, selectedContest)
      ).length;
      const compB = referrals.filter(
        (r) => r.referrerId === b.uid && isWithinContestTimeframe(r.createdAt || r.completedAt, selectedContest)
      ).length;
      const codeB = appUsers.filter(
        (u) => u.referredBy === b.referralCode && isWithinContestTimeframe(u.createdAt, selectedContest)
      ).length;
      return compB + codeB - (compA + codeA);
    }
    return 0;
  });

  // Find top referrer's UID for the visual crown highlight
  const getTopReferrerUid = () => {
    if (filteredUsers.length === 0) return null;
    let topUid: string | null = null;
    let maxVal = -1;

    filteredUsers.forEach((u) => {
      let val = 0;
      if (sortBy === "completed") {
        val = referrals.filter(
          (r) => r.referrerId === u.uid && isWithinContestTimeframe(r.createdAt || r.completedAt, selectedContest)
        ).length;
      } else if (sortBy === "codes") {
        val = appUsers.filter(
          (item) => item.referredBy === u.referralCode && isWithinContestTimeframe(item.createdAt, selectedContest)
        ).length;
      } else if (sortBy === "total") {
        const comp = referrals.filter(
          (r) => r.referrerId === u.uid && isWithinContestTimeframe(r.createdAt || r.completedAt, selectedContest)
        ).length;
        const code = appUsers.filter(
          (item) => item.referredBy === u.referralCode && isWithinContestTimeframe(item.createdAt, selectedContest)
        ).length;
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
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-[30rem] w-[30rem] rounded-full bg-primary/5 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/2 -right-40 h-[35rem] w-[35rem] rounded-full bg-primary/10 blur-[150px]"
        aria-hidden
      />

      {/* Header bar */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary animate-pulse-soft">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-medium tracking-tight">Secret Crush</h1>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Admin Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-muted-foreground md:inline-block">
              Logged in as: <span className="font-semibold text-foreground">{user?.email}</span>
            </span>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="h-8 gap-2 border border-border/50 text-xs"
            >
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
            onClick={() => setActiveTab("crushes")}
            className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "crushes"
                ? "bg-primary text-primary-foreground shadow"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70"
            }`}
          >
            <Heart className="h-3.5 w-3.5 fill-current" />
            Crushes Checklist ({crushesList.length})
          </button>
          <button
            onClick={() => setActiveTab("matches")}
            className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "matches"
                ? "bg-primary text-primary-foreground shadow"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70"
            }`}
          >
            <HeartHandshake className="h-3.5 w-3.5" />
            Confirmed Matches ({matchesList.length})
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
          <button
            onClick={() => setActiveTab("contests")}
            className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "contests"
                ? "bg-primary text-primary-foreground shadow"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70"
            }`}
          >
            Contests ({contests.length})
          </button>
        </div>

        {/* Tab 1: Dashboard Overview */}
        {activeTab === "dashboard" && (
          <div className="space-y-12 animate-fade-up">
            {/* Stats grid */}
            <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              <Card className="border-border/60 bg-card/60 shadow-[var(--shadow-card)] backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-sky-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">{appUsers.length}</div>
                  <p className="mt-1 text-[10px] text-muted-foreground">Registered on app</p>
                </CardContent>
              </Card>

              <Card
                onClick={() => setActiveTab("crushes")}
                className="border-border/60 bg-card/60 shadow-[var(--shadow-card)] backdrop-blur cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                    Crushes Added
                  </CardTitle>
                  <Heart className="h-4 w-4 text-primary fill-current" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">
                    {crushesCount !== null ? crushesCount.toLocaleString() : "..."}
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground flex items-center justify-between">
                    <span>Crushes sent secretly</span>
                    <span className="font-semibold text-primary">View &rarr;</span>
                  </p>
                </CardContent>
              </Card>

              <Card
                onClick={() => setActiveTab("matches")}
                className="border-border/60 bg-card/60 shadow-[var(--shadow-card)] backdrop-blur cursor-pointer hover:border-emerald-500/50 transition-all hover:shadow-md"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                    Matches Found
                  </CardTitle>
                  <HeartHandshake className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">
                    {matchesCount !== null ? matchesCount.toLocaleString() : "..."}
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground flex items-center justify-between">
                    <span>Mutual crushes matching</span>
                    <span className="font-semibold text-emerald-600">View &rarr;</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/60 shadow-[var(--shadow-card)] backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                    Total Referrals
                  </CardTitle>
                  <Share2 className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">{referrals.length}</div>
                  <p className="mt-1 text-[10px] text-muted-foreground">Completed referrals</p>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/60 shadow-[var(--shadow-card)] backdrop-blur relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                    Waitlist Size
                  </CardTitle>
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
                  <Badge
                    variant="secondary"
                    className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold ml-1"
                  >
                    {approvedAdmins.length}
                  </Badge>
                </div>

                <Card className="border-border/60 bg-card/40 p-5 shadow-[var(--shadow-card)] backdrop-blur-md rounded-2xl">
                  <div className="space-y-3">
                    {approvedAdmins.length === 0 ? (
                      <p className="text-center text-xs text-muted-foreground py-8">
                        No active administrators.
                      </p>
                    ) : (
                      approvedAdmins.map((item) => {
                        const initials = getInitials(item.email);
                        const bg = getAvatarBg(item.email);
                        const color = getAvatarTextColor(item.email);
                        return (
                          <div
                            key={item.uid}
                            className="flex items-center justify-between rounded-xl border border-border/40 bg-card/50 p-4 transition-all hover:bg-card/90 hover:shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-sm font-semibold shadow-inner"
                                style={{ backgroundColor: bg, color: color }}
                              >
                                {initials}
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="font-semibold text-foreground text-sm">
                                    {item.email}
                                  </span>
                                  {item.uid === user?.uid && (
                                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-[9px] font-bold uppercase tracking-wider py-0 px-1.5 border-none">
                                      You
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  Admin Account
                                </p>
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
                                <span className="text-[9px] font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Owner
                                </span>
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
                    <Badge
                      variant="secondary"
                      className="bg-amber-500/10 text-amber-700 border-amber-500/20 font-bold animate-pulse-soft"
                    >
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
                        <p className="text-xs text-muted-foreground mt-0.5">
                          No pending admin registration requests.
                        </p>
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
                          <div
                            key={item.uid}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 transition-all hover:bg-amber-500/10 hover:shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-sm font-semibold shadow-inner"
                                style={{ backgroundColor: bg, color: color }}
                              >
                                {initials}
                              </div>
                              <div>
                                <span className="font-semibold text-foreground text-sm">
                                  {item.email}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 text-[9px] font-bold uppercase tracking-wider py-0 px-1.5 border-none">
                                    Pending
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground">
                                    Requested: {dateStr}
                                  </span>
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
                          <span className="transition-transform group-open:rotate-180 text-[10px]">
                            ▼
                          </span>
                        </summary>
                        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                          {rejectedAdmins.map((item) => {
                            const initials = getInitials(item.email);
                            const bg = getAvatarBg(item.email);
                            const color = getAvatarTextColor(item.email);
                            return (
                              <div
                                key={item.uid}
                                className="flex items-center justify-between rounded-xl border border-red-500/10 bg-red-500/5 p-3 text-xs"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-serif text-xs font-semibold shadow-inner"
                                    style={{ backgroundColor: bg, color: color }}
                                  >
                                    {initials}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-foreground text-xs leading-none">
                                      {item.email}
                                    </p>
                                    <p className="text-[9px] text-muted-foreground mt-0.5">
                                      Rejected Request
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    onClick={async () => {
                                      setActionLoading(item.uid);
                                      try {
                                        await updateDoc(doc(db, "admins", item.uid), {
                                          status: "pending",
                                        });
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
                  <Badge
                    variant="secondary"
                    className="bg-sky-500/10 text-sky-600 border-sky-500/20 font-bold ml-2"
                  >
                    {selectedContest ? `${filteredUsers.length} Participants` : `${appUsers.length} Total`}
                  </Badge>
                </div>

                {/* Glassmorphic Search and Sort toolbar */}
                <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/45 p-4 shadow-[var(--shadow-card)] backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1 items-start sm:items-center max-w-2xl">
                    <div className="relative flex-1 w-full">
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

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-[10px] whitespace-nowrap">
                        Contest:
                      </span>
                      <Select value={selectedContestId} onValueChange={setSelectedContestId}>
                        <SelectTrigger className="h-10 w-full sm:w-[200px] bg-background/50 border-border/80 focus:border-primary rounded-xl text-xs">
                          <SelectValue placeholder="All Contests" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users / Contests</SelectItem>
                          {contests.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name} ({c.contestCode})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-[10px] whitespace-nowrap">
                      Sort By:
                    </span>
                    <div className="flex flex-wrap rounded-xl border border-border/80 bg-background/40 p-1 gap-1">
                      {[
                        { value: "date", label: "📅 Registration Date" },
                        { value: "completed", label: "🏆 Completed Referrals" },
                        { value: "codes", label: "🎟️ Codes Entered" },
                        { value: "total", label: "🌟 Total Invites" },
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
                            {userSearch
                              ? "No users match your search."
                              : "No registered users in the database."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedUsers.map((item) => {
                          const completedCount = referrals.filter(
                            (r) =>
                              r.referrerId === item.uid &&
                              isWithinContestTimeframe(r.createdAt || r.completedAt, selectedContest),
                          ).length;
                          const codeCount = appUsers.filter(
                            (u) =>
                              u.referredBy === item.referralCode &&
                              isWithinContestTimeframe(u.createdAt, selectedContest),
                          ).length;
                          const dateStr = item.createdAt?.seconds
                            ? new Date(item.createdAt.seconds * 1000).toLocaleDateString()
                            : "Unknown";
                          const phoneStr =
                            item.phone || item.phoneNumber || item.normalizedPhone || "No Phone";

                          return (
                            <TableRow
                              key={item.uid}
                              className="transition-all hover:bg-muted/30 border-b border-border/20"
                            >
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
                                  {item.email && (
                                    <p className="text-[10px] text-muted-foreground">
                                      {item.email}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-4">{item.age || "N/A"}</TableCell>
                              <TableCell className="py-4">
                                <Badge
                                  variant="outline"
                                  className="font-mono bg-background/50 uppercase text-xs py-0.5 border-border/80"
                                >
                                  {item.referralCode || "N/A"}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4 text-xs font-medium text-foreground/80">
                                {findReferrerName(item.referredBy)}
                              </TableCell>
                              <TableCell className="py-4 text-center font-bold text-sm">
                                <span
                                  className={
                                    completedCount > 0
                                      ? "text-emerald-600 font-semibold"
                                      : "text-muted-foreground"
                                  }
                                >
                                  {completedCount}
                                </span>
                              </TableCell>
                              <TableCell className="py-4 text-center font-bold text-sm">
                                <span
                                  className={
                                    codeCount > 0
                                      ? "text-primary font-semibold"
                                      : "text-muted-foreground"
                                  }
                                >
                                  {codeCount}
                                </span>
                              </TableCell>
                              <TableCell className="py-4 text-muted-foreground text-xs">
                                {dateStr}
                              </TableCell>
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

        {/* Tab 2: Crushes Checklist */}
        {activeTab === "crushes" && (
          <div className="space-y-6 animate-fade-up">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-primary fill-current" />
                  <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground">
                    Crushes Checklist
                  </h2>
                  <Badge variant="secondary" className="font-bold bg-primary/10 text-primary border-none">
                    {crushesList.length} Total
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Complete list of secret crush declarations submitted by app users. Inspect full document details for error tracking.
                </p>
              </div>

              {/* Quick stats mini-pills */}
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                  Pending: {crushesList.filter((c) => (c.status || "pending") === "pending").length}
                </Badge>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  Matched: {crushesList.filter((c) => c.status === "matched").length}
                </Badge>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                  Revealed: {crushesList.filter((c) => c.revealed === true).length}
                </Badge>
              </div>
            </div>

            {/* Filter and Search controls */}
            <Card className="border-border/60 bg-card/40 p-4 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by Crush ID, Sender Name/Phone/UID, Target Phone/Name..."
                    value={crushesSearch}
                    onChange={(e) => setCrushesSearch(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>
                <div className="w-full sm:w-48">
                  <Select value={crushesStatusFilter} onValueChange={setCrushesStatusFilter}>
                    <SelectTrigger className="text-xs h-9">
                      <div className="flex items-center gap-1.5">
                        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                        <SelectValue placeholder="Filter by status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="matched">Matched</SelectItem>
                      <SelectItem value="revealed">Revealed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Crushes Table */}
            <Card className="border-border/60 bg-card/60 shadow-[var(--shadow-card)] backdrop-blur">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-secondary/30">
                    <TableRow>
                      <TableHead className="text-[10px] uppercase font-bold tracking-wider">Crush ID</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold tracking-wider">Sender (From)</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold tracking-wider">Target (To)</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold tracking-wider">Status</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold tracking-wider">Revealed</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold tracking-wider">Date Sent</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold tracking-wider text-right">Raw Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCrushes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-xs text-muted-foreground">
                          {crushesSearch || crushesStatusFilter !== "all"
                            ? "No crushes match your search/filter criteria."
                            : "No crush entries found in database."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCrushes.map((crush) => {
                        const senderUser = findUserByUidOrPhone(crush.fromUserId);
                        const recipientUser = findUserByUidOrPhone(
                          crush.toUserId || crush.normalizedPhone || crush.targetPhone
                        );
                        const isMatched = crush.status === "matched";
                        const isRevealed = crush.revealed === true;

                        return (
                          <TableRow key={crush.id} className="hover:bg-secondary/20 transition-colors">
                            <TableCell className="font-mono text-[11px]">
                              <div className="flex items-center gap-1">
                                <span className="truncate max-w-[90px]" title={crush.id}>
                                  {crush.id}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                  onClick={() => copyToClipboard(crush.id, "Crush ID")}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              {senderUser ? (
                                <div>
                                  <p className="font-semibold text-xs text-foreground">{senderUser.name}</p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {senderUser.phone || senderUser.phoneNumber || senderUser.normalizedPhone || "No Phone"}
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <p className="font-mono text-xs text-muted-foreground truncate max-w-[120px]" title={crush.fromUserId}>
                                    UID: {crush.fromUserId || "Unknown"}
                                  </p>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-semibold text-xs text-foreground">
                                  {crush.targetName || crush.crushName || recipientUser?.name || "Secret Crush"}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-mono">
                                  {crush.targetPhone || crush.normalizedPhone || recipientUser?.phone || "No Phone"}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  isMatched
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold"
                                    : "bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold"
                                }
                              >
                                {crush.status || "pending"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  isRevealed
                                    ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                    : "bg-secondary text-muted-foreground"
                                }
                              >
                                {isRevealed ? "Yes (Revealed)" : "No (Hidden)"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {formatDate(crush.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs gap-1 text-primary hover:bg-primary/10"
                                onClick={() => setSelectedRawDoc({ type: "Crush", data: crush })}
                              >
                                <Eye className="h-3.5 w-3.5" />
                                Inspect
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
          </div>
        )}

        {/* Tab 3: Confirmed Matches Checklist */}
        {activeTab === "matches" && (
          <div className="space-y-6 animate-fade-up">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <HeartHandshake className="h-6 w-6 text-emerald-500" />
                  <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground">
                    Confirmed Matches Checklist
                  </h2>
                  <Badge variant="secondary" className="font-bold bg-emerald-500/10 text-emerald-600 border-none">
                    {matchesList.length} Total
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  List of mutual secret crush matches confirmed between app users. Inspect detailed parameters for error tracing.
                </p>
              </div>
            </div>

            {/* Filter and Search controls */}
            <Card className="border-border/60 bg-card/40 p-4 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by Match ID, User 1/User 2 Name, Phone, UID..."
                    value={matchesSearch}
                    onChange={(e) => setMatchesSearch(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>
                <div className="w-full sm:w-48">
                  <Select value={matchesStatusFilter} onValueChange={setMatchesStatusFilter}>
                    <SelectTrigger className="text-xs h-9">
                      <div className="flex items-center gap-1.5">
                        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                        <SelectValue placeholder="Filter by status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="matched">Matched</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Matches Table */}
            <Card className="border-border/60 bg-card/60 shadow-[var(--shadow-card)] backdrop-blur">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-secondary/30">
                    <TableRow>
                      <TableHead className="text-[10px] uppercase font-bold tracking-wider">Match ID</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold tracking-wider">Matched User Pair</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold tracking-wider">Linked Crush ID</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold tracking-wider">Status</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold tracking-wider">Matched Date</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold tracking-wider text-right">Raw Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMatches.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-xs text-muted-foreground">
                          {matchesSearch || matchesStatusFilter !== "all"
                            ? "No matches match your search/filter criteria."
                            : "No confirmed matches found in database."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMatches.map((match) => {
                        const user1Id = match.users?.[0] || match.user1Id;
                        const user2Id = match.users?.[1] || match.user2Id;
                        const user1 = findUserByUidOrPhone(user1Id);
                        const user2 = findUserByUidOrPhone(user2Id);

                        return (
                          <TableRow key={match.id} className="hover:bg-secondary/20 transition-colors">
                            <TableCell className="font-mono text-[11px]">
                              <div className="flex items-center gap-1">
                                <span className="truncate max-w-[90px]" title={match.id}>
                                  {match.id}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                  onClick={() => copyToClipboard(match.id, "Match ID")}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {/* User 1 */}
                                <div>
                                  <p className="font-semibold text-xs text-foreground">
                                    {user1?.name || "User 1"}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground font-mono">
                                    {user1?.phone || user1?.phoneNumber || user1Id || "N/A"}
                                  </p>
                                </div>
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                                  <Heart className="h-3.5 w-3.5 fill-current" />
                                </div>
                                {/* User 2 */}
                                <div>
                                  <p className="font-semibold text-xs text-foreground">
                                    {user2?.name || "User 2"}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground font-mono">
                                    {user2?.phone || user2?.phoneNumber || user2Id || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-[11px]">
                              {match.crushId ? (
                                <div className="flex items-center gap-1">
                                  <span className="truncate max-w-[80px]" title={match.crushId}>
                                    {match.crushId}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                                    onClick={() => copyToClipboard(match.crushId!, "Crush ID")}
                                  >
                                    <Copy className="h-2.5 w-2.5" />
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">None</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">
                                {match.status || "matched"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {formatDate(match.createdAt || match.matchedAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs gap-1 text-emerald-600 hover:bg-emerald-500/10"
                                onClick={() => setSelectedRawDoc({ type: "Match", data: match })}
                              >
                                <Eye className="h-3.5 w-3.5" />
                                Inspect
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
                        {waitlistSearch
                          ? "No waitlist members match your search."
                          : "No waitlist entries found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWaitlist.map((item) => {
                      const dateStr = item.timestamp?.seconds
                        ? new Date(item.timestamp.seconds * 1000).toLocaleDateString()
                        : "Unknown";
                      return (
                        <TableRow
                          key={item.id}
                          className="transition-all hover:bg-muted/30 border-b border-border/20"
                        >
                          <TableCell className="font-medium text-foreground pl-6 py-4">
                            {item.name}
                          </TableCell>
                          <TableCell className="py-4">{item.mobile}</TableCell>
                          <TableCell className="py-4">
                            {item.instagram ? (
                              <Badge
                                variant="secondary"
                                className="bg-pink-500/5 text-pink-600 border-pink-500/10 font-mono text-[10px]"
                              >
                                {item.instagram}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground py-4">
                            {dateStr}
                          </TableCell>
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

        {/* Tab 3: Contests */}
        {activeTab === "contests" && (
          <div className="space-y-4 animate-fade-up">
            {/* Section Title */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground">
                  Contest Management
                </h2>
              </div>
              {contests.length > 0 && (
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  variant="crush"
                  className="h-9 px-4 text-xs font-semibold uppercase tracking-wider"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Contest
                </Button>
              )}
            </div>

            {loadingContests ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">Loading contests...</p>
              </div>
            ) : contests.length === 0 ? (
              /* Empty State */
              <Card className="border-border/60 bg-card/45 p-12 shadow-[var(--shadow-card)] backdrop-blur-md rounded-2xl text-center flex flex-col items-center max-w-2xl mx-auto">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 animate-pulse-soft">
                  <Trophy className="h-8 w-8" />
                </div>
                <CardTitle className="font-serif text-2xl tracking-tight text-foreground mb-2">
                  No Contests Yet
                </CardTitle>
                <CardDescription className="max-w-md mb-6">
                  Create a new contest module where your users can participate, refer contacts, and
                  win premium rewards.
                </CardDescription>
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  variant="crush"
                  size="pill"
                  className="font-semibold uppercase tracking-wider"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create First Contest
                </Button>
              </Card>
            ) : (
              /* Contests List Table */
              <Card className="border-border/60 bg-card/60 shadow-[var(--shadow-card)] backdrop-blur overflow-hidden rounded-2xl">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-secondary/20">
                      <TableRow>
                        <TableHead className="py-4 pl-6">Contest Details</TableHead>
                        <TableHead className="py-4">Contest Code</TableHead>
                        <TableHead className="py-4">Winner Criteria</TableHead>
                        <TableHead className="py-4">Duration</TableHead>
                        <TableHead className="py-4 text-center">Participants</TableHead>
                        <TableHead className="py-4">Status</TableHead>
                        <TableHead className="py-4">Created By</TableHead>
                        <TableHead className="py-4 pr-6 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contests.map((item) => (
                        <TableRow
                          key={item.id}
                          className="transition-all hover:bg-muted/30 border-b border-border/20"
                        >
                          <TableCell className="py-4 pl-6 font-semibold text-foreground">
                            <div>
                              <p>{item.name}</p>
                              {item.description && (
                                <p className="text-[10px] text-muted-foreground font-normal line-clamp-1 mt-0.5">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge
                              variant="outline"
                              className="font-mono bg-background/50 uppercase text-xs py-0.5 border-border/80"
                            >
                              {item.contestCode}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 text-xs font-medium text-foreground/80">
                            {getWinnerTypeLabel(item.winnerType)}
                          </TableCell>
                          <TableCell className="py-4 text-xs text-muted-foreground">
                            <div className="space-y-0.5">
                              <p>
                                <span className="text-[10px] uppercase font-bold text-foreground">
                                  Start:
                                </span>{" "}
                                {formatDate(item.startAt)}
                              </p>
                              <p>
                                <span className="text-[10px] uppercase font-bold text-foreground">
                                  End:
                                </span>{" "}
                                {formatDate(item.endAt)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 text-center font-bold text-sm text-muted-foreground">
                            {item.participantCount ?? 0}
                          </TableCell>
                          <TableCell className="py-4">
                            <Select
                              defaultValue={item.status || "Draft"}
                              onValueChange={async (newStatus) => {
                                try {
                                  await updateDoc(doc(db, "contests", item.id), {
                                    status: newStatus,
                                    updatedAt: Timestamp.now(),
                                  });
                                  toast.success("Contest status updated successfully!");
                                } catch (e) {
                                  console.error(e);
                                  toast.error("Failed to update status.");
                                }
                              }}
                            >
                              <SelectTrigger className="h-7 w-[110px] text-[10px] font-bold uppercase tracking-wider bg-background/50 border-border/60 hover:bg-background/80 transition-colors">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem
                                  value="Draft"
                                  className="text-[10px] uppercase font-semibold"
                                >
                                  Draft
                                </SelectItem>
                                <SelectItem
                                  value="Active"
                                  className="text-[10px] uppercase font-semibold"
                                >
                                  Active
                                </SelectItem>
                                <SelectItem
                                  value="Completed"
                                  className="text-[10px] uppercase font-semibold"
                                >
                                  Completed
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="py-4 text-xs text-muted-foreground">
                            {item.createdBy}
                          </TableCell>
                          <TableCell className="py-4 pr-6 text-right">
                            <Button
                              onClick={async () => {
                                try {
                                  // Fetch rewards subcollection
                                  const rewardsColl = collection(
                                    db,
                                    "contests",
                                    item.id,
                                    "rewards",
                                  );
                                  const snapshot = await getDocs(rewardsColl);
                                  const rewardsList: RewardInput[] = [];
                                  snapshot.forEach((doc) => {
                                    rewardsList.push(doc.data() as RewardInput);
                                  });
                                  rewardsList.sort((a, b) => a.rankFrom - b.rankFrom);

                                  setEditingContest(item);
                                  reset({
                                    name: item.name,
                                    contestCode: item.contestCode,
                                    description: item.description || "",
                                    startAt: formatDateForInput(item.startAt),
                                    endAt: formatDateForInput(item.endAt),
                                    winnerType: item.winnerType,
                                    rewards:
                                      rewardsList.length > 0
                                        ? rewardsList
                                        : [{ rankFrom: 1, rankTo: 1, reward: "" }],
                                  });
                                  setIsCreateOpen(true);
                                } catch (error) {
                                  console.error("Error loading rewards:", error);
                                  toast.error("Failed to load contest rewards.");
                                }
                              }}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Referral History Dialog */}
      <Dialog
        open={!!selectedUserForReferral}
        onOpenChange={(open) => !open && setSelectedUserForReferral(null)}
      >
        <DialogContent className="max-w-2xl border-border/60 bg-card/95 shadow-[var(--shadow-card)] backdrop-blur-xl max-h-[85vh] overflow-y-auto">
          {selectedUserForReferral &&
            (() => {
              // Find who referred this user
              const referrerInfo = findReferrerName(selectedUserForReferral.referredBy);

              // Gather all referee UIDs from both sources
              const refereeUids = new Set<string>();
              appUsers.forEach((u) => {
                if (
                  u.referredBy &&
                  u.referredBy === selectedUserForReferral.referralCode &&
                  isWithinContestTimeframe(u.createdAt, selectedContest)
                ) {
                  refereeUids.add(u.uid);
                }
              });
              referrals.forEach((r) => {
                if (
                  r.referrerId === selectedUserForReferral.uid &&
                  isWithinContestTimeframe(r.createdAt || r.completedAt, selectedContest)
                ) {
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
                      Referrals and history for{" "}
                      <span className="font-semibold text-foreground">
                        {selectedUserForReferral.name || "N/A"}
                      </span>
                    </DialogDescription>
                  </DialogHeader>

                  {/* Profile info block */}
                  <div className="grid gap-4 rounded-2xl border border-border/40 bg-secondary/20 p-4 text-sm sm:grid-cols-2 mt-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        User Name
                      </p>
                      <p className="font-semibold text-foreground">
                        {selectedUserForReferral.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Contact
                      </p>
                      <p className="font-semibold text-foreground">
                        {selectedUserForReferral.phone ||
                          selectedUserForReferral.phoneNumber ||
                          selectedUserForReferral.normalizedPhone ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Their Referral Code
                      </p>
                      <Badge
                        variant="outline"
                        className="font-mono bg-background/50 font-semibold uppercase mt-0.5"
                      >
                        {selectedUserForReferral.referralCode || "N/A"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Referred By
                      </p>
                      <p className="font-semibold text-foreground mt-0.5">{referrerInfo}</p>
                    </div>
                  </div>

                  {/* Referral stats */}
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                      <p className="text-2xl font-bold text-emerald-600">
                        {
                          referrals.filter(
                            (r) =>
                              r.referrerId === selectedUserForReferral.uid &&
                              isWithinContestTimeframe(r.createdAt || r.completedAt, selectedContest),
                          ).length
                        }
                      </p>
                      <p className="text-[10px] uppercase font-semibold tracking-wider text-emerald-700">
                        Completed Referrals
                      </p>
                    </div>
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
                      <p className="text-2xl font-bold text-primary">
                        {
                          appUsers.filter(
                            (u) =>
                              u.referredBy === selectedUserForReferral.referralCode &&
                              isWithinContestTimeframe(u.createdAt, selectedContest),
                          ).length
                        }
                      </p>
                      <p className="text-[10px] uppercase font-semibold tracking-wider text-primary">
                        Codes Entered
                      </p>
                    </div>
                  </div>

                  {/* Referees Table */}
                  <div className="space-y-2 mt-4">
                    <h4 className="font-serif text-lg font-medium text-foreground">
                      Referred Users History
                    </h4>
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
                              <TableCell
                                colSpan={3}
                                className="h-24 text-center text-xs text-muted-foreground"
                              >
                                No referral history found for this user.
                              </TableCell>
                            </TableRow>
                          ) : (
                            refereeList.map((referee) => {
                              const isCompleted = referrals.some(
                                (r) =>
                                  r.referrerId === selectedUserForReferral.uid &&
                                  r.refereeId === referee.uid,
                              );
                              const refereePhone =
                                referee.phone ||
                                referee.phoneNumber ||
                                referee.normalizedPhone ||
                                "No Phone";
                              const joinedDateStr = referee.createdAt?.seconds
                                ? new Date(referee.createdAt.seconds * 1000).toLocaleDateString()
                                : "Unknown";

                              return (
                                <TableRow key={referee.uid} className="hover:bg-muted/10 text-xs">
                                  <TableCell>
                                    <div>
                                      <p className="font-semibold text-foreground">
                                        {referee.name}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground">
                                        {refereePhone}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {isCompleted ? (
                                      <Badge
                                        variant="secondary"
                                        className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] uppercase font-bold py-0"
                                      >
                                        Completed
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="secondary"
                                        className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] uppercase font-bold py-0"
                                      >
                                        Code Entered
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right text-muted-foreground">
                                    {joinedDateStr}
                                  </TableCell>
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

      {/* Create / Edit Contest Dialog */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingContest(null);
            reset();
          }
        }}
      >
        <DialogContent className="max-w-3xl border-border/60 bg-card/95 shadow-[var(--shadow-card)] backdrop-blur-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5 fill-current" />
              <DialogTitle className="font-serif text-2xl tracking-tight">
                {editingContest ? "Edit Contest" : "Create New Contest"}
              </DialogTitle>
            </div>
            <DialogDescription>
              {editingContest
                ? "Update the contest code, description, rules, date range, and rewards."
                : "Set up a contest with unique code, date range, rules, and rank rewards."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase font-bold tracking-widest text-primary border-b border-border/40 pb-1">
                Basic Information
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Contest Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="E.g., Valentine's Day Special"
                    {...register("name")}
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contestCode">
                    Contest Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contestCode"
                    placeholder="E.g., LOVE2026"
                    {...register("contestCode")}
                    className={errors.contestCode ? "border-destructive" : ""}
                  />
                  {errors.contestCode && (
                    <p className="text-xs text-destructive mt-1">{errors.contestCode.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the rules, details, or highlights of this contest..."
                  rows={2}
                  {...register("description")}
                />
              </div>
            </div>

            {/* Contest Duration & Rules */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase font-bold tracking-widest text-primary border-b border-border/40 pb-1">
                Contest Rules & Duration
              </h3>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="startAt">
                    Start Date & Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="startAt"
                    type="datetime-local"
                    {...register("startAt")}
                    className={errors.startAt ? "border-destructive" : ""}
                  />
                  {errors.startAt && (
                    <p className="text-xs text-destructive mt-1">{errors.startAt.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endAt">
                    End Date & Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="endAt"
                    type="datetime-local"
                    {...register("endAt")}
                    className={errors.endAt ? "border-destructive" : ""}
                  />
                  {errors.endAt && (
                    <p className="text-xs text-destructive mt-1">{errors.endAt.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Winner Criteria <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="winnerType"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={errors.winnerType ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select Criteria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="referrals">Referral Count</SelectItem>
                          <SelectItem value="points">
                            Points System (Complete Registrations)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.winnerType ? (
                    <p className="text-xs text-destructive mt-1">{errors.winnerType.message}</p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                      Points are based on referred users completing registration (name, age, phone,
                      email, Instagram). New users entering the referral code on the first page
                      receive 1.5% better points than existing users.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Rewards Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-1">
                <h3 className="text-xs uppercase font-bold tracking-widest text-primary">
                  Rewards Structure
                </h3>
                <Button
                  type="button"
                  variant="softOutline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    const lastRow = fields[fields.length - 1];
                    const nextRank = lastRow ? Number(lastRow.rankTo) + 1 : 1;
                    append({ rankFrom: nextRank, rankTo: nextRank, reward: "" });
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Reward Row
                </Button>
              </div>

              {/* Table wrapper */}
              <div className="rounded-xl border border-border/40 bg-secondary/10 p-4">
                <div className="space-y-2.5">
                  <div className="grid grid-cols-[100px_100px_1fr_40px] gap-3 text-[10px] uppercase font-bold text-muted-foreground px-2">
                    <div>Rank From</div>
                    <div>Rank To</div>
                    <div>Reward</div>
                    <div className="text-center">Action</div>
                  </div>

                  {fields.map((item, index) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[100px_100px_1fr_40px] gap-3 items-start"
                    >
                      <div>
                        <Input
                          type="number"
                          min={1}
                          placeholder="From"
                          {...register(`rewards.${index}.rankFrom` as const, {
                            valueAsNumber: true,
                          })}
                          className={
                            errors.rewards?.[index]?.rankFrom
                              ? "border-destructive text-center"
                              : "text-center"
                          }
                        />
                        {errors.rewards?.[index]?.rankFrom && (
                          <p className="text-[10px] text-destructive mt-1">
                            {errors.rewards[index].rankFrom?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Input
                          type="number"
                          min={1}
                          placeholder="To"
                          {...register(`rewards.${index}.rankTo` as const, { valueAsNumber: true })}
                          className={
                            errors.rewards?.[index]?.rankTo
                              ? "border-destructive text-center"
                              : "text-center"
                          }
                        />
                        {errors.rewards?.[index]?.rankTo && (
                          <p className="text-[10px] text-destructive mt-1">
                            {errors.rewards[index].rankTo?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Input
                          placeholder="E.g., ₹10,000 / Gift Voucher"
                          {...register(`rewards.${index}.reward` as const)}
                          className={errors.rewards?.[index]?.reward ? "border-destructive" : ""}
                        />
                        {errors.rewards?.[index]?.reward && (
                          <p className="text-[10px] text-destructive mt-1">
                            {errors.rewards[index].reward?.message}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-center pt-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 text-red-500 hover:bg-red-500/10 rounded-lg p-0"
                          disabled={fields.length <= 1}
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {errors.rewards && !Array.isArray(errors.rewards) && (
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg p-2.5">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>
                      {errors.rewards.message ||
                        (
                          errors.rewards as unknown as {
                            root?: { message?: string };
                          }
                        ).root?.message}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingContest(null);
                  reset();
                }}
                disabled={isSubmitting}
                className="text-xs font-semibold uppercase tracking-wider"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="crush"
                disabled={isSubmitting}
                className="text-xs font-semibold uppercase tracking-wider"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingContest ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {editingContest ? "Save Changes" : "Save & Create Contest"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Raw Data Document Inspector Dialog */}
      <Dialog open={selectedRawDoc !== null} onOpenChange={(open) => !open && setSelectedRawDoc(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border-border/60 bg-card/95 backdrop-blur-xl">
          {selectedRawDoc && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between pr-6">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-5 w-5 text-primary" />
                    <DialogTitle className="text-lg font-serif">
                      {selectedRawDoc.type} Document Details
                    </DialogTitle>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    ID: {selectedRawDoc.data.id}
                  </Badge>
                </div>
                <DialogDescription className="text-xs">
                  Complete document breakdown and raw JSON payload for error diagnosis and update tracking.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                {/* Formatted Field Summary */}
                <div className="rounded-xl border border-border/40 bg-secondary/15 p-4 space-y-2.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Parsed Document Fields
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {Object.entries(selectedRawDoc.data).map(([key, val]) => {
                      let displayVal = "";
                      if (val === null || val === undefined) displayVal = "null";
                      else if (typeof val === "object" && val !== null && "seconds" in val) {
                        displayVal = formatDate(val);
                      } else if (typeof val === "object") {
                        displayVal = JSON.stringify(val);
                      } else {
                        displayVal = String(val);
                      }

                      return (
                        <div key={key} className="bg-card/60 p-2.5 rounded-lg border border-border/30">
                          <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                            {key}
                          </span>
                          <span className="font-semibold font-mono text-xs break-all text-foreground">
                            {displayVal}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Raw JSON Block */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Raw JSON Output
                    </span>
                    <Button
                      variant="softOutline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(selectedRawDoc.data, null, 2),
                          `${selectedRawDoc.type} JSON`
                        )
                      }
                    >
                      <Copy className="h-3 w-3" />
                      Copy JSON
                    </Button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-border/50 max-h-60">
                    {JSON.stringify(selectedRawDoc.data, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
