import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Users as UsersIcon, FolderKanban, Briefcase, DollarSign, CheckSquare,
  Bell, BellRing, Calendar, FileCheck, FileBarChart, LifeBuoy, TrendingUp, ChevronDown, AlertCircle, UserPlus, Clock, Settings, X, FileText, Loader2
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart, PieChart, Pie, Cell,
} from "recharts";
import { useState, useRef, useEffect, useMemo } from "react";
import { Card } from "../components/admin/shared";
import { getUsers, getProjects, getPayments, getReports } from "../lib/db";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — GrowConsult AI" }] }),
  component: Dashboard,
});

interface KpiProps {
  label: string;
  value: string;
  delta: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  subLabel?: string;
  valueSize?: string;
}

function Kpi({ label, value, delta, icon: Icon, subLabel, valueSize }: KpiProps) {
  return (
    <Card className="!p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold" style={{ color: "var(--color-title)" }}>{label}</div>
          <div className="font-bold mt-2" style={{ color: "var(--color-heading)", fontSize: valueSize || "1.875rem", lineHeight: valueSize ? "1.2" : "2.25rem" }}>{value}</div>
          {subLabel && <div className="mt-1" style={{ color: "#A1887F", fontSize: "11px" }}>{subLabel}</div>}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "color-mix(in oklch, var(--color-primary) 18%, white)" }}
        >
          <Icon size={20} style={{ color: "var(--color-primary)" }} />
        </div>
      </div>
      <div className="mt-3">
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{
            background: "color-mix(in oklch, var(--color-success) 15%, white)",
            color: "var(--color-success)",
          }}
        >
          <TrendingUp size={12} />
          {delta}
        </span>
      </div>
    </Card>
  );
}

function Dashboard() {
  const [revenueView, setRevenueView] = useState<"This Year" | "This Month">("This Year");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [dateRangeText, setDateRangeText] = useState("May 20 – May 26, 2024");
  const [appliedDateFilter, setAppliedDateFilter] = useState<string | null>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [quickDate, setQuickDate] = useState("This Week");

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifTab, setNotifTab] = useState("All");
  const navigate = useNavigate();

  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Initialize notifications to an empty list
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [u, p, pay, r] = await Promise.all([
          getUsers(),
          getProjects(),
          getPayments(),
          getReports()
        ]);
        setUsers(u);
        setProjects(p);
        setPayments(pay);
        setReports(r);
      } catch (err) {
        console.error("Dashboard failed to fetch data from Firestore:", err);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadAllData();
  }, []);

  const totalRevenue = useMemo(() => {
    const sum = payments.reduce((acc, p) => {
      let amt = 0;
      if (typeof p.amount === "string") {
        amt = parseFloat(p.amount.replace(/[^0-9.]/g, "")) || 0;
      } else if (typeof p.amount === "number") {
        amt = p.amount;
      }
      return acc + amt;
    }, 0);
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(sum);
  }, [payments]);

  const thisMonthRevenue = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const sum = payments.reduce((acc, p) => {
      if (p.date) {
        try {
          const dateObj = new Date(p.date);
          if (dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear) {
            let amt = 0;
            if (typeof p.amount === "string") {
              amt = parseFloat(p.amount.replace(/[^0-9.]/g, "")) || 0;
            } else if (typeof p.amount === "number") {
              amt = p.amount;
            }
            return acc + amt;
          }
        } catch (e) {}
      }
      return acc;
    }, 0);
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(sum);
  }, [payments]);

  const taskStats = useMemo(() => {
    let total = 0;
    let completed = 0;
    projects.forEach(p => {
      if (p.serviceGroups) {
        p.serviceGroups.forEach((sg: any) => {
          if (sg.tasks) {
            sg.tasks.forEach((t: any) => {
              total++;
              if (t.status === "Completed") completed++;
            });
          }
        });
      }
    });
    return `${total} / ${completed}`;
  }, [projects]);

  const conversionRate = useMemo(() => {
    if (users.length === 0) return "0.0%";
    const active = users.filter(u => u.status === "Active").length;
    return `${((active / users.length) * 100).toFixed(1)}%`;
  }, [users]);

  const auditsCompleted = useMemo(() => {
    return projects.filter(p => p.status === "Completed").length;
  }, [projects]);

  const computedRevenueData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlySum = months.map(m => ({ name: m, value: 0 }));
    payments.forEach(p => {
      let amt = 0;
      if (typeof p.amount === "string") {
        amt = parseFloat(p.amount.replace(/[^0-9.]/g, "")) || 0;
      } else if (typeof p.amount === "number") {
        amt = p.amount;
      }
      if (p.date) {
        try {
          const dateObj = new Date(p.date);
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
    const weeklySum = weeks.map(w => ({ name: w, value: 0 }));
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    payments.forEach(p => {
      let amt = 0;
      if (typeof p.amount === "string") {
        amt = parseFloat(p.amount.replace(/[^0-9.]/g, "")) || 0;
      } else if (typeof p.amount === "number") {
        amt = p.amount;
      }
      if (p.date) {
        try {
          const dateObj = new Date(p.date);
          if (dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear) {
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
        { name: "Completed", value: 0, color: "var(--color-success)" },
        { name: "In Progress", value: 0, color: "var(--color-info)" },
        { name: "Pending", value: 0, color: "var(--color-pending)" },
        { name: "On Hold", value: 0, color: "var(--color-danger)" },
        { name: "Cancelled", value: 0, color: "var(--color-subtle)" },
      ];
    }
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return [
      { name: "Completed", value: Math.round(((counts["Completed"] || 0) / total) * 100), color: "var(--color-success)" },
      { name: "In Progress", value: Math.round(((counts["In Progress"] || 0) / total) * 100), color: "var(--color-info)" },
      { name: "Pending", value: Math.round(((counts["Pending"] || 0) / total) * 100), color: "var(--color-pending)" },
      { name: "On Hold", value: Math.round(((counts["On Hold"] || 0) / total) * 100), color: "var(--color-danger)" },
      { name: "Cancelled", value: Math.round(((counts["Cancelled"] || 0) / total) * 100), color: "var(--color-subtle)" },
    ];
  }, [projects]);

  const [showAllNotificationsModal, setShowAllNotificationsModal] = useState(false);
  const [modalTab, setModalTab] = useState("All");
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = notifications.filter(n => {
    if (notifTab === "Unread") return !n.read;
    if (notifTab === "Alerts") return n.category === "Payments" || n.category === "System";
    return true;
  });

  const fullModalFilteredNotifications = notifications.filter(n => {
    if (modalTab === "Unread") return !n.read;
    if (modalTab === "Payments") return n.category === "Payments";
    if (modalTab === "Projects") return n.category === "Projects";
    if (modalTab === "System") return n.category === "System";
    return true;
  });

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleNotifClick = (n: any) => {
    setNotifications(notifications.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
    if (n.path) navigate({ to: n.path });
  };
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-heading)" }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-body)" }}>
            Here's what's happening with your platform
          </p>
        </div>
        <div className="flex items-center gap-3 relative" ref={datePickerRef}>
          <button
            onClick={() => setDatePickerOpen(!datePickerOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors"
            style={{
              background: "#FCF8F1",
              border: "1px solid #E8DCC8",
              color: "#6D4C41",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#D4B483";
              e.currentTarget.style.background = "#F8F1E7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E8DCC8";
              e.currentTarget.style.background = "#FCF8F1";
            }}
          >
            <Calendar size={16} style={{ color: "#E89D18" }} />
            {dateRangeText}
            <ChevronDown size={14} style={{ color: "#A1887F", marginLeft: "4px" }} />
          </button>

          {datePickerOpen && (
            <div
              style={{
                background: "#FCF8F1",
                border: "1px solid #E8DCC8",
                borderRadius: "16px",
                padding: "16px",
                boxShadow: "0 8px 24px rgba(78,52,46,0.12)",
                zIndex: 100,
                minWidth: "300px",
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "8px"
              }}
            >
              <div style={{ color: "#6D4C41", fontWeight: 600, fontSize: "14px", marginBottom: "12px" }}>Select Date Range</div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {["Today", "This Week", "This Month", "Last Month", "This Year"].map((opt) => {
                  const isActive = quickDate === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setQuickDate(opt)}
                      style={{
                        background: isActive ? "#FFF3D6" : "#F8F1E7",
                        border: isActive ? "1px solid #E89D18" : "1px solid #E8DCC8",
                        color: isActive ? "#E89D18" : "#6D4C41",
                        borderRadius: "8px",
                        padding: "4px 12px",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "#FFF3D6";
                          e.currentTarget.style.borderColor = "#E89D18";
                          e.currentTarget.style.color = "#E89D18";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "#F8F1E7";
                          e.currentTarget.style.borderColor = "#E8DCC8";
                          e.currentTarget.style.color = "#6D4C41";
                        }
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label style={{ color: "#A1887F", fontSize: "12px", display: "block", marginBottom: "4px" }}>From</label>
                  <input
                    type="date"
                    defaultValue="2024-05-20"
                    style={{
                      background: "#FFFDF8",
                      border: "1px solid #E8DCC8",
                      borderRadius: "10px",
                      padding: "8px 12px",
                      color: "#4E342E",
                      width: "140px",
                      outline: "none"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#E89D18"}
                    onBlur={(e) => e.target.style.borderColor = "#E8DCC8"}
                  />
                </div>
                <div className="flex-1">
                  <label style={{ color: "#A1887F", fontSize: "12px", display: "block", marginBottom: "4px" }}>To</label>
                  <input
                    type="date"
                    defaultValue="2024-05-26"
                    style={{
                      background: "#FFFDF8",
                      border: "1px solid #E8DCC8",
                      borderRadius: "10px",
                      padding: "8px 12px",
                      color: "#4E342E",
                      width: "140px",
                      outline: "none"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#E89D18"}
                    onBlur={(e) => e.target.style.borderColor = "#E8DCC8"}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-3 pt-3" style={{ borderTop: "1px solid #E8DCC8" }}>
                <button
                  onClick={() => setDatePickerOpen(false)}
                  style={{ padding: "6px 14px", fontSize: "13px", borderRadius: "10px", border: "1px solid #E8DCC8", background: "#FCF8F1", color: "#6D4C41" }}
                  className="hover:opacity-80 transition-opacity font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyDate}
                  style={{ padding: "6px 14px", fontSize: "13px", borderRadius: "10px", background: "#E89D18", color: "white" }}
                  className="hover:opacity-90 transition-opacity font-semibold"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
          <div className="relative inline-flex">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative rounded-xl flex items-center justify-center transition-colors"
              style={{ 
                background: isNotificationOpen ? "#FFF3D6" : "var(--color-card)", 
                border: "1px solid var(--color-border)",
                padding: "8px",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => { if (!isNotificationOpen) e.currentTarget.style.background = "#F8F1E7" }}
              onMouseLeave={(e) => { if (!isNotificationOpen) e.currentTarget.style.background = "var(--color-card)" }}
            >
              {isNotificationOpen ? (
                <BellRing size={22} style={{ color: "#E89D18" }} />
              ) : (
                <BellRing size={22} style={{ color: "#6D4C41" }} />
              )}
              {unreadCount > 0 && (
                <span
                  className="absolute"
                  style={{ 
                    top: "4px", right: "4px", background: "#E89D18", color: "white", 
                    fontSize: "10px", fontWeight: 700, borderRadius: "999px", 
                    minWidth: "18px", height: "18px", display: "flex", 
                    alignItems: "center", justifyContent: "center", 
                    border: "2px solid #FFFDF8" 
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <>
                <div className="fixed inset-0 z-[190]" onClick={() => setIsNotificationOpen(false)} />
                <div className="absolute right-0 z-[200]" style={{ top: "calc(100% + 8px)" }}>
                  <div style={{ background: "#FCF8F1", border: "1px solid #E8DCC8", borderRadius: "20px", width: "380px", boxShadow: "0 8px 32px rgba(78,52,46,0.12)", overflow: "hidden" }}>
                    <div className="flex justify-between items-center" style={{ padding: "16px 20px", borderBottom: "1px solid #E8DCC8" }}>
                      <div className="font-bold text-[16px]" style={{ color: "#4E342E" }}>Notifications</div>
                      <div className="flex gap-4 items-center">
                        <button 
                          onClick={markAllRead} 
                          disabled={unreadCount === 0}
                          className="text-[13px] hover:underline cursor-pointer" 
                          style={{ color: unreadCount === 0 ? "#A1887F" : "#E89D18" }}
                        >
                          Mark all read
                        </button>
                        <button onClick={() => setIsNotificationOpen(false)} className="cursor-pointer">
                          <X size={18} style={{ color: "#A1887F" }} onMouseEnter={(e) => e.currentTarget.style.color = "#6D4C41"} onMouseLeave={(e) => e.currentTarget.style.color = "#A1887F"} />
                        </button>
                      </div>
                    </div>
                    <div className="flex px-5" style={{ borderBottom: "1px solid #E8DCC8" }}>
                      {["All", "Unread", "Alerts"].map(tab => (
                        <button
                          key={tab}
                          onClick={() => setNotifTab(tab)}
                          className="cursor-pointer"
                          style={{
                            padding: "10px 16px 13px",
                            fontWeight: notifTab === tab ? 700 : 400,
                            color: notifTab === tab ? "#4E342E" : "#8D6E63",
                            borderBottom: notifTab === tab ? "2px solid #E89D18" : "2px solid transparent",
                            fontSize: "13px"
                          }}
                          onMouseEnter={(e) => { if (notifTab !== tab) e.currentTarget.style.color = "#6D4C41" }}
                          onMouseLeave={(e) => { if (notifTab !== tab) e.currentTarget.style.color = "#8D6E63" }}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    <div style={{ maxHeight: "380px", overflowY: "auto" }}>
                      {filteredNotifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotifClick(n)}
                          className="flex items-start gap-3 cursor-pointer"
                          style={{
                            padding: "14px 20px",
                            borderBottom: "1px solid #E8DCC8",
                            background: n.read ? "#FFFDF8" : "#FFF3D6",
                            transition: "background 150ms"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = n.read ? "#F8F1E7" : "#FFE9A0"}
                          onMouseLeave={(e) => e.currentTarget.style.background = n.read ? "#FFFDF8" : "#FFF3D6"}
                        >
                          <div 
                            className="mt-1.5 rounded-full shrink-0" 
                            style={{ 
                              width: "8px", height: "8px", 
                              background: n.read ? "transparent" : "#E89D18", 
                              border: n.read ? "1.5px solid #E8DCC8" : "none" 
                            }} 
                          />
                          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: n.bg }}>
                            <n.icon size={18} style={{ color: n.color }} />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-[13px]" style={{ color: "#4E342E" }}>{n.title}</div>
                            <div className="text-[12px] mt-0.5" style={{ color: "#8D6E63" }}>{n.message}</div>
                            <div className="flex justify-between items-center mt-1.5">
                              <div className="text-[11px]" style={{ color: "#A1887F" }}>{n.time}</div>
                              {n.action && (
                                <div className="text-[12px] font-medium" style={{ color: "#E89D18" }}>{n.action}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredNotifications.length === 0 && (
                        <div className="p-8 text-center text-[13px]" style={{ color: "#8D6E63" }}>
                          No notifications found.
                        </div>
                      )}
                    </div>
                    <div className="text-center" style={{ padding: "12px 20px", borderTop: "1px solid #E8DCC8" }}>
                      <button 
                        onClick={() => { setShowAllNotificationsModal(true); setIsNotificationOpen(false); }}
                        className="text-[13px] font-semibold hover:underline cursor-pointer" 
                        style={{ color: "#E89D18" }}
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

      {isLoadingData ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-2">
          <Loader2 size={32} className="animate-spin text-[#E89D18]" />
          <span className="text-sm font-semibold" style={{ color: "#8D6E63" }}>Loading dashboard stats...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Kpi label="Total Users" value={users.length.toLocaleString()} delta="+0%" icon={UsersIcon} subLabel={appliedDateFilter || undefined} />
            <Kpi label="Total Projects" value={projects.length.toLocaleString()} delta="+0%" icon={FolderKanban} subLabel={appliedDateFilter || undefined} />
            <Kpi label="Active Projects" value={projects.filter(p => p.status === "In Progress").length.toLocaleString()} delta="+0%" icon={Briefcase} subLabel={appliedDateFilter || undefined} />
            <Kpi label="Total Revenue" value={totalRevenue} delta="+0%" icon={DollarSign} subLabel={appliedDateFilter || "All time cumulative"} />
            <Kpi label="Total Tasks" value={taskStats} delta="+0%" icon={CheckSquare} subLabel={appliedDateFilter || "Assigned / Completed"} valueSize="22px" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold" style={{ color: "var(--color-title)" }}>Revenue Overview</h3>
                  <div style={{ color: "#4E342E", fontWeight: 700, fontSize: "14px", marginTop: "2px", transition: "all 150ms ease" }}>
                    {revenueView === "This Year" ? `Total Revenue: ${totalRevenue}` : `This Month Revenue: ${thisMonthRevenue}`}
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={revenueView}
                    onChange={(e) => setRevenueView(e.target.value as any)}
                    style={{
                      appearance: "none",
                      background: "#F8F1E7",
                      border: "1px solid #E8DCC8",
                      borderRadius: "8px",
                      padding: "6px 28px 6px 12px",
                      color: "#6D4C41",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      outline: "none",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#E89D18"}
                    onBlur={(e) => e.target.style.borderColor = "#E8DCC8"}
                  >
                    <option value="This Year">This Year</option>
                    <option value="This Month">This Month</option>
                  </select>
                  <ChevronDown size={14} style={{ color: "#A1887F", position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                </div>
              </div>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <AreaChart data={revenueView === "This Year" ? computedRevenueData : computedRevenueDataMonth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(232,157,24,0.2)" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#E8DCC8" strokeDasharray="3 3" vertical={false} opacity={0.5} />
                    <XAxis dataKey="name" stroke="#A1887F" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis
                      domain={revenueView === "This Year" ? [0, 'auto'] : [0, 'auto']}
                      stroke="#A1887F" fontSize={11} tickLine={false} axisLine={false}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#4E342E",
                        border: "none",
                        borderRadius: "8px",
                        color: "white",
                        padding: "8px 12px"
                      }}
                      itemStyle={{ color: "white" }}
                      formatter={(v: number) => [`$${v.toLocaleString()}`, ""]}
                      labelFormatter={(label) => `${label} —`}
                      animationDuration={400}
                    />
                    <Area
                      type="monotone" dataKey="value"
                      stroke="#E89D18" strokeWidth={3}
                      fill="url(#rev)"
                      animationDuration={400}
                    />
                    <Line type="monotone" dataKey="value" stroke="#E89D18" strokeWidth={3} dot={{ r: 4, fill: "#E89D18", strokeWidth: 0 }} animationDuration={400} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: "var(--color-title)" }}>Projects by Status</h3>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div style={{ width: 220, height: 220, position: "relative" }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={computedProjectStatusData} dataKey="value" innerRadius={65} outerRadius={95} paddingAngle={2}>
                        {computedProjectStatusData.map((d) => <Cell key={d.name} fill={d.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-2xl font-bold" style={{ color: "var(--color-heading)" }}>{projects.length}</div>
                    <div className="text-xs" style={{ color: "var(--color-body)" }}>Total Projects</div>
                  </div>
                </div>
                <div className="flex-1 space-y-2 w-full">
                  {computedProjectStatusData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2" style={{ color: "var(--color-title)" }}>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                        {d.name}
                      </div>
                      <span className="font-semibold" style={{ color: "var(--color-heading)" }}>{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Kpi label="Audits Completed" value={auditsCompleted.toLocaleString()} delta="+0%" icon={FileCheck} />
            <Kpi label="Reports Generated" value={reports.length.toLocaleString()} delta="+0%" icon={FileBarChart} />
            <Kpi label="Conversion Rate" value={conversionRate} delta="+0%" icon={TrendingUp} />
          </div>
        </>
      )}

      {showAllNotificationsModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#4E342E]/60 backdrop-blur-sm" onClick={() => setShowAllNotificationsModal(false)} />
          <div 
            className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl" 
            style={{ background: "#FCF8F1", border: "1px solid #E8DCC8" }}
          >
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: "#E8DCC8", background: "#FFFDF8" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FFF3D6" }}>
                  <BellRing size={20} style={{ color: "#E89D18" }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: "#4E342E" }}>All Notifications</h2>
                  <p className="text-sm" style={{ color: "#8D6E63" }}>Manage your alerts, updates, and reminders</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setClearConfirmOpen(true)}
                  disabled={notifications.length === 0}
                  className="text-sm font-semibold hover:underline" 
                  style={{ color: notifications.length === 0 ? "#D7CCC8" : "#EF5350", opacity: notifications.length === 0 ? 0.5 : 1 }}
                >
                  Clear all
                </button>
                <button 
                  onClick={markAllRead} 
                  disabled={unreadCount === 0}
                  className="text-sm font-semibold hover:underline" 
                  style={{ color: unreadCount === 0 ? "#D7CCC8" : "#E89D18", opacity: unreadCount === 0 ? 0.5 : 1 }}
                >
                  Mark all read
                </button>
                <div className="h-6 w-px" style={{ background: "#E8DCC8" }} />
                <button 
                  onClick={() => setShowAllNotificationsModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F8F1E7] transition-colors"
                >
                  <X size={20} style={{ color: "#8D6E63" }} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 border-b flex items-center gap-6" style={{ borderColor: "#E8DCC8", background: "#FFFDF8" }}>
              {["All", "Unread", "Payments", "Projects", "System"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setModalTab(tab)}
                  className="py-3 text-sm font-semibold relative transition-colors"
                  style={{ 
                    color: modalTab === tab ? "#4E342E" : "#8D6E63" 
                  }}
                >
                  {tab}
                  {modalTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: "#E89D18" }} />
                  )}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6" style={{ background: "#FCF8F1" }}>
              <div className="space-y-3">
                {fullModalFilteredNotifications.map(n => (
                  <div 
                    key={n.id}
                    className="group relative flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-sm"
                    style={{ 
                      borderColor: "#E8DCC8", 
                      background: n.read ? "#FFFDF8" : "#FFF3D6",
                    }}
                  >
                    {!n.read && (
                      <div className="absolute top-4 left-4 w-2 h-2 rounded-full" style={{ background: "#E89D18" }} />
                    )}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-4" style={{ background: n.bg }}>
                      <n.icon size={20} style={{ color: n.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-sm truncate" style={{ color: "#4E342E" }}>{n.title}</h3>
                          <p className="text-sm mt-0.5" style={{ color: "#8D6E63" }}>{n.message}</p>
                        </div>
                        <span className="text-xs shrink-0 font-medium px-2.5 py-1 rounded-md" style={{ background: "#F8F1E7", color: "#6D4C41" }}>
                          {n.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: "#E8DCC8", color: "#4E342E" }}>
                          {n.category}
                        </span>
                        {n.action && (
                          <button 
                            onClick={() => {
                              setNotifications(notifications.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
                              setShowAllNotificationsModal(false);
                              if (n.path) navigate({ to: n.path });
                            }}
                            className="text-xs font-bold hover:underline" 
                            style={{ color: "#E89D18" }}
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
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#F8F1E7" }}>
                      <CheckSquare size={32} style={{ color: "#D7CCC8" }} />
                    </div>
                    <h3 className="font-semibold" style={{ color: "#4E342E" }}>You're all caught up!</h3>
                    <p className="text-sm mt-1" style={{ color: "#8D6E63" }}>No {modalTab.toLowerCase()} notifications found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Clear Confirm Sub-modal */}
          {clearConfirmOpen && (
            <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-[#4E342E]/40 backdrop-blur-sm" onClick={() => setClearConfirmOpen(false)} />
              <div className="relative p-6 rounded-2xl shadow-xl max-w-sm w-full" style={{ background: "#FCF8F1", border: "1px solid #E8DCC8" }}>
                <h3 className="font-bold text-lg mb-2" style={{ color: "#4E342E" }}>Clear All Notifications?</h3>
                <p className="text-sm mb-6" style={{ color: "#8D6E63" }}>
                  This action cannot be undone. All your notifications will be permanently removed.
                </p>
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setClearConfirmOpen(false)}
                    className="px-4 py-2 text-sm font-semibold rounded-xl"
                    style={{ background: "#F8F1E7", color: "#6D4C41" }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      setNotifications([]);
                      setClearConfirmOpen(false);
                    }}
                    className="px-4 py-2 text-sm font-semibold rounded-xl"
                    style={{ background: "#EF5350", color: "white" }}
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
