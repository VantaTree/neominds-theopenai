import { BusinessRepository } from "../repositories/business.repository";
import { PlanUpgradeRequiredError } from "../../errors";
import { requireAuth } from "./session";

export const PLAN_HIERARCHY: Record<string, number> = {
  None: 0,
  Basic: 1,
  Plus: 2,
  Pro: 3,
};

export function hasPlanAccess(currentPlan: string, requiredPlan: string): boolean {
  const currentLevel = PLAN_HIERARCHY[currentPlan] ?? 0;
  const requiredLevel = PLAN_HIERARCHY[requiredPlan] ?? 0;
  return currentLevel >= requiredLevel;
}

export async function requirePlan(businessId: string, requiredPlan: string): Promise<void> {
  const decoded = await requireAuth();
  if (decoded.admin === true) return;

  const businessRepo = new BusinessRepository();
  const business = await businessRepo.getBusiness(businessId);
  if (!business) {
    throw new Error("Business not found");
  }

  const currentPlan = business.plan || "None";
  if (!hasPlanAccess(currentPlan, requiredPlan)) {
    throw new PlanUpgradeRequiredError(
      `Access denied: This action requires a ${requiredPlan} plan or higher (Current plan: ${currentPlan}).`
    );
  }
}
