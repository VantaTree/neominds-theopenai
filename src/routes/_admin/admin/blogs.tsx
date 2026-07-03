import { createFileRoute } from "@tanstack/react-router";
import BlogManagement from "@/modules/blogs/pages/BlogManagement";

export const Route = createFileRoute("/_admin/admin/blogs")({
  head: () => ({ meta: [{ title: "Blogs — GrowConsult AI" }] }),
  component: BlogManagement,
});
