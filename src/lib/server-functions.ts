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
    // Try to verify as a Firebase session cookie first
    try {
      const decoded = await auth.verifySessionCookie(token, true);
      return decoded;
    } catch (sessionError) {
      // Fallback to verifying as a Firebase ID token (for backward compatibility)
      const decoded = await auth.verifyIdToken(token);
      return decoded;
    }
  } catch (error) {
    throw new Error("Unauthorized: Invalid session token.");
  }
}

export const createSessionCookieFn = createServerFn({ method: "POST" })
  .validator((d: { idToken: string }) => d)
  .handler(async ({ data }) => {
    try {
      const adminAuth = await getAdminAuth();
      const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days
      const sessionCookie = await adminAuth.createSessionCookie(data.idToken, { expiresIn });
      return { sessionCookie };
    } catch (e: any) {
      console.error("Error creating session cookie:", e);
      // Fallback/mock mode support
      return { sessionCookie: data.idToken };
    }
  });

// ==================== ROLE & AUTH MANAGEMENT SERVER FUNCTIONS ====================

export const verifyAdminAccessFn = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const decoded = await verifyServerSession();
      if (decoded.admin !== true) {
        return { authorized: false, reason: "Not an admin." };
      }
      return { authorized: true };
    } catch (e) {
      return { authorized: false, reason: "Session verification failed." };
    }
  });

export const setAdminClaimFn = createServerFn({ method: "POST" })
  .validator((d: { uid: string; isAdmin: boolean }) => d)
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    const adminAuth = await getAdminAuth();
    
    // Safety check: only allow admins to assign claims, OR the first user to bootstrap development
    if (decoded.admin !== true) {
      const db = await getDb();
      const users = await db.getUsers();
      const hasAdmins = users.some(u => u.role === "admin");
      if (hasAdmins) {
        throw new Error("Unauthorized: Only existing admins can assign admin claims.");
      }
    }
    
    await adminAuth.setCustomUserClaims(data.uid, { admin: data.isAdmin });
    
    const db = await getDb();
    const userDoc = await db.getUser(data.uid);
    if (userDoc) {
      userDoc.role = data.isAdmin ? "admin" : "client";
      await db.saveUser(userDoc);
    }
    
    return { success: true };
  });

export const checkUserRoleFn = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const decoded = await verifyServerSession();
      return {
        role: decoded.admin === true ? "admin" : "client",
        email: decoded.email,
        uid: decoded.uid,
      };
    } catch {
      return { role: null };
    }
  });

export const getMyBusinessesFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const decoded = await verifyServerSession();
    return (await getDb()).getBusinessesByUser(decoded.uid);
  });

// ==================== USERS & PROFILES ====================

export const getUsersFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Only admins can list users.");
    }
    return (await getDb()).getUsers();
  });

export const getUserFn = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.string().parse(d))
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    if (decoded.uid !== data && decoded.admin !== true) {
      throw new Error("Unauthorized: You cannot access another user's document.");
    }
    return (await getDb()).getUser(data);
  });

export const saveUserFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => UserSchema.parse(d))
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    
    // Security check: only allow updating own profile, unless it is an admin
    if (decoded.uid !== data.id && decoded.admin !== true) {
      throw new Error("Unauthorized: You can only update your own user document.");
    }
    
    // Security check: ignore or throw on attempts to change account email
    if (decoded.admin !== true && data.email !== decoded.email) {
      throw new Error("BadRequest: You cannot change your account email address.");
    }

    return (await getDb()).saveUser(data);
  });

export const deleteUserFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.string().parse(d))
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Only admins can delete user documents.");
    }
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

export const checkUserExistsFn = createServerFn({ method: "POST" })
  .validator((d: { uid: string }) => d)
  .handler(async ({ data }) => {
    const db = await getDb();
    const user = await db.getUser(data.uid);
    return { exists: !!user };
  });

// ==================== BUSINESSES ====================

export const getBusinessesFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Only admins can list all businesses.");
    }
    return (await getDb()).getBusinesses();
  });

export const getBusinessFn = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.string().parse(d))
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    const biz = await (await getDb()).getBusiness(data);
    if (!biz) return null;
    const bizUserId = typeof biz.userId === "string" ? biz.userId : biz.userId?.id;
    if (bizUserId !== decoded.uid && decoded.admin !== true) {
      throw new Error("Unauthorized: You do not own this business.");
    }
    return biz;
  });

export const getBusinessesByUserFn = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.string().parse(d))
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    if (decoded.uid !== data && decoded.admin !== true) {
      throw new Error("Unauthorized: Cannot retrieve businesses for another user.");
    }
    return (await getDb()).getBusinessesByUser(data);
  });

export const saveBusinessFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => BusinessSchema.parse(d))
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    const bizUserId = typeof data.userId === "string" ? data.userId : data.userId?.id;
    if (bizUserId !== decoded.uid && decoded.admin !== true) {
      throw new Error("Unauthorized: You do not own this business.");
    }
    return (await getDb()).saveBusiness(data);
  });

export const deleteBusinessFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.string().parse(d))
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    const biz = await (await getDb()).getBusiness(data);
    if (biz) {
      const bizUserId = typeof biz.userId === "string" ? biz.userId : biz.userId?.id;
      if (bizUserId !== decoded.uid && decoded.admin !== true) {
        throw new Error("Unauthorized: You do not own this business.");
      }
    }
    return (await getDb()).deleteBusiness(data);
  });

// ==================== PROJECTS ====================

export const getProjectsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Only admins can list all projects.");
    }
    return (await getDb()).getProjects();
  });

export const saveProjectFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => ProjectSchema.parse(d))
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Only admins can save projects.");
    }
    return (await getDb()).saveProject(data);
  });

export const deleteProjectFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.string().parse(d))
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Only admins can delete projects.");
    }
    return (await getDb()).deleteProject(data);
  });

export const getProjectsByBusinessFn = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.string().parse(d))
  .handler(async ({ data: businessId }) => {
    const decoded = await verifyServerSession();
    const db = await getDb();
    const biz = await db.getBusiness(businessId);
    if (!biz) {
      throw new Error("Business not found.");
    }
    const bizUserId = typeof biz.userId === "string" ? biz.userId : biz.userId?.id;
    if (bizUserId !== decoded.uid && decoded.admin !== true) {
      throw new Error("Unauthorized: You do not own this business.");
    }
    return db.getProjectsByBusiness(businessId);
  });


// ==================== PAYMENTS ====================

export const getPaymentsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Only admins can list payments.");
    }
    return (await getDb()).getPayments();
  });

export const savePaymentsFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.array(PaymentSchema).parse(d))
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Only admins can save payments.");
    }
    return (await getDb()).savePayments(data);
  });

export const refundPaymentFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.string().parse(d))
  .handler(async ({ data: paymentId }) => {
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Only admins can refund payments.");
    }
    const db = await getDb();
    const payments = await db.getPayments();
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) {
      throw new Error("Payment not found.");
    }
    payment.status = "Refunded";
    await db.savePayments([payment]);

    await db.logAuditEvent(
      decoded.uid,
      "payment_refunded",
      { paymentId, amount: payment.amount, currency: payment.currency },
      decoded.name || decoded.email || "Admin"
    );
    return { success: true, payment };
  });

export const sendPaymentReminderFn = createServerFn({ method: "POST" })
  .validator((d: { paymentId: string; clientEmail: string }) => d)
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Only admins can send payment reminders.");
    }
    const db = await getDb();

    // Simulate email dispatch
    console.log(`[Email Dispatch Simulation] Sending payment reminder for payment ID ${data.paymentId} to ${data.clientEmail}`);

    await db.logAuditEvent(
      decoded.uid,
      "payment_reminder_sent",
      { paymentId: data.paymentId, recipientEmail: data.clientEmail },
      decoded.name || decoded.email || "Admin"
    );
    return { success: true };
  });

export const logCsvExportFn = createServerFn({ method: "POST" })
  .validator((d: { recordCount: number }) => d)
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Only admins can log administrative actions.");
    }
    const db = await getDb();

    await db.logAuditEvent(
      decoded.uid,
      "payments_csv_exported",
      { recordCount: data.recordCount },
      decoded.name || decoded.email || "Admin"
    );
    return { success: true };
  });

// ==================== SETTINGS ====================

export const getNotificationSettingsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Only admins can retrieve notification settings.");
    }
    return (await getDb()).getNotificationSettings();
  });

export const saveNotificationSettingsFn = createServerFn({ method: "POST" })
  .validator((d: { emailNotif: boolean; smsNotif: boolean; auditNotif: boolean; weeklyNotif: boolean }) => d)
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Only admins can save notification settings.");
    }
    return (await getDb()).saveNotificationSettings(data);
  });

// ==================== PROFILES ====================

// export const getProfileFn = createServerFn({ method: "GET" })
//   .validator((d: string) => d)
//   .handler(async ({ data }) => {
//     const decoded = await verifyServerSession();
//     if (decoded.uid !== data && decoded.admin !== true) {
//       throw new Error("Unauthorized: You cannot access another user's profile.");
//     }
//     return (await getDb()).getProfile(data);
//   });

// export const saveProfileFn = createServerFn({ method: "POST" })
//   .validator((d: { uid: string; data: any }) => d)
//   .handler(async ({ data }) => {
//     const decoded = await verifyServerSession();
    
//     // Security check: only allow updating own profile, unless it is an admin
//     if (decoded.uid !== data.uid && decoded.admin !== true) {
//       throw new Error("Unauthorized: You can only update your own profile.");
//     }
    
//     // Security check: reject if attempting to change account email
//     if (decoded.admin !== true && data.data?.email && data.data.email !== decoded.email) {
//       throw new Error("BadRequest: You cannot change your account email address.");
//     }

//     return (await getDb()).saveProfile(data.uid, data.data);
//   });

// ==================== PLANS ====================

export const getPlansFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyServerSession();
    return (await getDb()).getPlans();
  });

export const savePlanFn = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Only admins can save plans.");
    }
    return (await getDb()).savePlan(data);
  });

export const deletePlanFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Only admins can delete plans.");
    }
    return (await getDb()).deletePlan(data);
  });

// ==================== SUBSCRIPTIONS ====================

export const getSubscriptionsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Only admins can view all subscriptions.");
    }
    return (await getDb()).getSubscriptions();
  });

export const getUserSubscriptionFn = createServerFn({ method: "GET" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    if (decoded.uid !== data && decoded.admin !== true) {
      throw new Error("Unauthorized: Cannot retrieve subscription for another user.");
    }
    return (await getDb()).getUserSubscription(data);
  });

export const saveSubscriptionFn = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    if (decoded.uid !== data.uid && decoded.admin !== true) {
      throw new Error("Unauthorized: Cannot modify subscription for another user.");
    }
    return (await getDb()).saveSubscription(data);
  });

// ==================== REPORTS ====================

export const getReportsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Only admins can view all reports.");
    }
    return (await getDb()).getReports();
  });

export const getReportsByUserFn = createServerFn({ method: "GET" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    if (decoded.uid !== data && decoded.admin !== true) {
      throw new Error("Unauthorized: Cannot retrieve reports for another user.");
    }
    return (await getDb()).getReportsByUser(data);
  });

export const getReportsByBusinessFn = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.string().parse(d))
  .handler(async ({ data: businessId }) => {
    const decoded = await verifyServerSession();
    const db = await getDb();
    const biz = await db.getBusiness(businessId);
    if (!biz) {
      throw new Error("Business not found.");
    }
    const bizUserId = typeof biz.userId === "string" ? biz.userId : biz.userId?.id;
    if (bizUserId !== decoded.uid && decoded.admin !== true) {
      throw new Error("Unauthorized: You do not own this business.");
    }
    return db.getReportsByBusiness(businessId);
  });


export const saveReportFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => ReportSchema.parse(d))
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Only admins can create or update reports.");
    }
    return (await getDb()).saveReport(data);
  });

export const deleteReportFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.string().parse(d))
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Only admins can delete reports.");
    }
    return (await getDb()).deleteReport(data);
  });

// ==================== AUDIT LOGS ====================

export const getAuditLogFn = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.number().optional().parse(d))
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Only admins can view audit logs.");
    }
    return (await getDb()).getAuditLog(data);
  });

export const logAuditEventFn = createServerFn({ method: "POST" })
  .validator((d: { uid: string; action: string; payload: Record<string, any>; userName?: string }) => d)
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    if (decoded.uid !== data.uid && decoded.admin !== true) {
      throw new Error("Unauthorized: Cannot log audit event for another user.");
    }
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
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Only admins can create blog posts.");
    }
    return (await getDb()).createBlog(data);
  });

export const updateBlogFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; data: any }) => d)
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Only admins can update blog posts.");
    }
    // Validate only updated parts through partial blog schema
    const validatedData = BlogSchema.partial().parse(data.data);
    return (await getDb()).updateBlog(data.id, validatedData);
  });

export const deleteBlogFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.string().parse(d))
  .handler(async ({ data }) => {
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Only admins can delete blog posts.");
    }
    return (await getDb()).deleteBlog(data);
  });

// ==================== DEV / UTILS ====================

export const testFirestoreConnectionFn = createServerFn({ method: "POST" })
  .handler(async () => {
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Admin privilege required.");
    }
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

export const getStreamCredentialsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const { verifyServerSession } = await import("@/lib/server-functions");
    const decoded = await verifyServerSession();
    if (decoded.admin !== true) {
      throw new Error("Unauthorized: Admin privilege required.");
    }

    const apiKey = process.env.VITE_STREAM_API_KEY || import.meta.env.VITE_STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET || (import.meta.env as any).STREAM_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error("Stream credentials are not configured in environment variables.");
    }

    const { StreamChat: NodeStreamChat } = await import("stream-chat");
    const serverClient = NodeStreamChat.getInstance(apiKey, apiSecret);

    // Upsert admin user to ensure they exist in Stream
    await serverClient.upsertUser({
      id: "admin",
      role: "admin",
      name: "Admin Manager",
    } as any);

    const token = serverClient.createToken("admin");

    return { apiKey, token };
  });

export const getClientStreamCredentialsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const { verifyServerSession } = await import("@/lib/server-functions");
    const decoded = await verifyServerSession();

    const apiKey = process.env.VITE_STREAM_API_KEY || import.meta.env.VITE_STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET || (import.meta.env as any).STREAM_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error("Stream credentials are not configured in environment variables.");
    }

    const uid = decoded.uid;
    const email = decoded.email;
    const name = decoded.name || email?.split("@")[0] || "Client User";

    const { StreamChat: NodeStreamChat } = await import("stream-chat");
    const serverClient = NodeStreamChat.getInstance(apiKey, apiSecret);
    
    // Ensure both client and admin users exist in Stream to prevent watch channel failures
    await serverClient.upsertUsers([
      {
        id: uid,
        role: "user",
        name: name,
        email: email,
      },
      {
        id: "admin",
        role: "admin",
        name: "Admin Manager",
      }
    ] as any);

    const token = serverClient.createToken(uid);

    return { apiKey, token, uid, name };
  });

// ==================== AI Assessment ====================

export const submitAssessmentFn = createServerFn({ method: "POST" })
  .validator((d: {
    businessName: string;
    industry: string;
    businessDescription: string;
    websiteUrl?: string | null;
    primaryGoal: string;
    targetAudience: string;
  }) => d)
  .handler(async ({ data }) => {
    // 1. Verify the requester is authenticated
    const decoded = await verifyServerSession();

    // 2. Validate that the user owns no business without a paid plan
    const db = await getDb();
    const userBusinesses = await db.getBusinessesByUser(decoded.uid);
    const hasUnpaidBusiness = userBusinesses.some((b) => b.plan === "None");
    if (hasUnpaidBusiness) {
      throw new Error(
        "You must purchase a paid plan for your existing business before you can add a new one."
      );
    }

    // 3. Call the agent backend using fetch
    const agentBackendUrl = process.env.VITE_AGENT_BACKEND_URL || "http://localhost:8081";
    const apiKey = process.env.BB_AGENT_API_KEY || "bb-agent-default-secret-key-2026";

    const response = await fetch(`${agentBackendUrl}/api/assessment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        businessName: data.businessName,
        industry: data.industry,
        businessDescription: data.businessDescription,
        websiteUrl: data.websiteUrl || "",
        primaryGoal: data.primaryGoal,
        targetAudience: data.targetAudience,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from AI agent backend:", errorText);
      throw new Error(`AI Agent backend returned error: ${response.statusText}`);
    }

    const result = await response.json();

    // 4. Create and save new Business document in Firestore
    const firestoreDb = await getAdminDb();
    const businessId = firestoreDb.collection("businesses").doc().id;
    const newBusiness: Business = {
      id: businessId,
      userId: decoded.uid,
      plan: "None",
      addons: [],
      businessName: data.businessName,
      businessType: data.industry,
      contactEmail: decoded.email || null,
      contactPhone: "",
      websiteUrl: data.websiteUrl || "",
      paymentStatus: "Pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.saveBusiness(newBusiness);

    // 5. Create and save new Report document in Firestore
    const reportId = firestoreDb.collection("reports").doc().id;
    const newReport: any = {
      id: reportId,
      businessId: businessId,
      title: `${data.businessName} - AI Assessment Report`,
      createdAt: new Date(),
      updatedAt: new Date(),
      data: result,
    };
    await db.saveReport(newReport);

    // 6. Update user document businessCount
    const userDoc = await db.getUser(decoded.uid);
    if (userDoc) {
      const updatedBusinesses = await db.getBusinessesByUser(decoded.uid);
      userDoc.businessCount = updatedBusinesses.length;
      userDoc.updatedAt = new Date();
      await db.saveUser(userDoc);
    }

    return { result, businessId, reportId };
  });

