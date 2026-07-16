import { z } from "zod";
import { ReportSchema } from "../db/report";

export const GetReportsByUserSchema = z.string().min(1, "User ID is required");
export const GetReportsByBusinessSchema = z.string().min(1, "Business ID is required");
export const SaveReportSchema = ReportSchema;
export const DeleteReportSchema = z.string().min(1, "Report ID is required");
export const GetReportSchema = z.string().min(1, "Report ID is required");

export const SubmitAssessmentSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  industry: z.string().min(1, "Industry is required"),
  businessDescription: z.string().min(1, "Business description is required"),
  websiteUrl: z.string().url("Invalid website URL").optional().nullable().or(z.literal("")),
  primaryGoal: z.string().min(1, "Primary goal is required"),
  targetAudience: z.string().min(1, "Target audience is required"),
  location: z.string().min(1, "Location is required"),
});
