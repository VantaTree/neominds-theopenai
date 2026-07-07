import { useState } from "react";
import BlogListPage from "./BlogListPage";
import BlogForm from "../components/BlogForm";
import BlogPreview from "../components/BlogPreview";
import { 
  useBlogsList, 
  useCreateBlog, 
  useUpdateBlog, 
  useDeleteBlog 
} from "../hooks/useBlogs";
import type { Blog } from "@/lib/schemas";
import type { CreateBlogInput } from "../hooks/useBlogs";
import { X, AlertCircle } from "lucide-react";

type ViewState = "list" | "add" | "edit" | "preview";

export default function BlogManagement() {
  const [viewState, setViewState] = useState<ViewState>("list");
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Blog | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // --- React Query Hooks ---
  const { data: blogs = [], isLoading } = useBlogsList();
  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog();
  const deleteMutation = useDeleteBlog();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateSave = async (data: CreateBlogInput) => {
    try {
      await createMutation.mutateAsync(data);
      showToast("🎉 Blog post created successfully!");
      setViewState("list");
    } catch (e: any) {
      console.error(e);
      showToast(`✗ Failed to create blog: ${e.message}`);
    }
  };

  const handleUpdateSave = async (data: CreateBlogInput) => {
    if (!selectedBlog) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedBlog.id,
        data
      });
      showToast("✓ Blog post updated successfully!");
      setViewState("list");
      setSelectedBlog(null);
    } catch (e: any) {
      console.error(e);
      showToast(`✗ Failed to update blog: ${e.message}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await deleteMutation.mutateAsync(confirmDelete.id);
      showToast("✓ Blog post deleted successfully.");
      setConfirmDelete(null);
    } catch (e: any) {
      console.error(e);
      showToast(`✗ Failed to delete blog: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {viewState === "list" && (
        <BlogListPage
          blogs={blogs}
          isLoading={isLoading}
          onCreateNew={() => setViewState("add")}
          onEdit={(b) => {
            setSelectedBlog(b);
            setViewState("edit");
          }}
          onPreview={(b) => {
            setSelectedBlog(b);
            setViewState("preview");
          }}
          onDelete={(b) => setConfirmDelete(b)}
        />
      )}

      {viewState === "add" && (
        <BlogForm
          onSave={handleCreateSave}
          onCancel={() => setViewState("list")}
          isSaving={createMutation.isPending}
        />
      )}

      {viewState === "edit" && selectedBlog && (
        <BlogForm
          initialBlog={selectedBlog}
          onSave={handleUpdateSave}
          onCancel={() => {
            setViewState("list");
            setSelectedBlog(null);
          }}
          isSaving={updateMutation.isPending}
        />
      )}

      {viewState === "preview" && selectedBlog && (
        <BlogPreview
          blog={selectedBlog}
          onBack={() => {
            setViewState("list");
            setSelectedBlog(null);
          }}
          onEdit={() => setViewState("edit")}
        />
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-2xl" style={{ background: "white", border: "1px solid var(--color-mm-border)" }}>
            <h3 className="font-bold text-lg text-mm-dark">Delete Post?</h3>
            <p className="text-sm text-mm-gray">
              Are you sure you want to delete post <strong>"{confirmDelete.title}"</strong>? This will permanently delete the post from database.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-mm-border hover:bg-mm-subtle" 
                style={{ background: "white", color: "var(--color-mm-gray)" }}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm} 
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-95 text-white flex items-center gap-1.5" 
                style={{ background: "var(--color-mm-red)" }}
              >
                {deleteMutation.isPending && <X size={12} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-lg transition-all animate-in slide-in-from-bottom-5" 
          style={{ 
            background: toast.startsWith("✗") ? "rgba(239, 83, 80, 0.1)" : "rgba(92, 177, 62, 0.1)", 
            border: `1px solid ${toast.startsWith("✗") ? "var(--color-mm-red)" : "var(--color-mm-green)"}`, 
            color: toast.startsWith("✗") ? "var(--color-mm-red)" : "var(--color-mm-green)", 
            fontWeight: 600 
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
