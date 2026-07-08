import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Plus, Eye, Edit2, Trash2 } from "lucide-react";
import { statusColors } from "@/lib/mock-data";
import type { Project } from "@/lib/schemas";
import { Avatar, ProgressBar, StatusBadge, Card } from "@/components/admin/shared";
import { CheckCircle2, ArrowRight, X, ChevronDown, SearchX } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { getProjectsFn, saveProjectFn, getUsersFn, deleteProjectFn, logAuditEventFn, getBusinessesFn } from "@/lib/server-functions";
import { AdminLoader } from "@/components/AdminLoader";

export const Route = createFileRoute("/_admin/admin/projects/")({
  head: () => ({ meta: [{ title: "Projects — GrowConsult AI" }] }),
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
  component: ProjectsPage,
});

function ProjectsPage() {
  const { projects: initialProjects, users: initialUsers, businesses: initialBusinesses } = Route.useLoaderData();
  const [projectList, setProjectList] = useState<Project[]>(initialProjects);
  const [users, setUsers] = useState<any[]>(initialUsers);
  const [businesses, setBusinesses] = useState<any[]>(initialBusinesses);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setProjectList(initialProjects);
    setUsers(initialUsers);
    setBusinesses(initialBusinesses);
  }, [initialProjects, initialUsers, initialBusinesses]);

  const refreshProjects = async () => {
    const [pData, uData, bData] = await Promise.all([
      getProjectsFn(),
      getUsersFn(),
      getBusinessesFn()
    ]);
    setProjectList(pData);
    setUsers(uData);
    setBusinesses(bData);
  };

  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    name: "", client: "", businessId: "", services: [] as string[], domain: "" as any, manager: "",
    startDate: "", deadline: "", status: "" as any, priority: "" as any,
    description: "", notes: ""
  });
  const [newProjectErrors, setNewProjectErrors] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);

  const handleDelete = async (p: Project) => {
    const biz = typeof p.businessId === "object" && p.businessId !== null
      ? p.businessId
      : businesses.find(b => b.id === p.businessId);
    const client = biz?.businessName || "No business";
    const manager = p.assignee;
    await deleteProjectFn({ data: p.id });
    await logAuditEventFn({ data: { uid: "admin", action: "project_deleted", payload: { projectId: p.id, client, manager }, userName: "Admin" } });
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

  const filteredBusinessesForSelect = useMemo(() => {
    if (!newProjectForm.client) {
      return businesses;
    }
    return businesses.filter(b => (typeof b.userId === "string" ? b.userId : b.userId?.id) === newProjectForm.client);
  }, [businesses, newProjectForm.client]);

  const handleClientChange = (clientId: string) => {
    const clientBizs = businesses.filter(b => (typeof b.userId === "string" ? b.userId : b.userId?.id) === clientId);
    let nextBizId = "";
    if (clientBizs.length === 1) {
      nextBizId = clientBizs[0].id;
    } else if (clientBizs.some(b => b.id === newProjectForm.businessId)) {
      nextBizId = newProjectForm.businessId;
    }
    setNewProjectForm(prev => ({
      ...prev,
      client: clientId,
      businessId: nextBizId
    }));
    setNewProjectErrors(prev => ({ ...prev, client: false, businessId: false }));
  };

  const handleBusinessChange = (businessId: string) => {
    const selectedBiz = businesses.find(b => b.id === businessId);
    const linkedUserId = selectedBiz ? (typeof selectedBiz.userId === "string" ? selectedBiz.userId : selectedBiz.userId?.id) : "";
    setNewProjectForm(prev => ({
      ...prev,
      businessId,
      client: linkedUserId || prev.client
    }));
    setNewProjectErrors(prev => ({ ...prev, client: false, businessId: false }));
  };

  const handleCreateSubmit = () => {
    const errs: Record<string, boolean> = {};
    if (!newProjectForm.name.trim()) errs.name = true;
    if (!newProjectForm.client) errs.client = true;
    if (!newProjectForm.businessId) errs.businessId = true;
    if (!newProjectForm.domain) errs.domain = true;
    if (newProjectForm.services.length === 0) errs.services = true;
    if (!newProjectForm.manager.trim()) errs.manager = true;
    if (!newProjectForm.startDate) errs.startDate = true;
    if (!newProjectForm.deadline) errs.deadline = true;
    if (!newProjectForm.status) errs.status = true;
    if (!newProjectForm.priority) errs.priority = true;

    if (Object.keys(errs).length > 0) {
      setNewProjectErrors(errs);
      return;
    }

    const newPrjSchema = {
      id: `PRJ-${1000 + projectList.length + 1}`,
      businessId: newProjectForm.businessId,
      name: newProjectForm.name,
      description: newProjectForm.description,
      domain: newProjectForm.domain,
      services: newProjectForm.services,
      progress: 0,
      assignee: newProjectForm.manager,
      status: newProjectForm.status,
      priority: newProjectForm.priority,
      notes: newProjectForm.notes,
      updates: [],
      startDate: new Date(newProjectForm.startDate),
      deadline: newProjectForm.deadline ? new Date(newProjectForm.deadline) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    saveProjectFn({ data: newPrjSchema as any }).then(() => {
      refreshProjects().then(() => {
        setIsNewProjectOpen(false);
        setNewProjectForm({
          name: "", client: "", businessId: "", services: [], domain: "" as any, manager: "",
          startDate: "", deadline: "", status: "" as any, priority: "" as any,
          description: "", notes: ""
        });
        setToast("✓ Project created successfully!");
      });
    });
  };

  const filteredProjects = useMemo(() => {
    return projectList.filter(p => {
      const biz = typeof p.businessId === "object" && p.businessId !== null
        ? p.businessId
        : businesses.find(b => b.id === p.businessId);
      const manager = p.assignee;
      
      let status: "Pending" | "In Progress" | "Completed" = "In Progress";
      if (p.progress === 0) status = "Pending";
      else if (p.progress === 100) status = "Completed";

      let matchType = true;
      if (typeFilter === "My Projects") matchType = manager === p.assignee;
      else if (typeFilter === "AI Projects") matchType = true;
      else if (typeFilter === "Website Projects") matchType = p.services.includes("Website");
      else if (typeFilter === "Marketing Projects") matchType = p.services.includes("Marketing");
      else if (typeFilter === "SEO Projects") matchType = p.services.includes("SEO");

      let matchStatus = true;
      if (statusFilter !== "All Status") matchStatus = status === statusFilter;

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
        const userIdStr = biz
          ? (typeof biz.userId === "object" && biz.userId !== null
            ? biz.userId.id
            : biz.userId)
          : null;
        const matchedUser = users.find(u => u.id === userIdStr);
        const clientName = matchedUser?.fullName || "Unknown Client";
        const clientEmail = matchedUser?.email || "No email";
        const businessName = biz?.businessName || "No business";
        const businessType = biz?.businessType || "Consulting";

        matchSearch =
          p.id.toLowerCase().includes(term) ||
          clientName.toLowerCase().includes(term) ||
          clientEmail.toLowerCase().includes(term) ||
          businessName.toLowerCase().includes(term) ||
          businessType.toLowerCase().includes(term) ||
          manager.toLowerCase().includes(term);
      }

      return matchType && matchStatus && matchService && matchSearch;
    });
  }, [projectList, typeFilter, statusFilter, serviceFilter, searchQuery, businesses, users]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setTypeFilter("All Projects");
    setStatusFilter("All Status");
    setServiceFilter("All Services");
  };

  const hasActiveFilters = searchQuery || typeFilter !== "All Projects" || statusFilter !== "All Status" || serviceFilter !== "All Services";

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold" style={{ color: "var(--color-mm-dark)" }}>
        Projects
      </h1>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-[280px]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-mm-gray)" }} />
              <input 
                className="w-full rounded-xl pl-9 pr-8 py-2.5 text-sm outline-none transition-all" 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: "white", border: "1px solid var(--color-mm-border)", color: "var(--color-mm-dark)" }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--color-mm-orange)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(232,157,24,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--color-mm-border)";
                  e.target.style.boxShadow = "none";
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={14} style={{ color: "var(--color-mm-gray)" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-mm-red)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-mm-gray)"} />
                </button>
              )}
            </div>
            {hasActiveFilters && (
              <div style={{ color: "var(--color-mm-gray)", fontSize: "12px", paddingLeft: "4px", marginTop: "4px" }}>
                Showing {filteredProjects.length} of {projectList.length} projects
              </div>
            )}
          </div>

          <div className="relative w-full sm:w-auto" ref={typeRef}>
            <button 
              onClick={() => setIsTypeOpen(!isTypeOpen)}
              className="inline-flex items-center justify-between sm:justify-start gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors w-full sm:w-auto"
              style={{ background: "white", border: typeFilter === "All Projects" ? "1px solid var(--color-mm-border)" : "1px solid var(--color-mm-orange)", color: typeFilter === "All Projects" ? "var(--color-mm-gray)" : "var(--color-mm-orange)" }}
            >
              <span className="truncate">{typeFilter}</span>
              <ChevronDown size={14} className="shrink-0" style={{ transform: isTypeOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms ease" }} />
            </button>
            {isTypeOpen && (
              <div style={{ background: "white", border: "1px solid var(--color-mm-border)", borderRadius: "16px", padding: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.10)", minWidth: "220px", position: "absolute", zIndex: 100, marginTop: "4px" }} className="w-full sm:w-auto left-0">
                {[
                  { label: "All Projects", count: projectList.length },
                  { label: "My Projects", count: projectList.filter(() => true).length },
                  { label: "AI Projects", count: projectList.length },
                  { label: "Website Projects", count: projectList.filter(p => p.services.includes("Website")).length },
                  { label: "Marketing Projects", count: projectList.filter(p => p.services.includes("Marketing")).length },
                  { label: "SEO Projects", count: projectList.filter(p => p.services.includes("SEO")).length }
                ].map(opt => (
                  <div 
                    key={opt.label} onClick={() => { setTypeFilter(opt.label); setIsTypeOpen(false); }}
                    style={{ padding: "10px 14px", borderRadius: "10px", color: typeFilter === opt.label ? "var(--color-mm-orange)" : "var(--color-mm-gray)", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", background: typeFilter === opt.label ? "rgba(224, 86, 36, 0.1)" : "transparent", fontWeight: typeFilter === opt.label ? 600 : 400 }}
                    onMouseEnter={(e) => { if (typeFilter !== opt.label) { e.currentTarget.style.background = "rgba(224, 86, 36, 0.1)"; e.currentTarget.style.color = "var(--color-mm-dark)"; } }}
                    onMouseLeave={(e) => { if (typeFilter !== opt.label) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-mm-gray)"; } }}
                  >
                    <div className="flex items-center gap-2">
                      {opt.label}
                    </div>
                    <span style={{ color: "var(--color-mm-gray)", fontSize: "12px" }}>{opt.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative w-full sm:w-auto" ref={statusRef}>
            <button 
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="inline-flex items-center justify-between sm:justify-start gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors w-full sm:w-auto"
              style={{ background: "white", border: statusFilter === "All Status" ? "1px solid var(--color-mm-border)" : "1px solid var(--color-mm-orange)", color: statusFilter === "All Status" ? "var(--color-mm-gray)" : "var(--color-mm-orange)" }}
            >
              <span className="truncate">{statusFilter}</span>
              <ChevronDown size={14} className="shrink-0" style={{ transform: isStatusOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms ease" }} />
            </button>
            {isStatusOpen && (
              <div style={{ background: "white", border: "1px solid var(--color-mm-border)", borderRadius: "16px", padding: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.10)", minWidth: "200px", position: "absolute", zIndex: 100, marginTop: "4px" }} className="w-full sm:w-auto left-0">
                {[
                  { label: "All Status", bg: "transparent", color: "transparent" },
                  { label: "In Progress", bg: "rgba(59, 130, 246, 0.1)", color: "var(--color-mm-blue)" },
                  { label: "Pending", bg: "rgba(224, 86, 36, 0.1)", color: "var(--color-mm-orange)" },
                  { label: "On Hold", bg: "rgba(224, 86, 36, 0.1)", color: "var(--color-mm-red)" },
                  { label: "Completed", bg: "rgba(92, 177, 62, 0.1)", color: "var(--color-mm-green)" },
                  { label: "Cancelled", bg: "var(--color-mm-subtle)", color: "var(--color-mm-gray)" }
                ].map(opt => {
                  const count = opt.label === "All Status" 
                    ? projectList.length 
                    : projectList.filter(p => {
                        let status: "Pending" | "In Progress" | "Completed" = "In Progress";
                        if (p.progress === 0) status = "Pending";
                        else if (p.progress === 100) status = "Completed";
                        return status === opt.label;
                      }).length;
                  return (
                    <div 
                      key={opt.label} onClick={() => { setStatusFilter(opt.label); setIsStatusOpen(false); }}
                      style={{ padding: "10px 14px", borderRadius: "10px", color: statusFilter === opt.label ? "var(--color-mm-orange)" : "var(--color-mm-gray)", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", background: statusFilter === opt.label ? "rgba(224, 86, 36, 0.1)" : "transparent", fontWeight: statusFilter === opt.label ? 600 : 400 }}
                      onMouseEnter={(e) => { if (statusFilter !== opt.label) { e.currentTarget.style.background = "rgba(224, 86, 36, 0.1)"; e.currentTarget.style.color = "var(--color-mm-dark)"; } }}
                      onMouseLeave={(e) => { if (statusFilter !== opt.label) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-mm-gray)"; } }}
                    >
                      <div className="flex items-center gap-2">
                        {opt.label}
                        {opt.bg !== "transparent" && <span style={{ background: opt.bg, color: opt.color, borderRadius: "999px", padding: "2px 8px", fontSize: "11px", fontWeight: 600 }}>{opt.label}</span>}
                      </div>
                      <span style={{ color: "var(--color-mm-gray)", fontSize: "12px" }}>({count})</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="relative w-full sm:w-auto" ref={serviceRef}>
            <button 
              onClick={() => setIsServiceOpen(!isServiceOpen)}
              className="inline-flex items-center justify-between sm:justify-start gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors w-full sm:w-auto"
              style={{ background: "white", border: serviceFilter === "All Services" ? "1px solid var(--color-mm-border)" : "1px solid var(--color-mm-orange)", color: serviceFilter === "All Services" ? "var(--color-mm-gray)" : "var(--color-mm-orange)" }}
            >
              <span className="truncate">{serviceFilter}</span>
              <ChevronDown size={14} className="shrink-0" style={{ transform: isServiceOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms ease" }} />
            </button>
            {isServiceOpen && (
              <div style={{ background: "white", border: "1px solid var(--color-mm-border)", borderRadius: "16px", padding: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.10)", minWidth: "200px", position: "absolute", zIndex: 100, marginTop: "4px" }} className="w-full sm:w-auto left-0">
                {[
                  { label: "All Services", chips: [] },
                  { label: "Website", chips: [{ bg: "rgba(59, 130, 246, 0.1)", color: "var(--color-mm-blue)", text: "Website" }] },
                  { label: "Marketing", chips: [{ bg: "rgba(92, 177, 62, 0.1)", color: "var(--color-mm-green)", text: "Marketing" }] },
                  { label: "SEO", chips: [{ bg: "rgba(224, 86, 36, 0.1)", color: "var(--color-mm-orange)", text: "SEO" }] },
                  { label: "Sales", chips: [{ bg: "rgba(224, 86, 36, 0.1)", color: "var(--color-mm-red)", text: "Sales" }] },
                  { label: "Website + Marketing", chips: [{ bg: "rgba(59, 130, 246, 0.1)", color: "var(--color-mm-blue)", text: "Website" }, { bg: "rgba(92, 177, 62, 0.1)", color: "var(--color-mm-green)", text: "Marketing" }] }
                ].map(opt => (
                  <div 
                    key={opt.label} onClick={() => { setServiceFilter(opt.label); setIsServiceOpen(false); }}
                    style={{ padding: "10px 14px", borderRadius: "10px", color: serviceFilter === opt.label ? "var(--color-mm-orange)" : "var(--color-mm-gray)", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", background: serviceFilter === opt.label ? "rgba(224, 86, 36, 0.1)" : "transparent", fontWeight: serviceFilter === opt.label ? 600 : 400 }}
                    onMouseEnter={(e) => { if (serviceFilter !== opt.label) { e.currentTarget.style.background = "rgba(224, 86, 36, 0.1)"; e.currentTarget.style.color = "var(--color-mm-dark)"; } }}
                    onMouseLeave={(e) => { if (serviceFilter !== opt.label) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-mm-gray)"; } }}
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
        
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full md:w-auto">
          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="text-xs hover:underline whitespace-nowrap" style={{ color: "var(--color-mm-orange)" }}>
              Clear all filters
            </button>
          )}
          <button onClick={() => setIsNewProjectOpen(true)} className="px-4 py-2.5 bg-mm-orange hover:bg-mm-orange/95 text-white font-semibold rounded-xl transition-colors inline-flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap">
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      <div className="bg-white border border-mm-border rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-mm-subtle border-b border-mm-border text-mm-gray font-semibold">
                {["Client", "Business", "Services", "Assignee", "Status", "Progress", "Deadline", "Actions"].map((h) => (
                  <th key={h} className="text-left font-semibold px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-mm-orange border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-semibold" style={{ color: "var(--color-mm-gray)" }}>Loading projects...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProjects.length > 0 ? (
                filteredProjects.map((p) => {
                  const biz = typeof p.businessId === "object" && p.businessId !== null
                    ? p.businessId
                    : businesses.find(b => b.id === p.businessId);
                  const manager = p.assignee;

                  const userIdStr = biz
                    ? (typeof biz.userId === "object" && biz.userId !== null
                      ? biz.userId.id
                      : biz.userId)
                    : null;
                  const matchedUser = users.find(u => u.id === userIdStr);

                  const clientName = matchedUser?.fullName || "Unknown Client";
                  const clientEmail = matchedUser?.email || "No email";
                  const businessName = biz?.businessName || "No business";
                  const businessType = biz?.businessType || "Consulting";
                  
                  let status: "Pending" | "In Progress" | "Completed" = "In Progress";
                  if (p.progress === 0) status = "Pending";
                  else if (p.progress === 100) status = "Completed";

                  const deadlineStr = p.deadline ? new Date(p.deadline).toLocaleDateString() : "";

                  return (
                    <tr key={p.id} style={{ borderTop: "1px solid var(--color-mm-border)" }} className="hover:bg-mm-subtle transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={clientName} size={32} />
                          <div>
                            <div className="font-semibold" style={{ color: "var(--color-mm-dark)" }}>
                              {clientName}
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: "var(--color-mm-gray)" }}>
                              {clientEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={businessName} size={32} />
                          <div>
                            <div className="font-semibold" style={{ color: "var(--color-mm-dark)" }}>
                              {businessName}
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: "var(--color-mm-gray)" }}>
                              {businessType}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {p.services.map((s) => (
                            <span key={s} className="px-2.5 py-0.5 rounded-full text-xs border border-mm-border bg-mm-subtle text-mm-gray">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--color-mm-gray)" }}>{manager}</td>
                      <td className="px-4 py-3"><StatusBadge status={status} /></td>
                      <td className="px-4 py-3 min-w-[160px]">
                        <ProgressBar value={p.progress} color={statusColors[status as keyof typeof statusColors]} />
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--color-mm-gray)" }}>{deadlineStr}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link to="/admin/projects/$id" params={{ id: p.id }} search={{ edit: false }} className="hover:opacity-70" title="View">
                            <Eye size={16} style={{ color: "var(--color-mm-gray)" }} />
                          </Link>
                          <Link to="/admin/projects/$id" params={{ id: p.id }} search={{ edit: true }} className="hover:opacity-70" title="Edit">
                            <Edit2 size={16} style={{ color: "var(--color-mm-gray)" }} />
                          </Link>
                          <button onClick={() => setConfirmDelete(p)} className="hover:opacity-70 text-mm-red" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12">
                    <div className="flex flex-col items-center justify-center">
                      <SearchX size={32} style={{ color: "var(--color-mm-gray)" }} />
                      <div style={{ color: "var(--color-mm-gray)", fontSize: "14px", marginTop: "12px", fontWeight: 600 }}>No projects found</div>
                      <button onClick={clearAllFilters} style={{ color: "var(--color-mm-orange)", fontSize: "12px", marginTop: "4px" }} className="hover:underline">Clear filters</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isNewProjectOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(4px)" }} onClick={() => setIsNewProjectOpen(false)}>
          <div className="w-full" style={{ background: "white", borderRadius: "24px", border: "1px solid var(--color-mm-border)", maxWidth: "560px", padding: "32px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", width: "90%", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ color: "var(--color-mm-dark)", fontWeight: 700, fontSize: "20px" }}>Create New Project</h2>
              <button onClick={() => setIsNewProjectOpen(false)} className="hover:opacity-70 transition-opacity"><X size={20} style={{ color: "var(--color-mm-gray)" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-mm-red)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-mm-gray)"} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label style={{ color: "var(--color-mm-gray)", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Project Name*</label>
                <input placeholder="Enter project name" value={newProjectForm.name} onChange={(e) => setNewProjectForm({...newProjectForm, name: e.target.value})} style={{ background: "white", border: newProjectErrors.name ? "1px solid var(--color-mm-red)" : "1px solid var(--color-mm-border)", borderRadius: "12px", padding: "10px 14px", color: "var(--color-mm-dark)", width: "100%", outline: "none" }} onFocus={(e) => { if (!newProjectErrors.name) e.target.style.borderColor = "var(--color-mm-orange)" }} onBlur={(e) => { if (!newProjectErrors.name) e.target.style.borderColor = "var(--color-mm-border)" }} />
                {newProjectErrors.name && <div style={{ color: "var(--color-mm-red)", fontSize: "12px", marginTop: "4px" }}>Project Name is required.</div>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label style={{ color: "var(--color-mm-gray)", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Client / User*</label>
                  <select 
                    value={newProjectForm.client} 
                    onChange={(e) => handleClientChange(e.target.value)} 
                    style={{ background: "white", border: newProjectErrors.client ? "1px solid var(--color-mm-red)" : "1px solid var(--color-mm-border)", borderRadius: "12px", padding: "10px 14px", color: "var(--color-mm-dark)", width: "100%", outline: "none" }} 
                    onFocus={(e) => { if (!newProjectErrors.client) e.target.style.borderColor = "var(--color-mm-orange)" }} 
                    onBlur={(e) => { if (!newProjectErrors.client) e.target.style.borderColor = "var(--color-mm-border)" }}
                  >
                    <option value="" disabled>Select a client</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                    ))}
                  </select>
                  {newProjectErrors.client && <div style={{ color: "var(--color-mm-red)", fontSize: "12px", marginTop: "4px" }}>Client is required.</div>}
                </div>

                <div>
                  <label style={{ color: "var(--color-mm-gray)", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Business*</label>
                  <select 
                    value={newProjectForm.businessId} 
                    onChange={(e) => handleBusinessChange(e.target.value)} 
                    style={{ background: "white", border: newProjectErrors.businessId ? "1px solid var(--color-mm-red)" : "1px solid var(--color-mm-border)", borderRadius: "12px", padding: "10px 14px", color: "var(--color-mm-dark)", width: "100%", outline: "none" }} 
                    onFocus={(e) => { if (!newProjectErrors.businessId) e.target.style.borderColor = "var(--color-mm-orange)" }} 
                    onBlur={(e) => { if (!newProjectErrors.businessId) e.target.style.borderColor = "var(--color-mm-border)" }}
                  >
                    <option value="" disabled>Select a business</option>
                    {filteredBusinessesForSelect.map(b => (
                      <option key={b.id} value={b.id}>{b.businessName} ({b.businessType || "Consulting"})</option>
                    ))}
                  </select>
                  {newProjectErrors.businessId && <div style={{ color: "var(--color-mm-red)", fontSize: "12px", marginTop: "4px" }}>Business is required.</div>}
                </div>
              </div>

              <div>
                <label style={{ color: "var(--color-mm-gray)", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Project Domain*</label>
                <select 
                  value={newProjectForm.domain} 
                  onChange={(e) => { setNewProjectForm({...newProjectForm, domain: e.target.value}); setNewProjectErrors(prev => ({ ...prev, domain: false })); }} 
                  style={{ background: "white", border: newProjectErrors.domain ? "1px solid var(--color-mm-red)" : "1px solid var(--color-mm-border)", borderRadius: "12px", padding: "10px 14px", color: "var(--color-mm-dark)", width: "100%", outline: "none" }} 
                  onFocus={(e) => { if (!newProjectErrors.domain) e.target.style.borderColor = "var(--color-mm-orange)" }} 
                  onBlur={(e) => { if (!newProjectErrors.domain) e.target.style.borderColor = "var(--color-mm-border)" }}
                >
                  <option value="" disabled>Select a domain</option>
                  <option value="Website">Website</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Automation">Automation</option>
                </select>
                {newProjectErrors.domain && <div style={{ color: "var(--color-mm-red)", fontSize: "12px", marginTop: "4px" }}>Domain is required.</div>}
              </div>

              <div>
                <label style={{ color: "var(--color-mm-gray)", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Services*</label>
                <div className="flex flex-wrap gap-2">
                  {["Website", "Marketing", "SEO", "Sales", "Automation"].map(s => {
                    const isSelected = newProjectForm.services.includes(s);
                    return (
                      <button key={s} onClick={() => toggleService(s)} style={{ background: isSelected ? "var(--color-mm-orange)" : "var(--color-mm-subtle)", border: isSelected ? "1px solid var(--color-mm-orange)" : "1px solid var(--color-mm-border)", color: isSelected ? "white" : "var(--color-mm-gray)", borderRadius: "999px", padding: "6px 12px", fontSize: "13px" }} className="transition-colors hover:opacity-90">
                        {s}
                      </button>
                    )
                  })}
                </div>
                {newProjectErrors.services && <div style={{ color: "var(--color-mm-red)", fontSize: "12px", marginTop: "4px" }}>Select at least one service.</div>}
              </div>

              <div>
                <label style={{ color: "var(--color-mm-gray)", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Assignee / Manager*</label>
                <input 
                  placeholder="Enter manager's name" 
                  value={newProjectForm.manager} 
                  onChange={(e) => setNewProjectForm({...newProjectForm, manager: e.target.value})} 
                  style={{ background: "white", border: newProjectErrors.manager ? "1px solid var(--color-mm-red)" : "1px solid var(--color-mm-border)", borderRadius: "12px", padding: "10px 14px", color: "var(--color-mm-dark)", width: "100%", outline: "none" }}
                  onFocus={(e) => { if (!newProjectErrors.manager) e.target.style.borderColor = "var(--color-mm-orange)" }}
                  onBlur={(e) => { if (!newProjectErrors.manager) e.target.style.borderColor = "var(--color-mm-border)" }}
                />
                {newProjectErrors.manager && <div style={{ color: "var(--color-mm-red)", fontSize: "12px", marginTop: "4px" }}>Assignee is required.</div>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label style={{ color: "var(--color-mm-gray)", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Start Date*</label>
                  <input type="date" value={newProjectForm.startDate} onChange={(e) => setNewProjectForm({...newProjectForm, startDate: e.target.value})} style={{ background: "white", border: newProjectErrors.startDate ? "1px solid var(--color-mm-red)" : "1px solid var(--color-mm-border)", borderRadius: "12px", padding: "10px 14px", color: "var(--color-mm-dark)", width: "100%", outline: "none" }} />
                  {newProjectErrors.startDate && <div style={{ color: "var(--color-mm-red)", fontSize: "12px", marginTop: "4px" }}>Required.</div>}
                </div>
                <div>
                  <label style={{ color: "var(--color-mm-gray)", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Deadline*</label>
                  <input type="date" value={newProjectForm.deadline} onChange={(e) => setNewProjectForm({...newProjectForm, deadline: e.target.value})} style={{ background: "white", border: newProjectErrors.deadline ? "1px solid var(--color-mm-red)" : "1px solid var(--color-mm-border)", borderRadius: "12px", padding: "10px 14px", color: "var(--color-mm-dark)", width: "100%", outline: "none" }} />
                  {newProjectErrors.deadline && <div style={{ color: "var(--color-mm-red)", fontSize: "12px", marginTop: "4px" }}>Required.</div>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label style={{ color: "var(--color-mm-gray)", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Status*</label>
                  <select 
                    value={newProjectForm.status} 
                    onChange={(e) => { setNewProjectForm({...newProjectForm, status: e.target.value}); setNewProjectErrors(prev => ({ ...prev, status: false })); }} 
                    style={{ background: "white", border: newProjectErrors.status ? "1px solid var(--color-mm-red)" : "1px solid var(--color-mm-border)", borderRadius: "12px", padding: "10px 14px", color: "var(--color-mm-dark)", width: "100%", outline: "none" }} 
                    onFocus={(e) => { if (!newProjectErrors.status) e.target.style.borderColor = "var(--color-mm-orange)" }} 
                    onBlur={(e) => { if (!newProjectErrors.status) e.target.style.borderColor = "var(--color-mm-border)" }}
                  >
                    <option value="" disabled>Select status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  {newProjectErrors.status && <div style={{ color: "var(--color-mm-red)", fontSize: "12px", marginTop: "4px" }}>Status is required.</div>}
                </div>
                <div>
                  <label style={{ color: "var(--color-mm-gray)", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Priority*</label>
                  <select 
                    value={newProjectForm.priority} 
                    onChange={(e) => { setNewProjectForm({...newProjectForm, priority: e.target.value}); setNewProjectErrors(prev => ({ ...prev, priority: false })); }} 
                    style={{ background: "white", border: newProjectErrors.priority ? "1px solid var(--color-mm-red)" : "1px solid var(--color-mm-border)", borderRadius: "12px", padding: "10px 14px", color: "var(--color-mm-dark)", width: "100%", outline: "none" }} 
                    onFocus={(e) => { if (!newProjectErrors.priority) e.target.style.borderColor = "var(--color-mm-orange)" }} 
                    onBlur={(e) => { if (!newProjectErrors.priority) e.target.style.borderColor = "var(--color-mm-border)" }}
                  >
                    <option value="" disabled>Select priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  {newProjectErrors.priority && <div style={{ color: "var(--color-mm-red)", fontSize: "12px", marginTop: "4px" }}>Priority is required.</div>}
                </div>
              </div>

              <div>
                <label style={{ color: "var(--color-mm-gray)", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Description</label>
                <textarea rows={3} placeholder="Describe the project scope..." value={newProjectForm.description} onChange={(e) => setNewProjectForm({...newProjectForm, description: e.target.value})} style={{ background: "white", border: "1px solid var(--color-mm-border)", borderRadius: "12px", padding: "10px 14px", color: "var(--color-mm-dark)", width: "100%", outline: "none", resize: "vertical" }} onFocus={(e) => e.target.style.borderColor = "var(--color-mm-orange)"} onBlur={(e) => e.target.style.borderColor = "var(--color-mm-border)"} />
              </div>

              <div>
                <label style={{ color: "var(--color-mm-gray)", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Notes</label>
                <textarea rows={2} placeholder="Add additional project notes..." value={newProjectForm.notes} onChange={(e) => setNewProjectForm({...newProjectForm, notes: e.target.value})} style={{ background: "white", border: "1px solid var(--color-mm-border)", borderRadius: "12px", padding: "10px 14px", color: "var(--color-mm-dark)", width: "100%", outline: "none", resize: "vertical" }} onFocus={(e) => e.target.style.borderColor = "var(--color-mm-orange)"} onBlur={(e) => e.target.style.borderColor = "var(--color-mm-border)"} />
              </div>
            </div>

            <div className="mt-6 pt-4 flex justify-end gap-3" style={{ borderTop: "1px solid var(--color-mm-border)" }}>
              <button onClick={() => setIsNewProjectOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity" style={{ background: "white", border: "1px solid var(--color-mm-border)", color: "var(--color-mm-gray)" }}>Cancel</button>
              <button onClick={handleCreateSubmit} className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity" style={{ background: "var(--color-mm-orange)", color: "white" }}>Create Project</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (() => {
        const biz = typeof confirmDelete.businessId === "object" && confirmDelete.businessId !== null
          ? confirmDelete.businessId
          : businesses.find(b => b.id === confirmDelete.businessId);
        const client = biz?.businessName || "No business";
        return (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200" style={{ background: "rgba(0,0,0,0.3)" }}>
            <div className="w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-2xl" style={{ background: "white", border: "1px solid var(--color-mm-border)" }}>
              <h3 className="font-bold text-lg" style={{ color: "var(--color-mm-dark)" }}>Delete Project?</h3>
              <p className="text-sm" style={{ color: "var(--color-mm-gray)" }}>
                Are you sure you want to delete project <strong>"{confirmDelete.id}"</strong> for client <strong>{client}</strong>? This action is permanent.
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
                  onClick={() => handleDelete(confirmDelete)} 
                  className="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-95 text-white" 
                  style={{ background: "var(--color-mm-red)" }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-lg transition-all animate-in slide-in-from-bottom-5" style={{ background: "rgba(92, 177, 62, 0.1)", border: "1px solid var(--color-mm-green)", color: "var(--color-mm-green)", fontWeight: 600 }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// FlowSection removed
