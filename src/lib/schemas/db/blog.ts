import { z } from "zod";
import { DateField } from "../common";

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
