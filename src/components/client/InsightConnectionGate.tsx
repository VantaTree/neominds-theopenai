import React from "react";
import { LucideIcon, Plus } from "lucide-react";

interface InsightConnectionGateProps {
  platform: string;
  icon: LucideIcon;
  borderColor: string;
  onConnect: () => void;
}

export default function InsightConnectionGate({
  platform,
  icon: Icon,
  borderColor,
  onConnect,
}: InsightConnectionGateProps) {
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
      className={`bg-white rounded-2xl p-5 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.015)] border-dashed relative overflow-hidden h-[155px] select-none hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] transition-all duration-300 ${borderClass}`}
      style={borderStyle}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold text-mm-gray/80 tracking-wider uppercase">
          {platform}
        </span>
        <div className="p-1.5 rounded-lg bg-mm-subtle flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-mm-dark/40" />
        </div>
      </div>

      <div className="space-y-2 mt-4">
        <p className="text-[11px] font-bold text-mm-gray leading-tight">
          Connect your {platform} account to view analytics.
        </p>
        <button
          onClick={onConnect}
          className="flex items-center gap-1 px-3 py-1.5 bg-mm-subtle hover:bg-mm-orange/10 hover:text-mm-orange text-mm-dark font-bold text-[11px] rounded-xl transition-all cursor-pointer w-fit"
        >
          <Plus className="h-3 w-3" />
          <span>Connect</span>
        </button>
      </div>
    </div>
  );
}
