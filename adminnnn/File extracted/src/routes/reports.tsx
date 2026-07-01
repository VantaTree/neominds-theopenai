import { createFileRoute } from "@tanstack/react-router";
import { Card } from "../components/admin/shared";
import { useState, useEffect, useMemo } from "react";
import { FileText, Search, Trash2, Eye, X, RefreshCw, SearchX, Clock, CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";
import type { Report } from "../lib/types";
import { getReports, deleteReport, saveReport, logAuditEvent } from "../lib/db";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — GrowConsult AI" }] }),
  component: ReportsPage,
});

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; icon: any }> = {
  ready: { bg: "#E8F5E9", text: "#4CAF50", border: "#4CAF50", icon: CheckCircle2 },
  processing: { bg: "#FFF3E0", text: "#E89D18", border: "#E89D18", icon: Clock },
  failed: { bg: "#FEF2F2", text: "#EF5350", border: "#EF5350", icon: AlertCircle },
};

function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [viewReport, setViewReport] = useState<Report | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Report | null>(null);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  const loadReports = async () => {
    setIsLoading(true);
    const data = await getReports();
    setReports(data.sort((a, b) => b.createdAt - a.createdAt));
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

  const handleDelete = async (r: Report) => {
    await deleteReport(r.id);
    await logAuditEvent("admin", "report_deleted", { reportId: r.id, title: r.title, uid: r.uid }, "Admin");
    setReports(prev => prev.filter(x => x.id !== r.id));
    setConfirmDelete(null);
    setToast("✓ Report deleted successfully.");
  };

  const handleReprocess = async (r: Report) => {
    const updated: Report = { ...r, status: "processing" };
    await saveReport(updated);
    setReports(prev => prev.map(x => x.id === r.id ? updated : x));
    setToast(`↺ Report "${r.title}" queued for reprocessing.`);
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FFF3D6", border: "1px solid #E8DCC8" }}>
          <FileText size={20} style={{ color: "#E89D18" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#4E342E" }}>Reports</h1>
          <p className="text-sm" style={{ color: "#8D6E63" }}>View and manage AI-generated reports for all users</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Reports", value: reports.length, color: "#E89D18" },
          { label: "Ready", value: reports.filter(r => r.status === "ready").length, color: "#4CAF50" },
          { label: "Processing", value: reports.filter(r => r.status === "processing").length, color: "#E89D18" },
          { label: "Failed", value: reports.filter(r => r.status === "failed").length, color: "#EF5350" },
        ].map(s => (
          <Card key={s.label} className="!p-4">
            <div className="text-xs font-semibold mb-1" style={{ color: "#8D6E63" }}>{s.label}</div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#8D6E63" }} />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by title or user ID…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "#FDF6ED", border: "1.5px solid #E8DCC8", color: "#4E342E" }} />
        </div>
        <div className="relative">
          <button onClick={() => setIsStatusOpen(v => !v)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "#FDF6ED", border: "1.5px solid #E8DCC8", color: "#4E342E" }}>
            {statusFilter} <ChevronDown size={14} />
          </button>
          {isStatusOpen && (
            <div className="absolute top-full mt-1 left-0 z-50 rounded-xl shadow-xl overflow-hidden" style={{ background: "#FDF6ED", border: "1px solid #E8DCC8", minWidth: "140px" }}>
              {["All Status", "ready", "processing", "failed"].map(s => (
                <button key={s} onClick={() => { setStatusFilter(s); setIsStatusOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#FFF3D6] transition-colors capitalize"
                  style={{ color: statusFilter === s ? "#E89D18" : "#4E342E", fontWeight: statusFilter === s ? 700 : 400 }}>{s}</button>
              ))}
            </div>
          )}
        </div>
        <button onClick={loadReports} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-80"
          style={{ background: "#FFF3D6", border: "1px solid #E8DCC8", color: "#E89D18" }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--color-card-secondary)" }}>
                {["Title", "User ID", "Status", "Tokens Used", "Duration", "Created At", "Actions"].map(h => (
                  <th key={h} className="text-left font-semibold px-4 py-3 whitespace-nowrap" style={{ color: "var(--color-title)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#E89D18] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-semibold" style={{ color: "#8D6E63" }}>Loading reports...</span>
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <SearchX size={28} style={{ color: "#D7C3A8" }} />
                    <span className="text-sm font-semibold" style={{ color: "#8D6E63" }}>No reports found</span>
                  </div>
                </td></tr>
              ) : filtered.map(r => {
                const st = STATUS_COLORS[r.status] || STATUS_COLORS.ready;
                const Icon = st.icon;
                return (
                  <tr key={r.id} style={{ borderTop: "1px solid var(--color-border)" }} className="hover:[background:var(--color-row-hover)] transition-colors">
                    <td className="px-4 py-3 font-semibold max-w-[200px] truncate" style={{ color: "#4E342E" }}>{r.title}</td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: "#8D6E63" }}>{r.uid}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                        style={{ background: st.bg, color: st.text, border: `1px solid ${st.border}` }}>
                        <Icon size={11} /> {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#8D6E63" }}>{r.metadata?.tokensUsed?.toLocaleString() ?? "—"}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#8D6E63" }}>{r.metadata?.durationMs ? `${(r.metadata.durationMs / 1000).toFixed(1)}s` : "—"}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "#8D6E63" }}>{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setViewReport(r)} title="View" className="p-1.5 rounded-lg hover:bg-[#FFF3D6] transition-colors" style={{ color: "#E89D18" }}><Eye size={15} /></button>
                        {r.status === "failed" && (
                          <button onClick={() => handleReprocess(r)} title="Reprocess" className="p-1.5 rounded-lg hover:bg-[#FFF3D6] transition-colors" style={{ color: "#E89D18" }}><RefreshCw size={15} /></button>
                        )}
                        <button onClick={() => setConfirmDelete(r)} title="Delete" className="p-1.5 rounded-lg hover:bg-[#FEF2F2] transition-colors" style={{ color: "#EF5350" }}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {viewReport && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.35)" }}>
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl p-6 space-y-4" style={{ background: "#FFFDF8", border: "1px solid #E8DCC8" }}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg" style={{ color: "#4E342E" }}>{viewReport.title}</h2>
              <button onClick={() => setViewReport(null)} className="p-2 rounded-lg hover:bg-[#F8F1E7]" style={{ color: "#8D6E63" }}><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span style={{ color: "#8D6E63" }}>User ID: </span><span className="font-mono font-semibold" style={{ color: "#4E342E" }}>{viewReport.uid}</span></div>
              <div><span style={{ color: "#8D6E63" }}>Status: </span><span className="capitalize font-semibold" style={{ color: STATUS_COLORS[viewReport.status]?.text }}>{viewReport.status}</span></div>
              <div><span style={{ color: "#8D6E63" }}>Created: </span><span style={{ color: "#4E342E" }}>{formatDate(viewReport.createdAt)}</span></div>
              <div><span style={{ color: "#8D6E63" }}>Tokens: </span><span style={{ color: "#4E342E" }}>{viewReport.metadata?.tokensUsed?.toLocaleString()}</span></div>
            </div>
            <div className="rounded-xl p-4 text-sm whitespace-pre-wrap" style={{ background: "#F8F1E7", color: "#4E342E", maxHeight: "400px", overflowY: "auto", fontFamily: "monospace" }}>
              {viewReport.content || "(No content available)"}
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.35)" }}>
          <div className="w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4" style={{ background: "#FFFDF8", border: "1px solid #E8DCC8" }}>
            <h2 className="font-bold text-lg" style={{ color: "#4E342E" }}>Delete Report?</h2>
            <p className="text-sm" style={{ color: "#8D6E63" }}>This will permanently delete <strong>"{confirmDelete.title}"</strong>. This action cannot be undone.</p>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "#F8F1E7", color: "#8D6E63", border: "1px solid #E8DCC8" }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "#EF5350", color: "white" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[300] px-5 py-3 rounded-xl shadow-lg font-semibold text-sm" style={{ background: "#E8F5E9", border: "1px solid #4CAF50", color: "#4CAF50" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

