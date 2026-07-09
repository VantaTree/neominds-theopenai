import { useNavigate } from "@tanstack/react-router";
import AnalyticsCard from "./AnalyticsCard";
import BusinessTaskCard from "./BusinessTaskCard";
import UpgradeCard from "./UpgradeCard";
import PlanGate from "./PlanGate";

export default function ClientDashboardDesktop() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 w-full px-6 py-8 md:px-8 md:py-10 space-y-8">
      {/* Analytics Section - 4 Columns */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <AnalyticsCard category="google" />
        <AnalyticsCard category="website" />
        <AnalyticsCard category="social" />
        <AnalyticsCard category="campaign" />
      </section>

      {/* Action / Task Section - 4 Columns */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Card 1: Website and SEO */}
        <BusinessTaskCard
          name="Website and SEO"
          category="seo"
          progress={80}
          currentTask={{
            title: "On-Page SEO Optimization",
            description: "Optimizing meta tags and content",
          }}
          upcomingTask={{
            title: "Technical SEO Audit",
            description: "Site speed and mobile usability check",
          }}
          onViewMore={() =>
            navigate({ to: "/projects", search: { activeCard: "seo" } })
          }
        />

        {/* Card 2: Marketing */}
        <BusinessTaskCard
          name="Marketing"
          category="marketing"
          progress={65}
          currentTask={{
            title: "Social Media Campaign",
            description: "Running engagement campaign",
          }}
          upcomingTask={{
            title: "Content Calendar",
            description: "Planning posts for next month",
          }}
          onViewMore={() =>
            navigate({ to: "/projects", search: { activeCard: "marketing" } })
          }
        />

        {/* Card 3: Automation (Locked for Basic/None, Unlocked for Pro+) */}
        <PlanGate
          requiredPlan="Plus"
          fallback={
            <BusinessTaskCard
              name="Automation"
              category="automation"
              locked={true}
            />
          }
        >
          <BusinessTaskCard
            name="Automation"
            category="automation"
            progress={90}
            currentTask={{
              title: "Zapier Integration Check",
              description: "Testing lead ingestion webhooks",
            }}
            upcomingTask={{
              title: "Email Sequence Automation",
              description: "Autopilot campaigns setup",
            }}
            onViewMore={() =>
              navigate({
                to: "/projects",
                search: { activeCard: "automation" },
              })
            }
          />
        </PlanGate>

        {/* Card 4: Unlock Features Upgrade */}
        <UpgradeCard />
      </section>
    </div>
  );
}
