import { useState } from "react";
import { 
  ArrowLeft, Calendar, User, Eye, Monitor, Smartphone, Share2, 
  Copy, Check, ExternalLink, RefreshCw
} from "lucide-react";
import { type Blog } from "@/lib/schemas";

interface BlogPreviewProps {
  blog: Blog;
  onBack: () => void;
  onEdit?: () => void;
}

export default function BlogPreview({ blog, onBack, onEdit }: BlogPreviewProps) {
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [isCopied, setIsCopied] = useState(false);

  const formattedDate = new Date(blog.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const handleCopyLink = () => {
    setIsCopied(true);
    navigator.clipboard.writeText(`${window.location.origin}/blogs/${blog.slug}`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-mm-border/40">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 hover:bg-mm-subtle rounded-xl transition-colors text-mm-gray"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--color-mm-dark)" }}>
              Post Preview
            </h1>
            <p className="text-xs text-mm-gray">
              Verify how your article renders for portal visitors
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white border border-mm-border rounded-xl p-1 shrink-0">
          <button
            onClick={() => setDeviceMode("desktop")}
            className={`p-2 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all ${
              deviceMode === "desktop" ? "bg-white text-mm-orange shadow-sm" : "text-mm-gray hover:text-mm-gray"
            }`}
          >
            <Monitor size={14} />
            Desktop
          </button>
          <button
            onClick={() => setDeviceMode("mobile")}
            className={`p-2 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all ${
              deviceMode === "mobile" ? "bg-white text-mm-orange shadow-sm" : "text-mm-gray hover:text-mm-gray"
            }`}
          >
            <Smartphone size={14} />
            Mobile
          </button>
        </div>

        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 border border-mm-border hover:bg-mm-subtle rounded-xl text-sm font-semibold text-mm-gray"
            >
              Edit Post
            </button>
          )}
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-[var(--color-mm-orange)] hover:bg-[#d68f15] text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            {isCopied ? <Check size={14} /> : <Share2 size={14} />}
            {isCopied ? "Link Copied!" : "Share Link"}
          </button>
        </div>
      </div>

      {/* Preview Workspace */}
      <div className="flex justify-center bg-mm-subtle/30 border border-mm-border/40 rounded-[32px] p-6 lg:p-12 overflow-x-auto min-h-[600px]">
        <div
          className="transition-all duration-300 bg-white shadow-xl border border-mm-border"
          style={{
            width: deviceMode === "desktop" ? "100%" : "380px",
            maxWidth: deviceMode === "desktop" ? "850px" : "380px",
            borderRadius: deviceMode === "desktop" ? "24px" : "36px",
            height: deviceMode === "desktop" ? "auto" : "700px",
            overflowY: "auto"
          }}
        >
          {/* Mobile Shell Top Notch */}
          {deviceMode === "mobile" && (
            <div className="h-6 w-full bg-white flex justify-center items-center sticky top-0 z-10 border-b border-mm-border/50">
              <div className="w-16 h-3 bg-[var(--color-mm-border)] rounded-full"></div>
            </div>
          )}

          {/* Cover image banner */}
          <div className="relative aspect-video w-full overflow-hidden">
            <img
              src={blog.coverImageUrl || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80"}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--color-mm-orange)]">
                {blog.status === "Published" ? "Live Post" : "Draft Preview"}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold leading-tight drop-shadow-sm">
                {blog.title}
              </h2>
            </div>
          </div>

          {/* Meta & Excerpt */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center gap-4 text-xs text-mm-gray pb-4 border-b border-mm-border/30">
              <div className="flex items-center gap-1.5">
                <User size={13} className="text-mm-gray" />
                <span className="font-semibold text-mm-dark">{blog.author}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-mm-gray" />
                <span>{formattedDate}</span>
              </div>
            </div>

            {/* Post Summary Callout */}
            <div className="p-4 rounded-xl border-l-4 border-[var(--color-mm-orange)] bg-white text-mm-gray text-xs leading-relaxed italic">
              "{blog.summary}"
            </div>

            {/* Rich Content Container */}
            <div 
              className="prose prose-sm max-w-none text-mm-dark leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
