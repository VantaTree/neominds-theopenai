import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Shield, Search, RefreshCw, SearchX, ChevronDown, Clock, Loader2, X } from "lucide-react";
import type { AuditLog } from "@/lib/schemas";
import { getAuditLogFn } from "@/lib/server-functions";

export const Route = createFileRoute("/_admin/admin/audit")({
  head: () => ({ meta: [{ title: "Audit Log — GrowConsult AI" }] }),
  component: AuditLogPage,
});

const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
  plan_changed:     { bg: "rgba(92, 177, 62, 0.1)", text: "var(--color-mm-green)" },
  user_suspended:   { bg: "rgba(224, 86, 36, 0.1)", text: "var(--color-mm-red)" },
  user_deleted:     { bg: "rgba(224, 86, 36, 0.1)", text: "var(--color-mm-red)" },
  report_deleted:   { bg: "rgba(224, 86, 36, 0.1)", text: "var(--color-mm-red)" },
  report_generated: { bg: "rgba(133, 211, 255, 0.1)", text: "var(--color-mm-blue)" },
  user_created:     { bg: "rgba(92, 177, 62, 0.1)", text: "var(--color-mm-green)" },
  settings_changed: { bg: "rgba(168, 85, 247, 0.1)", text: "var(--color-mm-plans-accent)" },
};

function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await getAuditLogFn({ data: 200 });
      setLogs(data);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  useEffect(() => { loadLogs(); }, []);

  const actionTypes = useMemo(() => {
    const types = Array.from(new Set(logs.map(l => l.action)));
    return ["All Actions", ...types];
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter(l => {
      const matchSearch = !searchQuery ||
        l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.userName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.uid.toLowerCase().includes(searchQuery.toLowerCase());
      const matchAction = actionFilter === "All Actions" || l.action === actionFilter;
      return matchSearch && matchAction;
    });
  }, [logs, searchQuery, actionFilter]);

  const formatDate = (ts: Date | number) => new Date(ts).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  const formatAction = (action: string) =>
    action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="space-y-6 font-sans text-mm-dark select-none">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-mm-orange/10">
          <Shield size={20} className="text-mm-orange" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-mm-dark">Audit Log</h1>
          <p className="text-sm text-mm-gray mt-1">Track all admin actions and system events across the platform</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: logs.length, color: "var(--color-mm-orange)" },
          { label: "Today", value: logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length, color: "var(--color-mm-green)" },
          { label: "Plan Changes", value: logs.filter(l => l.action === "plan_changed").length, color: "var(--color-mm-blue)" },
          { label: "Deletions", value: logs.filter(l => l.action.includes("deleted")).length, color: "var(--color-mm-red)" },
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
            placeholder="Search by user, action…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs outline-none bg-white border border-mm-border text-mm-dark focus:border-mm-orange transition-all font-bold placeholder:text-mm-gray/50" 
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsActionOpen(v => !v)} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-mm-border bg-white text-mm-dark hover:bg-mm-subtle/50 transition-all cursor-pointer"
          >
            {actionFilter === "All Actions" ? "All Actions" : formatAction(actionFilter)} <ChevronDown size={14} className="text-mm-gray" />
          </button>
          {isActionOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsActionOpen(false)} />
              <div className="absolute top-full mt-2 left-0 z-50 rounded-xl shadow-xl bg-white border border-mm-border min-w-[180px] max-h-[240px] overflow-y-auto">
                {actionTypes.map(a => (
                  <button 
                    key={a} 
                    onClick={() => { setActionFilter(a); setIsActionOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                      actionFilter === a ? "bg-mm-orange/10 text-mm-orange" : "hover:bg-mm-subtle/40 text-mm-dark"
                    }`}
                  >
                    {a === "All Actions" ? a : formatAction(a)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <button 
          onClick={loadLogs} 
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
                {["Timestamp", "User", "Action", "Details"].map(h => (
                  <th key={h} className="text-left font-extrabold px-4 py-3 whitespace-nowrap text-xs text-mm-dark uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-mm-orange" size={24} />
                      <span className="text-xs font-bold text-mm-gray">Loading audit log...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <SearchX size={28} className="text-mm-gray/60" />
                      <span className="text-xs font-bold text-mm-gray">No audit events found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(log => {
                  const colors = ACTION_COLORS[log.action] || { bg: "rgba(109, 76, 65, 0.1)", text: "var(--color-mm-gray)" };
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="border-b border-mm-border/40 hover:bg-mm-subtle/10 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-4 text-xs whitespace-nowrap text-mm-gray font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Clock size={11} className="text-mm-gray/60" />
                          {formatDate(log.timestamp)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-extrabold text-xs text-mm-dark">{log.userName || "Admin"}</div>
                        <div className="text-[10px] font-mono text-mm-gray mt-0.5">{log.uid}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                          style={{ background: colors.bg, color: colors.text }}>
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs max-w-[320px]">
                        <code className="block truncate rounded-xl px-3 py-1.5 bg-mm-subtle/40 border border-mm-border text-mm-dark font-mono text-[10px]">
                          {JSON.stringify(log.payload)}
                        </code>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sidebar Details Drawer */}
      {selectedLog && (
        <>
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
            .animate-slide-in-right {
              animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}</style>

          {/* Backdrop blur overlay */}
          <div
            className="fixed inset-0 bg-mm-dark/20 backdrop-blur-sm z-90 transition-opacity"
            onClick={() => setSelectedLog(null)}
          />

          {/* Right Sidebar Container */}
          <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white border-l border-mm-border shadow-2xl z-100 flex flex-col h-full animate-slide-in-right select-text">
            {/* Header */}
            <div className="p-6 border-b border-mm-border/60 flex items-center justify-between bg-mm-subtle/10 select-none">
              <div className="flex items-center gap-2">
                <Shield className="text-mm-orange" size={18} />
                <h3 className="font-extrabold text-sm text-mm-dark uppercase tracking-wider">
                  Event Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-mm-subtle/50 hover:bg-mm-subtle text-mm-dark/70 hover:text-mm-dark transition-all cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Event Summary Card */}
              <div className="bg-mm-subtle/20 border border-mm-border/60 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block"
                      style={{
                        background: (ACTION_COLORS[selectedLog.action] || { bg: "rgba(109, 76, 65, 0.1)", text: "var(--color-mm-gray)" }).bg,
                        color: (ACTION_COLORS[selectedLog.action] || { bg: "rgba(109, 76, 65, 0.1)", text: "var(--color-mm-gray)" }).text
                      }}
                    >
                      {formatAction(selectedLog.action)}
                    </span>
                  </div>
                  <div className="text-[10px] text-mm-gray font-semibold flex items-center gap-1">
                    <Clock size={11} className="text-mm-gray/60" />
                    {formatDate(selectedLog.timestamp)}
                  </div>
                </div>

                <div className="border-t border-mm-border/40 pt-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[9px] text-mm-gray font-bold block uppercase tracking-wider">
                      Performed By
                    </span>
                    <span className="font-extrabold text-mm-dark">
                      {selectedLog.userName || "Admin"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-mm-gray font-bold block uppercase tracking-wider">
                      User ID
                    </span>
                    <span className="font-mono text-[10px] text-mm-gray block select-all">
                      {selectedLog.uid}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payload Details */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-mm-gray">
                  Event Data Payload
                </h4>
                <div className="bg-mm-subtle/10 border border-mm-border rounded-2xl p-4 overflow-x-auto font-mono text-xs text-mm-dark max-h-[300px] scrollbar-thin">
                  <pre className="whitespace-pre-wrap break-all leading-relaxed">
                    {JSON.stringify(selectedLog.payload, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Metadata Details */}
              {selectedLog.payload && Object.keys(selectedLog.payload).length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-mm-gray">
                    Payload Key-Value Breakdown
                  </h4>
                  <div className="border border-mm-border rounded-2xl overflow-hidden divide-y divide-mm-border/60 bg-white">
                    {Object.entries(selectedLog.payload).map(([key, val]) => (
                      <div key={key} className="p-3.5 flex justify-between gap-4 text-xs hover:bg-mm-subtle/10 transition-colors">
                        <span className="font-semibold text-mm-gray capitalize shrink-0">
                          {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim()}
                        </span>
                        <span className="font-mono text-mm-dark text-right break-all select-all max-w-[240px]">
                          {typeof val === "object" ? JSON.stringify(val) : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-mm-border/60 bg-mm-subtle/10 flex justify-end select-none">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-mm-dark hover:bg-mm-dark/90 text-white transition-all cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
