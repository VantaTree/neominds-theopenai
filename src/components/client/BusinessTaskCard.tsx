import React from "react";
import { Monitor, Megaphone, Zap, Lock, MoreHorizontal, ArrowRight } from "lucide-react";

interface TaskDetails {
  title: string;
  description: string;
}

interface BusinessTaskCardProps {
  name: string;
  category: "seo" | "marketing" | "automation";
  progress?: number;
  currentTask?: TaskDetails;
  upcomingTask?: TaskDetails;
  locked?: boolean;
}

const CATEGORY_CONFIG = {
  seo: {
    icon: Monitor,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50 border-blue-100",
    progressBarBg: "bg-blue-600",
    accentBg: "bg-blue-500/5",
    accentText: "text-blue-700"
  },
  marketing: {
    icon: Megaphone,
    iconColor: "text-mm-orange",
    iconBg: "bg-orange-50 border-orange-100",
    progressBarBg: "bg-mm-orange",
    accentBg: "bg-mm-orange/5",
    accentText: "text-mm-orange"
  },
  automation: {
    icon: Zap,
    iconColor: "text-[#7C3AED]", // Fallback if needed, but we style lock with mm-orange/accent
    iconBg: "bg-purple-50 border-purple-100",
    progressBarBg: "bg-[#7C3AED]",
    accentBg: "bg-purple-500/5",
    accentText: "text-[#7C3AED]"
  }
};

export default function BusinessTaskCard({
  name,
  category,
  progress = 0,
  currentTask,
  upcomingTask,
  locked = false
}: BusinessTaskCardProps) {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;

  return (
    <div className="bg-white border border-mm-border rounded-3xl p-6.5 flex flex-col justify-between min-h-[380px] shadow-[0_8px_30px_rgba(0,0,0,0.015)] select-none hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] transition-all duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border flex items-center justify-center ${locked ? "bg-orange-50 border-orange-100" : config.iconBg}`}>
            {locked ? (
              <Zap className="h-4.5 w-4.5 text-mm-orange" />
            ) : (
              <Icon className={`h-4.5 w-4.5 ${config.iconColor}`} />
            )}
          </div>
          <h3 className="text-[15px] font-bold text-mm-dark tracking-tight">{name}</h3>
        </div>
        
        {/* Three dots menu */}
        <button className="p-1.5 text-mm-gray hover:text-mm-dark hover:bg-mm-subtle rounded-lg transition-colors cursor-pointer">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Conditionally Render Locked State or Task List */}
      {locked ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center space-y-5">
          {/* Lock Badge */}
          <div className="h-14 w-14 rounded-full bg-mm-orange/5 border border-mm-orange/15 flex items-center justify-center relative shadow-[inset_0_2px_8px_rgba(255,89,36,0.02)]">
            <div className="h-9 w-9 rounded-full bg-mm-orange/10 flex items-center justify-center border border-mm-orange/20">
              <Lock className="h-4.5 w-4.5 text-mm-orange" />
            </div>
          </div>
          
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-mm-dark">Upgrade your plan</h4>
            <p className="text-xs text-mm-gray leading-relaxed max-w-[200px] mx-auto">
              to unlock this feature and get access to custom automations.
            </p>
          </div>

          <button className="inline-flex items-center justify-center gap-2 bg-mm-orange hover:opacity-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer">
            Upgrade
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between mt-5.5 space-y-5">
          {/* Progress Bar Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-mm-gray uppercase tracking-wider">Progress</span>
              <span className="font-black text-mm-dark">{progress}%</span>
            </div>
            <div className="h-2 w-full bg-mm-subtle rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${config.progressBarBg}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Task Lists */}
          <div className="space-y-4 flex-1">
            {/* Current Task */}
            {currentTask && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-extrabold text-mm-gray uppercase tracking-wider">
                  <span className={`h-1.5 w-1.5 rounded-full ${config.progressBarBg}`} />
                  <span>Current Task</span>
                </div>
                <div className="pl-3.5">
                  <p className="text-[13px] font-bold text-mm-dark leading-snug">{currentTask.title}</p>
                  <p className="text-[11px] text-mm-gray mt-0.5 leading-snug truncate">{currentTask.description}</p>
                </div>
              </div>
            )}

            {/* Upcoming Task */}
            {upcomingTask && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-extrabold text-mm-gray uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-mm-gray/50" />
                  <span>Upcoming Task</span>
                </div>
                <div className="pl-3.5">
                  <p className="text-[13px] font-bold text-mm-dark/85 leading-snug">{upcomingTask.title}</p>
                  <p className="text-[11px] text-mm-gray mt-0.5 leading-snug truncate">{upcomingTask.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* View More Link */}
          <button className={`inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-transform duration-200 hover:translate-x-0.5 pt-2 self-start ${config.accentText}`}>
            <span>View More</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
