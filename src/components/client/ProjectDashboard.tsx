import { useState, useEffect, useRef } from "react";
import { ListTodo, CheckCircle2, Lock, Check } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import ProjectLogo from "./ProjectLogo";
import Report from "../Report";

interface TimelineTask {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "upcoming";
  progress?: number;
  startDate: string;
  endDate: string;
}

interface ProjectData {
  id: string;
  name: string;
  category: "seo" | "marketing" | "automation" | "report";
  progress: number;
  tasks: TimelineTask[];
  locked?: boolean;
}

const DUMMY_PROJECTS: ProjectData[] = [
  {
    id: "report",
    name: "Report",
    category: "report",
    progress: 100,
    tasks: [],
  },
  {
    id: "seo",
    name: "Website",
    category: "seo",
    progress: 87,
    tasks: [
      {
        id: "seo-1",
        title: "Run Initial Keyword Research & Audit",
        description: "Identify high-value search terms and technical issues.",
        status: "completed",
        startDate: "Jun 20",
        endDate: "Jun 23",
      },
      {
        id: "seo-2",
        title: "Optimize Meta Tags & Header Hierarchy",
        description: "Align headers and meta titles with keyword strategy.",
        status: "completed",
        startDate: "Jun 24",
        endDate: "Jun 27",
      },
      {
        id: "seo-3",
        title: "Submit XML Sitemap to Search Console",
        description: "Ensure search engine crawlers can discover new pages.",
        status: "completed",
        startDate: "Jun 28",
        endDate: "Jun 30",
      },
      {
        id: "seo-4",
        title: "Set Up Image Alt Attributes & Internal Links",
        description: "Optimize media and map contextual links.",
        status: "completed",
        startDate: "Jul 01",
        endDate: "Jul 04",
      },
      {
        id: "seo-5",
        title: "On-Page SEO Optimization",
        description: "Optimizing meta tags, copy readability, and keyword density.",
        status: "in-progress",
        progress: 49,
        startDate: "Jul 05",
        endDate: "Jul 12",
      },
      {
        id: "seo-6",
        title: "Technical SEO",
        description: "Site speed and mobile usability performance audit.",
        status: "upcoming",
        progress: 30,
        startDate: "Jul 13",
        endDate: "Jul 18",
      },
      {
        id: "seo-7",
        title: "HTML Structure",
        description: "Validate sitemap.xml and markup validation.",
        status: "upcoming",
        progress: 90,
        startDate: "Jul 19",
        endDate: "Jul 25",
      },
    ],
  },
  {
    id: "marketing",
    name: "Marketing",
    category: "marketing",
    progress: 60,
    tasks: [
      {
        id: "mkt-1",
        title: "Define Target Customer Demographics",
        description: "Outline personas, purchasing habits, and behaviors.",
        status: "completed",
        startDate: "Jun 22",
        endDate: "Jun 25",
      },
      {
        id: "mkt-2",
        title: "Design Social Media Ad Creatives",
        description: "Produce visual assets for target platform placement.",
        status: "completed",
        startDate: "Jun 26",
        endDate: "Jun 29",
      },
      {
        id: "mkt-3",
        title: "Social Media Campaign",
        description: "Running paid promotion and organic reach campaigns.",
        status: "in-progress",
        progress: 40,
        startDate: "Jun 30",
        endDate: "Jul 10",
      },
      {
        id: "mkt-4",
        title: "Content Calendar",
        description: "Plan scheduled post drafts and channel distribution strategies.",
        status: "upcoming",
        progress: 70,
        startDate: "Jul 11",
        endDate: "Jul 15",
      },
      {
        id: "mkt-5",
        title: "Newsletter Template Blast",
        description: "Establish weekly engagement layout structures.",
        status: "upcoming",
        progress: 20,
        startDate: "Jul 16",
        endDate: "Jul 20",
      },
    ],
  },
  {
    id: "automation",
    name: "Automation",
    category: "automation",
    progress: 0,
    locked: true,
    tasks: [
      {
        id: "auto-1",
        title: "Custom Webhook Trigger",
        description: "Send outbound lead hooks to external APIs on conversion.",
        status: "in-progress",
        progress: 0,
        startDate: "Jul 10",
        endDate: "Jul 20",
      },
      {
        id: "auto-2",
        title: "CRM Synchronize",
        description: "Synchronize new lead data channels across standard CRMs.",
        status: "upcoming",
        progress: 0,
        startDate: "Jul 21",
        endDate: "Jul 30",
      },
    ],
  },
];

interface ProjectDashboardProps {
  apiUrl?: string;
  activeProjectId?: string;
  onActiveProjectChange?: (id: string) => void;
  onUpgradeTrigger?: () => void;
}

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
};

export function ProjectDashboard({
  apiUrl,
  activeProjectId = "seo",
  onActiveProjectChange,
  onUpgradeTrigger,
}: ProjectDashboardProps) {
  const [projects, setProjects] = useState<ProjectData[]>(DUMMY_PROJECTS);
  const [scrollPercent, setScrollPercent] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Fetch from apiUrl if provided (otherwise fall back to DUMMY_PROJECTS)
  useEffect(() => {
    if (!apiUrl) return;

    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch projects from apiUrl, falling back to dummy data:", err);
      });
  }, [apiUrl]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];
  const theme = CATEGORY_THEMES[activeProject.category] || CATEGORY_THEMES.seo;

  // Setup Recharts Donut data
  const chartData = [
    { name: "Completed", value: activeProject.progress },
    { name: "Remaining", value: 100 - activeProject.progress },
  ];

  // Track scroll-linked timeline filling progress
  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Use center of screen as scroll trigger point
      const triggerPoint = viewportHeight / 2;
      const timelineTop = rect.top;
      const timelineHeight = rect.height;

      const relativeTrigger = triggerPoint - timelineTop - 48; // offset header/padding
      const totalScrollableHeight = timelineHeight - 96; // padding/margin adjustments

      let pct = (relativeTrigger / totalScrollableHeight) * 100;
      pct = Math.max(0, Math.min(100, pct));
      setScrollPercent(pct);
    };

    window.addEventListener("scroll", handleScroll);
    // Trigger initial calculation
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeProjectId]);

  return (
    <div className="w-full flex flex-col gap-8 select-none">
      {/* Project Switcher Tabs */}
      <div className="flex border-b border-[#E2E6EE] gap-6 pb-px">
        {projects.map((project) => {
          const isActive = project.id === activeProject.id;
          const config = {
            report: {
              activeBorder: "border-mm-orange",
              activeText: "text-mm-orange",
            },
            seo: {
              activeBorder: "border-blue-600",
              activeText: "text-blue-600",
            },
            marketing: {
              activeBorder: "border-red-600",
              activeText: "text-red-600",
            },
            automation: {
              activeBorder: "border-purple-600",
              activeText: "text-purple-600",
            },
          }[project.category];

          return (
            <button
              key={project.id}
              onClick={() => {
                onActiveProjectChange?.(project.id);
                if (project.locked) {
                  onUpgradeTrigger?.();
                }
              }}
              className={`pb-3 text-sm font-semibold transition-all border-b-2 hover:text-mm-dark cursor-pointer flex items-center gap-2 -mb-px ${
                isActive
                  ? `${config.activeBorder} ${config.activeText}`
                  : "border-transparent text-mm-gray"
              }`}
            >
              <span>{project.name}</span>
              {project.locked && <Lock className="w-3.5 h-3.5 text-mm-gray/60" />}
            </button>
          );
        })}
      </div>

      {/* Title and Badge Header */}
      {activeProject.category !== "report" && (
        <div className="flex items-center gap-3.5">
          <ProjectLogo category={activeProject.category} size="md" />
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111418] font-sans">
              {activeProject.name}
            </h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${theme.badgeClass}`}>
              {activeProject.locked ? "locked" : "in progress"}
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative w-full">
        {activeProject.category === "report" ? (
          <Report apiUrl={apiUrl} />
        ) : (
          <>
            {/* KPI Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* Total Tasks Card */}
          <div className="bg-white border border-[#E2E6EE] rounded-3xl p-6 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-sm font-semibold text-[#748297] mb-1">Total Tasks</p>
              <h4 className="text-3xl font-extrabold text-[#111418]">
                {activeProject.tasks.length}
              </h4>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme.iconBoxClass}`}>
              <ListTodo className="w-6 h-6" />
            </div>
          </div>

          {/* Overall Progress Card */}
          <div className="bg-white border border-[#E2E6EE] rounded-3xl p-6 flex items-center justify-between shadow-xs min-h-[120px]">
            <div>
              <p className="text-sm font-semibold text-[#748297] mb-1">Overall Progress</p>
              <h4 className="text-3xl font-extrabold text-[#111418]">{activeProject.progress}%</h4>
            </div>
            {/* Donut Chart using Recharts */}
            <div className="relative w-20 h-20 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={24}
                    outerRadius={32}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    <Cell fill={theme.primary} stroke="none" />
                    <Cell fill="#E5E7EB" stroke="none" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] font-extrabold text-[#111418]">
                  {activeProject.progress}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Vertical Timeline Card */}
        <div
          ref={timelineRef}
          className="bg-white border border-[#E2E6EE] rounded-3xl p-6 md:p-8 shadow-xs relative"
        >
          <div className="flex items-center gap-2 mb-8">
            <CheckCircle2 className={`w-5 h-5 ${theme.textAccentClass}`} />
            <h5 className={`font-bold text-sm uppercase tracking-wider ${theme.textAccentClass}`}>
              Project Timeline
            </h5>
          </div>

          <div className="relative pl-8 md:pl-10 space-y-12 py-2">
            {/* Background Line Track */}
            <div className="absolute left-[17px] md:left-[21px] top-4 bottom-4 w-0.5 bg-[#E2E6EE] rounded-full" />

            {/* Filled Progress Line Track */}
            <div
              className="absolute left-[17px] md:left-[21px] top-4 w-0.5 rounded-full transition-all duration-300 origin-top"
              style={{
                height: `${scrollPercent}%`,
                background: theme.primary,
              }}
            />

            {activeProject.tasks.map((task, idx) => {
              const isCompleted = task.status === "completed";
              const isInProgress = task.status === "in-progress";
              const isUpcoming = task.status === "upcoming";

              const threshold =
                activeProject.tasks.length > 1
                  ? (idx / (activeProject.tasks.length - 1)) * 100
                  : 0;
              const isPassed = scrollPercent >= threshold;
              const dotFilled = isCompleted || (isUpcoming && isPassed);

              return (
                <div
                  key={task.id}
                  className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-12 pl-2"
                >
                  {/* Vertical Timeline Dot */}
                  <div className="absolute left-[-27px] md:left-[-31px] top-1.5 flex items-center justify-center z-10">
                    {isCompleted ? (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-green-500 border border-green-600 shadow-xs">
                        <Check className="w-4.5 h-4.5 stroke-[3]" />
                      </div>
                    ) : isInProgress ? (
                      <div className="relative w-8 h-8 flex items-center justify-center">
                        <span
                          className="absolute inline-flex h-full w-full rounded-full opacity-35 animate-ping"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <div
                          className="w-5 h-5 rounded-full shadow-sm z-10"
                          style={{ backgroundColor: theme.primary }}
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center bg-white ${
                          dotFilled
                            ? `${theme.textAccentClass}`
                            : "border-[#748297]"
                        }`}
                        style={dotFilled ? { borderColor: theme.primary } : undefined}
                      >
                        {dotFilled && (
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: theme.primary }}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Task Content Details */}
                  <div className="flex-1 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Date Range Chip */}
                      <span className="inline-flex text-[11px] font-bold text-mm-gray bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-0.5">
                        {task.startDate} - {task.endDate}
                      </span>

                      {/* Status Badges */}
                      {isInProgress && (
                        <span
                          className="inline-flex text-[9px] font-extrabold uppercase tracking-wider text-white px-2.5 py-0.5 rounded-full shadow-xs"
                          style={{ backgroundColor: theme.primary }}
                        >
                          Current Task
                        </span>
                      )}
                      {isUpcoming && (
                        <span
                          className={`inline-flex text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            isPassed
                              ? `${theme.badgeClass}`
                              : "bg-gray-50 text-mm-gray border-gray-200"
                          }`}
                        >
                          Upcoming Task
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200">
                          Completed
                        </span>
                      )}
                    </div>

                    <h4 className="text-base md:text-lg font-bold text-[#111418] tracking-tight">
                      {task.title}
                    </h4>
                    <p className="text-xs md:text-sm text-[#748297] leading-relaxed max-w-2xl">
                      {task.description}
                    </p>
                  </div>

                  {/* Progress / Readiness Bar */}
                  {task.progress !== undefined && (
                    <div className="w-full md:w-80 shrink-0 self-end md:self-center">
                      <div className="flex justify-between items-center text-xs font-semibold text-[#748297] mb-1.5">
                        <span>{isInProgress ? "Progress" : "Readiness"}</span>
                        <span
                          className={`font-bold ${
                            isPassed || isInProgress ? theme.textAccentClass : "text-[#748297]"
                          }`}
                        >
                          {task.progress}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${task.progress}%`,
                            background: isInProgress
                              ? theme.gradient
                              : isPassed
                                ? theme.primary
                                : "#E5E7EB",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Glassmorphic Locked Overlay for locked projects */}
        {activeProject.locked && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-8 text-center z-10 border border-gray-200/50">
            <div className="h-16 w-16 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center mb-4 shadow-md">
              <Lock className="h-6 w-6 text-purple-600 animate-pulse" />
            </div>

            <h3 className="text-xl font-bold text-mm-dark mb-2">Automation Suite is Locked</h3>
            <p className="text-sm text-mm-gray leading-relaxed max-w-sm mb-6">
              Upgrade your plan to unlock automated CRM synchronization, webhooks, and advanced lead-generation triggers.
            </p>

            <button
              onClick={onUpgradeTrigger}
              className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Upgrade Plan
            </button>
          </div>
        )}
      </>
    )}
  </div>
    </div>
  );
}
