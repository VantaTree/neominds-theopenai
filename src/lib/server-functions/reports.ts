import { createServerFn } from "@tanstack/react-start";
import {
  GetReportsByUserSchema,
  GetReportsByBusinessSchema,
  SaveReportSchema,
  DeleteReportSchema,
  SubmitAssessmentSchema,
} from "../schemas/api/reports";

export const getReportsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const { requireAdmin } = await import("../server/auth/permissions");
    const { ReportService } = await import("../server/services/report.service");
    
    await requireAdmin();
    const reportService = new ReportService();
    return reportService.getReports();
  });

export const getReportsByUserFn = createServerFn({ method: "GET" })
  .validator((d: any) => GetReportsByUserSchema.parse(d))
  .handler(async ({ data }) => {
    const { requireAuth } = await import("../server/auth/session");
    const { ReportService } = await import("../server/services/report.service");
    
    const decoded = await requireAuth();
    if (decoded.uid !== data && decoded.admin !== true) {
      throw new Error("Unauthorized: Cannot retrieve reports for another user.");
    }
    const reportService = new ReportService();
    return reportService.getReportsByUser(data);
  });

export const getReportsByBusinessFn = createServerFn({ method: "GET" })
  .validator((d: any) => GetReportsByBusinessSchema.parse(d))
  .handler(async ({ data: businessId }) => {
    const { requireBusinessOwner } = await import("../server/auth/ownership");
    const { ReportService } = await import("../server/services/report.service");
    
    await requireBusinessOwner(businessId);
    const reportService = new ReportService();
    return reportService.getReportsByBusiness(businessId);
  });

export const saveReportFn = createServerFn({ method: "POST" })
  .validator((d: any) => SaveReportSchema.parse(d))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("../server/auth/permissions");
    const { ReportService } = await import("../server/services/report.service");
    
    await requireAdmin();
    const reportService = new ReportService();
    await reportService.saveReport(data);
    return { success: true };
  });

export const deleteReportFn = createServerFn({ method: "POST" })
  .validator((d: any) => DeleteReportSchema.parse(d))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("../server/auth/permissions");
    const { ReportService } = await import("../server/services/report.service");
    
    await requireAdmin();
    const reportService = new ReportService();
    await reportService.deleteReport(data);
    return { success: true };
  });

export const submitAssessmentFn = createServerFn({ method: "POST" })
  .validator((d: any) => SubmitAssessmentSchema.parse(d))
  .handler(async ({ data }) => {
    const { requireAuth } = await import("../server/auth/session");
    const { ReportService } = await import("../server/services/report.service");
    
    const decoded = await requireAuth();
    const reportService = new ReportService();
    return reportService.submitAssessment(decoded, data);
  });
