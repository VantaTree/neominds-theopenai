import { z } from "zod";
import { BlogSchema } from "../db/blog";

export const FetchBlogsSchema = z.object({
  onlyPublished: z.boolean().optional(),
}).optional();

export const FetchBlogBySlugSchema = z.string().min(1, "Slug is required");

export const CreateBlogSchema = BlogSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateBlogSchema = z.object({
  id: z.string().min(1, "Blog ID is required"),
  data: z.any(),
});

export const DeleteBlogSchema = z.string().min(1, "Blog ID is required");
