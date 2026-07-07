import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  CheckCircle2, Check, X, Pencil, Trash2, Plus, Download, Loader2,
  FileText, FileSpreadsheet, FileType, UploadCloud, Search, FileSearch, ArrowLeft, Eye
} from "lucide-react";
import type { Project, ServiceGroup, Status, Task, Priority } from "@/lib/mock-data";
import { Avatar, Card, ProgressBar, StatusBadge } from "@/components/admin/shared";
import { getProjectsFn, saveProjectFn, getUsersFn, getBusinessesFn } from "@/lib/server-functions";

export const Route = createFileRoute("/_admin/admin/projects/$id")({
  head: () => ({ meta: [{ title: "Project — GrowConsult AI" }] }),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      edit: Boolean(search.edit)
    };
  },
  component: ProjectDetail,
});

type Tab = "overview" | "progress" | "detailed";

function ProjectDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProjects = async () => {
    const [pData, uData, bData] = await Promise.all([
      getProjectsFn(),
      getUsersFn(),
      getBusinessesFn()
    ]);
    setBusinesses(bData);

    const mapped = pData.map(p => {
      const biz = typeof p.businessId === "object" && p.businessId !== null
        ? p.businessId
        : bData.find(b => b.id === p.businessId);
      const usr = biz
        ? (typeof biz.userId === "object" && biz.userId !== null
          ? biz.userId
          : uData.find(u => u.id === (typeof biz.userId === "string" ? biz.userId : biz.userId?.id)))
        : null;
      
      let status: "Pending" | "In Progress" | "Completed" = "In Progress";
      if (p.progress === 0) status = "Pending";
      else if (p.progress === 100) status = "Completed";

      return {
        id: p.id,
        client: biz?.businessName || "No business",
        services: [p.type],
        manager: "John Smith",
        status: status,
        progress: p.progress,
        deadline: p.deadline ? new Date(p.deadline).toLocaleDateString() : "",
        startDate: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "",
        priority: "Medium" as const,
        email: usr?.email || "",
        phone: usr?.phone || "",
        industry: biz?.businessType || "Consulting",
        website: biz?.websiteUrl || "",
        joinedOn: usr?.createdAt ? new Date(usr.createdAt).toLocaleDateString() : "",
        plan: (biz?.plan || "None") + " Plan",
        description: p.description,
        notes: "",
        serviceGroups: [
          { 
            name: p.type, 
            progress: p.progress,
            color: "var(--color-mm-orange)",
            tasks: p.updates.map((u, i) => ({
              id: `t-${i}`,
              name: u.message,
              assignee: u.designation,
              status: p.progress === 100 ? ("Completed" as const) : ("In Progress" as const),
              progress: p.progress
            }))
          }
        ]
      };
    });
    setProjectList(mapped);
  };

  const { edit } = Route.useSearch();
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    refreshProjects().then(() => {
      setIsLoading(false);
      if (edit) {
        setEditOpen(true);
      }
    });
  }, [id, edit]);

  const project = projectList.find((p) => p.id === id) || projectList[0];
  const [tab, setTab] = useState<Tab>("overview");

  const updateProject = (next: Project) => {
    const matchedBiz = businesses.find(b => b.businessName === next.client);
    const businessId = matchedBiz ? matchedBiz.id : next.id;
    
    const projectSchemaData = {
      id: next.id,
      businessId: businessId,
      name: next.client,
      description: next.description,
      domain: next.website || "",
      type: next.services.join(" + "),
      progress: next.progress,
      updates: next.serviceGroups.map(g => ({
        message: `${g.name} progress updated to ${g.progress}%`,
        timestamp: new Date(),
        designation: "Manager"
      })),
      deadline: next.deadline ? new Date(next.deadline) : null,
      createdAt: next.startDate ? new Date(next.startDate) : new Date(),
      updatedAt: new Date(),
    };

    saveProjectFn({ data: projectSchemaData }).then(() => {
      setProjectList((list) => list.map((p) => (p.id === next.id ? next : p)));
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-2">
        <div className="w-8 h-8 border-4 border-mm-orange border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-semibold" style={{ color: "var(--color-mm-gray)" }}>Loading project details...</span>
      </div>
    );
  }

  if (!project) {
    return <div className="p-8">Project not found.</div>;
  }

  return (
    <div className="flex gap-6 -m-6 md:-m-8">
      {/* Left panel - project list */}
      <aside
        className="hidden lg:block w-72 flex-shrink-0 sticky top-0 h-screen overflow-y-auto"
        style={{ background: "white", borderRight: "1px solid var(--color-mm-border)" }}
      >
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--color-mm-dark)" }}>Projects</h3>
          <div className="space-y-1">
            {projectList.map((p) => {
              const active = p.id === project.id;
              return (
                <button
                  key={p.id}
                  onClick={() => navigate({ to: "/admin/projects/$id", params: { id: p.id }, search: { edit: false } })}
                  className="w-full text-left px-3 py-2.5 rounded-xl transition-colors"
                  style={{
                    background: active ? "color-mix(in oklch, var(--color-mm-orange) 18%, transparent)" : "transparent",
                    borderLeft: active ? "3px solid var(--color-mm-orange)" : "3px solid transparent",
                  }}
                >
                  <div className="text-xs" style={{ color: "var(--color-mm-gray)" }}>{p.id}</div>
                  <div className="font-semibold text-sm" style={{ color: "var(--color-mm-dark)" }}>{p.client}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--color-mm-gray)" }}>{p.services.join(" + ")}</div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Right panel */}
      <div className="flex-1 min-w-0 p-6 md:p-8 space-y-6 overflow-x-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs" style={{ color: "var(--color-mm-gray)" }}>
              <Link to="/admin/projects" className="hover:underline">Projects</Link> / {project.id}
            </div>
            <h1 className="text-xl font-bold mt-1" style={{ color: "var(--color-mm-dark)" }}>
              {project.client} — {project.services.join(" + ")}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={project.status} />
            <button className="px-4 py-2 bg-mm-orange hover:bg-mm-orange/95 text-white font-semibold rounded-xl transition-colors" onClick={() => setEditOpen(true)}>Edit Project</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6" style={{ borderBottom: "1px solid var(--color-mm-border)" }}>
          {([
            ["overview", "Overview"],
            ["progress", "Progress"],
            ["detailed", "Detailed Info"],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="pb-3 text-sm font-medium transition-colors"
              style={{
                color: tab === key ? "var(--color-mm-dark)" : "var(--color-mm-gray)",
                fontWeight: tab === key ? 700 : 500,
                borderBottom: tab === key ? "2px solid var(--color-mm-orange)" : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "overview" && <OverviewTab project={project} onChange={updateProject} />}
        {tab === "progress" && <ProgressTab project={project} onChange={updateProject} />}
        {tab === "detailed" && <DetailedTab project={project} onChange={updateProject} />}

        {editOpen && (
          <EditProjectModal
            project={project}
            onClose={() => setEditOpen(false)}
            onSave={(p) => { updateProject(p); setEditOpen(false); }}
          />
        )}
      </div>
    </div>
  );
}

/* ============ Overview ============ */
function OverviewTab({ project, onChange }: { project: Project; onChange: (p: Project) => void }) {
  const handleEditGroup = (gName: string) => {
    const currentGroup = project.serviceGroups.find(g => g.name === gName);
    if (!currentGroup) return;
    const newName = window.prompt("Enter new name for service group:", gName);
    if (!newName) return;
    const newProgressStr = window.prompt("Enter progress (0-100):", String(currentGroup.progress));
    if (newProgressStr === null) return;
    const newProgress = Math.max(0, Math.min(100, Number(newProgressStr) || 0));
    
    const groups = project.serviceGroups.map(g => g.name === gName ? { ...g, name: newName, progress: newProgress } : g);
    onChange({ ...project, serviceGroups: groups });
  };
  
  const handleDeleteGroup = (gName: string) => {
    if (window.confirm(`Are you sure you want to delete the "${gName}" service group?`)) {
      const groups = project.serviceGroups.filter(g => g.name !== gName);
      onChange({ ...project, serviceGroups: groups });
    }
  };

  const rows: [string, React.ReactNode][] = [
    ["Project ID", project.id],
    ["Client/Business", project.client],
    ["Services", <span className="flex flex-wrap gap-1" key="s">
      {project.services.map((s) => (
        <span key={s} className="px-2 py-0.5 rounded-full text-xs"
          style={{ background: "color-mix(in oklch, var(--color-mm-orange) 18%, white)", border: "1px solid var(--color-mm-orange)", color: "var(--color-mm-orange)" }}>{s}</span>
      ))}
    </span>],
    ["Project Manager", project.manager],
    ["Start Date", project.startDate],
    ["Deadline", project.deadline],
    ["Status", <StatusBadge key="st" status={project.status} />],
    ["Priority", <PriorityBadge key="pr" priority={project.priority} />],
  ];

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold mb-4" style={{ color: "var(--color-mm-dark)" }}>Project Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {rows.map(([label, value]) => (
            <div key={label}>
              <div className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: "var(--color-mm-gray)" }}>{label}</div>
              <div className="mt-1 font-semibold text-sm" style={{ color: "var(--color-mm-dark)" }}>{value}</div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm font-semibold mb-2" style={{ color: "var(--color-mm-dark)" }}>
            <span>Overall Progress</span>
            <span style={{ color: "var(--color-mm-dark)" }}>{project.progress}%</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--color-mm-subtle)" }}>
            <div className="h-full rounded-full" style={{ width: `${project.progress}%`, background: "var(--color-mm-orange)" }} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold mb-3" style={{ color: "var(--color-mm-dark)" }}>Website Development</h3>
          {["Responsive Design", "CMS Integration", "Pages Development", "Hosting & Setup"].map((i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 text-sm" style={{ color: "var(--color-mm-gray)" }}>
              <CheckCircle2 size={16} style={{ color: "var(--color-success)" }} /> {i}
            </div>
          ))}
        </Card>
        <Card>
          <h3 className="font-semibold mb-3" style={{ color: "var(--color-mm-dark)" }}>Marketing</h3>
          {["Campaign Setup", "Social Media Marketing", "Content Creation", "Analytics & Reporting"].map((i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 text-sm" style={{ color: "var(--color-mm-gray)" }}>
              <CheckCircle2 size={16} style={{ color: "var(--color-success)" }} /> {i}
            </div>
          ))}
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {project.serviceGroups.map((g) => (
          <Card key={g.name} className="text-center relative group">
            <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleEditGroup(g.name)} 
                className="p-1 rounded hover:bg-mm-subtle text-mm-gray transition-colors cursor-pointer"
                title="Edit Group"
              >
                <Pencil size={13} />
              </button>
              <button 
                onClick={() => handleDeleteGroup(g.name)} 
                className="p-1 rounded hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                title="Delete Group"
              >
                <Trash2 size={13} style={{ color: "var(--color-mm-red)" }} />
              </button>
            </div>
            <div className="font-semibold mb-3 pr-8 pl-8" style={{ color: "var(--color-mm-dark)" }}>{g.name}</div>
            <RingProgress value={g.progress} color={g.color} />
            <div className="mt-3 inline-block">
              <StatusBadge status="In Progress" />
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="font-semibold mb-3" style={{ color: "var(--color-mm-dark)" }}>Task Summary</h3>
        <div className="flex flex-wrap gap-3">
          <SummaryChip label="Total Tasks" value="48" bg="var(--color-mm-subtle)" color="var(--color-mm-gray)" />
          <SummaryChip label="Completed" value="26" bg="color-mix(in oklch, var(--color-success) 15%, white)" color="var(--color-success)" />
          <SummaryChip label="In Progress" value="14" bg="color-mix(in oklch, var(--color-info) 15%, white)" color="var(--color-info)" />
          <SummaryChip label="Pending" value="6" bg="color-mix(in oklch, var(--color-pending) 20%, white)" color="oklch(0.55 0.14 75)" />
          <SummaryChip label="Overdue" value="2" bg="color-mix(in oklch, var(--color-danger) 15%, white)" color="var(--color-danger)" />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: "var(--color-mm-dark)" }}>Recent Activity</h3>
          <Link to="/admin/projects" className="text-sm font-semibold hover:underline" style={{ color: "var(--color-mm-orange)" }}>
            View All Activity →
          </Link>
        </div>
        <div className="space-y-3">
          {[
            ["var(--color-success)", "Homepage design completed", "John Smith", "May 26, 2024 10:30 AM"],
            ["var(--color-info)", "New marketing campaign created", "Sarah Wilson", "May 25, 2024 02:15 PM"],
            ["var(--color-success)", "SEO audit completed", "Mike Johnson", "May 24, 2024 11:20 AM"],
            ["var(--color-pending)", "Content updated on about page", "John Smith", "May 23, 2024 04:45 PM"],
          ].map(([color, text, by, time], i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
              <span className="flex-1" style={{ color: "var(--color-mm-dark)" }}>{text}</span>
              <span style={{ color: "var(--color-mm-gray)" }}>By {by}</span>
              <span className="text-xs" style={{ color: "var(--color-mm-gray)" }}>{time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SummaryChip({ label, value, bg, color }: { label: string; value: string; bg: string; color: string }) {
  return (
    <div className="rounded-xl px-4 py-3 min-w-[110px]" style={{ background: bg, color }}>
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
        <circle cx="56" cy="56" r={r} stroke="var(--color-mm-subtle)" strokeWidth="8" fill="none" />
        <circle cx="56" cy="56" r={r} stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={c} strokeDashoffset={c - (c * value) / 100} strokeLinecap="round"
          transform="rotate(-90 56 56)" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold" style={{ color }}>
        {value}%
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const map = {
    High: { bg: "color-mix(in oklch, var(--color-danger) 15%, white)", color: "var(--color-danger)", border: "var(--color-danger)" },
    Medium: { bg: "color-mix(in oklch, var(--color-pending) 20%, white)", color: "oklch(0.55 0.14 75)", border: "var(--color-pending)" },
    Low: { bg: "color-mix(in oklch, var(--color-success) 15%, white)", color: "var(--color-success)", border: "var(--color-success)" },
  }[priority];
  return (
    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase"
      style={{ background: map.bg, color: map.color, border: `1px solid ${map.border}` }}>
      {priority}
    </span>
  );
}

/* ============ Progress tab with inline editing ============ */
function ProgressTab({ project, onChange }: { project: Project; onChange: (p: Project) => void }) {
  const updateGroup = (idx: number, group: ServiceGroup) => {
    const groups = [...project.serviceGroups];
    const avg = group.tasks.length
      ? Math.round(group.tasks.reduce((s, t) => s + t.progress, 0) / group.tasks.length)
      : 0;
    groups[idx] = { ...group, progress: avg };
    onChange({ ...project, serviceGroups: groups });
  };

  const handleEditGroup = (idx: number, gName: string) => {
    const currentGroup = project.serviceGroups[idx];
    if (!currentGroup) return;
    const newName = window.prompt("Enter new name for service group:", gName);
    if (!newName) return;
    const newProgressStr = window.prompt("Enter progress (0-100):", String(currentGroup.progress));
    if (newProgressStr === null) return;
    const newProgress = Math.max(0, Math.min(100, Number(newProgressStr) || 0));

    const groups = [...project.serviceGroups];
    groups[idx] = { ...currentGroup, name: newName, progress: newProgress };
    onChange({ ...project, serviceGroups: groups });
  };

  const handleDeleteGroup = (idx: number, gName: string) => {
    if (window.confirm(`Are you sure you want to delete the "${gName}" service group?`)) {
      const groups = project.serviceGroups.filter((_, i) => i !== idx);
      onChange({ ...project, serviceGroups: groups });
    }
  };

  return (
    <div className="space-y-6">
      {project.serviceGroups.map((g, idx) => (
        <ServiceGroupCard 
          key={g.name} 
          group={g} 
          onChange={(g2) => updateGroup(idx, g2)}
          onEdit={() => handleEditGroup(idx, g.name)}
          onDelete={() => handleDeleteGroup(idx, g.name)}
        />
      ))}
    </div>
  );
}

function ServiceGroupCard({ group, onChange, onEdit, onDelete }: { group: ServiceGroup; onChange: (g: ServiceGroup) => void; onEdit: () => void; onDelete: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Task | null>(null);

  const startEdit = (t: Task) => { setEditingId(t.id); setDraft({ ...t }); };
  const cancel = () => { setEditingId(null); setDraft(null); };
  const save = () => {
    if (!draft) return;
    const tasks = group.tasks.map((t) => (t.id === draft.id ? draft : t));
    onChange({ ...group, tasks });
    cancel();
  };
  const addTask = () => {
    const id = `t-${Date.now()}`;
    const t: Task = { id, name: "", assignee: "", status: "Pending", progress: 0 };
    onChange({ ...group, tasks: [...group.tasks, t] });
    setEditingId(id); setDraft(t);
  };
  const remove = (id: string) => {
    onChange({ ...group, tasks: group.tasks.filter((t) => t.id !== id) });
    setDeleteId(null);
  };

  return (
    <Card className="!p-0 overflow-hidden" style={{ borderLeft: `4px solid ${group.color}` }}>
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold" style={{ color: "var(--color-mm-dark)" }}>{group.name}</h3>
          <button onClick={onEdit} className="p-1 rounded hover:bg-mm-subtle text-mm-gray transition-colors cursor-pointer" title="Edit Group">
            <Pencil size={13} />
          </button>
          <button onClick={onDelete} className="p-1 rounded hover:bg-red-50 text-red-500 transition-colors cursor-pointer" title="Delete Group">
            <Trash2 size={13} style={{ color: "var(--color-mm-red)" }} />
          </button>
        </div>
        <div className="flex items-center gap-3 w-64">
          <ProgressBar value={group.progress} color={group.color} />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-mm-subtle border-b border-mm-border text-mm-gray font-semibold">
              {["Task", "Assignee", "Status", "Progress", "Actions"].map((h) => (
                <th key={h} className="text-left font-semibold px-5 py-2.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {group.tasks.map((t) => {
              const isEditing = editingId === t.id;
              const d = isEditing ? draft! : t;
              return (
                <tr key={t.id} className="group hover:bg-mm-subtle transition-colors" style={{ borderTop: "1px solid var(--color-mm-border)" }}>
                  <td className="px-5 py-3 font-medium" style={{ color: "var(--color-mm-dark)" }}>
                    {isEditing
                      ? <input className="input-field !py-1" value={d.name} onChange={(e) => setDraft({ ...d, name: e.target.value })} />
                      : t.name}
                  </td>
                  <td className="px-5 py-3">
                    {isEditing
                      ? <input className="input-field !py-1" value={d.assignee} onChange={(e) => setDraft({ ...d, assignee: e.target.value })} />
                      : <div className="flex items-center gap-2"><Avatar name={t.assignee || "?"} size={22} /><span style={{ color: "var(--color-mm-gray)" }}>{t.assignee}</span></div>}
                  </td>
                  <td className="px-5 py-3">
                    {isEditing
                      ? <select className="input-field !py-1" value={d.status} onChange={(e) => setDraft({ ...d, status: e.target.value as Status })}>
                          {(["Pending", "In Progress", "Completed", "On Hold"] as Status[]).map((s) => <option key={s}>{s}</option>)}
                        </select>
                      : <StatusBadge status={t.status} />}
                  </td>
                  <td className="px-5 py-3 min-w-[160px]">
                    {isEditing
                      ? <input type="number" min={0} max={100} className="input-field !py-1 w-20"
                          value={d.progress} onChange={(e) => setDraft({ ...d, progress: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} />
                      : <ProgressBar value={t.progress} color={group.color} />}
                  </td>
                  <td className="px-5 py-3">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button onClick={save} className="hover:opacity-70" title="Save"><Check size={18} style={{ color: "var(--color-success)" }} /></button>
                        <button onClick={cancel} className="hover:opacity-70" title="Cancel"><X size={18} style={{ color: "var(--color-danger)" }} /></button>
                      </div>
                    ) : deleteId === t.id ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span style={{ color: "var(--color-mm-gray)" }}>Delete?</span>
                        <button onClick={() => remove(t.id)} className="px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "var(--color-mm-red)", color: "white" }}>Yes</button>
                        <button onClick={() => setDeleteId(null)} className="px-2 py-0.5 rounded-full font-semibold border border-mm-border bg-mm-subtle text-mm-gray">No</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(t)} className="hover:opacity-70"><Pencil size={15} style={{ color: "var(--color-mm-gray)" }} /></button>
                        <button onClick={() => setDeleteId(t.id)} className="hover:opacity-70"><Trash2 size={15} style={{ color: "var(--color-mm-gray)" }} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3" style={{ borderTop: "1px solid var(--color-mm-border)" }}>
        <button onClick={addTask} className="px-4 py-2 bg-white border border-mm-border hover:bg-mm-subtle text-mm-gray font-medium rounded-xl transition-colors inline-flex items-center gap-2 text-sm">
          <Plus size={14} /> Add Task
        </button>
      </div>
    </Card>
  );
}

/* ============ Detailed Info ============ */
function DetailedTab({ project, onChange }: { project: Project; onChange: (p: Project) => void }) {
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState(project.description);
  const [notes, setNotes] = useState(project.notes);

  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [filesList, setFilesList] = useState([
    { id: 1, name: "Project_Requirement.pdf", type: "PDF", size: "2.4 MB", date: "Uploaded May 15, 2024", by: "by John Smith", icon: FileText, color: "var(--color-mm-red)", tagBg: "rgba(224, 86, 36, 0.1)", tagColor: "var(--color-mm-red)" },
    { id: 2, name: "Brand_Guidelines.pdf", type: "PDF", size: "1.8 MB", date: "Uploaded May 18, 2024", by: "by Sarah Wilson", icon: FileText, color: "var(--color-mm-red)", tagBg: "rgba(224, 86, 36, 0.1)", tagColor: "var(--color-mm-red)" },
    { id: 3, name: "Content_Document.docx", type: "DOC", size: "3.2 MB", date: "Uploaded May 20, 2024", by: "by Mike Johnson", icon: FileText, color: "var(--color-mm-blue)", tagBg: "rgba(59, 130, 246, 0.1)", tagColor: "var(--color-mm-blue)" },
    { id: 4, name: "Project_Timeline.xlsx", type: "XLS", size: "1.2 MB", date: "Uploaded May 22, 2024", by: "by John Smith", icon: FileText, color: "var(--color-mm-green)", tagBg: "rgba(92, 177, 62, 0.1)", tagColor: "var(--color-mm-green)" },
    { id: 5, name: "Design_Brief.pdf", type: "PDF", size: "0.8 MB", date: "Uploaded May 25, 2024", by: "by Sarah Wilson", icon: FileText, color: "var(--color-mm-red)", tagBg: "rgba(224, 86, 36, 0.1)", tagColor: "var(--color-mm-red)" },
    { id: 6, name: "Meeting_Notes.docx", type: "DOC", size: "0.3 MB", date: "Uploaded May 28, 2024", by: "by Mike Johnson", icon: FileText, color: "var(--color-mm-blue)", tagBg: "rgba(59, 130, 246, 0.1)", tagColor: "var(--color-mm-blue)" },
  ]);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [fileSearch, setFileSearch] = useState("");
  const [fileFilter, setFileFilter] = useState("All Files");
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleSaveNote = () => {
    if (!notes.trim() || notes.length > 500) return;
    setIsSavingNote(true);
    setNoteSuccess(false);
    setTimeout(() => {
      onChange({ ...project, notes });
      setIsSavingNote(false);
      setNoteSuccess(true);
      setToast("✓ Note saved successfully!");
      setTimeout(() => setNoteSuccess(false), 3000);
    }, 800);
  };

  const handleDownload = (filename: string) => {
    setDownloadingFile(filename);
    setTimeout(() => {
      const blob = new Blob([`Dummy PDF content for ${filename}`], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadingFile(null);
      setToast(`✓ File downloaded successfully!`);
    }, 1000);
  };

  const filteredModalFiles = filesList.filter(f => {
    if (fileFilter === "PDF" && f.type !== "PDF") return false;
    if (fileFilter === "Documents" && f.type !== "DOC") return false;
    if (fileFilter === "Spreadsheets" && f.type !== "XLS") return false;
    if (fileFilter === "Images" && f.type !== "IMG") return false;
    if (fileSearch.trim() && !f.name.toLowerCase().includes(fileSearch.toLowerCase())) return false;
    return true;
  });

  const handleDeleteFile = (id: number) => {
    setFilesList(filesList.filter(f => f.id !== id));
    setToast("✓ File deleted successfully!");
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setTimeout(() => {
      const newFile = {
        id: Date.now(),
        name: selectedFile.name,
        type: selectedFile.name.endsWith(".pdf") ? "PDF" : selectedFile.name.endsWith(".docx") ? "DOC" : "FILE",
        size: (selectedFile.size / 1024 / 1024).toFixed(1) + " MB",
        date: "Uploaded Today",
        by: "by You",
        icon: FileText,
        color: "var(--color-mm-gray)",
        tagBg: "var(--color-mm-subtle)",
        tagColor: "var(--color-mm-gray)"
      };
      setFilesList([newFile, ...filesList]);
      setIsUploading(false);
      setIsFileUploadOpen(false);
      setSelectedFile(null);
      setToast("✓ File uploaded successfully!");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard title="Client/Business Information" rows={[
          ["Business Name", project.client],
          ["Email", project.email],
          ["Phone", project.phone],
          ["Industry", project.industry],
          ["Website", <a key="w" href={`https://${project.website}`} className="hover:underline" style={{ color: "var(--color-mm-orange)" }}>{project.website}</a>],
          ["Joined On", project.joinedOn],
          ["Plan", <span key="p" className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: "color-mix(in oklch, var(--color-mm-orange) 18%, white)", border: "1px solid var(--color-mm-orange)", color: "var(--color-mm-orange)" }}>{project.plan}</span>],
        ]} />
        <InfoCard title="Project Details" rows={[
          ["Project ID", project.id],
          ["Services", <span key="s" className="flex flex-wrap gap-1">{project.services.map((s) => (
            <span key={s} className="px-2 py-0.5 rounded-full text-xs"
              style={{ background: "color-mix(in oklch, var(--color-mm-orange) 18%, white)", border: "1px solid var(--color-mm-orange)", color: "var(--color-mm-orange)" }}>{s}</span>
          ))}</span>],
          ["Project Manager", project.manager],
          ["Start Date", project.startDate],
          ["Deadline", project.deadline],
          ["Status", <StatusBadge key="st" status={project.status} />],
          ["Priority", <PriorityBadge key="pr" priority={project.priority} />],
        ]} />
      </div>

      <Card>
        <h3 className="font-semibold mb-2" style={{ color: "var(--color-mm-dark)" }}>Project Description</h3>
        {editingDesc ? (
          <div className="space-y-3">
            <textarea
              className="input-field min-h-[100px]"
              style={{ borderColor: "var(--color-mm-orange)" }}
              value={descDraft}
              onChange={(e) => setDescDraft(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setDescDraft(project.description); setEditingDesc(false); }}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold"
                style={{ color: "var(--color-mm-gray)" }}>Cancel</button>
              <button onClick={() => { onChange({ ...project, description: descDraft }); setEditingDesc(false); }}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white"
                style={{ background: "var(--color-mm-green)" }}>Save</button>
            </div>
          </div>
        ) : (
          <p onClick={() => setEditingDesc(true)} className="cursor-pointer text-sm leading-relaxed"
            style={{ color: "var(--color-mm-gray)" }}>
            {project.description}
          </p>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold mb-3" style={{ color: "var(--color-mm-dark)" }}>Files & Documents</h3>
        <div className="space-y-1">
          {filesList.map((f) => {
            const Icon = f.icon;
            const isDownloading = downloadingFile === f.name;
            return (
              <div key={f.name} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-mm-subtle">
                <Icon size={20} style={{ color: f.color }} />
                <div className="flex-1">
                  <div className="text-sm font-semibold" style={{ color: "var(--color-mm-dark)" }}>{f.name}</div>
                  <div className="text-xs" style={{ color: "var(--color-mm-gray)" }}>{f.size}</div>
                </div>
                <button onClick={() => handleDownload(f.name)} disabled={isDownloading} className="hover:opacity-70">
                  {isDownloading ? <Loader2 size={16} className="animate-spin" style={{ color: "var(--color-mm-orange)" }} /> : <Download size={16} style={{ color: "var(--color-mm-gray)" }} />}
                </button>
              </div>
            );
          }).slice(0, 4)}
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={() => setIsFileUploadOpen(true)} className="px-4 py-2 bg-white border border-mm-border hover:bg-mm-subtle text-mm-gray font-medium rounded-xl transition-colors inline-flex items-center gap-2 text-sm"><Plus size={14} /> Upload File</button>
          <button onClick={() => setIsFileModalOpen(true)} className="text-sm font-semibold hover:underline" style={{ color: "var(--color-mm-orange)" }}>View All Files →</button>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-3" style={{ color: "var(--color-mm-dark)" }}>Notes</h3>
        <textarea 
          className="input-field min-h-[100px]" 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)}
          style={{ borderColor: noteSuccess ? "var(--color-mm-green)" : undefined }}
        />
        <div className="flex items-center justify-between mt-3">
          <div style={{ color: notes.length > 500 ? "var(--color-mm-red)" : "var(--color-mm-gray)", fontSize: "12px", fontWeight: 600 }}>
            {notes.length} / 500 characters
          </div>
          <div className="flex items-center gap-3">
            {noteSuccess && <span style={{ color: "var(--color-mm-green)", fontSize: "12px", fontWeight: 600 }}>Note saved successfully!</span>}
            <button 
              onClick={handleSaveNote} 
              disabled={isSavingNote || !notes.trim() || notes.length > 500} 
              className="px-4 py-2 bg-mm-orange hover:bg-mm-orange/95 text-white font-semibold rounded-xl transition-colors" 
              style={{ opacity: (isSavingNote || !notes.trim() || notes.length > 500) ? 0.6 : 1 }}
            >
              {isSavingNote ? "Saving..." : "Save Note"}
            </button>
          </div>
        </div>
      </Card>

      {isFileUploadOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(4px)" }} onClick={() => setIsFileUploadOpen(false)}>
          <div className="w-full" style={{ background: "white", borderRadius: "24px", border: "1px solid var(--color-mm-border)", maxWidth: "560px", padding: "32px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ color: "var(--color-mm-dark)", fontWeight: 700, fontSize: "20px" }}>Upload File</h2>
              <button onClick={() => setIsFileUploadOpen(false)} className="hover:opacity-70 transition-opacity"><X size={20} style={{ color: "var(--color-mm-gray)" }} /></button>
            </div>
            
            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer" style={{ borderColor: "var(--color-mm-border)", background: "white", padding: "40px", transition: "all 0.2s" }} onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--color-mm-orange)"; e.currentTarget.style.background = "rgba(224, 86, 36, 0.1)"; }} onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--color-mm-border)"; e.currentTarget.style.background = "white"; }} onDrop={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--color-mm-border)"; e.currentTarget.style.background = "white"; if (e.dataTransfer.files?.[0]) setSelectedFile(e.dataTransfer.files[0]); }}>
              <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center" style={{ background: "var(--color-mm-subtle)" }}>
                <Plus size={24} style={{ color: "var(--color-mm-orange)" }} />
              </div>
              <div style={{ color: "var(--color-mm-gray)", fontWeight: 600, fontSize: "14px" }}>Drag & Drop file here</div>
              <div style={{ color: "var(--color-mm-gray)", fontSize: "12px", marginTop: "4px" }}>or click to browse from your computer</div>
              <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setSelectedFile(e.target.files[0]); }} />
            </label>

            {selectedFile && (
              <div className="mt-4 p-3 rounded-xl flex items-center justify-between" style={{ background: "var(--color-mm-subtle)", border: "1px solid var(--color-mm-border)" }}>
                <div className="flex items-center gap-3">
                  <FileText size={20} style={{ color: "var(--color-mm-orange)" }} />
                  <div>
                    <div style={{ color: "var(--color-mm-dark)", fontSize: "13px", fontWeight: 600 }}>{selectedFile.name}</div>
                    <div style={{ color: "var(--color-mm-gray)", fontSize: "11px" }}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                </div>
                <button onClick={() => setSelectedFile(null)} className="hover:opacity-70"><X size={16} style={{ color: "var(--color-mm-gray)" }} /></button>
              </div>
            )}

            <div className="mt-6 pt-4 flex justify-end gap-3" style={{ borderTop: "1px solid var(--color-mm-border)" }}>
              <button onClick={() => setIsFileUploadOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity" style={{ background: "white", border: "1px solid var(--color-mm-border)", color: "var(--color-mm-gray)" }}>Cancel</button>
              <button onClick={handleUpload} disabled={!selectedFile || isUploading} className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2" style={{ background: "var(--color-mm-orange)", color: "white", opacity: (!selectedFile || isUploading) ? 0.6 : 1 }}>
                {isUploading && <Loader2 size={16} className="animate-spin" />}
                {isUploading ? "Uploading..." : "Upload File"}
              </button>
            </div>
          </div>
        </div>
      )}
      {isFileModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 transition-opacity duration-300" style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(6px)" }} onClick={() => setIsFileModalOpen(false)}>
          <div className="w-full relative transition-all duration-300" style={{ background: "white", borderRadius: "24px", border: "1px solid var(--color-mm-border)", maxWidth: "900px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", height: "80vh", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: "var(--color-mm-border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(224, 86, 36, 0.1)" }}>
                  <FileSearch size={20} style={{ color: "var(--color-mm-orange)" }} />
                </div>
                <h2 className="text-xl font-bold" style={{ color: "var(--color-mm-dark)" }}>All Files & Documents</h2>
              </div>
              <button onClick={() => setIsFileModalOpen(false)} className="hover:opacity-70"><X size={20} style={{ color: "var(--color-mm-gray)" }} /></button>
            </div>
            
            <div className="p-5 border-b flex flex-wrap gap-4 items-center justify-between" style={{ borderColor: "var(--color-mm-border)", background: "white" }}>
              <div className="flex gap-2">
                {["All Files", "PDF", "Documents", "Spreadsheets", "Images"].map(filter => (
                  <button 
                    key={filter} 
                    onClick={() => setFileFilter(filter)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                    style={{ 
                      background: fileFilter === filter ? "var(--color-mm-dark)" : "var(--color-mm-subtle)",
                      color: fileFilter === filter ? "white" : "var(--color-mm-gray)",
                      border: fileFilter === filter ? "1px solid var(--color-mm-dark)" : "1px solid var(--color-mm-border)"
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-mm-gray)" }} />
                <input 
                  type="text" 
                  placeholder="Search files..." 
                  value={fileSearch}
                  onChange={(e) => setFileSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-colors"
                  style={{ background: "white", border: "1px solid var(--color-mm-border)", color: "var(--color-mm-dark)", width: "240px" }}
                  onFocus={(e) => e.target.style.borderColor = "var(--color-mm-orange)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--color-mm-border)"}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ background: "white" }}>
              {filteredModalFiles.map(f => (
                <div key={f.id} className="p-4 rounded-xl transition-all cursor-pointer hover:scale-[1.02]" style={{ background: "white", border: "1px solid var(--color-mm-border)", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: f.tagBg }}>
                      <f.icon size={20} style={{ color: f.color }} />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: f.tagBg, color: f.tagColor }}>{f.type}</span>
                  </div>
                  <div className="font-semibold text-[14px] mb-1 truncate" style={{ color: "var(--color-mm-dark)" }} title={f.name}>{f.name}</div>
                  <div className="flex justify-between items-center text-[11px]" style={{ color: "var(--color-mm-gray)" }}>
                    <span>{f.size}</span>
                    <span>{f.by}</span>
                  </div>
                  <div className="mt-4 pt-3 flex justify-between items-center" style={{ borderTop: "1px dashed var(--color-mm-border)" }}>
                    <div className="text-[10px]" style={{ color: "var(--color-mm-gray)" }}>{f.date}</div>
                    <div className="flex gap-2">
                      <button onClick={() => setPreviewFile(f)} className="p-1.5 rounded-lg hover:bg-mm-subtle transition-colors" title="Preview"><Eye size={14} style={{ color: "var(--color-mm-gray)" }} /></button>
                      <button onClick={() => handleDownload(f.name)} className="p-1.5 rounded-lg hover:bg-mm-subtle transition-colors" title="Download"><Download size={14} style={{ color: "var(--color-mm-gray)" }} /></button>
                      <button onClick={() => handleDeleteFile(f.id)} className="p-1.5 rounded-lg hover:bg-mm-red/10 transition-colors" title="Delete"><Trash2 size={14} style={{ color: "var(--color-mm-red)" }} /></button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredModalFiles.length === 0 && (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                  <FileSearch size={48} style={{ color: "var(--color-mm-border)", marginBottom: "16px" }} />
                  <div className="font-bold text-[16px]" style={{ color: "var(--color-mm-gray)" }}>No files found</div>
                  <div className="text-[13px] mt-1" style={{ color: "var(--color-mm-gray)" }}>Try adjusting your search or filters.</div>
                </div>
              )}
            </div>

            <div className="p-5 border-t flex justify-between items-center" style={{ borderColor: "var(--color-mm-border)", background: "white", borderBottomLeftRadius: "24px", borderBottomRightRadius: "24px" }}>
              <div className="text-sm font-semibold" style={{ color: "var(--color-mm-gray)" }}>{filteredModalFiles.length} files found</div>
              <button onClick={() => { setIsFileModalOpen(false); setIsFileUploadOpen(true); }} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 hover:opacity-90" style={{ background: "var(--color-mm-orange)", color: "white" }}>
                <UploadCloud size={16} /> Upload New File
              </button>
            </div>
          </div>
        </div>
      )}

      {previewFile && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} onClick={() => setPreviewFile(null)}>
          <div className="relative w-full max-w-4xl h-[85vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 flex justify-between items-center bg-neutral-800 border-b border-neutral-700/50">
              <div className="flex items-center gap-3 text-white">
                <previewFile.icon size={20} style={{ color: previewFile.color }} />
                <span className="font-semibold text-[14px]">{previewFile.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-700 text-neutral-400">{previewFile.size}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleDownload(previewFile.name)} className="p-2 rounded-lg hover:bg-neutral-800 text-white transition-colors" title="Download"><Download size={16} /></button>
                <button onClick={() => setPreviewFile(null)} className="p-2 rounded-lg hover:bg-neutral-800 text-white transition-colors" title="Close Preview"><X size={16} /></button>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <previewFile.icon size={64} style={{ color: previewFile.color, margin: "0 auto 16px", opacity: 0.5 }} />
                <div className="text-neutral-400 text-sm">Preview not available for this file type.</div>
                <button onClick={() => handleDownload(previewFile.name)} className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold bg-neutral-800 hover:bg-neutral-700 text-white transition-colors">Download File</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-lg transition-all animate-in slide-in-from-bottom-5" style={{ background: "rgba(92, 177, 62, 0.1)", border: "1px solid var(--color-mm-green)", color: "var(--color-mm-green)", fontWeight: 600 }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function InfoCard({ title, rows }: { title: string; rows: [string, React.ReactNode][] }) {
  return (
    <Card>
      <h3 className="font-semibold mb-3" style={{ color: "var(--color-mm-dark)" }}>{title}</h3>
      <div>
        {rows.map(([label, value], i) => (
          <div key={label} className="flex justify-between items-center py-2.5 gap-4"
            style={{ borderTop: i === 0 ? "none" : "1px solid var(--color-mm-border)" }}>
            <span className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: "var(--color-mm-gray)" }}>{label}</span>
            <span className="text-sm font-semibold text-right" style={{ color: "var(--color-mm-dark)" }}>{value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ============ Edit Modal ============ */
function EditProjectModal({ project, onClose, onSave }: { project: Project; onClose: () => void; onSave: (p: Project) => void }) {
  const [form, setForm] = useState<Project>(project);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const allServices = ["Website", "Marketing", "SEO", "Sales"];

  const toggleService = (s: string) => {
    setForm((f) => ({
      ...f,
      services: f.services.includes(s) ? f.services.filter((x) => x !== s) : [...f.services, s],
    }));
  };

  const submit = () => {
    const errs: Record<string, boolean> = {};
    if (!form.client.trim()) errs.client = true;
    if (!form.manager.trim()) errs.manager = true;
    if (!form.startDate) errs.startDate = true;
    if (!form.deadline) errs.deadline = true;
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div
        className="bg-white border border-mm-border rounded-[24px] w-full max-w-2xl max-h-[90vh] overflow-y-auto !p-8"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: "var(--color-mm-dark)" }}>Edit Project</h2>
          <button onClick={onClose} className="hover:opacity-70"><X size={20} style={{ color: "var(--color-mm-gray)" }} /></button>
        </div>

        <div className="space-y-4">
          <Field label="Project ID">
            <input className="input-field" readOnly value={form.id}
              style={{ background: "var(--color-mm-subtle)", color: "var(--color-mm-gray)", cursor: "not-allowed" }} />
          </Field>
          <Field label="Client / Business Name" error={errors.client}>
            <input className="input-field" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })}
              style={errors.client ? { borderColor: "var(--color-danger)" } : undefined} />
            {errors.client && <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>Required</p>}
          </Field>
          <Field label="Services">
            <div className="flex flex-wrap gap-2">
              {allServices.map((s) => {
                const on = form.services.includes(s);
                return (
                  <button key={s} type="button" onClick={() => toggleService(s)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                    style={on
                      ? { background: "var(--color-mm-orange)", color: "white" }
                      : { background: "var(--color-mm-subtle)", border: "1px solid var(--color-mm-border)", color: "var(--color-mm-gray)" }}>
                    {s}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Project Manager" error={errors.manager}>
            <input 
              className="input-field" 
              value={form.manager} 
              onChange={(e) => setForm({ ...form, manager: e.target.value })}
              style={errors.manager ? { borderColor: "var(--color-danger)" } : undefined}
            />
            {errors.manager && <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>Required</p>}
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" error={errors.startDate}>
              <input className="input-field" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </Field>
            <Field label="Deadline" error={errors.deadline}>
              <input className="input-field" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Status">
              <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Status })}>
                {(["Pending", "In Progress", "Completed", "On Hold"] as Status[]).map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select className="input-field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
                {(["Low", "Medium", "High"] as Priority[]).map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Description">
            <textarea className="input-field min-h-[100px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Notes">
            <textarea className="input-field min-h-[80px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-mm-border hover:bg-mm-subtle text-mm-gray font-medium rounded-xl transition-colors">Cancel</button>
          <button onClick={submit} className="px-4 py-2 bg-mm-orange hover:bg-mm-orange/95 text-white font-semibold rounded-xl transition-colors">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
        style={{ color: error ? "var(--color-danger)" : "var(--color-mm-gray)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
