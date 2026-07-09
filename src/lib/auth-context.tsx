import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { doc, onSnapshot, collection, query, limit, getDoc, getDocs, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface UserData {
  uid: string;
  email: string;
  role: "admin" | "pending";
  status: "approved" | "pending" | "rejected";
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This listener only runs on the client
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userDocRef = doc(db, "admins", firebaseUser.uid);
        
        // Listen to real-time changes to the user document
        const unsubscribeDoc = onSnapshot(
          userDocRef,
          async (docSnap) => {
            if (docSnap.exists()) {
              setUserData(docSnap.data() as UserData);
              setLoading(false);
            } else {
              // The user document does not exist yet. Let's auto-provision it.
              try {
                const configRef = doc(db, "metadata", "config");
                const configSnap = await getDoc(configRef);
                const isFirstUser = !configSnap.exists();

                const newUserData: UserData = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || "",
                  role: isFirstUser ? "admin" : "pending",
                  status: isFirstUser ? "approved" : "pending",
                  createdAt: serverTimestamp(),
                };

                // Create the user document in Firestore
                await setDoc(userDocRef, newUserData);

                // If it is the first user, also create the system configuration document
                if (isFirstUser) {
                  const configRef = doc(db, "metadata", "config");
                  await setDoc(configRef, {
                    firstAdminUid: firebaseUser.uid,
                    adminCreated: true,
                    createdAt: serverTimestamp(),
                  });
                }

                setUserData(newUserData);
              } catch (error) {
                console.error("Error auto-provisioning user document:", error);
              } finally {
                setLoading(false);
              }
            }
          },
          (error) => {
            console.error("Error listening to user document:", error);
            setLoading(false);
          }
        );

        return () => {
          unsubscribeDoc();
        };
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
