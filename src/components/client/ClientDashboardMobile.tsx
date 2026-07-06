import React from "react";
import { Smartphone, LayoutDashboard, Briefcase, ChevronRight } from "lucide-react";

export default function ClientDashboardMobile() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center font-sans select-none bg-white">
      {/* Decorative Gradient Background Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,89,36,0.03)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(255,233,38,0.03)_0%,transparent_60%)] pointer-events-none" />

      {/* Main Glassmorphic Placeholder Card */}
      <div className="max-w-md w-full bg-[#FAF8FC]/50 border border-mm-border rounded-3xl p-8 space-y-6 shadow-sm backdrop-blur-xs relative z-10">
        
        {/* Mobile Icon Badge */}
        <div className="h-16 w-16 rounded-full bg-mm-orange/10 border border-mm-orange/20 flex items-center justify-center mx-auto shadow-[0_4px_20px_rgba(255,89,36,0.05)]">
          <Smartphone className="h-6 w-6 text-mm-orange" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h2 className="text-xl font-black text-mm-dark tracking-tight">Mobile View Active</h2>
          <p className="text-sm text-mm-gray leading-relaxed max-w-[280px] mx-auto">
            The mobile-specific dashboard layout is currently in design. Please switch to a tablet or desktop screen (&gt;768px) to view the full analytics dashboard.
          </p>
        </div>

        {/* Action Teasers */}
        <div className="border-t border-mm-border/80 pt-5 space-y-3">
          <div className="flex items-center justify-between p-3.5 bg-white border border-mm-border rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-orange-50 flex items-center justify-center">
                <LayoutDashboard className="h-4.5 w-4.5 text-mm-orange" />
              </div>
              <span className="text-xs font-bold text-mm-dark">Analytics Dashboard</span>
            </div>
            <span className="text-[10px] font-bold text-mm-orange bg-mm-orange/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Desktop
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-white border border-mm-border rounded-2xl opacity-75">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <Briefcase className="h-4.5 w-4.5 text-blue-600" />
              </div>
              <span className="text-xs font-bold text-mm-dark">Projects Portal</span>
            </div>
            <ChevronRight className="h-4 w-4 text-mm-gray" />
          </div>
        </div>

      </div>
    </div>
  );
}
