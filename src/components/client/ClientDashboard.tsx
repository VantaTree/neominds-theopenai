import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Store, Globe, Instagram, Facebook, Lock, ChevronDown } from "lucide-react";
import Insight from "./insight";
import InsightConnectionGate from "./InsightConnectionGate";
import BusinessTaskCard from "./BusinessTaskCard";
import UpgradeCard from "./UpgradeCard";
import PlanGate from "./PlanGate";
import { useBusiness } from "@/hooks/use-business";
import { useProjectsByBusiness } from "@/hooks/useDbQueries";
import { type Project } from "@/lib/schemas";
import { getAuthUrlFn, getDashboardInsightsFn, activatePlusPlatformFn } from "@/lib/server-functions";
import { auth } from "@/lib/firebase";
import type { User } from "firebase/auth";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function ClientDashboardDesktop() {
  const navigate = useNavigate();
  const { activeBusiness, loading: businessLoading } = useBusiness();
  const { data: projects = [], isLoading: projectsLoading } = useProjectsByBusiness(activeBusiness?.id || "", {
    enabled: !!activeBusiness?.id,
  });

  const getDomainCardData = (domainName: "Website" | "Marketing" | "Automation") => {
    const domainProjects = projects
      .filter(p => p.domain === domainName && p.status !== "User Draft")
      .sort((a, b) => (b.progress || 0) - (a.progress || 0));

    const totalProgress = domainProjects.reduce((sum, p) => sum + (p.progress || 0), 0);
    const averageProgress = domainProjects.length > 0 ? Math.round(totalProgress / domainProjects.length) : 0;

    let currentTask = undefined;
    let upcomingTask = undefined;

    if (domainProjects.length > 0) {
      currentTask = {
        title: domainProjects[0].name,
        description: domainProjects[0].description || "Project in progress",
      };
      if (domainProjects.length > 1) {
        upcomingTask = {
          title: domainProjects[1].name,
          description: domainProjects[1].description || "Project in progress",
        };
      } else {
        upcomingTask = {
          title: "Next Project",
          description: "Start a conversation to request a new project",
        };
      }
    } else {
      currentTask = {
        title: "No active projects",
        description: "Start a project to see updates here",
      };
      upcomingTask = {
        title: "Ready to start?",
        description: "Request a project or chat with our team",
      };
    }

    return {
      progress: averageProgress,
      currentTask,
      upcomingTask,
    };
  };

  const [insights, setInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [userName, setUserName] = useState<string>("");
  const [timeRange, setTimeRange] = useState<"30days" | "7days">("30days");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      if (user) {
        setUserName(user.displayName || user.email?.split("@")[0] || "Client");
      } else {
        setUserName("Client");
      }
    });
    return () => unsubscribe();
  }, []);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good Morning";
    if (hr < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
    };
    return new Date().toLocaleDateString("en-US", options);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.clientWidth;
    const index = Math.round(scrollLeft / cardWidth);
    setScrollIndex(Math.max(0, Math.min(2, index)));
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function loadInsights() {
      if (!activeBusiness?.id) {
        setInsightsLoading(false);
        return;
      }
      try {
        setInsightsLoading(true);
        const data = await getDashboardInsightsFn({
          data: {
            businessId: activeBusiness.id,
            range: timeRange
          }
        });
        setInsights(data);
      } catch (err) {
        console.error("Error loading integrations insights:", err);
      } finally {
        setInsightsLoading(false);
      }
    }

    loadInsights();
  }, [activeBusiness?.id, timeRange]);

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

  const handleUpgrade = (targetPlan: "Basic" | "Plus" | "Pro") => {
    if (activeBusiness?.id) {
      navigate({
        to: "/plans",
        // search: { businessId: activeBusiness.id, plan: targetPlan },
      });
    } else {
      navigate({ to: "/plans" });
    }
  };

  const handleActivatePlusPlatform = async (platform: "instagram" | "facebook") => {
    if (!activeBusiness?.id || activating) return;
    try {
      setActivating(true);
      await activatePlusPlatformFn({
        data: {
          businessId: activeBusiness.id,
          platform,
        },
      });
      // Refetch insights to update dashboard
      const data = await getDashboardInsightsFn({
        data: {
          businessId: activeBusiness.id,
          range: timeRange
        }
      });
      setInsights(data);
    } catch (err) {
      console.error("Failed to activate social platform:", err);
    } finally {
      setActivating(false);
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
        const activatedPlatform = insights?.integrations?.instagram?.activatedPlatform;
        if (activatedPlatform && activatedPlatform !== platformKey) {
          isLocked = true;
          actualRequiredPlan = "Pro";
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

  const renderWebsiteAnalytics = (websiteData: any) => {
    if (!websiteData) return null;

    const metrics = websiteData.metrics || [];
    const chartData = websiteData.chartData || [];
    const topPages = websiteData.topPages || [];

    return (
      <div className="col-span-full bg-white border border-slate-100 rounded-3xl p-4 sm:p-6.5 shadow-[0_8px_30px_rgba(0,0,0,0.015)] flex flex-col gap-6 select-none animate-in fade-in-50 duration-300">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-slate-50 pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-800">Website Analytics</h3>
            {/* Desktop Date Dropdown */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as "30days" | "7days")}
              className="hidden sm:inline-block px-3 py-1.5 bg-slate-50 border border-slate-200/60 text-slate-700 rounded-xl text-[11px] font-bold cursor-pointer hover:bg-slate-100 transition-all outline-none"
            >
              <option value="30days">Last 30 Days</option>
              <option value="7days">Last 7 Days</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5">
            <div className="flex items-center gap-1.5 bg-[#FFF6F0] border border-[#FFDACB] px-2 py-0.5 rounded-lg">
              {/* Google Analytics SVG Logo */}
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="13" width="4" height="7" rx="1" fill="#F9AB00" />
                <rect x="10" y="8" width="4" height="12" rx="1" fill="#F25C05" />
                <rect x="17" y="3" width="4" height="17" rx="1" fill="#D93D0F" />
              </svg>
              <span className="text-[9px] font-extrabold text-[#D93D0F] uppercase tracking-wider">Source: Google Analytics 4</span>
            </div>
            {/* Mobile Date Dropdown */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as "30days" | "7days")}
              className="sm:hidden px-2.5 py-1 bg-slate-50 border border-slate-200/60 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-slate-100 transition-all outline-none"
            >
              <option value="30days">Last 30 Days</option>
              <option value="7days">Last 7 Days</option>
            </select>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          
          {/* Left Columns (Metrics & Chart) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* 4 Summary Columns in KPI panel layout */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
              {metrics.map((metric: any, idx: number) => {
                const isTrendPositive = metric.isPositive;
                return (
                  <div key={idx} className="p-1.5 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{metric.label}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg md:text-2xl font-black text-slate-800 leading-none">{metric.value}</span>
                      <span className={`text-[10px] font-black flex items-center ${isTrendPositive ? "text-emerald-500" : "text-rose-500"}`}>
                        {isTrendPositive ? "↑" : "↓"} {metric.trend.replace(/[↑↓\s\-]/g, "")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Line/Area Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 10 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 10 }}
                    tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1).replace(".0", "")}K` : val}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#10B981" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#colorViews)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column (Top Pages List) */}
          <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-6 flex flex-col gap-4">
            <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              <span>Top Pages</span>
              <span>Views</span>
            </div>
            <div className="divide-y divide-slate-100/50 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                {topPages.map((page: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-sm py-2 px-1 hover:bg-slate-50/50 rounded-lg transition-colors">
                    <span className="text-slate-600 font-mono truncate max-w-[170px]">{page.path}</span>
                    <span className="text-slate-800 font-black">{page.views.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

  const renderUnifiedConnectionGate = (
    title: string,
    description: string,
    buttonLabel: string,
    onConnect: () => void,
    icon: any,
    borderColor: string,
    isLocked: boolean = false,
    requiredPlan?: "Basic" | "Plus" | "Pro"
  ) => {
    const IconComponent = icon;
    
    return (
      <div
        style={{ borderColor: isLocked ? "#E5E7EB" : borderColor }}
        className={`col-span-full bg-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.015)] border ${
          isLocked ? "border-solid" : "border-dashed"
        } relative overflow-hidden select-none min-h-[160px] gap-6`}
      >
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 rounded-2xl bg-mm-subtle flex items-center justify-center shrink-0">
            <IconComponent className="h-6 w-6 text-mm-dark/70" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-mm-dark">{title}</h4>
            <p className="text-xs text-mm-gray leading-relaxed max-w-2xl">{description}</p>
          </div>
        </div>

        <div className="shrink-0 z-10">
          {isLocked ? (
            <button
              onClick={() => handleUpgrade(requiredPlan || "Basic")}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-mm-dark text-white font-extrabold text-xs rounded-xl hover:bg-mm-dark/90 transition-all cursor-pointer shadow-md"
            >
              <span>Upgrade to {requiredPlan}</span>
            </button>
          ) : (
            <button
              onClick={onConnect}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white font-extrabold text-xs rounded-xl hover:bg-blue-700 transition-all cursor-pointer shadow-md"
            >
              <span>{buttonLabel}</span>
            </button>
          )}
        </div>

        {isLocked && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[3px] flex flex-col items-center justify-center transition-all duration-300">
            <div className="flex flex-col items-center space-y-2.5 p-4 text-center">
              <div className="h-9 w-9 rounded-xl bg-mm-dark flex items-center justify-center shadow-md">
                <Lock className="h-4.5 w-4.5 text-white" />
              </div>
              <p className="text-xs font-bold text-mm-dark tracking-wide uppercase">
                {requiredPlan} Feature
              </p>
              <p className="text-[11px] text-mm-gray max-w-[280px]">
                {requiredPlan === "Basic" 
                  ? "Upgrade to Basic to connect Google services."
                  : "Upgrade to Plus to integrate Meta (Instagram & Facebook) social insights."}
              </p>
              <button
                onClick={() => handleUpgrade(requiredPlan || "Basic")}
                className="mt-1.5 flex items-center gap-1 px-4 py-1.5 bg-mm-dark hover:bg-mm-dark/90 text-white text-[10px] font-extrabold rounded-lg transition-all shadow-sm"
              >
                <span>Upgrade Plan</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPlusPlatformSelector = () => {
    return (
      <div className="col-span-full bg-white rounded-3xl p-8 flex flex-col items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.015)] border border-dashed border-mm-orange/40 relative overflow-hidden select-none min-h-[180px] text-center space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-mm-orange tracking-wider uppercase">
            Plus Plan Activation
          </span>
          <h4 className="text-sm font-bold text-mm-dark">Select Your Connected Platform</h4>
          <p className="text-xs text-mm-gray leading-relaxed max-w-md mx-auto">
            Under the Plus plan, you can integrate **one** social network. Choose the platform you wish to activate below (the other will be lock-gated).
          </p>
        </div>

        <div className="flex items-center gap-4 mt-2 z-10">
          <button
            onClick={() => handleActivatePlusPlatform("instagram")}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all duration-300 cursor-pointer"
          >
            <Instagram className="h-4 w-4" />
            <span>Activate Instagram</span>
          </button>
          <button
            onClick={() => handleActivatePlusPlatform("facebook")}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all duration-300 cursor-pointer"
          >
            <Facebook className="h-4 w-4" />
            <span>Activate Facebook</span>
          </button>
        </div>
      </div>
    );
  };

  const googleConnected = !!insights?.integrations?.google?.isConnected;
  const metaConnected = !!insights?.integrations?.instagram?.isConnected;
  const activatedPlatform = insights?.integrations?.instagram?.activatedPlatform;

  return (
    <div className="flex-1 w-full flex flex-col bg-[#F9FAFC]">
      {/* 1. Combined Greeting & Overall Score Banner (Full Width Background Header) */}
      <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#FFEADF] via-[#FFF3EE] to-[#FFF9F6] px-6 py-8 md:px-8 md:py-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#FFDACB]/25">
        
        {/* Left Side: Greeting */}
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-extrabold text-[#D93D0F] tracking-wide">
            {getGreeting()}
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-[#111418] min-h-[36px] flex items-center">
            {userName || (
              <span className="inline-block w-48 h-8 bg-[#FFDCD0]/40 animate-pulse rounded-lg" />
            )}
          </h2>
          <span className="text-xs font-semibold text-slate-600 mt-1">
            {getFormattedDate()}
          </span>
        </div>

        {/* Right Side: Overall Business Score (styled as a glass card inside the background layout) */}
        <div className="bg-white/75 backdrop-blur-sm border border-white/60 rounded-2xl p-4.5 flex items-center justify-between gap-6 shadow-[0_4px_20px_rgba(255,89,36,0.02)] w-full md:w-auto md:min-w-[240px] shrink-0 self-stretch md:self-auto">
          <span className="text-sm font-bold text-slate-800 leading-tight">
            Overall Business Score
          </span>
          
          {/* Circular Progress Ring */}
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="#FFDACB"
                strokeWidth="9"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="#FF5924"
                strokeWidth="9"
                fill="none"
                strokeDasharray={238}
                strokeDashoffset={238 - (238 * 42) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="text-sm font-black text-slate-800">42%</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full px-6 pt-8 pb-24 md:px-8 md:py-10 space-y-8">

      {/* 3. Analytics Section - Gated by Subscription Plan Tier */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            {/* 1. Google Services Block */}
            {plan === "None" ? (
              renderUnifiedConnectionGate(
                "Connect Google Services",
                "Link your Google account to fetch Analytics (GA4) and Google Business Profile performance metrics.",
                "Connect Google",
                () => handleConnect("google"),
                Globe,
                "#3B82F6",
                true,
                "Basic"
              )
            ) : !googleConnected ? (
              renderUnifiedConnectionGate(
                "Connect Google Services",
                "Link your Google account to fetch Analytics (GA4) and Google Business Profile performance metrics.",
                "Connect Google",
                () => handleConnect("google"),
                Globe,
                "#3B82F6",
                false
              )
            ) : (
              <>
                {/* First: The four insights cards (2 website, 2 google business) */}
                {renderPlatformInsights("website", "Website Analytics", Globe, "#5CB13E")}
                {renderPlatformInsights("google", "Google Business", Store, "#3B82F6")}
                
                {/* Then: The detailed website analytics graph card */}
                {renderWebsiteAnalytics(insights?.integrations?.website)}
              </>
            )}

            {/* 2. Meta Social Services Block */}
            {plan === "None" || plan === "Basic" ? (
              renderUnifiedConnectionGate(
                "Connect Meta Services",
                "Link your Meta account to integrate Instagram and Facebook social insights.",
                "Connect Meta",
                () => handleConnect("meta"),
                Instagram,
                "#FF7DD3",
                true,
                "Plus"
              )
            ) : !metaConnected ? (
              renderUnifiedConnectionGate(
                "Connect Meta Services",
                "Link your Meta account to integrate Instagram and Facebook social insights.",
                "Connect Meta",
                () => handleConnect("meta"),
                Instagram,
                "#FF7DD3",
                false
              )
            ) : plan === "Plus" && !activatedPlatform ? (
              renderPlusPlatformSelector()
            ) : (
              <>
                {renderPlatformInsights("instagram", "Instagram", Instagram, "#FF7DD3", "Plus")}
                {renderPlatformInsights("facebook", "Facebook", Facebook, "#1877F2", "Plus")}
              </>
            )}
          </>
        )}
      </section>

      {/* 4. Action / Task Section */}
      {(() => {
        const seoData = getDomainCardData("Website");
        const marketingData = getDomainCardData("Marketing");
        const automationData = getDomainCardData("Automation");

        if (businessLoading || projectsLoading) {
          return (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-mm-border rounded-3xl p-6.5 flex flex-col justify-between min-h-[380px] shadow-[0_8px_30px_rgba(0,0,0,0.015)] animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-mm-subtle" />
                    <div className="h-4.5 w-32 bg-mm-subtle rounded-md" />
                  </div>
                  <div className="space-y-4 mt-6">
                    <div className="h-3 w-16 bg-mm-subtle rounded-md" />
                    <div className="h-2 w-full bg-mm-subtle rounded-full" />
                  </div>
                  <div className="space-y-4 mt-6 flex-1">
                    <div className="space-y-2">
                      <div className="h-2.5 w-20 bg-mm-subtle rounded-md" />
                      <div className="h-4 w-40 bg-mm-subtle rounded-md" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2.5 w-20 bg-mm-subtle rounded-md" />
                      <div className="h-4 w-40 bg-mm-subtle rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </section>
          );
        }

        return isMobile ? (
          <section className="w-full overflow-hidden py-3">
            {/* Horizontal Swipable list on mobile */}
            <div
              onScroll={handleScroll}
              className="w-full flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none px-6"
            >
              {/* Card 1: Website and SEO */}
              <div className="w-[calc(100vw-48px)] sm:w-[340px] shrink-0 snap-center">
                <BusinessTaskCard
                  name="Website and SEO"
                  category="seo"
                  progress={seoData.progress}
                  currentTask={seoData.currentTask}
                  upcomingTask={seoData.upcomingTask}
                  onViewMore={() =>
                    navigate({ to: "/projects", search: { activeCard: "seo" } })
                  }
                />
              </div>

              {/* Card 2: Marketing */}
              <div className="w-[calc(100vw-48px)] sm:w-[340px] shrink-0 snap-center">
                <BusinessTaskCard
                  name="Marketing"
                  category="marketing"
                  progress={marketingData.progress}
                  currentTask={marketingData.currentTask}
                  upcomingTask={marketingData.upcomingTask}
                  onViewMore={() =>
                    navigate({ to: "/projects", search: { activeCard: "marketing" } })
                  }
                />
              </div>

              {/* Card 3: Automation */}
              <div className="w-[calc(100vw-48px)] sm:w-[340px] shrink-0 snap-center">
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
                    progress={automationData.progress}
                    currentTask={automationData.currentTask}
                    upcomingTask={automationData.upcomingTask}
                    onViewMore={() =>
                      navigate({
                        to: "/projects",
                        search: { activeCard: "automation" },
                      })
                    }
                  />
                </PlanGate>
              </div>
            </div>

            {/* Carousel Scroll Dots Indicator */}
            <div className="flex justify-center gap-2 mt-3.5">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    scrollIndex === idx ? "bg-[#FF5924] w-4" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </section>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Website and SEO */}
            <BusinessTaskCard
              name="Website and SEO"
              category="seo"
              progress={seoData.progress}
              currentTask={seoData.currentTask}
              upcomingTask={seoData.upcomingTask}
              onViewMore={() =>
                navigate({ to: "/projects", search: { activeCard: "seo" } })
              }
            />

            {/* Card 2: Marketing */}
            <BusinessTaskCard
              name="Marketing"
              category="marketing"
              progress={marketingData.progress}
              currentTask={marketingData.currentTask}
              upcomingTask={marketingData.upcomingTask}
              onViewMore={() =>
                navigate({ to: "/projects", search: { activeCard: "marketing" } })
              }
            />

            {/* Card 3: Automation */}
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
                progress={automationData.progress}
                currentTask={automationData.currentTask}
                upcomingTask={automationData.upcomingTask}
                onViewMore={() =>
                  navigate({
                    to: "/projects",
                    search: { activeCard: "automation" },
                  })
                }
              />
            </PlanGate>
          </section>
        );
      })()}

      {/* 5. Full-width Upgrade Card at the Bottom */}
      <div className="mt-8 pt-8 border-t border-slate-100">
        <UpgradeCard />
      </div>
    </div>
  </div>
);
}
