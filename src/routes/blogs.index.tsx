import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import Lenis from "lenis";
import { MymindNav } from "@/components/mymind/MymindNav";
import { MymindFooter } from "@/components/mymind/MymindFooter";
import { useBlogsList } from "@/modules/blogs/hooks/useBlogs";
import { dbKeys } from "@/lib/db-keys";
import { fetchBlogsFn } from "@/lib/server-functions";
import { Calendar, User, ArrowRight, BookOpen } from "lucide-react";

export const Route = createFileRoute("/blogs/")({
  head: () => ({
    meta: [
      { title: "Blogs & Stories — GrowConsult AI" },
      {
        name: "description",
        content:
          "Read design insights, technology essays, and product updates from the GrowConsult AI team.",
      },
    ],
  }),
  loader: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData({
        queryKey: dbKeys.blogs(true),
        queryFn: async () => {
          const res = await fetchBlogsFn({ data: { onlyPublished: true } });
          return res;
        },
      });
    } catch (err) {
      console.error("Loader failed to prefetch blogs for public route:", err);
    }
  },
  component: BlogsPage,
});

function BlogsPage() {
  const { data: blogs = [], isLoading } = useBlogsList(true);

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

  // Filter and sort blogs: sorted by createdAt descending
  const sortedBlogs = useMemo(() => {
    return [...blogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [blogs]);

  // Separate featured and regular articles
  const { featuredBlogs, regularBlogs } = useMemo(() => {
    const featured = sortedBlogs.filter((b) => b.featured);
    const regular = sortedBlogs.filter((b) => !b.featured);
    return { featuredBlogs: featured, regularBlogs: regular };
  }, [sortedBlogs]);

  // Primary featured blog (the latest featured article)
  const primaryFeatured = featuredBlogs[0];
  // Secondary featured blogs (other than the primary featured)
  const secondaryFeatured = featuredBlogs.slice(1);

  // Format date helper
  const formatDate = (dateInput: Date | number | string) => {
    return new Date(dateInput).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans selection:bg-mm-orange/20 selection:text-mm-dark">
      <MymindNav />

      {/* Main Blog Workspace */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 sm:px-8 pt-32 pb-24 space-y-16">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-4 border-mm-orange border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold text-mm-gray">
              Fetching articles...
            </span>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 space-y-3 max-w-md mx-auto">
            <h2 className="text-lg font-bold text-mm-dark">No Articles Published</h2>
            <p className="text-xs text-mm-gray">
              We are working on bringing exciting content and product updates to you soon. Please check back later!
            </p>
          </div>
        ) : (
          <>
            {/* Featured Articles Section */}
            {primaryFeatured && (
              <div className="space-y-6">
                <div className="text-[10px] font-bold text-mm-gray uppercase tracking-widest border-b border-stone-200 pb-2">
                  Featured Article
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-stone-200 rounded-[32px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all duration-500 group">
                  {/* Hero Cover Image Overlay (BlogPreview card style) */}
                  <div className="lg:col-span-7 relative aspect-video lg:aspect-auto min-h-[300px] sm:min-h-[400px] overflow-hidden bg-stone-100">
                    <img
                      src={primaryFeatured.coverImageUrl}
                      alt={primaryFeatured.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-stone-900/80 via-stone-900/30 to-transparent"></div>
                    
                    {/* Title overlaying on Cover */}
                    <div className="absolute bottom-6 left-6 right-6 text-white space-y-2 lg:hidden">
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-yellow-400 text-stone-900">
                        ★ Featured
                      </span>
                      <h2 className="text-xl font-bold leading-tight drop-shadow-sm">
                        {primaryFeatured.title}
                      </h2>
                    </div>
                  </div>

                  {/* Hero Meta & Info */}
                  <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-xs text-mm-gray font-medium">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {primaryFeatured.author}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(primaryFeatured.createdAt)}
                        </span>
                      </div>
                      
                      <h2 className="text-2xl sm:text-3xl font-black text-mm-dark leading-tight group-hover:text-mm-orange transition-colors hidden lg:block">
                        {primaryFeatured.title}
                      </h2>
                      
                      <p className="text-sm text-mm-gray leading-relaxed line-clamp-4">
                        {primaryFeatured.summary}
                      </p>
                    </div>

                    <div>
                      <Link
                        to="/blogs/$slug"
                        params={{ slug: primaryFeatured.slug }}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-mm-orange hover:bg-[#d68f15] text-white text-xs font-bold rounded-2xl transition-all shadow-sm hover:shadow-md"
                      >
                        Read Article
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Secondary Featured Grid */}
            {secondaryFeatured.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {secondaryFeatured.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white border border-stone-200 rounded-[28px] overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300 group flex flex-col justify-between"
                  >
                    {/* BlogPreview card style: Title and badge overlaid on cover */}
                    <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                      <img
                        src={b.coverImageUrl}
                        alt={b.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-stone-900/85 via-stone-900/20 to-transparent"></div>
                      
                      <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-yellow-400 text-stone-900">
                          ★ Featured
                        </span>
                        <h3 className="text-sm sm:text-base font-bold leading-tight drop-shadow-sm line-clamp-2">
                          {b.title}
                        </h3>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] text-mm-gray font-medium">
                          <span>{b.author}</span>
                          <span>•</span>
                          <span>{formatDate(b.createdAt)}</span>
                        </div>
                        <p className="text-xs text-mm-gray leading-relaxed line-clamp-3">
                          {b.summary}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-stone-100">
                        <Link
                          to="/blogs/$slug"
                          params={{ slug: b.slug }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-mm-orange hover:text-[#d68f15] transition-colors"
                        >
                          Read Article
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Regular Articles Section */}
            {regularBlogs.length > 0 && (
              <div className="space-y-6">
                <div className="text-[10px] font-bold text-mm-gray uppercase tracking-widest border-b border-stone-200 pb-2">
                  Latest Articles
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {regularBlogs.map((b) => (
                    <div
                      key={b.id}
                      className="group flex flex-col bg-white border border-stone-200 rounded-[24px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all duration-300"
                    >
                      {/* BlogPreview card style: Title overlaid on cover image */}
                      <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                        <img
                          src={b.coverImageUrl}
                          alt={b.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-stone-900/80 via-stone-900/10 to-transparent"></div>
                        
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <h3 className="text-xs sm:text-sm font-bold leading-tight drop-shadow-sm line-clamp-2">
                            {b.title}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-[10px] text-mm-gray">
                            <span className="font-semibold">{b.author}</span>
                            <span>•</span>
                            <span>{formatDate(b.createdAt)}</span>
                          </div>
                          
                          <p className="text-xs text-mm-gray line-clamp-3 leading-relaxed">
                            {b.summary}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-stone-100">
                          <Link
                            to="/blogs/$slug"
                            params={{ slug: b.slug }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-mm-orange hover:text-[#d68f15] transition-colors"
                          >
                            Read Article
                            <ArrowRight size={12} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <MymindFooter />
    </div>
  );
}
