import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import AnalyticsCard, { CardData, MOCK_DATA, THEME_STYLES, getScaledData } from "./AnalyticsCard";
import BusinessTaskCard from "./BusinessTaskCard";
import UpgradeCard from "./UpgradeCard";
import {
  Store,
  Globe,
  Heart,
  Megaphone,
  ChevronDown,
  X
} from "lucide-react";

export default function ClientDashboardMobile() {
  const [activeCategory, setActiveCategory] = useState<"google" | "website" | "social" | "campaign" | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
    google: "Last 30 Days",
    website: "Last 30 Days",
    social: "Last 30 Days",
    campaign: "Last 30 Days"
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  // Sparkline SVG generator
  const renderSparkline = (category: "google" | "website" | "social" | "campaign", chartData: number[]) => {
    if (!chartData || chartData.length < 2) return null;
    const style = THEME_STYLES[category];
    const min = Math.min(...chartData);
    const max = Math.max(...chartData);
    const range = max - min || 1;

    const width = 180;
    const height = 60;
    const padding = 6;

    const points = chartData.map((val, idx) => {
      const x = (idx / (chartData.length - 1)) * width;
      const y = height - padding - ((val - min) / range) * (height - 2 * padding);
      return { x, y };
    });

    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const xc = (curr.x + next.x) / 2;
      const yc = (curr.y + next.y) / 2;
      linePath += ` Q ${curr.x} ${curr.y}, ${xc} ${yc}`;
    }
    const last = points[points.length - 1];
    linePath += ` L ${last.x} ${last.y}`;

    const fillPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

    return (
      <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`mob-grad-${category}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={style.stroke} stopOpacity={0.15} />
            <stop offset="100%" stopColor={style.stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={fillPath} fill={`url(#mob-grad-${category})`} />
        <path d={linePath} fill="none" stroke={style.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  // Categories helper mapping
  const categories: ("google" | "website" | "social" | "campaign")[] = ["google", "website", "social", "campaign"];

  return (
    <div className="min-h-screen bg-[#F9FAFC] flex flex-col font-sans select-none relative pb-20">
      


      {/* 2. Analytics 2x2 Grid */}
      <section className="grid grid-cols-2 gap-3.5 px-4.5 py-3">
        {categories.map((cat) => {
          const cardInfo = getScaledData(MOCK_DATA[cat], selectedFilters[cat]);
          const theme = THEME_STYLES[cat];
          const Icon = cat === "google" ? Store : cat === "website" ? Globe : cat === "social" ? Heart : Megaphone;

          return (
            <div key={cat} className="bg-white border border-mm-border rounded-xl p-4 flex flex-col justify-between space-y-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.008)]">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className={`p-1.5 rounded-lg border flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                    <Icon className={`h-3.5 w-3.5 ${theme.iconColor}`} />
                  </div>
                  <span className="text-[11px] font-extrabold text-mm-dark truncate leading-tight">
                    {cardInfo.name.split(" ")[0]} {cardInfo.name.split(" ")[1] || ""}
                  </span>
                </div>
              </div>

              {/* Sparkline Graphic */}
              <div className="w-full h-12 overflow-hidden relative mt-1.5">
                {renderSparkline(cat, cardInfo.chartData)}
              </div>

              {/* Filter Selector Button (Above View Analytics) */}
              <div className="relative w-full" ref={cat === activeDropdown ? dropdownRef : null}>
                <button
                  onClick={() => setActiveDropdown(activeDropdown === cat ? null : cat)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border border-mm-border/40 text-[9px] font-extrabold text-mm-dark bg-mm-subtle hover:bg-mm-subtle/85 cursor-pointer transition-colors"
                >
                  <span className="text-mm-gray">Range:</span>
                  <span className="flex items-center gap-0.5">
                    {selectedFilters[cat].replace("Last ", "")}
                    <ChevronDown className="h-2.5 w-2.5 text-mm-gray/70" />
                  </span>
                </button>

                {activeDropdown === cat && (
                  <div className="absolute left-0 right-0 bottom-full mb-1 bg-white border border-mm-border rounded-xl shadow-lg py-1.5 z-30 font-sans">
                    {["Last 7 Days", "Last 10 Days", "Last 30 Days"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSelectedFilters(prev => ({ ...prev, [cat]: opt }));
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-3.5 py-1.5 text-[10px] font-bold transition-colors cursor-pointer ${
                          selectedFilters[cat] === opt ? "text-mm-orange bg-mm-orange/5" : "text-mm-gray hover:text-mm-dark"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View Analytics Button (Light themed colored background) */}
              <button
                onClick={() => setActiveCategory(cat)}
                className={`w-full py-1.5 text-[10px] font-black rounded-xl flex items-center justify-center gap-0.5 transition-colors cursor-pointer ${
                  cat === "google" ? "bg-blue-50/70 text-blue-600 hover:bg-blue-100/70" :
                  cat === "website" ? "bg-emerald-50/70 text-[#5CB13E] hover:bg-emerald-100/70" :
                  cat === "social" ? "bg-pink-50/70 text-[#FF7DD3] hover:bg-pink-100/70" :
                  "bg-indigo-50/70 text-indigo-600 hover:bg-indigo-100/70"
                }`}
              >
                <span>View Analytics</span>
              </button>
            </div>
          );
        })}
      </section>

      {/* 3. Horizontal Swipable Progress Cards (Carousel) */}
      <section className="w-full overflow-hidden py-3">
        <div className="w-full flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none px-4.5">
          
          {/* Swipable Card 1: Website and SEO */}
          <div className="w-[84vw] shrink-0 snap-center">
            <BusinessTaskCard
              name="Website and SEO"
              category="seo"
              progress={80}
              currentTask={{
                title: "On-Page SEO Optimization",
                description: "Optimizing meta tags and content"
              }}
              upcomingTask={{
                title: "Technical SEO Audit",
                description: "Site speed and mobile usability check"
              }}
            />
          </div>

          {/* Swipable Card 2: Marketing */}
          <div className="w-[84vw] shrink-0 snap-center">
            <BusinessTaskCard
              name="Marketing"
              category="marketing"
              progress={65}
              currentTask={{
                title: "Social Media Campaign",
                description: "Running engagement campaign"
              }}
              upcomingTask={{
                title: "Content Calendar",
                description: "Planning posts for next month"
              }}
            />
          </div>

          {/* Swipable Card 3: Automation (Locked) */}
          <div className="w-[84vw] shrink-0 snap-center">
            <BusinessTaskCard
              name="Automation"
              category="automation"
              locked={true}
            />
          </div>

        </div>
      </section>

      {/* 4. Upgrade Features Card */}
      <section className="px-4.5 py-3.5">
        <UpgradeCard />
      </section>

      {/* Bottom spacing to prevent content cut-off behind bottom nav */}
      <div className="h-20 shrink-0" />

      {/* 6. Sliding Bottom Sheet Drawer for Analytics Details */}
      {activeCategory && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setActiveCategory(null)}
            className="absolute inset-0 bg-mm-dark/45 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in-50"
          />

          {/* Drawer Container Panel */}
          <div className="bg-white border-t border-mm-border rounded-t-3xl shadow-2xl relative z-10 p-6.5 max-h-[82vh] overflow-y-auto space-y-5 animate-in slide-in-from-bottom duration-300 flex flex-col font-sans">
            
            {/* Header Drag Indicator Bar */}
            <div className="w-10 h-1.5 bg-mm-subtle rounded-full mx-auto -mt-2.5 mb-2.5 shrink-0" />

            {/* Header info */}
            <div className="flex items-center justify-between shrink-0">
              <h3 className="text-lg font-black text-mm-dark">Analytics Insights</h3>
              {/* Close Button */}
              <button
                onClick={() => setActiveCategory(null)}
                className="p-1.5 text-mm-gray hover:text-mm-dark hover:bg-mm-subtle rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Renders the full reusable AnalyticsCard component */}
            <div className="flex-1">
              <AnalyticsCard category={activeCategory} />
            </div>

            {/* Quick action button inside panel */}
            <button
              onClick={() => setActiveCategory(null)}
              className="w-full py-3 bg-mm-orange hover:opacity-95 text-white text-xs font-bold rounded-2xl shadow-sm transition-all active:scale-95 cursor-pointer mt-4"
            >
              Close Details
            </button>

          </div>
        </div>
      )}
    </div>
  );
}