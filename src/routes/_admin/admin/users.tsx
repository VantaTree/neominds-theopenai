import { createFileRoute } from "@tanstack/react-router";
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Phone, Mail, X, FileText, Eye, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { type User } from "@/lib/mock-data";
import { Avatar, PlanBadge, StatusBadge } from "@/components/admin/shared";
import { SearchX, CheckCircle2, ChevronDown } from "lucide-react";
import { getUsers, saveUser, deleteUser as removeUserDb } from "@/lib/db";

export const Route = createFileRoute("/_admin/admin/users")({
  head: () => ({ meta: [{ title: "Users — GrowConsult AI" }] }),
  component: UsersPage,
});

function UsersPage() {
  const [userList, setUserList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUsers = async () => {
    const data = await getUsers();
    setUserList(data);
  };

  useEffect(() => {
    refreshUsers().then(() => setIsLoading(false));
  }, []);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("Profile");
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editForm, setEditForm] = useState<any>({});
  const [toast, setToast] = useState<{title: string, sub?: string} | null>(null);

  const [addForm, setAddForm] = useState({ name: "", business: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("All Plans");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const planRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (planRef.current && !planRef.current.contains(e.target as Node)) setIsPlanOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setIsStatusOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleAddSubmit = () => {
    const errs: Record<string, string> = {};
    if (!addForm.name.trim()) errs.name = "Full name is required";
    if (!addForm.business.trim()) errs.business = "Business name is required";
    if (!addForm.email.trim()) errs.email = "Email address is required";
    else if (!/^\S+@\S+\.\S+$/.test(addForm.email)) errs.email = "Please enter a valid email";
    else if (userList.some(u => u.email.toLowerCase() === addForm.email.toLowerCase())) errs.email = "This email is already registered";
    
    if (!addForm.phone.trim()) errs.phone = "Phone number is required";
    if (!addForm.password) errs.password = "Password is required";
    else if (addForm.password.length < 8) errs.password = "Password must be at least 8 characters";
    if (!addForm.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (addForm.password !== addForm.confirmPassword) errs.confirmPassword = "Passwords do not match";

    if (Object.keys(errs).length > 0) {
      setAddErrors(errs);
      return;
    }

    setIsCreatingUser(true);
    const newUser: User = {
      id: `u${Date.now()}`,
      name: addForm.name,
      business: addForm.business,
      email: addForm.email,
      phone: addForm.phone,
      plan: "Basic Plan" as any,
      status: "Active",
      joinedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    saveUser(newUser).then(() => {
      setIsCreatingUser(false);
      setIsAddUserOpen(false);
      setUserList([newUser, ...userList]);
      setAddForm({ name: "", business: "", email: "", phone: "", password: "", confirmPassword: "" });
      setToast({ title: "✓ User created successfully!", sub: `${addForm.name} has been added to the platform.` });
    });
  };

  const handleAddClose = () => {
    if (Object.values(addForm).some(v => v.trim() !== "")) {
      setConfirmClose(true);
    } else {
      setIsAddUserOpen(false);
    }
  };

  const handleEditClick = (u: User) => {
    setEditingUser(u);
    const normalizedPlan = u.plan.endsWith(" Plan") ? u.plan : `${u.plan === "Growth" ? "Pro" : u.plan} Plan`;
    setEditForm({ ...u, plan: normalizedPlan, newPassword: "", confirmPassword: "" });
    setEditErrors({});
  };

  const handleEditSubmit = () => {
    const errs: Record<string, string> = {};
    if (!editForm.name?.trim()) errs.name = "Full Name is required.";
    if (!editForm.business?.trim()) errs.business = "Business Name is required.";
    if (!editForm.email?.trim()) errs.email = "Email Address is required.";
    if (!editForm.phone?.trim()) errs.phone = "Phone Number is required.";
    if (editForm.newPassword && editForm.newPassword !== editForm.confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }

    const updated = { ...editingUser, ...editForm } as User;
    saveUser(updated).then(() => {
      setUserList(list => list.map(u => u.id === editingUser?.id ? updated : u));
      if (selectedUser?.id === editingUser?.id) {
        setSelectedUser(updated);
      }
      setEditingUser(null);
      setToast({ title: "✓ User updated successfully!" });
    });
  };

  const handleDeleteUser = (userId: string) => {
    const user = userList.find(u => u.id === userId);
    if (!user) return;
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      removeUserDb(userId).then(() => {
        setUserList(list => list.filter(u => u.id !== userId));
        if (selectedUser?.id === userId) {
          setSelectedUser(null);
        }
        setToast({ title: "✓ User deleted successfully!", sub: `${user.name} has been removed.` });
      });
    }
  };

  const handleViewDocument = (name: string) => {
    setToast({
      title: `✓ Opening ${name}...`,
      sub: "This document is now being generated/downloaded."
    });
    const blob = new Blob([`Dummy PDF content for ${name}`], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name.endsWith(".pdf") ? name : `${name.replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetPassword = () => {
    if (!selectedUser) return;
    if (window.confirm(`Are you sure you want to send a password reset link to ${selectedUser.email}?`)) {
      setToast({
        title: "✓ Password Reset Sent!",
        sub: `A password reset link has been sent to ${selectedUser.email}.`
      });
    }
  };

  const handleSuspendUser = () => {
    if (!selectedUser) return;
    const isSuspended = selectedUser.status === "Inactive";
    const actionText = isSuspended ? "reactivate" : "suspend";
    const confirmMsg = `Are you sure you want to ${actionText} ${selectedUser.name}'s account?`;
    
    if (window.confirm(confirmMsg)) {
      const newStatus = isSuspended ? "Active" : "Inactive";
      const updated = { ...selectedUser, status: newStatus } as User;
      saveUser(updated).then(() => {
        setUserList(list => list.map(u => u.id === selectedUser.id ? updated : u));
        setSelectedUser(updated);
        setToast({
          title: isSuspended ? "✓ Account Reactivated!" : "✓ Account Suspended!",
          sub: `${selectedUser.name}'s account status has been updated to ${newStatus}.`
        });
      });
    }
  };

  const filteredUsers = useMemo(() => {
    return userList.filter(u => {
      const normalizedUserPlan = u.plan.endsWith(" Plan") ? u.plan : `${u.plan === "Growth" ? "Pro" : u.plan} Plan`;
      let matchPlan = planFilter === "All Plans" || normalizedUserPlan === planFilter;
      let matchStatus = statusFilter === "All Status" || u.status === statusFilter;
      let matchSearch = true;
      const term = searchQuery.toLowerCase();
      if (term) {
        matchSearch = u.name.toLowerCase().includes(term) || u.business.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || u.phone.includes(term);
      }
      return matchPlan && matchStatus && matchSearch;
    });
  }, [userList, planFilter, statusFilter, searchQuery]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, planFilter, statusFilter]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setPlanFilter("All Plans");
    setStatusFilter("All Status");
  };

  const hasActiveFilters = searchQuery || planFilter !== "All Plans" || statusFilter !== "All Status";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "var(--color-heading)" }}>User Management</h1>

      {/* ── USER DETAIL FULL-WIDTH INLINE VIEW ── */}
      {selectedUser ? (
        <div className="card-surface overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b" style={{ borderColor: "#E8DCC8", background: "#FCF8F1" }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar name={selectedUser.name} size={72} />
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: "#4E342E" }}>{selectedUser.name}</h2>
                  <div className="text-sm mt-1" style={{ color: "#8D6E63" }}>{selectedUser.business}</div>
                  <div className="mt-2 flex items-center gap-3">
                    <StatusBadge status={selectedUser.status} />
                    <PlanBadge plan={selectedUser.plan} />
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
                style={{ background: "#FCF8F1", border: "1px solid #E8DCC8", color: "#6D4C41" }}
              >
                <ArrowLeft size={16} /> Back to Users
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center px-6 pt-4 gap-8 border-b" style={{ borderColor: "#E8DCC8" }}>
            {["Profile", "Reports & Audits", "Account"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="pb-3 text-sm font-semibold transition-colors"
                style={{
                  color: activeTab === tab ? "#E89D18" : "#A1887F",
                  borderBottom: activeTab === tab ? "2px solid #E89D18" : "2px solid transparent",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "Profile" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact Information */}
                <div>
                  <h3 className="text-base font-semibold mb-4" style={{ color: "#6D4C41" }}>Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl border" style={{ borderColor: "#E8DCC8", background: "#FCF8F1" }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#FFF3D6" }}>
                        <Mail size={18} style={{ color: "#E89D18" }} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold mb-0.5" style={{ color: "#A1887F" }}>Email Address</div>
                        <div className="text-sm font-semibold" style={{ color: "#4E342E" }}>{selectedUser.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl border" style={{ borderColor: "#E8DCC8", background: "#FCF8F1" }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#FFF3D6" }}>
                        <Phone size={18} style={{ color: "#E89D18" }} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold mb-0.5" style={{ color: "#A1887F" }}>Phone Number</div>
                        <div className="text-sm font-semibold" style={{ color: "#4E342E" }}>{selectedUser.phone}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plan Details */}
                <div>
                  <h3 className="text-base font-semibold mb-4" style={{ color: "#6D4C41" }}>Plan Details</h3>
                  <div className="p-5 rounded-xl border" style={{ borderColor: "#E8DCC8", background: "#FCF8F1" }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold" style={{ color: "#4E342E" }}>Current Plan</span>
                      <PlanBadge plan={selectedUser.plan} />
                    </div>
                    <div className="h-px my-3" style={{ background: "#E8DCC8" }} />
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: "#A1887F" }}>Member Since</span>
                      <span className="font-semibold" style={{ color: "#4E342E" }}>{selectedUser.joinedOn}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span style={{ color: "#A1887F" }}>Account Status</span>
                      <StatusBadge status={selectedUser.status} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Reports & Audits" && (
              <div className="space-y-4 max-w-2xl">
                <div className="p-5 rounded-xl border flex items-center justify-between" style={{ borderColor: "#E8DCC8", background: "#FCF8F1" }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#FFF3D6" }}>
                      <FileText size={20} style={{ color: "#E89D18" }} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: "#4E342E" }}>Q2 Marketing Audit</div>
                      <div className="text-xs mt-0.5" style={{ color: "#A1887F" }}>May 10, 2024 · PDF Report</div>
                    </div>
                  </div>
                  <button onClick={() => handleViewDocument("Q2 Marketing Audit")} className="px-4 py-1.5 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity cursor-pointer" style={{ background: "#FFF3D6", border: "1px solid #E89D18", color: "#E89D18" }}>View</button>
                </div>
                <div className="p-5 rounded-xl border flex items-center justify-between" style={{ borderColor: "#E8DCC8", background: "#FCF8F1" }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#FFF3D6" }}>
                      <FileText size={20} style={{ color: "#E89D18" }} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: "#4E342E" }}>SEO Performance Report</div>
                      <div className="text-xs mt-0.5" style={{ color: "#A1887F" }}>Apr 28, 2024 · PDF Report</div>
                    </div>
                  </div>
                  <button onClick={() => handleViewDocument("SEO Performance Report")} className="px-4 py-1.5 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity cursor-pointer" style={{ background: "#FFF3D6", border: "1px solid #E89D18", color: "#E89D18" }}>View</button>
                </div>
              </div>
            )}

            {activeTab === "Account" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                <button onClick={handleResetPassword} className="w-full text-left p-5 rounded-xl border hover:opacity-80 transition-opacity cursor-pointer" style={{ borderColor: "#E8DCC8", background: "#FFFDF8", color: "#6D4C41", fontWeight: 600 }}>
                  Reset Password
                </button>
                <button onClick={handleSuspendUser} className="w-full text-left p-5 rounded-xl border hover:opacity-80 transition-opacity cursor-pointer" style={{ borderColor: selectedUser.status === "Inactive" ? "#4CAF50" : "#EF5350", background: selectedUser.status === "Inactive" ? "#E8F5E9" : "#FEF2F2", color: selectedUser.status === "Inactive" ? "#4CAF50" : "#EF5350", fontWeight: 600 }}>
                  {selectedUser.status === "Inactive" ? "Reactivate Account" : "Suspend Account"}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── USERS TABLE VIEW ── */
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col gap-1 w-full max-w-[280px]">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-subtle)" }} />
                  <input 
                    className="w-full rounded-xl pl-9 pr-8 py-2.5 text-sm outline-none transition-all" 
                    placeholder="Search users..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ background: "#FFFDF8", border: "1px solid #E8DCC8", color: "#4E342E" }}
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
                      <X size={14} style={{ color: "#A1887F" }} onMouseEnter={(e) => e.currentTarget.style.color = "#EF5350"} onMouseLeave={(e) => e.currentTarget.style.color = "#A1887F"} />
                    </button>
                  )}
                </div>
                {hasActiveFilters && (
                  <div style={{ color: "#A1887F", fontSize: "12px", paddingLeft: "4px" }}>
                    Showing {filteredUsers.length} of {userList.length} users
                  </div>
                )}
              </div>

              <div className="relative" ref={planRef}>
                <button 
                  onClick={() => setIsPlanOpen(!isPlanOpen)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors"
                  style={{ background: "#FFFDF8", border: planFilter === "All Plans" ? "1px solid #E8DCC8" : "1px solid #E89D18", color: planFilter === "All Plans" ? "#6D4C41" : "#E89D18" }}
                >
                  {planFilter}
                  <ChevronDown size={14} style={{ transform: isPlanOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms ease" }} />
                </button>
                {isPlanOpen && (
                  <div style={{ background: "#FCF8F1", border: "1px solid #E8DCC8", borderRadius: "16px", padding: "8px", boxShadow: "0 8px 24px rgba(78,52,46,0.10)", minWidth: "200px", position: "absolute", zIndex: 100, marginTop: "4px" }}>
                    {[
                      { label: "All Plans", badge: null },
                      { label: "Basic Plan", badge: { text: "Basic Plan", bg: "#F8F1E7", color: "#6D4C41", border: "1px solid #E8DCC8" } },
                      { label: "Plus Plan", badge: { text: "Plus Plan", bg: "#FFF3D6", color: "#E89D18", border: "1px solid #FFD98A" } },
                      { label: "Pro Plan", badge: { text: "Pro Plan", bg: "#EFF6FF", color: "#3B82F6", border: "1px solid #BFDBFE" } }
                    ].map(opt => {
                      const count = opt.label === "All Plans" 
                        ? userList.length 
                        : userList.filter(u => {
                            const normalized = u.plan.endsWith(" Plan") ? u.plan : `${u.plan === "Growth" ? "Pro" : u.plan} Plan`;
                            return normalized === opt.label;
                          }).length;
                      return (
                        <div 
                          key={opt.label} onClick={() => { setPlanFilter(opt.label); setIsPlanOpen(false); }}
                          style={{ padding: "10px 14px", borderRadius: "10px", color: planFilter === opt.label ? "#E89D18" : "#6D4C41", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", background: planFilter === opt.label ? "#FFF3D6" : "transparent", fontWeight: planFilter === opt.label ? 600 : 400 }}
                          onMouseEnter={(e) => { if (planFilter !== opt.label) { e.currentTarget.style.background = "#FFF3D6"; e.currentTarget.style.color = "#4E342E"; } }}
                          onMouseLeave={(e) => { if (planFilter !== opt.label) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6D4C41"; } }}
                        >
                          <div className="flex items-center gap-2">
                            {opt.label}
                            {planFilter === opt.label ? (
                              <CheckCircle2 size={14} style={{ color: "#E89D18" }} />
                            ) : opt.badge ? (
                              <span style={{ background: opt.badge.bg, color: opt.badge.color, border: opt.badge.border, borderRadius: "999px", padding: "2px 8px", fontSize: "12px", fontWeight: 600 }}>{opt.badge.text}</span>
                            ) : null}
                          </div>
                          <span style={{ color: "#A1887F", fontSize: "12px" }}>{count} user{count !== 1 ? 's' : ''}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="relative" ref={statusRef}>
                <button 
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors"
                  style={{ background: "#FFFDF8", border: statusFilter === "All Status" ? "1px solid #E8DCC8" : "1px solid #E89D18", color: statusFilter === "All Status" ? "#6D4C41" : "#E89D18" }}
                >
                  {statusFilter}
                  <ChevronDown size={14} style={{ transform: isStatusOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms ease" }} />
                </button>
                {isStatusOpen && (
                  <div style={{ background: "#FCF8F1", border: "1px solid #E8DCC8", borderRadius: "16px", padding: "8px", boxShadow: "0 8px 24px rgba(78,52,46,0.10)", minWidth: "200px", position: "absolute", zIndex: 100, marginTop: "4px" }}>
                    {[
                      { label: "All Status", dot: null },
                      { label: "Active", dot: "#4CAF50" },
                      { label: "Trial", dot: "#F4B942" },
                      { label: "Inactive", dot: "#A1887F" }
                    ].map(opt => {
                      const count = opt.label === "All Status" ? userList.length : userList.filter(u => u.status === opt.label).length;
                      return (
                        <div 
                          key={opt.label} onClick={() => { setStatusFilter(opt.label); setIsStatusOpen(false); }}
                          style={{ padding: "10px 14px", borderRadius: "10px", color: statusFilter === opt.label ? "#E89D18" : "#6D4C41", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", background: statusFilter === opt.label ? "#FFF3D6" : "transparent", fontWeight: statusFilter === opt.label ? 600 : 400 }}
                          onMouseEnter={(e) => { if (statusFilter !== opt.label) { e.currentTarget.style.background = "#FFF3D6"; e.currentTarget.style.color = "#4E342E"; } }}
                          onMouseLeave={(e) => { if (statusFilter !== opt.label) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6D4C41"; } }}
                        >
                          <div className="flex items-center gap-2">
                            {opt.label}
                            {statusFilter === opt.label ? (
                              <CheckCircle2 size={14} style={{ color: "#E89D18" }} />
                            ) : opt.dot ? (
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: opt.dot }}></span>
                            ) : null}
                          </div>
                          <span style={{ color: "#A1887F", fontSize: "12px" }}>{count} user{count !== 1 ? 's' : ''}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="text-xs hover:underline" style={{ color: "#E89D18" }}>
                  Clear all filters
                </button>
              )}
              <button onClick={() => setIsAddUserOpen(true)} className="btn-primary inline-flex items-center gap-2">
                <Plus size={16} /> Add User
              </button>
            </div>
          </div>

          <div className="card-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--color-card-secondary)" }}>
                    {["User & Business", "Email", "Contact", "Plan", "Status", "Joined On", "Actions"].map((h) => (
                      <th key={h} className="text-left font-semibold px-5 py-3" style={{ color: "var(--color-title)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-6 h-6 border-2 border-[#E89D18] border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs font-semibold" style={{ color: "#8D6E63" }}>Loading users...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedUsers.length > 0 ? (
                    paginatedUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="transition-colors"
                        style={{ borderTop: "1px solid var(--color-border)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#FFF3D6")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={u.name} size={32} />
                            <div>
                              <div className="font-semibold" style={{ color: "var(--color-heading)" }}>{u.name}</div>
                              <div className="text-xs mt-0.5" style={{ color: "var(--color-subtle)" }}>{u.business}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-body)" }}>
                            <Mail size={14} style={{ color: "var(--color-subtle)" }} /> {u.email}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-body)" }}>
                            <Phone size={14} style={{ color: "var(--color-subtle)" }} /> {u.phone}
                          </div>
                        </td>
                        <td className="px-5 py-3"><PlanBadge plan={u.plan} /></td>
                        <td className="px-5 py-3"><StatusBadge status={u.status} /></td>
                        <td className="px-5 py-3 text-xs" style={{ color: "var(--color-subtle)" }}>{u.joinedOn}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <button onClick={() => { setSelectedUser(u); setActiveTab("Profile"); }} className="hover:opacity-70 cursor-pointer"><Eye size={16} style={{ color: "#6D4C41" }} /></button>
                            <button onClick={() => handleEditClick(u)} className="hover:opacity-70 cursor-pointer"><Edit2 size={16} style={{ color: "#6D4C41" }} /></button>
                            <button onClick={() => handleDeleteUser(u.id)} className="hover:opacity-70 cursor-pointer"><Trash2 size={16} style={{ color: "#A1887F" }} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-12">
                        <div className="flex flex-col items-center justify-center">
                          <SearchX size={32} style={{ color: "#A1887F" }} />
                          <div style={{ color: "#6D4C41", fontSize: "14px", marginTop: "12px", fontWeight: 600 }}>No users found for '{searchQuery}'</div>
                          <div style={{ color: "#A1887F", fontSize: "12px", marginTop: "4px" }}>Try a different name, email or business</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4" style={{ borderTop: "1px solid var(--color-border)" }}>
              <span className="text-xs" style={{ color: "var(--color-subtle)" }}>
                Showing {filteredUsers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer" 
                  style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", color: "var(--color-title)", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className="w-8 h-8 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                    style={p === currentPage
                      ? { background: "var(--color-primary)", color: "var(--color-primary-foreground)" }
                      : { background: "var(--color-card)", border: "1px solid var(--color-border)", color: "var(--color-title)" }}
                  >
                    {p}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer" 
                  style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", color: "var(--color-title)", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── ADD USER MODAL ── */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300" style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(4px)" }} onClick={handleAddClose}>
          <div className="w-full relative transition-all duration-300" style={{ background: "#FCF8F1", borderRadius: "24px", border: "1px solid #E8DCC8", maxWidth: "600px", boxShadow: "0 20px 60px rgba(78,52,46,0.15)", transform: "translateY(0)" }} onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: "#E8DCC8" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FFF3D6" }}>
                  <Plus size={20} style={{ color: "#E89D18" }} />
                </div>
                <h2 className="text-xl font-bold" style={{ color: "#4E342E" }}>Add New User</h2>
              </div>
              <button onClick={handleAddClose} className="hover:opacity-70"><X size={20} style={{ color: "#A1887F" }} /></button>
            </div>
            
            {confirmClose && (
              <div className="m-6 p-4 rounded-xl border flex flex-col gap-3" style={{ background: "#FFF3D6", borderColor: "#E89D18" }}>
                <div>
                  <div className="font-semibold text-[14px]" style={{ color: "#4E342E" }}>Discard changes?</div>
                  <div className="text-[12px]" style={{ color: "#8D6E63" }}>You have unsaved changes that will be lost.</div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setConfirmClose(false)} className="text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity" style={{ color: "#6D4C41", background: "#FCF8F1", border: "1px solid #E8DCC8" }}>Keep Editing</button>
                  <button onClick={() => { setConfirmClose(false); setIsAddUserOpen(false); }} className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white hover:opacity-90 transition-opacity" style={{ background: "#EF5350" }}>Discard</button>
                </div>
              </div>
            )}

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: "Full Name", key: "name", placeholder: "e.g. John Doe" },
                { label: "Business Name", key: "business", placeholder: "Business Inc." },
                { label: "Email Address", key: "email", placeholder: "john@example.com" },
                { label: "Phone Number", key: "phone", placeholder: "+1 (555) 000-0000" },
                { label: "Password", key: "password", placeholder: "Min. 8 characters", type: "password" },
                { label: "Confirm Password", key: "confirmPassword", placeholder: "Confirm password", type: "password" },
              ].map(f => (
                <div key={f.key} className="space-y-1.5">
                  <label className="text-[13px] font-semibold block" style={{ color: "#6D4C41" }}>{f.label}</label>
                  <input 
                    type={f.type || "text"}
                    value={(addForm as any)[f.key]}
                    onChange={(e) => setAddForm({ ...addForm, [f.key]: e.target.value })}
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors" 
                    placeholder={f.placeholder} 
                    style={{ 
                      background: "#FFFDF8", 
                      border: addErrors[f.key] ? "1px solid #EF5350" : "1px solid #E8DCC8",
                      color: "#4E342E"
                    }}
                    onFocus={(e) => {
                      if (addErrors[f.key]) {
                        const newErrs = { ...addErrors };
                        delete newErrs[f.key];
                        setAddErrors(newErrs);
                      }
                      e.target.style.borderColor = addErrors[f.key] ? "#EF5350" : "#E89D18";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = addErrors[f.key] ? "#EF5350" : "#E8DCC8";
                    }}
                  />
                  {addErrors[f.key] && (
                    <div style={{ color: "#EF5350", fontSize: "12px", marginTop: "4px" }}>{addErrors[f.key]}</div>
                  )}
                </div>
              ))}
            </div>
            <div className="p-6 border-t flex items-center justify-end gap-3" style={{ borderColor: "#E8DCC8", background: "#FCF8F1", borderBottomLeftRadius: "24px", borderBottomRightRadius: "24px" }}>
              <button onClick={handleAddClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-80" style={{ background: "#FCF8F1", border: "1px solid #E8DCC8", color: "#6D4C41" }}>Cancel</button>
              <button 
                onClick={handleAddSubmit} 
                disabled={isCreatingUser}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2" 
                style={{ 
                  background: isCreatingUser ? "#D18B0E" : "#E89D18", 
                  color: "white",
                  cursor: isCreatingUser ? "not-allowed" : "pointer",
                  opacity: isCreatingUser ? 0.85 : 1,
                  minWidth: "120px"
                }}
              >
                {isCreatingUser && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isCreatingUser ? "Creating User..." : "Add User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT USER MODAL ── */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(4px)" }} onClick={() => setEditingUser(null)}>
          <div className="w-full" style={{ background: "#FCF8F1", borderRadius: "24px", border: "1px solid #E8DCC8", maxWidth: "560px", padding: "32px", boxShadow: "0 20px 60px rgba(78,52,46,0.15)", width: "90%", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ color: "#4E342E", fontWeight: 700, fontSize: "20px" }}>Edit User</h2>
              <button onClick={() => setEditingUser(null)} className="hover:opacity-70 transition-opacity"><X size={20} style={{ color: "#8D6E63" }} onMouseEnter={(e) => e.currentTarget.style.color = "#EF5350"} onMouseLeave={(e) => e.currentTarget.style.color = "#8D6E63"} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label style={{ color: "#6D4C41", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Full Name*</label>
                <input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} style={{ background: "#FFFDF8", border: editErrors.name ? "1px solid #EF5350" : "1px solid #E8DCC8", borderRadius: "12px", padding: "10px 14px", color: "#4E342E", width: "100%", outline: "none" }} onFocus={(e) => { if (!editErrors.name) e.target.style.borderColor = "#E89D18" }} onBlur={(e) => { if (!editErrors.name) e.target.style.borderColor = "#E8DCC8" }} />
                {editErrors.name && <div style={{ color: "#EF5350", fontSize: "12px", marginTop: "4px" }}>{editErrors.name}</div>}
              </div>
              <div>
                <label style={{ color: "#6D4C41", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Business Name*</label>
                <input value={editForm.business} onChange={(e) => setEditForm({...editForm, business: e.target.value})} style={{ background: "#FFFDF8", border: editErrors.business ? "1px solid #EF5350" : "1px solid #E8DCC8", borderRadius: "12px", padding: "10px 14px", color: "#4E342E", width: "100%", outline: "none" }} onFocus={(e) => { if (!editErrors.business) e.target.style.borderColor = "#E89D18" }} onBlur={(e) => { if (!editErrors.business) e.target.style.borderColor = "#E8DCC8" }} />
                {editErrors.business && <div style={{ color: "#EF5350", fontSize: "12px", marginTop: "4px" }}>{editErrors.business}</div>}
              </div>
              <div>
                <label style={{ color: "#6D4C41", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Email Address*</label>
                <input value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} style={{ background: "#FFFDF8", border: editErrors.email ? "1px solid #EF5350" : "1px solid #E8DCC8", borderRadius: "12px", padding: "10px 14px", color: "#4E342E", width: "100%", outline: "none" }} onFocus={(e) => { if (!editErrors.email) e.target.style.borderColor = "#E89D18" }} onBlur={(e) => { if (!editErrors.email) e.target.style.borderColor = "#E8DCC8" }} />
                {editErrors.email && <div style={{ color: "#EF5350", fontSize: "12px", marginTop: "4px" }}>{editErrors.email}</div>}
              </div>
              <div>
                <label style={{ color: "#6D4C41", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Phone Number*</label>
                <input value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} style={{ background: "#FFFDF8", border: editErrors.phone ? "1px solid #EF5350" : "1px solid #E8DCC8", borderRadius: "12px", padding: "10px 14px", color: "#4E342E", width: "100%", outline: "none" }} onFocus={(e) => { if (!editErrors.phone) e.target.style.borderColor = "#E89D18" }} onBlur={(e) => { if (!editErrors.phone) e.target.style.borderColor = "#E8DCC8" }} />
                {editErrors.phone && <div style={{ color: "#EF5350", fontSize: "12px", marginTop: "4px" }}>{editErrors.phone}</div>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ color: "#6D4C41", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Industry</label>
                  <select value={editForm.industry || "E-commerce"} onChange={(e) => setEditForm({...editForm, industry: e.target.value})} style={{ background: "#FFFDF8", border: "1px solid #E8DCC8", borderRadius: "12px", padding: "10px 14px", color: "#4E342E", width: "100%", outline: "none" }}>
                    <option>E-commerce</option><option>Retail</option><option>Healthcare</option><option>Agency</option><option>Real Estate</option><option>Technology</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: "#6D4C41", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Plan</label>
                  <select value={editForm.plan} onChange={(e) => setEditForm({...editForm, plan: e.target.value})} style={{ background: "#FFFDF8", border: "1px solid #E8DCC8", borderRadius: "12px", padding: "10px 14px", color: "#4E342E", width: "100%", outline: "none" }}>
                    <option>Basic Plan</option><option>Plus Plan</option><option>Pro Plan</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ color: "#6D4C41", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Website URL</label>
                <input value={editForm.website || ""} placeholder="https://" onChange={(e) => setEditForm({...editForm, website: e.target.value})} style={{ background: "#FFFDF8", border: "1px solid #E8DCC8", borderRadius: "12px", padding: "10px 14px", color: "#4E342E", width: "100%", outline: "none" }} onFocus={(e) => e.target.style.borderColor = "#E89D18"} onBlur={(e) => e.target.style.borderColor = "#E8DCC8"} />
              </div>

              <div>
                <label style={{ color: "#6D4C41", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Status</label>
                <select value={editForm.status} onChange={(e) => setEditForm({...editForm, status: e.target.value})} style={{ background: "#FFFDF8", border: "1px solid #E8DCC8", borderRadius: "12px", padding: "10px 14px", color: "#4E342E", width: "100%", outline: "none" }}>
                  <option>Active</option><option>Trial</option><option>Inactive</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ color: "#6D4C41", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>New Password</label>
                  <input type="password" placeholder="Leave blank to keep current" value={editForm.newPassword || ""} onChange={(e) => setEditForm({...editForm, newPassword: e.target.value})} style={{ background: "#FFFDF8", border: "1px solid #E8DCC8", borderRadius: "12px", padding: "10px 14px", color: "#4E342E", width: "100%", outline: "none" }} onFocus={(e) => e.target.style.borderColor = "#E89D18"} onBlur={(e) => e.target.style.borderColor = "#E8DCC8"} />
                </div>
                <div>
                  <label style={{ color: "#6D4C41", fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>Confirm Password</label>
                  <input type="password" value={editForm.confirmPassword || ""} onChange={(e) => setEditForm({...editForm, confirmPassword: e.target.value})} style={{ background: "#FFFDF8", border: editErrors.confirmPassword ? "1px solid #EF5350" : "1px solid #E8DCC8", borderRadius: "12px", padding: "10px 14px", color: "#4E342E", width: "100%", outline: "none" }} onFocus={(e) => { if (!editErrors.confirmPassword) e.target.style.borderColor = "#E89D18" }} onBlur={(e) => { if (!editErrors.confirmPassword) e.target.style.borderColor = "#E8DCC8" }} />
                  {editErrors.confirmPassword && <div style={{ color: "#EF5350", fontSize: "12px", marginTop: "4px" }}>{editErrors.confirmPassword}</div>}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 flex justify-end gap-3" style={{ borderTop: "1px solid #E8DCC8" }}>
              <button onClick={() => setEditingUser(null)} className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity" style={{ background: "#FCF8F1", border: "1px solid #E8DCC8", color: "#6D4C41" }}>Cancel</button>
              <button onClick={handleEditSubmit} className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity" style={{ background: "#E89D18", color: "white" }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] px-5 py-3.5 rounded-xl shadow-lg transition-all animate-in fade-in slide-in-from-bottom-5 duration-300 flex items-center gap-2.5" style={{ background: "#E8F5E9", border: "1px solid #4CAF50", borderLeft: "4px solid #4CAF50", boxShadow: "0 4px 12px rgba(76,175,80,0.15)" }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#4CAF50] text-white shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div className="flex flex-col">
            <div style={{ color: "#4CAF50", fontWeight: 600, fontSize: "14px" }}>{toast.title}</div>
            {toast.sub && <div style={{ color: "#8D6E63", fontSize: "12px", marginTop: "2px" }}>{toast.sub}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
