import React from "react";
import { ArrowUp, ArrowDown, LucideIcon } from "lucide-react";

export interface InsightProps {
  label: string;
  value: string;
  trend: string;
  isPositive?: boolean;
  borderColor?: string; // Tailwind class name or Hex color code
  platform?: string; // Name of platform (e.g. Website, Google, Instagram, Facebook)
  icon?: LucideIcon; // Icon corresponding to platform
}

export default function Insight({
  label,
  value,
  trend,
  isPositive = true,
  borderColor,
  platform,
  icon: Icon,
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
  );
}
