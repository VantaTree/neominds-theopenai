import { BlogRepository } from "../repositories/blog.repository";
import { type Blog } from "@/lib/schemas";

export class BlogService {
  private blogRepo = new BlogRepository();

  async fetchBlogs(onlyPublished = false): Promise<Blog[]> {
    return this.blogRepo.fetchBlogs(onlyPublished);
  }

  async fetchBlogBySlug(slug: string): Promise<Blog | null> {
    return this.blogRepo.fetchBlogBySlug(slug);
  }

  async createBlog(data: Omit<Blog, "id" | "createdAt" | "updatedAt">): Promise<Blog> {
    return this.blogRepo.createBlog(data);
  }

  async updateBlog(id: string, data: Partial<Blog>): Promise<Blog> {
    return this.blogRepo.updateBlog(id, data);
  }

  async deleteBlog(id: string): Promise<void> {
    await this.blogRepo.deleteBlog(id);
  }
}
