import { useState, useEffect, useRef } from "react";
import { 
  Bold, Italic, Underline, List, ListOrdered, Link, Heading1, Heading2, 
  UploadCloud, ArrowLeft, Loader2, FileText, CheckCircle2, ShieldAlert, Eye,
  Code2, Quote, Minus, Image, Sparkles
} from "lucide-react";
import { type Blog, type BlogStatus } from "@/lib/schemas";

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
  onSave?: (data: CreateBlogInput) => Promise<void>;
  onCancel?: () => void;
  isSaving?: boolean;
  onChange?: (data: CreateBlogInput) => void;
  hideHeader?: boolean;
}

export default function BlogForm({ 
  initialBlog, 
  onSave, 
  onCancel, 
  isSaving,
  onChange,
  hideHeader = false
}: BlogFormProps) {
  const [title, setTitle] = useState(initialBlog?.title || "");
  const [slug, setSlug] = useState(initialBlog?.slug || "");
  const [summary, setSummary] = useState(initialBlog?.summary || "");
  const [content, setContent] = useState(initialBlog?.content || "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialBlog?.coverImageUrl || "");
  const [author, setAuthor] = useState(initialBlog?.author || "Admin");
  const [status, setStatus] = useState<BlogStatus>(initialBlog?.status || "Draft");
  const [featured, setFeatured] = useState(initialBlog?.featured || false);

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

  const [activeStyles, setActiveStyles] = useState({
    bold: false,
    italic: false,
    underline: false,
    h2: false,
    h3: false,
    blockquote: false,
    bulletList: false,
    numberList: false,
  });

  const updateActiveStyles = () => {
    if (typeof document === "undefined") return;
    setActiveStyles({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      h2: document.queryCommandValue("formatBlock") === "h2" || document.queryCommandValue("formatBlock") === "H2",
      h3: document.queryCommandValue("formatBlock") === "h3" || document.queryCommandValue("formatBlock") === "H3",
      blockquote: document.queryCommandValue("formatBlock") === "blockquote",
      bulletList: document.queryCommandState("insertUnorderedList"),
      numberList: document.queryCommandState("insertOrderedList"),
    });
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
    updateActiveStyles();
  };

  // Custom Rich Text Action Helper
  const applyStyle = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    handleEditorChange();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Insert code block wrapped in pre/code tags
  const insertCodeBlock = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.textContent = selection.toString() || "Code block content...";
    pre.appendChild(code);
    range.deleteContents();
    range.insertNode(pre);
    
    // Move selection inside code block
    const newRange = document.createRange();
    newRange.selectNodeContents(code);
    selection.removeAllRanges();
    selection.addRange(newRange);
    
    handleEditorChange();
    if (editorRef.current) editorRef.current.focus();
  };

  // Insert image via URL
  const insertImageUrl = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      document.execCommand("insertImage", false, url);
      handleEditorChange();
    }
  };

  // Handle Markdown-like typing shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const startNode = range.startContainer;
    
    if (startNode.nodeType === Node.TEXT_NODE) {
      const text = startNode.nodeValue || "";
      const offset = range.startOffset;

      if (e.key === " ") {
        const textBeforeCursor = text.substring(0, offset);

        if (textBeforeCursor === "##") {
          e.preventDefault();
          document.execCommand("delete", false);
          document.execCommand("delete", false);
          document.execCommand("formatBlock", false, "h2");
        } else if (textBeforeCursor === "###") {
          e.preventDefault();
          document.execCommand("delete", false);
          document.execCommand("delete", false);
          document.execCommand("delete", false);
          document.execCommand("formatBlock", false, "h3");
        } else if (textBeforeCursor === ">") {
          e.preventDefault();
          document.execCommand("delete", false);
          document.execCommand("formatBlock", false, "blockquote");
        } else if (textBeforeCursor === "-" || textBeforeCursor === "*") {
          e.preventDefault();
          document.execCommand("delete", false);
          document.execCommand("insertUnorderedList", false);
        } else if (textBeforeCursor === "1.") {
          e.preventDefault();
          document.execCommand("delete", false);
          document.execCommand("delete", false);
          document.execCommand("insertOrderedList", false);
        }
      }
      
      if (e.key === "Enter") {
        const textBeforeCursor = text.substring(0, offset);
        if (textBeforeCursor === "---") {
          e.preventDefault();
          document.execCommand("delete", false);
          document.execCommand("delete", false);
          document.execCommand("delete", false);
          document.execCommand("insertHorizontalRule", false);
        }
      }
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

  // Fire onChange callback on updates
  useEffect(() => {
    if (onChange) {
      onChange({
        title,
        slug,
        summary,
        content,
        coverImageUrl: coverImageUrl || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
        author,
        status,
        featured,
      });
    }
  }, [title, slug, summary, content, coverImageUrl, author, status, featured, onChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave) return;
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
      status,
      featured,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Panel */}
      {!hideHeader && (
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-mm-border/40">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="p-2 hover:bg-mm-subtle rounded-xl transition-colors text-mm-gray"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "var(--color-mm-dark)" }}>
                {initialBlog ? "Edit Blog Post" : "Create New Post"}
              </h1>
              <p className="text-xs text-mm-gray">
                Write and customize rich posts for GrowConsult AI platform
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-mm-border hover:bg-mm-subtle rounded-xl text-sm font-semibold text-mm-gray"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ background: "var(--color-mm-orange)" }}
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              {initialBlog ? "Save Changes" : "Publish Post"}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor Fields */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-mm-border p-5 rounded-[24px] space-y-4">
            <div>
              <label className="block text-xs font-bold text-mm-gray uppercase tracking-wider mb-1.5">Post Title*</label>
              <input
                type="text"
                placeholder="e.g. Scaling Your Business with AI Strategy"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm rounded-xl px-4 py-2.5 outline-none bg-white border border-mm-border text-mm-dark"
                style={{ borderColor: formErrors.title ? "var(--color-mm-red)" : undefined }}
              />
              {formErrors.title && <p className="text-xs text-mm-red mt-1">{formErrors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-mm-gray uppercase tracking-wider mb-1.5">URL Slug*</label>
                <input
                  type="text"
                  placeholder="auto-generated-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full text-sm rounded-xl px-4 py-2.5 outline-none bg-white border border-mm-border text-mm-dark"
                  style={{ borderColor: formErrors.slug ? "var(--color-mm-red)" : undefined }}
                />
                {formErrors.slug && <p className="text-xs text-mm-red mt-1">{formErrors.slug}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-mm-gray uppercase tracking-wider mb-1.5">Author Name</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full text-sm rounded-xl px-4 py-2.5 outline-none bg-white border border-mm-border text-mm-dark"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-mm-gray uppercase tracking-wider mb-1.5">Post Summary / Excerpt*</label>
              <textarea
                rows={3}
                placeholder="Write a brief, catchy summary of what this post is about..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full text-sm rounded-xl px-4 py-2.5 outline-none bg-white border border-mm-border text-mm-dark resize-none"
                style={{ borderColor: formErrors.summary ? "var(--color-mm-red)" : undefined }}
              />
              {formErrors.summary && <p className="text-xs text-mm-red mt-1">{formErrors.summary}</p>}
            </div>
          </div>

          {/* Premium Rich Text Editor */}
          <div className="bg-white border border-mm-border rounded-[24px] overflow-hidden flex flex-col shadow-[0_2px_16px_rgba(0,0,0,0.01)]" style={{ minHeight: "450px" }}>
            {/* Toolbar */}
            <div className="p-3 bg-stone-50 border-b border-mm-border flex flex-wrap gap-1.5 items-center">
              <button type="button" onClick={() => applyStyle("bold")} className={`p-2 rounded-lg transition-colors ${activeStyles.bold ? "bg-mm-orange/10 text-mm-orange border border-mm-orange/20" : "hover:bg-mm-subtle text-mm-gray"}`} title="Bold"><Bold size={15} /></button>
              <button type="button" onClick={() => applyStyle("italic")} className={`p-2 rounded-lg transition-colors ${activeStyles.italic ? "bg-mm-orange/10 text-mm-orange border border-mm-orange/20" : "hover:bg-mm-subtle text-mm-gray"}`} title="Italic"><Italic size={15} /></button>
              <button type="button" onClick={() => applyStyle("underline")} className={`p-2 rounded-lg transition-colors ${activeStyles.underline ? "bg-mm-orange/10 text-mm-orange border border-mm-orange/20" : "hover:bg-mm-subtle text-mm-gray"}`} title="Underline"><Underline size={15} /></button>
              
              <div className="w-px h-5 bg-stone-200 mx-1"></div>
              
              <button type="button" onClick={() => applyStyle("formatBlock", "h2")} className={`p-2 rounded-lg transition-colors ${activeStyles.h2 ? "bg-mm-orange/10 text-mm-orange border border-mm-orange/20" : "hover:bg-mm-subtle text-mm-gray"}`} title="Heading 2"><Heading1 size={15} /></button>
              <button type="button" onClick={() => applyStyle("formatBlock", "h3")} className={`p-2 rounded-lg transition-colors ${activeStyles.h3 ? "bg-mm-orange/10 text-mm-orange border border-mm-orange/20" : "hover:bg-mm-subtle text-mm-gray"}`} title="Heading 3"><Heading2 size={15} /></button>
              <button type="button" onClick={() => applyStyle("formatBlock", "blockquote")} className={`p-2 rounded-lg transition-colors ${activeStyles.blockquote ? "bg-mm-orange/10 text-mm-orange border border-mm-orange/20" : "hover:bg-mm-subtle text-mm-gray"}`} title="Blockquote"><Quote size={15} /></button>
              <button type="button" onClick={insertCodeBlock} className="p-2 hover:bg-mm-subtle rounded-lg transition-colors text-mm-gray" title="Code Block"><Code2 size={15} /></button>
              
              <div className="w-px h-5 bg-stone-200 mx-1"></div>
              
              <button type="button" onClick={() => applyStyle("insertUnorderedList")} className={`p-2 rounded-lg transition-colors ${activeStyles.bulletList ? "bg-mm-orange/10 text-mm-orange border border-mm-orange/20" : "hover:bg-mm-subtle text-mm-gray"}`} title="Bullet List"><List size={15} /></button>
              <button type="button" onClick={() => applyStyle("insertOrderedList")} className={`p-2 rounded-lg transition-colors ${activeStyles.numberList ? "bg-mm-orange/10 text-mm-orange border border-mm-orange/20" : "hover:bg-mm-subtle text-mm-gray"}`} title="Numbered List"><ListOrdered size={15} /></button>
              <button type="button" onClick={() => applyStyle("insertHorizontalRule")} className="p-2 hover:bg-mm-subtle rounded-lg transition-colors text-mm-gray" title="Horizontal Line"><Minus size={15} /></button>
              
              <div className="w-px h-5 bg-stone-200 mx-1"></div>
              
              <button
                type="button"
                onClick={() => {
                  const url = prompt("Enter link URL:");
                  if (url) applyStyle("createLink", url);
                }}
                className="p-2 hover:bg-mm-subtle rounded-lg transition-colors text-mm-gray"
                title="Insert Link"
              >
                <Link size={15} />
              </button>
              <button type="button" onClick={insertImageUrl} className="p-2 hover:bg-mm-subtle rounded-lg transition-colors text-mm-gray" title="Insert Image by URL"><Image size={15} /></button>
              <button type="button" onClick={() => applyStyle("removeFormat")} className="p-2 hover:bg-mm-subtle rounded-lg transition-colors text-mm-gray" title="Clear Formatting"><Sparkles size={15} /></button>
            </div>
            
            {/* Editor Workspace */}
            <div className="flex-1 p-5 bg-white relative flex flex-col">
              <div
                ref={editorRef}
                contentEditable
                onInput={handleEditorChange}
                onKeyDown={handleKeyDown}
                onKeyUp={updateActiveStyles}
                onMouseUp={updateActiveStyles}
                onClick={updateActiveStyles}
                onFocus={updateActiveStyles}
                className="w-full h-full outline-none text-mm-dark text-sm overflow-y-auto space-y-4 focus:outline-none min-h-[300px]
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
                style={{ minHeight: "350px" }}
                data-placeholder="Write your article content here..."
              />
              {formErrors.content && <p className="text-xs text-mm-red mt-1">{formErrors.content}</p>}
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-5">
          {/* Post Image Upload */}
          <div className="bg-white border border-mm-border p-5 rounded-[24px] space-y-4">
            <label className="block text-xs font-bold text-mm-gray uppercase tracking-wider">Cover Image</label>
            
            {coverImageUrl ? (
              <div className="relative group rounded-xl overflow-hidden aspect-video border border-mm-border">
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
              <div className="border-2 border-dashed border-mm-border hover:border-[var(--color-mm-orange)] transition-colors rounded-xl p-6 text-center cursor-pointer relative bg-white">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  disabled={isUploading}
                />
                <UploadCloud size={24} className="mx-auto text-mm-gray mb-2" />
                <p className="text-xs font-semibold text-mm-gray">
                  {isUploading ? "Uploading..." : "Click or drag image to upload"}
                </p>
                <p className="text-[10px] text-mm-gray mt-1">PNG, JPG, or WEBP up to 5MB</p>
              </div>
            )}
            {uploadError && <p className="text-xs text-mm-red">{uploadError}</p>}
          </div>

          {/* Visibility / Status */}
          <div className="bg-white border border-mm-border p-5 rounded-[24px] space-y-4">
            <label className="block text-xs font-bold text-mm-gray uppercase tracking-wider">Publishing Status</label>
            
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BlogStatus)}
              className="w-full text-xs rounded-xl px-4 py-2.5 outline-none bg-white border border-mm-border text-mm-dark font-medium appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                backgroundSize: "16px"
              }}
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Archived">Archived</option>
            </select>

            <div className="flex items-center gap-2 p-3.5 rounded-xl text-xs font-medium" 
              style={{ 
                background: status === "Published" ? "rgba(92, 177, 62, 0.1)" : status === "Draft" ? "#FFF3E0" : "#F5F5F5", 
                color: status === "Published" ? "var(--color-mm-green)" : status === "Draft" ? "var(--color-mm-orange)" : "var(--color-mm-gray)",
                border: `1px solid ${status === "Published" ? "var(--color-mm-green)" : status === "Draft" ? "var(--color-mm-orange)" : "var(--color-mm-gray)"}`
              }}
            >
              {status === "Published" ? (
                <>
                  <CheckCircle2 size={15} />
                  <span>Published (Live on customer portal)</span>
                </>
              ) : status === "Draft" ? (
                <>
                  <Eye size={15} />
                  <span>Draft (Only visible in admin panel)</span>
                </>
              ) : (
                <>
                  <ShieldAlert size={15} />
                  <span>Archived (Hidden from portal)</span>
                </>
              )}
            </div>
          </div>

          {/* Featured Option */}
          <div className="bg-white border border-mm-border p-5 rounded-[24px] space-y-4">
            <label className="block text-xs font-bold text-mm-gray uppercase tracking-wider">Featured Article</label>
            
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-mm-border bg-white">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-mm-dark">Featured</span>
                <p className="text-[10px] text-mm-gray">Highlight this post on main blog page</p>
              </div>
              <button
                type="button"
                onClick={() => setFeatured(!featured)}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
                  featured ? "bg-mm-orange" : "bg-mm-gray/30"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    featured ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

