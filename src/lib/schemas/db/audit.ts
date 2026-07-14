import { z } from "zod";
import { DateField } from "../common";

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
