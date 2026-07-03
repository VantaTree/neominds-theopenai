import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  Globe,
  PenTool,
  PlusCircle,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";

export const Route = createFileRoute("/_client/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2 font-sans text-mm-dark select-none">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-mm-dark">
            Welcome back, Raj! 👋
          </h2>
          <p className="text-sm text-mm-gray mt-1">
            Here's your business overview for today.
          </p>
        </div>
      </div>

      {/* Top Section: Business Health Score + 2x2 Scorecards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Business Health Score */}
        <div className="lg:col-span-1 bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col justify-between">
          <h3 className="text-sm font-extrabold text-mm-dark tracking-tight mb-4">
            Business Health Score
          </h3>
          <div className="flex flex-row items-center justify-between gap-4 flex-1">
            {/* Circular Gauge SVG */}
            <div className="relative w-28 h-28 shrink-0">
              <svg className="w-full h-full" viewBox="0 0 128 128">
                {/* Background track */}
                <circle
                  cx="64"
                  cy="64"
                  r="48"
                  className="stroke-mm-subtle"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress arc (78%) */}
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
              {/* Text inside */}
              <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                <span className="text-2xl font-black text-mm-dark">78</span>
                <span className="text-[10px] font-bold text-mm-gray mt-0.5">/100</span>
              </div>
            </div>

            {/* Status and Action Panel */}
            <div className="flex flex-col items-start gap-1 flex-1 pl-2">
              <span className="text-sm font-bold text-mm-green">Good</span>
              <p className="text-xs text-mm-gray leading-relaxed">
                You're doing great! Keep it up
              </p>
              <button className="mt-2 text-[11px] font-bold text-mm-dark px-3 py-1.5 rounded-lg border border-mm-border bg-mm-subtle/40 hover:bg-mm-subtle transition-all cursor-pointer">
                View Report
              </button>
            </div>
          </div>
        </div>

        {/* Right Cards: 2x2 Score Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {/* Card 1: Website Score */}
          <div className="bg-white border border-mm-border rounded-[18px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col justify-between">
            <span className="text-xs font-bold text-mm-gray">Website Score</span>
            <div className="mt-4">
              <span className="text-3xl font-black text-mm-dark">82</span>
              <div className="text-[11px] font-bold text-mm-green mt-1">Good</div>
            </div>
          </div>

          {/* Card 2: SEO Score */}
          <div className="bg-white border border-mm-border rounded-[18px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col justify-between">
            <span className="text-xs font-bold text-mm-gray">SEO Score</span>
            <div className="mt-4">
              <span className="text-3xl font-black text-mm-dark">76</span>
              <div className="text-[11px] font-bold text-mm-green mt-1">Good</div>
            </div>
          </div>

          {/* Card 3: Marketing Score */}
          <div className="bg-white border border-mm-border rounded-[18px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col justify-between">
            <span className="text-xs font-bold text-mm-gray">Marketing Score</span>
            <div className="mt-4">
              <span className="text-3xl font-black text-mm-dark">74</span>
              <div className="text-[11px] font-bold text-mm-green mt-1">Good</div>
            </div>
          </div>

          {/* Card 4: Brand Score */}
          <div className="bg-white border border-mm-border rounded-[18px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col justify-between">
            <span className="text-xs font-bold text-mm-gray">Brand Score</span>
            <div className="mt-4">
              <span className="text-3xl font-black text-mm-dark">80</span>
              <div className="text-[11px] font-bold text-mm-green mt-1">Good</div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Active Projects + AI Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Projects Card */}
        <div className="bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-mm-dark tracking-tight mb-4">
              Active Projects
            </h3>
            <div className="space-y-4">
              {/* Item 1 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-mm-blue/10 text-mm-blue">
                    <Globe className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-mm-dark">Website Redesign</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-mm-gray">In Progress</span>
                  <span className="text-xs font-bold text-mm-green">70% +</span>
                </div>
              </div>
              {/* Item 2 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-mm-blue/10 text-mm-blue">
                    <Search className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-mm-dark">SEO Optimization</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-mm-gray">In Progress</span>
                  <span className="text-xs font-bold text-mm-green">60% +</span>
                </div>
              </div>
              {/* Item 3 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-mm-blue/10 text-mm-blue">
                    <PenTool className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-mm-dark">Content Creation</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-mm-gray">In Progress</span>
                  <span className="text-xs font-bold text-mm-green">40% +</span>
                </div>
              </div>
            </div>
          </div>
          <button className="mt-6 text-xs font-bold text-mm-dark text-center w-full py-2 hover:bg-mm-subtle/50 rounded-xl transition-all cursor-pointer">
            View All
          </button>
        </div>

        {/* AI Recommendation Card */}
        <div className="bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-mm-dark tracking-tight mb-4">
              AI Recommendation
            </h3>
            <div className="space-y-2 mt-2">
              <span className="text-[10px] font-bold text-mm-gray uppercase tracking-wider">
                Top Priority for You
              </span>
              <p className="text-base font-extrabold text-mm-dark leading-snug">
                Improve Google rankings <span className="font-medium text-mm-gray">for 15 important keywords.</span>
              </p>
            </div>
          </div>
          <button className="mt-6 w-full py-3 bg-mm-orange/10 hover:bg-mm-orange/15 active:scale-98 text-mm-orange text-xs font-extrabold rounded-xl transition-all cursor-pointer text-center">
            View Recommendation
          </button>
        </div>
      </div>

      {/* Bottom Section: Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity Card */}
        <div className="bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-mm-dark tracking-tight mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {/* Item 1 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-mm-blue mt-2 shrink-0" />
                  <p className="text-xs font-semibold text-mm-dark leading-relaxed">
                    Keyword rankings improved for "best chocolate"
                  </p>
                </div>
                <span className="text-[10px] font-medium text-mm-gray whitespace-nowrap mt-0.5">2h ago</span>
              </div>
              {/* Item 2 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-mm-blue mt-2 shrink-0" />
                  <p className="text-xs font-semibold text-mm-dark leading-relaxed">
                    New lead captured from website
                  </p>
                </div>
                <span className="text-[10px] font-medium text-mm-gray whitespace-nowrap mt-0.5">3h ago</span>
              </div>
              {/* Item 3 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-mm-blue mt-2 shrink-0" />
                  <p className="text-xs font-semibold text-mm-dark leading-relaxed">
                    Blog "Healthy Chocolate Benefits" published
                  </p>
                </div>
                <span className="text-[10px] font-medium text-mm-gray whitespace-nowrap mt-0.5">5h ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
          <h3 className="text-sm font-extrabold text-mm-dark tracking-tight mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Action 1 */}
            <button className="flex flex-col items-center justify-center p-4 bg-mm-subtle/40 hover:bg-mm-subtle/80 active:scale-95 border border-mm-border/30 rounded-2xl transition-all cursor-pointer text-center">
              <Sparkles className="h-5 w-5 text-mm-dark mb-2" />
              <span className="text-xs font-extrabold text-mm-dark">Ask AI Assistant</span>
            </button>
            {/* Action 2 */}
            <button className="flex flex-col items-center justify-center p-4 bg-mm-subtle/40 hover:bg-mm-subtle/80 active:scale-95 border border-mm-border/30 rounded-2xl transition-all cursor-pointer text-center">
              <BarChart3 className="h-5 w-5 text-mm-dark mb-2" />
              <span className="text-xs font-extrabold text-mm-dark">View Full Report</span>
            </button>
            {/* Action 3 */}
            <button className="flex flex-col items-center justify-center p-4 bg-mm-subtle/40 hover:bg-mm-subtle/80 active:scale-95 border border-mm-border/30 rounded-2xl transition-all cursor-pointer text-center">
              <PlusCircle className="h-5 w-5 text-mm-dark mb-2" />
              <span className="text-xs font-extrabold text-mm-dark">Create New Project</span>
            </button>
            {/* Action 4 */}
            <button className="flex flex-col items-center justify-center p-4 bg-mm-subtle/40 hover:bg-mm-subtle/80 active:scale-95 border border-mm-border/30 rounded-2xl transition-all cursor-pointer text-center">
              <Upload className="h-5 w-5 text-mm-dark mb-2" />
              <span className="text-xs font-extrabold text-mm-dark">Upload Files</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
