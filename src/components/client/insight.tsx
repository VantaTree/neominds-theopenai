import React from "react";
import { ArrowUp, ArrowDown, LucideIcon, Lock } from "lucide-react";

export interface InsightProps {
  label: string;
  value: string;
  trend: string;
  isPositive?: boolean;
  borderColor?: string; // Tailwind class name or Hex color code
  platform?: string; // Name of platform (e.g. Website, Google, Instagram, Facebook)
  icon?: LucideIcon; // Icon corresponding to platform
  locked?: boolean;
  requiredPlan?: "Plus" | "Pro";
  onUpgrade?: () => void;
}

export default function Insight({
  label,
  value,
  trend,
  isPositive = true,
  borderColor,
  platform,
  icon: Icon,
  locked = false,
  requiredPlan,
  onUpgrade,
}: InsightProps) {
  // Check if borderColor is a Hex/RGB/HSL string or Tailwind border class
  const isCssColor =
    borderColor &&
    (borderColor.startsWith("#") ||
      borderColor.startsWith("rgb") ||
      borderColor.startsWith("hsl"));

  const borderStyle: React.CSSProperties = isCssColor
    ? { borderColor }
    : {};

  const borderClass = isCssColor
    ? "border"
    : borderColor
      ? `border ${borderColor}`
      : "border border-mm-border";

  return (
    <div
      className={`bg-white rounded-2xl p-5 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.015)] relative overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 select-none ${borderClass}`}
      style={borderStyle}
    >
      <div className={`flex flex-col justify-between flex-1 ${locked ? "mm-card-blur" : ""}`}>
        {/* Header with Platform & Icon */}
        <div className="flex items-center justify-between mb-4">
          {platform && (
            <span className="text-[10px] font-extrabold text-mm-gray/80 tracking-wider uppercase">
              {platform}
            </span>
          )}
          {Icon && (
            <div className="p-1.5 rounded-lg bg-mm-subtle flex items-center justify-center">
              <Icon className="h-3.5 w-3.5 text-mm-dark/70" />
            </div>
          )}
        </div>

        {/* Metric Content */}
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold text-mm-gray uppercase tracking-wider truncate block">
            {label}
          </span>
          <div className="flex items-baseline justify-between gap-2 mt-1">
            <span className="text-[24px] font-black text-mm-dark tracking-tight leading-none">
              {value}
            </span>
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold leading-none ${
                isPositive ? "text-emerald-600 bg-emerald-50" : "text-red-500 bg-red-50"
              }`}
            >
              {isPositive ? (
                <ArrowUp className="h-2.5 w-2.5 stroke-[3]" />
              ) : (
                <ArrowDown className="h-2.5 w-2.5 stroke-[3]" />
              )}
              <span>{trend}</span>
            </span>
          </div>
        </div>
      </div>

      {locked && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onUpgrade?.();
          }}
          className="absolute inset-0 flex flex-col items-center justify-center p-3 bg-white/45 cursor-pointer z-10 hover:bg-white/35 transition-all duration-300 animate-in fade-in"
        >
          <div className="h-9 w-9 rounded-full bg-mm-orange/15 border border-mm-orange/30 flex items-center justify-center mb-1.5 shadow-[0_4px_12px_rgba(255,89,36,0.1)]">
            <Lock className="h-4 w-4 text-mm-orange" />
          </div>
          <span className="text-[11px] font-extrabold text-mm-dark uppercase tracking-wider">
            {requiredPlan} Feature
          </span>
          <span className="text-[10px] text-mm-orange font-bold hover:underline mt-0.5">
            Upgrade to unlock
          </span>
        </div>
      )}
    </div>
  );
}
