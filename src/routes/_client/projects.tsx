import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ProjectDashboard } from "@/components/client/ProjectDashboard";
import UpgradeCard from "@/components/client/UpgradeCard";
import { X, Loader2 } from "lucide-react";
import { useBusiness } from "@/hooks/use-business";
import { getProjectsByBusinessFn, getReportsByBusinessFn, getMyBusinessesFn } from "@/lib/server-functions";
import { type Project } from "@/lib/schemas";

export const Route = createFileRoute("/_client/projects")({
  validateSearch: (
    search: Record<string, unknown>
  ): { activeCard?: string } => {
    return {
      activeCard:
        typeof search.activeCard === "string" ? search.activeCard : undefined,
    };
  },
  loader: async () => {
    try {
      // Fetch businesses and default active business data for SSR pre-rendering
      const businesses = await getMyBusinessesFn();
      const defaultActiveId = businesses.length > 0 ? businesses[0].id : null;
      
      let initialProjects: Project[] = [];
      let initialReports: any[] = [];
      
      if (defaultActiveId) {
        const [projects, reports] = await Promise.all([
          getProjectsByBusinessFn({ data: defaultActiveId }),
          getReportsByBusinessFn({ data: defaultActiveId }),
        ]);
        initialProjects = projects;
        initialReports = reports;
      }
      
      return {
        defaultActiveId,
        initialProjects,
        initialReports,
      };
    } catch (err) {
      console.error("Loader failed in /projects:", err);
      return {
        defaultActiveId: null,
        initialProjects: [],
        initialReports: [],
      };
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { activeCard } = Route.useSearch();
  const { defaultActiveId, initialProjects, initialReports } = Route.useLoaderData();
  const { activeBusiness } = useBusiness();
  const navigate = Route.useNavigate();

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [reports, setReports] = useState<any[]>(initialReports);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [loadedBusinessId, setLoadedBusinessId] = useState<string | null>(defaultActiveId);

  // Sync projects and reports whenever activeBusiness changes
  useEffect(() => {
    const businessId = activeBusiness?.id;
    if (!businessId) {
      setProjects([]);
      setReports([]);
      setLoadedBusinessId(null);
      return;
    }

    // If activeBusiness matches the business we currently have in state, skip fetching
    if (businessId === loadedBusinessId) {
      return;
    }

    let active = true;
    async function loadData() {
      setLoading(true);
      try {
        const [fetchedProjects, fetchedReports] = await Promise.all([
          getProjectsByBusinessFn({ data: businessId }),
          getReportsByBusinessFn({ data: businessId }),
        ]);
        if (active) {
          setProjects(fetchedProjects);
          setReports(fetchedReports);
          setLoadedBusinessId(businessId);
        }
      } catch (err) {
        console.error("Failed to load projects/reports:", err);
        if (active) {
          setProjects([]);
          setReports([]);
          setLoadedBusinessId(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [activeBusiness?.id, loadedBusinessId]);

  // Retrieve initial tab from query parameter, fallback to localStorage, fallback to 'report'
  const getInitialTab = () => {
    if (activeCard) {
      if (activeCard.toLowerCase() === "automation") return "Automation";
      if (activeCard.toLowerCase() === "seo" || activeCard.toLowerCase() === "website") return "Website";
      if (activeCard.toLowerCase() === "marketing") return "Marketing";
      return activeCard;
    }
    if (typeof window !== "undefined") {
      return localStorage.getItem("projects_last_tab") || "report";
    }
    return "report";
  };

  const [activeProjectId, setActiveProjectId] = useState<string>(getInitialTab);

  // Handle activeCard parameter from URL navigation (e.g. from dashboard widgets)
  useEffect(() => {
    if (activeCard) {
      let resolvedTab = "report";
      if (activeCard.toLowerCase() === "automation") {
        resolvedTab = "Automation";
      } else if (activeCard.toLowerCase() === "seo" || activeCard.toLowerCase() === "website") {
        resolvedTab = "Website";
      } else if (activeCard.toLowerCase() === "marketing") {
        resolvedTab = "Marketing";
      } else {
        resolvedTab = activeCard;
      }
      setActiveProjectId(resolvedTab);
      localStorage.setItem("projects_last_tab", resolvedTab);
      handleResetActiveCard();
    }
  }, [activeCard]);

  const handleCloseUpgrade = () => {
    setShowUpgrade(false);
  };

  // Reset active card query parameter to keep URL clean
  const handleResetActiveCard = () => {
    navigate({
      search: (prev: any) => ({
        ...prev,
        activeCard: undefined,
      }),
    });
  };

  const handleTabChange = (id: string) => {
    setActiveProjectId(id);
    localStorage.setItem("projects_last_tab", id);
  };

  const reportData = reports && reports.length > 0 ? reports[0] : undefined;

  return (
    <div className="flex-1 w-full px-4.5 py-6 min-[769px]:px-8 min-[769px]:py-10 space-y-8 min-[769px]:space-y-10 font-sans text-mm-dark relative pb-24">
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <Loader2 className="w-8 h-8 text-mm-orange animate-spin" />
          <p className="text-sm font-semibold text-mm-gray">Loading details...</p>
        </div>
      ) : (
        <ProjectDashboard
          projects={projects}
          activeProjectId={activeProjectId}
          onActiveProjectChange={handleTabChange}
          onUpgradeTrigger={() => setShowUpgrade(true)}
          initialReportData={reportData}
        />
      )}

      {/* Upgrade Modal overlay */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-2 max-w-sm w-full relative shadow-2xl border border-gray-100 animate-in scale-in duration-200">
            <button
              onClick={handleCloseUpgrade}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer z-20"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <UpgradeCard />
          </div>
        </div>
      )}
    </div>
  );
}
