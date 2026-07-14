import { createServerFn } from "@tanstack/react-start";
import {
  SetAdminClaimSchema,
  SaveNotificationSettingsSchema,
  GetAuditLogSchema,
  LogAuditEventSchema,
  SavePlanSchema,
  DeletePlanSchema,
  GetUserSubscriptionSchema,
  SaveSubscriptionSchema,
} from "../schemas/api/admin";

export const verifyAdminAccessFn = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { requireAdmin } = await import("../server/auth/permissions");
      await requireAdmin();
      return { authorized: true };
    } catch (e: any) {
      return { authorized: false, reason: e.message || "Unauthorized: Admin access required." };
    }
  });

export const setAdminClaimFn = createServerFn({ method: "POST" })
  .validator((d: any) => SetAdminClaimSchema.parse(d))
  .handler(async ({ data }) => {
    const { requireAuth } = await import("../server/auth/session");
    const { AuthService } = await import("../server/services/auth.service");
    
    const decoded = await requireAuth();
    const authService = new AuthService();
    await authService.setAdminClaim(decoded, data.uid, data.isAdmin);
    return { success: true };
  });

export const getNotificationSettingsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const { requireAdmin } = await import("../server/auth/permissions");
    const { AdminService } = await import("../server/services/admin.service");
    
    await requireAdmin();
    const adminService = new AdminService();
    return adminService.getNotificationSettings();
  });

export const saveNotificationSettingsFn = createServerFn({ method: "POST" })
  .validator((d: any) => SaveNotificationSettingsSchema.parse(d))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("../server/auth/permissions");
    const { AdminService } = await import("../server/services/admin.service");
    
    await requireAdmin();
    const adminService = new AdminService();
    await adminService.saveNotificationSettings(data);
    return { success: true };
  });

export const getPlansFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const { requireAuth } = await import("../server/auth/session");
    const { PlanService } = await import("../server/services/plan.service");
    
    await requireAuth();
    const planService = new PlanService();
    return planService.getPlans();
  });

export const savePlanFn = createServerFn({ method: "POST" })
  .validator((d: any) => SavePlanSchema.parse(d))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("../server/auth/permissions");
    const { PlanService } = await import("../server/services/plan.service");
    
    await requireAdmin();
    const planService = new PlanService();
    await planService.savePlan(data);
    return { success: true };
  });

export const deletePlanFn = createServerFn({ method: "POST" })
  .validator((d: any) => DeletePlanSchema.parse(d))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("../server/auth/permissions");
    const { PlanService } = await import("../server/services/plan.service");
    
    await requireAdmin();
    const planService = new PlanService();
    await planService.deletePlan(data);
    return { success: true };
  });

export const getSubscriptionsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const { requireAdmin } = await import("../server/auth/permissions");
    const { SubscriptionService } = await import("../server/services/subscription.service");
    
    await requireAdmin();
    const subscriptionService = new SubscriptionService();
    return subscriptionService.getSubscriptions();
  });

export const getUserSubscriptionFn = createServerFn({ method: "GET" })
  .validator((d: any) => GetUserSubscriptionSchema.parse(d))
  .handler(async ({ data }) => {
    const { requireAuth } = await import("../server/auth/session");
    const { SubscriptionService } = await import("../server/services/subscription.service");
    
    const decoded = await requireAuth();
    if (decoded.uid !== data && decoded.admin !== true) {
      throw new Error("Unauthorized: Cannot retrieve subscription for another user.");
    }
    const subscriptionService = new SubscriptionService();
    return subscriptionService.getUserSubscription(data);
  });

export const saveSubscriptionFn = createServerFn({ method: "POST" })
  .validator((d: any) => SaveSubscriptionSchema.parse(d))
  .handler(async ({ data }) => {
    const { requireAuth } = await import("../server/auth/session");
    const { SubscriptionService } = await import("../server/services/subscription.service");
    
    const decoded = await requireAuth();
    if (decoded.uid !== data.uid && decoded.admin !== true) {
      throw new Error("Unauthorized: Cannot modify subscription for another user.");
    }
    const subscriptionService = new SubscriptionService();
    await subscriptionService.saveSubscription(data);
    return { success: true };
  });

export const getAuditLogFn = createServerFn({ method: "GET" })
  .validator((d: any) => GetAuditLogSchema.parse(d))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("../server/auth/permissions");
    const { AuditService } = await import("../server/services/audit.service");
    
    await requireAdmin();
    const auditService = new AuditService();
    return auditService.getAuditLog(data || 100);
  });

export const logAuditEventFn = createServerFn({ method: "POST" })
  .validator((d: any) => LogAuditEventSchema.parse(d))
  .handler(async ({ data }) => {
    const { requireAuth } = await import("../server/auth/session");
    const { AuditService } = await import("../server/services/audit.service");
    
    const decoded = await requireAuth();
    if (decoded.uid !== data.uid && decoded.admin !== true) {
      throw new Error("Unauthorized: Cannot log audit event for another user.");
    }
    const auditService = new AuditService();
    await auditService.logAuditEvent(data.uid, data.action, data.payload, data.userName);
    return { success: true };
  });

export const seedDatabaseFn = createServerFn({ method: "POST" })
  .validator((d: any) => SaveNotificationSettingsSchema.parse(d))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("../server/auth/permissions");
    const { AdminService } = await import("../server/services/admin.service");
    const { PlanRepository } = await import("../server/repositories/plan.repository");
    const { UserRepository } = await import("../server/repositories/user.repository");
    const { BusinessRepository } = await import("../server/repositories/business.repository");
    const { ProjectRepository } = await import("../server/repositories/project.repository");
    const { users: mockUsers, projects: mockProjects } = await import("@/lib/mock-data");

    await requireAdmin();

    const adminService = new AdminService();
    await adminService.saveNotificationSettings(data);

    const planRepo = new PlanRepository();
    const defaultPlans = await planRepo.getPlans();
    for (const plan of defaultPlans) {
      await planRepo.savePlan(plan);
    }

    const userRepo = new UserRepository();
    const businessRepo = new BusinessRepository();
    const projectRepo = new ProjectRepository();

    for (const u of mockUsers) {
      await userRepo.saveUser({
        id: u.id,
        email: u.email,
        fullName: u.name,
        phone: u.phone,
        role: "client",
        status: "Active",
        businessCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const businessId = `biz_${u.id}`;
      await businessRepo.saveBusiness({
        id: businessId,
        userId: u.id,
        plan: u.plan === "Growth" ? "Plus" : (u.plan === "None" ? "None" : u.plan),
        addons: [],
        businessName: u.business,
        businessType: "General",
        contactEmail: u.email,
        contactPhone: u.phone,
        websiteUrl: `www.${u.business.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        paymentStatus: "Paid",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    for (const p of mockProjects) {
      const user = mockUsers.find((u) => u.name === p.manager);
      const businessId = user ? `biz_${user.id}` : `biz_u1`;
      
      await projectRepo.saveProject({
        id: p.id,
        businessId: businessId,
        name: p.client + " Project",
        description: p.description,
        domain: "Website",
        services: p.services,
        progress: p.progress,
        assignee: p.manager,
        status: p.status,
        priority: p.priority,
        notes: p.notes,
        updates: [],
        startDate: new Date(p.startDate),
        createdAt: new Date(p.joinedOn),
        updatedAt: new Date(),
      });
    }

    return { success: true };
  });
