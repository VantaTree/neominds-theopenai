import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/admin/shared";
import { useState, useEffect, useMemo } from "react";
import { Shield, Search, RefreshCw, SearchX, ChevronDown, Clock } from "lucide-react";
import type { AuditLog } from "@/lib/schemas";
import { getAuditLogFn } from "@/lib/server-functions";

export const Route = createFileRoute("/_admin/admin/support")({
  head: () => ({ meta: [{ title: "Audit Log — GrowConsult AI" }] }),
  component: AuditLogPage,
});

const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
  plan_changed:     { bg: "#E8F5E9", text: "#4CAF50" },
  user_suspended:   { bg: "#FEF2F2", text: "#EF5350" },
  user_deleted:     { bg: "#FEF2F2", text: "#EF5350" },
  report_deleted:   { bg: "#FFF3E0", text: "#E89D18" },
  report_generated: { bg: "#E3F2FD", text: "#1E88E5" },
  user_created:     { bg: "#E8F5E9", text: "#4CAF50" },
  settings_changed: { bg: "#F3E5F5", text: "#8E24AA" },
};

function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [isActionOpen, setIsActionOpen] = useState(false);

  const loadLogs = async () => {
    setIsLoading(true);
    const data = await getAuditLogFn({ data: 200 });
    setLogs(data);
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
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FFF3D6", border: "1px solid #E8DCC8" }}>
          <Shield size={20} style={{ color: "#E89D18" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#4E342E" }}>Audit Log</h1>
          <p className="text-sm" style={{ color: "#8D6E63" }}>Track all admin actions and system events across the platform</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: logs.length, color: "#E89D18" },
          { label: "Today", value: logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length, color: "#4CAF50" },
          { label: "Plan Changes", value: logs.filter(l => l.action === "plan_changed").length, color: "#1E88E5" },
          { label: "Deletions", value: logs.filter(l => l.action.includes("deleted")).length, color: "#EF5350" },
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
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by user, action…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "#FDF6ED", border: "1.5px solid #E8DCC8", color: "#4E342E" }} />
        </div>
        <div className="relative">
          <button onClick={() => setIsActionOpen(v => !v)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "#FDF6ED", border: "1.5px solid #E8DCC8", color: "#4E342E" }}>
            {actionFilter === "All Actions" ? "All Actions" : formatAction(actionFilter)} <ChevronDown size={14} />
          </button>
          {isActionOpen && (
            <div className="absolute top-full mt-1 left-0 z-50 rounded-xl shadow-xl overflow-hidden"
              style={{ background: "#FDF6ED", border: "1px solid #E8DCC8", minWidth: "180px", maxHeight: "240px", overflowY: "auto" }}>
              {actionTypes.map(a => (
                <button key={a} onClick={() => { setActionFilter(a); setIsActionOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#FFF3D6] transition-colors"
                  style={{ color: actionFilter === a ? "#E89D18" : "#4E342E", fontWeight: actionFilter === a ? 700 : 400 }}>
                  {a === "All Actions" ? a : formatAction(a)}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={loadLogs} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80"
          style={{ background: "#FFF3D6", border: "1px solid #E8DCC8", color: "#E89D18" }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--color-card-secondary)" }}>
                {["Timestamp", "User", "Action", "Details"].map(h => (
                  <th key={h} className="text-left font-semibold px-4 py-3 whitespace-nowrap" style={{ color: "var(--color-title)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#E89D18] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-semibold" style={{ color: "#8D6E63" }}>Loading audit log...</span>
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <SearchX size={28} style={{ color: "#D7C3A8" }} />
                    <span className="text-sm font-semibold" style={{ color: "#8D6E63" }}>No audit events found</span>
                  </div>
                </td></tr>
              ) : filtered.map(log => {
                const colors = ACTION_COLORS[log.action] || { bg: "#F8F1E7", text: "#8D6E63" };
                return (
                  <tr key={log.id} style={{ borderTop: "1px solid var(--color-border)" }} className="hover:[background:var(--color-row-hover)] transition-colors">
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "#8D6E63" }}>
                      <div className="flex items-center gap-1.5">
                        <Clock size={11} style={{ color: "#D7C3A8" }} />
                        {formatDate(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-sm" style={{ color: "#4E342E" }}>{log.userName || "Admin"}</div>
                      <div className="text-xs font-mono" style={{ color: "#8D6E63" }}>{log.uid}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: colors.bg, color: colors.text }}>
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs max-w-[320px]">
                      <code className="block truncate rounded px-2 py-1" style={{ background: "#F8F1E7", color: "#6D4C41" }}>
                        {JSON.stringify(log.payload)}
                      </code>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
