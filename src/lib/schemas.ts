import { z } from "zod";

// ============================================================================
// SHARED UTILITIES & COERCIONS
// ============================================================================

// Safely coerces standard Date objects, ISO strings, Epoch numbers,
// and Firestore Timestamp objects (having seconds & nanoseconds) into standard JS Dates.
export const TimestampSchema = z.union([
  z.date(),
  z.number().transform((val) => new Date(val)),
  z.string().transform((val) => new Date(val)),
  z
    .object({
      seconds: z.number(),
      nanoseconds: z.number(),
    })
    .transform((val) => new Date(val.seconds * 1000)),
]);

// Default auto-populated date field builder (coerces null to undefined so that default value kicks in)
const DateField = z.preprocess(
  (val) => (val === null ? undefined : val),
  TimestampSchema.default(() => new Date())
);

// Helper schema to support reference fields which can be either a string ID, a Firestore DocumentReference, or the fully populated object
export const Reference = <T extends z.ZodTypeAny>(schema: T, requiredMessage?: string) =>
  z.preprocess(
    (val) => {
      if (val && typeof val === "object") {
        if ("id" in val && "path" in val && typeof (val as any).path === "string") {
          return (val as any).id;
        }
      }
      return val;
    },
    z.union([
      requiredMessage ? z.string().min(1, requiredMessage) : z.string(),
      schema
    ])
  );

// ============================================================================
// 1. USER SCHEMA
// ============================================================================
export const UserStatusEnum = z.enum(["Active", "Inactive", "Suspended"]);
export type UserStatus = z.infer<typeof UserStatusEnum>;

export const UserSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  fullName: z.string().default(""),
  image:z.string().url().optional(),
  phone: z.string().default(""),
  status: UserStatusEnum.default("Active"),
  businessCount: z.number().int().nonnegative().default(0),
  createdAt: DateField,
  updatedAt: DateField,
});

export type User = z.infer<typeof UserSchema>;

// ============================================================================
// 2. BUSINESS SCHEMA
// ============================================================================
export const BusinessPlanEnum = z.enum(["None", "Basic", "Plus", "Enterprise", "Pro", "pro"]);
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
  websiteUrl: z.string().default(""),
  paymentStatus: PaymentStatusEnum.default("Pending"),
  createdAt: DateField,
  updatedAt: DateField,
});

export type Business = z.infer<typeof BusinessSchema>;

// ============================================================================
// 3. PROJECT SCHEMA
// ============================================================================
export const ProjectUpdateSchema = z.object({
  message: z.string().min(1, "Update message cannot be empty"),
  timestamp: DateField,
  designation: z.string().default("System"),
});
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>;

export const ProjectSchema = z.object({
  id: z.string().min(1, "Project ID is required"),
  businessId: Reference(BusinessSchema, "Business ID reference is required"),
  name: z.string().min(1, "Project name is required"),
  description: z.string().default(""),
  domain: z.string().default(""),
  type: z.string().default("Development"),
  progress: z.number().min(0).max(100).default(0),
  updates: z.array(ProjectUpdateSchema).default([]),
  completedAt: TimestampSchema.nullable().optional(),
  deadline: TimestampSchema.nullable().optional(),
  createdAt: DateField,
  updatedAt: DateField,
});

export type Project = z.infer<typeof ProjectSchema>;

// ============================================================================
// 4. BLOG SCHEMA
// ============================================================================
export const BlogStatusEnum = z.enum(["Draft", "Published", "Archived"]);
export type BlogStatus = z.infer<typeof BlogStatusEnum>;

export const BlogSchema = z.object({
  id: z.string().min(1, "Blog ID is required"),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  author: z.string().default("Admin"),
  summary: z.string().default(""),
  content: z.string().default(""),
  coverImageUrl: z
    .string()
    .url("Invalid cover image URL")
    .or(z.literal(""))
    .default(""),
  status: BlogStatusEnum.default("Draft"),
  featured: z.boolean().default(false),
  createdAt: DateField,
  updatedAt: DateField,
});

export type Blog = z.infer<typeof BlogSchema>;

// ============================================================================
// 5. PAYMENT SCHEMA
// ============================================================================
export const PaymentMethodEnum = z.enum([
  "Card",
  "UPI",
  "Netbanking",
  "Wallet",
  "BankTransfer",
  "Other",
]);
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

export const RazorpayInfoSchema = z.object({
  orderId: z.string().optional(),
  paymentId: z.string().optional(),
  signature: z.string().optional(),
});

export const PaymentSchema = z.object({
  id: z.string().min(1, "Payment ID is required"),
  userId: Reference(UserSchema, "User ID reference is required"),
  businessId: Reference(BusinessSchema).optional().nullable(),
  status: PaymentStatusEnum.default("Pending"),
  amount: z.number().positive("Amount must be a positive number"), // stored as standard decimal
  currency: z.string().default("INR"),
  paymentMethod: PaymentMethodEnum.default("Other"),
  gateway: z.string().default("Razorpay"),
  gatewayInfo: RazorpayInfoSchema.optional().nullable(),
  purchaseItem: z.string().min(1, "Purchase item is required"),
  timestamp: DateField,
});

export type Payment = z.infer<typeof PaymentSchema>;

// ============================================================================
// 6. AUDIT LOG SCHEMA
// ============================================================================
export const AuditLogSchema = z.object({
  id: z.string().min(1, "Log ID is required"),
  uid: z.string().min(1, "User ID is required"),
  userName: z.string().optional().nullable(),
  action: z.string().min(1, "Action cannot be empty"),
  payload: z.record(z.any()).default({}),
  timestamp: DateField,
  ipAddress: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

// ============================================================================
// 7. REPORT SCHEMA (Flexible Document Schema)
// ============================================================================
export const ReportSchema = z.object({
  id: z.string().min(1, "Report ID is required"),
  // userId: Reference(UserSchema, "User ID reference is required"),
  businessId: Reference(BusinessSchema).optional().nullable(),
  title: z.string().min(1, "Report title is required"),
  createdAt: DateField,
  updatedAt: DateField,
  // Report collections are highly dynamic and support any schema/JSON structure
  data: z.record(z.any()).default({}),
});

export type Report = z.infer<typeof ReportSchema>;

// ============================================================================
// 8. PROFILE SCHEMA
// ============================================================================
export const ProfileSchema = z.object({
  uid: z.string().min(1, "UID is required"),
  planId: z.string().default("none"),
  planStart: z.number().default(() => Date.now()),
  planEnd: z.number().nullable().default(null),
  quota: z
    .object({
      reports: z.number().default(5),
      storageGb: z.number().default(2),
    })
    .default({}),
  used: z
    .object({
      reports: z.number().default(0),
      storageGb: z.number().default(0),
    })
    .default({}),
  preferences: z
    .object({
      language: z.string().default("en"),
      darkMode: z.boolean().default(false),
    })
    .default({}),
});

export type Profile = z.infer<typeof ProfileSchema>;

// ============================================================================
// 9. PLAN SCHEMA
// ============================================================================
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

// ============================================================================
// 10. SUBSCRIPTION SCHEMA
// ============================================================================
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

// ============================================================================
// 11. ADMIN CONFIG SCHEMA
// ============================================================================
export const AdminConfigSchema = z.object({
  maintenanceMode: z.boolean().default(false),
  featureFlags: z.record(z.boolean()).default({}),
  welcomeMessage: z.string().default(""),
  updatedAt: z.number().default(() => Date.now()),
});

export type AdminConfig = z.infer<typeof AdminConfigSchema>;
