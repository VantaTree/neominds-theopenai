import { createFileRoute } from "@tanstack/react-router";
import BlogManagement from "@/modules/blogs/pages/BlogManagement";
import { dbKeys } from "@/lib/db-keys";
import { fetchBlogsFn } from "@/lib/server-functions";

export const Route = createFileRoute("/_admin/admin/blogs/")({
  head: () => ({ meta: [{ title: "Blogs — GrowConsult AI" }] }),
  loader: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData({
        queryKey: dbKeys.blogs(false),
        queryFn: async () => {
          const res = await fetchBlogsFn({ data: { onlyPublished: false } });
          return res;
        },
      });
    } catch (err) {
      console.error("Loader failed to prefetch blogs:", err);
    }
  },
  component: BlogManagement,
});
