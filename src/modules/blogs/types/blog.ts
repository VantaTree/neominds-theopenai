export interface Blog {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  images: string[];
  author: string;
  createdAt: number; // UTC timestamp
  updatedAt: number; // UTC timestamp
  published: boolean;
}

export type CreateBlogInput = Omit<Blog, "id" | "createdAt" | "updatedAt">;
export type UpdateBlogInput = Partial<CreateBlogInput>;
