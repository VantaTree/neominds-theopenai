import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Plus,
  Search,
  Edit2,
  Eye,
  Trash2,
  Calendar,
  User,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Clock,
  HelpCircle,
  EyeOff,
  ClipboardList,
  Star,
} from "lucide-react";
import { type Blog } from "@/lib/schemas";

interface BlogListPageProps {
  blogs: Blog[];
  isLoading: boolean;
  onCreateNew: () => void;
  onDelete: (blog: Blog) => void;
}

export default function BlogListPage({
  blogs,
  isLoading,
  onCreateNew,
  onDelete,
}: BlogListPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft" | "archived"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false);
  const itemsPerPage = 8;

  // --- Statistics Counters ---
  const stats = useMemo(() => {
    return {
      total: blogs.length,
      published: blogs.filter((b) => b.status === "Published").length,
      drafts: blogs.filter((b) => b.status === "Draft").length,
      archived: blogs.filter((b) => b.status === "Archived").length,
    };
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && b.status === "Published") ||
        (statusFilter === "draft" && b.status === "Draft") ||
        (statusFilter === "archived" && b.status === "Archived");

      const matchFeatured = !showOnlyFeatured || b.featured === true;

      const term = searchQuery.toLowerCase();
      const matchSearch =
        !term ||
        b.title.toLowerCase().includes(term) ||
        b.summary.toLowerCase().includes(term) ||
        b.author.toLowerCase().includes(term);

      return matchStatus && matchFeatured && matchSearch;
    });
  }, [blogs, statusFilter, showOnlyFeatured, searchQuery]);

  // --- Pagination Logic ---
  const pageCount = Math.ceil(filteredBlogs.length / itemsPerPage);
  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBlogs.slice(start, start + itemsPerPage);
  }, [filteredBlogs, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pageCount) {
      setCurrentPage(page);
    }
  };

  const formatDate = (dateInput: Date | number | string) => {
    return new Date(dateInput).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Add button */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-mm-border/40">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--color-mm-dark)" }}
          >
            Blog Posts
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--color-mm-gray)" }}
          >
            Create, schedule, and configure customer-facing educational material
            and blogs
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
          style={{ background: "var(--color-mm-orange)" }}
        >
          <Plus size={16} />
          New Blog Post
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Posts",
            val: stats.total,
            icon: BookOpen,
            color: "var(--color-mm-orange)",
            bg: "white",
          },
          {
            label: "Published Articles",
            val: stats.published,
            icon: CheckCircle2,
            color: "var(--color-mm-green)",
            bg: "white",
          },
          {
            label: "Draft Posts",
            val: stats.drafts,
            icon: EyeOff,
            color: "var(--color-mm-orange)",
            bg: "white",
          },
          {
            label: "Archived Posts",
            val: stats.archived,
            icon: AlertTriangle,
            color: "var(--color-mm-gray)",
            bg: "white",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-[24px] border border-mm-border shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between"
            style={{ background: s.bg }}
          >
            <div>
              <div className="text-xs font-semibold text-mm-gray">
                {s.label}
              </div>
              <div className="text-2xl font-bold mt-1 text-mm-dark">
                {s.val}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-mm-border bg-white">
              <s.icon size={18} style={{ color: s.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-mm-gray"
          />
          <input
            type="text"
            placeholder="Search by title, summary, or author..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none bg-white border border-mm-border text-mm-dark"
          />
        </div>

        {/* Filter Actions wrapper */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Featured Toggle */}
          <button
            onClick={() => {
              setShowOnlyFeatured(!showOnlyFeatured);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shrink-0 ${
              showOnlyFeatured
                ? "bg-yellow-50 border-yellow-200 text-yellow-600 shadow-sm"
                : "bg-white border-mm-border text-mm-gray hover:text-mm-dark"
            }`}
          >
            <Star size={12} className={showOnlyFeatured ? "fill-current" : ""} />
            Featured Only
          </button>

          {/* Tab Filters */}
          <div className="flex bg-white border border-mm-border rounded-xl p-1 overflow-x-auto max-w-full scrollbar-none">
            {[
              { id: "all", label: "All Posts" },
              { id: "published", label: "Published" },
              { id: "draft", label: "Drafts" },
              { id: "archived", label: "Archived" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setStatusFilter(f.id as any);
                  setCurrentPage(1);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  statusFilter === f.id
                    ? "bg-white text-mm-orange shadow-sm"
                    : "text-mm-gray hover:text-mm-gray"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blogs Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] w-full gap-2">
          <div className="w-8 h-8 border-4 border-[var(--color-mm-orange)] border-t-transparent rounded-full animate-spin"></div>
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--color-mm-gray)" }}
          >
            Loading posts...
          </span>
        </div>
      ) : paginatedBlogs.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedBlogs.map((b) => (
              <div
                key={b.id}
                className="group flex flex-col rounded-[24px] bg-white border border-mm-border overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300"
              >
                {/* Cover Photo */}
                <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                  <img
                    src={b.coverImageUrl}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {b.featured && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm border flex items-center gap-0.5 bg-yellow-50 text-yellow-600 border-yellow-200"
                      >
                        <Star size={8} className="fill-current" />
                        Featured
                      </span>
                    )}
                    <span
                      className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm border"
                      style={{
                        background:
                          b.status === "Published"
                            ? "rgba(92, 177, 62, 0.1)"
                            : b.status === "Draft"
                              ? "#FFF3E0"
                              : "#F5F5F5",
                        color:
                          b.status === "Published"
                            ? "var(--color-mm-green)"
                            : b.status === "Draft"
                              ? "var(--color-mm-orange)"
                              : "var(--color-mm-gray)",
                        borderColor:
                          b.status === "Published"
                            ? "#A5D6A7"
                            : b.status === "Draft"
                              ? "#FFE082"
                              : "#E0E0E0",
                      }}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>

                {/* Content info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3
                      className="font-bold text-sm leading-snug line-clamp-2 text-mm-dark group-hover:text-mm-orange transition-colors"
                      title={b.title}
                    >
                      {b.title}
                    </h3>
                    <p className="text-xs text-mm-gray line-clamp-3 leading-relaxed">
                      {b.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-mm-border/40 space-y-3">
                    {/* Authorship info */}
                    <div className="flex items-center justify-between text-[10px] text-mm-gray">
                      <div className="flex items-center gap-1">
                        <User size={11} />
                        <span className="truncate max-w-[80px] font-medium text-mm-gray">
                          {b.author}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={11} />
                        <span>{formatDate(b.createdAt)}</span>
                      </div>
                    </div>

                    {/* Actions Ribbon */}
                    <div className="flex justify-end gap-1.5 pt-1">
                      <Link
                        to="/admin/blogs/$id"
                        params={{ id: b.id }}
                        search={{ tab: "preview" }}
                        className="p-2 bg-white border border-mm-border hover:bg-mm-orange/10 hover:text-mm-orange rounded-xl transition-colors text-mm-gray flex items-center justify-center"
                        title="View Preview"
                      >
                        <Eye size={13} />
                      </Link>
                      <Link
                        to="/admin/blogs/$id"
                        params={{ id: b.id }}
                        search={{ tab: "edit" }}
                        className="p-2 bg-white border border-mm-border hover:bg-mm-orange/10 hover:text-mm-orange rounded-xl transition-colors text-mm-gray flex items-center justify-center"
                        title="Edit Post"
                      >
                        <Edit2 size={13} />
                      </Link>
                      <button
                        onClick={() => onDelete(b)}
                        className="p-2 bg-white border border-mm-border hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors text-mm-red flex items-center justify-center"
                        title="Delete Post"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Footer */}
          {pageCount > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-mm-border/30">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-mm-border bg-white hover:bg-mm-subtle disabled:opacity-50 disabled:cursor-not-allowed transition-all text-mm-gray"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-semibold text-mm-gray">
                Page {currentPage} of {pageCount}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pageCount}
                className="p-2 rounded-xl border border-mm-border bg-white hover:bg-mm-subtle disabled:opacity-50 disabled:cursor-not-allowed transition-all text-mm-gray"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-mm-border rounded-[24px] p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-white border border-mm-border rounded-2xl flex items-center justify-center mx-auto text-mm-gray">
            <ClipboardList size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-mm-dark">
              No articles found
            </h3>
            <p className="text-xs text-mm-gray leading-normal">
              There are no blog posts matching your search query or status
              filter. Get started by creating your first article post.
            </p>
          </div>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-(--color-mm-orange) hover:bg-[#d68f15] text-white text-xs font-bold rounded-xl transition-all"
          >
            Create First Post
          </button>
        </div>
      )}
    </div>
  );
}
