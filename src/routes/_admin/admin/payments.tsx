import { createFileRoute } from "@tanstack/react-router";
import {
  Avatar,
  StatusBadge,
  PlanBadge,
  Card,
} from "@/components/admin/shared";
import {
  AlertCircle,
  Coins,
  Clock,
  AlertTriangle,
  Search,
  Download,
  CheckCircle2,
  X,
  ChevronDown,
  ArrowUpDown,
  Loader2,
  Mail,
  Copy,
  Calendar,
  DownloadCloud,
  SearchX,
  Building2,
  Users2,
  TrendingUp,
  FileCheck,
  ArrowRight,
  Check,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import {
  getPaymentsFn,
  getUsersFn,
  getBusinessesFn,
  getPlansFn,
  refundPaymentFn,
  sendPaymentReminderFn,
  logCsvExportFn,
} from "@/lib/server-functions";
import type { Payment, User, Business, Plan } from "@/lib/schemas";
import { AdminLoader } from "@/components/AdminLoader";

export const Route = createFileRoute("/_admin/admin/payments")({
  head: () => ({ meta: [{ title: "Payments Management — GrowConsult AI" }] }),
  loader: async () => {
    try {
      const [payments, users, businesses, plans] = await Promise.all([
        getPaymentsFn(),
        getUsersFn(),
        getBusinessesFn(),
        getPlansFn(),
      ]);
      return { payments, users, businesses, plans };
    } catch (err) {
      console.error("Loader failed to fetch payments data:", err);
      return { payments: [], users: [], businesses: [], plans: [] };
    }
  },
  pendingComponent: AdminLoader,
  pendingMs: 0,
  component: PaymentsPage,
});

// Custom component to render avatars with URL support and initials fallback
function EntityAvatar({
  imageUrl,
  name,
  size = 32,
  isBusiness = false,
}: {
  imageUrl?: string;
  name: string;
  size?: number;
  isBusiness?: boolean;
}) {
  const [imageError, setImageError] = useState(false);

  if (imageUrl && !imageError) {
    return (
      <img
        src={imageUrl}
        alt={name}
        onError={() => setImageError(true)}
        className="rounded-full object-cover shrink-0 border border-gray-100"
        style={{ width: size, height: size }}
      />
    );
  }

  return <Avatar name={name} size={size} />;
}

function PaymentsPage() {
  const {
    payments: initialPayments,
    users,
    businesses,
    plans,
  } = Route.useLoaderData();
  const [paymentsData, setPaymentsData] = useState<Payment[]>(initialPayments);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    null,
  );

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [planFilter, setPlanFilter] = useState("All Plans");

  // Period filter for the first row of KPI cards
  const [kpiPeriod, setKpiPeriod] = useState("All Time");

  // Sorting
  const [sortField, setSortField] = useState<"timestamp" | "amount" | "status">(
    "timestamp",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // UI States
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState<string | null>(
    null,
  );
  const [isRefunding, setIsRefunding] = useState(false);

  useEffect(() => {
    setPaymentsData(initialPayments);
  }, [initialPayments]);

  // Autoclose Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (selectedPaymentId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPaymentId]);

  // Helper to copy text to clipboard
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setToast({
      message: `Copied ${label} to clipboard!`,
      type: "success",
    });
  };

  // Helper to format currency
  const formatCurrency = (amount: number, currencyCode: string = "INR") => {
    return new Intl.NumberFormat(currencyCode === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Utility to filter payments by selected period
  const filterByPeriod = (pDate: any, period: string) => {
    const now = new Date();
    const paymentDate = new Date(pDate);
    if (period === "This Month") {
      return (
        paymentDate.getMonth() === now.getMonth() &&
        paymentDate.getFullYear() === now.getFullYear()
      );
    }
    if (period === "Last Month") {
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const year =
        now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return (
        paymentDate.getMonth() === lastMonth &&
        paymentDate.getFullYear() === year
      );
    }
    if (period === "This Year") {
      return paymentDate.getFullYear() === now.getFullYear();
    }
    return true; // All Time
  };

  // Resolve raw payment data to include relations + deletion safety check
  const resolvedPayments = useMemo(() => {
    return paymentsData.map((p) => {
      const userIdStr =
        typeof p.userId === "string" ? p.userId : (p.userId as any)?.id || "";
      const businessIdStr =
        typeof p.businessId === "string"
          ? p.businessId
          : (p.businessId as any)?.id || "";

      const resolvedUser = users.find((u) => u.id === userIdStr);
      const resolvedBusiness = businesses.find((b) => b.id === businessIdStr);

      return {
        ...p,
        resolvedUser,
        resolvedBusiness,
        userIdStr,
        businessIdStr,
        isUserDeleted: !resolvedUser,
        isBusinessDeleted: !resolvedBusiness,
        clientName: resolvedUser
          ? resolvedUser.fullName
          : `Deleted User (${userIdStr.slice(0, 6)})`,
        businessName: resolvedBusiness
          ? resolvedBusiness.businessName
          : `Deleted Business (${businessIdStr.slice(0, 6)})`,
        plan: resolvedBusiness ? resolvedBusiness.plan : "None",
      };
    });
  }, [paymentsData, users, businesses]);

  // First Row KPIs (Filtered by Period)
  const firstRowMetrics = useMemo(() => {
    const filtered = resolvedPayments.filter((p) =>
      filterByPeriod(p.timestamp, kpiPeriod),
    );

    const paidPayments = filtered.filter((p) => p.status === "Paid");
    const pendingPayments = filtered.filter((p) => p.status === "Pending");
    const refundedPayments = filtered.filter((p) => p.status === "Refunded");

    const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingRevenue = pendingPayments.reduce(
      (sum, p) => sum + p.amount,
      0,
    );
    const refundedRevenue = refundedPayments.reduce(
      (sum, p) => sum + p.amount,
      0,
    );
    const avgTicket =
      filtered.length > 0
        ? filtered.reduce((sum, p) => sum + p.amount, 0) / filtered.length
        : 0;

    return {
      totalRevenue,
      pendingRevenue,
      refundedRevenue,
      avgTicket,
      count: filtered.length,
    };
  }, [resolvedPayments, kpiPeriod]);

  // Second Row KPIs (Business Owner Portfolio Metrics)
  const secondRowMetrics = useMemo(() => {
    const totalCount = businesses.length;
    const paidCount = businesses.filter((b) => b.plan !== "None").length;

    // Calculate overdue accounts dynamically (Failed, or Pending past 14 days grace period)
    const overdueCount = businesses.filter((b) => {
      const isFailed = b.paymentStatus === "Failed";
      const isPendingOverdue =
        b.paymentStatus === "Pending" &&
        Date.now() - new Date(b.updatedAt).getTime() > 14 * 24 * 60 * 60 * 1000;
      return isFailed || isPendingOverdue;
    }).length;

    // Avg LTV: Total Revenue / Total Businesses count
    const totalPaidEver = resolvedPayments
      .filter((p) => p.status === "Paid")
      .reduce((sum, p) => sum + p.amount, 0);
    const avgLtv = totalCount > 0 ? totalPaidEver / totalCount : 0;

    return {
      totalBusinesses: totalCount,
      paidPlans: paidCount,
      overdueAccounts: overdueCount,
      avgLtv,
    };
  }, [resolvedPayments, businesses]);

  // Horizontal list of overdue items
  const overdueItems = useMemo(() => {
    const map = new Map<string, any>();

    // Helper to find dynamic monthly price of a plan
    const getPlanPrice = (planName: string) => {
      const resolvedPlan = plans.find((pl) => pl.id === planName.toLowerCase());
      if (resolvedPlan) {
        // Multiply by 100 if we are working with INR representation in frontend
        return resolvedPlan.priceMonthly * 100;
      }
      return planName === "Pro"
        ? 8900
        : planName === "Plus"
          ? 5900
          : planName === "Basic"
            ? 2900
            : 0;
    };

    // 1. Scan overdue payments dynamically (Failed, or Pending past 14 days)
    resolvedPayments.forEach((p) => {
      const isFailed = p.status === "Failed";
      const isPendingOverdue =
        p.status === "Pending" &&
        Date.now() - new Date(p.timestamp).getTime() > 14 * 24 * 60 * 60 * 1000;

      if (isFailed || isPendingOverdue) {
        map.set(p.businessIdStr, {
          id: p.id,
          amount: p.amount,
          plan: p.plan,
          timestamp: p.timestamp,
          clientName: p.clientName,
          businessName: p.businessName,
          email: p.resolvedUser?.email || "N/A",
          phone: p.resolvedUser?.phone || "N/A",
          imageUrl: p.resolvedUser?.image,
          isUserDeleted: p.isUserDeleted,
          isBusinessDeleted: p.isBusinessDeleted,
        });
      }
    });

    // 2. Scan businesses flagged overdue to ensure we cover everything
    businesses.forEach((b) => {
      const isFailed = b.paymentStatus === "Failed";
      const isPendingOverdue =
        b.paymentStatus === "Pending" &&
        Date.now() - new Date(b.updatedAt).getTime() > 14 * 24 * 60 * 60 * 1000;

      if ((isFailed || isPendingOverdue) && !map.has(b.id)) {
        const usr = users.find(
          (u) =>
            u.id === (typeof b.userId === "string" ? b.userId : b.userId?.id),
        );
        map.set(b.id, {
          id: `auto_${b.id}`,
          amount: getPlanPrice(b.plan),
          plan: b.plan,
          timestamp: b.updatedAt,
          clientName: usr ? usr.fullName : "Deleted User",
          businessName: b.businessName,
          email: usr?.email || "N/A",
          phone: usr?.phone || "N/A",
          imageUrl: usr?.image,
          isUserDeleted: !usr,
          isBusinessDeleted: false,
        });
      }
    });

    return Array.from(map.values());
  }, [resolvedPayments, businesses, users, plans]);

  // Main table list with filters & sorting applied
  const finalTableData = useMemo(() => {
    let result = resolvedPayments.filter((p) => {
      const matchesSearch =
        searchQuery === "" ||
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All Status" || p.status === statusFilter;

      const matchesPlan = planFilter === "All Plans" || p.plan === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });

    // Apply Sorting
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === "timestamp") {
        valA = new Date(a.timestamp).getTime();
        valB = new Date(b.timestamp).getTime();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    resolvedPayments,
    searchQuery,
    statusFilter,
    planFilter,
    sortField,
    sortOrder,
  ]);

  const selectedPayment = useMemo(() => {
    if (!selectedPaymentId) return null;
    return resolvedPayments.find((p) => p.id === selectedPaymentId) || null;
  }, [selectedPaymentId, resolvedPayments]);

  const [activePayment, setActivePayment] = useState<any | null>(null);
  useEffect(() => {
    if (selectedPayment) {
      setActivePayment(selectedPayment);
    } else {
      const timer = setTimeout(() => {
        setActivePayment(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedPayment]);

  // Export CSV Handler
  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await logCsvExportFn({ data: { recordCount: resolvedPayments.length } });
    } catch (auditErr) {
      console.error("Failed to log CSV export audit:", auditErr);
    }

    setTimeout(() => {
      try {
        const headers = [
          "Payment ID",
          "Client Name",
          "Business Name",
          "Plan",
          "Amount",
          "Currency",
          "Status",
          "Method",
          "Date",
        ];
        const rows = resolvedPayments.map((p) => [
          p.id,
          p.clientName,
          p.businessName,
          p.plan,
          p.amount,
          p.currency,
          p.status,
          p.paymentMethod,
          new Date(p.timestamp).toLocaleDateString(),
        ]);
        const csvContent = [
          headers.join(","),
          ...rows.map((r) => r.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `payments_export_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setToast({ message: "CSV exported successfully!", type: "success" });
      } catch (err) {
        setToast({ message: "Failed to export CSV.", type: "error" });
      } finally {
        setIsExporting(false);
      }
    }, 800);
  };

  // Send Reminder Action
  const triggerSendReminder = async (id: string, name: string) => {
    setIsSendingReminder(id);

    // Resolve email
    let clientEmail = "N/A";
    const payment = resolvedPayments.find((p) => p.id === id);
    if (payment && payment.resolvedUser?.email) {
      clientEmail = payment.resolvedUser.email;
    } else {
      const overdueObj = overdueItems.find((o) => o.id === id);
      if (overdueObj && overdueObj.email) {
        clientEmail = overdueObj.email;
      }
    }

    try {
      await sendPaymentReminderFn({ data: { paymentId: id, clientEmail } });
      setToast({
        message: `Payment reminder successfully emailed to ${name}!`,
        type: "success",
      });
    } catch (err: any) {
      console.error(err);
      setToast({
        message: `Failed to send reminder: ${err.message || "Unknown error"}`,
        type: "error",
      });
    } finally {
      setIsSendingReminder(null);
    }
  };

  // Refund Action
  const handleInitiateRefund = async () => {
    if (!selectedPayment) return;
    setIsRefunding(true);
    try {
      await refundPaymentFn({ data: selectedPayment.id });

      // Update local state to show change in the UI immediately
      setPaymentsData((prev) =>
        prev.map((p) =>
          p.id === selectedPayment.id ? { ...p, status: "Refunded" } : p,
        ),
      );

      setToast({
        message: `Refund initiated for transaction ${selectedPayment.id}!`,
        type: "success",
      });
      setSelectedPaymentId(null);
    } catch (err: any) {
      console.error(err);
      setToast({
        message: `Failed to initiate refund: ${err.message || "Unknown error"}`,
        type: "error",
      });
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Payments Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor transaction streams, analyze recurring billing, and manage
            overdue accounts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-all shadow-sm active:scale-98 disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <DownloadCloud size={16} />
            )}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ROW 1: Period-filtered Revenue & Transaction KPIs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="text-[#3525cd]" size={18} />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-600">
              Revenue Analytics
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Period:</span>
            <select
              value={kpiPeriod}
              onChange={(e) => setKpiPeriod(e.target.value)}
              className="text-xs font-bold border border-gray-200 rounded-xl bg-white px-3 py-1.5 outline-none text-[#3525cd] hover:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
            >
              <option value="All Time">All Time</option>
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="This Year">This Year</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Revenue
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-[#3525cd]">
                {formatCurrency(firstRowMetrics.totalRevenue)}
              </span>
              <span className="text-xs text-emerald-500 font-semibold flex items-center">
                <TrendingUp size={12} className="mr-0.5" /> +8.4%
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              Successful payments in range
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Pending Revenue
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-amber-500">
                {formatCurrency(firstRowMetrics.pendingRevenue)}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              Unresolved active invoices
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Refunded Volume
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-red-500">
                {formatCurrency(firstRowMetrics.refundedRevenue)}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              Reversed or failed transactions
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Avg Ticket / Transaction
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-gray-800">
                {formatCurrency(firstRowMetrics.avgTicket)}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              Across {firstRowMetrics.count} operations
            </p>
          </div>
        </div>
      </div>

      {/* ROW 2: Business Owner Metrics (Global Stats) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="text-[#3525cd]" size={18} />
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-600">
            Portfolio Health
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Total Businesses
              </p>
              <h3 className="text-2xl font-bold text-gray-800 mt-2">
                {secondRowMetrics.totalBusinesses}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">
                Registered business entities
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-[#3525cd] rounded-xl flex items-center justify-center">
              <Building2 size={24} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Active Paid Plans
              </p>
              <h3 className="text-2xl font-bold text-emerald-500 mt-2">
                {secondRowMetrics.paidPlans}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">
                Paid plans (Basic / Plus / Pro)
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
              <FileCheck size={24} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Overdue Accounts
              </p>
              <h3 className="text-2xl font-bold text-red-500 mt-2">
                {secondRowMetrics.overdueAccounts}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">
                Accounts with overdue invoices
              </p>
            </div>
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Average LTV
              </p>
              <h3 className="text-2xl font-bold text-indigo-700 mt-2">
                {formatCurrency(secondRowMetrics.avgLtv)}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">
                Average value per client
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-indigo-700 rounded-xl flex items-center justify-center">
              <Users2 size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: Side-Scrolling Overdue Accounts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-red-500" size={18} />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-600">
              Overdue Collections
            </h2>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 bg-red-50 text-red-600 rounded-md border border-red-100">
            {overdueItems.length} Accounts Pending Payment
          </span>
        </div>

        {overdueItems.length === 0 ? (
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-800">
                  All accounts are fully paid!
                </h3>
                <p className="text-xs text-emerald-600 mt-0.5">
                  There are currently no overdue accounts or pending alerts.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin scrollbar-thumb-gray-200">
            {overdueItems.map((item) => (
              <div
                key={item.id}
                className="snap-start shrink-0 w-80 bg-white border border-gray-200 hover:border-red-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex items-center gap-2">
                      <EntityAvatar
                        imageUrl={item.imageUrl}
                        name={item.clientName}
                        size={28}
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-gray-800 truncate">
                          {item.businessName}
                        </h4>
                        <p className="text-xs text-gray-400 truncate">
                          {item.clientName}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-red-50 text-red-600 rounded-full border border-red-100 uppercase shrink-0">
                      {item.plan}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Overdue Amount:</span>
                      <span className="font-bold text-red-600">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Due Date:</span>
                      <span>
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    {item.isUserDeleted && (
                      <span className="inline-block text-[10px] bg-gray-150 text-gray-600 px-1.5 py-0.5 rounded font-semibold mt-1">
                        Deleted Contact ID
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    onClick={() =>
                      triggerSendReminder(item.id, item.clientName)
                    }
                    disabled={isSendingReminder === item.id}
                    className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 disabled:opacity-50 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {isSendingReminder === item.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Mail size={12} />
                    )}
                    <span>
                      {isSendingReminder === item.id
                        ? "Sending Email..."
                        : "Send Payment Reminder"}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ROW 4: Table and Filter Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search Client, Business or Payment ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold border border-gray-200 rounded-xl bg-white px-3 py-2 outline-none text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              <option value="All Status">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
              <option value="Overdue">Overdue</option>
            </select>

            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="text-xs font-semibold border border-gray-200 rounded-xl bg-white px-3 py-2 outline-none text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              <option value="All Plans">All Plans</option>
              <option value="Basic">Basic Plan</option>
              <option value="Plus">Plus Plan</option>
              <option value="Pro">Pro Plan</option>
              <option value="None">No Plan</option>
            </select>

            {(statusFilter !== "All Status" ||
              planFilter !== "All Plans" ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("All Status");
                  setPlanFilter("All Plans");
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline px-2 py-1"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Payment History Table Card */}
        <div className="bg-white border border-gray-200 rounded-[24px] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">
              Transaction History
            </h3>
            <span className="text-xs text-gray-500 font-medium">
              Showing {finalTableData.length} entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-150 text-gray-500 font-semibold">
                  <th className="px-5 py-3.5 font-bold">Client / User</th>
                  <th className="px-5 py-3.5 font-bold">Business Entity</th>
                  <th className="px-5 py-3.5 font-bold">
                    <button
                      onClick={() => {
                        setSortField("timestamp");
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      }}
                      className="inline-flex items-center gap-1 hover:text-gray-700 focus:outline-none"
                    >
                      <span>Date & Time</span>
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="px-5 py-3.5 font-bold">Payment ID</th>
                  <th className="px-5 py-3.5 font-bold">
                    <button
                      onClick={() => {
                        setSortField("amount");
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      }}
                      className="inline-flex items-center gap-1 hover:text-gray-700 focus:outline-none"
                    >
                      <span>Amount</span>
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="px-5 py-3.5 font-bold">Plan</th>
                  <th className="px-5 py-3.5 font-bold">Status</th>
                  <th className="px-5 py-3.5 font-bold">Method</th>
                  <th className="px-5 py-3.5 font-bold text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {finalTableData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <SearchX size={36} className="text-gray-300" />
                        <h4 className="font-bold text-sm text-gray-600 mt-3">
                          No payments match your selection
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          Try adjusting search keywords or clearing active
                          filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  finalTableData.map((p) => {
                    const isSelected = selectedPaymentId === p.id;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedPaymentId(p.id)}
                        className={`hover:bg-indigo-50/20 transition-all cursor-pointer ${
                          isSelected ? "bg-indigo-50/40" : ""
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <EntityAvatar
                              imageUrl={p.resolvedUser?.image}
                              name={p.clientName}
                              size={28}
                            />
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                                <span className="truncate">{p.clientName}</span>
                                {p.isUserDeleted && (
                                  <span className="px-1.5 py-0.2 bg-gray-100 text-gray-500 rounded text-[9px] font-semibold border border-gray-250 shrink-0">
                                    Deleted
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-400 block truncate">
                                {p.resolvedUser?.email || "No Email"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <EntityAvatar
                              imageUrl={p.resolvedBusiness?.image}
                              name={p.businessName}
                              size={20}
                              isBusiness={true}
                            />
                            <div className="min-w-0">
                              <span className="font-medium text-gray-800 truncate block">
                                {p.businessName}
                              </span>
                              {p.isBusinessDeleted && (
                                <span className="px-1.5 py-0.2 bg-gray-100 text-gray-500 rounded text-[9px] font-semibold border border-gray-250 mt-0.5 inline-block shrink-0">
                                  Deleted
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-500">
                          <div>
                            {new Date(p.timestamp).toLocaleDateString()}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(p.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono text-[10px] text-gray-400">
                          {p.id}
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-900">
                          {formatCurrency(p.amount, p.currency)}
                        </td>
                        <td className="px-5 py-4">
                          <PlanBadge plan={p.plan} />
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-5 py-4 text-gray-500 font-medium capitalize">
                          {p.paymentMethod.toLowerCase()}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPaymentId(p.id);
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-indigo-600 hover:text-indigo-800 transition-all"
                          >
                            <ArrowRight size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Aside Transaction Detail Panel Overlay */}
      <div
        className={`fixed inset-0 z-50 overflow-hidden max-h-screen transition-all duration-300 ${
          selectedPayment
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Translucent Backdrop overlay */}
        <div
          onClick={() => setSelectedPaymentId(null)}
          className={`absolute inset-0 bg-black/30 backdrop-blur-xs transition-opacity duration-300 ${
            selectedPayment ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full sm:pl-10 pl-0">
          {/* Slide drawer container (width: 450px matching the reference image) */}
          <div
            className={`pointer-events-auto w-screen max-w-[450px] transform bg-white shadow-2xl flex flex-col h-full border-l border-gray-200 transition-transform duration-300 ease-in-out ${
              selectedPayment ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {activePayment && (
              <>
                {/* Header */}
                <div className="px-6 pt-5 pb-2 border-b border-gray-200 flex items-center justify-between bg-white">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 tracking-tight">
                      Transaction Detail
                    </h2>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      {activePayment.id}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPaymentId(null)}
                    className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 pt-3 py-[8] space-y-6">
                  {/* Total amount and Status check box */}
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Total Amount
                    </p>
                    <h3 className="text-3xl font-black text-gray-900 mt-2">
                      {formatCurrency(
                        activePayment.amount,
                        activePayment.currency,
                      )}
                    </h3>

                    <div className="mt-4 flex justify-center">
                      {activePayment.status === "Paid" ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
                          <Check size={14} strokeWidth={3} />
                          <span>Payment Successful</span>
                        </div>
                      ) : activePayment.status === "Pending" ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold border border-amber-100">
                          <Clock size={14} strokeWidth={3} />
                          <span>Payment Pending</span>
                        </div>
                      ) : activePayment.status === "Refunded" ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-650 rounded-full text-xs font-bold border border-purple-100">
                          <Coins size={14} strokeWidth={3} />
                          <span>Payment Refunded</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-650 rounded-full text-xs font-bold border border-red-100">
                          <AlertTriangle size={14} strokeWidth={3} />
                          <span>Payment Overdue</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section: Client Info */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">
                      Client Information
                    </h4>

                    <div className="flex items-center gap-3">
                      <EntityAvatar
                        imageUrl={activePayment.resolvedUser?.image}
                        name={activePayment.clientName}
                        size={40}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-gray-800 truncate">
                            {activePayment.clientName}
                          </p>
                          {activePayment.isUserDeleted && (
                            <span className="px-1.5 py-0.2 bg-red-50 text-red-600 border border-red-100 rounded text-[9px] font-bold uppercase shrink-0">
                              Deleted
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {activePayment.resolvedUser?.email || "No Email"}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {activePayment.resolvedUser?.phone || "No Phone"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">
                          Business Entity
                        </span>
                        <div className="flex items-center gap-2 mt-1.5 min-w-0">
                          <EntityAvatar
                            imageUrl={activePayment.resolvedBusiness?.image}
                            name={activePayment.businessName}
                            size={22}
                            isBusiness={true}
                          />
                          <span className="font-semibold text-gray-700 truncate">
                            {activePayment.businessName}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">
                          Tax Identification
                        </span>
                        <span className="font-semibold text-gray-700 block mt-2 truncate">
                          {activePayment.resolvedBusiness
                            ? `GSTIN: 22${activePayment.resolvedBusiness.id.toUpperCase().slice(0, 10)}A1Z5`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section: Gateway Information */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">
                      Gateway Information
                    </h4>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-gray-500 font-medium">
                        Gateway Provider
                      </span>
                      <span className="font-bold text-gray-800">
                        {activePayment.gateway}
                      </span>
                    </div>

                    {activePayment.gatewayInfo?.paymentId ? (
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-gray-500 font-medium">
                          Razorpay Payment ID
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-gray-700 bg-white border border-gray-250 px-1.5 py-0.5 rounded text-[12px]">
                            {activePayment.gatewayInfo.paymentId}
                          </span>
                          <button
                            onClick={() =>
                              handleCopyText(
                                activePayment.gatewayInfo!.paymentId!,
                                "Payment ID",
                              )
                            }
                            className="p-1 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded transition-all"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between text-[12px]">
                        <span className="text-gray-500 font-medium">
                          Payment ID
                        </span>
                        <span className="text-gray-400 italic">
                          Not available
                        </span>
                      </div>
                    )}

                    {activePayment.gatewayInfo?.orderId ? (
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-gray-500 font-medium">
                          Order ID
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-gray-700 bg-white border border-gray-250 px-1.5 py-0.5 rounded text-[12px]">
                            {activePayment.gatewayInfo.orderId}
                          </span>
                          <button
                            onClick={() =>
                              handleCopyText(
                                activePayment.gatewayInfo!.orderId!,
                                "Order ID",
                              )
                            }
                            className="p-1 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded transition-all"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between text-[12px]">
                        <span className="text-gray-500 font-medium">
                          Order ID
                        </span>
                        <span className="text-gray-400 italic">
                          Not available
                        </span>
                      </div>
                    )}

                    {activePayment.gatewayInfo?.signature ? (
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-gray-500 font-medium">
                          Signature Ref
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-gray-700 bg-white border border-gray-250 px-1.5 py-0.5 rounded text-[12px]">
                            {activePayment.gatewayInfo.signature.slice(0, 10)}
                            ...
                          </span>
                          <button
                            onClick={() =>
                              handleCopyText(
                                activePayment.gatewayInfo!.signature!,
                                "Signature",
                              )
                            }
                            className="p-1 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded transition-all"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between text-[12px]">
                        <span className="text-gray-500 font-medium">
                          Signature Ref
                        </span>
                        <span className="text-gray-400 italic">
                          Not available
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Section: Purchase Details */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">
                      Purchase Details
                    </h4>

                    <div className="p-2 flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 text-[#3525cd] rounded-xl flex items-center justify-center shrink-0">
                        <Sparkles size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-xs text-gray-800 block truncate">
                          {activePayment.purchaseItem}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                          SKU: ENT-SUB-{activePayment.plan.toUpperCase()}-01
                        </span>
                      </div>
                      <span className="font-bold text-xs text-gray-800 shrink-0">
                        {formatCurrency(
                          activePayment.currency === "INR"
                            ? activePayment.amount / 1.18
                            : activePayment.amount,
                          activePayment.currency,
                        )}
                      </span>
                    </div>

                    <div className="text-xs space-y-2 pt-1">
                      {activePayment.currency === "INR" ? (
                        <>
                          <div className="flex justify-between text-gray-500 font-medium">
                            <span>Subtotal</span>
                            <span className="font-semibold">
                              {formatCurrency(
                                activePayment.amount / 1.18,
                                activePayment.currency,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-400 text-[11px]">
                            <span>CGST (9%)</span>
                            <span>
                              {formatCurrency(
                                (activePayment.amount / 1.18) * 0.09,
                                activePayment.currency,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-400 text-[11px]">
                            <span>SGST (9%)</span>
                            <span>
                              {formatCurrency(
                                (activePayment.amount / 1.18) * 0.09,
                                activePayment.currency,
                              )}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between text-gray-500 font-medium">
                          <span>Subtotal</span>
                          <span className="font-semibold">
                            {formatCurrency(
                              activePayment.amount,
                              activePayment.currency,
                            )}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-dashed border-gray-200 pt-3 font-bold text-sm text-gray-900">
                        <span>Total</span>
                        <span>
                          {formatCurrency(
                            activePayment.amount,
                            activePayment.currency,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-5 border-t border-gray-200 bg-white flex items-center gap-3">
                  <button
                    onClick={() => {
                      setToast({
                        message: "Receipt download started!",
                        type: "success",
                      });
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm transition-all active:scale-98 cursor-pointer"
                  >
                    Download Receipt
                  </button>
                  {activePayment.status === "Paid" ? (
                    <button
                      onClick={handleInitiateRefund}
                      disabled={isRefunding}
                      className="flex-1 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#3525cd]/90 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                    >
                      {isRefunding ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : null}
                      <span>
                        {isRefunding ? "Refunding..." : "Initiate Refund"}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        triggerSendReminder(
                          activePayment.id,
                          activePayment.clientName,
                        )
                      }
                      disabled={isSendingReminder === activePayment.id}
                      className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                    >
                      {isSendingReminder === activePayment.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Mail size={12} />
                      )}
                      <span>Send Reminder</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Global Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] transition-all animate-in slide-in-from-bottom-5">
          <div
            className={`px-4 py-3 rounded-2xl shadow-lg border flex items-center gap-2 text-xs font-semibold ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                : toast.type === "error"
                  ? "bg-red-50 text-red-800 border-red-100"
                  : "bg-indigo-50 text-indigo-800 border-indigo-100"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={14} className="text-emerald-600" />
            ) : (
              <AlertCircle size={14} className="text-red-600" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
