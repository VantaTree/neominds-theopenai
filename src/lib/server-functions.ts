import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { users as mockUsers } from "./mock-data";
import {
  UserSchema,
  BusinessSchema,
  ProjectSchema,
  BlogSchema,
  PaymentSchema,
  AuditLogSchema,
  ReportSchema,
  type User,
  type Business,
} from "./schemas";

// Dynamic Import Helpers to prevent client-side leaks
async function getDb() {
  return import("./db.server");
}

async function getAdminAuth() {
  const { adminAuth } = await import("./firebase-admin.server");
  if (!adminAuth) throw new Error("Firebase Admin Auth SDK is not initialized.");
  return adminAuth;
}

async function getAdminDb() {
  const { adminDb } = await import("./firebase-admin.server");
  if (!adminDb) throw new Error("Firebase Admin Firestore is not initialized.");
  return adminDb;
}

// Auth Verification Helper
export async function verifyServerSession() {
  if (typeof window !== "undefined") {
    throw new Error("verifyServerSession can only be called on the server.");
  }
  
  const { getStartContext } = await import("@tanstack/start-storage-context");
  const ctx = getStartContext({ throwIfNotFound: false });
  const req = ctx?.request;
  const cookieHeader = req?.headers.get("cookie") || "";
  const match = cookieHeader.match(/__session=([^;]+)/);
  const token = match ? match[1] : null;

  if (!token) {
    throw new Error("Unauthorized: No session token found.");
  }

  const auth = await getAdminAuth();
  try {
    const decoded = await auth.verifyIdToken(token);
    return decoded;
  } catch (error) {
    throw new Error("Unauthorized: Invalid session token.");
  }
}

// ==================== USERS & PROFILES ====================

export const getUsersFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyServerSession();
    return (await getDb()).getUsers();
  });

export const getUserFn = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.string().parse(d))
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).getUser(data);
  });

export const saveUserFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => UserSchema.parse(d))
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).saveUser(data);
  });

export const deleteUserFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.string().parse(d))
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).deleteUser(data);
  });

export const ensureUserDocumentFn = createServerFn({ method: "POST" })
  .validator((d: { user: any }) => d)
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    if (data.user.uid !== decoded.uid) {
      throw new Error("Unauthorized: User ID mismatch.");
    }
    return (await getDb()).ensureUserDocument(data.user);
  });

// ==================== BUSINESSES ====================

export const getBusinessesFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyServerSession();
    return (await getDb()).getBusinesses();
  });

export const getBusinessFn = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.string().parse(d))
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).getBusiness(data);
  });

export const getBusinessesByUserFn = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.string().parse(d))
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).getBusinessesByUser(data);
  });

export const saveBusinessFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => BusinessSchema.parse(d))
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).saveBusiness(data);
  });

export const deleteBusinessFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.string().parse(d))
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).deleteBusiness(data);
  });

// ==================== PROJECTS ====================

export const getProjectsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyServerSession();
    return (await getDb()).getProjects();
  });

export const saveProjectFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => ProjectSchema.parse(d))
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).saveProject(data);
  });

export const deleteProjectFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.string().parse(d))
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).deleteProject(data);
  });

// ==================== PAYMENTS ====================

export const getPaymentsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyServerSession();
    return (await getDb()).getPayments();
  });

export const savePaymentsFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.array(PaymentSchema).parse(d))
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).savePayments(data);
  });

// ==================== SETTINGS ====================

export const getNotificationSettingsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyServerSession();
    return (await getDb()).getNotificationSettings();
  });

export const saveNotificationSettingsFn = createServerFn({ method: "POST" })
  .validator((d: { emailNotif: boolean; smsNotif: boolean; auditNotif: boolean; weeklyNotif: boolean }) => d)
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).saveNotificationSettings(data);
  });

// ==================== PROFILES ====================

export const getProfileFn = createServerFn({ method: "GET" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).getProfile(data);
  });

export const saveProfileFn = createServerFn({ method: "POST" })
  .validator((d: { uid: string; data: any }) => d)
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).saveProfile(data.uid, data.data);
  });

// ==================== PLANS ====================

export const getPlansFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyServerSession();
    return (await getDb()).getPlans();
  });

export const savePlanFn = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).savePlan(data);
  });

export const deletePlanFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).deletePlan(data);
  });

// ==================== SUBSCRIPTIONS ====================

export const getSubscriptionsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyServerSession();
    return (await getDb()).getSubscriptions();
  });

export const getUserSubscriptionFn = createServerFn({ method: "GET" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).getUserSubscription(data);
  });

export const saveSubscriptionFn = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).saveSubscription(data);
  });

// ==================== REPORTS ====================

export const getReportsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyServerSession();
    return (await getDb()).getReports();
  });

export const getReportsByUserFn = createServerFn({ method: "GET" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).getReportsByUser(data);
  });

export const saveReportFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => ReportSchema.parse(d))
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).saveReport(data);
  });

export const deleteReportFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.string().parse(d))
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).deleteReport(data);
  });

// ==================== AUDIT LOGS ====================

export const getAuditLogFn = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.number().optional().parse(d))
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).getAuditLog(data);
  });

export const logAuditEventFn = createServerFn({ method: "POST" })
  .validator((d: { uid: string; action: string; payload: Record<string, any>; userName?: string }) => d)
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).logAuditEvent(data.uid, data.action, data.payload, data.userName);
  });

// ==================== BLOGS ====================

export const fetchBlogsFn = createServerFn({ method: "GET" })
  .validator((d: { onlyPublished?: boolean } | undefined) => d)
  .handler(async ({ data }) => {
    return (await getDb()).fetchBlogs(data?.onlyPublished);
  });

export const fetchBlogBySlugFn = createServerFn({ method: "GET" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    return (await getDb()).fetchBlogBySlug(data);
  });

export const createBlogFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => BlogSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(d))
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).createBlog(data);
  });

export const updateBlogFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; data: any }) => d)
  .handler(async ({ data }) => {
    await verifyServerSession();
    // Validate only updated parts through partial blog schema
    const validatedData = BlogSchema.partial().parse(data.data);
    return (await getDb()).updateBlog(data.id, validatedData);
  });

export const deleteBlogFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.string().parse(d))
  .handler(async ({ data }) => {
    await verifyServerSession();
    return (await getDb()).deleteBlog(data);
  });

// ==================== DEV / UTILS ====================

export const testFirestoreConnectionFn = createServerFn({ method: "POST" })
  .handler(async () => {
    await verifyServerSession();
    try {
      const adDb = await getAdminDb();
      if (!adDb) {
        return { ok: false, error: "Firebase Admin Firestore is not initialized." };
      }
      const dbRef = (await getAdminDb()).collection("_connectionTest").doc("ping");
      await dbRef.set({ ts: Date.now(), ok: true });
      const snap = await dbRef.get();
      if (snap.exists) {
        await dbRef.delete();
        return { ok: true };
      }
      return { ok: false, error: "Read back failed" };
    } catch (e: any) {
      return { ok: false, error: e.message || "Unknown error" };
    }
  });

export const seedDatabaseFn = createServerFn({ method: "POST" })
  .validator((d: { emailNotif: boolean; smsNotif: boolean; auditNotif: boolean; weeklyNotif: boolean }) => d)
  .handler(async ({ data }) => {
    await verifyServerSession();
    
    const adDb = await getAdminDb();
    if (!adDb) {
      throw new Error("Firebase Admin Firestore is not initialized.");
    }

    // 1. Seed plans
    const plans = await (await getDb()).getPlans();
    for (const plan of plans) {
      await (await getDb()).savePlan(plan);
    }

    // 2. Seed admin config
    const config = await (await getDb()).getAdminConfig();
    await (await getDb()).saveAdminConfig(config);

    // 3. Seed notification settings
    await (await getDb()).saveNotificationSettings({
      emailNotif: data.emailNotif,
      smsNotif: data.smsNotif,
      auditNotif: data.auditNotif,
      weeklyNotif: data.weeklyNotif,
    });

    // 4. Seed users if empty
    const usersSnap = await (await getAdminDb()).collection("users").limit(1).get();
    if (usersSnap.empty) {
      for (const u of mockUsers) {
        // Map legacy mock user structure to new UserSchema fields for database seed
        const cleanUser: User = {
          id: u.id,
          fullName: u.name,
          email: u.email,
          phone: u.phone,
          status: "Active",
          businessCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await (await getDb()).saveUser(cleanUser);

        // Seed a corresponding business document for each user
        const cleanBusiness: Business = {
          id: `biz_${u.id}`,
          userId: u.id,
          businessName: u.business,
          businessType: "Consulting",
          contactEmail: u.email,
          contactPhone: u.phone,
          plan: (u.plan === "Growth" ? "Plus" : u.plan === "Plus" ? "Plus" : u.plan === "Basic" ? "Basic" : "None") as any,
          addons: [],
          websiteUrl: "",
          paymentStatus: "Paid",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await (await getDb()).saveBusiness(cleanBusiness);
      }
    }

    // 5. Seed blogs if empty
    const blogsSnap = await (await getAdminDb()).collection("blogs").limit(1).get();
    if (blogsSnap.empty) {
      const defaultBlogs = [
        {
          title: "5 AI Strategies for Small Business Growth in 2026",
          slug: "5-ai-strategies-for-small-business-growth-in-2026",
          summary: "Learn how modern SMBs are leveraging artificial intelligence tools to automate workflows, capture leads, and scale consulting operations.",
          content: "<p>Artificial Intelligence is no longer just for enterprise corporations...</p>",
          coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
          author: "Admin Team",
          status: "Published" as const,
          featured: true,
        },
        {
          title: "How to Build a Seamless Payment Flow for Consultants",
          slug: "how-to-build-a-seamless-payment-flow-for-consultants",
          summary: "Understanding invoicing, payment gateways, and recurring plan structures to keep business cashflow healthy.",
          content: "<p>For independent consultants, late invoices and complex payment options are the biggest blockers...</p>",
          coverImageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
          author: "Finance Dept",
          status: "Published" as const,
          featured: false,
        }
      ];
      for (const b of defaultBlogs) {
        await (await getDb()).createBlog(b);
      }
    }

    await (await getDb()).logAuditEvent("admin", "db_seeded", { collections: ["plans", "adminSettings", "users", "blogs", "businesses"] }, "Admin");
    return { success: true };
  });
