import { Link, useMatchRoute } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, FolderKanban, FileBarChart, CreditCard,
  LayoutTemplate, Settings, LifeBuoy, Sparkles, FileText, Shield, BookOpen
} from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/users", label: "Users", icon: Users },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/blogs", label: "Blogs", icon: BookOpen },
  { to: "/audit", label: "Audit Log", icon: Shield },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  // useMatchRoute is the official TanStack Router hook for checking if a route is active.
  // fuzzy:true matches the route AND all its children (e.g. /projects and /projects/$id).
  // fuzzy:false (Dashboard) matches ONLY the exact "/" route.
  const matchRoute = useMatchRoute();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col w-60 fixed inset-y-0 left-0 z-20"
        style={{
          background: "var(--color-card)",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        <div className="px-6 py-6 flex items-center gap-2">
          <Sparkles size={20} style={{ color: "var(--color-primary)" }} />
          <span className="font-bold text-lg" style={{ color: "var(--color-heading)" }}>
            GrowConsult AI
          </span>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            // fuzzy: !item.exact → Dashboard is exact-only; all others match child routes too
            const active = Boolean(matchRoute({ to: item.to as string, fuzzy: !item.exact }));
            return (
              <Link
                key={item.to}
                to={item.to}
                // exact:true on ALL links → Router never auto-highlights ancestors;
                // our custom `active` boolean controls all visual state exclusively.
                activeOptions={{ exact: true, includeSearch: false }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${!active ? 'hover:bg-[var(--color-muted)]' : ''}`}
                style={{
                  background: active ? "var(--color-sidebar-primary)" : "transparent",
                  borderLeft: active ? "3px solid var(--color-sidebar-ring)" : "3px solid transparent",
                  color: active ? "var(--color-sidebar-primary-foreground)" : "var(--color-sidebar-foreground)",
                }}
              >
                <Icon size={18} style={{ color: active ? "var(--color-sidebar-primary-foreground)" : "var(--color-sidebar-foreground)" }} />
                {item.label}
              </Link>
            );
          })}
        </nav>


        <div className="m-3 p-3 rounded-2xl flex items-center gap-3" style={{ background: "var(--color-card-secondary)" }}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
            style={{ background: "var(--color-primary)", color: "white" }}
          >
            AU
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: "var(--color-heading)" }}>Admin User</div>
            <div className="text-[12px]" style={{ color: "var(--color-subtle)" }}>Super Admin</div>
          </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-60 p-6 md:p-8 max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    "Completed": { bg: "#E8F5E9", text: "#4CAF50" },
    "Paid": { bg: "#E8F5E9", text: "#4CAF50" },
    "Active": { bg: "#E8F5E9", text: "#4CAF50" },
    "In Progress": { bg: "#EFF6FF", text: "#3B82F6" },
    "Pending": { bg: "#FFFBEB", text: "#F4B942" },
    "On Hold": { bg: "#FEF2F2", text: "#EF5350" },
    "Overdue": { bg: "#FEF2F2", text: "#EF5350" },
    "Danger": { bg: "#FEF2F2", text: "#EF5350" },
    "Trial": { bg: "#F8F1E7", text: "#A1887F" },
    "Cancelled": { bg: "#F8F1E7", text: "#A1887F" },
    "Inactive": { bg: "#F8F1E7", text: "#A1887F" },
  };
  const c = map[status] ?? map["Pending"];
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.text }}
    >
      {status}
    </span>
  );
}

export function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string, { bg: string; text: string; border?: string }> = {
    "Basic": { bg: "#F8F1E7", text: "#6D4C41", border: "#E8DCC8" },
    "Plus": { bg: "#FFF3D6", text: "#E89D18", border: "#FFD98A" },
    "Growth": { bg: "#EFF6FF", text: "#3B82F6", border: "#BFDBFE" },
  };
  const c = map[plan] ?? map["Basic"];
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold"
      style={{ background: c.bg, color: c.text, border: c.border ? `1px solid ${c.border}` : undefined }}
    >
      {plan}
    </span>
  );
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "var(--color-primary)",
        color: "var(--color-primary-foreground)",
        fontSize: size * 0.4,
      }}
    >
      {initials}
    </div>
  );
}

export function ProgressBar({ value, color = "var(--color-primary)" }: { value: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--color-card-secondary)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="text-xs font-semibold w-10 text-right" style={{ color: "var(--color-title)" }}>{value}%</span>
    </div>
  );
}

export function Card({ children, className = "", style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`card-surface p-6 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
