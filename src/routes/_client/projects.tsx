import { useState, useEffect, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import BusinessTaskCard from "@/components/client/BusinessTaskCard";
import { X, Check, Crown, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_client/projects")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      activeCard:
        typeof search.activeCard === "string" ? search.activeCard : undefined,
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
  description: string;
}

interface ProjectData {
  id: string;
  name: string;
  category: "seo" | "marketing" | "automation";
  progress: number;
  currentTask: { title: string; description: string };
  upcomingTasks: TaskDetails[];
  tasks: TaskItem[];
  locked?: boolean;
}

function RouteComponent() {
  const { activeCard } = Route.useSearch();
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);

  // Manage project tasks checklist state
  const [projects, setProjects] = useState<ProjectData[]>([
    {
      id: "seo",
      name: "Website and SEO",
      category: "seo",
      progress: 80,
      currentTask: {
        title: "On-Page SEO Optimization",
        description: "Optimizing meta tags and content",
      },
      upcomingTasks: [
        {
          title: "Technical SEO Audit",
          description: "Site speed and mobile usability check",
        },
        {
          title: "XML Sitemap & Search Console Setup",
          description: "Submit sitemap.xml to Google index",
        },
        {
          title: "Structured Schema Integration",
          description: "Implement JSON-LD structured data",
        },
      ],
      tasks: [
        {
          id: "seo-1",
          title: "Run Initial Keyword Research & Audit",
          completed: true,
        },
        {
          id: "seo-2",
          title: "Optimize Meta Tags & Header Hierarchy",
          completed: true,
        },
        {
          id: "seo-3",
          title: "Submit XML Sitemap to Search Console",
          completed: true,
        },
        {
          id: "seo-4",
          title: "Set Up Image Alt Attributes & Internal Links",
          completed: true,
        },
        {
          id: "seo-5",
          title: "Execute Mobile Page Speed Optimization",
          completed: false,
        },
        {
          id: "seo-6",
          title: "Implement JSON-LD Schema Markup",
          completed: false,
        },
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
      },
      upcomingTasks: [
        {
          title: "Content Calendar",
          description: "Planning posts for next month",
        },
        {
          title: "Google Ads Set Up",
          description: "Launch search campaign target keywords",
        },
        {
          title: "Newsletter Template Blast",
          description: "Build weekly engagement newsletter layouts",
        },
      ],
      tasks: [
        {
          id: "mkt-1",
          title: "Define Target Customer Demographics",
          completed: true,
        },
        {
          id: "mkt-2",
          title: "Design Social Media Ad Creatives",
          completed: true,
        },
        {
          id: "mkt-3",
          title: "Build Email Newsletter Template",
          completed: true,
        },
        {
          id: "mkt-4",
          title: "Draft Copy for Google Ads Campaign",
          completed: false,
        },
        {
          id: "mkt-5",
          title: "Publish Monthly Content Calendar",
          completed: false,
        },
      ],
    },
    {
      id: "automation",
      name: "Automation",
      category: "automation",
      progress: 0,
      currentTask: {
        title: "Custom Webhook Trigger",
        description: "Send data hooks on lead conversions",
      },
      upcomingTasks: [
        {
          title: "CRM Synchronize",
          description: "Connect custom workspace sync channels",
        },
        {
          title: "Slack Real-time Webhooks",
          description: "Send channel alert triggers on custom events",
        },
      ],
      locked: true,
      tasks: [
        {
          id: "auto-1",
          title: "Configure Lead Capture Form Webhook",
          completed: false,
        },
        {
          id: "auto-2",
          title: "Connect CRM Integration & Sync Fields",
          completed: false,
        },
        {
          id: "auto-3",
          title: "Set Up Automated Follow-up Email Sequence",
          completed: false,
        },
        {
          id: "auto-4",
          title: "Sync Real-Time Slack Notifications",
          completed: false,
        },
      ],
    },
  ]);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [highlightedCard, setHighlightedCard] = useState<string | null>(null);

  // If redirected with activeCard from dashboard, highlight and open modal
  useEffect(() => {
    if (activeCard) {
      if (activeCard === "automation") {
        setShowUpgrade(true);
      } else {
        setSelectedProjectId(activeCard);
      }
      setHighlightedCard(activeCard);

      // Scroll the highlighted card into view (centered vertically)
      setTimeout(() => {
        const cardElement = document.getElementById(
          `project-card-${activeCard}`,
        );
        if (cardElement) {
          cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);

      const timer = setTimeout(() => {
        setHighlightedCard(null);
        handleResetActiveCard();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [activeCard]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleCloseDetails = () => {
    setSelectedProjectId(null);
    handleResetActiveCard();
  };

  const handleCloseUpgrade = () => {
    setShowUpgrade(false);
    handleResetActiveCard();
  };

  // Reset active card in URL query parameters to avoid double triggers
  const handleResetActiveCard = () => {
    navigate({
      to: "/projects",
      search: { activeCard: undefined },
    });
  };

  return (
    <div className="flex-1 w-full px-4.5 py-6 min-[769px]:px-8 min-[769px]:py-10 space-y-8 min-[769px]:space-y-10 select-none font-sans text-mm-dark relative pb-24">
      {/* Cards container:
          On mobile: vertical stack list (flex flex-col gap-6)
          On desktop: grid with 3 columns (min-[769px]:grid min-[769px]:grid-cols-3) */}
      <section
        ref={carouselRef}
        className="w-full flex flex-col gap-6 min-[769px]:grid min-[769px]:grid-cols-3 min-[769px]:gap-8 py-2 px-1 min-[769px]:px-0"
      >
        {projects.map((project) => {
          const isHighlighted = highlightedCard === project.id;
          const highlightStyles = isHighlighted
            ? "ring-[3px] ring-mm-orange ring-offset-2 min-[769px]:ring-offset-4 shadow-[0_0_25px_rgba(255,89,36,0.22)] min-[769px]:shadow-[0_0_35px_rgba(255,89,36,0.25)] scale-[1.01] min-[769px]:scale-[1.02] transition-all duration-300"
            : "transition-all duration-1000 ease-out ring-0 ring-transparent ring-offset-0 shadow-none";

          return (
            <div
              key={project.id}
              id={`project-card-${project.id}`}
              className={`w-full shrink-0 rounded-3xl ${highlightStyles}`}
              onClick={() => {
                if (project.locked) {
                  setShowUpgrade(true);
                } else {
                  setSelectedProjectId(project.id);
                }
              }}
            >
              <BusinessTaskCard
                name={project.name}
                category={project.category}
                progress={project.progress}
                currentTask={project.currentTask}
                upcomingTasks={project.upcomingTasks}
                locked={project.locked}
                className="cursor-pointer h-full"
              />
            </div>
          );
        })}
      </section>
    </div>
  );
}
