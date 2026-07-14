import { adminDb } from "@/lib/firebase-admin.server";
import { createZodConverter } from "@/lib/firestore-converter.server";
import { BlogSchema, type Blog } from "@/lib/schemas";

const blogConverter = createZodConverter(BlogSchema);

export class BlogRepository {
  private get db() {
    if (!adminDb) {
      throw new Error("Firebase Admin Firestore is not initialized.");
    }
    return adminDb;
  }

  private get collection() {
    return this.db.collection("blogs").withConverter(blogConverter);
  }

  async fetchBlogs(onlyPublished = false): Promise<Blog[]> {
    let query = this.collection.orderBy("createdAt", "desc");
    if (onlyPublished) {
      query = query.where("status", "==", "Published");
    }
    const snap = await query.get();
    return snap.docs.map((d) => d.data());
  }

  async fetchBlogBySlug(slug: string): Promise<Blog | null> {
    const snap = await this.collection.where("slug", "==", slug).limit(1).get();
    return snap.empty ? null : snap.docs[0].data();
  }

  async createBlog(data: Omit<Blog, "id" | "createdAt" | "updatedAt">): Promise<Blog> {
    const id = `blog_${Date.now()}`;
    const newBlog: Blog = {
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Blog;
    await this.collection.doc(id).set(newBlog);
    return newBlog;
  }

  async updateBlog(id: string, data: Partial<Blog>): Promise<Blog> {
    const docRef = this.collection.doc(id);
    const snap = await docRef.get();
    if (!snap.exists) {
      throw new Error(`Blog post with ID ${id} not found`);
    }
    const existingBlog = snap.data()!;
    const updatedBlog = {
      ...existingBlog,
      ...data,
      updatedAt: new Date(),
    };
    await docRef.set(updatedBlog);
    return updatedBlog;
  }

  async deleteBlog(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }
}
