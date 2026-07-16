import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ProjectDashboard } from "@/components/client/ProjectDashboard";
import UpgradeCard from "@/components/client/UpgradeCard";
import { X, Loader2 } from "lucide-react";
import { useBusiness } from "@/hooks/use-business";
import { useProjectsByBusiness, useReportsByBusiness } from "@/hooks/useDbQueries";

export const Route = createFileRoute("/_client/projects")({
  validateSearch: (
    search: Record<string, unknown>
  ): { activeCard?: string } => {
    return {
      activeCard:
        typeof search.activeCard === "string" ? search.activeCard : undefined,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { activeCard } = Route.useSearch();
  const { activeBusiness } = useBusiness();
  const navigate = Route.useNavigate();

  const businessId = activeBusiness?.id || "";

  // Fetch projects and reports with TanStack Query hooks, using the active business ID
  const { data: projects = [], isLoading: loadingProjects } = useProjectsByBusiness(businessId, {
    enabled: !!businessId,
  });

  const { data: reports = [], isLoading: loadingReports } = useReportsByBusiness(businessId, {
    enabled: !!businessId,
  });

  const loading = loadingProjects || loadingReports;
  const [showUpgrade, setShowUpgrade] = useState(false);

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

  const reportData = reports && reports.length > 0 ? reports[0]?.data : undefined;

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
