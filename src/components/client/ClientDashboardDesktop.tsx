import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Store, Globe, Instagram, Facebook } from "lucide-react";
import Insight from "./insight";
import InsightConnectionGate from "./InsightConnectionGate";
import BusinessTaskCard from "./BusinessTaskCard";
import UpgradeCard from "./UpgradeCard";
import PlanGate from "./PlanGate";
import { useBusiness } from "@/hooks/use-business";
import { getAuthUrlFn, getDashboardInsightsFn } from "@/lib/server-functions";

export default function ClientDashboardDesktop() {
  const navigate = useNavigate();
  const { activeBusiness, loading: businessLoading } = useBusiness();
  const [insights, setInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      if (!activeBusiness?.id) {
        setInsightsLoading(false);
        return;
      }
      try {
        setInsightsLoading(true);
        const data = await getDashboardInsightsFn({ data: activeBusiness.id });
        setInsights(data);
      } catch (err) {
        console.error("Error loading integrations insights:", err);
      } finally {
        setInsightsLoading(false);
      }
    }

    loadInsights();
  }, [activeBusiness?.id]);

  const handleConnect = async (platform: "google" | "meta") => {
    if (!activeBusiness?.id) return;
    try {
      const { url } = await getAuthUrlFn({
        data: {
          platform,
          businessId: activeBusiness.id,
          origin: window.location.origin,
        },
      });
      window.location.href = url;
    } catch (err) {
      console.error(`Error initiating OAuth connection for ${platform}:`, err);
    }
  };

  const handleUpgrade = (targetPlan: "Plus" | "Pro") => {
    if (activeBusiness?.id) {
      navigate({
        to: "/plans",
        // search: { businessId: activeBusiness.id, plan: targetPlan },
      });
    } else {
      navigate({ to: "/plans" });
    }
  };

  const plan = insights?.plan || activeBusiness?.plan || "None";

  const renderPlatformInsights = (
    platformKey: "website" | "google" | "instagram" | "facebook",
    platformName: string,
    icon: any,
    borderColor: string,
    requiredPlan: "Plus" | "Pro" = "Plus"
  ) => {
    const platformData = insights?.integrations?.[platformKey];
    const isConnected = platformData?.isConnected;

    // Evaluate locking state
    let isLocked = false;
    let actualRequiredPlan: "Plus" | "Pro" = requiredPlan;

    if (plan === "None" || plan === "Basic") {
      if (platformKey === "instagram" || platformKey === "facebook") {
        isLocked = true;
        actualRequiredPlan = "Plus";
      }
    } else if (plan === "Plus") {
      if (platformKey === "instagram" || platformKey === "facebook") {
        const isInstagramConnected = !!insights?.integrations?.instagram?.isConnected;
        const isFacebookConnected = !!insights?.integrations?.facebook?.isConnected;

        if (isInstagramConnected && isFacebookConnected) {
          isLocked = false;
        } else if (isInstagramConnected && platformKey === "facebook") {
          isLocked = true;
          actualRequiredPlan = "Pro";
        } else if (isFacebookConnected && platformKey === "instagram") {
          isLocked = true;
          actualRequiredPlan = "Pro";
        } else {
          isLocked = false;
        }
      }
    } else if (plan === "Pro") {
      isLocked = false;
    }

    if (isLocked) {
      const metrics = platformData?.metrics || [
        { label: "Metric 1", value: "0", trend: "0%", isPositive: true },
        { label: "Metric 2", value: "0", trend: "0%", isPositive: true },
      ];
      return metrics.map((metric: any, idx: number) => (
        <Insight
          key={idx}
          platform={platformName}
          label={metric.label}
          value={metric.value}
          trend={metric.trend}
          isPositive={metric.isPositive}
          borderColor={borderColor}
          icon={icon}
          locked={true}
          requiredPlan={actualRequiredPlan}
          onUpgrade={() => handleUpgrade(actualRequiredPlan)}
        />
      ));
    }

    const needsSetup = platformData?.needsSetup;

    if (needsSetup) {
      const setupUrl = platformKey === "website" 
        ? "https://analytics.google.com/" 
        : "https://business.google.com/";
      const setupLabel = platformKey === "website"
        ? "Create Analytics Property"
        : "Create Business Profile";
      const description = platformKey === "website"
        ? "We couldn't find any Google Analytics properties associated with your Google account. Please create one to track website visitors."
        : "We couldn't find any Google Business listings associated with your Google account. Please register a listing to track map & search views.";

      const PlatformIcon = icon;

      return (
        <div
          style={{ borderColor }}
          className="col-span-1 md:col-span-2 bg-white rounded-3xl p-6.5 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.015)] border border-dashed min-h-[155px] relative overflow-hidden select-none hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] transition-all duration-300"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-mm-gray/80 tracking-wider uppercase">
                {platformName}
              </span>
              <p className="text-xs text-mm-dark font-bold leading-snug mt-1">
                Setup Required
              </p>
              <p className="text-[11px] text-mm-gray leading-normal max-w-md">
                {description}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-mm-subtle flex items-center justify-center shrink-0">
              <PlatformIcon className="h-4 w-4 text-mm-dark/60" />
            </div>
          </div>
          <a
            href={setupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-mm-subtle hover:bg-mm-orange/10 hover:text-mm-orange text-mm-dark font-extrabold text-xs rounded-xl transition-all cursor-pointer w-fit"
          >
            <span>{setupLabel}</span>
          </a>
        </div>
      );
    }

    if (!isConnected) {
      const provider = platformKey === "website" || platformKey === "google" ? "google" : "meta";
      return (
        <>
          <InsightConnectionGate
            platform={platformName}
            icon={icon}
            borderColor={borderColor}
            onConnect={() => handleConnect(provider)}
          />
          <InsightConnectionGate
            platform={platformName}
            icon={icon}
            borderColor={borderColor}
            onConnect={() => handleConnect(provider)}
          />
        </>
      );
    }

    return platformData.metrics.map((metric: any, idx: number) => (
      <Insight
        key={idx}
        platform={platformName}
        label={metric.label}
        value={metric.value}
        trend={metric.trend}
        isPositive={metric.isPositive}
        borderColor={borderColor}
        icon={icon}
      />
    ));
  };

  return (
    <div className="flex-1 w-full px-6 py-8 md:px-8 md:py-10 space-y-8">
      {/* Analytics Section - Gated by Subscription Plan Tier */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {businessLoading || insightsLoading ? (
          // Render loading skeletons matching all 8 grid cells
          Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.015)] border border-mm-border h-[155px] animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-24 bg-mm-subtle rounded-md" />
                <div className="h-6 w-6 bg-mm-subtle rounded-md" />
              </div>
              <div className="space-y-2 mt-4">
                <div className="h-3 w-14 bg-mm-subtle rounded-md" />
                <div className="h-7 w-28 bg-mm-subtle rounded-md" />
              </div>
            </div>
          ))
        ) : !activeBusiness ? (
          <div className="col-span-full bg-white border border-mm-border rounded-3xl p-8 text-center space-y-3">
            <h3 className="text-[16px] font-bold text-mm-dark">No Business Profile Found</h3>
            <p className="text-sm text-mm-gray">
              Please create or select a business profile in your settings to view analytics dashboard.
            </p>
          </div>
        ) : (
          <>
            {renderPlatformInsights("website", "Website Analytics", Globe, "#5CB13E")}
            {renderPlatformInsights("google", "Google Business", Store, "#3B82F6")}
            {renderPlatformInsights("instagram", "Instagram", Instagram, "#FF7DD3", "Plus")}
            {renderPlatformInsights("facebook", "Facebook", Facebook, "#1877F2", "Plus")}
          </>
        )}
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
          requiredPlan="Pro"
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
