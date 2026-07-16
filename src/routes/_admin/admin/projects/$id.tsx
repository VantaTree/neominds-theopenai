import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  CheckCircle2,
  Check,
  X,
  Pencil,
  Trash2,
  Plus,
  Download,
  Loader2,
  FileText,
  FileSpreadsheet,
  FileType,
  UploadCloud,
  Search,
  FileSearch,
  ArrowLeft,
  Eye,
} from "lucide-react";
import {
  Avatar,
  Card,
  ProgressBar,
  StatusBadge,
  PlanBadge,
} from "@/components/admin/shared";
import { getProjectsFn, saveProjectFn, getUsersFn, getBusinessesFn } from "@/lib/server-functions";
import { uploadFileToStorage, deleteFileFromStorage } from "@/lib/firebase";
import type {
  Project,
  ProjectStatus,
  ProjectPriority,
  ProjectUpdate,
} from "@/lib/schemas";
import { AdminLoader } from "@/components/AdminLoader";

export const Route = createFileRoute("/_admin/admin/projects/$id")({
  head: () => ({ meta: [{ title: "Project — GrowConsult AI" }] }),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      edit: Boolean(search.edit),
    };
  },
  loader: async () => {
    try {
      const [projects, users, businesses] = await Promise.all([
        getProjectsFn(),
        getUsersFn(),
        getBusinessesFn(),
      ]);
      return { projects, users, businesses };
    } catch (err) {
      console.error("Loader failed to fetch projects data:", err);
      return { projects: [], users: [], businesses: [] };
    }
  },
  pendingComponent: AdminLoader,
  pendingMs: 0,
  component: ProjectDetail,
});

type Tab = "overview" | "progress" | "detailed";

function ProjectDetail() {
  const { projects: initialProjects, users = [], businesses: initialBusinesses = [] } = Route.useLoaderData();
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [parentLightboxImage, setParentLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    setProjectList(initialProjects);
  }, [initialProjects]);

  const { edit } = Route.useSearch();

  useEffect(() => {
    if (edit) {
      setTab("progress");
    }
  }, [id, edit]);

  const businesses = useMemo(() => {
    return initialBusinesses;
  }, [initialBusinesses]);

  const originalProject =
    projectList.find((p) => p.id === id) || projectList[0];
  const [tab, setTab] = useState<Tab>("overview");

  // Sync activeProject when route parameter or loaded project list changes
  useEffect(() => {
    const p = projectList.find((x) => x.id === id);
    if (p) {
      setActiveProject(p);
    } else if (projectList.length > 0) {
      setActiveProject(projectList[0]);
    }
  }, [id, projectList]);

  // Dirty check: serialize state safely
  const isDirty = useMemo(() => {
    if (!activeProject || !originalProject) return false;
    const cleanForCompare = (proj: Project) => {
      return JSON.stringify({
        ...proj,
        businessId:
          typeof proj.businessId === "object" && proj.businessId !== null
            ? proj.businessId.id
            : proj.businessId,
        startDate: proj.startDate ? new Date(proj.startDate).toISOString() : "",
        deadline: proj.deadline ? new Date(proj.deadline).toISOString() : "",
        createdAt: proj.createdAt ? new Date(proj.createdAt).toISOString() : "",
        updatedAt: proj.updatedAt ? new Date(proj.updatedAt).toISOString() : "",
        updates: (proj.updates || []).map((u) => ({
          ...u,
          timestamp: u.timestamp ? new Date(u.timestamp).toISOString() : "",
        })),
      });
    };
    return cleanForCompare(activeProject) !== cleanForCompare(originalProject);
  }, [activeProject, originalProject]);

  // Prevent browser reload/close when dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Toast effect
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const confirmNavigation = () => {
    if (isDirty) {
      return window.confirm(
        "You have unsaved changes. Are you sure you want to discard them and leave?",
      );
    }
    return true;
  };

  const onChange = (next: Project) => {
    setActiveProject(next);
  };

  const handleSave = () => {
    if (!activeProject) return;
    setIsSaving(true);
    const businessIdStr =
      typeof activeProject.businessId === "object" &&
      activeProject.businessId !== null
        ? activeProject.businessId.id
        : activeProject.businessId;

    const projectSchemaData = {
      ...activeProject,
      businessId: businessIdStr,
      updatedAt: new Date(),
    };

    saveProjectFn({ data: projectSchemaData as any })
      .then(() => {
        setProjectList((list) =>
          list.map((p) => (p.id === activeProject.id ? activeProject : p)),
        );
        setIsSaving(false);
        setToast("✓ Project saved successfully!");
      })
      .catch((err) => {
        console.error("Save failed:", err);
        setIsSaving(false);
      });
  };

  const handleDirectSave = (next: Project) => {
    if (!originalProject) return;
    setIsSaving(true);

    const mergedProject = {
      ...originalProject,
      updates: next.updates,
    };

    const businessIdStr =
      typeof mergedProject.businessId === "object" && mergedProject.businessId !== null
        ? mergedProject.businessId.id
        : mergedProject.businessId;

    const projectSchemaData = {
      ...mergedProject,
      businessId: businessIdStr,
      updatedAt: new Date(),
    };

    saveProjectFn({ data: projectSchemaData as any })
      .then(() => {
        setProjectList((list) =>
          list.map((p) => (p.id === mergedProject.id ? mergedProject : p)),
        );
        setActiveProject((prev) => prev ? { ...prev, updates: next.updates } : next);
        setIsSaving(false);
        setToast("✓ Updates saved directly!");
      })
      .catch((err) => {
        console.error("Save failed:", err);
        setIsSaving(false);
      });
  };

  const handleDiscard = () => {
    if (
      window.confirm("Are you sure you want to discard all unsaved changes?")
    ) {
      if (originalProject) {
        setActiveProject(originalProject);
      }
    }
  };

  if (!activeProject) {
    return <div className="p-8">Loading project details...</div>;
  }

  const activeBiz =
    typeof activeProject.businessId === "object" &&
    activeProject.businessId !== null
      ? activeProject.businessId
      : (businesses.find((b) => b.id === activeProject.businessId) || null);
  const clientName = activeBiz?.businessName || activeProject.name;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 pb-28 overflow-y-scroll w-full">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/projects"
            onClick={(e) => {
              if (!confirmNavigation()) {
                e.preventDefault();
              }
            }}
            className="p-2 bg-white border border-mm-border hover:bg-mm-subtle/50 rounded-xl transition-all cursor-pointer text-mm-dark flex items-center justify-center shrink-0"
            title="Back to Projects"
            style={{ borderColor: "var(--color-mm-border)" }}
          >
            <ArrowLeft size={16} style={{ color: "var(--color-mm-gray)" }} />
          </Link>
          <div>
            <div className="text-xs" style={{ color: "var(--color-mm-gray)" }}>
              <Link
                to="/admin/projects"
                onClick={(e) => {
                  if (!confirmNavigation()) {
                    e.preventDefault();
                  }
                }}
                className="hover:underline"
              >
                Projects
              </Link>{" "}
              / {activeProject.id}
            </div>
            <h1
              className="text-xl font-bold mt-1"
              style={{ color: "var(--color-mm-dark)" }}
            >
              {clientName} — {activeProject.services.join(" + ")}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={activeProject.status} />
          <button
            className="px-4 py-2 bg-mm-orange hover:bg-mm-orange/95 text-white font-semibold rounded-xl transition-colors cursor-pointer"
            onClick={() => setTab("progress")}
          >
            Edit Project
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-6"
        style={{ borderBottom: "1px solid var(--color-mm-border)" }}
      >
        {(
          [
            ["overview", "Overview"],
            ["progress", "Edit Details & Milestones"],
            ["detailed", "Detailed Info"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="pb-3 text-sm font-medium transition-colors cursor-pointer"
            style={{
              color:
                tab === key ? "var(--color-mm-dark)" : "var(--color-mm-gray)",
              fontWeight: tab === key ? 700 : 500,
              borderBottom:
                tab === key
                  ? "2px solid var(--color-mm-orange)"
                  : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && activeProject && (
        <OverviewTab project={activeProject} onViewImage={setParentLightboxImage} />
      )}
      {tab === "progress" && activeProject && (
        <ProgressTab
          project={activeProject}
          onDetailsChange={onChange}
          onMilestonesChange={handleDirectSave}
          onViewImage={setParentLightboxImage}
        />
      )}
      {tab === "detailed" && activeProject && (
        <DetailedTab project={activeProject} onViewImage={setParentLightboxImage} />
      )}

      {/* Floating Save Changes Bar */}
      {isDirty && activeProject && (
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
              disabled={isSaving || !activeProject.name.trim() || !activeProject.assignee.trim()}
              className="px-5 py-2.5 bg-mm-orange hover:bg-mm-orange/95 text-white font-semibold rounded-xl text-sm transition-colors flex items-center gap-2"
              style={{
                opacity: (!activeProject.name.trim() || !activeProject.assignee.trim()) ? 0.6 : 1,
                cursor: (!activeProject.name.trim() || !activeProject.assignee.trim()) ? "not-allowed" : "pointer",
              }}
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg transition-all animate-in slide-in-from-bottom-5"
          style={{
            background: "rgba(92, 177, 62, 0.1)",
            border: "1px solid var(--color-mm-green)",
            color: "var(--color-mm-green)",
            fontWeight: 600,
            zIndex: 100,
          }}
        >
          {toast}
        </div>
      )}

      {/* Lightbox Modal */}
      {parentLightboxImage && (
        <div
          className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setParentLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl bg-white border border-mm-border"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setParentLightboxImage(null)}
              className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-mm-dark rounded-full shadow-md z-10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            <img
              src={parentLightboxImage}
              alt="Project asset preview"
              className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ Overview ============ */
function OverviewTab({
  project,
  onViewImage,
}: {
  project: Project;
  onViewImage: (url: string) => void;
}) {
  const biz =
    typeof project.businessId === "object" && project.businessId !== null
      ? project.businessId
      : null;
  const usr =
    biz && typeof biz.userId === "object" && biz.userId !== null
      ? biz.userId
      : null;

  const rows: [string, React.ReactNode][] = [
    ["Project ID", project.id],
    ["Client/Business", biz?.businessName || project.name],
    [
      "Services",
      <span className="flex flex-wrap gap-1" key="s">
        {project.services.map((s) => (
          <span
            key={s}
            className="px-2 py-0.5 rounded-full text-xs"
            style={{
              background:
                "color-mix(in oklch, var(--color-mm-orange) 18%, white)",
              border: "1px solid var(--color-mm-orange)",
              color: "var(--color-mm-orange)",
            }}
          >
            {s}
          </span>
        ))}
      </span>,
    ],
    ["Project Manager", project.assignee],
    [
      "Start Date",
      project.startDate ? new Date(project.startDate).toLocaleDateString() : "",
    ],
    [
      "Deadline",
      project.deadline ? new Date(project.deadline).toLocaleDateString() : "",
    ],
    ["Status", <StatusBadge key="st" status={project.status} />],
    ["Priority", <PriorityBadge key="pr" priority={project.priority} />],
  ];

  return (
    <div className="space-y-6">
      <Card>
        <h3
          className="font-semibold mb-4"
          style={{ color: "var(--color-mm-dark)" }}
        >
          Project Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {rows.map(([label, value]) => (
            <div key={label}>
              <div
                className="text-[11px] uppercase tracking-wide font-semibold"
                style={{ color: "var(--color-mm-gray)" }}
              >
                {label}
              </div>
              <div
                className="mt-1 font-semibold text-sm"
                style={{ color: "var(--color-mm-dark)" }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <div
            className="flex items-center justify-between text-sm font-semibold mb-2"
            style={{ color: "var(--color-mm-dark)" }}
          >
            <span>Overall Progress</span>
            <span style={{ color: "var(--color-mm-dark)" }}>
              {project.progress}%
            </span>
          </div>
          <div
            className="h-2.5 rounded-full overflow-hidden"
            style={{ background: "var(--color-mm-subtle)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${project.progress}%`,
                background: "var(--color-mm-orange)",
              }}
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {project.services.map((serviceName) => (
          <Card key={serviceName} className="text-center relative group">
            <div
              className="font-semibold mb-3 pr-8 pl-8"
              style={{ color: "var(--color-mm-dark)" }}
            >
              {serviceName}
            </div>
            <RingProgress
              value={project.progress}
              color="var(--color-mm-orange)"
            />
            <div className="mt-3 inline-block">
              <StatusBadge status={project.status} />
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h3
          className="font-semibold mb-3"
          style={{ color: "var(--color-mm-dark)" }}
        >
          Quick Metrics
        </h3>
        <div className="flex flex-wrap gap-3">
          <SummaryChip
            label="Total Updates"
            value={String(project.updates?.length || 0)}
            bg="var(--color-mm-subtle)"
            color="var(--color-mm-gray)"
          />
          <SummaryChip
            label="Status"
            value={project.status}
            bg="rgba(59, 130, 246, 0.1)"
            color="var(--color-mm-blue)"
          />
          <SummaryChip
            label="Priority"
            value={project.priority}
            bg="rgba(224, 86, 36, 0.1)"
            color="var(--color-mm-orange)"
          />
          <SummaryChip
            label="Progress"
            value={`${project.progress}%`}
            bg="rgba(92, 177, 62, 0.1)"
            color="var(--color-mm-green)"
          />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3
            className="font-semibold"
            style={{ color: "var(--color-mm-dark)" }}
          >
            Recent Activity
          </h3>
        </div>
        <div className="space-y-3">
          {(project.updates || []).map((u, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: "var(--color-mm-orange)" }}
              />
              <span
                className="flex-1"
                style={{ color: "var(--color-mm-dark)" }}
              >
                {u.message}
              </span>
              <span style={{ color: "var(--color-mm-gray)" }}>
                By {u.designation}
              </span>
              <span
                className="text-xs"
                style={{ color: "var(--color-mm-gray)" }}
              >
                {u.timestamp ? new Date(u.timestamp).toLocaleString() : ""}
              </span>
            </div>
          ))}
          {(!project.updates || project.updates.length === 0) && (
            <div className="text-sm" style={{ color: "var(--color-mm-gray)" }}>
              No activity recorded yet.
            </div>
          )}
        </div>
      </Card>

      {/* Project Images & Assets (View Only) */}
      {project.assets && project.assets.length > 0 && (
        <Card>
          <h3
            className="font-bold text-base mb-4 pb-2 border-b border-mm-border"
            style={{ color: "var(--color-mm-dark)" }}
          >
            Project Images & Assets
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-in fade-in">
            {project.assets.map((url, idx) => (
              <div
                key={url + idx}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-mm-border bg-mm-subtle/30 transition-all hover:shadow-md cursor-pointer"
                onClick={() => onViewImage(url)}
              >
                <img
                  src={url}
                  alt={`Asset ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="p-2 bg-white/95 text-mm-dark rounded-xl shadow transition-colors">
                    <Eye size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function SummaryChip({
  label,
  value,
  bg,
  color,
}: {
  label: string;
  value: string;
  bg: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl px-4 py-3 min-w-[110px]"
      style={{ background: bg, color }}
    >
      <div className="text-xs font-semibold opacity-80">{label}</div>
      <div className="text-xl font-bold mt-0.5">{value}</div>
    </div>
  );
}

function RingProgress({ value, color }: { value: number; color: string }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg width="112" height="112" viewBox="0 0 112 112">
        <circle
          cx="56"
          cy="56"
          r={r}
          stroke="var(--color-mm-subtle)"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="56"
          cy="56"
          r={r}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c - (c * value) / 100}
          strokeLinecap="round"
          transform="rotate(-90 56 56)"
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center text-2xl font-bold"
        style={{ color }}
      >
        {value}%
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: ProjectPriority }) {
  const map = {
    High: {
      bg: "rgba(239, 83, 80, 0.1)",
      color: "var(--color-mm-red)",
      border: "var(--color-mm-red)",
    },
    Medium: {
      bg: "rgba(224, 86, 36, 0.1)",
      color: "var(--color-mm-orange)",
      border: "var(--color-mm-orange)",
    },
    Low: {
      bg: "rgba(92, 177, 62, 0.1)",
      color: "var(--color-mm-green)",
      border: "var(--color-mm-green)",
    },
  }[priority];
  return (
    <span
      className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase"
      style={{
        background: map.bg,
        color: map.color,
        border: `1px solid ${map.border}`,
      }}
    >
      {priority}
    </span>
  );
}

/* ============ Progress tab ============ */
const toInputDate = (d: any) => {
  if (!d) return "";
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return "";
  return dateObj.toISOString().split("T")[0];
};

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div>
      <label
        className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
        style={{
          color: error ? "var(--color-danger)" : "var(--color-mm-gray)",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

/* ============ Progress tab ============ */
function ProgressTab({
  project,
  onDetailsChange,
  onMilestonesChange,
  onViewImage,
}: {
  project: Project;
  onDetailsChange: (p: Project) => void;
  onMilestonesChange: (p: Project) => void;
  onViewImage: (url: string) => void;
}) {
  const [newMsg, setNewMsg] = useState("");
  const [newDesig, setNewDesig] = useState("Manager");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editMsg, setEditMsg] = useState("");
  const [editDesig, setEditDesig] = useState("");

  const [imageUploading, setImageUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const url = await uploadFileToStorage(file, "projects", project.id, "projectImg");
      const currentAssets = project.assets || [];
      onDetailsChange({
        ...project,
        assets: [...currentAssets, url],
      });
      setToast("✓ Image uploaded successfully!");
    } catch (err) {
      console.error("Image upload failed:", err);
      setToast("✗ Failed to upload image.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = async (urlToRemove: string) => {
    if (window.confirm("Are you sure you want to remove this image?")) {
      await deleteFileFromStorage(urlToRemove);
      const currentAssets = project.assets || [];
      onDetailsChange({
        ...project,
        assets: currentAssets.filter((url) => url !== urlToRemove),
      });
      setToast("✓ Image removed successfully!");
    }
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const toggleService = (s: string) => {
    const nextServices = project.services.includes(s)
      ? project.services.filter((x) => x !== s)
      : [...project.services, s];
    onDetailsChange({ ...project, services: nextServices });
  };

  const handleAddUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    const newUpdate = {
      message: newMsg.trim(),
      timestamp: new Date(),
      designation: newDesig.trim() || "Manager",
    };
    onMilestonesChange({
      ...project,
      updates: [newUpdate, ...(project.updates || [])],
    });
    setNewMsg("");
  };

  const handleSaveEdit = (idx: number) => {
    if (!editMsg.trim()) return;
    const updated = [...(project.updates || [])];
    updated[idx] = {
      ...updated[idx],
      message: editMsg.trim(),
      designation: editDesig.trim() || "Manager",
    };
    onMilestonesChange({
      ...project,
      updates: updated,
    });
    setEditingIndex(null);
  };

  const handleDeleteUpdate = (idx: number) => {
    if (window.confirm("Are you sure you want to delete this update?")) {
      const updated = (project.updates || []).filter((_, i) => i !== idx);
      onMilestonesChange({
        ...project,
        updates: updated,
      });
    }
  };

  const nameError = !project.name.trim();
  const assigneeError = !project.assignee.trim();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
      {/* Left Column: Project Configuration Details */}
      <div className="space-y-6">
        <Card className="space-y-6 border border-mm-border rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-mm-border">
            <h3
              className="font-bold text-base"
              style={{ color: "var(--color-mm-dark)" }}
            >
              Project Configuration
            </h3>
            <span className="text-xs text-mm-gray font-medium">
              ID: {project.id}
            </span>
          </div>
          <div className="space-y-4">
            <Field label="Project Name" error={nameError}>
              <input
                className="input-field"
                value={project.name}
                onChange={(e) => onDetailsChange({ ...project, name: e.target.value })}
                style={
                  nameError ? { borderColor: "var(--color-mm-red)" } : undefined
                }
              />
              {nameError && (
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--color-mm-red)" }}
                >
                  Required
                </p>
              )}
            </Field>
            <Field label="Project Domain">
              <select
                className="input-field"
                value={project.domain}
                onChange={(e) =>
                  onDetailsChange({ ...project, domain: e.target.value as any })
                }
              >
                {["Website", "Marketing", "Automation"].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="Services">
              <div className="flex flex-wrap gap-2">
                {["Website", "Marketing", "SEO", "Sales", "Automation"].map(
                  (s) => {
                    const on = project.services.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleService(s)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer"
                        style={
                          on
                            ? {
                                background:
                                  "color-mix(in oklch, var(--color-mm-orange) 8%, white)",
                                border: "1px solid var(--color-mm-orange)",
                                color: "var(--color-mm-orange)",
                              }
                            : {
                                background: "var(--color-mm-subtle)",
                                border: "1px solid var(--color-mm-border)",
                                color: "var(--color-mm-gray)",
                              }
                        }
                      >
                        {s}
                      </button>
                    );
                  },
                )}
              </div>
            </Field>
            <Field label="Project Manager / Assignee" error={assigneeError}>
              <input
                className="input-field"
                value={project.assignee}
                onChange={(e) => onDetailsChange({ ...project, assignee: e.target.value })}
                style={
                  assigneeError
                    ? { borderColor: "var(--color-mm-red)" }
                    : undefined
                }
              />
              {assigneeError && (
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--color-mm-red)" }}
                >
                  Required
                </p>
              )}
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Start Date">
                <input
                  type="date"
                  className="input-field"
                  value={toInputDate(project.startDate)}
                  onChange={(e) =>
                    onDetailsChange({ ...project, startDate: new Date(e.target.value) })
                  }
                />
              </Field>
              <Field label="Deadline">
                <input
                  type="date"
                  className="input-field"
                  value={toInputDate(project.deadline)}
                  onChange={(e) =>
                    onDetailsChange({
                      ...project,
                      deadline: e.target.value ? new Date(e.target.value) : null,
                    })
                  }
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Status">
                <select
                  className="input-field"
                  value={project.status}
                  onChange={(e) =>
                    onDetailsChange({ ...project, status: e.target.value as any })
                  }
                >
                  {[
                    "Pending",
                    "In Progress",
                    "Completed",
                    "On Hold",
                    "Cancelled",
                    "User Draft",
                    "Requested",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Priority">
                <select
                  className="input-field"
                  value={project.priority}
                  onChange={(e) =>
                    onDetailsChange({ ...project, priority: e.target.value as any })
                  }
                >
                  {["Low", "Medium", "High"].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Description">
              <textarea
                className="input-field min-h-[100px]"
                value={project.description}
                onChange={(e) =>
                  onDetailsChange({ ...project, description: e.target.value })
                }
              />
            </Field>
            <Field label="Notes">
              <textarea
                className="input-field min-h-[80px]"
                value={project.notes}
                onChange={(e) => onDetailsChange({ ...project, notes: e.target.value })}
              />
            </Field>
          </div>
        </Card>

        {/* Project Images & Assets Card */}
        <Card className="border border-mm-border rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-mm-border animate-in fade-in">
            <h3
              className="font-bold text-base"
              style={{ color: "var(--color-mm-dark)" }}
            >
              Project Images & Assets
            </h3>
            <label className="px-4 py-2 bg-white border border-mm-border hover:bg-mm-subtle text-mm-gray font-medium rounded-xl transition-colors inline-flex items-center gap-2 text-sm cursor-pointer shadow-sm">
              {imageUploading ? (
                <Loader2 size={14} className="animate-spin text-mm-orange" />
              ) : (
                <Plus size={14} className="text-mm-orange" />
              )}
              {imageUploading ? "Uploading..." : "Add Image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={imageUploading}
              />
            </label>
          </div>

          {(!project.assets || project.assets.length === 0) ? (
            <div
              className="flex flex-col items-center justify-center p-8 border border-dashed rounded-2xl text-center"
              style={{ borderColor: "var(--color-mm-border)", background: "var(--color-mm-subtle)/10" }}
            >
              <UploadCloud size={32} className="text-mm-gray mb-2" />
              <p className="text-sm font-semibold text-mm-dark">No images uploaded yet</p>
              <p className="text-xs text-mm-gray mt-1">Upload project screenshots, designs, or mockups</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {project.assets.map((url, idx) => (
                <div
                  key={url + idx}
                  className="group relative aspect-square rounded-2xl overflow-hidden border border-mm-border bg-mm-subtle/30 transition-all hover:shadow-md"
                >
                  <img
                    src={url}
                    alt={`Asset ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => onViewImage(url)}
                      className="p-2 bg-white/95 hover:bg-white text-mm-dark rounded-xl shadow transition-colors cursor-pointer"
                      title="View Image"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(url)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow transition-colors cursor-pointer"
                      title="Remove Image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Right Column: Milestones & Progress Slider */}
      <div className="space-y-6">
        {/* Overall Progress Slider */}
        <Card>
          <h3
            className="font-semibold mb-4"
            style={{ color: "var(--color-mm-dark)" }}
          >
            Overall Project Progress
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span style={{ color: "var(--color-mm-gray)" }}>
                Adjust Progress
              </span>
              <span
                className="text-lg font-bold"
                style={{ color: "var(--color-mm-orange)" }}
              >
                {project.progress}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={project.progress}
              onChange={(e) => {
                const val = Number(e.target.value);
                let newStatus = project.status;
                if (val === 100) newStatus = "Completed";
                else if (val === 0) newStatus = "Pending";
                else if (
                  project.status === "Completed" ||
                  project.status === "Pending"
                )
                  newStatus = "In Progress";

                onDetailsChange({ ...project, progress: val, status: newStatus });
              }}
              className="w-full mm-range-input cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--color-mm-orange) 0%, var(--color-mm-orange) ${project.progress}%, var(--color-mm-subtle) ${project.progress}%, var(--color-mm-subtle) 100%)`,
              }}
            />
          </div>
        </Card>

        {/* Add Update Form */}
        <Card>
          <h3
            className="font-semibold mb-3"
            style={{ color: "var(--color-mm-dark)" }}
          >
            Add Project Milestone / Task Update
          </h3>
          <form
            onSubmit={handleAddUpdate}
            className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
          >
            <div className="md:col-span-2">
              <label
                className="text-xs font-semibold mb-1 block"
                style={{ color: "var(--color-mm-gray)" }}
              >
                Update Message
              </label>
              <input
                type="text"
                placeholder="e.g. Completed initial dashboard layout..."
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label
                className="text-xs font-semibold mb-1 block"
                style={{ color: "var(--color-mm-gray)" }}
              >
                Designation / Role
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Manager"
                  value={newDesig}
                  onChange={(e) => setNewDesig(e.target.value)}
                  className="input-field flex-1"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-mm-orange hover:bg-mm-orange/95 text-white font-semibold rounded-xl transition-colors shrink-0 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </form>
        </Card>

        {/* Milestones / Updates List */}
        <Card>
          <h3
            className="font-semibold mb-4"
            style={{ color: "var(--color-mm-dark)" }}
          >
            Milestones & Updates
          </h3>
          <div className="space-y-4">
            {(project.updates || []).map((u, idx) => {
              const isEditing = editingIndex === idx;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-mm-border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-shadow hover:shadow-sm"
                  style={{ background: "white" }}
                >
                  {isEditing ? (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editMsg}
                        onChange={(e) => setEditMsg(e.target.value)}
                        className="input-field text-sm"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editDesig}
                          onChange={(e) => setEditDesig(e.target.value)}
                          className="input-field text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(idx)}
                          className="px-3 py-1 bg-mm-green hover:bg-mm-green/95 text-white font-semibold rounded-lg text-xs cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingIndex(null)}
                          className="px-3 py-1 bg-white border border-mm-border text-mm-gray hover:bg-mm-subtle rounded-lg text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 space-y-1">
                        <div
                          className="text-sm font-semibold"
                          style={{ color: "var(--color-mm-dark)" }}
                        >
                          {u.message}
                        </div>
                        <div
                          className="flex items-center gap-3 text-xs"
                          style={{ color: "var(--color-mm-gray)" }}
                        >
                          <span>By {u.designation}</span>
                          <span>•</span>
                          <span>
                            {u.timestamp
                              ? new Date(u.timestamp).toLocaleString()
                              : ""}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingIndex(idx);
                            setEditMsg(u.message);
                            setEditDesig(u.designation);
                          }}
                          className="p-2 rounded-lg hover:bg-mm-subtle text-mm-gray transition-colors cursor-pointer"
                          title="Edit Update"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUpdate(idx)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                          title="Delete Update"
                        >
                          <Trash2
                            size={14}
                            style={{ color: "var(--color-mm-red)" }}
                          />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            {(!project.updates || project.updates.length === 0) && (
              <div
                className="text-center py-6 text-sm"
                style={{ color: "var(--color-mm-gray)" }}
              >
                No updates or milestones added yet. Add one above!
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============ Detailed Info ============ */
function DetailedTab({
  project,
  onViewImage,
}: {
  project: Project;
  onViewImage: (url: string) => void;
}) {
  const { users = [], businesses = [] } = Route.useLoaderData();

  const biz =
    typeof project.businessId === "object" && project.businessId !== null
      ? project.businessId
      : (businesses.find((b) => b.id === project.businessId) || null);

  const usr =
    biz
      ? (typeof biz.userId === "object" && biz.userId !== null
          ? biz.userId
          : (users.find((u) => u.id === (typeof biz.userId === "string" ? biz.userId : biz.userId?.id)) || null))
      : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          <InfoCard
            title="Client Information"
            rows={[
              [
                "Client",
                <div key="c" className="flex items-center gap-2">
                  {usr?.image ? (
                    <img
                      src={usr.image}
                      alt={usr.fullName}
                      className="w-8 h-8 rounded-full object-cover aspect-square shrink-0"
                    />
                  ) : (
                    <Avatar name={usr?.fullName || "Client"} size={32} />
                  )}
                  <span>{usr?.fullName || "N/A"}</span>
                </div>,
              ],
              [
                "Email",
                usr?.email ? (
                  <a
                    key="em"
                    href={`mailto:${usr.email}`}
                    className="hover:underline"
                    style={{ color: "var(--color-mm-orange)" }}
                  >
                    {usr.email}
                  </a>
                ) : (
                  "N/A"
                ),
              ],
              [
                "Phone",
                usr?.phone ? (
                  <a
                    key="ph"
                    href={`tel:${usr.phone}`}
                    className="hover:underline"
                    style={{ color: "var(--color-mm-orange)" }}
                  >
                    {usr.phone}
                  </a>
                ) : (
                  "N/A"
                ),
              ],
              [
                "Joined On",
                usr?.createdAt
                  ? new Date(usr.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A",
              ],
            ]}
          />
          <InfoCard
            title="Business Information"
            rows={[
              [
                "Business",
                <div key="b" className="flex items-center gap-2">
                  {biz?.image ? (
                    <img
                      src={biz.image}
                      alt={biz.businessName}
                      className="w-8 h-8 rounded-full object-cover aspect-square shrink-0"
                    />
                  ) : (
                    <Avatar name={biz?.businessName || "Business"} size={32} />
                  )}
                  <span>{biz?.businessName || "N/A"}</span>
                </div>,
              ],
              ["Industry / Type", biz?.businessType || "N/A"],
              [
                "Website",
                biz?.websiteUrl ? (
                  <a
                    key="web"
                    href={biz.websiteUrl.startsWith("http") ? biz.websiteUrl : `https://${biz.websiteUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: "var(--color-mm-orange)" }}
                  >
                    {biz.websiteUrl}
                  </a>
                ) : (
                  "N/A"
                ),
              ],
              [
                "Plan",
                biz?.plan ? (
                  <PlanBadge key="pl" plan={biz.plan} />
                ) : (
                  <PlanBadge key="pl" plan="None" />
                ),
              ],
              [
                "Payment Status",
                biz?.paymentStatus ? (
                  <StatusBadge key="ps" status={biz.paymentStatus} />
                ) : (
                  "N/A"
                ),
              ],
            ]}
          />
        </div>
        <InfoCard
          title="Project Details"
          rows={[
            ["Project ID", project.id],
            [
              "Services",
              <span key="s" className="flex flex-wrap gap-1">
                {project.services.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{
                      background:
                        "color-mix(in oklch, var(--color-mm-orange) 18%, white)",
                      border: "1px solid var(--color-mm-orange)",
                      color: "var(--color-mm-orange)",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </span>,
            ],
            ["Project Manager", project.assignee],
            [
              "Start Date",
              project.startDate
                ? new Date(project.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "N/A",
            ],
            [
              "Deadline",
              project.deadline
                ? new Date(project.deadline).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "N/A",
            ],
            ["Status", <StatusBadge key="st" status={project.status} />],
            [
              "Priority",
              <PriorityBadge key="pr" priority={project.priority} />,
            ],
          ]}
        />
      </div>

      <Card>
        <h3
          className="font-semibold mb-2"
          style={{ color: "var(--color-mm-dark)" }}
        >
          Project Description
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--color-mm-gray)" }}
        >
          {project.description || "No description set."}
        </p>
      </Card>

      {/* Project Images & Assets (View Only) */}
      {project.assets && project.assets.length > 0 ? (
        <Card>
          <h3
            className="font-semibold mb-3"
            style={{ color: "var(--color-mm-dark)" }}
          >
            Project Images & Assets
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {project.assets.map((url, idx) => (
              <div
                key={url + idx}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-mm-border bg-mm-subtle/30 transition-all hover:shadow-md cursor-pointer animate-in fade-in"
                onClick={() => onViewImage(url)}
              >
                <img
                  src={url}
                  alt={`Asset ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="p-2 bg-white/95 text-mm-dark rounded-xl shadow transition-colors">
                    <Eye size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <h3
            className="font-semibold mb-3"
            style={{ color: "var(--color-mm-dark)" }}
          >
            Project Images & Assets
          </h3>
          <div
            className="flex flex-col items-center justify-center p-8 border border-dashed rounded-2xl text-center"
            style={{ borderColor: "var(--color-mm-border)", background: "var(--color-mm-subtle)/10" }}
          >
            <UploadCloud size={32} className="text-mm-gray mb-2 animate-in fade-in" />
            <p className="text-sm font-semibold text-mm-dark">No images available</p>
            <p className="text-xs text-mm-gray mt-1">Images uploaded in the Progress tab will appear here</p>
          </div>
        </Card>
      )}

      <Card>
        <h3
          className="font-semibold mb-3"
          style={{ color: "var(--color-mm-dark)" }}
        >
          Notes
        </h3>
        <p
          className="text-sm leading-relaxed whitespace-pre-wrap"
          style={{ color: "var(--color-mm-gray)" }}
        >
          {project.notes || "No notes set."}
        </p>
      </Card>
    </div>
  );
}

function InfoCard({
  title,
  rows,
}: {
  title: string;
  rows: [string, React.ReactNode][];
}) {
  return (
    <Card>
      <h3
        className="font-semibold mb-3"
        style={{ color: "var(--color-mm-dark)" }}
      >
        {title}
      </h3>
      <div>
        {rows.map(([label, value], i) => (
          <div
            key={label}
            className="flex justify-between items-center py-2.5 gap-4"
            style={{
              borderTop: i === 0 ? "none" : "1px solid var(--color-mm-border)",
            }}
          >
            <span
              className="text-[11px] uppercase tracking-wide font-semibold"
              style={{ color: "var(--color-mm-gray)" }}
            >
              {label}
            </span>
            <span
              className="text-sm font-semibold text-right"
              style={{ color: "var(--color-mm-dark)" }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
