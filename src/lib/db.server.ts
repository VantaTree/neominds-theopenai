import { adminDb } from "./firebase-admin.server";
import { createZodConverter } from "./firestore-converter.server";
import {
  UserSchema,
  User,
  BusinessSchema,
  Business,
  ProjectSchema,
  Project,
  BlogSchema,
  Blog,
  PaymentSchema,
  Payment,
  AuditLogSchema,
  AuditLog,
  ReportSchema,
  Report,
  Profile,
  Plan,
  Subscription,
  AdminConfig,
} from "./schemas";

// Ensure database is initialized before run
const getDb = () => {
  if (!adminDb) {
    throw new Error(
      "Firebase Admin Firestore is not initialized. Please verify your environment variables."
    );
  }
  return adminDb;
};

// ==================== ZOD CONVERTER INSTANCES ====================
const userConverter = createZodConverter(UserSchema);
const businessConverter = createZodConverter(BusinessSchema);
const projectConverter = createZodConverter(ProjectSchema);
const blogConverter = createZodConverter(BlogSchema);
const paymentConverter = createZodConverter(PaymentSchema);
const auditLogConverter = createZodConverter(AuditLogSchema);
const reportConverter = createZodConverter(ReportSchema);

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
  const snap = await db.collection("users").withConverter(userConverter).get();
  return snap.docs.map((d) => d.data());
};

export const getUser = async (userId: string): Promise<User | null> => {
  const db = getDb();
  const snap = await db.collection("users").doc(userId).withConverter(userConverter).get();
  return snap.exists ? snap.data()! : null;
};

export const saveUser = async (user: User): Promise<void> => {
  const db = getDb();
  await db.collection("users").doc(user.id).withConverter(userConverter).set(user, { merge: true });
};

export const deleteUser = async (userId: string): Promise<void> => {
  const db = getDb();
  await db.collection("users").doc(userId).delete();
};

export const ensureUserDocument = async (
  user: { uid: string; displayName?: string | null; email?: string | null; phoneNumber?: string | null }
): Promise<User> => {
  const existingUser = await getUser(user.uid);
  if (existingUser) {
    return existingUser;
  }

  const newUser: User = {
    id: user.uid,
    fullName: user.displayName || user.email?.split("@")[0] || "New User",
    email: user.email || "",
    phone: user.phoneNumber || "",
    status: "Active",
    businessCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await saveUser(newUser);
  return newUser;
};

// ==================== BUSINESS REPOSITORY ====================

export const getBusinesses = async (): Promise<Business[]> => {
  const db = getDb();
  const snap = await db.collection("businesses").withConverter(businessConverter).get();
  return snap.docs.map((d) => d.data());
};

export const getBusiness = async (businessId: string): Promise<Business | null> => {
  const db = getDb();
  const snap = await db.collection("businesses").doc(businessId).withConverter(businessConverter).get();
  return snap.exists ? snap.data()! : null;
};

export const getBusinessesByUser = async (userId: string): Promise<Business[]> => {
  const db = getDb();
  const snap = await db.collection("businesses").where("userId", "==", userId).withConverter(businessConverter).get();
  return snap.docs.map((d) => d.data());
};

export const saveBusiness = async (business: Business): Promise<void> => {
  const db = getDb();
  await db.collection("businesses").doc(business.id).withConverter(businessConverter).set(business, { merge: true });
};

export const deleteBusiness = async (businessId: string): Promise<void> => {
  const db = getDb();
  await db.collection("businesses").doc(businessId).delete();
};

// ==================== PROJECTS REPOSITORY ====================

export const getProjects = async (): Promise<Project[]> => {
  const db = getDb();
  const snap = await db.collection("projects").withConverter(projectConverter).get();
  return snap.docs.map((d) => d.data());
};

export const saveProject = async (project: Project): Promise<void> => {
  const db = getDb();
  await db.collection("projects").doc(project.id).withConverter(projectConverter).set(project, { merge: true });
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const db = getDb();
  await db.collection("projects").doc(projectId).delete();
};

// ==================== PAYMENTS REPOSITORY ====================

export const getPayments = async (): Promise<Payment[]> => {
  const db = getDb();
  const snap = await db.collection("payments").withConverter(paymentConverter).get();
  return snap.docs.map((d) => d.data());
};

export const savePayments = async (payments: Payment[]): Promise<void> => {
  const db = getDb();
  const batch = db.batch();
  for (const p of payments) {
    const ref = db.collection("payments").doc(String(p.id)).withConverter(paymentConverter);
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
  const snap = await db.collection("reports").withConverter(reportConverter).get();
  return snap.docs.map((d) => d.data());
};

export const getReportsByUser = async (uid: string): Promise<Report[]> => {
  const db = getDb();
  const snap = await db.collection("reports").where("userId", "==", uid).withConverter(reportConverter).get();
  return snap.docs.map((d) => d.data());
};

export const saveReport = async (report: Report): Promise<void> => {
  const db = getDb();
  const id = report.id || `rpt_${Date.now()}`;
  await db.collection("reports").doc(id).withConverter(reportConverter).set({ ...report, id }, { merge: true });
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
  actor = "System",
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  const db = getDb();
  const id = `log_${Date.now()}`;
  const entry: AuditLog = {
    id,
    timestamp: new Date(),
    action,
    payload,
    uid,
    userName: actor || "System",
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
  };
  await db.collection("auditLog").doc(id).withConverter(auditLogConverter).set(entry);
};

export const getAuditLog = async (
  limitCount = 100
): Promise<AuditLog[]> => {
  const db = getDb();
  const snap = await db
    .collection("auditLog")
    .withConverter(auditLogConverter)
    .orderBy("timestamp", "desc")
    .limit(limitCount)
    .get();

  return snap.docs.map((d) => d.data());
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
  let query = db.collection("blogs").withConverter(blogConverter).orderBy("createdAt", "desc");
  if (onlyPublished) {
    query = query.where("status", "==", "Published");
  }
  const snap = await query.get();
  return snap.docs.map((d) => d.data());
};

export const fetchBlogBySlug = async (slug: string): Promise<Blog | null> => {
  const db = getDb();
  const snap = await db.collection("blogs").where("slug", "==", slug).withConverter(blogConverter).limit(1).get();
  return snap.empty ? null : snap.docs[0].data();
};

export const createBlog = async (data: Omit<Blog, "id" | "createdAt" | "updatedAt">): Promise<Blog> => {
  const db = getDb();
  const id = `blog_${Date.now()}`;
  const newBlog: Blog = {
    ...data,
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Blog;
  await db.collection("blogs").doc(id).withConverter(blogConverter).set(newBlog);
  return newBlog;
};

export const updateBlog = async (id: string, data: Partial<Blog>): Promise<Blog> => {
  const db = getDb();
  const docRef = db.collection("blogs").doc(id).withConverter(blogConverter);
  const snap = await docRef.get();
  if (!snap.exists) {
    throw new Error(`Blog post with ID ${id} not found`);
  }
  const existingBlog = snap.data()!;
  const updatedBlog = {
    ...existingBlog,
    ...data,
    updatedAt: new Date(),
  };
  await docRef.set(updatedBlog);
  return updatedBlog;
};

export const deleteBlog = async (id: string): Promise<void> => {
  const db = getDb();
  await db.collection("blogs").doc(id).delete();
};
