import React from "react";
import { Lock, Crown } from "lucide-react";
import { useBusiness } from "@/hooks/use-business";
import { type BusinessPlan } from "@/lib/schemas";

const PLAN_HIERARCHY: Record<BusinessPlan, number> = {
  None: 0,
  Basic: 1,
  Plus: 2,
  Pro: 3,
};

interface PlanGateProps {
  requiredPlan: BusinessPlan;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function hasPlanAccess(currentPlan: BusinessPlan, requiredPlan: BusinessPlan): boolean {
  const current = PLAN_HIERARCHY[currentPlan] ?? 0;
  const required = PLAN_HIERARCHY[requiredPlan] ?? 0;
  return current >= required;
}

export default function PlanGate({ requiredPlan, fallback, children }: PlanGateProps) {
  const { activeBusiness } = useBusiness();
  const currentPlan = activeBusiness?.plan || "None";

  if (!hasPlanAccess(currentPlan, requiredPlan)) {
    return (
      fallback || (
        <div className="bg-[#FFFDF8] border border-amber-200 rounded-3xl p-6.5 flex flex-col justify-between items-center text-center min-h-[380px] shadow-[0_8px_30px_rgba(245,158,11,0.03)] relative overflow-hidden select-none hover:shadow-[0_12px_40px_rgba(245,158,11,0.06)] transition-all duration-300">
          {/* Background radial soft light */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,211,0,0.05)_0%,transparent_70%)] pointer-events-none" />

          <div className="flex-1 flex flex-col items-center justify-center space-y-5 relative z-10">
            {/* Lock Badge */}
            <div className="h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-[0_4px_20px_rgba(245,158,11,0.1)]">
              <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                <Lock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            
            {/* Content text */}
            <div className="space-y-2">
              <h3 className="text-[17px] font-black text-mm-dark leading-tight tracking-tight max-w-[200px] mx-auto">
                Feature Locked
              </h3>
              <p className="text-xs text-mm-gray leading-relaxed max-w-[220px] mx-auto">
                This feature requires the <strong className="text-amber-600">{requiredPlan}</strong> plan. Your current plan is <strong className="text-mm-dark">{currentPlan}</strong>.
              </p>
            </div>
          </div>

          {/* Upgrade Button */}
          <button className="w-full inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-3 px-5 rounded-2xl shadow-sm transition-all active:scale-95 cursor-pointer relative z-10">
            <Crown className="h-4 w-4 fill-white text-amber-500" />
            <span>Upgrade to {requiredPlan}</span>
          </button>
        </div>
      )
    );
  }

  return <>{children}</>;
}
