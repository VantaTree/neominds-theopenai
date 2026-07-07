import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { FileText, Search, Trash2, Eye, X, RefreshCw, SearchX, Clock, CheckCircle2, AlertCircle, ChevronDown, Loader2 } from "lucide-react";
import { getReportsFn, deleteReportFn, saveReportFn, logAuditEventFn } from "@/lib/server-functions";

export const Route = createFileRoute("/_admin/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — GrowConsult AI" }] }),
  component: ReportsPage,
});

interface LegacyReport {
  id: string;
  uid: string;
  title: string;
  status: "ready" | "processing" | "failed";
  createdAt: number;
  content?: string;
  metadata?: {
    tokensUsed?: number;
    durationMs?: number;
  };
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; icon: any }> = {
  ready: { bg: "rgba(92, 177, 62, 0.1)", text: "var(--color-mm-green)", border: "transparent", icon: CheckCircle2 },
  processing: { bg: "rgba(224, 86, 36, 0.1)", text: "var(--color-mm-orange)", border: "transparent", icon: Clock },
  failed: { bg: "rgba(224, 86, 36, 0.1)", text: "var(--color-mm-red)", border: "transparent", icon: AlertCircle },
};

function ReportsPage() {
  const [reports, setReports] = useState<LegacyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [viewReport, setViewReport] = useState<LegacyReport | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<LegacyReport | null>(null);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await getReportsFn();
      const mapped = data.map(r => {
        const status = (r.data?.status || "ready") as "ready" | "processing" | "failed";
        return {
          id: r.id,
          uid: typeof (r as any).userId === "string" ? (r as any).userId : ((r as any).userId as any)?.id || "",
          title: r.title,
          status: status,
          createdAt: r.createdAt ? new Date(r.createdAt).getTime() : Date.now(),
          content: (r.data?.content || "") as string,
          metadata: {
            tokensUsed: (r.data?.tokensUsed || 0) as number,
            durationMs: (r.data?.durationMs || 0) as number
          }
        };
      });
      setReports(mapped.sort((a, b) => b.createdAt - a.createdAt));
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  useEffect(() => { loadReports(); }, []);

  const filtered = useMemo(() => {
    return reports.filter(r => {
      const matchSearch = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.uid.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "All Status" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [reports, searchQuery, statusFilter]);

  const handleDelete = async (r: LegacyReport) => {
    try {
      await deleteReportFn({ data: r.id });
      await logAuditEventFn({ data: { uid: "admin", action: "report_deleted", payload: { reportId: r.id, title: r.title, uid: r.uid }, userName: "Admin" } });
      setReports(prev => prev.filter(x => x.id !== r.id));
      setConfirmDelete(null);
      setToast("✓ Report deleted successfully.");
    } catch (e) {
      console.error(e);
      setToast("✗ Failed to delete report.");
    }
  };

  const handleReprocess = async (r: LegacyReport) => {
    try {
      const updated = {
        id: r.id,
        userId: r.uid,
        businessId: null,
        title: r.title,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(),
        data: {
          status: "processing",
          content: r.content || "",
          tokensUsed: r.metadata?.tokensUsed || 0,
          durationMs: r.metadata?.durationMs || 0
        }
      };
      await saveReportFn({ data: updated });
      setReports(prev => prev.map(x => x.id === r.id ? { ...r, status: "processing" } : x));
      setToast(`↺ Report "${r.title}" queued for reprocessing.`);
    } catch (e) {
      console.error(e);
      setToast("✗ Failed to reprocess report.");
    }
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6 font-sans text-mm-dark select-none">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-mm-orange/10">
          <FileText size={20} className="text-mm-orange" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-mm-dark">Reports</h1>
          <p className="text-sm text-mm-gray mt-1">View and manage AI-generated reports for all users</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Reports", value: reports.length, color: "var(--color-mm-orange)" },
          { label: "Ready", value: reports.filter(r => r.status === "ready").length, color: "var(--color-mm-green)" },
          { label: "Processing", value: reports.filter(r => r.status === "processing").length, color: "var(--color-mm-blue)" },
          { label: "Failed", value: reports.filter(r => r.status === "failed").length, color: "var(--color-mm-red)" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-mm-border rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col justify-between select-none">
            <div className="text-xs font-bold text-mm-gray uppercase tracking-wider truncate">{s.label}</div>
            <div className="text-2xl font-black text-mm-dark tracking-tight mt-2 truncate" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center relative">
        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mm-gray" />
          <input 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            placeholder="Search by title or user ID…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs outline-none bg-white border border-mm-border text-mm-dark focus:border-mm-orange transition-all font-bold placeholder:text-mm-gray/50" 
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsStatusOpen(v => !v)} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-mm-border bg-white text-mm-dark hover:bg-mm-subtle/50 transition-all cursor-pointer select-none"
          >
            {statusFilter} <ChevronDown size={14} className="text-mm-gray" />
          </button>
          {isStatusOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsStatusOpen(false)} />
              <div className="absolute top-full mt-2 left-0 z-50 rounded-xl shadow-xl bg-white border border-mm-border min-w-[140px]">
                {["All Status", "ready", "processing", "failed"].map(s => (
                  <button 
                    key={s} 
                    onClick={() => { setStatusFilter(s); setIsStatusOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer capitalize ${
                      statusFilter === s ? "bg-mm-orange/10 text-mm-orange" : "hover:bg-mm-subtle/40 text-mm-dark"
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
          onClick={loadReports} 
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-mm-orange/10 hover:bg-mm-orange/15 text-mm-orange transition-all cursor-pointer"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="bg-white border border-mm-border rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.015)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mm-border/60 bg-mm-subtle/20 select-none">
                {["Title", "User ID", "Status", "Tokens Used", "Duration", "Created At", "Actions"].map(h => (
                  <th key={h} className="text-left font-extrabold px-4 py-3 whitespace-nowrap text-xs text-mm-dark uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-mm-orange" size={24} />
                      <span className="text-xs font-bold text-mm-gray">Loading reports...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <SearchX size={28} className="text-mm-gray/60" />
                      <span className="text-xs font-bold text-mm-gray">No reports found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(r => {
                  const st = STATUS_COLORS[r.status] || STATUS_COLORS.ready;
                  const Icon = st.icon;
                  return (
                    <tr key={r.id} className="border-b border-mm-border/40 hover:bg-mm-subtle/10 transition-colors">
                      <td className="px-4 py-4 font-extrabold text-xs text-mm-dark max-w-[200px] truncate">{r.title}</td>
                      <td className="px-4 py-4 text-xs font-mono text-mm-gray">{r.uid}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                          style={{ background: st.bg, color: st.text }}>
                          <Icon size={11} /> {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-mm-gray font-semibold">{r.metadata?.tokensUsed?.toLocaleString() ?? "—"}</td>
                      <td className="px-4 py-4 text-xs text-mm-gray font-semibold">{r.metadata?.durationMs ? `${(r.metadata.durationMs / 1000).toFixed(1)}s` : "—"}</td>
                      <td className="px-4 py-4 text-xs whitespace-nowrap text-mm-gray font-semibold">{formatDate(r.createdAt)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setViewReport(r)} title="View" className="p-1.5 rounded-lg hover:bg-mm-orange/10 text-mm-orange transition-all cursor-pointer"><Eye size={15} /></button>
                          {r.status === "failed" && (
                            <button onClick={() => handleReprocess(r)} title="Reprocess" className="p-1.5 rounded-lg hover:bg-mm-orange/10 text-mm-orange transition-all cursor-pointer"><RefreshCw size={15} /></button>
                          )}
                          <button onClick={() => setConfirmDelete(r)} title="Delete" className="p-1.5 rounded-lg hover:bg-mm-red/10 text-mm-red transition-all cursor-pointer"><Trash2 size={15} /></button>
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

      {viewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-mm-dark/40 backdrop-blur-sm" onClick={() => setViewReport(null)} />
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white border border-mm-border rounded-[24px] overflow-hidden shadow-2xl z-50 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-sm text-mm-dark">{viewReport.title}</h2>
              <button onClick={() => setViewReport(null)} className="p-2 rounded-lg hover:bg-mm-subtle text-mm-gray hover:text-mm-dark cursor-pointer transition-colors"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-mm-gray font-bold">User ID: </span><span className="font-mono font-extrabold text-mm-dark">{viewReport.uid}</span></div>
              <div><span className="text-mm-gray font-bold">Status: </span><span className="capitalize font-black" style={{ color: STATUS_COLORS[viewReport.status]?.text }}>{viewReport.status}</span></div>
              <div><span className="text-mm-gray font-bold">Created: </span><span className="text-mm-dark font-extrabold">{formatDate(viewReport.createdAt)}</span></div>
              <div><span className="text-mm-gray font-bold">Tokens: </span><span className="text-mm-dark font-extrabold">{viewReport.metadata?.tokensUsed?.toLocaleString()}</span></div>
            </div>
            <div className="rounded-xl p-4 text-xs whitespace-pre-wrap bg-mm-subtle/40 border border-mm-border text-mm-dark max-h-[400px] overflow-y-auto font-mono">
              {viewReport.content || "(No content available)"}
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-mm-dark/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative w-full max-w-sm rounded-[24px] shadow-2xl p-6 space-y-4 bg-white border border-mm-border z-50">
            <h2 className="font-extrabold text-sm text-mm-dark">Delete Report?</h2>
            <p className="text-xs text-mm-gray font-medium leading-relaxed">This will permanently delete <strong className="text-mm-dark">"{confirmDelete.title}"</strong>. This action cannot be undone.</p>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-xl text-xs font-bold border border-mm-border text-mm-dark bg-white hover:bg-mm-subtle/50 transition-all cursor-pointer">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="px-4 py-2 rounded-xl text-xs font-extrabold bg-mm-red text-white hover:bg-mm-red/90 transition-all cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg font-bold text-xs bg-mm-green/10 border border-mm-green text-mm-green">
          {toast}
        </div>
      )}
    </div>
  );
}
