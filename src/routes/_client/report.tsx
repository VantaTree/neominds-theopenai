import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Download,
  Check,
  Zap,
  Search,
  BookOpen,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Target,
  Shield,
  FileText,
} from "lucide-react";

export const Route = createFileRoute("/_client/report")({
  component: RouteComponent,
});

type TabType = "summary" | "swot" | "competitor";

function RouteComponent() {
  const [activeTab, setActiveTab] = useState<TabType>("summary");

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2 font-sans text-mm-dark select-none">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-mm-dark font-sans">
          Business Report
        </h2>
        <p className="text-sm text-mm-gray mt-1">
          AI-Powered Business Analysis
        </p>
      </div>

      {/* Top Scores Card */}
      <div className="bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left: Overall Score */}
        <div className="flex flex-col">
          <span className="text-xs font-bold text-mm-gray uppercase tracking-wider mb-4">
            Overall Score
          </span>
          <div className="flex items-center">
            {/* Circular Gauge */}
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-full h-full" viewBox="0 0 128 128">
                <circle
                  cx="64"
                  cy="64"
                  r="48"
                  className="stroke-mm-subtle"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="48"
                  className="stroke-mm-green"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="301.59"
                  strokeDashoffset="66.35"
                  strokeLinecap="round"
                  transform="rotate(-90 64 64)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                <span className="text-xl font-black text-mm-dark">78</span>
                <span className="text-[9px] font-bold text-mm-gray mt-0.5">/100</span>
              </div>
            </div>
            <span className="text-sm font-bold text-mm-green ml-4">Good</span>
          </div>
        </div>

        {/* Right: Industry Benchmark */}
        <div className="flex flex-col md:border-l md:border-mm-border md:pl-8">
          <span className="text-xs font-bold text-mm-gray uppercase tracking-wider mb-2">
            Industry Benchmark
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-mm-dark">75</span>
            <span className="text-[10px] font-bold text-mm-gray">/100</span>
          </div>

          {/* Simple Inline Bar Chart */}
          <div className="flex items-end gap-1 h-9 mt-3">
            <div className="w-1.5 h-1 bg-mm-dark/30 rounded-t-xs" />
            <div className="w-1.5 h-2 bg-mm-blue/40 rounded-t-xs" />
            <div className="w-1.5 h-1.5 bg-mm-blue/50 rounded-t-xs" />
            <div className="w-1.5 h-3 bg-mm-blue/75 rounded-t-xs" />
            <div className="w-1.5 h-5 bg-mm-blue/85 rounded-t-xs" />
            <div className="w-1.5 h-6 bg-mm-blue rounded-t-xs" />
            <div className="w-1.5 h-7.5 bg-mm-blue rounded-t-xs" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-6 border-b border-mm-border pb-px text-sm font-semibold mt-4">
        <button
          onClick={() => setActiveTab("summary")}
          className={`${
            activeTab === "summary"
              ? "text-mm-dark border-b-2 border-mm-orange pb-3 -mb-px font-extrabold"
              : "text-mm-gray hover:text-mm-dark pb-3 cursor-pointer"
          } transition-all`}
        >
          Executive Summary
        </button>
        <button
          onClick={() => setActiveTab("swot")}
          className={`${
            activeTab === "swot"
              ? "text-mm-dark border-b-2 border-mm-orange pb-3 -mb-px font-extrabold"
              : "text-mm-gray hover:text-mm-dark pb-3 cursor-pointer"
          } transition-all`}
        >
          SWOT Analysis
        </button>
        <button
          onClick={() => setActiveTab("competitor")}
          className={`${
            activeTab === "competitor"
              ? "text-mm-dark border-b-2 border-mm-orange pb-3 -mb-px font-extrabold"
              : "text-mm-gray hover:text-mm-dark pb-3 cursor-pointer"
          } transition-all`}
        >
          Competitor Analysis
        </button>
      </div>

      {/* Main Panel Content Card */}
      <div className="bg-white border border-mm-border rounded-[24px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.015)] space-y-8">
        {activeTab === "summary" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Summary */}
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-mm-dark">
                Executive Summary
              </h3>
              <p className="text-xs sm:text-sm text-mm-gray leading-relaxed max-w-3xl">
                Your business has a strong foundation. We identified key
                opportunities to improve visibility, generate more leads, and
                increase conversions.
              </p>
            </div>

            {/* Key Findings */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-mm-dark">
                Key Findings
              </h3>
              <div className="space-y-3">
                {/* Finding 1 */}
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-mm-orange/10 text-mm-orange shrink-0">
                    <Zap className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-mm-dark">
                    Your website speed needs improvement
                  </span>
                </div>
                {/* Finding 2 */}
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-mm-orange/10 text-mm-orange shrink-0">
                    <Search className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-mm-dark">
                    SEO opportunities found for 25 keywords
                  </span>
                </div>
                {/* Finding 3 */}
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-mm-orange/10 text-mm-orange shrink-0">
                    <BookOpen className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-mm-dark">
                    Content marketing can increase your reach
                  </span>
                </div>
                {/* Finding 4 */}
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-mm-orange/10 text-mm-orange shrink-0">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-mm-dark">
                    Google Business Profile is not fully optimized
                  </span>
                </div>
              </div>
            </div>

            {/* Top Opportunities */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-mm-dark">
                Top Opportunities
              </h3>
              <div className="space-y-3">
                {/* Opp 1 */}
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-full bg-mm-green/10 text-mm-green shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-mm-dark">
                    Improve SEO to increase organic traffic
                  </span>
                </div>
                {/* Opp 2 */}
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-full bg-mm-green/10 text-mm-green shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-mm-dark">
                    Create more engaging content
                  </span>
                </div>
                {/* Opp 3 */}
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-full bg-mm-green/10 text-mm-green shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-mm-dark">
                    Optimize website for better conversions
                  </span>
                </div>
                {/* Opp 4 */}
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-full bg-mm-green/10 text-mm-green shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-mm-dark">
                    Leverage local SEO for more leads
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "swot" && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-sm font-extrabold text-mm-dark">
              SWOT Analysis
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-mm-subtle/30 border border-mm-border rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-mm-green">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Strengths</span>
                </div>
                <ul className="text-xs text-mm-gray space-y-1 list-disc list-inside">
                  <li>Strong brand foundation</li>
                  <li>Good business health score</li>
                  <li>Active projects in progress</li>
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="bg-mm-subtle/30 border border-mm-border rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-mm-orange">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Weaknesses</span>
                </div>
                <ul className="text-xs text-mm-gray space-y-1 list-disc list-inside">
                  <li>Website speed needs improvement</li>
                  <li>Low local search profile completion</li>
                  <li>Content marketing reach is limited</li>
                </ul>
              </div>

              {/* Opportunities */}
              <div className="bg-mm-subtle/30 border border-mm-border rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-mm-blue">
                  <Target className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Opportunities</span>
                </div>
                <ul className="text-xs text-mm-gray space-y-1 list-disc list-inside">
                  <li>SEO rank optimizations</li>
                  <li>More engaging user-focused content</li>
                  <li>Vast local SEO improvements</li>
                </ul>
              </div>

              {/* Threats */}
              <div className="bg-mm-subtle/30 border border-mm-border rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-mm-red">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Threats</span>
                </div>
                <ul className="text-xs text-mm-gray space-y-1 list-disc list-inside">
                  <li>Competitor search rank dominance</li>
                  <li>Rapidly shifting digital search behaviors</li>
                  <li>Underutilized organic marketing channels</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "competitor" && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-sm font-extrabold text-mm-dark">
              Competitor Analysis
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-mm-border text-mm-gray uppercase tracking-wider">
                    <th className="py-2.5 font-bold">Company</th>
                    <th className="py-2.5 font-bold text-center">Score</th>
                    <th className="py-2.5 font-bold text-center">Page Speed</th>
                    <th className="py-2.5 font-bold text-center">SEO Ranking</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mm-border/50 text-mm-dark font-medium">
                  <tr className="hover:bg-mm-subtle/25">
                    <td className="py-3 flex items-center gap-2 font-bold">
                      <span className="h-2 w-2 rounded-full bg-mm-orange" />
                      the Open AI (Us)
                    </td>
                    <td className="py-3 text-center text-mm-green font-bold">78/100</td>
                    <td className="py-3 text-center text-mm-orange">Fair</td>
                    <td className="py-3 text-center text-mm-green">Good</td>
                  </tr>
                  <tr className="hover:bg-mm-subtle/25">
                    <td className="py-3 text-mm-gray">Competitor Alpha</td>
                    <td className="py-3 text-center text-mm-gray">72/100</td>
                    <td className="py-3 text-center text-mm-green">Good</td>
                    <td className="py-3 text-center text-mm-gray">Fair</td>
                  </tr>
                  <tr className="hover:bg-mm-subtle/25">
                    <td className="py-3 text-mm-gray">Competitor Beta</td>
                    <td className="py-3 text-center text-mm-gray">65/100</td>
                    <td className="py-3 text-center text-mm-red">Poor</td>
                    <td className="py-3 text-center text-mm-gray">Fair</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button className="w-full py-3.5 bg-mm-orange/10 hover:bg-mm-orange/15 active:scale-[0.99] border border-mm-orange/10 text-mm-orange text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-4">
          <Download className="h-4 w-4" />
          Download Full Report
        </button>
      </div>
    </div>
  );
}
