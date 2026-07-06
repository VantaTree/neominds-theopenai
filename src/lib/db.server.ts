import { adminDb } from "./firebase-admin.server";
import type { User, Project } from "./mock-data";
import type {
  Profile,
  Plan,
  Subscription,
  Report,
  AuditLogEntry,
  AdminConfig,
} from "./types";
import type { Blog, CreateBlogInput, UpdateBlogInput } from "../modules/blogs/types/blog";

// Ensure database is initialized before run
const getDb = () => {
  if (!adminDb) {
    throw new Error(
      "Firebase Admin Firestore is not initialized. Please verify your environment variables."
    );
  }
  return adminDb;
};

// ==================== DEFAULT CONFIGURATIONS ====================

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

const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  maintenanceMode: false,
  featureFlags: { aiReports: true, payments: true, auditLog: true },
  welcomeMessage:
    "Welcome to GrowConsult AI! Your AI-powered business growth platform.",
  updatedAt: Date.now(),
};

// ==================== USERS REPOSITORY ====================

export const getUsers = async (): Promise<User[]> => {
  const db = getDb();
  const snap = await db.collection("users").get();
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }) as User);
};

export const getUser = async (userId: string): Promise<User | null> => {
  const db = getDb();
  const snap = await db.collection("users").doc(userId).get();
  return snap.exists ? ({ id: snap.id, ...snap.data() } as User) : null;
};

export const saveUser = async (user: User): Promise<void> => {
  const db = getDb();
  await db.collection("users").doc(user.id).set(user, { merge: true });
};

export const deleteUser = async (userId: string): Promise<void> => {
  const db = getDb();
  await db.collection("users").doc(userId).delete();
};

export const ensureUserDocument = async (
  user: { uid: string; displayName?: string | null; email?: string | null; phoneNumber?: string | null },
  defaultPlan: "None" | "Plus" | "Growth" | "Basic" = "None"
): Promise<User> => {
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

// ==================== PROJECTS REPOSITORY ====================

export const getProjects = async (): Promise<Project[]> => {
  const db = getDb();
  const snap = await db.collection("projects").get();
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }) as Project);
};

export const saveProject = async (project: Project): Promise<void> => {
  const db = getDb();
  await db.collection("projects").doc(project.id).set(project, { merge: true });
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const db = getDb();
  await db.collection("projects").doc(projectId).delete();
};

// ==================== PAYMENTS REPOSITORY ====================

export const getPayments = async (): Promise<any[]> => {
  const db = getDb();
  const snap = await db.collection("payments").get();
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
};

export const savePayments = async (payments: any[]): Promise<void> => {
  const db = getDb();
  const batch = db.batch();
  for (const p of payments) {
    const ref = db.collection("payments").doc(String(p.id));
    batch.set(ref, p, { merge: true });
  }
  await batch.commit();
};

// ==================== SETTINGS REPOSITORY ====================

export interface NotificationSettings {
  emailNotif: boolean;
  smsNotif: boolean;
  auditNotif: boolean;
  weeklyNotif: boolean;
}

export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  const db = getDb();
  const snap = await db.collection("adminSettings").doc("notifications").get();
  if (snap.exists) {
    return snap.data() as NotificationSettings;
  }
  return {
    emailNotif: true,
    smsNotif: false,
    auditNotif: true,
    weeklyNotif: true,
  };
};

export const saveNotificationSettings = async (
  settings: NotificationSettings
): Promise<void> => {
  const db = getDb();
  await db.collection("adminSettings").doc("notifications").set(settings, { merge: true });
};

// ==================== PROFILES REPOSITORY ====================

export const getProfile = async (uid: string): Promise<Profile | null> => {
  const db = getDb();
  const snap = await db.collection("profiles").doc(uid).get();
  return snap.exists ? ({ uid: snap.id, ...snap.data() } as Profile) : null;
};

export const saveProfile = async (
  uid: string,
  data: Partial<Profile>
): Promise<void> => {
  const db = getDb();
  await db.collection("profiles").doc(uid).set({ uid, ...data }, { merge: true });
};

// ==================== PLANS REPOSITORY ====================

export const getPlans = async (): Promise<Plan[]> => {
  const db = getDb();
  const snap = await db.collection("plans").get();
  if (snap.docs.length > 0) {
    return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }) as Plan);
  }
  return DEFAULT_PLANS;
};

export const savePlan = async (plan: Plan): Promise<void> => {
  const db = getDb();
  await db.collection("plans").doc(plan.id).set(plan, { merge: true });
};

export const deletePlan = async (planId: string): Promise<void> => {
  const db = getDb();
  await db.collection("plans").doc(planId).delete();
};

// ==================== SUBSCRIPTIONS REPOSITORY ====================

export const getSubscriptions = async (): Promise<Subscription[]> => {
  const db = getDb();
  const snap = await db.collection("subscriptions").get();
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }) as Subscription);
};

export const getUserSubscription = async (
  uid: string
): Promise<Subscription | null> => {
  const db = getDb();
  const snap = await db
    .collection("subscriptions")
    .where("uid", "==", uid)
    .where("status", "==", "active")
    .limit(1)
    .get();

  return snap.empty
    ? null
    : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as Subscription);
};

export const saveSubscription = async (sub: Subscription): Promise<void> => {
  const db = getDb();
  const id = sub.id || `sub_${Date.now()}`;
  await db.collection("subscriptions").doc(id).set({ ...sub, id }, { merge: true });
};

// ==================== REPORTS REPOSITORY ====================

export const getReports = async (): Promise<Report[]> => {
  const db = getDb();
  const snap = await db.collection("reports").get();
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }) as Report);
};

export const getReportsByUser = async (uid: string): Promise<Report[]> => {
  const db = getDb();
  const snap = await db.collection("reports").where("uid", "==", uid).get();
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }) as Report);
};

export const saveReport = async (report: Report): Promise<void> => {
  const db = getDb();
  const id = report.id || `rpt_${Date.now()}`;
  await db.collection("reports").doc(id).set({ ...report, id }, { merge: true });
};

export const deleteReport = async (reportId: string): Promise<void> => {
  const db = getDb();
  await db.collection("reports").doc(reportId).delete();
};

// ==================== AUDIT LOG REPOSITORY ====================

export const logAuditEvent = async (
  uid: string,
  action: string,
  payload: Record<string, any>,
  userName?: string
): Promise<void> => {
  const db = getDb();
  const entry: AuditLogEntry = {
    id: `log_${Date.now()}`,
    uid,
    userName,
    action,
    payload,
    timestamp: Date.now(),
  };
  await db.collection("auditLog").doc(entry.id).set(entry);
};

export const getAuditLog = async (
  limitCount = 100
): Promise<AuditLogEntry[]> => {
  const db = getDb();
  const snap = await db
    .collection("auditLog")
    .orderBy("timestamp", "desc")
    .limit(limitCount)
    .get();

  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }) as AuditLogEntry);
};

// ==================== ADMIN CONFIG REPOSITORY ====================

export const getAdminConfig = async (): Promise<AdminConfig> => {
  const db = getDb();
  const snap = await db.collection("adminSettings").doc("config").get();
  if (snap.exists) {
    return snap.data() as AdminConfig;
  }
  return DEFAULT_ADMIN_CONFIG;
};

export const saveAdminConfig = async (config: AdminConfig): Promise<void> => {
  const db = getDb();
  const withTs = { ...config, updatedAt: Date.now() };
  await db.collection("adminSettings").doc("config").set(withTs, { merge: true });
};

// ==================== BLOGS REPOSITORY ====================

export const fetchBlogs = async (onlyPublished = false): Promise<Blog[]> => {
  const db = getDb();
  let query = db.collection("blogs").orderBy("createdAt", "desc");
  if (onlyPublished) {
    query = query.where("published", "==", true);
  }
  const snap = await query.get();
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }) as Blog);
};

export const fetchBlogBySlug = async (slug: string): Promise<Blog | null> => {
  const db = getDb();
  const snap = await db.collection("blogs").where("slug", "==", slug).limit(1).get();
  return snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as Blog);
};

export const createBlog = async (data: CreateBlogInput): Promise<Blog> => {
  const db = getDb();
  const id = `blog_${Date.now()}`;
  const newBlog: Blog = {
    ...data,
    id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.collection("blogs").doc(id).set(newBlog);
  return newBlog;
};

export const updateBlog = async (id: string, data: UpdateBlogInput): Promise<Blog> => {
  const db = getDb();
  const docRef = db.collection("blogs").doc(id);
  const updateData = {
    ...data,
    updatedAt: Date.now(),
  };
  await docRef.set(updateData, { merge: true });
  const snap = await docRef.get();
  return { id: snap.id, ...snap.data() } as Blog;
};

export const deleteBlog = async (id: string): Promise<void> => {
  const db = getDb();
  await db.collection("blogs").doc(id).delete();
};
