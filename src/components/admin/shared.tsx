import { Link, useMatchRoute, useRouter } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileBarChart,
  CreditCard,
  LayoutTemplate,
  Settings,
  LifeBuoy,
  Sparkles,
  FileText,
  Shield,
  BookOpen,
} from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/reports", label: "Reports", icon: FileText },
  { to: "/admin/blogs", label: "Blogs", icon: BookOpen },
  { to: "/admin/audit", label: "Audit Log", icon: Shield },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  // useMatchRoute is the official TanStack Router hook for checking if a route is active.
  // fuzzy:true matches the route AND all its children (e.g. /projects and /projects/$id).
  // fuzzy:false (Dashboard) matches ONLY the exact "/" route.
  const matchRoute = useMatchRoute();
  const router = useRouter();
  const isLoading = router.state.status === "pending";

  return (
    <div className="min-h-screen flex bg-[var(--color-mm-bg-gray)]">
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col w-60 fixed inset-y-0 left-0 z-20"
        style={{
          background: "#ffffff",
          borderRight: "1px solid var(--color-mm-border)",
        }}
      >
        <div className="px-6 py-6 flex items-center gap-2">
          <Sparkles size={20} style={{ color: "var(--color-mm-orange)" }} />
          <span
            className="font-bold text-lg"
            style={{ color: "var(--color-mm-dark)" }}
          >
            GrowConsult AI
          </span>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            // fuzzy: !item.exact → Dashboard is exact-only; all others match child routes too
            const active = Boolean(
              matchRoute({ to: item.to as string, fuzzy: !item.exact }),
            );
            return (
              <Link
                key={item.to}
                to={item.to}
                // exact:true on ALL links → Router never auto-highlights ancestors;
                // our custom `active` boolean controls all visual state exclusively.
                activeOptions={{ exact: true, includeSearch: false }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${!active ? "hover:bg-[var(--color-mm-subtle)]" : ""}`}
                style={{
                  background: active
                    ? "var(--color-mm-subtle)"
                    : "transparent",
                  borderLeft: active
                    ? "3px solid var(--color-mm-orange)"
                    : "3px solid transparent",
                  color: active
                    ? "var(--color-mm-orange)"
                    : "var(--color-mm-gray)",
                }}
              >
                <Icon
                  size={18}
                  style={{
                    color: active
                      ? "var(--color-mm-orange)"
                      : "var(--color-mm-gray)",
                  }}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div
          className="m-3 p-3 rounded-2xl flex items-center gap-3 border border-mm-border"
          style={{ background: "var(--color-mm-subtle)" }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
            style={{ background: "var(--color-mm-orange)", color: "white" }}
          >
            AU
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-sm font-semibold truncate"
              style={{ color: "var(--color-mm-dark)" }}
            >
              Admin User
            </div>
            <div
              className="text-[12px]"
              style={{ color: "var(--color-mm-gray)" }}
            >
              Super Admin
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-60 p-6 md:p-8 max-w-full overflow-x-hidden relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-8 h-8 border-4 border-mm-orange border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold text-mm-gray">Loading page...</span>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    Completed: { bg: "rgba(92, 177, 62, 0.1)", text: "var(--color-mm-green)" },
    Paid: { bg: "rgba(92, 177, 62, 0.1)", text: "var(--color-mm-green)" },
    Active: { bg: "rgba(92, 177, 62, 0.1)", text: "var(--color-mm-green)" },
    "In Progress": { bg: "rgba(59, 130, 246, 0.1)", text: "var(--color-mm-blue)" },
    Pending: { bg: "rgba(224, 86, 36, 0.1)", text: "var(--color-mm-orange)" },
    "On Hold": { bg: "rgba(239, 83, 80, 0.1)", text: "var(--color-mm-red)" },
    Overdue: { bg: "rgba(239, 83, 80, 0.1)", text: "var(--color-mm-red)" },
    Danger: { bg: "rgba(239, 83, 80, 0.1)", text: "var(--color-mm-red)" },
    Trial: { bg: "var(--color-mm-subtle)", text: "var(--color-mm-gray)" },
    Cancelled: { bg: "var(--color-mm-subtle)", text: "var(--color-mm-gray)" },
    "User Draft": { bg: "var(--color-mm-subtle)", text: "var(--color-mm-gray)" },
    Requested: { bg: "rgba(59, 130, 246, 0.1)", text: "var(--color-mm-blue)" },
    Inactive: { bg: "var(--color-mm-subtle)", text: "var(--color-mm-gray)" },
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
    Basic: { bg: "var(--color-mm-subtle)", text: "var(--color-mm-gray)", border: "var(--color-mm-border)" },
    Plus: { bg: "rgba(224, 86, 36, 0.1)", text: "var(--color-mm-orange)", border: "rgba(224, 86, 36, 0.2)" },
    Growth: { bg: "rgba(59, 130, 246, 0.1)", text: "var(--color-mm-blue)", border: "rgba(59, 130, 246, 0.2)" },
  };
  const c = map[plan] ?? map["Basic"];
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold"
      style={{
        background: c.bg,
        color: c.text,
        border: c.border ? `1px solid ${c.border}` : undefined,
      }}
    >
      {plan}
    </span>
  );
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "var(--color-mm-orange)",
        color: "#ffffff",
        fontSize: size * 0.4,
      }}
    >
      {initials}
    </div>
  );
}

export function ProgressBar({
  value,
  color = "var(--color-mm-orange)",
}: {
  value: number;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ background: "var(--color-mm-subtle)" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span
        className="text-xs font-semibold w-10 text-right"
        style={{ color: "var(--color-mm-gray)" }}
      >
        {value}%
      </span>
    </div>
  );
}

export function Card({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`bg-white border border-mm-border rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 ${className}`} style={style}>
      {children}
    </div>
  );
}
