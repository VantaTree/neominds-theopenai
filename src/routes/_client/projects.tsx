import { createFileRoute } from "@tanstack/react-router";
import { Plus, Calendar, Bell, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/_client/projects")({
  component: RouteComponent,
});

interface Project {
  id: number;
  title: string;
  status: "In Progress" | "Pending" | "Completed";
  statusClass: string;
  startDate: string;
  dueDate: string;
  progress: number;
  nextUpdateTitle: string;
  nextUpdateDate: string;
}

const initialProjects: Project[] = [
  {
    id: 1,
    title: "Website Development",
    status: "In Progress",
    statusClass: "text-[#3B82F6] bg-[#3B82F6]/10",
    startDate: "May 15, 2024",
    dueDate: "Jun 15, 2024",
    progress: 60,
    nextUpdateTitle: "Homepage design review",
    nextUpdateDate: "May 26, 2024",
  },
  {
    id: 2,
    title: "Marketing Campaign",
    status: "Pending",
    statusClass: "text-amber-600 bg-amber-500/10",
    startDate: "May 25, 2024",
    dueDate: "Jun 25, 2024",
    progress: 20,
    nextUpdateTitle: "Campaign strategy finalization",
    nextUpdateDate: "May 30, 2024",
  },
];

function RouteComponent() {
  return (
    <div className="flex-1 w-full px-6 py-8 md:px-8 md:py-10 space-y-12 select-none font-sans text-mm-dark">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-mm-dark tracking-tight">
            Your Projects
          </h2>
          <p className="text-sm text-mm-gray mt-1">
            Track your growth initiatives
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-mm-orange hover:opacity-95 text-white px-4.5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer">
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projectsDataMapped.map((project) => (
          <div
            key={project.id}
            className="bg-white border border-mm-border rounded-3xl p-6.5 flex flex-col justify-between space-y-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)]"
          >
            {/* Top Info */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${project.statusClass}`}>
                  {project.status}
                </span>
                <h3 className="text-lg font-bold text-mm-dark mt-2 tracking-tight">
                  {project.title}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-mm-gray">
                <Calendar className="h-4 w-4" />
                <span>{project.startDate}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-mm-gray">
                <span>Progress</span>
                <span className="text-mm-dark">{project.progress}%</span>
              </div>
              <div className="h-2 bg-mm-subtle rounded-full overflow-hidden">
                <div
                  className="h-full bg-mm-orange rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Next Update Task Info */}
            <div className="p-4 bg-[#F9FAFC] border border-mm-border/50 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-mm-gray uppercase tracking-wider">
                <Bell className="h-3 w-3 text-mm-orange" />
                <span>Next Update</span>
              </div>
              <p className="text-sm font-bold text-mm-dark">
                {project.nextUpdateTitle}
              </p>
              <p className="text-xs text-mm-gray">
                {project.nextUpdateDate}
              </p>
            </div>

            {/* Action Details Button */}
            <button className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-mm-border text-sm font-bold text-mm-dark hover:bg-mm-subtle transition-all active:scale-95 cursor-pointer">
              View Details
              <ArrowUpRight className="h-4 w-4 text-mm-gray" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const projectsDataMapped: Project[] = initialProjects;
