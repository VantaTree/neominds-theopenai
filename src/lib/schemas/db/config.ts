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
