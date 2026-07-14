import { requireAuth } from "./session";
import { ForbiddenError, NotFoundError } from "../../errors";
import { BusinessRepository } from "../repositories/business.repository";
import { UserRepository } from "../repositories/user.repository";
import { ReportRepository } from "../repositories/report.repository";

export async function requireBusinessOwner(businessId: string) {
  const decoded = await requireAuth();
  const businessRepo = new BusinessRepository();
  const business = await businessRepo.getBusiness(businessId);
  if (!business) {
    throw new NotFoundError("Business not found.");
  }

  if (decoded.admin === true) {
    return { decoded, business };
  }

  const bizUserId = typeof business.userId === "string" ? business.userId : (business.userId as any)?.id;
  if (bizUserId !== decoded.uid) {
    throw new ForbiddenError("Forbidden: You do not own this business.");
  }
  return { decoded, business };
}

export async function requireUserOwner(userId: string) {
  const decoded = await requireAuth();
  if (decoded.admin === true) {
    const userRepo = new UserRepository();
    const user = await userRepo.getUser(userId);
    return { decoded, user };
  }
  if (userId !== decoded.uid) {
    throw new ForbiddenError("Forbidden: You cannot modify this user's document.");
  }
  const userRepo = new UserRepository();
  const user = await userRepo.getUser(userId);
  return { decoded, user };
}

export async function requireReportOwner(reportId: string) {
  const decoded = await requireAuth();
  const reportRepo = new ReportRepository();
  const report = await reportRepo.getReport(reportId);
  if (!report) {
    throw new NotFoundError("Report not found.");
  }

  if (decoded.admin === true) {
    return { decoded, report };
  }

  if (report.businessId) {
    const businessRepo = new BusinessRepository();
    const businessIdStr = typeof report.businessId === "string" ? report.businessId : (report.businessId as any)?.id;
    const business = await businessRepo.getBusiness(businessIdStr);
    if (business) {
      const bizUserId = typeof business.userId === "string" ? business.userId : (business.userId as any)?.id;
      if (bizUserId === decoded.uid) {
        return { decoded, report };
      }
    }
  }
  throw new ForbiddenError("Forbidden: You do not own the business associated with this report.");
}
