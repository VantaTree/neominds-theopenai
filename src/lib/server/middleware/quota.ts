import { BusinessRepository } from "../repositories/business.repository";
import { ReportRepository } from "../repositories/report.repository";
import { PlanRepository } from "../repositories/plan.repository";
import { QuotaExceededError } from "../../errors";

export async function verifyReportQuota(businessId: string): Promise<void> {
  const businessRepo = new BusinessRepository();
  const reportRepo = new ReportRepository();
  const planRepo = new PlanRepository();

  const business = await businessRepo.getBusiness(businessId);
  if (!business) {
    throw new Error("Business not found");
  }

  const reports = await reportRepo.getReportsByBusiness(businessId);
  const plans = await planRepo.getPlans();
  const currentPlan = plans.find((p) => p.id.toLowerCase() === (business.plan || "None").toLowerCase());
  
  const maxReports = currentPlan?.maxReports ?? 5;
  if (reports.length >= maxReports) {
    throw new QuotaExceededError(
      `Report quota exceeded: Current plan limits reports to ${maxReports} maximum.`
    );
  }
}
