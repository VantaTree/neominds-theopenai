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

export const IntegrationDetailsSchema = z.object({
  isConnected: z.boolean().default(false),
  accessToken: z.string().optional().nullable(),
  refreshToken: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
  instagramBusinessId: z.string().optional().nullable(),
  facebookPageId: z.string().optional().nullable(),
  activatedPlatform: z.string().optional().nullable(),
});
export type IntegrationDetails = z.infer<typeof IntegrationDetailsSchema>;

export const IntegrationsSchema = z.object({
  google: IntegrationDetailsSchema.optional().nullable(),
  meta: IntegrationDetailsSchema.optional().nullable(),
});
export type Integrations = z.infer<typeof IntegrationsSchema>;

export const InsightMetricSchema = z.object({
  label: z.string(),
  value: z.string(),
  trend: z.string(),
  isPositive: z.boolean(),
});

export const InsightsCacheSchema = z.object({
  lastFetchedAt: z.string(),
  website: z.object({
    isConnected: z.boolean(),
    needsSetup: z.boolean(),
    metrics: z.array(InsightMetricSchema),
    chartData: z.array(z.any()).optional().nullable(),
    topPages: z.array(z.any()).optional().nullable(),
  }).optional().nullable(),
  google: z.object({
    isConnected: z.boolean(),
    needsSetup: z.boolean(),
    metrics: z.array(InsightMetricSchema),
  }).optional().nullable(),
});
export type InsightsCache = z.infer<typeof InsightsCacheSchema>;

export const BusinessSchema = z.object({
  id: z.string().min(1, "Business ID is required"),
  userId: Reference(UserSchema, "User ID reference is required"),
  plan: BusinessPlanEnum.default("None"),
  addons: z.array(BusinessAddonEnum).default([]),
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.string().default(""),
  contactEmail: z.string().email("Invalid contact email").optional().nullable(),
  contactPhone: z.string().default(""),
  image: z.string().url().nullish() 
    .transform(val => val === undefined ? null : val) ,
  websiteUrl: z.string().default(""),
  paymentStatus: PaymentStatusEnum.default("Pending"),
  integrations: IntegrationsSchema.optional().nullable(),
  insightsCache: z.union([
    InsightsCacheSchema,
    z.record(z.string(), InsightsCacheSchema)
  ]).optional().nullable(),
  createdAt: DateField,
  updatedAt: DateField,
});

export type Business = z.infer<typeof BusinessSchema>;

