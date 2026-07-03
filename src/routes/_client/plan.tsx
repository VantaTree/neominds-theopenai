import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";

export const Route = createFileRoute("/_client/plan")({
  component: RouteComponent,
});

// Structured roadmap data for easy backend integration
interface RoadmapPhase {
  id: number;
  title: string;
  subtitle: string;
  durationDays: number;
  items: string[];
}

interface ImpactMetrics {
  traffic: string;
  leads: string;
  revenue: string;
}

interface RoadmapData {
  phases: RoadmapPhase[];
  impact: Record<string, ImpactMetrics>;
}

const PLAN_ROADMAP_DATA: RoadmapData = {
  phases: [
    {
      id: 1,
      title: "Foundation",
      subtitle: "Setup & Optimization",
      durationDays: 30,
      items: [
        "Website audit & optimization",
        "Google Business Profile optimization",
        "Keyword research & analysis",
        "Analytics & tracking setup",
      ],
    },
    {
      id: 2,
      title: "Growth",
      subtitle: "Visibility & Engagement",
      durationDays: 60,
      items: [
        "On-page SEO optimization",
        "Content creation & publishing",
        "Local SEO & citations",
        "Social media optimization",
      ],
    },
    {
      id: 3,
      title: "Scale",
      subtitle: "Leads & Conversions",
      durationDays: 90,
      items: [
        "Lead generation strategy",
        "Conversion rate optimization",
        "Email marketing automation",
        "Performance analysis & scaling",
      ],
    },
  ],
  impact: {
    "30": { traffic: "+35%", leads: "+25%", revenue: "+12%" },
    "60": { traffic: "+80%", leads: "+55%", revenue: "+22%" },
    "90": { traffic: "+120%", leads: "+80%", revenue: "+35%" },
  },
};

function RouteComponent() {
  const [activeTab, setActiveTab] = useState<string>("30");

  const currentImpact = PLAN_ROADMAP_DATA.impact[activeTab];

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2 font-sans text-mm-dark select-none">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-mm-dark font-sans">
          Growth Plan
        </h2>
        <p className="text-sm text-mm-gray mt-1">
          Your 90-Day Growth Roadmap
        </p>
      </div>

      {/* Timeline Toggle Buttons */}
      <div className="flex items-center gap-3 bg-white border border-mm-border rounded-2xl p-1.5 w-fit shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        <button
          onClick={() => setActiveTab("30")}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "30"
              ? "bg-mm-orange text-white shadow-sm"
              : "text-mm-gray hover:text-mm-dark hover:bg-mm-subtle/50"
          }`}
        >
          30 Days
        </button>
        <button
          onClick={() => setActiveTab("60")}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "60"
              ? "bg-mm-orange text-white shadow-sm"
              : "text-mm-gray hover:text-mm-dark hover:bg-mm-subtle/50"
          }`}
        >
          60 Days
        </button>
        <button
          onClick={() => setActiveTab("90")}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "90"
              ? "bg-mm-orange text-white shadow-sm"
              : "text-mm-gray hover:text-mm-dark hover:bg-mm-subtle/50"
          }`}
        >
          90 Days
        </button>
      </div>

      {/* Main Roadmap Card */}
      <div className="bg-white border border-mm-border rounded-[24px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
        {/* Timeline List */}
        <div className="relative pl-4 sm:pl-6 space-y-12">
          {PLAN_ROADMAP_DATA.phases.map((phase, idx) => {
            // Determine active states depending on day selected
            const tabDays = parseInt(activeTab, 10);
            const isPhaseActive = phase.durationDays <= tabDays;

            return (
              <div key={phase.id} className="relative group flex items-start gap-4 sm:gap-6 animate-fadeIn">
                {/* Connector Line between badges */}
                {idx !== PLAN_ROADMAP_DATA.phases.length - 1 && (
                  <div
                    className={`absolute left-[13px] sm:left-[17px] top-8 bottom-[-48px] w-[2px] transition-colors duration-300 ${
                      phase.durationDays < tabDays
                        ? "bg-mm-green"
                        : "bg-mm-border"
                    }`}
                  />
                )}

                {/* Badge Number Circle */}
                <div
                  className={`relative z-10 flex items-center justify-center h-7 w-7 sm:h-9 sm:w-9 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-300 shrink-0 ${
                    isPhaseActive
                      ? "bg-mm-green text-white"
                      : "bg-mm-subtle text-mm-gray"
                  }`}
                >
                  {phase.id}
                </div>

                {/* Phase Info Panel */}
                <div className={`space-y-4 flex-1 ${isPhaseActive ? "opacity-100" : "opacity-45"} transition-opacity duration-300`}>
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-mm-dark leading-snug">
                      {phase.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs font-semibold text-mm-gray">
                      {phase.subtitle}
                    </p>
                  </div>

                  {/* Phase Check Items */}
                  <ul className="space-y-2.5">
                    {phase.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-center gap-2.5">
                        <div
                          className={`p-1 rounded-full shrink-0 ${
                            isPhaseActive
                              ? "bg-mm-green/10 text-mm-green"
                              : "bg-mm-subtle text-mm-gray/60"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-mm-dark">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Estimated Impact Divider */}
        <div className="border-t border-mm-border/80 my-8 pt-8 space-y-4">
          <h3 className="text-xs font-bold text-mm-gray uppercase tracking-wider">
            Estimated Impact
          </h3>

          {/* Impact Grid cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* Impact Metric 1: Traffic */}
            <div className="bg-mm-subtle/25 border border-mm-border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-[inset_0_1px_3px_rgba(0,0,0,0.005)]">
              <span className="text-base sm:text-xl font-black text-mm-green">
                {currentImpact.traffic}
              </span>
              <span className="text-[10px] font-semibold text-mm-gray mt-1">
                Traffic
              </span>
            </div>
            {/* Impact Metric 2: Leads */}
            <div className="bg-mm-subtle/25 border border-mm-border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-[inset_0_1px_3px_rgba(0,0,0,0.005)]">
              <span className="text-base sm:text-xl font-black text-mm-green">
                {currentImpact.leads}
              </span>
              <span className="text-[10px] font-semibold text-mm-gray mt-1">
                Leads
              </span>
            </div>
            {/* Impact Metric 3: Revenue */}
            <div className="bg-mm-subtle/25 border border-mm-border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-[inset_0_1px_3px_rgba(0,0,0,0.005)]">
              <span className="text-base sm:text-xl font-black text-mm-green">
                {currentImpact.revenue}
              </span>
              <span className="text-[10px] font-semibold text-mm-gray mt-1">
                Revenue
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
