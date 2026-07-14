import { createServerFn } from "@tanstack/react-start";
import { adminMiddleware, authenticatedMiddleware, businessOwnerMiddleware, requirePlanMiddleware } from "./middleware";
import {
  GetReportsByUserSchema,
  GetReportsByBusinessSchema,
  SaveReportSchema,
  DeleteReportSchema,
  SubmitAssessmentSchema,
} from "../schemas/api/reports";

export const getReportsFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const { ReportService } = await import("../server/services/report.service");
    const reportService = new ReportService();
    return reportService.getReports();
  });

export const getReportsByUserFn = createServerFn({ method: "GET" })
  .validator((d: any) => GetReportsByUserSchema.parse(d))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const { ReportService } = await import("../server/services/report.service");
    const decoded = context.user;
    if (decoded.uid !== data && decoded.admin !== true) {
      throw new Error("Unauthorized: Cannot retrieve reports for another user.");
    }
    const reportService = new ReportService();
    return reportService.getReportsByUser(data);
  });

export const getReportsByBusinessFn = createServerFn({ method: "GET" })
  .validator((d: any) => GetReportsByBusinessSchema.parse(d))
  .middleware([businessOwnerMiddleware, requirePlanMiddleware("Basic")])
  .handler(async ({ data: businessId }) => {
    const { ReportService } = await import("../server/services/report.service");
    const reportService = new ReportService();
    return reportService.getReportsByBusiness(businessId);
  });

export const saveReportFn = createServerFn({ method: "POST" })
  .validator((d: any) => SaveReportSchema.parse(d))
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const { ReportService } = await import("../server/services/report.service");
    const reportService = new ReportService();
    await reportService.saveReport(data);
    return { success: true };
  });

export const deleteReportFn = createServerFn({ method: "POST" })
  .validator((d: any) => DeleteReportSchema.parse(d))
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const { ReportService } = await import("../server/services/report.service");
    const reportService = new ReportService();
    await reportService.deleteReport(data);
    return { success: true };
  });

export const submitAssessmentFn = createServerFn({ method: "POST" })
  .validator((d: any) => SubmitAssessmentSchema.parse(d))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const { ReportService } = await import("../server/services/report.service");
    const reportService = new ReportService();
    return reportService.submitAssessment(context.user, data);
  });
