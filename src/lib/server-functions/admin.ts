import { createServerFn } from "@tanstack/react-start";
import { authenticatedMiddleware, adminMiddleware } from "./middleware";
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
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const { AuthService } = await import("../server/services/auth.service");
    const authService = new AuthService();
    await authService.setAdminClaim(context.user, data.uid, data.isAdmin);
    return { success: true };
  });

export const getNotificationSettingsFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const { AdminService } = await import("../server/services/admin.service");
    const adminService = new AdminService();
    return adminService.getNotificationSettings();
  });

export const saveNotificationSettingsFn = createServerFn({ method: "POST" })
  .validator((d: any) => SaveNotificationSettingsSchema.parse(d))
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const { AdminService } = await import("../server/services/admin.service");
    const adminService = new AdminService();
    await adminService.saveNotificationSettings(data);
    return { success: true };
  });

export const getPlansFn = createServerFn({ method: "GET" })
  .middleware([authenticatedMiddleware])
  .handler(async () => {
    const { PlanService } = await import("../server/services/plan.service");
    const planService = new PlanService();
    return planService.getPlans();
  });

export const savePlanFn = createServerFn({ method: "POST" })
  .validator((d: any) => SavePlanSchema.parse(d))
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const { PlanService } = await import("../server/services/plan.service");
    const planService = new PlanService();
    await planService.savePlan(data);
    return { success: true };
  });

export const deletePlanFn = createServerFn({ method: "POST" })
  .validator((d: any) => DeletePlanSchema.parse(d))
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const { PlanService } = await import("../server/services/plan.service");
    const planService = new PlanService();
    await planService.deletePlan(data);
    return { success: true };
  });

export const getSubscriptionsFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const { SubscriptionService } = await import("../server/services/subscription.service");
    const subscriptionService = new SubscriptionService();
    return subscriptionService.getSubscriptions();
  });

export const getUserSubscriptionFn = createServerFn({ method: "GET" })
  .validator((d: any) => GetUserSubscriptionSchema.parse(d))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const { SubscriptionService } = await import("../server/services/subscription.service");
    const decoded = context.user;
    if (decoded.uid !== data && decoded.admin !== true) {
      throw new Error("Unauthorized: Cannot retrieve subscription for another user.");
    }
    const subscriptionService = new SubscriptionService();
    return subscriptionService.getUserSubscription(data);
  });

export const saveSubscriptionFn = createServerFn({ method: "POST" })
  .validator((d: any) => SaveSubscriptionSchema.parse(d))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const { SubscriptionService } = await import("../server/services/subscription.service");
    const decoded = context.user;
    if (decoded.uid !== data.uid && decoded.admin !== true) {
      throw new Error("Unauthorized: Cannot modify subscription for another user.");
    }
    const subscriptionService = new SubscriptionService();
    await subscriptionService.saveSubscription(data);
    return { success: true };
  });

export const getAuditLogFn = createServerFn({ method: "GET" })
  .validator((d: any) => GetAuditLogSchema.parse(d))
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const { AuditService } = await import("../server/services/audit.service");
    const auditService = new AuditService();
    return auditService.getAuditLog(data || 100);
  });

export const logAuditEventFn = createServerFn({ method: "POST" })
  .validator((d: any) => LogAuditEventSchema.parse(d))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const { AuditService } = await import("../server/services/audit.service");
    const decoded = context.user;
    if (decoded.uid !== data.uid && decoded.admin !== true) {
      throw new Error("Unauthorized: Cannot log audit event for another user.");
    }
    const auditService = new AuditService();
    await auditService.logAuditEvent(data.uid, data.action, data.payload, data.userName);
    return { success: true };
  });

export const seedDatabaseFn = createServerFn({ method: "POST" })
  .validator((d: any) => SaveNotificationSettingsSchema.parse(d))
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const { AdminService } = await import("../server/services/admin.service");
    const { PlanRepository } = await import("../server/repositories/plan.repository");
    const { UserRepository } = await import("../server/repositories/user.repository");
    const { BusinessRepository } = await import("../server/repositories/business.repository");
    const { ProjectRepository } = await import("../server/repositories/project.repository");
    const { users: mockUsers, projects: mockProjects } = await import("@/lib/mock-data");

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
        assets: [],
        startDate: new Date(p.startDate),
        createdAt: new Date(p.joinedOn),
        updatedAt: new Date(),
      });
    }

    return { success: true };
  });
