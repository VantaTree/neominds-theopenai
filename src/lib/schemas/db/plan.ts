import { z } from "zod";

export const PlanSchema = z.object({
  id: z.string().min(1, "Plan ID is required"),
  name: z.string().min(1, "Plan name is required"),
  tagline: z.string().default(""),
  priceMonthly: z.number().nonnegative(),
  priceYearly: z.number().nonnegative(),
  billedYearly: z.number().nonnegative(),
  features: z.array(z.string()).default([]),
  maxReports: z.number().int().nonnegative().default(0),
  maxStorageGb: z.number().nonnegative().default(0),
  supportLevel: z.enum(["basic", "priority", "dedicated"]).default("basic"),
  stripeProductId: z.string().optional(),
  active: z.boolean().default(true),
});

export type Plan = z.infer<typeof PlanSchema>;
