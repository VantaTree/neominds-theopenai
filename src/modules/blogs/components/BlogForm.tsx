import { useState, useEffect, useRef } from "react";
import { 
  Bold, Italic, Underline, List, ListOrdered, Link, Heading1, Heading2, 
  UploadCloud, ArrowLeft, Loader2, FileText, CheckCircle2, ShieldAlert, Eye
} from "lucide-react";
import { type Blog } from "@/lib/schemas";

export type CreateBlogInput = Omit<Blog, "id" | "createdAt" | "updatedAt">;

// Helper for cover image uploads (converts file to Base64 dataURL)
const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

interface BlogFormProps {
  initialBlog?: Blog | null;
  onSave: (data: CreateBlogInput) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export default function BlogForm({ initialBlog, onSave, onCancel, isSaving }: BlogFormProps) {
  const [title, setTitle] = useState(initialBlog?.title || "");
  const [slug, setSlug] = useState(initialBlog?.slug || "");
  const [summary, setSummary] = useState(initialBlog?.summary || "");
  const [content, setContent] = useState(initialBlog?.content || "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialBlog?.coverImageUrl || "");
  const [author, setAuthor] = useState(initialBlog?.author || "Admin");
  const [published, setPublished] = useState(initialBlog?.status === "Published");

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const editorRef = useRef<HTMLDivElement>(null);

  // Generate slug dynamically from title
  useEffect(() => {
    if (!initialBlog && title) {
      const generatedSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generatedSlug);
    }
  }, [title, initialBlog]);

  // Sync content editor on load
  useEffect(() => {
    if (editorRef.current && content && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, []);

  const handleEditorChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  // Custom Rich Text Action Helper
  const applyStyle = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    handleEditorChange();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    try {
      const url = await uploadImage(file);
      setCoverImageUrl(url);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = "Title is required";
    if (!slug.trim()) errors.slug = "Slug is required";
    if (!summary.trim()) errors.summary = "Summary is required";
    if (!content.trim() || content === "<br>" || content === "<div><br></div>") {
      errors.content = "Content is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    onSave({
      title,
      slug,
      summary,
      content,
      coverImageUrl: coverImageUrl || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
      author,
      status: published ? "Published" : "Draft",
      featured: initialBlog?.featured || false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8DCC8]/40">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-[#F8F1E7] rounded-xl transition-colors text-[#6D4C41]"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--color-heading)" }}>
              {initialBlog ? "Edit Blog Post" : "Create New Post"}
            </h1>
            <p className="text-xs text-[#8D6E63]">
              Write and customize rich posts for GrowConsult AI platform
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-[#E8DCC8] hover:bg-[#F8F1E7] rounded-xl text-sm font-semibold text-[#6D4C41]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
            style={{ background: "var(--color-primary)" }}
          >
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            {initialBlog ? "Save Changes" : "Publish Post"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor Fields */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-[#FCF8F1] border border-[#E8DCC8] p-5 rounded-[24px] space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-1.5">Post Title*</label>
              <input
                type="text"
                placeholder="e.g. Scaling Your Business with AI Strategy"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm rounded-xl px-4 py-2.5 outline-none bg-white border border-[#E8DCC8] text-[#4E342E]"
                style={{ borderColor: formErrors.title ? "#EF5350" : undefined }}
              />
              {formErrors.title && <p className="text-xs text-[#EF5350] mt-1">{formErrors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-1.5">URL Slug*</label>
                <input
                  type="text"
                  placeholder="auto-generated-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full text-sm rounded-xl px-4 py-2.5 outline-none bg-white border border-[#E8DCC8] text-[#4E342E]"
                  style={{ borderColor: formErrors.slug ? "#EF5350" : undefined }}
                />
                {formErrors.slug && <p className="text-xs text-[#EF5350] mt-1">{formErrors.slug}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-1.5">Author Name</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full text-sm rounded-xl px-4 py-2.5 outline-none bg-white border border-[#E8DCC8] text-[#4E342E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-1.5">Post Summary / Excerpt*</label>
              <textarea
                rows={3}
                placeholder="Write a brief, catchy summary of what this post is about..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full text-sm rounded-xl px-4 py-2.5 outline-none bg-white border border-[#E8DCC8] text-[#4E342E] resize-none"
                style={{ borderColor: formErrors.summary ? "#EF5350" : undefined }}
              />
              {formErrors.summary && <p className="text-xs text-[#EF5350] mt-1">{formErrors.summary}</p>}
            </div>
          </div>

          {/* Premium Rich Text Editor */}
          <div className="bg-[#FCF8F1] border border-[#E8DCC8] rounded-[24px] overflow-hidden flex flex-col" style={{ minHeight: "400px" }}>
            <div className="p-3 bg-[#FFFDF8] border-b border-[#E8DCC8] flex flex-wrap gap-1.5 items-center">
              <button type="button" onClick={() => applyStyle("bold")} className="p-2 hover:bg-[#F8F1E7] rounded-lg transition-colors text-[#6D4C41]" title="Bold"><Bold size={15} /></button>
              <button type="button" onClick={() => applyStyle("italic")} className="p-2 hover:bg-[#F8F1E7] rounded-lg transition-colors text-[#6D4C41]" title="Italic"><Italic size={15} /></button>
              <button type="button" onClick={() => applyStyle("underline")} className="p-2 hover:bg-[#F8F1E7] rounded-lg transition-colors text-[#6D4C41]" title="Underline"><Underline size={15} /></button>
              <div className="w-px h-5 bg-[#E8DCC8] mx-1"></div>
              <button type="button" onClick={() => applyStyle("formatBlock", "h2")} className="p-2 hover:bg-[#F8F1E7] rounded-lg transition-colors text-[#6D4C41]" title="H2"><Heading1 size={15} /></button>
              <button type="button" onClick={() => applyStyle("formatBlock", "h3")} className="p-2 hover:bg-[#F8F1E7] rounded-lg transition-colors text-[#6D4C41]" title="H3"><Heading2 size={15} /></button>
              <div className="w-px h-5 bg-[#E8DCC8] mx-1"></div>
              <button type="button" onClick={() => applyStyle("insertUnorderedList")} className="p-2 hover:bg-[#F8F1E7] rounded-lg transition-colors text-[#6D4C41]" title="Bullet List"><List size={15} /></button>
              <button type="button" onClick={() => applyStyle("insertOrderedList")} className="p-2 hover:bg-[#F8F1E7] rounded-lg transition-colors text-[#6D4C41]" title="Numbered List"><ListOrdered size={15} /></button>
              <div className="w-px h-5 bg-[#E8DCC8] mx-1"></div>
              <button
                type="button"
                onClick={() => {
                  const url = prompt("Enter link URL:");
                  if (url) applyStyle("createLink", url);
                }}
                className="p-2 hover:bg-[#F8F1E7] rounded-lg transition-colors text-[#6D4C41]"
                title="Insert Link"
              >
                <Link size={15} />
              </button>
            </div>
            
            <div className="flex-1 p-5 bg-white relative">
              <div
                ref={editorRef}
                contentEditable
                onInput={handleEditorChange}
                className="prose max-w-none w-full h-full outline-none text-[#4E342E] text-sm overflow-y-auto"
                style={{ minHeight: "300px" }}
                data-placeholder="Write your article content here..."
              />
              {formErrors.content && <p className="text-xs text-[#EF5350] mt-1">{formErrors.content}</p>}
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-5">
          {/* Post Image Upload */}
          <div className="bg-[#FCF8F1] border border-[#E8DCC8] p-5 rounded-[24px] space-y-4">
            <label className="block text-xs font-bold text-[#8D6E63] uppercase tracking-wider">Cover Image</label>
            
            {coverImageUrl ? (
              <div className="relative group rounded-xl overflow-hidden aspect-video border border-[#E8DCC8]">
                <img src={coverImageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setCoverImageUrl("")}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-all"
                >
                  Change Image
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-[#E8DCC8] hover:border-[#E89D18] transition-colors rounded-xl p-6 text-center cursor-pointer relative bg-white">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  disabled={isUploading}
                />
                <UploadCloud size={24} className="mx-auto text-[#A1887F] mb-2" />
                <p className="text-xs font-semibold text-[#6D4C41]">
                  {isUploading ? "Uploading..." : "Click or drag image to upload"}
                </p>
                <p className="text-[10px] text-[#A1887F] mt-1">PNG, JPG, or WEBP up to 5MB</p>
              </div>
            )}
            {uploadError && <p className="text-xs text-[#EF5350]">{uploadError}</p>}
          </div>

          {/* Visibility / Status */}
          <div className="bg-[#FCF8F1] border border-[#E8DCC8] p-5 rounded-[24px] space-y-4">
            <label className="block text-xs font-bold text-[#8D6E63] uppercase tracking-wider">Publishing Status</label>
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DCC8]/40">
              <div>
                <p className="text-xs font-bold text-[#4E342E]">Visible to Clients</p>
                <p className="text-[11px] text-[#8D6E63]">Make this post public instantly</p>
              </div>
              <button
                type="button"
                onClick={() => setPublished(!published)}
                className="w-12 h-6 rounded-full relative transition-colors"
                style={{ background: published ? "var(--color-primary)" : "#E8DCC8" }}
              >
                <span
                  className="w-4 h-4 bg-white rounded-full absolute top-1 transition-all"
                  style={{ left: published ? "26px" : "4px" }}
                />
              </button>
            </div>

            <div className="flex items-center gap-2 p-3.5 rounded-xl text-xs font-medium" 
              style={{ 
                background: published ? "#E8F5E9" : "#FFF3E0", 
                color: published ? "#4CAF50" : "#E89D18",
                border: `1px solid ${published ? "#4CAF50" : "#E89D18"}`
              }}
            >
              {published ? <CheckCircle2 size={15} /> : <ShieldAlert size={15} />}
              <span>{published ? "Published (Live on customer portal)" : "Draft (Only visible in admin panel)"}</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
