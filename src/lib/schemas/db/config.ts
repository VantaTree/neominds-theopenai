import { z } from "zod";

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

export const AdminConfigSchema = z.object({
  maintenanceMode: z.boolean().default(false),
  featureFlags: z.record(z.boolean()).default({}),
  welcomeMessage: z.string().default(""),
  updatedAt: z.number().default(() => Date.now()),
});

export type AdminConfig = z.infer<typeof AdminConfigSchema>;

export const SchedulingConfigurationSchema = z.object({
  dailyCapacity: z.number().min(0).default(8),
  taskEffort: z.object({
    post: z.number().min(0).default(0.5),
    reel: z.number().min(0).default(1.7),
  }).default({}),
  capacityUtilization: z.number().min(0).max(1).default(0.8),
  minimumLeadTime: z.number().min(0).default(2),
  confidenceBuffer: z.number().min(0).default(1),
  revisionMultiplier: z.number().min(0).default(1.2),
  workingDays: z.array(z.number()).default([1, 2, 3, 4, 5, 6]),
  holidays: z.array(z.string()).default([]),
  includeOnHold: z.boolean().default(true),
  roundUpPartialDays: z.boolean().default(true),
  skipWeekends: z.boolean().default(true),
  updatedAt: z.number().default(() => Date.now()),
});

export type SchedulingConfiguration = z.infer<typeof SchedulingConfigurationSchema>;

