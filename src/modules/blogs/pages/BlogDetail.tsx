import { useState, useEffect, useMemo } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { ArrowLeft, Monitor, Smartphone, Eye, Pencil } from "lucide-react";
import { type Blog } from "@/lib/schemas";
import { useBlogsList, useUpdateBlog } from "../hooks/useBlogs";
import BlogForm from "../components/BlogForm";
import BlogPreview from "../components/BlogPreview";

export function BlogDetail() {
  const { id } = useParams({ from: "/_admin/admin/blogs/$id" });
  const { tab = "preview" } = useSearch({ from: "/_admin/admin/blogs/$id" });
  const navigate = useNavigate();

  // --- React Query ---
  const { data: blogs = [], isLoading } = useBlogsList();
  const updateMutation = useUpdateBlog();

  const [toast, setToast] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<any>(null);
  const [resetKey, setResetKey] = useState(0);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const blog = blogs.find((b) => b.id === id || b.slug === id);

  const handleBack = () => {
    navigate({ to: "/admin/blogs" });
  };

  // Determine dirty state
  const isDirty = useMemo(() => {
    if (!blog || !formValues) return false;
    return (
      formValues.title !== blog.title ||
      formValues.slug !== blog.slug ||
      formValues.summary !== blog.summary ||
      formValues.content !== blog.content ||
      formValues.coverImageUrl !== blog.coverImageUrl ||
      formValues.author !== blog.author ||
      formValues.status !== blog.status ||
      (formValues.featured || false) !== (blog.featured || false)
    );
  }, [blog, formValues]);

  // Synchronize local edit values on load/reset
  useEffect(() => {
    if (blog) {
      setFormValues({
        title: blog.title,
        slug: blog.slug,
        summary: blog.summary,
        content: blog.content,
        coverImageUrl: blog.coverImageUrl,
        author: blog.author,
        status: blog.status,
        featured: blog.featured || false,
      });
    }
  }, [blog, resetKey]);

  // Alert beforeunload if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && tab === "edit") {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, tab]);

  const handleDiscard = () => {
    if (window.confirm("Are you sure you want to discard all unsaved changes?")) {
      setResetKey((prev) => prev + 1);
    }
  };

  const handleSave = async () => {
    if (!blog || !formValues) return;
    try {
      await updateMutation.mutateAsync({
        id: blog.id,
        data: formValues,
      });
      showToast("✓ Blog post updated successfully!");
      setResetKey((prev) => prev + 1);
    } catch (e: any) {
      console.error(e);
      showToast(`✗ Failed to update blog: ${e.message}`);
    }
  };

  const isValid = useMemo(() => {
    if (!formValues) return false;
    return (
      formValues.title.trim() !== "" &&
      formValues.slug.trim() !== "" &&
      formValues.summary.trim() !== "" &&
      formValues.content.trim() !== "" &&
      formValues.content.trim() !== "<br>" &&
      formValues.content.trim() !== "<div><br></div>"
    );
  }, [formValues]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-2">
        <div className="w-8 h-8 border-4 border-(--color-mm-orange) border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-semibold text-mm-gray">
          Loading article...
        </span>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <h2 className="text-lg font-bold text-mm-dark">Post Not Found</h2>
        <p className="text-sm text-mm-gray">
          The blog post you are trying to view does not exist or has been
          deleted.
        </p>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-(--color-mm-orange) hover:bg-[#d68f15] text-white text-xs font-bold rounded-xl transition-all"
        >
          Back to Blogs List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Tab navigation bar */}
      <div className="flex items-center justify-between border-b border-mm-border/40 pb-px">
        <div className="flex gap-4">
          <Link
            to="/admin/blogs/$id"
            params={{ id: blog.id }}
            search={{ tab: "preview" }}
            onClick={(e) => {
              if (isDirty && tab === "edit" && !window.confirm("You have unsaved changes. Discard and switch tab?")) {
                e.preventDefault();
              } else if (isDirty && tab === "edit") {
                setResetKey((prev) => prev + 1);
              }
            }}
            className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
              tab === "preview"
                ? "border-mm-orange text-mm-orange"
                : "border-transparent text-mm-gray hover:text-mm-dark"
            }`}
          >
            <Eye size={14} />
            Preview
          </Link>
          <Link
            to="/admin/blogs/$id"
            params={{ id: blog.id }}
            search={{ tab: "edit" }}
            className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
              tab === "edit"
                ? "border-mm-orange text-mm-orange"
                : "border-transparent text-mm-gray hover:text-mm-dark"
            }`}
          >
            <Pencil size={14} />
            Edit Post
          </Link>
        </div>
        <button
          onClick={() => {
            if (!isDirty || tab !== "edit" || window.confirm("You have unsaved changes. Discard and go back?")) {
              handleBack();
            }
          }}
          className="flex items-center gap-1 text-xs text-mm-gray hover:text-mm-dark font-medium"
        >
          <ArrowLeft size={12} />
          Back to list
        </button>
      </div>

      {tab === "preview" && (
        <BlogPreview
          blog={blog}
          onBack={handleBack}
          onEdit={() => (navigate as any)({ search: { tab: "edit" } })}
        />
      )}

      {tab === "edit" && (
        <BlogForm
          key={resetKey}
          initialBlog={blog}
          onChange={setFormValues}
          hideHeader={true}
        />
      )}

      {/* Floating Save Changes Bar */}
      {isDirty && tab === "edit" && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-between gap-6 px-6 py-4 rounded-2xl shadow-xl border border-mm-orange/20 animate-in slide-in-from-bottom-4"
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(12px)",
            width: "calc(100% - 48px)",
            maxWidth: "600px",
            zIndex: 90,
          }}
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-mm-orange animate-pulse" />
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--color-mm-dark)" }}
            >
              You have unsaved changes
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDiscard}
              className="px-4 py-2 bg-white hover:bg-mm-subtle border border-mm-border text-mm-gray font-semibold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending || !isValid}
              className="px-5 py-2.5 bg-mm-orange hover:bg-mm-orange/95 text-white font-semibold rounded-xl text-sm transition-colors flex items-center gap-2"
              style={{
                opacity: !isValid ? 0.6 : 1,
                cursor: !isValid ? "not-allowed" : "pointer",
              }}
            >
              {updateMutation.isPending && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              Save
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-100 px-5 py-3 rounded-xl shadow-lg transition-all animate-in slide-in-from-bottom-5"
          style={{
            background: toast.startsWith("✗")
              ? "rgba(239, 83, 80, 0.1)"
              : "rgba(92, 177, 62, 0.1)",
            border: `1px solid ${toast.startsWith("✗") ? "var(--color-mm-red)" : "var(--color-mm-green)"}`,
            color: toast.startsWith("✗")
              ? "var(--color-mm-red)"
              : "var(--color-mm-green)",
            fontWeight: 600,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
