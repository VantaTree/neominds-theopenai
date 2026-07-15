import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  MessageSquare,
  MoreVertical,
} from "lucide-react";
import { statusColors } from "@/lib/mock-data";
import type { Project } from "@/lib/schemas";
import {
  Avatar,
  ProgressBar,
  StatusBadge,
  Card,
} from "@/components/admin/shared";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  ChevronDown,
  SearchX,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  getProjectsFn,
  saveProjectFn,
  getUsersFn,
  deleteProjectFn,
  logAuditEventFn,
  getBusinessesFn,
} from "@/lib/server-functions";
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

function ProgressRing({ value, color }: { value: number; color: string }) {
  const radius = 18;
  const stroke = 5;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        {/* Track circle */}
        <circle
          stroke="rgba(224, 86, 36, 0.08)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress circle */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset, transition: "stroke-dashoffset 0.35s" }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <span className="absolute text-[9px] font-bold text-mm-dark">
        {value}%
      </span>
    </div>
  );
}

function ProjectsPage() {
  const {
    projects: initialProjects,
    users: initialUsers,
    businesses: initialBusinesses,
  } = Route.useLoaderData();
  const [projectList, setProjectList] = useState<Project[]>(initialProjects);
  const [users, setUsers] = useState<any[]>(initialUsers);
  const [businesses, setBusinesses] = useState<any[]>(initialBusinesses);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    () => {
      if (typeof window !== "undefined") {
        return localStorage.getItem("admin_last_selected_business_id");
      }
      return null;
    }
  );

  const selectedBiz = useMemo(() => {
    return businesses.find((b) => b.id === selectedBusinessId);
  }, [businesses, selectedBusinessId]);

  const activeUser = useMemo(() => {
    if (!selectedBiz) return null;
    const userIdStr =
      typeof selectedBiz.userId === "object" && selectedBiz.userId !== null
        ? selectedBiz.userId.id
        : selectedBiz.userId;
    return users.find((u) => u.id === userIdStr);
  }, [selectedBiz, users]);

  useEffect(() => {
    setProjectList(initialProjects);
    setUsers(initialUsers);
    setBusinesses(initialBusinesses);
  }, [initialProjects, initialUsers, initialBusinesses]);

  useEffect(() => {
    if (initialBusinesses.length > 0) {
      const exists = initialBusinesses.some((b) => b.id === selectedBusinessId);
      if (!exists) {
        setSelectedBusinessId(initialBusinesses[0].id);
      }
    }
  }, [initialBusinesses, selectedBusinessId]);

  useEffect(() => {
    if (selectedBusinessId && typeof window !== "undefined") {
      localStorage.setItem("admin_last_selected_business_id", selectedBusinessId);
    }
  }, [selectedBusinessId]);

  const activeBizProjects = useMemo(() => {
    if (!selectedBusinessId) return [];
    return projectList.filter((p) => {
      const bizId =
        typeof p.businessId === "object" && p.businessId !== null
          ? p.businessId.id
          : p.businessId;
      return bizId === selectedBusinessId;
    });
  }, [projectList, selectedBusinessId]);

  const sortedProjects = useMemo(() => {
    return [...activeBizProjects].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [activeBizProjects]);

  const refreshProjects = async () => {
    const [pData, uData, bData] = await Promise.all([
      getProjectsFn(),
      getUsersFn(),
      getBusinessesFn(),
    ]);
    setProjectList(pData);
    setUsers(uData);
    setBusinesses(bData);
  };

  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; left: number } | null>(null);
  const [newProjectForm, setNewProjectForm] = useState({
    name: "",
    client: "",
    businessId: "",
    services: [] as string[],
    domain: "" as any,
    manager: "",
    startDate: "",
    deadline: "",
    status: "" as any,
    priority: "" as any,
    description: "",
    notes: "",
  });
  const [newProjectErrors, setNewProjectErrors] = useState<
    Record<string, boolean>
  >({});

  const handleOpenNewProject = () => {
    const selectedBiz = businesses.find((b) => b.id === selectedBusinessId);
    const linkedUserId = selectedBiz
      ? typeof selectedBiz.userId === "string"
        ? selectedBiz.userId
        : selectedBiz.userId?.id
      : "";
    setNewProjectForm({
      name: "",
      client: linkedUserId || "",
      businessId: selectedBusinessId || "",
      services: [],
      domain: "" as any,
      manager: "",
      startDate: "",
      deadline: "",
      status: "" as any,
      priority: "" as any,
      description: "",
      notes: "",
    });
    setNewProjectErrors({});
    setIsNewProjectOpen(true);
  };

  const [toast, setToast] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);

  const handleDelete = async (p: Project) => {
    const biz =
      typeof p.businessId === "object" && p.businessId !== null
        ? p.businessId
        : businesses.find((b) => b.id === p.businessId);
    const client = biz?.businessName || "No business";
    const manager = p.assignee;
    await deleteProjectFn({ data: p.id });
    await logAuditEventFn({
      data: {
        uid: "admin",
        action: "project_deleted",
        payload: { projectId: p.id, client, manager },
        userName: "Admin",
      },
    });
    setProjectList((prev) => prev.filter((x) => x.id !== p.id));
    setConfirmDelete(null);
    setToast(`✓ Project "${p.id}" deleted successfully.`);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("All Domains");
  const [businessSearchQuery, setBusinessSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showCompleted, setShowCompleted] = useState(true);

  const [isDomainOpen, setIsDomainOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isServiceSearchOpen, setIsServiceSearchOpen] = useState(false);

  const domainRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const serviceSearchRef = useRef<HTMLDivElement>(null);

  const allAvailableServices = ["Website", "Marketing", "SEO", "Sales", "Automation"];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (domainRef.current && !domainRef.current.contains(e.target as Node))
        setIsDomainOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target as Node))
        setIsStatusOpen(false);
      if (
        serviceSearchRef.current &&
        !serviceSearchRef.current.contains(e.target as Node)
      ) {
        setIsServiceSearchOpen(false);
      }
      const target = e.target as HTMLElement;
      if (openDropdownId && !target.closest(".actions-dropdown-container")) {
        setOpenDropdownId(null);
      }
    }

    function handleScrollOrResize() {
      setOpenDropdownId(null);
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [openDropdownId]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const toggleService = (s: string) => {
    setNewProjectForm((prev) => ({
      ...prev,
      services: prev.services.includes(s)
        ? prev.services.filter((x) => x !== s)
        : [...prev.services, s],
    }));
  };

  const filteredBusinessesForSelect = useMemo(() => {
    if (!newProjectForm.client) {
      return businesses;
    }
    return businesses.filter(
      (b) =>
        (typeof b.userId === "string" ? b.userId : b.userId?.id) ===
        newProjectForm.client,
    );
  }, [businesses, newProjectForm.client]);

  const handleClientChange = (clientId: string) => {
    const clientBizs = businesses.filter(
      (b) =>
        (typeof b.userId === "string" ? b.userId : b.userId?.id) === clientId,
    );
    let nextBizId = "";
    if (clientBizs.length === 1) {
      nextBizId = clientBizs[0].id;
    } else if (clientBizs.some((b) => b.id === newProjectForm.businessId)) {
      nextBizId = newProjectForm.businessId;
    }
    setNewProjectForm((prev) => ({
      ...prev,
      client: clientId,
      businessId: nextBizId,
    }));
    setNewProjectErrors((prev) => ({
      ...prev,
      client: false,
      businessId: false,
    }));
  };

  const handleBusinessChange = (businessId: string) => {
    const selectedBiz = businesses.find((b) => b.id === businessId);
    const linkedUserId = selectedBiz
      ? typeof selectedBiz.userId === "string"
        ? selectedBiz.userId
        : selectedBiz.userId?.id
      : "";
    setNewProjectForm((prev) => ({
      ...prev,
      businessId,
      client: linkedUserId || prev.client,
    }));
    setNewProjectErrors((prev) => ({
      ...prev,
      client: false,
      businessId: false,
    }));
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
      deadline: newProjectForm.deadline
        ? new Date(newProjectForm.deadline)
        : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    saveProjectFn({ data: newPrjSchema as any }).then(() => {
      refreshProjects().then(() => {
        setIsNewProjectOpen(false);
        setNewProjectForm({
          name: "",
          client: "",
          businessId: "",
          services: [],
          domain: "" as any,
          manager: "",
          startDate: "",
          deadline: "",
          status: "" as any,
          priority: "" as any,
          description: "",
          notes: "",
        });
        setToast("✓ Project created successfully!");
      });
    });
  };

  const filteredProjects = useMemo(() => {
    return sortedProjects.filter((p) => {
      const biz =
        typeof p.businessId === "object" && p.businessId !== null
          ? p.businessId
          : businesses.find((b) => b.id === p.businessId);
      const manager = p.assignee;

      let status: "Pending" | "In Progress" | "Completed" = "In Progress";
      if (p.progress === 0) status = "Pending";
      else if (p.progress === 100) status = "Completed";

      let matchType = true;
      if (domainFilter !== "All Domains") {
        matchType = p.domain === domainFilter;
      }

      let matchStatus = true;
      if (statusFilter !== "All Status") matchStatus = status === statusFilter;

      let matchServices = true;
      if (selectedServices.length > 0) {
        matchServices = selectedServices.every((s) => p.services.includes(s));
      }

      let matchCompleted = true;
      if (!showCompleted) {
        matchCompleted = p.status !== "Completed" && p.progress !== 100;
      }

      let matchSearch = true;
      const term = searchQuery.toLowerCase();
      if (term) {
        const userIdStr = biz
          ? typeof biz.userId === "object" && biz.userId !== null
            ? biz.userId.id
            : biz.userId
          : null;
        const matchedUser = users.find((u) => u.id === userIdStr);
        const clientName = matchedUser?.fullName || "Unknown Client";
        const clientEmail = matchedUser?.email || "No email";
        const businessName = biz?.businessName || "No business";
        const businessType = biz?.businessType || "Consulting";

        matchSearch =
          p.id.toLowerCase().includes(term) ||
          p.name.toLowerCase().includes(term) ||
          clientName.toLowerCase().includes(term) ||
          clientEmail.toLowerCase().includes(term) ||
          businessName.toLowerCase().includes(term) ||
          businessType.toLowerCase().includes(term) ||
          manager.toLowerCase().includes(term);
      }

      return matchType && matchStatus && matchServices && matchCompleted && matchSearch;
    });
  }, [
    sortedProjects,
    domainFilter,
    statusFilter,
    selectedServices,
    showCompleted,
    searchQuery,
    businesses,
    users,
  ]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setDomainFilter("All Domains");
    setStatusFilter("All Status");
    setSelectedServices([]);
    setShowCompleted(true);
  };

  const hasActiveFilters =
    searchQuery ||
    domainFilter !== "All Domains" ||
    statusFilter !== "All Status" ||
    selectedServices.length > 0 ||
    !showCompleted;

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((biz) => {
      const term = businessSearchQuery.toLowerCase();
      if (!term) return true;

      const bizName = biz.businessName || "";
      const bizType = biz.businessType || "";
      
      const userIdStr = typeof biz.userId === "object" && biz.userId !== null ? biz.userId.id : biz.userId;
      const client = users.find((u) => u.id === userIdStr);
      const clientName = client?.fullName || "";

      return (
        bizName.toLowerCase().includes(term) ||
        bizType.toLowerCase().includes(term) ||
        clientName.toLowerCase().includes(term)
      );
    });
  }, [businesses, businessSearchQuery, users]);

  return (
    <div className="flex flex-col md:flex-row bg-[#FCFDFE] h-full w-full overflow-hidden">
      {/* Business Sidebar - Desktop */}
      <div className="hidden md:flex flex-col w-[260px] lg:w-[300px] bg-white border-r border-mm-border shrink-0 select-none">
        <div className="p-5 border-b border-mm-border/60 space-y-3">
          <h2 className="text-xs font-black text-mm-gray uppercase tracking-wider">
            Businesses
          </h2>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-mm-gray)" }}
            />
            <input
              type="text"
              placeholder="Search business, industry, client..."
              value={businessSearchQuery}
              onChange={(e) => setBusinessSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-6 py-2 rounded-lg border outline-none transition-all placeholder:text-mm-gray/45"
              style={{
                borderColor: "var(--color-mm-border)",
                background: "rgba(250,249,246,0.5)",
              }}
            />
            {businessSearchQuery && (
              <button
                onClick={() => setBusinessSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                <X size={12} style={{ color: "var(--color-mm-gray)" }} />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {filteredBusinesses.map((biz) => {
            const isSelected = selectedBusinessId === biz.id;
            const projectCount = projectList.filter((p) => {
              const bizId =
                typeof p.businessId === "object" && p.businessId !== null
                  ? p.businessId.id
                  : p.businessId;
              return bizId === biz.id;
            }).length;

            const userIdStr = typeof biz.userId === "object" && biz.userId !== null ? biz.userId.id : biz.userId;
            const clientUser = users.find((u) => u.id === userIdStr);

            return (
              <button
                key={biz.id}
                onClick={() => setSelectedBusinessId(biz.id)}
                className={`w-full flex items-center justify-between gap-3 px-5 py-3.5 transition-colors border-l-4 text-left cursor-pointer ${
                  isSelected
                    ? "bg-mm-orange/5 border-mm-orange text-mm-dark font-semibold"
                    : "border-transparent text-mm-gray hover:bg-mm-subtle/50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Overlapping Avatar Container */}
                  <div className="relative shrink-0 w-10 h-10 select-none mr-1">
                    {biz.image ? (
                      <img
                        src={biz.image}
                        alt={biz.businessName}
                        className="w-9 h-9 rounded-xl object-cover aspect-square"
                      />
                    ) : (
                      <Avatar name={biz.businessName} size={36} />
                    )}
                    <div className="absolute bottom-0 right-0 translate-x-1.5 translate-y-1.5 border-2 border-white rounded-full overflow-hidden shadow-sm bg-white">
                      {clientUser?.image ? (
                        <img
                          src={clientUser.image}
                          alt={clientUser.fullName}
                          className="w-4.5 h-4.5 rounded-full object-cover aspect-square"
                        />
                      ) : (
                        <div className="w-4.5 h-4.5 rounded-full bg-mm-orange text-white text-[7px] font-black flex items-center justify-center">
                          {clientUser?.fullName ? clientUser.fullName.charAt(0) : "U"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div
                      className={`text-xs font-bold truncate ${isSelected ? "text-mm-dark" : "text-mm-dark/80"}`}
                    >
                      {biz.businessName}
                    </div>
                    <div className="text-[9px] text-mm-gray truncate mt-0.5 font-medium">
                      {biz.businessType || "Consulting"} • {clientUser?.fullName || "No Owner"}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isSelected
                      ? "bg-mm-orange/15 text-mm-orange"
                      : "bg-mm-subtle text-mm-gray/80"
                  }`}
                >
                  {projectCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Business Selector - Mobile */}
      <div className="md:hidden bg-white border-b border-mm-border px-4 py-3 flex flex-col gap-2 sticky top-0 z-10">
        <span className="text-[10px] font-black text-mm-gray uppercase tracking-wider">
          Select Business
        </span>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-mm-gray)" }}
          />
          <input
            type="text"
            placeholder="Search business, industry, client..."
            value={businessSearchQuery}
            onChange={(e) => setBusinessSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-6 py-2 rounded-lg border outline-none transition-all placeholder:text-mm-gray/45"
            style={{
              borderColor: "var(--color-mm-border)",
              background: "rgba(250,249,246,0.5)",
            }}
          />
          {businessSearchQuery && (
            <button
              onClick={() => setBusinessSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              <X size={12} style={{ color: "var(--color-mm-gray)" }} />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {filteredBusinesses.map((biz) => {
            const isSelected = selectedBusinessId === biz.id;
            const projectCount = projectList.filter((p) => {
              const bizId =
                typeof p.businessId === "object" && p.businessId !== null
                  ? p.businessId.id
                  : p.businessId;
              return bizId === biz.id;
            }).length;

            const userIdStr = typeof biz.userId === "object" && biz.userId !== null ? biz.userId.id : biz.userId;
            const clientUser = users.find((u) => u.id === userIdStr);

            return (
              <button
                key={biz.id}
                onClick={() => setSelectedBusinessId(biz.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border shrink-0 transition-all text-xs font-bold cursor-pointer ${
                  isSelected
                    ? "bg-mm-orange/10 border-mm-orange text-mm-orange"
                    : "bg-white border-mm-border/60 text-mm-gray hover:bg-mm-subtle/50"
                }`}
              >
                {/* Overlapping Avatar Container */}
                <div className="relative shrink-0 w-6 h-6 select-none mr-0.5">
                  {biz.image ? (
                    <img
                      src={biz.image}
                      alt={biz.businessName}
                      className="w-5 h-5 rounded-md object-cover aspect-square"
                    />
                  ) : (
                    <Avatar name={biz.businessName} size={20} />
                  )}
                  <div className="absolute bottom-0 right-0 translate-x-1 translate-y-1 border border-white rounded-full overflow-hidden shadow-xs bg-white">
                    {clientUser?.image ? (
                      <img
                        src={clientUser.image}
                        alt={clientUser.fullName}
                        className="w-2.5 h-2.5 rounded-full object-cover aspect-square"
                      />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-mm-orange text-white text-[4px] font-black flex items-center justify-center">
                        {clientUser?.fullName ? clientUser.fullName.charAt(0) : "U"}
                      </div>
                    )}
                  </div>
                </div>

                <span>{biz.businessName} ({clientUser?.fullName || "No Owner"})</span>
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-mm-orange/20 text-mm-orange"
                      : "bg-mm-subtle text-mm-gray/70"
                  }`}
                >
                  {projectCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Side - Projects Content */}
      <div className="flex-1 p-6 md:p-8 lg:p-10 space-y-6 overflow-y-scroll min-w-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--color-mm-dark)" }}
            >
              Projects
            </h1>
            <p className="text-xs text-mm-gray mt-1 font-medium">
              Showing projects for{" "}
              {selectedBiz?.businessName || "selected business"}
            </p>
          </div>

          {activeUser && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-mm-border/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] max-w-sm">
              {activeUser.image ? (
                <img
                  src={activeUser.image}
                  alt={activeUser.fullName}
                  className="w-9 h-9 rounded-full object-cover aspect-square shrink-0"
                />
              ) : (
                <Avatar name={activeUser.fullName || "Client"} size={36} />
              )}
              <div className="min-w-0">
                <span className="text-[9px] font-black text-mm-gray uppercase tracking-wider block">
                  Client Owner
                </span>
                <div className="font-bold text-xs text-mm-dark truncate">
                  {activeUser.fullName}
                </div>
                <div className="text-[10px] text-mm-gray truncate">
                  {activeUser.email}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="w-full sm:w-[280px]">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-mm-gray)" }}
                />
                <input
                  className="w-full rounded-xl pl-9 pr-8 py-2.5 text-sm outline-none transition-all"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: "white",
                    border: "1px solid var(--color-mm-border)",
                    color: "var(--color-mm-dark)",
                  }}
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
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X
                      size={14}
                      style={{ color: "var(--color-mm-gray)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--color-mm-red)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "var(--color-mm-gray)")
                      }
                    />
                  </button>
                )}
              </div>
              {hasActiveFilters && (
                <div
                  style={{
                    color: "var(--color-mm-gray)",
                    fontSize: "12px",
                    paddingLeft: "4px",
                    marginTop: "4px",
                  }}
                >
                  Showing {filteredProjects.length} of {projectList.length}{" "}
                  projects
                </div>
              )}
            </div>

            <div className="relative w-full sm:w-auto" ref={domainRef}>
              <button
                onClick={() => setIsDomainOpen(!isDomainOpen)}
                className="inline-flex items-center justify-between sm:justify-start gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors w-full sm:w-auto"
                style={{
                  background: "white",
                  border:
                    domainFilter === "All Domains"
                      ? "1px solid var(--color-mm-border)"
                      : "1px solid var(--color-mm-orange)",
                  color:
                    domainFilter === "All Domains"
                      ? "var(--color-mm-gray)"
                      : "var(--color-mm-orange)",
                }}
              >
                <span className="truncate">{domainFilter}</span>
                <ChevronDown
                  size={14}
                  className="shrink-0"
                  style={{
                    transform: isDomainOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 150ms ease",
                  }}
                />
              </button>
              {isDomainOpen && (
                <div
                  style={{
                    background: "white",
                    border: "1px solid var(--color-mm-border)",
                    borderRadius: "16px",
                    padding: "8px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                    minWidth: "200px",
                    position: "absolute",
                    zIndex: 100,
                    marginTop: "4px",
                  }}
                  className="w-full sm:w-auto left-0"
                >
                  {[
                    { label: "All Domains", count: projectList.length },
                    {
                      label: "Website",
                      count: projectList.filter((p) => p.domain === "Website").length,
                    },
                    {
                      label: "Marketing",
                      count: projectList.filter((p) => p.domain === "Marketing").length,
                    },
                    {
                      label: "Automation",
                      count: projectList.filter((p) => p.domain === "Automation").length,
                    },
                  ].map((opt) => (
                    <div
                      key={opt.label}
                      onClick={() => {
                        setDomainFilter(opt.label);
                        setIsDomainOpen(false);
                      }}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        color:
                          domainFilter === opt.label
                            ? "var(--color-mm-orange)"
                            : "var(--color-mm-gray)",
                        fontSize: "14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background:
                          domainFilter === opt.label
                            ? "rgba(224, 86, 36, 0.1)"
                            : "transparent",
                        fontWeight: domainFilter === opt.label ? 600 : 400,
                      }}
                      onMouseEnter={(e) => {
                        if (domainFilter !== opt.label) {
                          e.currentTarget.style.background =
                            "rgba(224, 86, 36, 0.1)";
                          e.currentTarget.style.color = "var(--color-mm-dark)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (domainFilter !== opt.label) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "var(--color-mm-gray)";
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">{opt.label}</div>
                      <span
                        style={{
                          color: "var(--color-mm-gray)",
                          fontSize: "12px",
                        }}
                      >
                        {opt.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative w-full sm:w-auto" ref={statusRef}>
              <button
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="inline-flex items-center justify-between sm:justify-start gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors w-full sm:w-auto"
                style={{
                  background: "white",
                  border:
                    statusFilter === "All Status"
                      ? "1px solid var(--color-mm-border)"
                      : "1px solid var(--color-mm-orange)",
                  color:
                    statusFilter === "All Status"
                      ? "var(--color-mm-gray)"
                      : "var(--color-mm-orange)",
                }}
              >
                <span className="truncate">{statusFilter}</span>
                <ChevronDown
                  size={14}
                  className="shrink-0"
                  style={{
                    transform: isStatusOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 150ms ease",
                  }}
                />
              </button>
              {isStatusOpen && (
                <div
                  style={{
                    background: "white",
                    border: "1px solid var(--color-mm-border)",
                    borderRadius: "16px",
                    padding: "8px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                    minWidth: "200px",
                    position: "absolute",
                    zIndex: 100,
                    marginTop: "4px",
                  }}
                  className="w-full sm:w-auto left-0"
                >
                  {[
                    {
                      label: "All Status",
                      bg: "transparent",
                      color: "transparent",
                    },
                    {
                      label: "In Progress",
                      bg: "rgba(59, 130, 246, 0.1)",
                      color: "var(--color-mm-blue)",
                    },
                    {
                      label: "Pending",
                      bg: "rgba(224, 86, 36, 0.1)",
                      color: "var(--color-mm-orange)",
                    },
                    {
                      label: "On Hold",
                      bg: "rgba(224, 86, 36, 0.1)",
                      color: "var(--color-mm-red)",
                    },
                    {
                      label: "Completed",
                      bg: "rgba(92, 177, 62, 0.1)",
                      color: "var(--color-mm-green)",
                    },
                    {
                      label: "Cancelled",
                      bg: "var(--color-mm-subtle)",
                      color: "var(--color-mm-gray)",
                    },
                  ].map((opt) => {
                    const count =
                      opt.label === "All Status"
                        ? projectList.length
                        : projectList.filter((p) => {
                            let status:
                              "Pending" | "In Progress" | "Completed" =
                              "In Progress";
                            if (p.progress === 0) status = "Pending";
                            else if (p.progress === 100) status = "Completed";
                            return status === opt.label;
                          }).length;
                    return (
                      <div
                        key={opt.label}
                        onClick={() => {
                          setStatusFilter(opt.label);
                          setIsStatusOpen(false);
                        }}
                        style={{
                          padding: "10px 14px",
                          borderRadius: "10px",
                          color:
                            statusFilter === opt.label
                              ? "var(--color-mm-orange)"
                              : "var(--color-mm-gray)",
                          fontSize: "14px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background:
                            statusFilter === opt.label
                              ? "rgba(224, 86, 36, 0.1)"
                              : "transparent",
                          fontWeight: statusFilter === opt.label ? 600 : 400,
                        }}
                        onMouseEnter={(e) => {
                          if (statusFilter !== opt.label) {
                            e.currentTarget.style.background =
                              "rgba(224, 86, 36, 0.1)";
                            e.currentTarget.style.color =
                              "var(--color-mm-dark)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (statusFilter !== opt.label) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color =
                              "var(--color-mm-gray)";
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {opt.label}
                          {opt.bg !== "transparent" && (
                            <span
                              style={{
                                background: opt.bg,
                                color: opt.color,
                                borderRadius: "999px",
                                padding: "2px 8px",
                                fontSize: "11px",
                                fontWeight: 600,
                              }}
                            >
                              {opt.label}
                            </span>
                          )}
                        </div>
                        <span
                          style={{
                            color: "var(--color-mm-gray)",
                            fontSize: "12px",
                          }}
                        >
                          ({count})
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="relative w-full sm:w-[220px]" ref={serviceSearchRef}>
              <div
                onClick={() => setIsServiceSearchOpen(!isServiceSearchOpen)}
                className="flex flex-wrap items-center gap-1.5 px-3 py-2 border rounded-xl bg-white cursor-pointer min-h-[42px] transition-all w-full"
                style={{
                  borderColor: selectedServices.length > 0 ? "var(--color-mm-orange)" : "var(--color-mm-border)",
                }}
              >
                {selectedServices.length === 0 ? (
                  <span className="text-sm text-mm-gray/60 font-medium">Services Filters...</span>
                ) : (
                  selectedServices.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-mm-orange/10 text-mm-orange text-xs font-semibold px-2 py-0.5 rounded-full select-none"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedServices((prev) => prev.filter((t) => t !== tag));
                        }}
                        className="hover:text-mm-red font-black"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))
                )}
              </div>
              {isServiceSearchOpen && (
                <div
                  className="absolute left-0 mt-1 w-full bg-white border border-mm-border rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  style={{
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  }}
                >
                  {allAvailableServices
                    .filter((s) => !selectedServices.includes(s))
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setSelectedServices((prev) => [...prev, s]);
                          setIsServiceSearchOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-sm text-mm-gray hover:bg-mm-orange/5 hover:text-mm-orange font-medium transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  {allAvailableServices.filter((s) => !selectedServices.includes(s)).length === 0 && (
                    <div className="px-3.5 py-2 text-xs text-mm-gray/60 font-medium text-center">
                      All services selected
                    </div>
                  )}
                </div>
              )}
            </div>

            <label className="inline-flex items-center gap-2 cursor-pointer select-none py-2 px-4 rounded-xl border border-mm-border/60 bg-white hover:bg-mm-subtle/30 transition-all w-full sm:w-auto h-[42px] shrink-0">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="w-4 h-4 accent-mm-orange rounded border-mm-border text-mm-orange focus:ring-mm-orange"
              />
              <span className="text-sm font-bold text-mm-gray/80">Show Completed</span>
            </label>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full md:w-auto shrink-0">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs hover:underline whitespace-nowrap"
                style={{ color: "var(--color-mm-orange)" }}
              >
                Clear all filters
              </button>
            )}
            <button
              onClick={handleOpenNewProject}
              className="px-4 py-2.5 bg-mm-orange hover:bg-mm-orange/95 text-white font-semibold rounded-xl transition-colors inline-flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap cursor-pointer"
            >
              <Plus size={16} /> New Project
            </button>
          </div>
        </div>

        <div className="bg-white border border-mm-border rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-mm-subtle border-b border-mm-border text-mm-gray font-semibold">
                  {[
                    "Project Name",
                    "Services",
                    "Assignee",
                    "Status",
                    "Progress",
                    "Timeline",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left font-semibold px-4 py-3 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-mm-orange border-t-transparent rounded-full animate-spin"></div>
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "var(--color-mm-gray)" }}
                        >
                          Loading projects...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredProjects.length > 0 ? (
                  filteredProjects.map((p) => {
                    const biz =
                      typeof p.businessId === "object" && p.businessId !== null
                        ? p.businessId
                        : businesses.find((b) => b.id === p.businessId);
                    const manager = p.assignee;

                    const userIdStr = biz
                      ? typeof biz.userId === "object" && biz.userId !== null
                        ? biz.userId.id
                        : biz.userId
                      : null;
                    const matchedUser = users.find((u) => u.id === userIdStr);

                    let status: "Pending" | "In Progress" | "Completed" =
                      "In Progress";
                    if (p.progress === 0) status = "Pending";
                    else if (p.progress === 100) status = "Completed";

                    const startDateStr = p.startDate
                      ? new Date(p.startDate).toLocaleDateString()
                      : "";
                    const deadlineStr = p.deadline
                      ? new Date(p.deadline).toLocaleDateString()
                      : "";

                    return (
                      <tr
                        key={p.id}
                        style={{
                          borderTop: "1px solid var(--color-mm-border)",
                        }}
                        className="hover:bg-mm-subtle transition-colors"
                      >
                        <td className="px-4 py-3 font-semibold text-mm-dark whitespace-nowrap">
                          {p.name || p.id}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {p.services.map((s) => (
                              <span
                                key={s}
                                className="px-2.5 py-0.5 rounded-full text-xs border border-mm-border bg-mm-subtle text-mm-gray"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td
                          className="px-4 py-3"
                          style={{ color: "var(--color-mm-gray)" }}
                        >
                          {manager}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-4 py-3">
                          <ProgressRing
                            value={p.progress}
                            color={
                              statusColors[status as keyof typeof statusColors]
                            }
                          />
                        </td>
                        <td
                          className="px-4 py-3 text-xs whitespace-nowrap"
                          style={{ color: "var(--color-mm-gray)" }}
                        >
                          <div className="text-[10px] text-mm-gray mt-0.5">
                            {startDateStr || "N/A"} to
                          </div>
                          <div className="font-semibold text-mm-dark">
                            {deadlineStr || "N/A"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative inline-block actions-dropdown-container">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                const dropdownHeight = 180;
                                const dropdownWidth = 160;
                                let top = rect.bottom;
                                if (top + dropdownHeight > window.innerHeight) {
                                  top = rect.top - dropdownHeight - 8;
                                }
                                let left = rect.right - dropdownWidth;
                                if (left < 8) {
                                  left = 8;
                                }
                                setDropdownCoords({ top, left });
                                setOpenDropdownId(
                                  openDropdownId === p.id ? null : p.id,
                                );
                              }}
                              className="p-1.5 rounded-lg hover:bg-mm-subtle transition-colors cursor-pointer text-mm-gray hover:text-mm-dark flex items-center justify-center"
                              title="Actions"
                            >
                              <MoreVertical size={16} />
                            </button>
                            {openDropdownId === p.id && dropdownCoords && (
                              <div
                                className="fixed mt-1 w-40 bg-white border border-mm-border rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                                style={{
                                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                  top: `${dropdownCoords.top}px`,
                                  left: `${dropdownCoords.left}px`,
                                }}
                              >
                                <Link
                                  to="/admin/projects/$id"
                                  params={{ id: p.id }}
                                  search={{ edit: false }}
                                  onClick={() => setOpenDropdownId(null)}
                                  className="flex items-center gap-2 px-3 py-2 text-xs text-mm-gray hover:text-mm-dark hover:bg-mm-subtle transition-colors"
                                >
                                  <Eye size={14} />
                                  <span>View Project</span>
                                </Link>
                                <Link
                                  to="/admin/projects/$id"
                                  params={{ id: p.id }}
                                  search={{ edit: true }}
                                  onClick={() => setOpenDropdownId(null)}
                                  className="flex items-center gap-2 px-3 py-2 text-xs text-mm-gray hover:text-mm-dark hover:bg-mm-subtle transition-colors"
                                >
                                  <Edit2 size={14} />
                                  <span>Edit Project</span>
                                </Link>
                                <Link
                                  to="/admin/chat"
                                  search={{
                                    user: userIdStr || "",
                                    business:
                                      (typeof p.businessId === "string"
                                        ? p.businessId
                                        : biz?.id) || "",
                                    domain: p.domain,
                                  }}
                                  onClick={() => setOpenDropdownId(null)}
                                  className="flex items-center gap-2 px-3 py-2 text-xs text-mm-orange hover:bg-mm-orange/5 transition-colors"
                                >
                                  <MessageSquare size={14} />
                                  <span>Open Chat</span>
                                </Link>
                                <hr className="border-t border-mm-border my-1" />
                                <button
                                  onClick={() => {
                                    setConfirmDelete(p);
                                    setOpenDropdownId(null);
                                  }}
                                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-mm-red hover:bg-mm-red/5 transition-colors cursor-pointer"
                                >
                                  <Trash2 size={14} />
                                  <span>Delete Project</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-12">
                      <div className="flex flex-col items-center justify-center">
                        <SearchX
                          size={32}
                          style={{ color: "var(--color-mm-gray)" }}
                        />
                        <div
                          style={{
                            color: "var(--color-mm-gray)",
                            fontSize: "14px",
                            marginTop: "12px",
                            fontWeight: 600,
                          }}
                        >
                          No projects found
                        </div>
                        <button
                          onClick={clearAllFilters}
                          style={{
                            color: "var(--color-mm-orange)",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                          className="hover:underline cursor-pointer"
                        >
                          Clear filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isNewProjectOpen && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(4px)" }}
          onClick={() => setIsNewProjectOpen(false)}
        >
          <div
            className="w-full"
            style={{
              background: "white",
              borderRadius: "24px",
              border: "1px solid var(--color-mm-border)",
              maxWidth: "560px",
              padding: "32px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                style={{
                  color: "var(--color-mm-dark)",
                  fontWeight: 700,
                  fontSize: "20px",
                }}
              >
                Create New Project
              </h2>
              <button
                onClick={() => setIsNewProjectOpen(false)}
                className="hover:opacity-70 transition-opacity cursor-pointer"
              >
                <X
                  size={20}
                  style={{ color: "var(--color-mm-gray)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--color-mm-red)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--color-mm-gray)")
                  }
                />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  style={{
                    color: "var(--color-mm-gray)",
                    fontWeight: 600,
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Project Name*
                </label>
                <input
                  placeholder="Enter project name"
                  value={newProjectForm.name}
                  onChange={(e) =>
                    setNewProjectForm({
                      ...newProjectForm,
                      name: e.target.value,
                    })
                  }
                  style={{
                    background: "white",
                    border: newProjectErrors.name
                      ? "1px solid var(--color-mm-red)"
                      : "1px solid var(--color-mm-border)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    color: "var(--color-mm-dark)",
                    width: "100%",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    if (!newProjectErrors.name)
                      e.target.style.borderColor = "var(--color-mm-orange)";
                  }}
                  onBlur={(e) => {
                    if (!newProjectErrors.name)
                      e.target.style.borderColor = "var(--color-mm-border)";
                  }}
                />
                {newProjectErrors.name && (
                  <div
                    style={{
                      color: "var(--color-mm-red)",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    Project Name is required.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div
                    className="flex items-center justify-between"
                    style={{ marginBottom: "4px" }}
                  >
                    <label
                      style={{
                        color: "var(--color-mm-gray)",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      Client / User*
                    </label>
                    {(newProjectForm.client || newProjectForm.businessId) && (
                      <button
                        type="button"
                        onClick={() =>
                          setNewProjectForm((prev) => ({
                            ...prev,
                            client: "",
                            businessId: "",
                          }))
                        }
                        className="text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer text-mm-orange bg-none border-none p-0"
                      >
                        Clear User & Business
                      </button>
                    )}
                  </div>
                  <select
                    value={newProjectForm.client}
                    onChange={(e) => handleClientChange(e.target.value)}
                    style={{
                      background: "white",
                      border: newProjectErrors.client
                        ? "1px solid var(--color-mm-red)"
                        : "1px solid var(--color-mm-border)",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      color: "var(--color-mm-dark)",
                      width: "100%",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      if (!newProjectErrors.client)
                        e.target.style.borderColor = "var(--color-mm-orange)";
                    }}
                    onBlur={(e) => {
                      if (!newProjectErrors.client)
                        e.target.style.borderColor = "var(--color-mm-border)";
                    }}
                  >
                    <option value="" disabled>
                      Select a client
                    </option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.email})
                      </option>
                    ))}
                  </select>
                  {newProjectErrors.client && (
                    <div
                      style={{
                        color: "var(--color-mm-red)",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      Client is required.
                    </div>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      color: "var(--color-mm-gray)",
                      fontWeight: 600,
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Business*
                  </label>
                  <select
                    value={newProjectForm.businessId}
                    onChange={(e) => handleBusinessChange(e.target.value)}
                    style={{
                      background: "white",
                      border: newProjectErrors.businessId
                        ? "1px solid var(--color-mm-red)"
                        : "1px solid var(--color-mm-border)",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      color: "var(--color-mm-dark)",
                      width: "100%",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      if (!newProjectErrors.businessId)
                        e.target.style.borderColor = "var(--color-mm-orange)";
                    }}
                    onBlur={(e) => {
                      if (!newProjectErrors.businessId)
                        e.target.style.borderColor = "var(--color-mm-border)";
                    }}
                  >
                    <option value="" disabled>
                      Select a business
                    </option>
                    {filteredBusinessesForSelect.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.businessName} ({b.businessType || "Consulting"})
                      </option>
                    ))}
                  </select>
                  {newProjectErrors.businessId && (
                    <div
                      style={{
                        color: "var(--color-mm-red)",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      Business is required.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label
                  style={{
                    color: "var(--color-mm-gray)",
                    fontWeight: 600,
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Project Domain*
                </label>
                <select
                  value={newProjectForm.domain}
                  onChange={(e) => {
                    setNewProjectForm({
                      ...newProjectForm,
                      domain: e.target.value,
                    });
                    setNewProjectErrors((prev) => ({ ...prev, domain: false }));
                  }}
                  style={{
                    background: "white",
                    border: newProjectErrors.domain
                      ? "1px solid var(--color-mm-red)"
                      : "1px solid var(--color-mm-border)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    color: "var(--color-mm-dark)",
                    width: "100%",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    if (!newProjectErrors.domain)
                      e.target.style.borderColor = "var(--color-mm-orange)";
                  }}
                  onBlur={(e) => {
                    if (!newProjectErrors.domain)
                      e.target.style.borderColor = "var(--color-mm-border)";
                  }}
                >
                  <option value="" disabled>
                    Select a domain
                  </option>
                  <option value="Website">Website</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Automation">Automation</option>
                </select>
                {newProjectErrors.domain && (
                  <div
                    style={{
                      color: "var(--color-mm-red)",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    Domain is required.
                  </div>
                )}
              </div>

              <div>
                <label
                  style={{
                    color: "var(--color-mm-gray)",
                    fontWeight: 600,
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Services*
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Website", "Marketing", "SEO", "Sales", "Automation"].map(
                    (s) => {
                      const isSelected = newProjectForm.services.includes(s);
                      return (
                        <button
                          key={s}
                          onClick={() => toggleService(s)}
                          style={{
                            background: isSelected
                              ? "var(--color-mm-orange)"
                              : "var(--color-mm-subtle)",
                            border: isSelected
                              ? "1px solid var(--color-mm-orange)"
                              : "1px solid var(--color-mm-border)",
                            color: isSelected
                              ? "white"
                              : "var(--color-mm-gray)",
                            borderRadius: "999px",
                            padding: "6px 12px",
                            fontSize: "13px",
                          }}
                          className="transition-colors hover:opacity-90 cursor-pointer"
                        >
                          {s}
                        </button>
                      );
                    },
                  )}
                </div>
                {newProjectErrors.services && (
                  <div
                    style={{
                      color: "var(--color-mm-red)",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    Select at least one service.
                  </div>
                )}
              </div>

              <div>
                <label
                  style={{
                    color: "var(--color-mm-gray)",
                    fontWeight: 600,
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Assignee / Manager*
                </label>
                <input
                  placeholder="Enter manager's name"
                  value={newProjectForm.manager}
                  onChange={(e) =>
                    setNewProjectForm({
                      ...newProjectForm,
                      manager: e.target.value,
                    })
                  }
                  style={{
                    background: "white",
                    border: newProjectErrors.manager
                      ? "1px solid var(--color-mm-red)"
                      : "1px solid var(--color-mm-border)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    color: "var(--color-mm-dark)",
                    width: "100%",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    if (!newProjectErrors.manager)
                      e.target.style.borderColor = "var(--color-mm-orange)";
                  }}
                  onBlur={(e) => {
                    if (!newProjectErrors.manager)
                      e.target.style.borderColor = "var(--color-mm-border)";
                  }}
                />
                {newProjectErrors.manager && (
                  <div
                    style={{
                      color: "var(--color-mm-red)",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    Assignee is required.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    style={{
                      color: "var(--color-mm-gray)",
                      fontWeight: 600,
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Start Date*
                  </label>
                  <input
                    type="date"
                    value={newProjectForm.startDate}
                    onChange={(e) =>
                      setNewProjectForm({
                        ...newProjectForm,
                        startDate: e.target.value,
                      })
                    }
                    style={{
                      background: "white",
                      border: newProjectErrors.startDate
                        ? "1px solid var(--color-mm-red)"
                        : "1px solid var(--color-mm-border)",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      color: "var(--color-mm-dark)",
                      width: "100%",
                      outline: "none",
                    }}
                  />
                  {newProjectErrors.startDate && (
                    <div
                      style={{
                        color: "var(--color-mm-red)",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      Required.
                    </div>
                  )}
                </div>
                <div>
                  <label
                    style={{
                      color: "var(--color-mm-gray)",
                      fontWeight: 600,
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Deadline*
                  </label>
                  <input
                    type="date"
                    value={newProjectForm.deadline}
                    onChange={(e) =>
                      setNewProjectForm({
                        ...newProjectForm,
                        deadline: e.target.value,
                      })
                    }
                    style={{
                      background: "white",
                      border: newProjectErrors.deadline
                        ? "1px solid var(--color-mm-red)"
                        : "1px solid var(--color-mm-border)",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      color: "var(--color-mm-dark)",
                      width: "100%",
                      outline: "none",
                    }}
                  />
                  {newProjectErrors.deadline && (
                    <div
                      style={{
                        color: "var(--color-mm-red)",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      Required.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    style={{
                      color: "var(--color-mm-gray)",
                      fontWeight: 600,
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Status*
                  </label>
                  <select
                    value={newProjectForm.status}
                    onChange={(e) => {
                      setNewProjectForm({
                        ...newProjectForm,
                        status: e.target.value,
                      });
                      setNewProjectErrors((prev) => ({
                        ...prev,
                        status: false,
                      }));
                    }}
                    style={{
                      background: "white",
                      border: newProjectErrors.status
                        ? "1px solid var(--color-mm-red)"
                        : "1px solid var(--color-mm-border)",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      color: "var(--color-mm-dark)",
                      width: "100%",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      if (!newProjectErrors.status)
                        e.target.style.borderColor = "var(--color-mm-orange)";
                    }}
                    onBlur={(e) => {
                      if (!newProjectErrors.status)
                        e.target.style.borderColor = "var(--color-mm-border)";
                    }}
                  >
                    <option value="" disabled>
                      Select status
                    </option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  {newProjectErrors.status && (
                    <div
                      style={{
                        color: "var(--color-mm-red)",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      Status is required.
                    </div>
                  )}
                </div>
                <div>
                  <label
                    style={{
                      color: "var(--color-mm-gray)",
                      fontWeight: 600,
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Priority*
                  </label>
                  <select
                    value={newProjectForm.priority}
                    onChange={(e) => {
                      setNewProjectForm({
                        ...newProjectForm,
                        priority: e.target.value,
                      });
                      setNewProjectErrors((prev) => ({
                        ...prev,
                        priority: false,
                      }));
                    }}
                    style={{
                      background: "white",
                      border: newProjectErrors.priority
                        ? "1px solid var(--color-mm-red)"
                        : "1px solid var(--color-mm-border)",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      color: "var(--color-mm-dark)",
                      width: "100%",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      if (!newProjectErrors.priority)
                        e.target.style.borderColor = "var(--color-mm-orange)";
                    }}
                    onBlur={(e) => {
                      if (!newProjectErrors.priority)
                        e.target.style.borderColor = "var(--color-mm-border)";
                    }}
                  >
                    <option value="" disabled>
                      Select priority
                    </option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  {newProjectErrors.priority && (
                    <div
                      style={{
                        color: "var(--color-mm-red)",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      Priority is required.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label
                  style={{
                    color: "var(--color-mm-gray)",
                    fontWeight: 600,
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the project scope..."
                  value={newProjectForm.description}
                  onChange={(e) =>
                    setNewProjectForm({
                      ...newProjectForm,
                      description: e.target.value,
                    })
                  }
                  style={{
                    background: "white",
                    border: "1px solid var(--color-mm-border)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    color: "var(--color-mm-dark)",
                    width: "100%",
                    outline: "none",
                    resize: "vertical",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--color-mm-orange)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--color-mm-border)")
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    color: "var(--color-mm-gray)",
                    fontWeight: 600,
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Add additional project notes..."
                  value={newProjectForm.notes}
                  onChange={(e) =>
                    setNewProjectForm({
                      ...newProjectForm,
                      notes: e.target.value,
                    })
                  }
                  style={{
                    background: "white",
                    border: "1px solid var(--color-mm-border)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    color: "var(--color-mm-dark)",
                    width: "100%",
                    outline: "none",
                    resize: "vertical",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--color-mm-orange)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--color-mm-border)")
                  }
                />
              </div>
            </div>

            <div
              className="mt-6 pt-4 flex justify-end gap-3"
              style={{ borderTop: "1px solid var(--color-mm-border)" }}
            >
              <button
                onClick={() => setIsNewProjectOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity cursor-pointer"
                style={{
                  background: "white",
                  border: "1px solid var(--color-mm-border)",
                  color: "var(--color-mm-gray)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubmit}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                style={{ background: "var(--color-mm-orange)", color: "white" }}
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete &&
        (() => {
          const biz =
            typeof confirmDelete.businessId === "object" &&
            confirmDelete.businessId !== null
              ? confirmDelete.businessId
              : businesses.find((b) => b.id === confirmDelete.businessId);
          const client = biz?.businessName || "No business";
          return (
            <div
              className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200"
              style={{ background: "rgba(0,0,0,0.3)" }}
            >
              <div
                className="w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-2xl"
                style={{
                  background: "white",
                  border: "1px solid var(--color-mm-border)",
                }}
              >
                <h3
                  className="font-bold text-lg"
                  style={{ color: "var(--color-mm-dark)" }}
                >
                  Delete Project?
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-mm-gray)" }}
                >
                  Are you sure you want to delete project{" "}
                  <strong>"{confirmDelete.id}"</strong> for client{" "}
                  <strong>{client}</strong>? This action is permanent.
                </p>
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold border border-mm-border hover:bg-mm-subtle cursor-pointer"
                    style={{
                      background: "white",
                      color: "var(--color-mm-gray)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(confirmDelete)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-95 text-white cursor-pointer"
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
        <div
          className="fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-lg transition-all animate-in slide-in-from-bottom-5"
          style={{
            background: "rgba(92, 177, 62, 0.1)",
            border: "1px solid var(--color-mm-green)",
            color: "var(--color-mm-green)",
            fontWeight: 600,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

// FlowSection removed
