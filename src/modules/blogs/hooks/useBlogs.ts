import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchBlogsFn,
  fetchBlogBySlugFn,
  createBlogFn,
  updateBlogFn,
  deleteBlogFn,
} from "@/lib/server-functions";
import { type Blog } from "@/lib/schemas";
import { dbKeys } from "@/lib/db-keys";

export type CreateBlogInput = Omit<Blog, "id" | "createdAt" | "updatedAt">;
export type UpdateBlogInput = Partial<CreateBlogInput>;

export const useBlogsList = (onlyPublished = false) => {
  return useQuery<Blog[]>({
    queryKey: dbKeys.blogs(onlyPublished),
    queryFn: async () => {
      const res = await fetchBlogsFn({ data: { onlyPublished } });
      return res as Blog[];
    }
  });
};

export const useBlogSingle = (slug: string) => {
  return useQuery<Blog | null>({
    queryKey: dbKeys.blog(slug),
    queryFn: async () => {
      const res = await fetchBlogBySlugFn({ data: slug });
      return res as Blog | null;
    },
    enabled: !!slug
  });
};

export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation<Blog, Error, CreateBlogInput>({
    mutationFn: async (data) => {
      const res = await createBlogFn({ data });
      return res as Blog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dbKeys.blogs() });
    }
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation<Blog, Error, { id: string; data: UpdateBlogInput }>({
    mutationFn: async ({ id, data }) => {
      const res = await updateBlogFn({ data: { id, data } });
      return res as Blog;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: dbKeys.blogs() });
      queryClient.invalidateQueries({ queryKey: dbKeys.blog(data.slug) });
    }
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await deleteBlogFn({ data: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dbKeys.blogs() });
    }
  });
};

