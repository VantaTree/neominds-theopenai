import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import Lenis from "lenis";
import { MymindNav } from "@/components/mymind/MymindNav";
import { MymindFooter } from "@/components/mymind/MymindFooter";
import { useBlogSingle } from "@/modules/blogs/hooks/useBlogs";
import { dbKeys } from "@/lib/db-keys";
import { fetchBlogBySlugFn } from "@/lib/server-functions";
import { Calendar, User, ArrowLeft, Clock, Star } from "lucide-react";

export const Route = createFileRoute("/blogs/$slug")({
  head: ({ loaderData }) => {
    const data = loaderData as { blog?: any } | undefined;
    return {
      meta: [
        {
          title: data?.blog
            ? `${data.blog.title} — GrowConsult AI`
            : "Blog — GrowConsult AI",
        },
        {
          name: "description",
          content:
            data?.blog?.summary ||
            "Read this article on the GrowConsult AI Blog.",
        },
      ],
    };
  },
  loader: async ({ context, params }) => {
    try {
      const blog = await context.queryClient.ensureQueryData({
        queryKey: dbKeys.blog(params.slug),
        queryFn: async () => {
          const res = await fetchBlogBySlugFn({ data: params.slug });
          return res;
        },
      });
      return { blog };
    } catch (err) {
      console.error("Loader failed to prefetch blog by slug for public route:", err);
      return { blog: null };
    }
  },
  component: BlogDetailPage,
});

function BlogDetailPage() {
  const { slug } = useParams({ from: "/blogs/$slug" });
  const { data: blog, isLoading } = useBlogSingle(slug);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // Format date helper
  const formatDate = (dateInput: Date | number | string) => {
    return new Date(dateInput).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Estimate read time based on word count
  const getReadTime = (content: string) => {
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  };

  const isPublished = blog && blog.status === "Published";

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans selection:bg-mm-orange/20 selection:text-mm-dark">
      <MymindNav />

      <main className="flex-1 pt-28 pb-24">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-8 h-8 border-4 border-mm-orange border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold text-mm-gray">
              Loading article...
            </span>
          </div>
        ) : !blog || !isPublished ? (
          <div className="max-w-md mx-auto px-6 py-24 text-center space-y-6">
            <h2 className="text-2xl font-black text-mm-dark">Article Not Found</h2>
            <p className="text-sm text-mm-gray leading-relaxed">
              The article you are looking for does not exist, has been deleted, or is not currently published.
            </p>
            <div>
              <Link
                to="/blogs"
                className="inline-flex items-center gap-2 px-5 py-3 bg-mm-orange hover:bg-[#d68f15] text-white text-xs font-bold rounded-2xl transition-all shadow-sm hover:shadow-md"
              >
                <ArrowLeft size={13} />
                Back to Blogs
              </Link>
            </div>
          </div>
        ) : (
          <article className="max-w-3xl mx-auto px-6 space-y-8">
            {/* Back Link */}
            <div className="pt-4">
              <Link
                to="/blogs"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-mm-gray hover:text-mm-dark transition-colors group"
              >
                <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                Back to all articles
              </Link>
            </div>

            {/* Article Header info */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs text-mm-gray font-medium">
                {blog.featured && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-yellow-50 text-yellow-600 border border-yellow-200 flex items-center gap-0.5">
                    <Star size={8} className="fill-current" />
                    Featured
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <User size={12} />
                  {blog.author}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDate(blog.createdAt)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {getReadTime(blog.content)}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-mm-dark leading-tight tracking-tight">
                {blog.title}
              </h1>

              <p className="text-base sm:text-lg text-mm-gray leading-relaxed italic border-l-4 border-mm-orange/30 pl-4 py-1">
                "{blog.summary}"
              </p>
            </div>

            {/* Cover Image */}
            <div className="aspect-video w-full rounded-[28px] overflow-hidden border border-stone-200 shadow-sm bg-stone-100">
              <img
                src={blog.coverImageUrl}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Article Content Body */}
            <div 
              className="w-full text-mm-dark leading-relaxed pt-4 space-y-6
                [&_h2]:text-2xl [&_h2]:font-black [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-mm-dark [&_h2]:tracking-tight
                [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-mm-dark [&_h3]:tracking-tight
                [&_p]:leading-relaxed [&_p]:mb-4
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ul]:space-y-1.5
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_ol]:space-y-1.5
                [&_li]:my-1 [&_li]:leading-relaxed
                [&_blockquote]:border-l-4 [&_blockquote]:border-mm-orange [&_blockquote]:italic [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:text-mm-gray [&_blockquote]:bg-stone-50 [&_blockquote]:py-2 [&_blockquote]:pr-2 [&_blockquote]:rounded-r-lg
                [&_pre]:bg-stone-900 [&_pre]:text-stone-100 [&_pre]:p-4 [&_pre]:rounded-2xl [&_pre]:font-mono [&_pre]:text-xs [&_pre]:my-4 [&_pre]:overflow-x-auto
                [&_code]:bg-stone-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:font-mono [&_code]:text-xs [&_code]:text-mm-orange [&_code]:font-semibold
                [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-stone-100 [&_pre_code]:font-normal
                [&_a]:text-mm-orange [&_a]:underline [&_a]:font-semibold hover:[&_a]:text-[#d68f15]
                [&_hr]:border-stone-200 [&_hr]:my-6
                [&_img]:rounded-2xl [&_img]:border [&_img]:border-stone-200 [&_img]:max-w-full [&_img]:h-auto [&_img]:my-6"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </article>
        )}
      </main>

      <MymindFooter />
    </div>
  );
}
