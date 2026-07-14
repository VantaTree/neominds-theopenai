import { createMiddleware } from "@tanstack/react-start";
import { BusinessPlan, BusinessAddon } from "../schemas";

export const authenticatedMiddleware = createMiddleware()
  .server(async ({ next }) => {
    const { verifyServerSession } = await import("./auth");
    const user = await verifyServerSession();
    return next({
      context: {
        user,
      },
    });
  });

export const adminMiddleware = createMiddleware()
  .server(async ({ next }) => {
    const { requireAdmin } = await import("../server/auth/permissions");
    const user = await requireAdmin();
    return next({
      context: {
        user,
      },
    });
  });

export const businessOwnerMiddleware = createMiddleware()
  .server(async (opts: any) => {
    const { next, data } = opts;
    let businessId: string | undefined;
    if (typeof data === "string") {
      businessId = data;
    } else if (data && typeof data === "object") {
      businessId = (data as any).businessId || (data as any).id;
    }

    if (!businessId) {
      throw new Error("BadRequest: businessId is required for this operation.");
    }

    const { requireBusinessOwner } = await import("../server/auth/ownership");
    const { decoded, business } = await requireBusinessOwner(businessId);

    return next({
      context: {
        user: decoded,
        business,
      },
    });
  });

const PLAN_HIERARCHY: Record<BusinessPlan, number> = {
  None: 0,
  Basic: 1,
  Plus: 2,
  Pro: 3,
};

export const requirePlanMiddleware = (minPlan: BusinessPlan) => {
  return createMiddleware()
    .server(async ({ next, context }) => {
      const business = (context as any).business;
      if (!business) {
        throw new Error("Business context not found. Make sure businessOwnerMiddleware is run before this.");
      }

      const currentPlan = (business.plan || "None") as BusinessPlan;
      const currentVal = PLAN_HIERARCHY[currentPlan] ?? 0;
      const requiredVal = PLAN_HIERARCHY[minPlan] ?? 0;

      if (currentVal < requiredVal) {
        throw new Error(`UpgradeRequired: This feature requires a ${minPlan} plan or higher.`);
      }

      return next();
    });
};

export const requireAddonMiddleware = (addon: BusinessAddon) => {
  return createMiddleware()
    .server(async ({ next, context }) => {
      const business = (context as any).business;
      if (!business) {
        throw new Error("Business context not found. Make sure businessOwnerMiddleware is run before this.");
      }

      const addons = business.addons || [];
      if (!addons.includes(addon)) {
        throw new Error(`UpgradeRequired: This feature requires the ${addon} addon.`);
      }

      return next();
    });
};
