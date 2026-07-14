import { createServerFn } from "@tanstack/react-start";
import { adminMiddleware } from "./middleware";
import {
  FetchBlogsSchema,
  FetchBlogBySlugSchema,
  CreateBlogSchema,
  UpdateBlogSchema,
  DeleteBlogSchema,
} from "../schemas/api/blogs";

export const fetchBlogsFn = createServerFn({ method: "GET" })
  .validator((d: any) => FetchBlogsSchema.parse(d))
  .handler(async ({ data }) => {
    const { BlogService } = await import("../server/services/blog.service");
    const blogService = new BlogService();
    return blogService.fetchBlogs(data?.onlyPublished);
  });

export const fetchBlogBySlugFn = createServerFn({ method: "GET" })
  .validator((d: any) => FetchBlogBySlugSchema.parse(d))
  .handler(async ({ data }) => {
    const { BlogService } = await import("../server/services/blog.service");
    const blogService = new BlogService();
    return blogService.fetchBlogBySlug(data);
  });

export const createBlogFn = createServerFn({ method: "POST" })
  .validator((d: any) => CreateBlogSchema.parse(d))
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const { BlogService } = await import("../server/services/blog.service");
    const blogService = new BlogService();
    return blogService.createBlog(data);
  });

export const updateBlogFn = createServerFn({ method: "POST" })
  .validator((d: any) => UpdateBlogSchema.parse(d))
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const { BlogService } = await import("../server/services/blog.service");
    const blogService = new BlogService();
    return blogService.updateBlog(data.id, data.data);
  });

export const deleteBlogFn = createServerFn({ method: "POST" })
  .validator((d: any) => DeleteBlogSchema.parse(d))
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const { BlogService } = await import("../server/services/blog.service");
    const blogService = new BlogService();
    await blogService.deleteBlog(data);
    return { success: true };
  });
