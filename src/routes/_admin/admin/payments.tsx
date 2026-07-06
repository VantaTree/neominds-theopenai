import { createFileRoute } from "@tanstack/react-router";
import { Avatar, StatusBadge, PlanBadge, Card } from "@/components/admin/shared";
import { 
  AlertCircle, DollarSign, Clock, AlertTriangle, Search, Download, 
  CheckCircle2, PauseCircle, ArrowUpCircle, FileText, X, ChevronDown, 
  ArrowUpDown, Loader2, Mail, ChevronLeft, ArrowLeft, Copy, Calendar, DownloadCloud, SearchX 
} from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { getPaymentsFn, savePaymentsFn } from "@/lib/server-functions";

export const Route = createFileRoute("/_admin/admin/payments")({
  head: () => ({ meta: [{ title: "Payments — GrowConsult AI" }] }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const [selectedClientId, setSelectedClientId] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const [toast, setToast] = useState<React.ReactNode | null>(null);
  const [bannerState, setBannerState] = useState<'alert' | 'loading' | 'success' | 'hidden'>('alert');
  const [targetReminderUser, setTargetReminderUser] = useState<any>(null);
  const [targetInvoiceUser, setTargetInvoiceUser] = useState<any>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [paymentsData, setPaymentsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      const data = await getPaymentsFn();
      setPaymentsData(data);
      setIsLoading(false);
    };
    loadPayments();
  }, []);

  const clientList = useMemo(() => {
    const map = new Map<string, any>();
    paymentsData.forEach(p => {
      if (p.client && !map.has(p.client)) {
        const id = p.client.toLowerCase().replace(/\s+/g, "-");
        map.set(p.client, {
          id,
          name: p.client,
          business: p.business || "",
          email: p.email || p.user?.email || `${id}@example.com`,
          phone: p.phone || p.user?.phone || "+1 (555) 000-0000",
          plan: p.plan || "",
          status: p.status || "Paid",
          amountDue: p.status === "Overdue" ? p.amount : "$0.00",
          joinedDate: p.date || "Today",
          totalPaid: paymentsData.filter(x => x.client === p.client && x.status === "Paid")
            .reduce((acc, x) => acc + parseFloat((x.amount || "0").replace(/[^0-9.]/g, "") || "0"), 0),
          totalPending: paymentsData.filter(x => x.client === p.client && x.status === "Pending")
            .reduce((acc, x) => acc + parseFloat((x.amount || "0").replace(/[^0-9.]/g, "") || "0"), 0),
          totalOverdue: paymentsData.filter(x => x.client === p.client && x.status === "Overdue")
            .reduce((acc, x) => acc + parseFloat((x.amount || "0").replace(/[^0-9.]/g, "") || "0"), 0),
        });
      }
    });
    return Array.from(map.values());
  }, [paymentsData]);

  useEffect(() => {
    if (clientList.length > 0 && !selectedClientId) {
      setSelectedClientId(clientList[0].id);
    }
  }, [clientList, selectedClientId]);

  const selectedClient = useMemo(() => {
    return clientList.find(c => c.id === selectedClientId) || clientList[0] || {
      id: "", name: "No Client", business: "None", email: "", phone: "", plan: "", status: "Paid", amountDue: "$0.00", joinedDate: "None", totalPaid: 0, totalPending: 0, totalOverdue: 0
    };
  }, [clientList, selectedClientId]);

  const alerts = useMemo(() => {
    return clientList.filter(c => c.status === "Overdue").map(c => ({
      name: c.name,
      company: c.business,
      amount: typeof c.amountDue === "number" ? `$${c.amountDue.toFixed(2)}` : c.amountDue,
      days: "Payment overdue",
      plan: c.plan
    }));
  }, [clientList]);

  const [isDownloading, setIsDownloading] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOption, setSortOption] = useState<string | null>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const [planFilter, setPlanFilter] = useState("All Plans");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const planRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const [tableYear, setTableYear] = useState("All Years");
  const [tableMonth, setTableMonth] = useState("All Months");

  const [sidebarYear, setSidebarYear] = useState("All Years");
  const [sidebarMonth, setSidebarMonth] = useState("All Months");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) setSortOpen(false);
      if (planRef.current && !planRef.current.contains(event.target as Node)) setIsPlanOpen(false);
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) setIsStatusOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const sortedData = useMemo(() => {
    let data = paymentsData.filter((p) => {
      const matchPlan = planFilter === "All Plans" || 
        (planFilter === "Basic Plan" && (p.plan === "Basic" || p.plan === "Basic Plan")) ||
        (planFilter === "Plus Plan" && (p.plan === "Plus" || p.plan === "Plus Plan")) ||
        (planFilter === "Pro Plan" && (p.plan === "Pro" || p.plan === "Pro Plan" || p.plan === "Growth" || p.plan === "Growth Plan"));
      const matchStatus = statusFilter === "All Status" || p.status === statusFilter;
      
      const yearStr = tableYear === "All Years" ? "" : tableYear;
      const matchYear = !yearStr || p.date.includes(yearStr);
      
      const monthStr = tableMonth === "All Months" ? "" : tableMonth.substring(0, 3);
      const matchMonth = !monthStr || p.date.includes(monthStr);

      const term = searchQuery.toLowerCase();
      const matchSearch = !term || 
        p.client.toLowerCase().includes(term) || 
        p.user.toLowerCase().includes(term) || 
        p.business.toLowerCase().includes(term) ||
        p.paymentId.toLowerCase().includes(term) ||
        p.invoiceId.toLowerCase().includes(term) ||
        p.plan.toLowerCase().includes(term);
      return matchPlan && matchStatus && matchYear && matchMonth && matchSearch;
    });
    
    if (sortOption === "Date (Newest to Oldest)") {
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortOption === "Date (Oldest to Newest)") {
      data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortOption === "Amount (High to Low)") {
      data.sort((a, b) => parseFloat(b.amount.replace(/[^0-9.-]+/g,"")) - parseFloat(a.amount.replace(/[^0-9.-]+/g,"")));
    } else if (sortOption === "Amount (Low to High)") {
      data.sort((a, b) => parseFloat(a.amount.replace(/[^0-9.-]+/g,"")) - parseFloat(b.amount.replace(/[^0-9.-]+/g,"")));
    } else if (sortOption === "Client (A-Z)") {
      data.sort((a, b) => a.client.localeCompare(b.client));
    } else if (sortOption === "Client (Z-A)") {
      data.sort((a, b) => b.client.localeCompare(a.client));
    } else if (sortOption === "Status (Paid First)") {
      const w = (s: string) => s === "Paid" ? 1 : s === "Pending" ? 2 : 3;
      data.sort((a, b) => w(a.status) - w(b.status));
    } else if (sortOption === "Status (Overdue First)") {
      const w = (s: string) => s === "Overdue" ? 1 : s === "Pending" ? 2 : 3;
      data.sort((a, b) => w(a.status) - w(b.status));
    }
    return data;
  }, [sortOption, paymentsData, planFilter, statusFilter, searchQuery, tableYear, tableMonth]);

  const sidebarTransactions = useMemo(() => {
    return paymentsData.filter(p => {
      const matchClient = p.client === selectedClient.name;
      const yearStr = sidebarYear === "All Years" ? "" : sidebarYear;
      const matchYear = !yearStr || p.date.includes(yearStr);
      const monthStr = sidebarMonth === "All Months" ? "" : sidebarMonth.substring(0, 3);
      const matchMonth = !monthStr || p.date.includes(monthStr);
      return matchClient && matchYear && matchMonth;
    });
  }, [paymentsData, selectedClient, sidebarYear, sidebarMonth]);

  const handleExportCsv = () => {
    setIsExportingCsv(true);
    setTimeout(() => {
      const csvContent = `"Payment ID","Invoice ID","Client Name","Business Name","Plan","Amount","Date","Time","Status","Payment Method"
${paymentsData.map(p => `"${p.paymentId}","${p.invoiceId}","${p.client}","${p.business}","${p.plan}","${p.amount}","${p.date}","${p.time}","${p.status}","${p.paymentMethod}"`).join("\n")}`;
      
      const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `GrowConsult_Payments_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setIsExportingCsv(false);
      setToast(
        <div style={{ background: "#E8F5E9", color: "#4CAF50", border: "1px solid #4CAF50", borderRadius: "12px", padding: "12px 20px" }}>
          ✓ Payments exported to CSV successfully!
        </div>
      );
    }, 1000);
  };

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    setTimeout(() => {
      const blob = new Blob(["Invoice PDF content"], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "INV-2024-0515.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsDownloading(false);
      setModalOpen(null);
      setToast(
        <div style={{ background: "#E8F5E9", color: "#4CAF50", border: "1px solid #4CAF50", borderRadius: "12px", padding: "12px 20px" }}>
          ✓ Invoice downloaded successfully!
        </div>
      );
    }, 1000);
  };

  const handleSendReminderForSelected = () => {
    setTargetReminderUser({
      name: selectedClient.name,
      email: selectedClient.email,
      business: selectedClient.business,
      plan: selectedClient.plan,
      amount: selectedClient.amountDue
    });
    setModalOpen("reminder_success");
    setToast(
      <div style={{ background: "#E8F5E9", color: "#4CAF50", border: "1px solid #4CAF50", borderRadius: "12px", padding: "12px 20px" }}>
        ✓ Reminder sent to {selectedClient.name}!
      </div>
    );
  };

  const handleSelectClientByName = (name: string) => {
    const found = clientList.find(c => c.name === name);
    if (found) {
      setSelectedClientId(found.id);
      setIsSidebarOpen(true);
    }
  };

  const closeModal = () => setModalOpen(null);

  const ModalShell = ({ title, children, actions }: any) => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200" style={{ background: "#FFFDF8", borderRadius: "24px", boxShadow: "0 8px 32px rgba(78,52,46,0.12)" }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "#E8DCC8" }}>
          <h2 className="text-xl font-bold" style={{ color: "#4E342E" }}>{title}</h2>
          <button onClick={closeModal} className="hover:opacity-70"><X size={20} style={{ color: "#A1887F" }} /></button>
        </div>
        <div className="p-6">{children}</div>
        <div className="p-6 border-t flex items-center justify-end gap-3" style={{ borderColor: "#E8DCC8", background: "#FCF8F1", borderBottomLeftRadius: "24px", borderBottomRightRadius: "24px" }}>
          {actions}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Breadcrumb Panel */}
      <div className="flex items-center justify-between py-2 border-b border-[#E8DCC8]">
        <div className="flex items-center gap-2 text-sm">
          <button 
            onClick={() => setSelectedClientId(clientList[0]?.id || "")}
            className="p-1 hover:bg-[#F8F1E7] rounded-lg transition-colors text-[#6D4C41]"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-[#A1887F] font-medium cursor-pointer hover:underline" onClick={() => setSelectedClientId(clientList[0]?.id || "")}>Payments</span>
          <span className="text-[#A1887F] font-semibold">&gt;</span>
          <span className="text-[#4E342E] font-semibold">Client Details</span>
        </div>
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border border-[#E8DCC8] hover:bg-[#F8F1E7] text-[#6D4C41] transition-all cursor-pointer"
          >
            Show Details Sidebar
          </button>
        )}
      </div>

      {/* Bulk Overdue Alert Banner */}
      {bannerState === 'hidden' ? null : bannerState === 'success' ? (
        <div className="p-3.5 px-5 rounded-xl flex items-center gap-3 animate-in fade-in" style={{ background: "#E8F5E9", border: "1px solid #4CAF50", borderLeft: "4px solid #4CAF50" }}>
          <CheckCircle2 size={20} style={{ color: "#4CAF50" }} />
          <div className="flex-1">
            <div style={{ color: "#4CAF50", fontWeight: 600, fontSize: "14px" }}>✓ Reminders sent successfully!</div>
            <div style={{ color: "#8D6E63", fontSize: "12px" }}>Payment reminders sent to 3 overdue accounts: Robert Taylor, Emma Davis, James Wilson</div>
          </div>
          <button onClick={() => setBannerState('hidden')} style={{ color: "#A1887F", fontSize: "12px" }} className="hover:underline">Dismiss</button>
        </div>
      ) : (
        <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: "#FEF2F2", border: "1px solid #EF5350" }}>
          <AlertCircle size={20} style={{ color: "#EF5350" }} />
          <span className="font-semibold text-sm" style={{ color: "#EF5350" }}>⚠️ Action Required: 3 accounts are overdue on their subscribed plans. Total overdue amount: $238.00</span>
          <button 
            onClick={() => {
              setBannerState('loading');
              setTimeout(() => {
                setBannerState('success');
                setToast(
                  <div style={{ background: "#E8F5E9", border: "1px solid #4CAF50", borderLeft: "4px solid #4CAF50", borderRadius: "12px", padding: "14px 20px", display: "flex", gap: "10px", alignItems: "flex-start", boxShadow: "0 4px 12px rgba(76,175,80,0.12)" }}>
                    <CheckCircle2 size={20} style={{ color: "#4CAF50", marginTop: "4px" }} />
                    <div>
                      <div style={{ color: "#4CAF50", fontWeight: 700, fontSize: "14px" }}>✓ Bulk Reminders Sent!</div>
                      <div style={{ color: "#8D6E63", fontSize: "12px", marginTop: "8px" }}>Reminder emails sent to all 3 overdue accounts successfully.</div>
                      <div style={{ color: "#A1887F", fontSize: "11px", marginTop: "4px" }}>Robert Taylor • Emma Davis • James Wilson</div>
                    </div>
                  </div>
                );
                setTimeout(() => setBannerState('hidden'), 6000);
              }, 1500);
            }}
            disabled={bannerState === 'loading'}
            className="ml-auto px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer" 
            style={{ background: "#EF5350", color: "white", opacity: bannerState === 'loading' ? 0.85 : 1, cursor: bannerState === 'loading' ? "not-allowed" : "pointer" }}
          >
            {bannerState === 'loading' ? (
              <><Loader2 size={16} className="animate-spin" /> Sending...</>
            ) : "Send Reminders"}
          </button>
        </div>
      )}

      {/* Main Split Grid Layout */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Left/Main content workspace */}
        <div className="flex-1 space-y-6 w-full min-w-0">
          
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Paid", val: selectedClient.totalPaid, icon: CheckCircle2, color: "#4CAF50", bg: "bg-[#E8F5E9]/50" },
              { label: "Total Pending", val: selectedClient.totalPending, icon: Clock, color: "#F4B942", bg: "bg-[#FFFBEB]/50" },
              { label: "Total Overdue", val: selectedClient.totalOverdue, icon: AlertTriangle, color: "#EF5350", bg: "bg-[#FEF2F2]/50" },
              { label: "Client Since", val: selectedClient.joinedDate, icon: Calendar, color: "#A1887F", bg: "bg-[#F8F1E7]/50" },
            ].map(k => (
              <div key={k.label} className="p-5 rounded-[24px] bg-[#FCF8F1] border border-[#E8DCC8] shadow-[0_2px_12px_rgba(78,52,46,0.04)] hover:shadow-[0_4px_16px_rgba(78,52,46,0.08)] transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#8D6E63]">{k.label}</div>
                    <div className="text-xl font-bold mt-1 text-[#4E342E]">{k.val}</div>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-[#E8DCC8] bg-white`}>
                    <k.icon size={18} style={{ color: k.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Client Information Card */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-6 rounded-[24px] bg-[#FCF8F1] border border-[#E8DCC8] shadow-[0_2px_12px_rgba(78,52,46,0.04)]">
            <div className="flex items-center gap-4">
              <Avatar name={selectedClient.name} size={56} />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-[#4E342E]">{selectedClient.name}</h2>
                  <PlanBadge plan={selectedClient.plan.replace(" Plan", "")} />
                </div>
                <div className="text-xs text-[#8D6E63] mt-1 flex items-center gap-1">
                  <Mail size={12} className="text-[#A1887F]" />
                  {selectedClient.email}
                </div>
                <div className="text-xs text-[#8D6E63] mt-0.5 flex items-center gap-1">
                  <span className="text-[10px]">📞</span>
                  {selectedClient.phone}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 flex-1 max-w-2xl px-6 py-2 border-[#E8DCC8] lg:border-l lg:border-r">
              <div>
                <div className="text-[10px] font-bold text-[#A1887F] uppercase tracking-wider mb-1">Client Name</div>
                <div className="text-xs font-semibold text-[#4E342E] truncate">{selectedClient.name}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#A1887F] uppercase tracking-wider mb-1">Business Name</div>
                <div className="text-xs font-semibold text-[#4E342E] truncate">{selectedClient.business}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#A1887F] uppercase tracking-wider mb-1">Plan</div>
                <div className="text-xs font-semibold text-[#4E342E] flex items-center gap-1">
                  <span className="text-amber-500 text-[11px]">⚙️</span>
                  {selectedClient.plan}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#A1887F] uppercase tracking-wider mb-1">Status</div>
                <div className="scale-95 origin-left">
                  <StatusBadge status={selectedClient.status} />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
              <div className="lg:text-right">
                <div className="text-[10px] font-bold text-[#A1887F] uppercase tracking-wider">Amount Due</div>
                <div className="text-lg font-bold text-[#EF5350] mt-0.5">{selectedClient.amountDue}</div>
              </div>
              <button 
                onClick={handleSendReminderForSelected}
                className="px-3.5 py-2 bg-[#EF5350] hover:bg-[#d32f2f] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mail size={12} />
                Send Payment Reminder
              </button>
            </div>
          </div>

          {/* Payment Filters and Actions Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              {/* Search */}
              <div className="relative flex-1 max-w-[280px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1887F]" />
                <input 
                  className="w-full rounded-xl pl-8 pr-8 py-2.5 text-xs outline-none transition-all bg-[#FFFDF8] border border-[#E8DCC8] text-[#4E342E]" 
                  placeholder="Search by client or invoice ID..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#E89D18";
                    e.target.style.boxShadow = "0 0 0 3px rgba(232,157,24,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E8DCC8";
                    e.target.style.boxShadow = "none";
                  }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X size={12} className="text-[#A1887F] hover:text-[#EF5350]" />
                  </button>
                )}
              </div>

              {/* Plan Filter */}
              <div className="relative" ref={planRef}>
                <button 
                  onClick={() => setIsPlanOpen(!isPlanOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs bg-[#FFFDF8] border border-[#E8DCC8] text-[#6D4C41] hover:bg-[#F8F1E7] transition-colors cursor-pointer font-medium"
                  style={{ 
                    borderColor: planFilter === "All Plans" ? "#E8DCC8" : "#E89D18",
                    color: planFilter === "All Plans" ? "#6D4C41" : "#E89D18"
                  }}
                >
                  {planFilter}
                  <ChevronDown size={12} className={`transition-transform duration-150 ${isPlanOpen ? 'rotate-180' : ''}`} />
                </button>
                {isPlanOpen && (
                  <div className="absolute left-0 mt-1 w-44 rounded-xl shadow-lg border p-1 z-50 bg-[#FCF8F1] border-[#E8DCC8]">
                    {[
                      { label: "All Plans" },
                      { label: "Basic Plan" },
                      { label: "Plus Plan" },
                      { label: "Pro Plan" }
                    ].map(opt => (
                      <button 
                        key={opt.label}
                        onClick={() => { setPlanFilter(opt.label); setIsPlanOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium text-[#6D4C41] hover:bg-[#FFF3D6] flex items-center justify-between"
                      >
                        {opt.label}
                        {planFilter === opt.label && <CheckCircle2 size={12} className="text-[#E89D18]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Filter */}
              <div className="relative" ref={statusRef}>
                <button 
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs bg-[#FFFDF8] border border-[#E8DCC8] text-[#6D4C41] hover:bg-[#F8F1E7] transition-colors cursor-pointer font-medium"
                  style={{ 
                    borderColor: statusFilter === "All Status" ? "#E8DCC8" : "#E89D18",
                    color: statusFilter === "All Status" ? "#6D4C41" : "#E89D18"
                  }}
                >
                  {statusFilter}
                  <ChevronDown size={12} className={`transition-transform duration-150 ${isStatusOpen ? 'rotate-180' : ''}`} />
                </button>
                {isStatusOpen && (
                  <div className="absolute left-0 mt-1 w-44 rounded-xl shadow-lg border p-1 z-50 bg-[#FCF8F1] border-[#E8DCC8]">
                    {[
                      { label: "All Status", dot: null },
                      { label: "Paid", dot: "#4CAF50" },
                      { label: "Pending", dot: "#F4B942" },
                      { label: "Overdue", dot: "#EF5350" }
                    ].map(opt => (
                      <button 
                        key={opt.label}
                        onClick={() => { setStatusFilter(opt.label); setIsStatusOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium text-[#6D4C41] hover:bg-[#FFF3D6] flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          {opt.dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: opt.dot }} />}
                          {opt.label}
                        </span>
                        {statusFilter === opt.label && <CheckCircle2 size={12} className="text-[#E89D18]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sorting */}
              <div className="relative" ref={sortRef}>
                <button 
                  onClick={() => setSortOpen(!sortOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs bg-[#FFFDF8] border border-[#E8DCC8] text-[#6D4C41] hover:bg-[#F8F1E7] transition-colors cursor-pointer font-medium"
                >
                  <ArrowUpDown size={12} />
                  {sortOption ? `Sort: ${sortOption.split(" ")[0]}` : "Sort"}
                  <ChevronDown size={12} className={`transition-transform duration-150 ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 mt-1 w-52 rounded-xl shadow-lg border p-1 z-50 bg-[#FCF8F1] border-[#E8DCC8]">
                    {[
                      "Date (Newest to Oldest)", "Date (Oldest to Newest)",
                      "Amount (High to Low)", "Amount (Low to High)",
                      "Client (A-Z)", "Client (Z-A)",
                      "Status (Paid First)", "Status (Overdue First)"
                    ].map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setSortOption(opt); setSortOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium text-[#6D4C41] hover:bg-[#FFF3D6]"
                        style={{ 
                          background: sortOption === opt ? "#F8F1E7" : "transparent",
                          color: sortOption === opt ? "#E89D18" : "#6D4C41",
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                    <div className="border-t my-1 border-[#E8DCC8]"></div>
                    <button
                      onClick={() => { setSortOption(null); setSortOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-bold text-[#8D6E63] hover:bg-[#F8F1E7]"
                    >
                      Clear Sort
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Export CSV */}
            <button 
              onClick={handleExportCsv}
              disabled={isExportingCsv}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs bg-[#FCF8F1] border border-[#E8DCC8] text-[#6D4C41] hover:bg-[#F8F1E7] transition-all cursor-pointer font-medium shrink-0"
            >
              {isExportingCsv ? <DownloadCloud size={14} className="animate-spin" /> : <Download size={14} />}
              {isExportingCsv ? "Exporting..." : "Export CSV"}
            </button>
          </div>

          {/* Payment History Card Container */}
          <div className="rounded-[24px] bg-[#FCF8F1] border border-[#E8DCC8] shadow-[0_2px_12px_rgba(78,52,46,0.04)] overflow-hidden">
            {/* Payment History Heading Ribbon */}
            <div className="p-5 border-b border-[#E8DCC8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
              <div>
                <h3 className="text-sm font-bold text-[#4E342E]">Payment History</h3>
                <p className="text-xs text-[#8D6E63] mt-0.5">View all payment transactions made by {selectedClient.name}.</p>
              </div>

              {/* Main table Year / Month filters */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Calendar size={12} className="text-[#A1887F]" />
                  <select
                    value={tableYear}
                    onChange={(e) => setTableYear(e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1.5 bg-white border border-[#E8DCC8] rounded-xl outline-none text-[#6D4C41]"
                  >
                    <option value="All Years">All Years</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
                <select
                  value={tableMonth}
                  onChange={(e) => setTableMonth(e.target.value)}
                  className="text-xs font-semibold px-2.5 py-1.5 bg-white border border-[#E8DCC8] rounded-xl outline-none text-[#6D4C41]"
                >
                  <option value="All Months">All Months</option>
                  <option value="Jan">Jan</option>
                  <option value="Feb">Feb</option>
                  <option value="Mar">Mar</option>
                  <option value="Apr">Apr</option>
                  <option value="May">May</option>
                  <option value="Jun">Jun</option>
                  <option value="Jul">Jul</option>
                  <option value="Aug">Aug</option>
                  <option value="Sep">Sep</option>
                  <option value="Oct">Oct</option>
                  <option value="Nov">Nov</option>
                  <option value="Dec">Dec</option>
                </select>
              </div>
            </div>

            {/* Responsive table block */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#F8F1E7] border-b border-[#E8DCC8] text-[#6D4C41] font-semibold">
                    <th className="px-4 py-3 font-semibold">Client Name</th>
                    <th className="px-4 py-3 font-semibold">Business Name</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Time</th>
                    <th className="px-4 py-3 font-semibold">Payment ID</th>
                    <th className="px-4 py-3 font-semibold">Invoice ID</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Plan</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Payment Method</th>
                    <th className="px-4 py-3 font-semibold">Invoice</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DCC8]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-6 h-6 border-2 border-[#E89D18] border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs font-semibold" style={{ color: "#8D6E63" }}>Loading payments...</span>
                        </div>
                      </td>
                    </tr>
                  ) : sortedData.length > 0 ? (
                    sortedData.map((p) => {
                      const isSelected = p.client === selectedClient.name;
                      return (
                        <tr 
                          key={p.id} 
                          onClick={() => handleSelectClientByName(p.client)}
                          className={`hover:bg-[#FFF3D6] transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#FFF3D6]/40 font-semibold' : 'bg-transparent'
                          }`}
                        >
                          <td className="px-4 py-3.5 text-[#4E342E] font-medium">{p.client}</td>
                          <td className="px-4 py-3.5 text-[#6D4C41]">{p.business}</td>
                          <td className="px-4 py-3.5 text-[#8D6E63]">{p.date}</td>
                          <td className="px-4 py-3.5 text-[#8D6E63]">{p.time}</td>
                          <td className="px-4 py-3.5 text-[#8D6E63] font-mono">{p.paymentId}</td>
                          <td className="px-4 py-3.5 text-[#8D6E63] font-mono">{p.invoiceId}</td>
                          <td className="px-4 py-3.5 text-[#4E342E] font-bold">{p.amount}</td>
                          <td className="px-4 py-3.5">
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FFF3D6] text-[#E89D18] border border-[#FFD98A] rounded-md">
                              {p.plan}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1 font-semibold ${
                              p.status === 'Paid' ? 'text-[#4CAF50]' : p.status === 'Overdue' ? 'text-[#EF5350]' : 'text-[#F4B942]'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                p.status === 'Paid' ? 'bg-[#4CAF50]' : p.status === 'Overdue' ? 'bg-[#EF5350]' : 'bg-[#F4B942]'
                              }`}></span>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-[#6D4C41] whitespace-nowrap">
                            <div className="text-[10px] leading-tight text-[#A1887F]">{p.paymentMethod.split(" ")[0]} {p.paymentMethod.split(" ")[1]}</div>
                            <div className="font-semibold">{p.paymentMethod.split(" ").slice(2).join(" ")}</div>
                          </td>
                          <td className="px-4 py-3.5 font-semibold">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setTargetInvoiceUser(p);
                                setModalOpen("invoice");
                              }}
                              className="text-[#E89D18] hover:underline cursor-pointer"
                            >
                              {p.invoiceId}
                            </button>
                          </td>
                          <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                            <ActionsDropdown 
                              p={p} 
                              setModalOpen={setModalOpen} 
                              setToast={setToast} 
                              setPaymentsData={setPaymentsData} 
                              setTargetReminderUser={setTargetReminderUser} 
                              setTargetInvoiceUser={setTargetInvoiceUser}
                              handleDownloadPdf={handleDownloadPdf}
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={12} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <SearchX size={32} style={{ color: "#A1887F" }} />
                          <div style={{ color: "#6D4C41", fontSize: "14px", marginTop: "12px", fontWeight: 600 }}>No payments found</div>
                          <div style={{ color: "#A1887F", fontSize: "12px", marginTop: "4px" }}>Try a different search or filter setting</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sticky Sidebar */}
        {isSidebarOpen && (
          <aside className="w-full xl:w-[360px] shrink-0 xl:sticky xl:top-6 self-start bg-[#FCF8F1] border border-[#E8DCC8] rounded-[24px] shadow-[0_2px_12px_rgba(78,52,46,0.04)] overflow-hidden">
            {/* Sidebar header */}
            <div className="p-5 border-b border-[#E8DCC8] flex items-center justify-between bg-white">
              <h3 className="font-bold text-[#4E342E] text-sm">Payment Details</h3>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 hover:bg-[#F8F1E7] rounded-lg transition-colors text-[#A1887F] hover:text-[#EF5350] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Selected Client Card in Sidebar */}
            <div className="p-5 border-b border-[#E8DCC8]/60">
              <div className="flex items-center gap-3">
                <Avatar name={selectedClient.name} size={40} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs text-[#4E342E]">{selectedClient.name}</span>
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-[#FFF3D6] text-[#E89D18] border border-[#FFD98A] rounded-md">
                      {selectedClient.plan.replace(" Plan", "")}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#A1887F] truncate mt-0.5 flex items-center gap-1">
                    <Mail size={10} />
                    {selectedClient.email}
                  </div>
                </div>
              </div>

              {/* Details table in sidebar */}
              <div className="mt-5 space-y-3.5 text-xs">
                <div className="flex items-center justify-between border-b border-[#E8DCC8]/30 pb-2">
                  <span className="text-[#A1887F] font-medium">Business Name</span>
                  <span className="font-semibold text-[#4E342E]">{selectedClient.business}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#E8DCC8]/30 pb-2">
                  <span className="text-[#A1887F] font-medium">Plan</span>
                  <span className="font-semibold text-[#4E342E]">{selectedClient.plan}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#E8DCC8]/30 pb-2">
                  <span className="text-[#A1887F] font-medium">Status</span>
                  <span className={`font-semibold ${
                    selectedClient.status === 'Paid' ? 'text-[#4CAF50]' : selectedClient.status === 'Overdue' ? 'text-[#EF5350]' : 'text-[#F4B942]'
                  }`}>
                    {selectedClient.status}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[#A1887F] font-medium">Amount Due</span>
                  <span className="font-bold text-[#EF5350]">{selectedClient.amountDue}</span>
                </div>
              </div>
            </div>

            {/* Sidebar Payment History segment */}
            <div className="p-5 bg-white">
              <h4 className="font-bold text-[#4E342E] text-xs">Payment History</h4>
              
              {/* Sidebar filter controls */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div>
                  <label className="text-[9px] uppercase font-bold text-[#A1887F] block mb-1">Year</label>
                  <select
                    value={sidebarYear}
                    onChange={(e) => setSidebarYear(e.target.value)}
                    className="w-full text-xs font-semibold px-2 py-1.5 bg-white border border-[#E8DCC8] rounded-xl outline-none text-[#6D4C41]"
                  >
                    <option value="All Years">All Years</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-[#A1887F] block mb-1">Month</label>
                  <select
                    value={sidebarMonth}
                    onChange={(e) => setSidebarMonth(e.target.value)}
                    className="w-full text-xs font-semibold px-2 py-1.5 bg-white border border-[#E8DCC8] rounded-xl outline-none text-[#6D4C41]"
                  >
                    <option value="All Months">All Months</option>
                    <option value="Jan">Jan</option>
                    <option value="Feb">Feb</option>
                    <option value="Mar">Mar</option>
                    <option value="Apr">Apr</option>
                    <option value="May">May</option>
                    <option value="Jun">Jun</option>
                    <option value="Jul">Jul</option>
                    <option value="Aug">Aug</option>
                    <option value="Sep">Sep</option>
                    <option value="Oct">Oct</option>
                    <option value="Nov">Nov</option>
                    <option value="Dec">Dec</option>
                  </select>
                </div>
              </div>

              {/* Sidebar transaction list */}
              <div className="space-y-3.5 mt-5">
                {sidebarTransactions.map((tx, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-[#E8DCC8]/30 last:border-0 text-xs">
                    <div>
                      <div className="font-semibold text-[#4E342E]">{tx.date}</div>
                      <div className="text-[10px] text-[#A1887F] mt-0.5">{tx.time}</div>
                    </div>
                    <div className="font-bold text-[#4E342E]">{tx.amount}</div>
                    <div>
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        tx.status === 'Paid' ? 'text-[#4CAF50]' : tx.status === 'Overdue' ? 'text-[#EF5350]' : 'text-[#F4B942]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          tx.status === 'Paid' ? 'bg-[#4CAF50]' : tx.status === 'Overdue' ? 'bg-[#EF5350]' : 'bg-[#F4B942]'
                        }`}></span>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
                {sidebarTransactions.length === 0 && (
                  <div className="text-center py-6 text-xs text-[#A1887F]">
                    No history found for current filters.
                  </div>
                )}
              </div>

              {/* Download History (CSV Export) */}
              <button 
                onClick={handleExportCsv}
                className="w-full mt-5 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#F8F1E7] border border-[#E8DCC8] text-[#6D4C41] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <DownloadCloud size={14} />
                Download History
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* Confirms, Alerts and Upgrades Modals Portals */}
      {modalOpen === "confirm" && (
        <ModalShell
          title="Confirm Payment"
          actions={
            <>
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-80 cursor-pointer" style={{ background: "#FCF8F1", border: "1px solid #E8DCC8", color: "#6D4C41" }}>Cancel</button>
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-90 cursor-pointer" style={{ background: "#4CAF50", color: "white" }}>Mark as Paid</button>
            </>
          }
        >
          <p className="text-sm" style={{ color: "#8D6E63" }}>Are you sure you want to mark this invoice as Paid? This action will update the user's account status.</p>
        </ModalShell>
      )}

      {modalOpen === "suspend" && (
        <ModalShell
          title="Suspend Service"
          actions={
            <>
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-80 cursor-pointer" style={{ background: "#FCF8F1", border: "1px solid #E8DCC8", color: "#6D4C41" }}>Cancel</button>
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-90 cursor-pointer" style={{ background: "#EF5350", color: "white" }}>Suspend Account</button>
            </>
          }
        >
          <p className="text-sm" style={{ color: "#8D6E63" }}>Are you sure you want to suspend this account? The user will immediately lose access to their services.</p>
        </ModalShell>
      )}

      {modalOpen === "upgrade" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200" style={{ background: "#FFFDF8", borderRadius: "24px", boxShadow: "0 8px 32px rgba(78,52,46,0.12)" }}>
            <div className="flex items-center justify-between p-6 border-b relative" style={{ borderColor: "#E8DCC8" }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: "#4E342E" }}>Choose Your Plan</h2>
                <p className="text-sm mt-1" style={{ color: "#8D6E63" }}>Upgrade to unlock more features for your business growth</p>
              </div>
              <button onClick={closeModal} className="hover:opacity-70 absolute top-6 right-6"><X size={20} style={{ color: "#8D6E63" }} /></button>
            </div>
            
            <div className="p-8 pb-12">
              <div className="flex items-center justify-center gap-3 mb-8">
                <span style={{ color: "#6D4C41", fontWeight: 600, fontSize: "14px" }}>Monthly</span>
                <div 
                  onClick={() => setIsAnnual(!isAnnual)}
                  style={{
                    width: "44px", height: "24px", borderRadius: "999px",
                    background: isAnnual ? "#E89D18" : "#D7CCC8", cursor: "pointer", position: "relative", transition: "background 300ms ease"
                  }}
                >
                  <div style={{
                    width: "20px", height: "20px", background: "white", borderRadius: "50%",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.15)", position: "absolute", top: "2px",
                    transform: isAnnual ? "translateX(22px)" : "translateX(2px)",
                    transition: "transform 300ms ease"
                  }} />
                </div>
                <span style={{ color: "#6D4C41", fontWeight: 600, fontSize: "14px" }}>Annual pricing</span>
                <span style={{
                  background: "#E8F5E9", color: "#4CAF50", border: "1px solid #4CAF50",
                  borderRadius: "999px", fontSize: "12px", fontWeight: 700, padding: "2px 8px"
                }}>SAVE 20%</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: "Basic",
                    title: "Basic Plan",
                    desc: "Essential assets to kickstart your business presence.",
                    priceM: "29", priceA: "23", billed: "276",
                    features: ["Website (Template)", "3 Posts + 1 Reel per month", "AI Chatbot + Voice support", "Basic SEO optimization", "Google Business Profile setup"],
                    style: { bg: "#FFFDF8", border: "1px solid #E8DCC8" }
                  },
                  {
                    id: "Plus",
                    title: "Plus Plan",
                    desc: "Designed for expanding businesses seeking growth.",
                    priceM: "59", priceA: "47", billed: "564",
                    popular: true,
                    features: ["Website (Customized layout)", "5 Posts + 2 Reels per month", "AI Voicebot integration", "Advanced SEO optimization", "Email marketing campaigns", "Includes all Basic features"],
                    style: { bg: "#FCF8F1", border: "2px solid #E89D18", transform: "translateY(-8px)", boxShadow: "0 4px 20px rgba(232,157,24,0.15)" }
                  },
                  {
                    id: "Growth",
                    title: "Pro Plan",
                    desc: "Ultimate features for scaling market leaders.",
                    priceM: "89", priceA: "71", billed: "852",
                    features: ["Modern 3D Website design", "7 Posts + 3 Reels per month", "AI Voice + Chatbot agents", "Deep performance analytics", "Paid Ads (Google & Meta)", "All Social Media Optimization", "SEO + GEO + AEO optimization", "Includes all Plus features"],
                    style: { bg: "#FFFDF8", border: "1px solid #E8DCC8" }
                  }
                ].map((plan) => (
                  <div key={plan.id} className="relative transition-all rounded-[20px] p-6 flex flex-col" style={plan.style}>
                    {plan.popular && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[12px] z-10" style={{ background: "#E89D18", color: "white", borderRadius: "999px", padding: "4px 12px", fontSize: "12px", fontWeight: 700 }}>
                        MOST POPULAR
                      </div>
                    )}
                    <h3 className="font-bold text-lg mb-1" style={{ color: "#4E342E" }}>{plan.title}</h3>
                    <p className="text-[13px] min-h-[40px] mb-4" style={{ color: "#8D6E63" }}>{plan.desc}</p>
                    
                    <div className="mb-6 relative transition-all duration-300">
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-[32px]" style={{ color: "#4E342E" }}>${isAnnual ? plan.priceA : plan.priceM}</span>
                        <span className="text-[16px]" style={{ color: "#A1887F" }}>/month</span>
                      </div>
                      <div className="text-[11px] font-semibold mt-1 uppercase" style={{ color: "#A1887F", letterSpacing: "0.5px" }}>
                        {isAnnual ? `BILLED $${plan.billed}/YEAR` : "BILLED MONTHLY"}
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2.5 text-[13px]" style={{ color: "#6D4C41" }}>
                          <CheckCircle2 size={14} className="shrink-0 mt-0.5" style={{ color: "#4CAF50" }} /> {f}
                        </li>
                      ))}
                    </ul>

                    <button 
                      onClick={() => {
                        const confirmMsg = window.confirm(`Upgrade to ${plan.title}?\n\nYou will be charged $${isAnnual ? plan.priceA : plan.priceM}/month starting today.\n\nClick OK to Confirm Upgrade.`);
                        if (confirmMsg) {
                          setToast(
                            <div style={{ background: "#E8F5E9", color: "#4CAF50", border: "1px solid #4CAF50", borderRadius: "12px", padding: "12px 20px" }}>
                              ✓ Plan upgraded to {plan.title}!
                            </div>
                          );
                          setModalOpen(null);
                        }
                      }}
                      className="w-full py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 mt-auto cursor-pointer" 
                      style={{ background: "#E89D18", color: "white" }}
                    >
                      Select {plan.title}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {modalOpen === "remind" && (
        <ModalShell
          title="Send Reminder Email"
          actions={
            <>
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-80 cursor-pointer" style={{ background: "#FCF8F1", border: "1px solid #E8DCC8", color: "#6D4C41" }}>Cancel</button>
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-90 cursor-pointer" style={{ background: "#E89D18", color: "white" }}>Send Email</button>
            </>
          }
        >
          <div className="space-y-4">
            <label className="text-sm font-semibold" style={{ color: "#6D4C41" }}>Email Template</label>
            <textarea className="input-field min-h-[120px]" style={{ background: "#FFFDF8", borderColor: "#E8DCC8" }} defaultValue="Dear Client,&#10;&#10;This is a friendly reminder that your payment is currently overdue. Please process it at your earliest convenience to avoid service interruption.&#10;&#10;Best,&#10;GrowConsult AI Team" />
          </div>
        </ModalShell>
      )}

      {modalOpen === "invoice" && targetInvoiceUser && (
        <ModalShell
          title="Invoice Details"
          actions={
            <>
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-80 cursor-pointer" style={{ background: "#FCF8F1", border: "1px solid #E8DCC8", color: "#6D4C41" }}>Close</button>
              <button onClick={handleDownloadPdf} disabled={isDownloading} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-90 flex items-center gap-2 cursor-pointer" style={{ background: "#E89D18", color: "white", opacity: isDownloading ? 0.6 : 1 }}>
                {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
                {isDownloading ? "Downloading..." : "Download PDF"}
              </button>
            </>
          }
        >
          <div className="space-y-6 text-xs md:text-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base md:text-lg text-[#4E342E]">{targetInvoiceUser.invoiceId}</h3>
                <p className="text-xs text-[#A1887F] mt-0.5">Issued: {targetInvoiceUser.date} at {targetInvoiceUser.time}</p>
              </div>
              <StatusBadge status={targetInvoiceUser.status} />
            </div>
            <div className="p-4 rounded-xl" style={{ background: "#FCF8F1", border: "1px solid #E8DCC8" }}>
              <div className="flex justify-between text-xs md:text-sm mb-2" style={{ color: "#8D6E63" }}>
                <span>{targetInvoiceUser.plan} Plan — Monthly Subscription | {targetInvoiceUser.amount}</span>
                <span className="font-semibold text-[#4E342E]">{targetInvoiceUser.amount}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm pt-2 border-t border-[#E8DCC8]">
                <span className="font-bold text-[#4E342E]">Total Amount</span>
                <span className="font-bold text-[#4E342E]">{targetInvoiceUser.amount}</span>
              </div>
            </div>
          </div>
        </ModalShell>
      )}

      {modalOpen === "reminder_success" && targetReminderUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(4px)" }} onClick={closeModal}>
          <div className="w-full relative transition-all duration-300 animate-in zoom-in-95" style={{ background: "#FCF8F1", borderRadius: "20px", border: "1px solid #E8DCC8", maxWidth: "420px", padding: "28px", boxShadow: "0 20px 60px rgba(78,52,46,0.15)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center">
              <CheckCircle2 size={40} style={{ color: "#4CAF50" }} />
              <div style={{ color: "#4E342E", fontWeight: 700, fontSize: "18px", marginTop: "8px", textAlign: "center" }}>Reminder Sent!</div>
              <div style={{ color: "#8D6E63", fontSize: "14px", marginTop: "4px", textAlign: "center" }}>A payment reminder has been successfully sent to:</div>
              
              <div style={{ background: "#F8F1E7", borderRadius: "12px", padding: "12px 16px", marginTop: "12px", width: "100%", textAlign: "left" }}>
                <div style={{ color: "#4E342E", fontWeight: 600, fontSize: "14px" }}>{targetReminderUser.name}</div>
                <div style={{ color: "#8D6E63", fontSize: "13px" }}>{targetReminderUser.email}</div>
                <div style={{ color: "#A1887F", fontSize: "12px" }}>{targetReminderUser.business} — {targetReminderUser.plan} — {targetReminderUser.amount} due</div>
              </div>

              <div style={{ background: "#FFFDF8", border: "1px solid #E8DCC8", borderRadius: "12px", padding: "12px", marginTop: "12px", width: "100%", textAlign: "left" }}>
                <div style={{ color: "#A1887F", fontSize: "12px" }}>📧 Email sent with subject:</div>
                <div style={{ color: "#6D4C41", fontSize: "13px", fontStyle: "italic", marginTop: "4px" }}>Payment Reminder: Your payment of {targetReminderUser.amount} is due for {targetReminderUser.plan}</div>
              </div>

              <button onClick={closeModal} className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-90 cursor-pointer" style={{ background: "#E89D18", color: "white" }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] shadow-lg transition-all animate-in slide-in-from-bottom-5">
          {toast}
        </div>
      )}
    </div>
  );
}

// Inline component for Actions dropdown row trigger and contents
function ActionsDropdown({ 
  p, 
  setModalOpen, 
  setToast, 
  setPaymentsData, 
  setTargetReminderUser, 
  setTargetInvoiceUser,
  handleDownloadPdf 
}: {
  p: any;
  setModalOpen: any;
  setToast: any;
  setPaymentsData: any;
  setTargetReminderUser: any;
  setTargetInvoiceUser: any;
  handleDownloadPdf: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRemind = () => {
    setIsOpen(false);
    const email = p.user.split(' ')[0].toLowerCase() + "@example.com";
    setTargetReminderUser({
      name: p.user,
      email: email,
      business: p.business,
      plan: p.plan,
      amount: p.amount
    });
    setModalOpen("reminder_success");
    setToast(
      <div style={{ background: "#E8F5E9", color: "#4CAF50", border: "1px solid #4CAF50", borderRadius: "12px", padding: "12px 20px" }}>
        ✓ Reminder sent to {p.user}!
      </div>
    );
  };

  const handleSuspend = () => {
    setIsOpen(false);
    setPaymentsData((prev: any) => {
      const next = prev.map((item: any) => item.id === p.id ? { ...item, status: "Suspended" } : item);
      savePaymentsFn({ data: next });
      return next;
    });
    setToast(
      <div style={{ background: "#FEF2F2", color: "#EF5350", border: "1px solid #EF5350", borderRadius: "12px", padding: "12px 20px" }}>
        Account suspended for {p.client}
      </div>
    );
  };

  const handleCopyInvoiceId = () => {
    setIsOpen(false);
    navigator.clipboard.writeText(p.invoiceId);
    setToast(
      <div style={{ background: "#E8F5E9", color: "#4CAF50", border: "1px solid #4CAF50", borderRadius: "12px", padding: "12px 20px" }}>
        ✓ Invoice ID {p.invoiceId} copied to clipboard!
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#E8DCC8] hover:bg-[#F8F1E7] transition-all text-[#6D4C41] cursor-pointer"
      >
        <Download size={14} />
        Download Invoice
        <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 rounded-xl shadow-lg border p-1 z-50 bg-[#FCF8F1] border-[#E8DCC8]">
          <button
            onClick={() => { setIsOpen(false); setTargetInvoiceUser(p); setModalOpen("invoice"); }}
            className="w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium text-[#6D4C41] hover:bg-[#FFF3D6] hover:text-[#4E342E] flex items-center gap-2"
          >
            <FileText size={14} />
            View Details
          </button>
          <button
            onClick={() => { setIsOpen(false); handleDownloadPdf(); }}
            className="w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium text-[#6D4C41] hover:bg-[#FFF3D6] hover:text-[#4E342E] flex items-center gap-2"
          >
            <Download size={14} />
            Download Invoice
          </button>
          {p.status !== "Paid" && (
            <button
              onClick={handleRemind}
              className="w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium text-[#6D4C41] hover:bg-[#FFF3D6] hover:text-[#4E342E] flex items-center gap-2"
            >
              <Clock size={14} />
              Send Reminder
            </button>
          )}
          <button
            onClick={handleCopyInvoiceId}
            className="w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium text-[#6D4C41] hover:bg-[#FFF3D6] hover:text-[#4E342E] flex items-center gap-2"
          >
            <Copy size={14} />
            Copy Invoice ID
          </button>
          <div className="border-t my-1 border-[#E8DCC8]"></div>
          <button
            onClick={() => { setIsOpen(false); setModalOpen("upgrade"); }}
            className="w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium text-[#4CAF50] hover:bg-[#E8F5E9] flex items-center gap-2"
          >
            <ArrowUpCircle size={14} />
            Upgrade Plan
          </button>
          <button
            onClick={handleSuspend}
            className="w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium text-[#EF5350] hover:bg-[#FEF2F2] flex items-center gap-2"
          >
            <PauseCircle size={14} />
            Suspend Service
          </button>
        </div>
      )}
    </div>
  );
}
