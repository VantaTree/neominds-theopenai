import { z } from "zod";
import { DateField, Reference, TimestampSchema } from "../common";
import { BusinessSchema } from "./business";

export const ProjectDomainEnum = z.enum(["Website", "Marketing", "Automation"]);
export type ProjectDomain = z.infer<typeof ProjectDomainEnum>;

export const ProjectStatusEnum = z.enum([
  "Completed",
  "In Progress",
  "Pending",
  "On Hold",
  "Cancelled",
  "User Draft",
  "Requested",
]);
export type ProjectStatus = z.infer<typeof ProjectStatusEnum>;

export const ProjectPriorityEnum = z.enum(["Low", "Medium", "High"]);
export type ProjectPriority = z.infer<typeof ProjectPriorityEnum>;

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
  domain: ProjectDomainEnum,
  services: z.array(z.string()).min(1, "Atleast one service should be there"),
  progress: z.number().min(0).max(100).default(0),
  assignee: z.string().min(1, "Assignee is required"),
  status: ProjectStatusEnum.default("Pending"),
  priority: ProjectPriorityEnum.default("Medium"),
  notes: z.string().default(""),
  updates: z.array(ProjectUpdateSchema).default([]),
  assets: z.array(z.string()).default([]),
  completedAt: TimestampSchema.nullable().optional(),
  deadline: TimestampSchema.nullable().optional(),
  data: z.record(z.any()).default({}),
  startDate: DateField,
  createdAt: DateField,
  updatedAt: DateField,
});

export type Project = z.infer<typeof ProjectSchema>;
