import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ProjectDashboard } from "@/components/client/ProjectDashboard";
import UpgradeCard from "@/components/client/UpgradeCard";
import { X } from "lucide-react";

export const Route = createFileRoute("/_client/projects")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      activeCard:
        typeof search.activeCard === "string" ? search.activeCard : undefined,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { activeCard } = Route.useSearch();
  const navigate = useNavigate();
  const [activeProjectId, setActiveProjectId] = useState<string>("report");
  const [showUpgrade, setShowUpgrade] = useState(false);

  // If redirected with activeCard from dashboard, set state and check if it's automation (locked)
  useEffect(() => {
    if (activeCard) {
      if (activeCard === "automation") {
        setShowUpgrade(true);
      } else {
        setActiveProjectId(activeCard);
      }
      handleResetActiveCard();
    }
  }, [activeCard]);

  const handleCloseUpgrade = () => {
    setShowUpgrade(false);
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
      {/* Render the Project Dashboard component */}
      <ProjectDashboard
        activeProjectId={activeProjectId}
        onActiveProjectChange={(id) => setActiveProjectId(id)}
        onUpgradeTrigger={() => setShowUpgrade(true)}
        apiUrl="/api/projects"
      />

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
