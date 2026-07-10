import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Users as UsersIcon,
  FolderKanban,
  Briefcase,
  DollarSign,
  CheckSquare,
  Bell,
  BellRing,
  Calendar,
  FileCheck,
  FileBarChart,
  LifeBuoy,
  TrendingUp,
  ChevronDown,
  AlertCircle,
  UserPlus,
  Clock,
  Settings,
  X,
  FileText,
  Loader2,
} from "lucide-react";
import { useState, useRef, useEffect, useMemo, lazy, Suspense } from "react";
import {
  getUsersFn,
  getProjectsFn,
  getPaymentsFn,
  getReportsFn,
} from "@/lib/server-functions";
import { AdminLoader } from "@/components/AdminLoader";

const DashboardCharts = lazy(() =>
  import("@/components/admin/DashboardCharts").then((mod) => ({
    default: mod.DashboardCharts,
  })),
);

export const Route = createFileRoute("/_admin/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — GrowConsult AI" }] }),
  loader: async () => {
    try {
      const [users, projects, payments, reports] = await Promise.all([
        getUsersFn(),
        getProjectsFn(),
        getPaymentsFn(),
        getReportsFn(),
      ]);
      // console.log(users, projects, payments, reports);
      return {
        users,
        projects,
        payments,
        reports,
      };
    } catch (err) {
      console.error("Loader failed to fetch admin dashboard data:", err);
      return {
        users: [],
        projects: [],
        payments: [],
        reports: [],
      };
    }
  },
  pendingComponent: AdminLoader,
  pendingMs: 0,
  component: Dashboard,
});

interface KpiProps {
  label: string;
  value: string;
  delta: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  subLabel?: string;
  valueSize?: string;
}

function Kpi({
  label,
  value,
  delta,
  icon: Icon,
  subLabel,
  valueSize,
}: KpiProps) {
  return (
    <div className="bg-white border border-mm-border rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col justify-between select-none">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-bold text-mm-gray uppercase tracking-wider truncate">
            {label}
          </div>
          <div
            className="font-black text-mm-dark tracking-tight mt-2 truncate"
            style={{
              fontSize: valueSize || "1.875rem",
              lineHeight: valueSize ? "1.2" : "2.25rem",
            }}
          >
            {value}
          </div>
          {subLabel && (
            <div className="mt-1 text-[11px] font-medium text-mm-gray truncate">
              {subLabel}
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-mm-orange/10">
          <Icon size={20} className="text-mm-orange" />
        </div>
      </div>
      <div className="mt-3">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-mm-green/10 text-mm-green">
          <TrendingUp size={12} />
          {delta}
        </span>
      </div>
    </div>
  );
}

function Dashboard() {
  const { users, projects, payments, reports } = Route.useLoaderData();
  const [revenueView, setRevenueView] = useState<"This Year" | "This Month">(
    "This Year",
  );
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [dateRangeText, setDateRangeText] = useState("May 20 – May 26, 2024");
  const [appliedDateFilter, setAppliedDateFilter] = useState<string | null>(
    null,
  );
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [quickDate, setQuickDate] = useState("This Week");

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifTab, setNotifTab] = useState("All");
  const navigate = useNavigate();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Dynamically initialize notifications from the actual database items
  const initialNotifications = useMemo(() => {
    const list: any[] = [];

    // Add dynamic payment notifications
    payments.slice(0, 3).forEach((p, idx) => {
      let amt = "Amount";
      if (typeof p.amount === "number") amt = `$${p.amount.toLocaleString()}`;
      else if (typeof p.amount === "string") amt = p.amount;
      list.push({
        id: `pay-${p.id || idx}`,
        title: "Payment Received",
        message: `Payment of ${amt} is ${p.status || "Paid"}.`,
        time: p.timestamp
          ? new Date(p.timestamp).toLocaleDateString()
          : "Recent",
        category: "Payments",
        read: false,
        icon: DollarSign,
        bg: "rgba(92, 177, 62, 0.1)",
        color: "var(--color-mm-green)",
        path: "/admin/payments",
      });
    });

    // Add dynamic project notifications
    projects.slice(0, 3).forEach((p, idx) => {
      list.push({
        id: `proj-${p.id || idx}`,
        title: "Project Updated",
        message: `Project ${p.name || "Status"} is currently at ${p.progress || 0}% progress.`,
        time: p.createdAt
          ? new Date(p.createdAt).toLocaleDateString()
          : "Recent",
        category: "Projects",
        read: false,
        icon: FolderKanban,
        bg: "rgba(133, 211, 255, 0.1)",
        color: "var(--color-mm-blue)",
        path: `/admin/projects`,
      });
    });

    return list;
  }, [payments, projects]);

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  const totalRevenue = useMemo(() => {
    const sum = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(sum);
  }, [payments]);

  const thisMonthRevenue = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const sum = payments.reduce((acc, p) => {
      if (p.timestamp) {
        try {
          const dateObj = new Date(p.timestamp);
          if (
            dateObj.getMonth() === currentMonth &&
            dateObj.getFullYear() === currentYear
          ) {
            return acc + (p.amount || 0);
          }
        } catch (e) {}
      }
      return acc;
    }, 0);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(sum);
  }, [payments]);

  const taskStats = useMemo(() => {
    let total = 0;
    let completed = 0;
    projects.forEach((p) => {
      if (p.updates) {
        total += p.updates.length;
        // Assume completed if progress is 100
        if (p.progress === 100) {
          completed += p.updates.length;
        } else {
          completed += Math.round(p.updates.length * (p.progress / 100));
        }
      }
    });
    if (total === 0) return "0 / 0";
    return `${total} / ${completed}`;
  }, [projects]);

  const conversionRate = useMemo(() => {
    if (users.length === 0) return "0.0%";
    const active = users.filter((u) => u.status === "Active").length;
    return `${((active / users.length) * 100).toFixed(1)}%`;
  }, [users]);

  const auditsCompleted = useMemo(() => {
    return projects.filter((p) => p.progress === 100).length;
  }, [projects]);

  const computedRevenueData = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlySum = months.map((m) => ({ name: m, value: 0 }));
    payments.forEach((p) => {
      const amt = p.amount || 0;
      if (p.timestamp) {
        try {
          const dateObj = new Date(p.timestamp);
          const monthIdx = dateObj.getMonth();
          if (monthIdx >= 0 && monthIdx < 12) {
            monthlySum[monthIdx].value += amt;
          }
        } catch (e) {}
      }
    });
    return monthlySum;
  }, [payments]);

  const computedRevenueDataMonth = useMemo(() => {
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
    const weeklySum = weeks.map((w) => ({ name: w, value: 0 }));
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    payments.forEach((p) => {
      const amt = p.amount || 0;
      if (p.timestamp) {
        try {
          const dateObj = new Date(p.timestamp);
          if (
            dateObj.getMonth() === currentMonth &&
            dateObj.getFullYear() === currentYear
          ) {
            const day = dateObj.getDate();
            const weekIdx = Math.min(Math.floor((day - 1) / 7), 3);
            weeklySum[weekIdx].value += amt;
          }
        } catch (e) {}
      }
    });
    return weeklySum;
  }, [payments]);

  const computedProjectStatusData = useMemo(() => {
    const total = projects.length;
    if (total === 0) {
      return [
        { name: "Completed", value: 0, color: "var(--color-mm-green)" },
        { name: "In Progress", value: 0, color: "var(--color-mm-blue)" },
        { name: "Pending", value: 0, color: "var(--color-mm-orange)" },
        { name: "On Hold", value: 0, color: "var(--color-mm-gray)" },
      ];
    }
    let completed = 0;
    let inProgress = 0;
    let pending = 0;
    let onHold = 0;

    projects.forEach((p) => {
      if (p.progress === 100) completed++;
      else if (p.progress === 0) pending++;
      else inProgress++;
    });

    return [
      {
        name: "Completed",
        value: Math.round((completed / total) * 100),
        color: "var(--color-mm-green)",
      },
      {
        name: "In Progress",
        value: Math.round((inProgress / total) * 100),
        color: "var(--color-mm-blue)",
      },
      {
        name: "Pending",
        value: Math.round((pending / total) * 100),
        color: "var(--color-mm-orange)",
      },
      {
        name: "On Hold",
        value: Math.round((onHold / total) * 100),
        color: "var(--color-mm-gray)",
      },
    ];
  }, [projects]);

  const [showAllNotificationsModal, setShowAllNotificationsModal] =
    useState(false);
  const [modalTab, setModalTab] = useState("All");
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = notifications.filter((n) => {
    if (notifTab === "Unread") return !n.read;
    if (notifTab === "Alerts")
      return n.category === "Payments" || n.category === "System";
    return true;
  });

  const fullModalFilteredNotifications = notifications.filter((n) => {
    if (modalTab === "Unread") return !n.read;
    if (modalTab === "Payments") return n.category === "Payments";
    if (modalTab === "Projects") return n.category === "Projects";
    if (modalTab === "System") return n.category === "System";
    return true;
  });

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleNotifClick = (n: any) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === n.id ? { ...notif, read: true } : notif,
      ),
    );
    if (n.path) navigate({ to: n.path });
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setDatePickerOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setDatePickerOpen(false);
    }
    if (datePickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [datePickerOpen]);

  const handleApplyDate = () => {
    const text = "May 20 – May 26";
    setDateRangeText(text + ", 2024");
    setAppliedDateFilter(`Filtered: ${text}`);
    setDatePickerOpen(false);
  };

  return (
    <div className="space-y-6 font-sans text-mm-dark select-none">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-mm-dark">
            Dashboard
          </h1>
          <p className="text-sm text-mm-gray mt-1">
            Here's what's happening with your platform
          </p>
        </div>
        <div className="flex items-center gap-3 relative" ref={datePickerRef}>
          <button
            onClick={() => setDatePickerOpen(!datePickerOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-mm-border bg-white text-mm-dark hover:bg-mm-subtle/50 transition-all cursor-pointer"
          >
            <Calendar size={16} className="text-mm-orange" />
            {dateRangeText}
            <ChevronDown size={14} className="text-mm-gray ml-1" />
          </button>

          {datePickerOpen && (
            <div className="bg-white border border-mm-border rounded-[20px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] min-w-[320px] absolute top-full right-0 mt-2 z-50">
              <div className="text-mm-dark font-extrabold text-sm mb-3">
                Select Date Range
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  "Today",
                  "This Week",
                  "This Month",
                  "Last Month",
                  "This Year",
                ].map((opt) => {
                  const isActive = quickDate === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setQuickDate(opt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        isActive
                          ? "bg-mm-orange text-white border-mm-orange"
                          : "bg-mm-subtle/40 hover:bg-mm-subtle text-mm-dark border-mm-border/50"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-mm-gray text-xs block mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    defaultValue="2024-05-20"
                    className="bg-white border border-mm-border rounded-xl px-3 py-2 text-xs font-bold text-mm-dark w-full outline-none focus:border-mm-orange transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-mm-gray text-xs block mb-1">To</label>
                  <input
                    type="date"
                    defaultValue="2024-05-26"
                    className="bg-white border border-mm-border rounded-xl px-3 py-2 text-xs font-bold text-mm-dark w-full outline-none focus:border-mm-orange transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-mm-border/60">
                <button
                  onClick={() => setDatePickerOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-mm-border text-mm-dark bg-white hover:bg-mm-subtle/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyDate}
                  className="px-4 py-2 text-xs font-extrabold rounded-xl bg-mm-orange hover:bg-mm-orange/95 text-white transition-all"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
          <div className="relative inline-flex">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className={`relative rounded-xl flex items-center justify-center border border-mm-border p-2 cursor-pointer transition-all ${
                isNotificationOpen
                  ? "bg-mm-orange/10"
                  : "bg-white hover:bg-mm-subtle/50"
              }`}
            >
              <BellRing
                size={20}
                className={
                  isNotificationOpen ? "text-mm-orange" : "text-mm-dark"
                }
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-mm-orange text-white text-[9px] font-black rounded-full w-4.5 h-4.5 flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsNotificationOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 z-50">
                  <div className="bg-white border border-mm-border rounded-[20px] w-[380px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden">
                    <div className="flex justify-between items-center border-b border-mm-border/60 px-5 py-4 bg-white">
                      <div className="font-extrabold text-sm text-mm-dark">
                        Notifications
                      </div>
                      <div className="flex gap-4 items-center">
                        <button
                          onClick={markAllRead}
                          disabled={unreadCount === 0}
                          className="text-xs font-bold text-mm-orange hover:underline cursor-pointer disabled:text-mm-gray/40 disabled:no-underline"
                        >
                          Mark all read
                        </button>
                        <button
                          onClick={() => setIsNotificationOpen(false)}
                          className="cursor-pointer"
                        >
                          <X
                            size={18}
                            className="text-mm-gray hover:text-mm-dark"
                          />
                        </button>
                      </div>
                    </div>
                    <div className="flex px-5 border-b border-mm-border/60 bg-white">
                      {["All", "Unread", "Alerts"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setNotifTab(tab)}
                          className={`cursor-pointer pb-3 pt-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
                            notifTab === tab
                              ? "border-mm-orange text-mm-dark font-extrabold"
                              : "border-transparent text-mm-gray hover:text-mm-dark"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    <div className="max-h-[380px] overflow-y-auto bg-white">
                      {filteredNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotifClick(n)}
                          className={`flex items-start gap-3 cursor-pointer p-4 border-b border-mm-border/40 transition-colors ${
                            n.read
                              ? "bg-white hover:bg-mm-subtle/20"
                              : "bg-mm-orange/5 hover:bg-mm-orange/10"
                          }`}
                        >
                          <div
                            className={`mt-1.5 rounded-full shrink-0 w-2 h-2 ${
                              n.read
                                ? "bg-transparent border border-mm-border"
                                : "bg-mm-orange"
                            }`}
                          />
                          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-mm-subtle">
                            <n.icon size={18} className="text-mm-dark" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-xs text-mm-dark truncate">
                              {n.title}
                            </div>
                            <div className="text-[11px] text-mm-gray mt-0.5 leading-normal">
                              {n.message}
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <div className="text-[10px] text-mm-gray">
                                {n.time}
                              </div>
                              {n.action && (
                                <div className="text-[11px] font-bold text-mm-orange">
                                  {n.action}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredNotifications.length === 0 && (
                        <div className="p-8 text-center text-xs text-mm-gray font-medium bg-white">
                          No notifications found.
                        </div>
                      )}
                    </div>
                    <div className="text-center p-3 border-t border-mm-border/60 bg-white">
                      <button
                        onClick={() => {
                          setShowAllNotificationsModal(true);
                          setIsNotificationOpen(false);
                        }}
                        className="text-xs font-extrabold text-mm-orange hover:underline cursor-pointer"
                      >
                        View All Notifications
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Kpi
          label="Total Users"
          value={users.length.toLocaleString()}
          delta="+0%"
          icon={UsersIcon}
          subLabel={appliedDateFilter || undefined}
        />
        <Kpi
          label="Total Projects"
          value={projects.length.toLocaleString()}
          delta="+0%"
          icon={FolderKanban}
          subLabel={appliedDateFilter || undefined}
        />
        <Kpi
          label="Active Projects"
          value={projects
            .filter((p) => p.progress > 0 && p.progress < 100)
            .length.toLocaleString()}
          delta="+0%"
          icon={Briefcase}
          subLabel={appliedDateFilter || undefined}
        />
        <Kpi
          label="Total Revenue"
          value={totalRevenue}
          delta="+0%"
          icon={DollarSign}
          subLabel={appliedDateFilter || "All time cumulative"}
        />
        <Kpi
          label="Total Tasks"
          value={taskStats}
          delta="+0%"
          icon={CheckSquare}
          subLabel={appliedDateFilter || "Assigned / Completed"}
          valueSize="22px"
        />
      </div>

      {isClient ? (
        <Suspense
          fallback={
            <div className="bg-white border border-mm-border rounded-[24px] p-12 flex items-center justify-center h-[340px]">
              <Loader2 className="animate-spin text-mm-orange" size={32} />
            </div>
          }
        >
          <DashboardCharts
            revenueView={revenueView}
            setRevenueView={setRevenueView}
            totalRevenue={totalRevenue}
            thisMonthRevenue={thisMonthRevenue}
            computedRevenueData={computedRevenueData}
            computedRevenueDataMonth={computedRevenueDataMonth}
            computedProjectStatusData={computedProjectStatusData}
            projectsCount={projects.length}
          />
        </Suspense>
      ) : (
        <div className="bg-white border border-mm-border rounded-[24px] p-12 flex items-center justify-center h-[340px]">
          <Loader2 className="animate-spin text-mm-orange" size={32} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Kpi
          label="Audits Completed"
          value={auditsCompleted.toLocaleString()}
          delta="+0%"
          icon={FileCheck}
        />
        <Kpi
          label="Reports Generated"
          value={reports.length.toLocaleString()}
          delta="+0%"
          icon={FileBarChart}
        />
        <Kpi
          label="Conversion Rate"
          value={conversionRate}
          delta="+0%"
          icon={TrendingUp}
        />
      </div>

      {showAllNotificationsModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-mm-dark/40 backdrop-blur-sm"
            onClick={() => setShowAllNotificationsModal(false)}
          />
          <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-white border border-mm-border rounded-[24px] overflow-hidden shadow-2xl z-50">
            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between border-b border-mm-border bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-mm-orange/10">
                  <BellRing size={20} className="text-mm-orange" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-mm-dark">
                    All Notifications
                  </h2>
                  <p className="text-xs text-mm-gray mt-0.5">
                    Manage your alerts, updates, and reminders
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setClearConfirmOpen(true)}
                  disabled={notifications.length === 0}
                  className="text-xs font-bold text-mm-red hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  Clear all
                </button>
                <button
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                  className="text-xs font-bold text-mm-orange hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  Mark all read
                </button>
                <div className="h-6 w-px bg-mm-border" />
                <button
                  onClick={() => setShowAllNotificationsModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-mm-subtle transition-colors cursor-pointer"
                >
                  <X size={20} className="text-mm-gray" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 border-b border-mm-border flex items-center gap-6 bg-white">
              {["All", "Unread", "Payments", "Projects", "System"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setModalTab(tab)}
                    className={`py-3 text-xs font-bold relative transition-colors cursor-pointer ${
                      modalTab === tab
                        ? "text-mm-dark font-extrabold"
                        : "text-mm-gray"
                    }`}
                  >
                    {tab}
                    {modalTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-mm-orange rounded-t-full" />
                    )}
                  </button>
                ),
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 bg-mm-subtle/20">
              <div className="space-y-3">
                {fullModalFilteredNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-sm ${
                      n.read
                        ? "bg-white border-mm-border"
                        : "bg-mm-orange/5 border-mm-orange/20"
                    }`}
                  >
                    {!n.read && (
                      <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-mm-orange" />
                    )}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-4 bg-mm-subtle">
                      <n.icon size={20} className="text-mm-dark" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-xs text-mm-dark truncate">
                            {n.title}
                          </h3>
                          <p className="text-xs text-mm-gray mt-0.5 leading-normal">
                            {n.message}
                          </p>
                        </div>
                        <span className="text-[10px] shrink-0 font-bold px-2.5 py-1 rounded-md bg-mm-subtle text-mm-dark">
                          {n.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-mm-subtle text-mm-dark">
                          {n.category}
                        </span>
                        {n.action && (
                          <button
                            onClick={() => {
                              setNotifications(
                                notifications.map((notif) =>
                                  notif.id === n.id
                                    ? { ...notif, read: true }
                                    : notif,
                                ),
                              );
                              setShowAllNotificationsModal(false);
                              if (n.path) navigate({ to: n.path });
                            }}
                            className="text-xs font-bold text-mm-orange hover:underline"
                          >
                            {n.action}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {fullModalFilteredNotifications.length === 0 && (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-mm-subtle">
                      <CheckSquare size={32} className="text-mm-gray" />
                    </div>
                    <h3 className="font-extrabold text-sm text-mm-dark">
                      You're all caught up!
                    </h3>
                    <p className="text-xs text-mm-gray mt-1 font-medium">
                      No {modalTab.toLowerCase()} notifications found.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Clear Confirm Sub-modal */}
          {clearConfirmOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-mm-dark/40 backdrop-blur-sm"
                onClick={() => setClearConfirmOpen(false)}
              />
              <div className="relative p-6 rounded-[20px] shadow-xl max-w-sm w-full bg-white border border-mm-border z-50">
                <h3 className="font-extrabold text-sm text-mm-dark mb-2">
                  Clear All Notifications?
                </h3>
                <p className="text-xs text-mm-gray font-medium mb-6 leading-relaxed">
                  This action cannot be undone. All your notifications will be
                  permanently removed.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setClearConfirmOpen(false)}
                    className="px-4 py-2 text-xs font-bold rounded-xl border border-mm-border text-mm-dark bg-white hover:bg-mm-subtle/50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setNotifications([]);
                      setClearConfirmOpen(false);
                    }}
                    className="px-4 py-2 text-xs font-extrabold rounded-xl bg-mm-red text-white transition-all hover:bg-mm-red/90"
                  >
                    Yes, Clear All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
