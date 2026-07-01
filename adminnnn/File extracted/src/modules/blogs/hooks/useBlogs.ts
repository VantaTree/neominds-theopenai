import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchBlogs,
  fetchBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog
} from "../services/blogService";
import type { CreateBlogInput, UpdateBlogInput, Blog } from "../types/blog";

export const useBlogsList = (onlyPublished = false) => {
  return useQuery<Blog[]>({
    queryKey: ["blogs", onlyPublished],
    queryFn: () => fetchBlogs(onlyPublished)
  });
};

export const useBlogSingle = (slug: string) => {
  return useQuery<Blog | null>({
    queryKey: ["blog", slug],
    queryFn: () => fetchBlogBySlug(slug),
    enabled: !!slug
  });
};

export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation<Blog, Error, CreateBlogInput>({
    mutationFn: (data) => createBlog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    }
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation<Blog, Error, { id: string; data: UpdateBlogInput }>({
    mutationFn: ({ id, data }) => updateBlog(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog", data.slug] });
    }
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    }
  });
};
