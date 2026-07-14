import { z } from "zod";
import { DateField, Reference } from "../common";
import { BusinessSchema } from "./business";

export const ReportSchema = z.object({
  id: z.string().min(1, "Report ID is required"),
  businessId: Reference(BusinessSchema).optional().nullable(),
  title: z.string().min(1, "Report title is required"),
  createdAt: DateField,
  updatedAt: DateField,
  data: z.record(z.any()).default({}),
});

export type Report = z.infer<typeof ReportSchema>;
