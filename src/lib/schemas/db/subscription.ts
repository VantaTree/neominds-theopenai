import { z } from "zod";
import { Reference } from "../common";
import { UserSchema } from "./user";
import { PlanSchema } from "./plan";

export const SubscriptionStatusEnum = z.enum([
  "active",
  "canceled",
  "past_due",
  "trialing",
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusEnum>;

export const SubscriptionSchema = z.object({
  id: z.string().min(1, "Subscription ID is required"),
  uid: Reference(UserSchema, "User ID reference is required"),
  planId: Reference(PlanSchema, "Plan ID reference is required"),
  status: SubscriptionStatusEnum.default("trialing"),
  startDate: z.number().default(() => Date.now()),
  endDate: z.number().nullable().default(null),
  billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
  amount: z.number().nonnegative(),
  notes: z.string().optional(),
});

export type Subscription = z.infer<typeof SubscriptionSchema>;
