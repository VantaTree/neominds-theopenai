import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { ChevronDown } from "lucide-react";

interface DashboardChartsProps {
  revenueView: "This Year" | "This Month";
  setRevenueView: (view: "This Year" | "This Month") => void;
  totalRevenue: string;
  thisMonthRevenue: string;
  computedRevenueData: { name: string; value: number }[];
  computedRevenueDataMonth: { name: string; value: number }[];
  computedProjectStatusData: { name: string; value: number; color: string }[];
  projectsCount: number;
}

export function DashboardCharts({
  revenueView,
  setRevenueView,
  totalRevenue,
  thisMonthRevenue,
  computedRevenueData,
  computedRevenueDataMonth,
  computedProjectStatusData,
  projectsCount,
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue Card */}
      <div className="lg:col-span-2 bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-mm-dark tracking-tight">Revenue Overview</h3>
            <div className="text-mm-dark font-extrabold text-base mt-1 transition-all">
              {revenueView === "This Year" ? `Total: ${totalRevenue}` : `This Month: ${thisMonthRevenue}`}
            </div>
          </div>
          <div className="relative">
            <select
              value={revenueView}
              onChange={(e) => setRevenueView(e.target.value as any)}
              className="appearance-none bg-mm-subtle/40 hover:bg-mm-subtle border border-mm-border rounded-xl px-4 py-2 pr-8 text-xs font-bold text-mm-dark cursor-pointer outline-none transition-all"
            >
              <option value="This Year">This Year</option>
              <option value="This Month">This Month</option>
            </select>
            <ChevronDown size={14} className="text-mm-gray absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <div className="w-full h-[260px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueView === "This Year" ? computedRevenueData : computedRevenueDataMonth} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-mm-orange)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="var(--color-mm-orange)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-mm-border)" strokeDasharray="3 3" vertical={false} opacity={0.6} />
              <XAxis dataKey="name" stroke="var(--color-mm-gray)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                domain={[0, 'auto']}
                stroke="var(--color-mm-gray)" fontSize={11} tickLine={false} axisLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-mm-dark)",
                  border: "none",
                  borderRadius: "12px",
                  color: "white",
                  padding: "8px 12px",
                  fontFamily: "var(--font-sans)"
                }}
                itemStyle={{ color: "white" }}
                formatter={(v: number) => [`$${v.toLocaleString()}`, ""]}
                labelFormatter={(label) => `${label} —`}
                animationDuration={400}
              />
              <Area
                type="monotone" dataKey="value"
                stroke="var(--color-mm-orange)" strokeWidth={3}
                fill="url(#rev)"
                animationDuration={400}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Projects by Status Card */}
      <div className="lg:col-span-1 bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-extrabold text-mm-dark tracking-tight">Projects by Status</h3>
        </div>
        <div className="flex flex-col items-center gap-6 mt-4">
          <div className="w-[180px] h-[180px] relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={computedProjectStatusData} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={3}>
                  {computedProjectStatusData.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none leading-none">
              <span className="text-2xl font-black text-mm-dark">{projectsCount}</span>
              <span className="text-[10px] font-bold text-mm-gray mt-1">Total</span>
            </div>
          </div>
          <div className="w-full space-y-2.5">
            {computedProjectStatusData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2 text-mm-dark">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </div>
                <span className="text-mm-gray font-black">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
