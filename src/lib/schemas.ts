// Re-export all database schemas and utility schemas to preserve backward compatibility
export { TimestampSchema, DateField, Reference } from "./schemas/common";

export {
  UserStatusEnum,
  type UserStatus,
  UserRoleEnum,
  type UserRole,
  UserSchema,
  type User,
} from "./schemas/db/user";

export {
  BusinessPlanEnum,
  type BusinessPlan,
  BusinessAddonEnum,
  type BusinessAddon,
  PaymentStatusEnum,
  type PaymentStatus,
  BusinessSchema,
  type Business,
} from "./schemas/db/business";

export {
  ProjectDomainEnum,
  type ProjectDomain,
  ProjectStatusEnum,
  type ProjectStatus,
  ProjectPriorityEnum,
  type ProjectPriority,
  ProjectUpdateSchema,
  type ProjectUpdate,
  ProjectSchema,
  type Project,
} from "./schemas/db/project";

export {
  BlogStatusEnum,
  type BlogStatus,
  BlogSchema,
  type Blog,
} from "./schemas/db/blog";

export {
  PaymentMethodEnum,
  type PaymentMethod,
  RazorpayInfoSchema,
  PaymentSchema,
  type Payment,
} from "./schemas/db/payment";

export {
  AuditLogSchema,
  type AuditLog,
} from "./schemas/db/audit";

export {
  ReportSchema,
  type Report,
} from "./schemas/db/report";

export {
  ProfileSchema,
  type Profile,
  AdminConfigSchema,
  type AdminConfig,
} from "./schemas/db/config";

export {
  PlanSchema,
  type Plan,
} from "./schemas/db/plan";

export {
  SubscriptionStatusEnum,
  type SubscriptionStatus,
  SubscriptionSchema,
  type Subscription,
} from "./schemas/db/subscription";
