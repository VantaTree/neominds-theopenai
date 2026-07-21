import { useState, useEffect, useRef } from "react";
import {
  ListTodo,
  CheckCircle2,
  Lock,
  Check,
  Filter,
  Calendar,
  ChevronRight,
  ArrowLeft,
  MessageSquare,
  Globe,
  Megaphone,
  Zap,
  Sparkles,
  AlertCircle,
  Eye,
  X,
  Activity,
  FileEdit,
  History as HistoryIcon,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Link } from "@tanstack/react-router";
import ProjectLogo from "./ProjectLogo";
import Report from "../Report";
import PlanGate, { hasPlanAccess } from "./PlanGate";
import { useBusiness } from "@/hooks/use-business";
import { type Project } from "@/lib/schemas";

interface ProjectDashboardProps {
  projects: Project[];
  activeProjectId?: string;
  onActiveProjectChange?: (id: string) => void;
  onUpgradeTrigger?: () => void;
  apiUrl?: string;
  initialReportData?: any;
}

const TABS = [
  { id: "report", name: "Report", category: "report" },
  { id: "Website", name: "Website", category: "seo" },
  { id: "Marketing", name: "Marketing", category: "marketing" },
  { id: "Automation", name: "Automation", category: "automation" },
] as const;

const CATEGORY_THEMES = {
  report: {
    primary: "#FF5924",
    badgeClass: "bg-mm-orange/10 text-mm-orange border border-mm-orange/20",
    iconBoxClass: "bg-mm-orange/10 border border-mm-orange/20 text-mm-orange",
    textAccentClass: "text-mm-orange",
    gradient: "linear-gradient(90deg, #FF5924 0%, #FF8A65 100%)",
  },
  seo: {
    primary: "#2563EB",
    badgeClass: "bg-blue-50 text-blue-600 border border-blue-100",
    iconBoxClass: "bg-blue-50 border border-blue-100 text-blue-600",
    textAccentClass: "text-blue-600",
    gradient: "linear-gradient(90deg, #2563EB 0%, #60A5FA 100%)",
  },
  marketing: {
    primary: "#DC2626",
    badgeClass: "bg-red-50 text-red-600 border border-red-100",
    iconBoxClass: "bg-red-50 border border-red-100 text-red-600",
    textAccentClass: "text-red-500",
    gradient: "linear-gradient(90deg, #DC2626 0%, #F87171 100%)",
  },
  automation: {
    primary: "#7C3AED",
    badgeClass: "bg-purple-50 text-purple-600 border border-purple-100",
    iconBoxClass: "bg-purple-50 border border-purple-100 text-purple-600",
    textAccentClass: "text-purple-600",
    gradient: "linear-gradient(90deg, #7C3AED 0%, #A78BFA 100%)",
  },
} as const;

const parseDate = (d: any): Date | null => {
  if (!d) return null;
  if (d instanceof Date) return d;
  if (typeof d === "string") return new Date(d);
  if (typeof d.toDate === "function") return d.toDate();
  if (typeof d.seconds === "number") return new Date(d.seconds * 1000);
  return null;
};

export function ProjectDashboard({
  projects = [],
  activeProjectId = "report",
  onActiveProjectChange,
  onUpgradeTrigger,
  initialReportData,
}: ProjectDashboardProps) {
  const { activeBusiness } = useBusiness();
  const activeTab = activeProjectId;

  // Selected project state for sliding details drawer
  const [activeDrawerProject, setActiveDrawerProject] = useState<Project | null>(null);

  const drawerProjectDomain = activeDrawerProject?.domain;
  const drawerProjectThemeKey =
    drawerProjectDomain === "Website"
      ? "seo"
      : drawerProjectDomain === "Marketing"
        ? "marketing"
        : drawerProjectDomain === "Automation"
          ? "automation"
          : "report";
  const drawerProjectTheme = CATEGORY_THEMES[drawerProjectThemeKey];

  // Filters state
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<string>("All Time");
  const [projectTab, setProjectTab] = useState<"Active" | "Requests" | "Drafts" | "History">("Active");

  const domainProjects = projects.filter((p) => p.domain === activeTab);

  // Extract unique services from projects in current tab for filter pills
  const allServices = Array.from(
    new Set(domainProjects.flatMap((p) => p.services || []))
  );

  // Reset local filters, drawer, and builder when tab changes
  useEffect(() => {
    setPriorityFilter("All");
    setSelectedServices([]);
    setDateFilter("All Time");
    setActiveDrawerProject(null);
    setProjectTab("Active");
  }, [activeTab]);

  // Date range checking helpers
  const matchesDateFilter = (project: Project) => {
    if (dateFilter === "All Time") return true;
    const deadline = parseDate(project.deadline);
    if (!deadline) return false;

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59);

    if (dateFilter === "Overdue") {
      return deadline < now && project.status !== "Completed";
    }
    if (dateFilter === "This Month") {
      return deadline >= startOfThisMonth && deadline <= endOfThisMonth;
    }
    if (dateFilter === "Next Month") {
      return deadline >= startOfNextMonth && deadline <= endOfNextMonth;
    }
    return true;
  };

  // Filter projects list
  const filteredProjects = domainProjects.filter((project) => {
    if (priorityFilter !== "All" && project.priority !== priorityFilter) return false;
    if (selectedServices.length > 0) {
      const matchesAll = selectedServices.every((service) =>
        project.services.includes(service)
      );
      if (!matchesAll) return false;
    }
    if (!matchesDateFilter(project)) return false;
    return true;
  });

  // Sort projects chronologically for timeline view
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const dateA = parseDate(a.startDate || a.createdAt)?.getTime() || 0;
    const dateB = parseDate(b.startDate || b.createdAt)?.getTime() || 0;
    return dateA - dateB;
  });

  const themeKey =
    ({
      report: "report",
      Website: "seo",
      Marketing: "marketing",
      Automation: "automation",
    }[activeTab] || "seo") as keyof typeof CATEGORY_THEMES;
  const theme = CATEGORY_THEMES[themeKey];

  // Map category to logo category
  const getLogoCategory = (tab: string) => {
    if (tab === "Website") return "seo";
    if (tab === "Marketing") return "marketing";
    if (tab === "Automation") return "automation";
    return "report";
  };

  // Calculate overall metrics
  const activeProjectsCount = domainProjects.filter(
    (p) => p.status === "In Progress" || p.status === "Pending" || p.status === "On Hold"
  ).length;
  const completedProjectsCount = domainProjects.filter(
    (p) => p.status === "Completed"
  ).length;
  const inProgressProjectsCount = domainProjects.filter(
    (p) => p.status === "In Progress"
  ).length;
  const progressEligibleProjects = domainProjects.filter(
    (p) => p.status !== "User Draft" && p.status !== "Requested"
  );
  const overallProgressVal = progressEligibleProjects.length > 0
    ? Math.round(progressEligibleProjects.reduce((sum, p) => sum + p.progress, 0) / progressEligibleProjects.length)
    : 0;

  // Resolve overall status badge for category
  const getOverallStatus = () => {
    if (filteredProjects.length === 0) return "NO PROJECTS";
    if (filteredProjects.some((p) => p.status === "In Progress")) return "IN PROGRESS";
    if (filteredProjects.every((p) => p.status === "Completed")) return "COMPLETED";
    return filteredProjects[0].status.toUpperCase();
  };

  const renderTabSwitcher = () => (
    <div className="flex border-b border-[#E2E6EE] gap-6 pb-px overflow-x-auto no-scrollbar w-full">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const isTabLocked =
          tab.id === "Automation" &&
          !hasPlanAccess(activeBusiness?.plan || "None", "Pro");
        return (
          <button
            key={tab.id}
            onClick={() => onActiveProjectChange?.(tab.id)}
            className={`pb-3 text-sm font-semibold transition-all border-b-2 hover:text-mm-dark cursor-pointer flex items-center gap-2 shrink-0 -mb-px ${
              isActive
                ? `${tab.category === "report" ? "border-mm-orange text-mm-orange" : tab.category === "seo" ? "border-blue-600 text-blue-600" : tab.category === "marketing" ? "border-red-600 text-red-600" : "border-purple-600 text-purple-600"}`
                : "border-transparent text-mm-gray"
            }`}
          >
            <span>{tab.name}</span>
            {isTabLocked && <Lock className="w-3.5 h-3.5 text-mm-gray/60" />}
          </button>
        );
      })}
    </div>
  );

  const planGateFallback = (
    <div className="bg-white border border-mm-border rounded-[32px] p-8 md:p-12 text-center max-w-2xl mx-auto shadow-sm flex flex-col items-center justify-center relative overflow-hidden min-h-[450px]">
      <div className="absolute inset-0 bg-linear-to-tr from-purple-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
      <div className="h-20 w-20 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-6 shadow-md">
        <Lock className="h-8 w-8 text-purple-600 animate-pulse" />
      </div>

      <h3 className="text-2xl font-black text-mm-dark mb-3">Automation Suite is Locked</h3>
      <p className="text-sm text-mm-gray leading-relaxed max-w-md mb-8">
        Unlock custom webhook triggers, CRM synchronization, lead-routing rules, and automated workflows. Elevate your operations to the Pro tier today.
      </p>

      <button
        onClick={onUpgradeTrigger}
        className="inline-flex items-center justify-center gap-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-extrabold text-sm px-8 py-4 rounded-2xl shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
      >
        <Sparkles className="h-4.5 w-4.5 fill-white text-purple-600" />
        Upgrade to Pro Plan
      </button>
    </div>
  );

  const emptyState = (
    <div className="bg-white border border-mm-border rounded-[32px] p-8 md:p-12 text-center max-w-2xl mx-auto shadow-sm flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />
      <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-6 border ${theme.badgeClass}`}>
        {activeTab === "Website" ? (
          <Globe className="h-7 w-7" />
        ) : activeTab === "Marketing" ? (
          <Megaphone className="h-7 w-7" />
        ) : (
          <Zap className="h-7 w-7" />
        )}
      </div>

      <h3 className="text-xl font-bold text-mm-dark mb-2">No Active {activeTab} Projects</h3>
      <p className="text-xs sm:text-sm text-mm-gray leading-relaxed max-w-sm mb-6">
        Ready to take your digital experience to the next level? Connect with our team to start a new campaign, audit, or development project.
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          to="/chat/$domain"
          params={{ domain: activeTab.toLowerCase() }}
          className={`inline-flex items-center justify-center gap-2 font-extrabold text-xs px-6 py-3 rounded-xl transition-all active:scale-95 shadow-sm border ${
            activeTab === "Website"
              ? "bg-blue-500 hover:bg-blue-600 border-blue-600 text-white"
              : activeTab === "Marketing"
                ? "bg-red-500 hover:bg-red-600 border-red-600 text-white"
                : "bg-purple-500 hover:bg-purple-600 border-purple-600 text-white"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Start a Conversation
        </Link>
        
        {activeTab === "Website" && (
          <Link
            to="/add/website"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-blue-50/50 border border-blue-200 text-blue-600 font-extrabold text-xs px-6 py-3 rounded-xl transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            Describe Your Website
          </Link>
        )}
      </div>
    </div>
  );

  const renderFilterBar = () => (
    <div className="bg-white border border-[#E2E6EE] rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4 text-xs">
        {/* Priority Select */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 shrink-0">
          <span className="font-semibold text-mm-gray">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-transparent font-bold text-mm-dark outline-none cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 shrink-0">
          <span className="font-semibold text-mm-gray">Timeline:</span>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-transparent font-bold text-mm-dark outline-none cursor-pointer"
          >
            <option value="All Time">All Time</option>
            <option value="Overdue">Overdue</option>
            <option value="This Month">This Month</option>
            <option value="Next Month">Next Month</option>
          </select>
        </div>
      </div>

      {/* Services Multi-Select Pills */}
      {allServices.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-100">
          <span className="text-[10px] font-bold text-mm-gray uppercase tracking-wider">Filter by Services</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {allServices.map((service) => {
              const isSelected = selectedServices.includes(service);
              return (
                <button
                  key={service}
                  onClick={() => {
                    setSelectedServices((prev) =>
                      prev.includes(service)
                        ? prev.filter((s) => s !== service)
                        : [...prev, service]
                    );
                  }}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-mm-dark text-white border-mm-dark"
                      : "bg-white text-mm-gray border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {service}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderProjectsTimeline = (projectsList: Project[]) => {
    const sorted = [...projectsList].sort((a, b) => {
      const dateA = parseDate(a.startDate || a.createdAt)?.getTime() || 0;
      const dateB = parseDate(b.startDate || b.createdAt)?.getTime() || 0;
      return dateA - dateB;
    });

    return (
      <div className="relative pl-12 space-y-8 py-2 pt-4">
        {/* Left timeline connecting track */}
        <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-gray-100 rounded-full" />

        {sorted.map((project) => {
          const isCompleted = project.status === "Completed";
          const isInProgress = project.status === "In Progress";

          const startDate = parseDate(project.startDate);
          const deadline = parseDate(project.deadline);

          const dateStr =
            startDate && deadline
              ? `${startDate.toLocaleDateString("en-US", { month: "short", day: "2-digit" })} - ${deadline.toLocaleDateString("en-US", { month: "short", day: "2-digit" })}`
              : "";

          const projectDomain = project.domain;
          const projectThemeKey =
            projectDomain === "Website"
              ? "seo"
              : projectDomain === "Marketing"
                ? "marketing"
                : projectDomain === "Automation"
                  ? "automation"
                  : "report";
          const projectTheme = CATEGORY_THEMES[projectThemeKey];

          return (
            <div key={project.id} className="relative flex items-start gap-4">
              {/* Left indicator node */}
              <div className="absolute left-[-48px] top-1.5 flex items-center justify-center z-10">
                {isCompleted ? (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-green-500 border-2 border-white shadow-xs">
                    <Check className="w-4 h-4 stroke-3" />
                  </div>
                ) : isInProgress ? (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-xs shrink-0 relative"
                    style={{ backgroundColor: `${projectTheme.primary}1A` }}
                  >
                    <div
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{ backgroundColor: `${projectTheme.primary}26` }}
                    />
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: projectTheme.primary }}
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border-2 border-white shadow-xs">
                    <div className="w-3 h-3 rounded-full border-2 border-gray-300 bg-white" />
                  </div>
                )}
              </div>

              {/* Task item card container */}
              <div
                style={{ "--hover-color": projectTheme.primary } as React.CSSProperties}
                className="cursor-pointer flex-1 flex flex-col lg:flex-row gap-6 bg-white p-4 sm:p-5 rounded-2xl border border-mm-border hover:border-(--hover-color) hover:shadow-[0_6px_20px_rgba(0,0,0,0.035)] hover:-translate-y-0.5 transition-all duration-300 group"
                onClick={() => setActiveDrawerProject(project)}
              >
                {/* Main Info */}
                <div
                  className="flex-1 text-left flex flex-col justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {dateStr && (
                        <span className="text-[10px] font-black text-mm-gray tracking-wider uppercase bg-gray-100 px-2.5 py-0.5 rounded-md">
                          {dateStr}
                        </span>
                      )}
                      <span
                        className={`text-[9px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-md ${
                          isCompleted
                            ? "bg-green-50 text-green-600 border border-green-100"
                            : isInProgress
                              ? `${projectTheme.badgeClass} animate-pulse`
                              : "bg-gray-50 text-gray-500 border border-gray-100"
                        }`}
                      >
                        {isInProgress ? "Current Task" : project.status}
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-mm-dark group-hover:text-(--hover-color) transition-colors duration-300">
                      {project.name}
                    </h4>

                    <p className="text-xs text-mm-gray mt-1.5 max-w-2xl leading-relaxed">
                      {project.description || "No project description provided."}
                    </p>
                  </div>

                  {isInProgress && (
                    <div className="mt-4 max-w-md space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] text-mm-gray">
                        <span>Progress</span>
                        <span className="font-bold" style={{ color: projectTheme.primary }}>
                          {project.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${project.progress}%`,
                            backgroundColor: projectTheme.primary,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right part: Scrollable activity log (Desktop only) */}
                <div className="hidden lg:block lg:w-80 shrink-0 border-l border-mm-border/80 pl-6 self-stretch">
                  <span className="text-[10px] font-extrabold text-mm-gray uppercase tracking-wider block mb-2.5">
                    Activity Log
                  </span>
                  {project.updates && project.updates.length > 0 ? (
                    <div className="space-y-3 overflow-y-auto max-h-[110px] pr-1.5 scrollbar-none">
                      {project.updates.map((update, idx) => {
                        const uDate = parseDate(update.timestamp);
                        return (
                          <div key={idx} className="border-l border-gray-200 pl-3 py-0.5 relative">
                            <div className="absolute left-[-4.5px] top-1.5 h-2 w-2 rounded-full bg-gray-300" />
                            <div className="flex justify-between items-baseline mb-0.5">
                              <span className="text-[10px] font-bold text-mm-dark">
                                {update.designation || "System Update"}
                              </span>
                              {uDate && (
                                <span className="text-[9px] text-mm-gray/80">
                                  {uDate.toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-mm-gray leading-normal line-clamp-2">
                              {update.message}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-[100px] flex items-center justify-center bg-gray-50/50 border border-dashed border-gray-200/80 rounded-xl px-4 text-center">
                      <p className="text-[11px] text-mm-gray/80 italic">No recent activity logged</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderProjectsContent = () => {
    const subTabs = [
      {
        id: "Active",
        label: "Active",
        count: filteredProjects.filter(
          (p) => p.status === "In Progress" || p.status === "Pending" || p.status === "On Hold"
        ).length,
      },
      {
        id: "Requests",
        label: "Requests",
        count: filteredProjects.filter((p) => p.status === "Requested").length,
      },
      {
        id: "Drafts",
        label: "Drafts",
        count: filteredProjects.filter((p) => p.status === "User Draft").length,
      },
      {
        id: "History",
        label: "History",
        count: filteredProjects.filter(
          (p) => p.status === "Completed" || p.status === "Cancelled"
        ).length,
      },
    ] as const;

    const currentTabProjects = (() => {
      if (projectTab === "Active") {
        return filteredProjects.filter(
          (p) => p.status === "In Progress" || p.status === "Pending" || p.status === "On Hold"
        );
      }
      if (projectTab === "Requests") {
        return filteredProjects.filter((p) => p.status === "Requested");
      }
      if (projectTab === "Drafts") {
        return filteredProjects.filter((p) => p.status === "User Draft");
      }
      return filteredProjects.filter(
        (p) => p.status === "Completed" || p.status === "Cancelled"
      );
    })();

    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Header Title with Status */}
        <div className="flex items-center gap-4">
          <ProjectLogo category={getLogoCategory(activeTab)} size="md" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#111418] font-sans">
              {activeTab}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide border ${theme.badgeClass}`}>
                {getOverallStatus()}
              </span>
            </div>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Active Projects Card */}
          <div className="bg-white border border-[#E2E6EE] rounded-[24px] p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-all duration-300">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-mm-gray uppercase tracking-wider">Active Projects</p>
              <h4 className="text-3xl font-black text-mm-dark">{activeProjectsCount}</h4>
            </div>
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center bg-blue-50 border border-blue-100 text-blue-600`}>
              <ListTodo className="w-5.5 h-5.5" />
            </div>
          </div>

          {/* Completed Projects Card */}
          <div className="bg-white border border-[#E2E6EE] rounded-[24px] p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-all duration-300">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-mm-gray uppercase tracking-wider">Completed</p>
              <h4 className="text-3xl font-black text-mm-dark">{completedProjectsCount}</h4>
            </div>
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center bg-green-50 border border-green-100 text-green-600`}>
              <CheckCircle2 className="w-5.5 h-5.5" />
            </div>
          </div>

          {/* In Progress Projects Card */}
          <div className="bg-white border border-[#E2E6EE] rounded-[24px] p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-all duration-300">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-mm-gray uppercase tracking-wider">In Progress</p>
              <h4 className="text-3xl font-black text-mm-dark">{inProgressProjectsCount}</h4>
            </div>
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center bg-orange-50 border border-orange-100 text-orange-600`}>
              <Activity className="w-5.5 h-5.5 animate-pulse" />
            </div>
          </div>

          {/* Overall Progress Card */}
          <div className="bg-white border border-[#E2E6EE] rounded-[24px] p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-all duration-300">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-mm-gray uppercase tracking-wider">Overall Progress</p>
              <h4 className="text-3xl font-black text-mm-dark">{overallProgressVal}%</h4>
            </div>
            <div className="relative w-14 h-14 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Progress", value: overallProgressVal },
                      { name: "Remaining", value: 100 - overallProgressVal },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={18}
                    outerRadius={24}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    <Cell fill={theme.primary} stroke="none" />
                    <Cell fill="#E2E6EE" stroke="none" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[9px] font-black text-mm-dark">
                  {overallProgressVal}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter controls */}
        {renderFilterBar()}

        {/* Project Tabs & Content Panel */}
        <div className="bg-white border border-mm-border rounded-[32px] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col gap-4">
            <h5 className="font-extrabold text-xs uppercase tracking-wider text-mm-gray flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-mm-gray" />
              Project Hub
            </h5>

            {/* Sub Tabs Switcher */}
            <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
              {subTabs.map((tab) => {
                const isSubActive = projectTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setProjectTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer active:scale-95 border ${
                      isSubActive
                        ? `bg-mm-dark text-white border-mm-dark shadow-xs`
                        : `bg-white text-mm-gray border-gray-200 hover:border-gray-300 hover:text-mm-dark`
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                        isSubActive
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-mm-gray"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Contents */}
          {currentTabProjects.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 border border-gray-100 border-dashed rounded-2xl">
              <p className="text-sm text-mm-gray italic">No {projectTab.toLowerCase()} projects found with the current filters.</p>
            </div>
          ) : (
            renderProjectsTimeline(currentTabProjects)
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-8 relative">
      {renderTabSwitcher()}

      {activeTab === "Website" && (
        <div className="flex items-center justify-between bg-white py-2 px-1 -mt-8 mb-4 w-full gap-2 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 min-w-0">
            <span className="hidden sm:inline-block h-2 w-2 rounded-full bg-blue-500 shrink-0" />
            <span className="text-[10px] sm:text-xs md:text-sm font-bold text-mm-dark truncate">
              Customize your website brief and structure
            </span>
          </div>
          <Link
            to="/add/website"
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[9px] sm:text-xs px-3 py-1.5 sm:px-5 sm:py-2 rounded-full transition-all active:scale-95 shadow-sm border border-blue-600 cursor-pointer shrink-0 text-center"
          >
            Describe Your Website
          </Link>
        </div>
      )}

      {activeTab === "report" && <Report initialData={initialReportData} businessId={activeBusiness?.id} />}

      {activeTab === "Automation" && (
        <PlanGate requiredPlan="Pro" fallback={planGateFallback}>
          {domainProjects.length === 0 ? emptyState : renderProjectsContent()}
        </PlanGate>
      )}

      {activeTab !== "report" && activeTab !== "Automation" && activeTab !== "Website" && (
        domainProjects.length === 0 ? emptyState : renderProjectsContent()
      )}

      {activeTab === "Website" && (
        domainProjects.length === 0 ? emptyState : renderProjectsContent()
      )}

      {/* Sliding Details Drawer overlay */}
      {activeDrawerProject && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/35 backdrop-blur-[1px] z-40 transition-opacity animate-in fade-in duration-300"
            onClick={() => setActiveDrawerProject(null)}
          />

          {/* Aside Drawer */}
          <aside
            className="fixed top-0 right-0 h-full w-full sm:w-[460px] bg-white border-l border-mm-border shadow-2xl z-50 flex flex-col transition-transform duration-300 translate-x-0 animate-in slide-in-from-right"
          >
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded bg-gray-50 border border-gray-100 text-mm-gray">
                  Task Details
                </span>
              </div>
              <button
                onClick={() => setActiveDrawerProject(null)}
                className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Project Title & Status */}
              <div className="space-y-2.5">
                <h3 className="text-lg font-bold text-mm-dark leading-tight">
                  {activeDrawerProject.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[9px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                      activeDrawerProject.status === "Completed"
                        ? "bg-green-50 text-green-600 border border-green-100"
                        : activeDrawerProject.status === "In Progress"
                          ? drawerProjectTheme.badgeClass
                          : "bg-gray-50 text-gray-500 border border-gray-100"
                    }`}
                  >
                    {activeDrawerProject.status}
                  </span>
                  <span className="text-[9px] font-bold text-mm-gray bg-gray-100 rounded-full px-2.5 py-0.5 uppercase tracking-wider">
                    {activeDrawerProject.priority} Priority
                  </span>
                </div>
              </div>

              {/* Date & Assignee info */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50/70 border border-gray-100 rounded-2xl p-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-mm-gray uppercase tracking-wider block">Timeline</span>
                  <span className="font-bold text-mm-dark">
                    {(() => {
                      const start = parseDate(activeDrawerProject.startDate);
                      const due = parseDate(activeDrawerProject.deadline);
                      return start && due
                        ? `${start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${due.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                        : "Not scheduled";
                    })()}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-mm-gray uppercase tracking-wider block">Assignee</span>
                  <span className="font-bold text-mm-dark">{activeDrawerProject.assignee}</span>
                </div>
              </div>

              {/* Project brief */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-mm-gray uppercase tracking-wider block">Project Brief</span>
                <p className="text-xs sm:text-sm text-mm-dark leading-relaxed">
                  {activeDrawerProject.description || "No project brief provided."}
                </p>
              </div>

              {/* Services rendered as Tags */}
              {activeDrawerProject.services && activeDrawerProject.services.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-mm-gray uppercase tracking-wider block">Services / Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeDrawerProject.services.map((service, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold px-2.5 py-1 bg-white border border-gray-200 text-mm-gray rounded-lg"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity / Updates Feed */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <span className="text-[10px] font-bold text-mm-gray uppercase tracking-wider block">Activity Log</span>
                <div className="space-y-4">
                  {activeDrawerProject.updates && activeDrawerProject.updates.length > 0 ? (
                    activeDrawerProject.updates.map((update, idx) => {
                      const uDate = parseDate(update.timestamp);
                      return (
                        <div key={idx} className="border-l-2 border-gray-200 pl-4 py-1 relative">
                          <div className="absolute left-[-5px] top-2.5 h-2 w-2 rounded-full bg-gray-300" />
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="text-[10px] font-bold text-mm-dark">
                              {update.designation || "System Update"}
                            </span>
                            {uDate && (
                              <span className="text-[9px] text-mm-gray">
                                {uDate.toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-mm-gray leading-relaxed">
                            {update.message}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 bg-gray-50 border border-gray-100 border-dashed rounded-2xl">
                      <p className="text-xs text-mm-gray italic">No activity updates logged yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
