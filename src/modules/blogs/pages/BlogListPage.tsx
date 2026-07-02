import { useState, useMemo } from "react";
import { 
  Plus, Search, Edit2, Eye, Trash2, Calendar, User, FileText, 
  CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight, BookOpen, Clock, 
  HelpCircle, EyeOff, ClipboardList
} from "lucide-react";
import type { Blog } from "../types/blog";

interface BlogListPageProps {
  blogs: Blog[];
  isLoading: boolean;
  onCreateNew: () => void;
  onEdit: (blog: Blog) => void;
  onPreview: (blog: Blog) => void;
  onDelete: (blog: Blog) => void;
}

export default function BlogListPage({
  blogs,
  isLoading,
  onCreateNew,
  onEdit,
  onPreview,
  onDelete
}: BlogListPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- Statistics Counters ---
  const stats = useMemo(() => {
    return {
      total: blogs.length,
      published: blogs.filter(b => b.published).length,
      drafts: blogs.filter(b => !b.published).length
    };
  }, [blogs]);

  // --- Search & Filter Logic ---
  const filteredBlogs = useMemo(() => {
    return blogs.filter(b => {
      const matchStatus = 
        statusFilter === "all" ||
        (statusFilter === "published" && b.published) ||
        (statusFilter === "draft" && !b.published);

      const term = searchQuery.toLowerCase();
      const matchSearch = 
        !term ||
        b.title.toLowerCase().includes(term) ||
        b.summary.toLowerCase().includes(term) ||
        b.author.toLowerCase().includes(term);

      return matchStatus && matchSearch;
    });
  }, [blogs, statusFilter, searchQuery]);

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

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Add button */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[#E8DCC8]/40">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-heading)" }}>Blog Posts</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-body)" }}>
            Create, schedule, and configure customer-facing educational material and blogs
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
          style={{ background: "var(--color-primary)" }}
        >
          <Plus size={16} />
          New Blog Post
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Posts", val: stats.total, icon: BookOpen, color: "#E89D18", bg: "#FFFDF8" },
          { label: "Published Articles", val: stats.published, icon: CheckCircle2, color: "#4CAF50", bg: "#FFFDF8" },
          { label: "Draft Posts", val: stats.drafts, icon: EyeOff, color: "#A1887F", bg: "#FFFDF8" }
        ].map(s => (
          <div key={s.label} className="p-5 rounded-[24px] border border-[#E8DCC8] shadow-[0_2px_12px_rgba(78,52,46,0.02)] flex items-center justify-between" style={{ background: s.bg }}>
            <div>
              <div className="text-xs font-semibold text-[#8D6E63]">{s.label}</div>
              <div className="text-2xl font-bold mt-1 text-[#4E342E]">{s.val}</div>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#E8DCC8] bg-white">
              <s.icon size={18} style={{ color: s.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1887F]" />
          <input
            type="text"
            placeholder="Search by title, summary, or author..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none bg-[#FFFDF8] border border-[#E8DCC8] text-[#4E342E]"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex bg-[#FCF8F1] border border-[#E8DCC8] rounded-xl p-1 shrink-0">
          {[
            { id: "all", label: "All Posts" },
            { id: "published", label: "Published" },
            { id: "draft", label: "Drafts" }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => { setStatusFilter(f.id as any); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === f.id ? "bg-white text-[#E89D18] shadow-sm" : "text-[#8D6E63] hover:text-[#6D4C41]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Blogs Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] w-full gap-2">
          <div className="w-8 h-8 border-4 border-[#E89D18] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold" style={{ color: "#8D6E63" }}>Loading posts...</span>
        </div>
      ) : paginatedBlogs.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedBlogs.map(b => (
              <div 
                key={b.id} 
                className="group flex flex-col rounded-[24px] bg-[#FFFDF8] border border-[#E8DCC8] overflow-hidden shadow-[0_2px_12px_rgba(78,52,46,0.03)] hover:shadow-[0_8px_24px_rgba(78,52,46,0.08)] transition-all duration-300"
              >
                {/* Cover Photo */}
                <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                  <img
                    src={b.coverImage}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <span 
                      className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm border"
                      style={{
                        background: b.published ? "#E8F5E9" : "#FFF3E0",
                        color: b.published ? "#4CAF50" : "#E89D18",
                        borderColor: b.published ? "#A5D6A7" : "#FFE082"
                      }}
                    >
                      {b.published ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>

                {/* Content info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm leading-snug line-clamp-2 text-[#4E342E] group-hover:text-[#E89D18] transition-colors" title={b.title}>
                      {b.title}
                    </h3>
                    <p className="text-xs text-[#8D6E63] line-clamp-3 leading-relaxed">
                      {b.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E8DCC8]/40 space-y-3">
                    {/* Authorship info */}
                    <div className="flex items-center justify-between text-[10px] text-[#A1887F]">
                      <div className="flex items-center gap-1">
                        <User size={11} />
                        <span className="truncate max-w-[80px] font-medium text-[#6D4C41]">{b.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={11} />
                        <span>{formatDate(b.createdAt)}</span>
                      </div>
                    </div>

                    {/* Actions Ribbon */}
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => onPreview(b)}
                        className="p-2 bg-[#FCF8F1] border border-[#E8DCC8] hover:bg-[#FFF3D6] hover:text-[#E89D18] rounded-xl transition-colors text-[#6D4C41]"
                        title="View Preview"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => onEdit(b)}
                        className="p-2 bg-[#FCF8F1] border border-[#E8DCC8] hover:bg-[#FFF3D6] hover:text-[#E89D18] rounded-xl transition-colors text-[#6D4C41]"
                        title="Edit Post"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => onDelete(b)}
                        className="p-2 bg-[#FCF8F1] border border-[#E8DCC8] hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors text-[#EF5350]"
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
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-[#E8DCC8]/30">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-[#E8DCC8] bg-white hover:bg-[#F8F1E7] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[#6D4C41]"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-semibold text-[#6D4C41]">
                Page {currentPage} of {pageCount}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pageCount}
                className="p-2 rounded-xl border border-[#E8DCC8] bg-white hover:bg-[#F8F1E7] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[#6D4C41]"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#FFFDF8] border border-[#E8DCC8] rounded-[24px] p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-[#FCF8F1] border border-[#E8DCC8] rounded-2xl flex items-center justify-center mx-auto text-[#A1887F]">
            <ClipboardList size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-[#4E342E]">No articles found</h3>
            <p className="text-xs text-[#8D6E63] leading-normal">
              There are no blog posts matching your search query or status filter. Get started by creating your first article post.
            </p>
          </div>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-[#E89D18] hover:bg-[#d68f15] text-white text-xs font-bold rounded-xl transition-all"
          >
            Create First Post
          </button>
        </div>
      )}
    </div>
  );
}
