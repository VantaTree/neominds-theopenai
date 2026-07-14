import { z } from "zod";
import { DateField, Reference } from "../common";
import { UserSchema } from "./user";

export const BusinessPlanEnum = z.enum(["None", "Basic", "Plus", "Pro"]);
export type BusinessPlan = z.infer<typeof BusinessPlanEnum>;

export const BusinessAddonEnum = z.enum([
  "SEO_OPTIMIZATION",
  "PRIORITY_SUPPORT",
  "ADVANCED_ANALYTICS",
  "CUSTOM_INTEGRATION",
]);
export type BusinessAddon = z.infer<typeof BusinessAddonEnum>;

export const PaymentStatusEnum = z.enum([
  "Pending",
  "Paid",
  "Failed",
  "Refunded",
]);
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;

export const BusinessSchema = z.object({
  id: z.string().min(1, "Business ID is required"),
  userId: Reference(UserSchema, "User ID reference is required"),
  plan: BusinessPlanEnum.default("None"),
  addons: z.array(BusinessAddonEnum).default([]),
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.string().default(""),
  contactEmail: z.string().email("Invalid contact email").optional().nullable(),
  contactPhone: z.string().default(""),
  image: z.string().url().optional(),
  websiteUrl: z.string().default(""),
  paymentStatus: PaymentStatusEnum.default("Pending"),
  createdAt: DateField,
  updatedAt: DateField,
});

export type Business = z.infer<typeof BusinessSchema>;
