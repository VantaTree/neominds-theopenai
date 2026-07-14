import { z } from "zod";
import { PlanSchema } from "../db/plan";
import { SubscriptionSchema } from "../db/subscription";
import { ProjectSchema } from "../db/project";

export const SetAdminClaimSchema = z.object({
  uid: z.string().min(1, "UID is required"),
  isAdmin: z.boolean(),
});

export const SaveNotificationSettingsSchema = z.object({
  emailNotif: z.boolean(),
  smsNotif: z.boolean(),
  auditNotif: z.boolean(),
  weeklyNotif: z.boolean(),
});

export const GetAuditLogSchema = z.number().int().nonnegative().optional();

export const LogAuditEventSchema = z.object({
  uid: z.string().min(1, "UID is required"),
  action: z.string().min(1, "Action is required"),
  payload: z.record(z.any()).default({}),
  userName: z.string().optional(),
});

export const SavePlanSchema = PlanSchema;
export const DeletePlanSchema = z.string().min(1, "Plan ID is required");

export const GetUserSubscriptionSchema = z.string().min(1, "User ID is required");
export const SaveSubscriptionSchema = SubscriptionSchema;

export const SaveProjectSchema = ProjectSchema;
export const DeleteProjectSchema = z.string().min(1, "Project ID is required");
export const GetProjectsByBusinessSchema = z.string().min(1, "Business ID is required");
