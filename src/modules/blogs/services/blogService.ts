import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDoc
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import type { Blog, CreateBlogInput, UpdateBlogInput } from "../types/blog";

const LS_BLOGS = "growconsult_blogs";

// LocalStorage fallback mock initialization
const getLocalStorageBlogs = (): Blog[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(LS_BLOGS);
  if (!data) {
    const initialBlogs: Blog[] = [
      {
        id: "blog_1",
        title: "5 AI Strategies for Small Business Growth in 2026",
        slug: "5-ai-strategies-for-small-business-growth-in-2026",
        summary: "Learn how modern SMBs are leveraging artificial intelligence tools to automate workflows, capture leads, and scale consulting operations.",
        content: `
          <h2>Introduction</h2>
          <p>Artificial Intelligence is no longer just for enterprise corporations. In 2026, small and medium businesses (SMBs) are utilizing AI to scale their impact, optimize internal tasks, and interact with customers dynamically.</p>
          <h2>1. Workflow Automation</h2>
          <p>By automating follow-up emails, reporting structures, and calendar bookings, consultants save up to 15 hours per week.</p>
          <h2>2. Dynamic Lead Capture</h2>
          <p>Chatbots powered by Large Language Models can answer initial inquiries instantly, qualifying leads before they reach human agents.</p>
          <h2>3. Scalable Strategy Mapping</h2>
          <p>GrowConsult AI allows users to auto-generate business audits instantly, creating ready-to-execute roadmap checklists.</p>
          <h2>Conclusion</h2>
          <p>Integrating these simple strategies allows small consultancies to play at the scale of large agencies with a fraction of the overhead.</p>
        `,
        coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        images: [],
        author: "Admin Team",
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        published: true
      },
      {
        id: "blog_2",
        title: "How to Build a Seamless Payment Flow for Consultants",
        slug: "how-to-build-a-seamless-payment-flow-for-consultants",
        summary: "Understanding invoicing, payment gateways, and recurring plan structures to keep business cashflow healthy.",
        content: `
          <h2>Cashflow is King</h2>
          <p>For independent consultants, late invoices and complex payment options are the biggest blockers to steady growth. Transitioning clients to tiered monthly subscriptions improves retention and predictability.</p>
          <h2>Best Practices:</h2>
          <ul>
            <li>Offer automatic recurring subscriptions (Plus vs Pro tier).</li>
            <li>Maintain clear overdue reminders with grace periods.</li>
            <li>Provide accessible invoice PDF downloads.</li>
          </ul>
        `,
        coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        images: [],
        author: "Finance Dept",
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        published: true
      },
      {
        id: "blog_3",
        title: "Growth Consulting Playbook: From Onboarding to Delivery",
        slug: "growth-consulting-playbook-from-onboarding-to-delivery",
        summary: "A draft playbook containing steps for setting up projects, managers, and service milestones.",
        content: `
          <p>This is a internal draft guide detailing milestones, website design development, marketing campaigns, and SEO configurations.</p>
        `,
        coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
        images: [],
        author: "Operations",
        createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
        published: false
      }
    ];
    localStorage.setItem(LS_BLOGS, JSON.stringify(initialBlogs));
    return initialBlogs;
  }
  return JSON.parse(data);
};

const setLocalStorageBlogs = (blogs: Blog[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LS_BLOGS, JSON.stringify(blogs));
  }
};

// --- Service Interface ---

export const fetchBlogs = async (onlyPublished = false): Promise<Blog[]> => {
  if (isFirebaseConfigured && db) {
    try {
      const blogsCol = collection(db, "blogs");
      let q = query(blogsCol, orderBy("createdAt", "desc"));
      if (onlyPublished) {
        q = query(blogsCol, where("published", "==", true), orderBy("createdAt", "desc"));
      }
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Blog);
    } catch (e) {
      console.error("Firebase fetchBlogs failed, using local storage fallback", e);
    }
  }
  const blogs = getLocalStorageBlogs();
  const sorted = blogs.sort((a, b) => b.createdAt - a.createdAt);
  return onlyPublished ? sorted.filter(b => b.published) : sorted;
};

export const fetchBlogBySlug = async (slug: string): Promise<Blog | null> => {
  if (isFirebaseConfigured && db) {
    try {
      const blogsCol = collection(db, "blogs");
      const q = query(blogsCol, where("slug", "==", slug));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as Blog;
      }
    } catch (e) {
      console.error("Firebase fetchBlogBySlug failed, using local storage fallback", e);
    }
  }
  const blogs = getLocalStorageBlogs();
  return blogs.find(b => b.slug === slug) || null;
};

export const createBlog = async (data: CreateBlogInput): Promise<Blog> => {
  const newBlog: Blog = {
    ...data,
    id: `blog_${Date.now()}`,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  if (isFirebaseConfigured && db) {
    try {
      // Use setDoc so that we can enforce our local ID or allow Firestore auto-ID.
      // We will write with our generated ID for parity with local mode.
      const docRef = doc(db, "blogs", newBlog.id);
      await setDoc(docRef, newBlog);
      return newBlog;
    } catch (e) {
      console.error("Firebase createBlog failed, writing to local storage fallback", e);
    }
  }

  const blogs = getLocalStorageBlogs();
  blogs.push(newBlog);
  setLocalStorageBlogs(blogs);
  return newBlog;
};

export const updateBlog = async (id: string, data: UpdateBlogInput): Promise<Blog> => {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "blogs", id);
      const updateData = {
        ...data,
        updatedAt: Date.now()
      };
      await setDoc(docRef, updateData, { merge: true });
      
      // Retrieve updated doc
      const snap = await getDoc(docRef);
      return { id: snap.id, ...snap.data() } as Blog;
    } catch (e) {
      console.error("Firebase updateBlog failed, updating local storage fallback", e);
    }
  }

  const blogs = getLocalStorageBlogs();
  const index = blogs.findIndex(b => b.id === id);
  if (index === -1) throw new Error("Blog post not found");

  const updatedBlog: Blog = {
    ...blogs[index],
    ...data,
    updatedAt: Date.now()
  };
  blogs[index] = updatedBlog;
  setLocalStorageBlogs(blogs);
  return updatedBlog;
};

export const deleteBlog = async (id: string): Promise<void> => {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "blogs", id));
      return;
    } catch (e) {
      console.error("Firebase deleteBlog failed, deleting from local storage fallback", e);
    }
  }

  const blogs = getLocalStorageBlogs();
  const filtered = blogs.filter(b => b.id !== id);
  setLocalStorageBlogs(filtered);
};

// Helper for cover image uploads (converts file to Base64 dataURL for local persistence / mock storage)
export const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};
