import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  writeBatch,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

export interface RewardInput {
  rankFrom: number;
  rankTo: number;
  reward: string;
}

export interface ContestInput {
  name: string;
  contestCode: string;
  description: string;
  winnerType: "referrals" | "points";
  startAt: Date;
  endAt: Date;
  createdBy: string;
}

export interface ContestRecord {
  id: string;
  name: string;
  contestCode: string;
  description: string;
  status: "Draft";
  winnerType: "referrals" | "points";
  startAt: Timestamp;
  endAt: Timestamp;
  participantCount: number;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const contestService = {
  /**
   * Check if a contest with the given code already exists.
   */
  async checkContestCodeExists(contestCode: string): Promise<boolean> {
    const q = query(collection(db, "contests"), where("contestCode", "==", contestCode.trim()));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  },

  /**
   * Create a new contest and its rewards in a single transaction/batch write.
   */
  async createContest(contestInput: ContestInput, rewardsInput: RewardInput[]): Promise<string> {
    const batch = writeBatch(db);

    // Generate a new document reference with an auto-generated ID
    const contestDocRef = doc(collection(db, "contests"));
    const contestId = contestDocRef.id;

    // Set contest document
    batch.set(contestDocRef, {
      name: contestInput.name.trim(),
      contestCode: contestInput.contestCode.trim(),
      description: contestInput.description.trim(),
      status: "Draft",
      winnerType: contestInput.winnerType,
      startAt: Timestamp.fromDate(contestInput.startAt),
      endAt: Timestamp.fromDate(contestInput.endAt),
      participantCount: 0,
      createdBy: contestInput.createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Set reward subcollection documents
    rewardsInput.forEach((r) => {
      const rewardDocRef = doc(collection(db, `contests/${contestId}/rewards`));
      batch.set(rewardDocRef, {
        rankFrom: Number(r.rankFrom),
        rankTo: Number(r.rankTo),
        reward: r.reward.trim(),
      });
    });

    await batch.commit();
    return contestId;
  },

  /**
   * Update an existing contest and its rewards subcollection atomically.
   */
  updateContest: async (
    contestId: string,
    contestInput: Omit<ContestInput, "createdBy">,
    rewardsInput: RewardInput[],
  ): Promise<void> => {
    const contestRef = doc(db, "contests", contestId);
    const rewardsRef = collection(db, `contests/${contestId}/rewards`);
    const rewardsSnap = await getDocs(rewardsRef);

    const batch = writeBatch(db);

    // Delete existing rewards first
    rewardsSnap.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Update contest document
    batch.update(contestRef, {
      name: contestInput.name.trim(),
      contestCode: contestInput.contestCode.trim(),
      description: contestInput.description.trim(),
      winnerType: contestInput.winnerType,
      startAt: Timestamp.fromDate(contestInput.startAt),
      endAt: Timestamp.fromDate(contestInput.endAt),
      updatedAt: serverTimestamp(),
    });

    // Add updated rewards
    rewardsInput.forEach((r) => {
      const rewardDocRef = doc(collection(db, `contests/${contestId}/rewards`));
      batch.set(rewardDocRef, {
        rankFrom: Number(r.rankFrom),
        rankTo: Number(r.rankTo),
        reward: r.reward.trim(),
      });
    });

    await batch.commit();
  },
};
