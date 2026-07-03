import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_client/projects")({
  component: RouteComponent,
});

interface Project {
  id: number;
  title: string;
  status: "In Progress" | "Completed" | "On Hold" | "Planning";
  progress: number;
  dueDate: string;
  assignees: string[];
  extraAssigneesCount: number;
}

// Single project item as requested: "dont add mock data (just one for now)"
const INITIAL_PROJECTS: Project[] = [
  {
    id: 1,
    title: "Website Redesign",
    status: "In Progress",
    progress: 70,
    dueDate: "15 Jun, 2024",
    assignees: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
    ],
    extraAssigneesCount: 2,
  },
];

type FilterTab = "All" | "In Progress" | "Completed" | "On Hold";

function RouteComponent() {
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  // Filtering logic
  const filteredProjects = INITIAL_PROJECTS.filter((project) => {
    if (activeTab === "All") return true;
    return project.status === activeTab;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2 font-sans text-mm-dark select-none">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-mm-dark font-sans">
          Projects
        </h2>
        <p className="text-sm text-mm-gray mt-1">
          Track all your projects in one place.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-6 border-b border-mm-border pb-px text-sm font-semibold mt-4">
        <button
          onClick={() => setActiveTab("All")}
          className={`${
            activeTab === "All"
              ? "text-mm-dark border-b-2 border-mm-orange pb-3 -mb-px font-extrabold"
              : "text-mm-gray hover:text-mm-dark pb-3 cursor-pointer"
          } transition-all`}
        >
          All Projects
        </button>
        <button
          onClick={() => setActiveTab("In Progress")}
          className={`${
            activeTab === "In Progress"
              ? "text-mm-dark border-b-2 border-mm-orange pb-3 -mb-px font-extrabold"
              : "text-mm-gray hover:text-mm-dark pb-3 cursor-pointer"
          } transition-all`}
        >
          In Progress
        </button>
        <button
          onClick={() => setActiveTab("Completed")}
          className={`${
            activeTab === "Completed"
              ? "text-mm-dark border-b-2 border-mm-orange pb-3 -mb-px font-extrabold"
              : "text-mm-gray hover:text-mm-dark pb-3 cursor-pointer"
          } transition-all`}
        >
          Completed
        </button>
        <button
          onClick={() => setActiveTab("On Hold")}
          className={`${
            activeTab === "On Hold"
              ? "text-mm-dark border-b-2 border-mm-orange pb-3 -mb-px font-extrabold"
              : "text-mm-gray hover:text-mm-dark pb-3 cursor-pointer"
          } transition-all`}
        >
          On Hold
        </button>
      </div>

      {/* Projects List Card Container */}
      <div className="space-y-4">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] space-y-4 animate-fadeIn"
          >
            {/* Title & Status badge */}
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-extrabold text-mm-dark">
                {project.title}
              </h3>
              <span className="text-xs font-bold text-mm-blue bg-mm-blue/10 px-3 py-1 rounded-lg">
                {project.status}
              </span>
            </div>

            {/* Progress Bar Row */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-mm-subtle rounded-full overflow-hidden">
                <div
                  className="h-full bg-mm-blue rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <span className="text-xs font-extrabold text-mm-dark">
                {project.progress}%
              </span>
            </div>

            {/* Due Date & Assignees Row */}
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs font-semibold text-mm-gray">
                Due: {project.dueDate}
              </span>

              {/* Overlapping Avatars Stack */}
              <div className="flex items-center -space-x-1.5">
                {project.assignees.map((avatarUrl, idx) => (
                  <img
                    key={idx}
                    src={avatarUrl}
                    alt="Assignee"
                    className="h-7 w-7 rounded-full border-2 border-white object-cover shadow-sm"
                  />
                ))}
                {project.extraAssigneesCount > 0 && (
                  <div className="h-7 w-7 rounded-full border-2 border-white bg-mm-subtle flex items-center justify-center text-[9px] font-bold text-mm-gray shadow-sm">
                    +{project.extraAssigneesCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="bg-white border border-mm-border rounded-[24px] p-12 text-center text-xs font-semibold text-mm-gray">
            No projects in this category.
          </div>
        )}

        {/* New Project Button */}
        <button className="w-full py-3.5 border border-dashed border-mm-border hover:border-mm-gray hover:text-mm-dark text-mm-gray text-xs font-extrabold rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer">
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>
    </div>
  );
}
