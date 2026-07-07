import { useState, useEffect, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import BusinessTaskCard from "@/components/client/BusinessTaskCard";
import { X, Check, Crown, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_client/projects")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      activeCard: typeof search.activeCard === "string" ? search.activeCard : undefined,
    };
  },
  component: RouteComponent,
});

interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskDetails {
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
    <div className="max-w-6xl mx-auto space-y-12 py-4 select-none font-sans text-mm-dark">
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
            className="bg-white border border-mm-border rounded-3xl p-6.5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-6"
          >
            {/* Title & Status Row */}
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-mm-dark tracking-tight">
                {project.title}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide whitespace-nowrap ${project.statusClass}`}
              >
                {project.status}
              </span>
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-mm-gray uppercase tracking-wider block">
                  Start Date
                </span>
                <div className="flex items-center gap-2 text-mm-dark/80">
                  <Calendar className="h-4 w-4 text-mm-gray shrink-0" />
                  <span className="text-sm font-semibold">{project.startDate}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-mm-gray uppercase tracking-wider block">
                  Due Date
                </span>
                <div className="flex items-center gap-2 text-mm-dark/80">
                  <Calendar className="h-4 w-4 text-mm-gray shrink-0" />
                  <span className="text-sm font-semibold">{project.dueDate}</span>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] font-bold text-mm-gray uppercase tracking-wider">
                  Progress
                </span>
                <span className="text-xs font-extrabold text-mm-orange">
                  {project.progress}%
                </span>
              </div>
              {/* Progress Bar Container */}
              <div className="h-2 w-full bg-mm-subtle rounded-full overflow-hidden">
                <div
                  className="h-full bg-mm-orange rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Next Update - Structured as Plain Content Area (No Nested Cards) */}
            <div className="border-l-2 border-mm-orange/25 pl-4 py-1 space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-bold text-mm-gray uppercase tracking-wider">
                <Bell className="h-3.5 w-3.5 text-mm-orange/70" />
                Next Update
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
