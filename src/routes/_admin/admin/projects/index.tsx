import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Plus, Eye, Edit2, Trash2 } from "lucide-react";
import { statusColors } from "@/lib/mock-data";
import type { Project } from "@/lib/mock-data";
import { Avatar, ProgressBar, StatusBadge, Card } from "@/components/admin/shared";
import { CheckCircle2, ArrowRight, X, ChevronDown, SearchX } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { getProjectsFn, saveProjectFn, getUsersFn, deleteProjectFn, logAuditEventFn } from "@/lib/server-functions";

export const Route = createFileRoute("/_admin/admin/projects/")({
  head: () => ({ meta: [{ title: "Projects — GrowConsult AI" }] }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProjects = async () => {
    const [pData, uData] = await Promise.all([
      getProjectsFn(),
      getUsersFn()
    ]);
    setProjectList(pData);
    setUsers(uData);
  };

  useEffect(() => {
    refreshProjects().then(() => setIsLoading(false));
  }, []);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    name: "", client: "", services: [] as string[], manager: "John Smith",
    startDate: "", deadline: "", status: "Pending" as any, priority: "Medium" as any,
    description: "", budget: ""
  });
  const [newProjectErrors, setNewProjectErrors] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);

  const handleDelete = async (p: Project) => {
    await deleteProjectFn({ data: p.id });
    await logAuditEventFn({ data: { uid: "admin", action: "project_deleted", payload: { projectId: p.id, client: p.client, manager: p.manager }, userName: "Admin" } });
    setProjectList(prev => prev.filter(x => x.id !== p.id));
    setConfirmDelete(null);
    setToast(`✓ Project "${p.id}" deleted successfully.`);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Projects");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [serviceFilter, setServiceFilter] = useState("All Services");
  
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isServiceOpen, setIsServiceOpen] = useState(false);

  const typeRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const serviceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) setIsTypeOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setIsStatusOpen(false);
      if (serviceRef.current && !serviceRef.current.contains(e.target as Node)) setIsServiceOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const toggleService = (s: string) => {
    setNewProjectForm(prev => ({
      ...prev,
      services: prev.services.includes(s) ? prev.services.filter(x => x !== s) : [...prev.services, s]
    }));
  };

  const handleCreateSubmit = () => {
    const errs: Record<string, boolean> = {};
    if (!newProjectForm.name.trim()) errs.name = true;
    if (!newProjectForm.client) errs.client = true;
    if (newProjectForm.services.length === 0) errs.services = true;
    if (!newProjectForm.startDate) errs.startDate = true;
    if (!newProjectForm.deadline) errs.deadline = true;

    if (Object.keys(errs).length > 0) {
      setNewProjectErrors(errs);
      return;
    }

    const newPrj = {
      id: `PRJ-${1000 + projectList.length + 1}`,
      client: newProjectForm.client.split(" — ")[0],
      services: newProjectForm.services,
      manager: newProjectForm.manager,
      status: newProjectForm.status,
      progress: 0,
      deadline: newProjectForm.deadline,
      priority: newProjectForm.priority,
      startDate: newProjectForm.startDate,
      email: "", phone: "", industry: "", website: "", joinedOn: "", plan: "",
      serviceGroups: [], description: newProjectForm.description, notes: ""
    };

    saveProjectFn({ data: newPrj }).then(() => {
      setProjectList([newPrj, ...projectList]);
      setIsNewProjectOpen(false);
      setNewProjectForm({
        name: "", client: "", services: [], manager: "John Smith",
        startDate: "", deadline: "", status: "Pending", priority: "Medium",
        description: "", budget: ""
      });
      setToast("✓ Project created successfully!");
    });
  };

  const filteredProjects = useMemo(() => {
    return projectList.filter(p => {
      let matchType = true;
      if (typeFilter === "My Projects") matchType = p.manager === "John Smith";
      else if (typeFilter === "AI Projects") matchType = true;
      else if (typeFilter === "Website Projects") matchType = p.services.includes("Website");
      else if (typeFilter === "Marketing Projects") matchType = p.services.includes("Marketing");
      else if (typeFilter === "SEO Projects") matchType = p.services.includes("SEO");

      let matchStatus = true;
      if (statusFilter !== "All Status") matchStatus = p.status === statusFilter;

      let matchService = true;
      if (serviceFilter !== "All Services") {
        if (serviceFilter === "Website + Marketing") {
          matchService = p.services.includes("Website") && p.services.includes("Marketing");
        } else {
          matchService = p.services.includes(serviceFilter);
        }
      }

      let matchSearch = true;
      const term = searchQuery.toLowerCase();
      if (term) {
        matchSearch = p.id.toLowerCase().includes(term) || p.client.toLowerCase().includes(term) || p.manager.toLowerCase().includes(term);
      }

      return matchType && matchStatus && matchService && matchSearch;
    });
  }, [projectList, typeFilter, statusFilter, serviceFilter, searchQuery]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setTypeFilter("All Projects");
    setStatusFilter("All Status");
    setServiceFilter("All Services");
  };

  const hasActiveFilters = searchQuery || typeFilter !== "All Projects" || statusFilter !== "All Status" || serviceFilter !== "All Services";

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold" style={{ color: "var(--color-heading)" }}>
        Project Manager – Project List
      </h1>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1 w-full max-w-[280px]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-subtle)" }} />
              <input 
                className="w-full rounded-xl pl-9 pr-8 py-2.5 text-sm outline-none transition-all" 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: "#FFFDF8", border: "1px solid #E8DCC8", color: "#4E342E" }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#E89D18";
                  e.target.style.boxShadow = "0 0 0 3px rgba(232,157,24,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E8DCC8";
                  e.target.style.boxShadow = "none";
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={14} style={{ color: "#A1887F" }} onMouseEnter={(e) => e.currentTarget.style.color = "#EF5350"} onMouseLeave={(e) => e.currentTarget.style.color = "#A1887F"} />
                </button>
              )}
            </div>
            {hasActiveFilters && (
              <div style={{ color: "#A1887F", fontSize: "12px", paddingLeft: "4px" }}>
                Showing {filteredProjects.length} of {projectList.length} projects
              </div>
            )}
          </div>

          <div className="relative" ref={typeRef}>
            <button 
              onClick={() => setIsTypeOpen(!isTypeOpen)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors"
              style={{ background: "#FFFDF8", border: typeFilter === "All Projects" ? "1px solid #E8DCC8" : "1px solid #E89D18", color: typeFilter === "All Projects" ? "#6D4C41" : "#E89D18" }}
            >
              {typeFilter}
              <ChevronDown size={14} style={{ transform: isTypeOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms ease" }} />
            </button>
            {isTypeOpen && (
              <div style={{ background: "#FCF8F1", border: "1px solid #E8DCC8", borderRadius: "16px", padding: "8px", boxShadow: "0 8px 24px rgba(78,52,46,0.10)", minWidth: "220px", position: "absolute", zIndex: 100, marginTop: "4px" }}>
                {[
                  { label: "All Projects", count: projectList.length },
                  { label: "My Projects", count: projectList.filter(p => p.manager === "John Smith").length },
                  { label: "AI Projects", count: projectList.length },
                  { label: "Website Projects", count: projectList.filter(p => p.services.includes("Website")).length },
                  { label: "Marketing Projects", count: projectList.filter(p => p.services.includes("Marketing")).length },
                  { label: "SEO Projects", count: projectList.filter(p => p.services.includes("SEO")).length }
                ].map(opt => (
                  <div 
                    key={opt.label} onClick={() => { setTypeFilter(opt.label); setIsTypeOpen(false); }}
                    style={{ padding: "10px 14px", borderRadius: "10px", color: typeFilter === opt.label ? "#E89D18" : "#6D4C41", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", background: typeFilter === opt.label ? "#FFF3D6" : "transparent", fontWeight: typeFilter === opt.label ? 600 : 400 }}
                    onMouseEnter={(e) => { if (typeFilter !== opt.label) { e.currentTarget.style.background = "#FFF3D6"; e.currentTarget.style.color = "#4E342E"; } }}
                    onMouseLeave={(e) => { if (typeFilter !== opt.label) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6D4C41"; } }}
                  >
                    <div className="flex items-center gap-2">
                      {opt.label}
                    </div>
                    <span style={{ color: "#A1887F", fontSize: "12px" }}>{opt.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={statusRef}>
            <button 
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors"
              style={{ background: "#FFFDF8", border: statusFilter === "All Status" ? "1px solid #E8DCC8" : "1px solid #E89D18", color: statusFilter === "All Status" ? "#6D4C41" : "#E89D18" }}
            >
              {statusFilter}
              <ChevronDown size={14} style={{ transform: isStatusOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms ease" }} />
            </button>
            {isStatusOpen && (
              <div style={{ background: "#FCF8F1", border: "1px solid #E8DCC8", borderRadius: "16px", padding: "8px", boxShadow: "0 8px 24px rgba(78,52,46,0.10)", minWidth: "200px", position: "absolute", zIndex: 100, marginTop: "4px" }}>
                {[
                  { label: "All Status", bg: "transparent", color: "transparent" },
                  { label: "In Progress", bg: "#EFF6FF", color: "#3B82F6" },
                  { label: "Pending", bg: "#FFFBEB", color: "#F4B942" },
                  { label: "On Hold", bg: "#FEF2F2", color: "#EF5350" },
                  { label: "Completed", bg: "#E8F5E9", color: "#4CAF50" },
                  { label: "Cancelled", bg: "#F8F1E7", color: "#A1887F" }
                ].map(opt => {
                  const count = opt.label === "All Status" ? projectList.length : projectList.filter(p => p.status === opt.label).length;
                  return (
                    <div 
                      key={opt.label} onClick={() => { setStatusFilter(opt.label); setIsStatusOpen(false); }}
                      style={{ padding: "10px 14px", borderRadius: "10px", color: statusFilter === opt.label ? "#E89D18" : "#6D4C41", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", background: statusFilter === opt.label ? "#FFF3D6" : "transparent", fontWeight: statusFilter === opt.label ? 600 : 400 }}
                      onMouseEnter={(e) => { if (statusFilter !== opt.label) { e.currentTarget.style.background = "#FFF3D6"; e.currentTarget.style.color = "#4E342E"; } }}
                      onMouseLeave={(e) => { if (statusFilter !== opt.label) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6D4C41"; } }}
                    >
                      <div className="flex items-center gap-2">
                        {opt.label}
                        {opt.bg !== "transparent" && <span style={{ background: opt.bg, color: opt.color, borderRadius: "999px", padding: "2px 8px", fontSize: "11px", fontWeight: 600 }}>{opt.label}</span>}
                      </div>
                      <span style={{ color: "#A1887F", fontSize: "12px" }}>({count})</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="relative" ref={serviceRef}>
            <button 
              onClick={() => setIsServiceOpen(!isServiceOpen)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors"
              style={{ background: "#FFFDF8", border: serviceFilter === "All Services" ? "1px solid #E8DCC8" : "1px solid #E89D18", color: serviceFilter === "All Services" ? "#6D4C41" : "#E89D18" }}
            >
              {serviceFilter}
              <ChevronDown size={14} style={{ transform: isServiceOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms ease" }} />
            </button>
            {isServiceOpen && (
              <div style={{ background: "#FCF8F1", border: "1px solid #E8DCC8", borderRadius: "16px", padding: "8px", boxShadow: "0 8px 24px rgba(78,52,46,0.10)", minWidth: "200px", position: "absolute", zIndex: 100, marginTop: "4px" }}>
                {[
                  { label: "All Services", chips: [] },
                  { label: "Website", chips: [{ bg: "#EFF6FF", color: "#3B82F6", text: "Website" }] },
                  { label: "Marketing", chips: [{ bg: "#E8F5E9", color: "#4CAF50", text: "Marketing" }] },
                  { label: "SEO", chips: [{ bg: "#FFF3D6", color: "#E89D18", text: "SEO" }] },
                  { label: "Sales", chips: [{ bg: "#FEF2F2", color: "#EF5350", text: "Sales" }] },
                  { label: "Website + Marketing", chips: [{ bg: "#EFF6FF", color: "#3B82F6", text: "Website" }, { bg: "#E8F5E9", color: "#4CAF50", text: "Marketing" }] }
                ].map(opt => (
                  <div 
                    key={opt.label} onClick={() => { setServiceFilter(opt.label); setIsServiceOpen(false); }}
                    style={{ padding: "10px 14px", borderRadius: "10px", color: serviceFilter === opt.label ? "#E89D18" : "#6D4C41", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", background: serviceFilter === opt.label ? "#FFF3D6" : "transparent", fontWeight: serviceFilter === opt.label ? 600 : 400 }}
                    onMouseEnter={(e) => { if (serviceFilter !== opt.label) { e.currentTarget.style.background = "#FFF3D6"; e.currentTarget.style.color = "#4E342E"; } }}
                    onMouseLeave={(e) => { if (serviceFilter !== opt.label) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6D4C41"; } }}
                  >
                    {opt.label}
                    <div className="flex gap-1">
                      {opt.chips.map((c, i) => (
                        <span key={i} style={{ background: c.bg, color: c.color, borderRadius: "999px", padding: "2px 8px", fontSize: "11px", fontWeight: 600 }}>{c.text}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="text-xs hover:underline" style={{ color: "#E89D18" }}>
              Clear all filters
            </button>
          )}
          <button onClick={() => setIsNewProjectOpen(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--color-card-secondary)" }}>
                {["Project ID", "Client/Business", "Services", "Project Manager", "Status", "Progress", "Deadline", "Actions"].map((h) => (
                  <th key={h} className="text-left font-semibold px-4 py-3 whitespace-nowrap" style={{ color: "var(--color-title)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#E89D18] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-semibold" style={{ color: "#8D6E63" }}>Loading projects...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProjects.length > 0 ? (
                filteredProjects.map((p) => (
                  <tr key={p.id} style={{ borderTop: "1px solid var(--color-border)" }} className="hover:[background:var(--color-row-hover)] transition-colors">
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--color-subtle)" }}>{p.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={p.client} size={28} />
                        <span className="font-semibold" style={{ color: "var(--color-heading)" }}>{p.client}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.services.map((s) => (
                          <span key={s} className="px-2.5 py-0.5 rounded-full text-xs"
                            style={{ background: "var(--color-card-secondary)", border: "1px solid var(--color-border)", color: "var(--color-title)" }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--color-body)" }}>{p.manager}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 min-w-[160px]">
                      <ProgressBar value={p.progress} color={statusColors[p.status as keyof typeof statusColors]} />
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--color-subtle)" }}>{p.deadline}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to="/admin/projects/$id" params={{ id: p.id }} search={{ edit: false }} className="hover:opacity-70" title="View">
                          <Eye size={16} style={{ color: "var(--color-title)" }} />
                        </Link>
                        <Link to="/admin/projects/$id" params={{ id: p.id }} search={{ edit: true }} className="hover:opacity-70" title="Edit">
                          <Edit2 size={16} style={{ color: "var(--color-title)" }} />
                        </Link>
                        <button onClick={() => setConfirmDelete(p)} className="hover:opacity-70 text-[#EF5350]" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12">
                    <div className="flex flex-col items-center justify-center">
                      <SearchX size={32} style={{ color: "#A1887F" }} />
                      <div style={{ color: "#6D4C41", fontSize: "14px", marginTop: "12px", fontWeight: 600 }}>No projects found</div>
                      <button onClick={clearAllFilters} style={{ color: "#E89D18", fontSize: "12px", marginTop: "4px" }} className="hover:underline">Clear filters</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isNewProjectOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(4px)" }} onClick={() => setIsNewProjectOpen(false)}>
          <div className="w-full" style={{ background: "#FCF8F1", borderRadius: "24px", border: "1px solid #E8DCC8", maxWidth: "560px", padding: "32px", boxShadow: "0 20px 60px rgba(78,52,46,0.15)", width: "90%", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ color: "#4E342E", fontWeight: 700, fontSize: "20px" }}>Create New Project</h2>
              <button onClick={() => setIsNewProjectOpen(false)} className="hover:opacity-70 transition-opacity"><X size={20} style={{ color: "#8D6E63" }} onMouseEnter={(e) => e.currentTarget.style.color = "#EF5350"} onMouseLeave={(e) => e.currentTarget.style.color = "#8D6E63"} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label style={{ color: "#6D4C41", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Project Name*</label>
                <input placeholder="Enter project name" value={newProjectForm.name} onChange={(e) => setNewProjectForm({...newProjectForm, name: e.target.value})} style={{ background: "#FFFDF8", border: newProjectErrors.name ? "1px solid #EF5350" : "1px solid #E8DCC8", borderRadius: "12px", padding: "10px 14px", color: "#4E342E", width: "100%", outline: "none" }} onFocus={(e) => { if (!newProjectErrors.name) e.target.style.borderColor = "#E89D18" }} onBlur={(e) => { if (!newProjectErrors.name) e.target.style.borderColor = "#E8DCC8" }} />
                {newProjectErrors.name && <div style={{ color: "#EF5350", fontSize: "12px", marginTop: "4px" }}>Project Name is required.</div>}
              </div>

              <div>
                <label style={{ color: "#6D4C41", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Client / User*</label>
                <select value={newProjectForm.client} onChange={(e) => setNewProjectForm({...newProjectForm, client: e.target.value})} style={{ background: "#FFFDF8", border: newProjectErrors.client ? "1px solid #EF5350" : "1px solid #E8DCC8", borderRadius: "12px", padding: "10px 14px", color: "#4E342E", width: "100%", outline: "none" }} onFocus={(e) => { if (!newProjectErrors.client) e.target.style.borderColor = "#E89D18" }} onBlur={(e) => { if (!newProjectErrors.client) e.target.style.borderColor = "#E8DCC8" }}>
                  <option value="" disabled>Select a client</option>
                  {users.map(u => {
                    const label = u.business ? `${u.name} — ${u.business}` : u.name;
                    return (
                      <option key={u.id} value={label}>{label}</option>
                    );
                  })}
                </select>
                {newProjectErrors.client && <div style={{ color: "#EF5350", fontSize: "12px", marginTop: "4px" }}>Client is required.</div>}
              </div>

              <div>
                <label style={{ color: "#6D4C41", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Services*</label>
                <div className="flex flex-wrap gap-2">
                  {["Website", "Marketing", "SEO", "Sales"].map(s => {
                    const isSelected = newProjectForm.services.includes(s);
                    return (
                      <button key={s} onClick={() => toggleService(s)} style={{ background: isSelected ? "#E89D18" : "#F8F1E7", border: isSelected ? "1px solid #E89D18" : "1px solid #E8DCC8", color: isSelected ? "white" : "#6D4C41", borderRadius: "999px", padding: "6px 12px", fontSize: "13px" }} className="transition-colors hover:opacity-90">
                        {s}
                      </button>
                    )
                  })}
                </div>
                {newProjectErrors.services && <div style={{ color: "#EF5350", fontSize: "12px", marginTop: "4px" }}>Select at least one service.</div>}
              </div>

              <div>
                <label style={{ color: "#6D4C41", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Project Manager</label>
                <input 
                  placeholder="Enter manager's name manually" 
                  value={newProjectForm.manager} 
                  onChange={(e) => setNewProjectForm({...newProjectForm, manager: e.target.value})} 
                  style={{ background: "#FFFDF8", border: "1px solid #E8DCC8", borderRadius: "12px", padding: "10px 14px", color: "#4E342E", width: "100%", outline: "none" }}
                  onFocus={(e) => e.target.style.borderColor = "#E89D18"}
                  onBlur={(e) => e.target.style.borderColor = "#E8DCC8"}
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label style={{ color: "#6D4C41", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Start Date*</label>
                  <input type="date" value={newProjectForm.startDate} onChange={(e) => setNewProjectForm({...newProjectForm, startDate: e.target.value})} style={{ background: "#FFFDF8", border: newProjectErrors.startDate ? "1px solid #EF5350" : "1px solid #E8DCC8", borderRadius: "12px", padding: "10px 14px", color: "#4E342E", width: "100%", outline: "none" }} />
                  {newProjectErrors.startDate && <div style={{ color: "#EF5350", fontSize: "12px", marginTop: "4px" }}>Required.</div>}
                </div>
                <div className="flex-1">
                  <label style={{ color: "#6D4C41", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Deadline*</label>
                  <input type="date" value={newProjectForm.deadline} onChange={(e) => setNewProjectForm({...newProjectForm, deadline: e.target.value})} style={{ background: "#FFFDF8", border: newProjectErrors.deadline ? "1px solid #EF5350" : "1px solid #E8DCC8", borderRadius: "12px", padding: "10px 14px", color: "#4E342E", width: "100%", outline: "none" }} />
                  {newProjectErrors.deadline && <div style={{ color: "#EF5350", fontSize: "12px", marginTop: "4px" }}>Required.</div>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ color: "#6D4C41", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Status</label>
                  <select value={newProjectForm.status} onChange={(e) => setNewProjectForm({...newProjectForm, status: e.target.value})} style={{ background: "#FFFDF8", border: "1px solid #E8DCC8", borderRadius: "12px", padding: "10px 14px", color: "#4E342E", width: "100%", outline: "none" }}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: "#6D4C41", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Priority</label>
                  <select value={newProjectForm.priority} onChange={(e) => setNewProjectForm({...newProjectForm, priority: e.target.value})} style={{ background: "#FFFDF8", border: "1px solid #E8DCC8", borderRadius: "12px", padding: "10px 14px", color: "#4E342E", width: "100%", outline: "none" }}>
                    <option value="Low">● Low</option>
                    <option value="Medium">● Medium</option>
                    <option value="High">● High</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ color: "#6D4C41", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Description</label>
                <textarea rows={3} placeholder="Describe the project scope..." value={newProjectForm.description} onChange={(e) => setNewProjectForm({...newProjectForm, description: e.target.value})} style={{ background: "#FFFDF8", border: "1px solid #E8DCC8", borderRadius: "12px", padding: "10px 14px", color: "#4E342E", width: "100%", outline: "none", resize: "vertical" }} onFocus={(e) => e.target.style.borderColor = "#E89D18"} onBlur={(e) => e.target.style.borderColor = "#E8DCC8"} />
              </div>

              <div>
                <label style={{ color: "#6D4C41", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Initial Budget</label>
                <div className="relative">
                  <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#A1887F", fontSize: "14px" }}>$</span>
                  <input type="number" placeholder="0.00" value={newProjectForm.budget} onChange={(e) => setNewProjectForm({...newProjectForm, budget: e.target.value})} style={{ background: "#FFFDF8", border: "1px solid #E8DCC8", borderRadius: "12px", padding: "10px 14px 10px 28px", color: "#4E342E", width: "100%", outline: "none" }} onFocus={(e) => e.target.style.borderColor = "#E89D18"} onBlur={(e) => e.target.style.borderColor = "#E8DCC8"} />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 flex justify-end gap-3" style={{ borderTop: "1px solid #E8DCC8" }}>
              <button onClick={() => setIsNewProjectOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity" style={{ background: "#FCF8F1", border: "1px solid #E8DCC8", color: "#6D4C41" }}>Cancel</button>
              <button onClick={handleCreateSubmit} className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity" style={{ background: "#E89D18", color: "white" }}>Create Project</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-2xl" style={{ background: "#FCF8F1", border: "1px solid #E8DCC8" }}>
            <h3 className="font-bold text-lg" style={{ color: "#4E342E" }}>Delete Project?</h3>
            <p className="text-sm" style={{ color: "#8D6E63" }}>
              Are you sure you want to delete project <strong>"{confirmDelete.id}"</strong> for client <strong>{confirmDelete.client}</strong>? This action is permanent.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-[#E8DCC8] hover:bg-[#F8F1E7]" 
                style={{ background: "white", color: "#8D6E63" }}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(confirmDelete)} 
                className="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-95 text-white" 
                style={{ background: "#EF5350" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-lg transition-all animate-in slide-in-from-bottom-5" style={{ background: "#E8F5E9", border: "1px solid #4CAF50", color: "#4CAF50", fontWeight: 600 }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// FlowSection removed
