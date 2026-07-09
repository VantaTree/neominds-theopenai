import { useState, useEffect } from "react";
import { ListTodo, PlayCircle, CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskDetails {
  title: string;
  description: string;
  progress?: number;
}

interface ProjectData {
  id: string;
  name: string;
  category: "seo" | "marketing" | "automation";
  progress: number;
  currentTask: { title: string; description: string; progress?: number };
  upcomingTasks: TaskDetails[];
  tasks: TaskItem[];
  locked?: boolean;
}

const DUMMY_PROJECTS: ProjectData[] = [
  {
    id: "seo",
    name: "Website and SEO",
    category: "seo",
    progress: 87, // Sketch shows 87% progress
    currentTask: {
      title: "On-Page SEO Optimization",
      description: "Optimizing meta tags and content",
      progress: 49, // Sketch shows 49% progress
    },
    upcomingTasks: [
      {
        title: "Technical SEO",
        description: "Site speed and mobile usability check",
        progress: 30, // Sketch shows 30% progress
      },
      {
        title: "HTML Structure",
        description: "Submit sitemap.xml and set correct markup",
        progress: 90, // Sketch shows 90% progress
      },
    ],
    tasks: [
      { id: "seo-1", title: "Run Initial Keyword Research & Audit", completed: true },
      { id: "seo-2", title: "Optimize Meta Tags & Header Hierarchy", completed: true },
      { id: "seo-3", title: "Submit XML Sitemap to Search Console", completed: true },
      { id: "seo-4", title: "Set Up Image Alt Attributes & Internal Links", completed: true },
    ],
  },
  {
    id: "marketing",
    name: "Marketing",
    category: "marketing",
    progress: 60,
    currentTask: {
      title: "Social Media Campaign",
      description: "Running engagement campaign",
      progress: 40,
    },
    upcomingTasks: [
      {
        title: "Content Calendar",
        description: "Planning posts for next month",
        progress: 70,
      },
      {
        title: "Newsletter Template Blast",
        description: "Build weekly engagement newsletter layouts",
        progress: 20,
      },
    ],
    tasks: [
      { id: "mkt-1", title: "Define Target Customer Demographics", completed: true },
      { id: "mkt-2", title: "Design Social Media Ad Creatives", completed: true },
    ],
  },
  {
    id: "automation",
    name: "Automation",
    category: "automation",
    progress: 0,
    locked: true,
    currentTask: {
      title: "Custom Webhook Trigger",
      description: "Send data hooks on lead conversions",
      progress: 0,
    },
    upcomingTasks: [
      {
        title: "CRM Synchronize",
        description: "Connect custom workspace sync channels",
        progress: 0,
      },
    ],
    tasks: [],
  },
];

interface ProjectDashboardProps {
  apiUrl?: string;
  activeProjectId?: string;
}

export function ProjectDashboard({ apiUrl, activeProjectId = "seo" }: ProjectDashboardProps) {
  const [projects, setProjects] = useState<ProjectData[]>(DUMMY_PROJECTS);

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

  // Setup Recharts Donut data
  const chartData = [
    { name: "Completed", value: activeProject.progress },
    { name: "Remaining", value: 100 - activeProject.progress },
  ];

  return (
    <div className="w-full flex flex-col gap-8 select-none">
      {/* Title and Badge Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111418] font-sans">
          {activeProject.name}
        </h2>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFF2EC] text-[#FF5924]">
          in progress
        </span>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Total Tasks Card */}
        <div className="bg-white border border-[#E2E6EE] rounded-3xl p-6 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-sm font-semibold text-[#748297] mb-1">Total Tasks</p>
            <h4 className="text-3xl font-extrabold text-[#111418]">
              {activeProject.tasks.length + activeProject.upcomingTasks.length}
            </h4>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-[#E2E6EE] text-[#FF5924]">
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
                  <Cell fill="#FF5924" stroke="none" />
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

      {/* Current Task Card (Full Width, Horizontal Layout) */}
      <div className="bg-white border border-[#E2E6EE] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-12 justify-between items-start md:items-center shadow-xs">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <PlayCircle className="w-5 h-5 text-[#FF5924]" />
            <h5 className="font-bold text-sm uppercase tracking-wider text-[#FF5924]">
              Current Task
            </h5>
          </div>
          <h4 className="text-lg md:text-xl font-bold text-[#111418] mb-2">
            {activeProject.currentTask.title}
          </h4>
          <p className="text-sm text-[#748297] leading-relaxed max-w-2xl">
            {activeProject.currentTask.description}
          </p>
        </div>

        {/* Current Task Progress Bar (Right Aligned on Desktop) */}
        <div className="w-full md:w-80 shrink-0">
          <div className="flex justify-between items-center text-xs font-semibold text-[#748297] mb-2">
            <span>Progress</span>
            <span className="text-[#FF5924] font-bold">
              {activeProject.currentTask.progress ?? 0}%
            </span>
          </div>
          <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${activeProject.currentTask.progress ?? 0}%`,
                background: "linear-gradient(90deg, #FF5924 0%, #ff8b65 100%)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Upcoming Tasks Card (Full Width, Horizontal Layout Items) */}
      <div className="bg-white border border-[#E2E6EE] rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle2 className="w-5 h-5 text-[#748297]" />
          <h5 className="font-bold text-sm uppercase tracking-wider text-[#748297]">
            Upcoming Tasks
          </h5>
        </div>

        <div className="flex flex-col gap-5">
          {activeProject.upcomingTasks.map((task, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row gap-4 md:gap-12 justify-between items-start md:items-center pb-5 border-b border-gray-100 last:border-0 last:pb-0"
            >
              {/* Task info on the Left */}
              <div className="flex-1">
                <h6 className="text-base font-bold text-[#111418]">{task.title}</h6>
                <p className="text-xs text-[#748297] mt-1 leading-relaxed max-w-xl">
                  {task.description}
                </p>
              </div>

              {/* Task progress on the Right */}
              {task.progress !== undefined && (
                <div className="w-full md:w-80 shrink-0">
                  <div className="flex justify-between items-center text-xs font-semibold text-[#748297] mb-1.5">
                    <span>Readiness</span>
                    <span className="text-[#748297] font-bold">{task.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gray-300 transition-all duration-500"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
