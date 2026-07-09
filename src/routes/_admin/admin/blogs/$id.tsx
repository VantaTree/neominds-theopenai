import { createFileRoute } from "@tanstack/react-router";
import { BlogDetail } from "@/modules/blogs/pages/BlogDetail";
import { dbKeys } from "@/lib/db-keys";
import { fetchBlogsFn } from "@/lib/server-functions";
import { z } from "zod";

const searchSchema = z.object({
  tab: z.enum(["preview", "edit"]).optional().catch("preview"),
});

export const Route = createFileRoute("/_admin/admin/blogs/$id")({
  head: () => ({ meta: [{ title: "Blog Detail — GrowConsult AI" }] }),
  validateSearch: (search) => searchSchema.parse(search),
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
      console.error("Loader failed to prefetch blogs for detail route:", err);
    }
  },
  component: BlogDetail,
});
