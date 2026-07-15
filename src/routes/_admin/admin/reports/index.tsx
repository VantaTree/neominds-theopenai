import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  FileText,
  Search,
  Eye,
  RefreshCw,
  SearchX,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { getReportsFn, getBusinessesFn } from "@/lib/server-functions";
import { Avatar } from "@/components/admin/shared";
import { AdminLoader } from "@/components/AdminLoader";

export const Route = createFileRoute("/_admin/admin/reports/")({
  head: () => ({ meta: [{ title: "Reports — GrowConsult AI" }] }),
  loader: async () => {
    try {
      const [reports, businesses] = await Promise.all([
        getReportsFn(),
        getBusinessesFn(),
      ]);
      return { reports, businesses };
    } catch (err) {
      console.error("Loader failed to fetch reports data:", err);
      return { reports: [], businesses: [] };
    }
  },
  pendingComponent: AdminLoader,
  pendingMs: 0,
  component: ReportsPage,
});

const STATUS_COLORS: Record<
  string,
  { bg: string; text: string; border: string; icon: any }
> = {
  ready: {
    bg: "rgba(92, 177, 62, 0.1)",
    text: "var(--color-mm-green)",
    border: "transparent",
    icon: CheckCircle2,
  },
  processing: {
    bg: "rgba(224, 86, 36, 0.1)",
    text: "var(--color-mm-orange)",
    border: "transparent",
    icon: Clock,
  },
  failed: {
    bg: "rgba(224, 86, 36, 0.1)",
    text: "var(--color-mm-red)",
    border: "transparent",
    icon: AlertCircle,
  },
};

function ReportsPage() {
  const { reports, businesses } = Route.useLoaderData();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await router.invalidate();
    } finally {
      setIsRefreshing(false);
    }
  };

  const reportsWithBusiness = useMemo(() => {
    return reports
      .map((r) => {
        const status = (r.data?.status || "ready") as
          | "ready"
          | "processing"
          | "failed";
        const biz = businesses.find((b) => b.id === r.businessId);
        return {
          id: r.id,
          businessId: r.businessId,
          title: r.title,
          status: status,
          createdAt: r.createdAt ? new Date(r.createdAt).getTime() : Date.now(),
          business: biz,
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [reports, businesses]);

  const filtered = useMemo(() => {
    return reportsWithBusiness.filter((r) => {
      const bizName = r.business?.businessName || "";
      const bizType = r.business?.businessType || "";
      const matchSearch =
        !searchQuery ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bizName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bizType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === "All Status" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [reportsWithBusiness, searchQuery, statusFilter]);

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6 font-sans text-mm-dark">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-mm-orange/10">
          <FileText size={20} className="text-mm-orange" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-mm-dark">
            Reports
          </h1>
          <p className="text-sm text-mm-gray mt-1">
            View and manage AI-generated reports for all businesses
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Reports",
            value: reportsWithBusiness.length,
            color: "var(--color-mm-orange)",
          },
          {
            label: "Ready",
            value: reportsWithBusiness.filter((r) => r.status === "ready")
              .length,
            color: "var(--color-mm-green)",
          },
          {
            label: "Processing",
            value: reportsWithBusiness.filter((r) => r.status === "processing")
              .length,
            color: "var(--color-mm-blue)",
          },
          {
            label: "Failed",
            value: reportsWithBusiness.filter((r) => r.status === "failed")
              .length,
            color: "var(--color-mm-red)",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-mm-border rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col justify-between"
          >
            <div className="text-xs font-bold text-mm-gray uppercase tracking-wider truncate">
              {s.label}
            </div>
            <div
              className="text-2xl font-black text-mm-dark tracking-tight mt-2 truncate"
              style={{ color: s.color }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center relative">
        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-mm-gray"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by business, type or title…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs outline-none bg-white border border-mm-border text-mm-dark focus:border-mm-orange transition-all font-bold placeholder:text-mm-gray/50"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setIsStatusOpen((v) => !v)}
            className="flex items-center justify-between gap-2 w-[130px] px-4 py-2.5 rounded-xl text-xs font-bold border border-mm-border bg-white text-mm-dark hover:bg-mm-subtle/50 transition-all cursor-pointer"
          >
            <span className="capitalize truncate">{statusFilter}</span>{" "}
            <ChevronDown size={14} className="text-mm-gray shrink-0" />
          </button>
          {isStatusOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsStatusOpen(false)}
              />
              <div className="absolute top-full mt-2 left-0 z-50 rounded-xl shadow-xl bg-white border border-mm-border min-w-[140px]">
                {["All Status", "ready", "processing", "failed"].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatusFilter(s);
                      setIsStatusOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer capitalize ${
                      statusFilter === s
                        ? "bg-mm-orange/10 text-mm-orange"
                        : "hover:bg-mm-subtle/40 text-mm-dark"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-mm-orange/10 hover:bg-mm-orange/15 text-mm-orange transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={isRefreshing ? "animate-spin" : ""}
          />{" "}
          Refresh
        </button>
      </div>

      <div className="bg-white border border-mm-border rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.015)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mm-border/60 bg-mm-subtle/20">
                {["Business Details", "Status", "Created At", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left font-extrabold px-4 py-3 whitespace-nowrap text-xs text-mm-dark uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <SearchX size={28} className="text-mm-gray/60" />
                      <span className="text-xs font-bold text-mm-gray">
                        No reports found
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const biz = r.business;
                  const st = STATUS_COLORS[r.status] || STATUS_COLORS.ready;
                  const Icon = st.icon;
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-mm-border/40 hover:bg-mm-subtle/10 transition-colors"
                    >
                      <td className="px-4 py-4 font-extrabold text-xs text-mm-dark max-w-[250px] truncate">
                        <div className="flex items-center gap-3">
                          {biz?.image ? (
                            <img
                              src={biz.image}
                              alt={biz.businessName}
                              className="rounded-xl object-cover aspect-square shrink-0"
                              style={{ width: 36, height: 36 }}
                            />
                          ) : (
                            <Avatar
                              name={biz?.businessName || "Unnamed"}
                              size={36}
                            />
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-mm-dark text-xs truncate">
                              {biz?.businessName || "Unnamed Business"}
                            </div>
                            <span className="text-[10px] font-bold text-mm-gray capitalize block truncate">
                              {biz?.businessType || "Consulting"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                          style={{ background: st.bg, color: st.text }}
                        >
                          <Icon size={11} /> {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs whitespace-nowrap text-mm-gray font-semibold">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <Link
                            to="/admin/reports/$id"
                            params={{ id: r.id }}
                            title="View Report"
                            className="p-1.5 rounded-lg hover:bg-mm-orange/10 text-mm-orange transition-all cursor-pointer block"
                          >
                            <Eye size={15} />
                          </Link>
                        </div>
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
  );
}
