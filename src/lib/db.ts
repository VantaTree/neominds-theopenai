import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit as fsLimit,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import type { User as FirebaseUser } from "firebase/auth";
import {
  users as initialUsers,
  projects as initialProjects,
} from "./mock-data";
import type { User, Project } from "./mock-data";
import type {
  Profile,
  Plan,
  Subscription,
  Report,
  AuditLogEntry,
  AdminConfig,
} from "./types";

// Fallback Local Storage Keys
const LS_USERS = "growconsult_users";
const LS_PROJECTS = "growconsult_projects";
const LS_PAYMENTS = "growconsult_payments";
const LS_SETTINGS = "growconsult_settings";

// Helper to initialize local storage mock data
const initLocalStorage = () => {
  if (typeof window !== "undefined") {
    if (!localStorage.getItem(LS_USERS)) {
      localStorage.setItem(LS_USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(LS_PROJECTS)) {
      localStorage.setItem(LS_PROJECTS, JSON.stringify([]));
    }
    // Set initial settings if empty
    if (!localStorage.getItem(LS_SETTINGS)) {
      localStorage.setItem(
        LS_SETTINGS,
        JSON.stringify({
          emailNotif: true,
          smsNotif: false,
          auditNotif: true,
          weeklyNotif: true,
        }),
      );
    }
  }
};

initLocalStorage();

// ==================== USERS REPOSITORY ====================

export const getUsers = async (): Promise<User[]> => {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, "users"));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as User);
    } catch (e) {
      console.error(
        "Firebase getUsers failed, using local storage fallback",
        e,
      );
    }
  }
  return JSON.parse(localStorage.getItem(LS_USERS) || "[]");
};

export const getUser = async (userId: string): Promise<User | null> => {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, "users", userId));
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as User) : null;
    } catch (e) {
      console.error("Firebase getUser failed", e);
    }
  }
  const users = await getUsers();
  return users.find((u) => u.id === userId) || null;
};

export const saveUser = async (user: User): Promise<void> => {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "users", user.id), user);
      return;
    } catch (e) {
      console.error("Firebase saveUser failed", e);
    }
  }
  const users = await getUsers();
  const index = users.findIndex((u) => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(LS_USERS, JSON.stringify(users));
};

export const deleteUser = async (userId: string): Promise<void> => {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "users", userId));
      return;
    } catch (e) {
      console.error("Firebase deleteUser failed", e);
    }
  }
  const users = await getUsers();
  const filtered = users.filter((u) => u.id !== userId);
  localStorage.setItem(LS_USERS, JSON.stringify(filtered));
};

// ==================== PROJECTS REPOSITORY ====================

export const getProjects = async (): Promise<Project[]> => {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, "projects"));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Project);
    } catch (e) {
      console.error(
        "Firebase getProjects failed, using local storage fallback",
        e,
      );
    }
  }
  return JSON.parse(localStorage.getItem(LS_PROJECTS) || "[]");
};

export const saveProject = async (project: Project): Promise<void> => {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "projects", project.id), project);
      return;
    } catch (e) {
      console.error("Firebase saveProject failed", e);
    }
  }
  const projects = await getProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }
  localStorage.setItem(LS_PROJECTS, JSON.stringify(projects));
};

export const deleteProject = async (projectId: string): Promise<void> => {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "projects", projectId));
      return;
    } catch (e) {
      console.error("Firebase deleteProject failed", e);
    }
  }
  const projects = await getProjects();
  const filtered = projects.filter((p) => p.id !== projectId);
  localStorage.setItem(LS_PROJECTS, JSON.stringify(filtered));
};

// ==================== PAYMENTS REPOSITORY ====================

export const getPayments = async (): Promise<any[]> => {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, "payments"));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error(
        "Firebase getPayments failed, using local storage fallback",
        e,
      );
    }
  }

  // Initialize mock payments list on first load
  const cached = localStorage.getItem(LS_PAYMENTS);
  if (cached) return JSON.parse(cached);

  return []; // caller will fall back to their initial state or we can set initial data
};

export const savePayments = async (payments: any[]): Promise<void> => {
  if (isFirebaseConfigured && db) {
    try {
      // For simplicity, save batch or update single
      for (const p of payments) {
        await setDoc(doc(db, "payments", String(p.id)), p);
      }
      return;
    } catch (e) {
      console.error("Firebase savePayments failed", e);
    }
  }
  localStorage.setItem(LS_PAYMENTS, JSON.stringify(payments));
};

// ==================== SETTINGS REPOSITORY ====================

export interface NotificationSettings {
  emailNotif: boolean;
  smsNotif: boolean;
  auditNotif: boolean;
  weeklyNotif: boolean;
}

export const getNotificationSettings =
  async (): Promise<NotificationSettings> => {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, "adminSettings", "notifications"));
        if (snap.exists()) {
          return snap.data() as NotificationSettings;
        }
      } catch (e) {
        console.error("Firebase getNotificationSettings failed", e);
      }
    }
    return JSON.parse(
      localStorage.getItem(LS_SETTINGS) ||
        '{"emailNotif":true,"smsNotif":false,"auditNotif":true,"weeklyNotif":true}',
    );
  };

export const saveNotificationSettings = async (
  settings: NotificationSettings,
): Promise<void> => {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "adminSettings", "notifications"), settings);
      return;
    } catch (e) {
      console.error("Firebase saveNotificationSettings failed", e);
    }
  }
  localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
};

// ==================== PROFILES REPOSITORY ====================

const LS_PROFILES = "growconsult_profiles";

export const getProfile = async (uid: string): Promise<Profile | null> => {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, "profiles", uid));
      return snap.exists()
        ? ({ uid: snap.id, ...snap.data() } as Profile)
        : null;
    } catch (e) {
      console.error("Firebase getProfile failed", e);
    }
  }
  const all: Profile[] = JSON.parse(localStorage.getItem(LS_PROFILES) || "[]");
  return all.find((p) => p.uid === uid) || null;
};

export const saveProfile = async (
  uid: string,
  data: Partial<Profile>,
): Promise<void> => {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "profiles", uid), { uid, ...data }, { merge: true });
      return;
    } catch (e) {
      console.error("Firebase saveProfile failed", e);
    }
  }
  const all: Profile[] = JSON.parse(localStorage.getItem(LS_PROFILES) || "[]");
  const idx = all.findIndex((p) => p.uid === uid);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...data };
  } else {
    all.push({ uid, ...data } as Profile);
  }
  localStorage.setItem(LS_PROFILES, JSON.stringify(all));
};

// ==================== PLANS REPOSITORY ====================

const LS_PLANS = "growconsult_plans";

const DEFAULT_PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic Plan",
    tagline: "Essential assets to kickstart your business presence.",
    priceMonthly: 29,
    priceYearly: 23,
    billedYearly: 276,
    features: [
      "Website (Template)",
      "3 Posts + 1 Reel per month",
      "AI Chatbot + Voice support",
      "Basic SEO optimization",
      "Google Business Profile setup",
    ],
    maxReports: 5,
    maxStorageGb: 2,
    supportLevel: "basic",
    active: true,
  },
  {
    id: "plus",
    name: "Plus Plan",
    tagline: "Designed for expanding businesses seeking growth.",
    priceMonthly: 59,
    priceYearly: 47,
    billedYearly: 564,
    features: [
      "Website (Customized layout)",
      "5 Posts + 2 Reels per month",
      "AI Voicebot integration",
      "Advanced SEO optimization",
      "Email marketing campaigns",
      "Includes all Basic features",
    ],
    maxReports: 20,
    maxStorageGb: 10,
    supportLevel: "priority",
    active: true,
  },
  {
    id: "pro",
    name: "Pro Plan",
    tagline: "Ultimate features for scaling market leaders.",
    priceMonthly: 89,
    priceYearly: 71,
    billedYearly: 852,
    features: [
      "Modern 3D Website design",
      "7 Posts + 3 Reels per month",
      "AI Voice + Chatbot agents",
      "Deep performance analytics",
      "Paid Ads (Google & Meta)",
      "All Social Media Optimization",
      "SEO + GEO + AEO optimization",
      "Includes all Plus features",
    ],
    maxReports: 100,
    maxStorageGb: 50,
    supportLevel: "dedicated",
    active: true,
  },
];

export const getPlans = async (): Promise<Plan[]> => {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, "plans"));
      if (snap.docs.length > 0)
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Plan);
    } catch (e) {
      console.error("Firebase getPlans failed", e);
    }
  }
  const cached = localStorage.getItem(LS_PLANS);
  if (cached) return JSON.parse(cached);
  localStorage.setItem(LS_PLANS, JSON.stringify(DEFAULT_PLANS));
  return DEFAULT_PLANS;
};

export const savePlan = async (plan: Plan): Promise<void> => {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "plans", plan.id), plan);
      return;
    } catch (e) {
      console.error("Firebase savePlan failed", e);
    }
  }
  const plans = await getPlans();
  const idx = plans.findIndex((p) => p.id === plan.id);
  if (idx >= 0) {
    plans[idx] = plan;
  } else {
    plans.push(plan);
  }
  localStorage.setItem(LS_PLANS, JSON.stringify(plans));
};

export const deletePlan = async (planId: string): Promise<void> => {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "plans", planId));
      return;
    } catch (e) {
      console.error("Firebase deletePlan failed", e);
    }
  }
  const plans = await getPlans();
  localStorage.setItem(
    LS_PLANS,
    JSON.stringify(plans.filter((p) => p.id !== planId)),
  );
};

// ==================== SUBSCRIPTIONS REPOSITORY ====================

const LS_SUBS = "growconsult_subscriptions";

export const getSubscriptions = async (): Promise<Subscription[]> => {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, "subscriptions"));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Subscription);
    } catch (e) {
      console.error("Firebase getSubscriptions failed", e);
    }
  }
  return JSON.parse(localStorage.getItem(LS_SUBS) || "[]");
};

export const getUserSubscription = async (
  uid: string,
): Promise<Subscription | null> => {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, "subscriptions"),
        where("uid", "==", uid),
        where("status", "==", "active"),
      );
      const snap = await getDocs(q);
      return snap.empty
        ? null
        : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as Subscription);
    } catch (e) {
      console.error("Firebase getUserSubscription failed", e);
    }
  }
  const all: Subscription[] = JSON.parse(localStorage.getItem(LS_SUBS) || "[]");
  return all.find((s) => s.uid === uid && s.status === "active") || null;
};

export const saveSubscription = async (sub: Subscription): Promise<void> => {
  const id = sub.id || `sub_${Date.now()}`;
  const withId = { ...sub, id };
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "subscriptions", id), withId);
      return;
    } catch (e) {
      console.error("Firebase saveSubscription failed", e);
    }
  }
  const all: Subscription[] = JSON.parse(localStorage.getItem(LS_SUBS) || "[]");
  const idx = all.findIndex((s) => s.id === id);
  if (idx >= 0) {
    all[idx] = withId;
  } else {
    all.push(withId);
  }
  localStorage.setItem(LS_SUBS, JSON.stringify(all));
};

// ==================== REPORTS REPOSITORY ====================

const LS_REPORTS = "growconsult_reports";

export const getReports = async (): Promise<Report[]> => {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, "reports"));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Report);
    } catch (e) {
      console.error("Firebase getReports failed", e);
    }
  }
  return JSON.parse(localStorage.getItem(LS_REPORTS) || "[]");
};

export const getReportsByUser = async (uid: string): Promise<Report[]> => {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "reports"), where("uid", "==", uid));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Report);
    } catch (e) {
      console.error("Firebase getReportsByUser failed", e);
    }
  }
  const all: Report[] = JSON.parse(localStorage.getItem(LS_REPORTS) || "[]");
  return all.filter((r) => r.uid === uid);
};

export const saveReport = async (report: Report): Promise<void> => {
  const id = report.id || `rpt_${Date.now()}`;
  const withId = { ...report, id };
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "reports", id), withId);
      return;
    } catch (e) {
      console.error("Firebase saveReport failed", e);
    }
  }
  const all: Report[] = JSON.parse(localStorage.getItem(LS_REPORTS) || "[]");
  const idx = all.findIndex((r) => r.id === id);
  if (idx >= 0) {
    all[idx] = withId;
  } else {
    all.push(withId);
  }
  localStorage.setItem(LS_REPORTS, JSON.stringify(all));
};

export const deleteReport = async (reportId: string): Promise<void> => {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "reports", reportId));
      return;
    } catch (e) {
      console.error("Firebase deleteReport failed", e);
    }
  }
  const all: Report[] = JSON.parse(localStorage.getItem(LS_REPORTS) || "[]");
  localStorage.setItem(
    LS_REPORTS,
    JSON.stringify(all.filter((r) => r.id !== reportId)),
  );
};

// ==================== AUDIT LOG REPOSITORY ====================

const LS_AUDIT = "growconsult_audit";

export const logAuditEvent = async (
  uid: string,
  action: string,
  payload: Record<string, any>,
  userName?: string,
): Promise<void> => {
  const entry: AuditLogEntry = {
    id: `log_${Date.now()}`,
    uid,
    userName,
    action,
    payload,
    timestamp: Date.now(),
  };
  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, "auditLog"), entry);
      return;
    } catch (e) {
      console.error("Firebase logAuditEvent failed", e);
    }
  }
  const all: AuditLogEntry[] = JSON.parse(
    localStorage.getItem(LS_AUDIT) || "[]",
  );
  all.unshift(entry);
  localStorage.setItem(LS_AUDIT, JSON.stringify(all.slice(0, 500))); // keep last 500
};

export const getAuditLog = async (
  limitCount = 100,
): Promise<AuditLogEntry[]> => {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, "auditLog"));
      return snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as AuditLogEntry)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limitCount);
    } catch (e) {
      console.error("Firebase getAuditLog failed", e);
    }
  }
  const all: AuditLogEntry[] = JSON.parse(
    localStorage.getItem(LS_AUDIT) || "[]",
  );
  return all.slice(0, limitCount);
};

// ==================== ADMIN CONFIG REPOSITORY ====================

const LS_ADMIN_CONFIG = "growconsult_admin_config";

const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  maintenanceMode: false,
  featureFlags: { aiReports: true, payments: true, auditLog: true },
  welcomeMessage:
    "Welcome to GrowConsult AI! Your AI-powered business growth platform.",
  updatedAt: Date.now(),
};

export const getAdminConfig = async (): Promise<AdminConfig> => {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, "adminSettings", "config"));
      if (snap.exists()) return snap.data() as AdminConfig;
    } catch (e) {
      console.error("Firebase getAdminConfig failed", e);
    }
  }
  return JSON.parse(
    localStorage.getItem(LS_ADMIN_CONFIG) ||
      JSON.stringify(DEFAULT_ADMIN_CONFIG),
  );
};

export const saveAdminConfig = async (config: AdminConfig): Promise<void> => {
  const withTs = { ...config, updatedAt: Date.now() };
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "adminSettings", "config"), withTs);
      return;
    } catch (e) {
      console.error("Firebase saveAdminConfig failed", e);
    }
  }
  localStorage.setItem(LS_ADMIN_CONFIG, JSON.stringify(withTs));
};

export const ensureUserDocument = async (user: FirebaseUser, defaultPlan: "None" | "Plus" | "Growth" | "Basic" = "None"): Promise<User> => {
  const existingUser = await getUser(user.uid);
  if (existingUser) {
    return existingUser;
  }

  const newUser: User = {
    id: user.uid,
    name: user.displayName || user.email?.split("@")[0] || "New User",
    business: "My Business",
    email: user.email || "",
    phone: user.phoneNumber || "",
    plan: defaultPlan,
    status: "Active",
    joinedOn: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };

  await saveUser(newUser);
  return newUser;
};
