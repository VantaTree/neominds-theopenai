import React, { useState, useEffect, useRef } from "react";
import { Store, Globe, Heart, Megaphone, ArrowUp, ArrowDown, ChevronDown } from "lucide-react";

export interface InsightItem {
  label: string;
  value: string;
  trend: string;
  isPositive: boolean;
}

export interface CardData {
  name: string;
  filter: string;
  category: "google" | "website" | "social" | "campaign";
  insights: InsightItem[];
  chartData: number[];
  dates: string[];
}

export interface AnalyticsCardProps {
  apiUrl?: string;
  category: "google" | "website" | "social" | "campaign";
}

export const MOCK_DATA: Record<string, CardData> = {
  google: {
    name: "Google Business Profile",
    filter: "30 Days",
    category: "google",
    insights: [
      { label: "Searches", value: "1.2K", trend: "18.6%", isPositive: true },
      { label: "Profile Views", value: "2.6K", trend: "24.3%", isPositive: true },
      { label: "Calls", value: "312", trend: "12.5%", isPositive: true },
      { label: "Direction Requests", value: "152", trend: "8.1%", isPositive: true },
      { label: "Website Clicks", value: "289", trend: "15.7%", isPositive: true }
    ],
    chartData: [45, 60, 50, 75, 70, 95, 80, 110, 90, 120, 105, 125, 115, 130],
    dates: ["Apr 21", "Apr 28", "May 5", "May 12", "May 19"]
  },
  website: {
    name: "Website Analytics",
    filter: "30 Days",
    category: "website",
    insights: [
      { label: "Visitors", value: "5.4K", trend: "21.4%", isPositive: true },
      { label: "Sessions", value: "7.8K", trend: "18.7%", isPositive: true },
      { label: "Bounce Rate", value: "43.6%", trend: "-5.3%", isPositive: false },
      { label: "Avg. Session", value: "02:45", trend: "8.6%", isPositive: true },
      { label: "Pages / Session", value: "3.2", trend: "6.1%", isPositive: true }
    ],
    chartData: [300, 420, 380, 520, 480, 600, 500, 620, 540, 680, 610, 710, 680, 780],
    dates: ["Apr 21", "Apr 28", "May 5", "May 12", "May 19"]
  },
  social: {
    name: "Social Media Performance",
    filter: "30 Days",
    category: "social",
    insights: [
      { label: "Followers", value: "12.8K", trend: "14.2%", isPositive: true },
      { label: "Reach", value: "45.6K", trend: "23.1%", isPositive: true },
      { label: "Engagement", value: "3.7K", trend: "16.8%", isPositive: true },
      { label: "Impressions", value: "98.3K", trend: "19.3%", isPositive: true },
      { label: "Profile Visits", value: "2.1K", trend: "11.5%", isPositive: true }
    ],
    chartData: [1100, 1400, 1300, 1700, 1500, 2000, 1750, 2100, 1850, 2300, 2100, 2600, 2300, 2900],
    dates: ["Apr 21", "Apr 28", "May 5", "May 12", "May 19"]
  },
  campaign: {
    name: "Campaign Overview",
    filter: "30 Days",
    category: "campaign",
    insights: [
      { label: "Ad Spend", value: "$2.45K", trend: "12.6%", isPositive: true },
      { label: "Clicks", value: "3.6K", trend: "15.3%", isPositive: true },
      { label: "CTR", value: "4.32%", trend: "8.4%", isPositive: true },
      { label: "Conversions", value: "156", trend: "18.7%", isPositive: true },
      { label: "Cost / Conversion", value: "$15.71", trend: "-4.2%", isPositive: false }
    ],
    chartData: [1200, 1600, 1400, 1950, 1750, 2200, 1900, 2500, 2250, 2800, 2600, 3100, 2850, 3200],
    dates: ["Apr 21", "Apr 28", "May 5", "May 12", "May 19"]
  }
};

export const THEME_STYLES = {
  google: {
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50 border-blue-100",
    stroke: "#3B82F6",
    gradientStart: "rgba(59, 130, 246, 0.15)",
    gradientEnd: "rgba(59, 130, 246, 0)",
    gridBg: "bg-blue-50/20"
  },
  website: {
    iconColor: "text-[#5CB13E]",
    iconBg: "bg-emerald-50 border-emerald-100",
    stroke: "#5CB13E",
    gradientStart: "rgba(92, 177, 62, 0.15)",
    gradientEnd: "rgba(92, 177, 62, 0)",
    gridBg: "bg-emerald-50/20"
  },
  social: {
    iconColor: "text-[#FF7DD3]",
    iconBg: "bg-pink-50 border-pink-100",
    stroke: "#FF7DD3",
    gradientStart: "rgba(255, 125, 211, 0.15)",
    gradientEnd: "rgba(255, 125, 211, 0)",
    gridBg: "bg-pink-50/20"
  },
  campaign: {
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-50 border-indigo-100",
    stroke: "#6366F1",
    gradientStart: "rgba(99, 102, 241, 0.15)",
    gradientEnd: "rgba(99, 102, 241, 0)",
    gridBg: "bg-indigo-50/20"
  }
};

export function getScaledData(data: CardData, filter: string): CardData {
  const factor = filter === "Last 7 Days" ? 0.23 : filter === "Last 10 Days" ? 0.35 : 1.0;

  const scaleValue = (valStr: string) => {
    if (valStr.includes(":")) {
      return factor === 1.0 ? valStr : factor === 0.35 ? "00:58" : "00:41";
    }
    if (valStr.includes("%")) {
      const val = parseFloat(valStr);
      return `${(val * (0.9 + factor * 0.1)).toFixed(1)}%`;
    }

    const isCurrency = valStr.startsWith("$");
    const clean = isCurrency ? valStr.slice(1) : valStr;
    const isK = clean.endsWith("K");
    const numStr = isK ? clean.slice(0, -1) : clean;

    const num = parseFloat(numStr);
    if (isNaN(num)) return valStr;

    const scaled = num * factor;
    let result = "";
    if (isK) {
      result = `${scaled.toFixed(1)}K`;
    } else if (scaled > 10) {
      result = Math.round(scaled).toString();
    } else {
      result = scaled.toFixed(2);
    }
    return isCurrency ? `$${result}` : result;
  };

  const scaledInsights = data.insights.map(ins => ({
    ...ins,
    value: scaleValue(ins.value),
    trend: `${(parseFloat(ins.trend) * (0.95 + (factor - 1) * 0.05)).toFixed(1)}%`
  }));

  const chartSlice = filter === "Last 7 Days"
    ? data.chartData.slice(-7)
    : filter === "Last 10 Days"
      ? data.chartData.slice(-10)
      : data.chartData;

  const datesSlice = filter === "Last 7 Days"
    ? ["May 13", "May 15", "May 17", "May 19"]
    : filter === "Last 10 Days"
      ? ["May 10", "May 13", "May 16", "May 19"]
      : data.dates;

  return {
    ...data,
    filter,
    insights: scaledInsights,
    chartData: chartSlice,
    dates: datesSlice
  };
}

export default function AnalyticsCard({ apiUrl, category }: AnalyticsCardProps) {
  const [data, setData] = useState<CardData>(MOCK_DATA[category]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Last 30 Days");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!apiUrl) {
      setData(MOCK_DATA[category]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Fetch failed");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.warn(`AnalyticsCard fetch error for ${category}, falling back to mock data:`, err);
        // Fall back to local mock data
        setData(MOCK_DATA[category]);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, category]);

  const style = THEME_STYLES[category];

  // Helper to choose corresponding Lucide Icon
  const renderIcon = () => {
    switch (category) {
      case "google":
        return <Store className={`h-4.5 w-4.5 ${style.iconColor}`} />;
      case "website":
        return <Globe className={`h-4.5 w-4.5 ${style.iconColor}`} />;
      case "social":
        return <Heart className={`h-4.5 w-4.5 ${style.iconColor}`} />;
      case "campaign":
        return <Megaphone className={`h-4.5 w-4.5 ${style.iconColor}`} />;
    }
  };

  const displayData = getScaledData(data, selectedFilter);

  // Sparkline SVG generators
  const buildSparklinePaths = (chartData: number[]) => {
    if (!chartData || chartData.length < 2) return { linePath: "", fillPath: "" };

    const min = Math.min(...chartData);
    const max = Math.max(...chartData);
    const range = max - min || 1;

    const width = 380;
    const height = 100;
    const padding = 10;

    const points = chartData.map((val, idx) => {
      const x = (idx / (chartData.length - 1)) * width;
      const y = height - padding - ((val - min) / range) * (height - 2 * padding);
      return { x, y };
    });

    // Generate smooth cubic bezier paths
    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const xc = (curr.x + next.x) / 2;
      const yc = (curr.y + next.y) / 2;
      linePath += ` Q ${curr.x} ${curr.y}, ${xc} ${yc}`;
    }
    // End line at the last point
    const last = points[points.length - 1];
    linePath += ` L ${last.x} ${last.y}`;

    // Generate fill path from the line path wrapping to the bottom
    const fillPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

    return { linePath, fillPath };
  };

  const { linePath, fillPath } = buildSparklinePaths(displayData.chartData);

  return (
    <div className="bg-white border border-mm-border rounded-3xl p-6.5 flex flex-col justify-between space-y-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] relative overflow-visible select-none">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border flex items-center justify-center ${style.iconBg}`}>
            {renderIcon()}
          </div>
          <h3 className="text-[15px] font-bold text-mm-dark tracking-tight">{displayData.name}</h3>
        </div>

        {/* Filter Dropdown */}
        <div className="relative shrink-0 ml-2" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-mm-border text-[11px] font-bold text-mm-gray hover:bg-mm-subtle transition-all cursor-pointer whitespace-nowrap"
          >
            <span>{selectedFilter}</span>
            <ChevronDown className="h-3 w-3 text-mm-gray/80" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-32 bg-white border border-mm-border rounded-xl shadow-md py-1.5 z-20 font-sans animate-in fade-in-50 slide-in-from-top-1">
              {["Last 7 Days", "Last 10 Days", "Last 30 Days"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setSelectedFilter(opt);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-1.5 text-[11px] font-bold transition-colors cursor-pointer ${
                    selectedFilter === opt
                      ? "text-mm-orange bg-mm-orange/5"
                      : "text-mm-gray hover:text-mm-dark hover:bg-mm-subtle"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid of 5 Insights */}
      <div className="space-y-3">
        {/* Row 1 (3 Metrics) */}
        <div className="grid grid-cols-3 gap-2.5">
          {displayData.insights.slice(0, 3).map((insight, idx) => (
            <div key={idx} className={`p-3 rounded-2xl border border-mm-border/50 flex flex-col justify-between space-y-1.5 ${style.gridBg}`}>
              <span className="text-[10px] font-extrabold text-mm-gray uppercase tracking-wider truncate">
                {insight.label}
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-[16px] font-black text-mm-dark leading-tight">{insight.value}</span>
                <span className={`inline-flex items-center gap-0.5 text-[10px] font-extrabold leading-none ${insight.isPositive ? "text-emerald-600" : "text-red-500"}`}>
                  {insight.isPositive ? <ArrowUp className="h-2.5 w-2.5 stroke-[3]" /> : <ArrowDown className="h-2.5 w-2.5 stroke-[3]" />}
                  <span>{insight.trend}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Row 2 (2 Metrics) */}
        <div className="grid grid-cols-2 gap-2.5">
          {displayData.insights.slice(3, 5).map((insight, idx) => (
            <div key={idx} className={`p-3 rounded-2xl border border-mm-border/50 flex flex-col justify-between space-y-1.5 ${style.gridBg}`}>
              <span className="text-[10px] font-extrabold text-mm-gray uppercase tracking-wider truncate">
                {insight.label}
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-[16px] font-black text-mm-dark leading-tight">{insight.value}</span>
                <span className={`inline-flex items-center gap-0.5 text-[10px] font-extrabold leading-none ${insight.isPositive ? "text-emerald-600" : "text-red-500"}`}>
                  {insight.isPositive ? <ArrowUp className="h-2.5 w-2.5 stroke-[3]" /> : <ArrowDown className="h-2.5 w-2.5 stroke-[3]" />}
                  <span>{insight.trend}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Line Graph */}
      <div className="space-y-1.5 mt-2">
        <div className="w-full h-20 overflow-hidden relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 380 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`gradient-${category}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={style.stroke} stopOpacity={0.15} />
                <stop offset="100%" stopColor={style.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Sparkline Gradient Fill */}
            <path d={fillPath} fill={`url(#gradient-${category})`} />

            {/* Sparkline Line */}
            <path
              d={linePath}
              fill="none"
              stroke={style.stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Date Labels */}
        <div className="flex justify-between items-center px-1">
          {displayData.dates.map((date, idx) => (
            <span key={idx} className="text-[10px] font-bold text-mm-gray/65">
              {date}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
