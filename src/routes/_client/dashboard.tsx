import { createFileRoute } from "@tanstack/react-router";
import { Download, ArrowRight, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_client/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 py-4 font-sans text-mm-dark">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-mm-dark tracking-tight">
            Welcome back, John! 👋
          </h2>
          <p className="text-sm text-mm-gray mt-1">
            Here's your business growth overview.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl border border-mm-border bg-white text-sm font-semibold text-mm-dark hover:bg-mm-subtle transition-all active:scale-95 cursor-pointer">
          <Download className="h-4 w-4 text-mm-gray" />
          Download Report
        </button>
      </div>

      {/* Scorecards Row - Premium Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Score 1 */}
        <div className="bg-white border border-mm-border rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-2.5">
          <p className="text-xs font-bold text-mm-gray uppercase tracking-wider">
            Overall Score
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-black text-mm-dark">
              78
            </span>
            <span className="text-sm text-mm-gray/60 font-medium">/100</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              Good
            </span>
            <span className="text-[11px] text-mm-gray">
              +12% vs last month
            </span>
          </div>
        </div>

        {/* Score 2 */}
        <div className="bg-white border border-mm-border rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-2.5">
          <p className="text-xs font-bold text-mm-gray uppercase tracking-wider">
            Website Score
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-black text-mm-dark">
              82
            </span>
            <span className="text-sm text-mm-gray/60 font-medium">/100</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              Good
            </span>
          </div>
        </div>

        {/* Score 3 */}
        <div className="bg-white border border-mm-border rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-2.5">
          <p className="text-xs font-bold text-mm-gray uppercase tracking-wider">
            Marketing Score
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-black text-mm-dark">
              73
            </span>
            <span className="text-sm text-mm-gray/60 font-medium">/100</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-md">
              Fair
            </span>
          </div>
        </div>

        {/* Score 4 */}
        <div className="bg-white border border-mm-border rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-2.5">
          <p className="text-xs font-bold text-mm-gray uppercase tracking-wider">
            Growth Potential
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-black text-mm-dark">
              85
            </span>
            <span className="text-sm text-mm-gray/60 font-medium">/100</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              Excellent
            </span>
          </div>
        </div>
      </div>

      {/* Main Audit Insights Section - Side-by-Side Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Findings Card */}
        <div className="bg-white border border-mm-border rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
          <h3 className="text-lg font-bold text-mm-dark tracking-tight">
            Key Findings
          </h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-mm-orange mt-2 shrink-0" />
              <p className="text-sm text-mm-dark/85 leading-relaxed">
                Your website loads slower than{" "}
                <span className="font-semibold text-mm-dark">
                  70% of competitors
                </span>
                .
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-mm-orange mt-2 shrink-0" />
              <p className="text-sm text-mm-dark/85 leading-relaxed">
                SEO opportunities identified in{" "}
                <span className="font-semibold text-mm-dark">
                  15 key areas
                </span>
                .
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-mm-orange mt-2 shrink-0" />
              <p className="text-sm text-mm-dark/85 leading-relaxed">
                Low user engagement observed on social media channels.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-mm-orange mt-2 shrink-0" />
              <p className="text-sm text-mm-dark/85 leading-relaxed">
                Paid ads campaign ROI can be optimized by up to{" "}
                <span className="font-semibold text-mm-dark">40%</span>.
              </p>
            </li>
          </ul>
        </div>

        {/* Top Recommendations Card */}
        <div className="bg-white border border-mm-border rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
          <h3 className="text-lg font-bold text-mm-dark tracking-tight">
            Top Recommendations
          </h3>
          <div className="space-y-4.5">
            {/* Rec 1 */}
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-mm-orange bg-mm-orange/10 px-2 py-0.5 rounded-md min-w-[50px] text-center animate-pulse">
                HIGH
              </span>
              <p className="text-sm text-mm-dark/85 font-medium">
                Improve website speed and Core Web Vitals
              </p>
            </div>
            {/* Rec 2 */}
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-mm-orange bg-mm-orange/10 px-2 py-0.5 rounded-md min-w-[50px] text-center animate-pulse">
                HIGH
              </span>
              <p className="text-sm text-mm-dark/85 font-medium">
                Optimize Google Ads campaigns
              </p>
            </div>
            {/* Rec 3 */}
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-md min-w-[50px] text-center">
                MEDIUM
              </span>
              <p className="text-sm text-mm-dark/85 font-medium">
                Create SEO-focused content strategy
              </p>
            </div>
            {/* Rec 4 */}
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md min-w-[50px] text-center">
                LOW
              </span>
              <p className="text-sm text-mm-dark/85 font-medium">
                Improve social media engagement
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Plan Block - Large Layout Card */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 p-8 bg-white border border-mm-border rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
        <div className="flex flex-wrap items-center gap-x-12 gap-y-6">
          <div>
            <p className="text-[11px] font-bold text-mm-gray uppercase tracking-wider">
              Proposed Plan
            </p>
            <p className="text-sm text-mm-dark/70 font-medium mt-1">
              Recommended Budget
            </p>
            <p className="text-2xl font-black text-mm-dark mt-0.5">
              $2,450
              <span className="text-xs text-mm-gray font-normal">
                {" "}
                /month
              </span>
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <p className="text-[11px] font-bold text-mm-gray uppercase tracking-wider">
                Estimated Growth
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <TrendingUp className="h-4.5 w-4.5 text-emerald-600" />
                <span className="text-lg font-black text-emerald-600">
                  +35%
                </span>
                <span className="text-xs text-mm-gray">in 6 months</span>
              </div>
            </div>

            {/* Inline SVG Sparkline */}
            <div className="h-8 w-32 ml-2 self-end">
              <svg
                className="w-full h-full text-mm-orange"
                viewBox="0 0 100 30"
                fill="none"
              >
                <path
                  d="M0,25 Q15,22 30,12 T60,18 T90,2 T100,5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <button className="w-full lg:w-auto inline-flex items-center justify-center gap-2 bg-mm-orange hover:opacity-95 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer shrink-0">
          View Plan Details
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
