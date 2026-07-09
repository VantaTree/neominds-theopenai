import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  X,
  FileText,
  Eye,
  ArrowLeft,
  ChevronDown,
  SearchX,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo, Fragment } from "react";
import { Avatar, PlanBadge, StatusBadge } from "@/components/admin/shared";
import {
  getUsersFn,
  saveUserFn,
  deleteUserFn,
  getBusinessesFn,
  saveBusinessFn,
  setAdminClaimFn,
} from "@/lib/server-functions";
import { AdminLoader } from "@/components/AdminLoader";
import type { User as DBUser, Business as DBBusiness } from "@/lib/schemas";

export const Route = createFileRoute("/_admin/admin/users")({
  head: () => ({ meta: [{ title: "Users — GrowConsult AI" }] }),
  loader: async () => {
    try {
      const [users, businesses] = await Promise.all([
        getUsersFn(),
        getBusinessesFn(),
      ]);
      return { users, businesses };
    } catch (err) {
      console.error("Loader failed to fetch users/businesses data:", err);
      return { users: [], businesses: [] };
    }
  },
  pendingComponent: AdminLoader,
  pendingMs: 0,
  component: UsersPage,
});

interface MappedUser {
  id: string;
  name: string;
  business: string;
  email: string;
  phone: string;
  plan: string;
  status: string;
  role: string;
  joinedOn: string;
  createdAt: any;
  associatedBusinesses: DBBusiness[];
  industry?: string;
  website?: string;
  image?: string;
}

function UsersPage() {
  const { users: initialUsers, businesses: initialBusinesses } = Route.useLoaderData();
  const [users, setUsers] = useState<DBUser[]>(initialUsers);
  const [businesses, setBusinesses] = useState<DBBusiness[]>(initialBusinesses);

  useEffect(() => {
    setUsers(initialUsers);
    setBusinesses(initialBusinesses);
  }, [initialUsers, initialBusinesses]);

  const [expandedUserIds, setExpandedUserIds] = useState<Set<string>>(new Set());
  const [selectedUser, setSelectedUser] = useState<MappedUser | null>(null);
  const [activeTab, setActiveTab] = useState("Profile");
  const [roleTab, setRoleTab] = useState<"clients" | "admins">("clients");

  const [editingUser, setEditingUser] = useState<MappedUser | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editForm, setEditForm] = useState<any>({});
  const [toast, setToast] = useState<{ title: string; sub?: string } | null>(null);

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    business: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [confirmClose, setConfirmClose] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

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
      if (planRef.current && !planRef.current.contains(e.target as Node))
        setIsPlanOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target as Node))
        setIsStatusOpen(false);
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

  // Map users and businesses from DB structure to clean UI mapped structure
  const mappedUsers = useMemo<MappedUser[]>(() => {
    return users.map((u) => {
      const userBizs = businesses.filter(
        (b) => (typeof b.userId === "string" ? b.userId : b.userId?.id) === u.id
      );
      const mainBiz = userBizs[0];
      const plan = mainBiz ? `${mainBiz.plan || "Basic"} Plan` : "Basic Plan";
      return {
        id: u.id,
        name: u.fullName || "",
        business: mainBiz ? mainBiz.businessName : "No business",
        email: u.email,
        phone: u.phone || "",
        plan,
        status: u.status || "Active",
        role: u.role || "client",
        joinedOn: u.createdAt
          ? new Date(u.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "",
        createdAt: u.createdAt,
        associatedBusinesses: userBizs,
        industry: mainBiz ? mainBiz.businessType : "Consulting",
        website: mainBiz ? mainBiz.websiteUrl : "",
        image: u.image,
      };
    });
  }, [users, businesses]);

  const filteredUsers = useMemo(() => {
    return mappedUsers.filter((u) => {
      const rawUser = users.find(ru => ru.id === u.id);
      const isRoleMatch = roleTab === "admins" ? (rawUser?.role === "admin") : (rawUser?.role !== "admin");
      if (!isRoleMatch) return false;

      const normalizedUserPlan = u.plan.endsWith(" Plan")
        ? u.plan
        : `${u.plan === "Growth" ? "Pro" : u.plan} Plan`;
      const matchPlan =
        planFilter === "All Plans" || normalizedUserPlan === planFilter;
      const matchStatus =
        statusFilter === "All Status" || u.status === statusFilter;
      let matchSearch = true;
      const term = searchQuery.toLowerCase();
      if (term) {
        matchSearch =
          u.name.toLowerCase().includes(term) ||
          u.business.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.phone.includes(term);
      }
      return matchPlan && matchStatus && matchSearch;
    });
  }, [mappedUsers, planFilter, statusFilter, searchQuery, roleTab, users]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, planFilter, statusFilter]);

  const toggleUserExpanded = (userId: string) => {
    setExpandedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedUserIds(new Set(filteredUsers.map((u) => u.id)));
  };

  const collapseAll = () => {
    setExpandedUserIds(new Set());
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setPlanFilter("All Plans");
    setStatusFilter("All Status");
  };

  const hasActiveFilters =
    searchQuery || planFilter !== "All Plans" || statusFilter !== "All Status";

  const handleAddSubmit = () => {
    const errs: Record<string, string> = {};
    if (!addForm.name.trim()) errs.name = "Full name is required";
    if (!addForm.business.trim()) errs.business = "Business name is required";
    if (!addForm.email.trim()) errs.email = "Email address is required";
    else if (!/^\S+@\S+\.\S+$/.test(addForm.email))
      errs.email = "Please enter a valid email";
    else if (users.some((u) => u.email.toLowerCase() === addForm.email.toLowerCase()))
      errs.email = "This email is already registered";

    if (!addForm.phone.trim()) errs.phone = "Phone number is required";
    if (!addForm.password) errs.password = "Password is required";
    else if (addForm.password.length < 8)
      errs.password = "Password must be at least 8 characters";
    if (!addForm.confirmPassword)
      errs.confirmPassword = "Please confirm your password";
    else if (addForm.password !== addForm.confirmPassword)
      errs.confirmPassword = "Passwords do not match";

    if (Object.keys(errs).length > 0) {
      setAddErrors(errs);
      return;
    }

    setIsCreatingUser(true);
    const userId = `usr_${Date.now()}`;
    const isNewUserAdmin = roleTab === "admins";
    const newUserSchema: DBUser = {
      id: userId,
      fullName: addForm.name,
      email: addForm.email,
      phone: addForm.phone,
      role: isNewUserAdmin ? "admin" : "client",
      status: "Active",
      businessCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const newBusinessSchema: DBBusiness = {
      id: `biz_${userId}`,
      userId: userId,
      plan: "Basic",
      addons: [],
      businessName: addForm.business,
      businessType: "Consulting",
      contactEmail: addForm.email,
      contactPhone: addForm.phone,
      websiteUrl: "",
      paymentStatus: "Paid",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let claimPromise = Promise.resolve({ success: true });
    if (isNewUserAdmin) {
      claimPromise = setAdminClaimFn({ data: { uid: userId, isAdmin: true } })
        .catch(err => {
          console.error("Failed to assign admin claims:", err);
          return { success: false };
        });
    }

    Promise.all([
      claimPromise,
      saveUserFn({ data: newUserSchema }),
      saveBusinessFn({ data: newBusinessSchema }),
    ]).then(() => {
      setIsCreatingUser(false);
      setIsAddUserOpen(false);
      setUsers((prev) => [newUserSchema, ...prev]);
      setBusinesses((prev) => [newBusinessSchema, ...prev]);
      setAddForm({
        name: "",
        business: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      setToast({
        title: "✓ User created successfully!",
        sub: `${addForm.name} has been added to the platform.`,
      });
    });
  };

  const handleAddClose = () => {
    if (Object.values(addForm).some((v) => v.trim() !== "")) {
      setConfirmClose(true);
    } else {
      setIsAddUserOpen(false);
    }
  };

  const handleEditClick = (u: MappedUser) => {
    setEditingUser(u);
    const normalizedPlan = u.plan.endsWith(" Plan")
      ? u.plan
      : `${u.plan === "Growth" ? "Pro" : u.plan} Plan`;
    setEditForm({
      ...u,
      plan: normalizedPlan,
      newPassword: "",
      confirmPassword: "",
    });
    setEditErrors({});
  };

  const handleEditSubmit = () => {
    const errs: Record<string, string> = {};
    if (!editForm.name?.trim()) errs.name = "Full Name is required.";
    if (!editForm.business?.trim())
      errs.business = "Business Name is required.";
    if (!editForm.email?.trim()) errs.email = "Email Address is required.";
    if (!editForm.phone?.trim()) errs.phone = "Phone Number is required.";
    if (
      editForm.newPassword &&
      editForm.newPassword !== editForm.confirmPassword
    ) {
      errs.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }

    const userId = editingUser!.id;
    const userSchemaData: DBUser = {
      id: userId,
      fullName: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      status: editForm.status as any,
      role: editForm.role as any,
      businessCount: users.find((u) => u.id === userId)?.businessCount || 1,
      createdAt: users.find((u) => u.id === userId)?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    const matchedBiz = businesses.find(
      (b) => (typeof b.userId === "string" ? b.userId : b.userId?.id) === userId
    );
    const bizId = matchedBiz ? matchedBiz.id : `biz_${userId}`;
    const parsedPlan = editForm.plan.replace(" Plan", "") as any;
    const businessSchemaData: DBBusiness = {
      id: bizId,
      userId: userId,
      plan: parsedPlan,
      addons: matchedBiz ? matchedBiz.addons : [],
      businessName: editForm.business,
      businessType: editForm.industry || "Consulting",
      contactEmail: editForm.email,
      contactPhone: editForm.phone,
      websiteUrl: editForm.website || "",
      paymentStatus: matchedBiz ? matchedBiz.paymentStatus : "Paid",
      createdAt: matchedBiz ? matchedBiz.createdAt : new Date(),
      updatedAt: new Date(),
    };

    const prevUser = users.find((u) => u.id === userId);
    const wasAdmin = prevUser?.role === "admin";
    const isAdminNow = editForm.role === "admin";

    let claimPromise = Promise.resolve({ success: true });
    if (wasAdmin !== isAdminNow) {
      claimPromise = setAdminClaimFn({ data: { uid: userId, isAdmin: isAdminNow } })
        .catch(err => {
          console.error("Failed to update Firebase custom claims:", err);
          return { success: false };
        });
    }

    Promise.all([
      claimPromise,
      saveUserFn({ data: userSchemaData }),
      saveBusinessFn({ data: businessSchemaData }),
    ]).then(() => {
      setUsers((prev) => prev.map((u) => (u.id === userId ? userSchemaData : u)));
      setBusinesses((prev) =>
        prev.map((b) => (b.id === bizId ? businessSchemaData : b))
      );
      if (selectedUser?.id === userId) {
        setSelectedUser({
          ...selectedUser,
          name: editForm.name,
          business: editForm.business,
          email: editForm.email,
          phone: editForm.phone,
          plan: editForm.plan,
          status: editForm.status,
          role: editForm.role,
          industry: editForm.industry,
          website: editForm.website,
        });
      }
      setEditingUser(null);
      setToast({ title: "✓ User updated successfully!" });
    });
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    if (window.confirm(`Are you sure you want to delete ${user.fullName}?`)) {
      deleteUserFn({ data: userId }).then(() => {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setBusinesses((prev) =>
          prev.filter((b) => (typeof b.userId === "string" ? b.userId : b.userId?.id) !== userId)
        );
        if (selectedUser?.id === userId) {
          setSelectedUser(null);
        }
        setToast({
          title: "✓ User deleted successfully!",
          sub: `${user.fullName} has been removed.`,
        });
      });
    }
  };

  const handleViewDocument = (name: string) => {
    setToast({
      title: `✓ Opening ${name}...`,
      sub: "This document is now being generated/downloaded.",
    });
    const blob = new Blob([`Dummy PDF content for ${name}`], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name.endsWith(".pdf")
      ? name
      : `${name.replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetPassword = () => {
    if (!selectedUser) return;
    if (
      window.confirm(
        `Are you sure you want to send a password reset link to ${selectedUser.email}?`
      )
    ) {
      setToast({
        title: "✓ Password Reset Sent!",
        sub: `A password reset link has been sent to ${selectedUser.email}.`,
      });
    }
  };

  const handleSuspendUser = () => {
    if (!selectedUser) return;
    const userObj = users.find((u) => u.id === selectedUser.id);
    if (!userObj) return;
    const isSuspended = userObj.status === "Inactive" || userObj.status === "Suspended";
    const actionText = isSuspended ? "reactivate" : "suspend";
    const confirmMsg = `Are you sure you want to ${actionText} ${selectedUser.name}'s account?`;

    if (window.confirm(confirmMsg)) {
      const newStatus = isSuspended ? "Active" : "Inactive";
      const updatedUser: DBUser = {
        ...userObj,
        status: newStatus,
        updatedAt: new Date(),
      };
      saveUserFn({ data: updatedUser }).then(() => {
        setUsers((list) =>
          list.map((u) => (u.id === selectedUser.id ? updatedUser : u))
        );
        setSelectedUser((prev) => (prev ? { ...prev, status: newStatus } : null));
        setToast({
          title: isSuspended ? "✓ Account Reactivated!" : "✓ Account Suspended!",
          sub: `${selectedUser.name}'s account status has been updated to ${newStatus}.`,
        });
      });
    }
  };

  const formatLastActivity = (dateVal: any) => {
    if (!dateVal) return "N/A";
    const date = new Date(dateVal);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) {
      return "Just now";
    } else if (diffDays === 2) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--color-mm-dark)" }}
          >
            User Management
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-mm-gray)" }}>
            Review and manage platform users and their associated business ventures.
          </p>
        </div>

        {/* Expand/Collapse All triggers */}
        {!selectedUser && (
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-mm-gray self-start md:self-center">
            <button
              onClick={expandAll}
              className="hover:text-mm-orange transition-colors cursor-pointer"
            >
              Expand All
            </button>
            <span className="text-mm-border">|</span>
            <button
              onClick={collapseAll}
              className="hover:text-mm-orange transition-colors cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        )}
      </div>

      {/* ── USER DETAIL FULL-WIDTH INLINE VIEW ── */}
      {selectedUser ? (
        <div className="bg-white border border-mm-border rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
          {/* Header */}
          <div
            className="p-6 border-b"
            style={{
              borderColor: "var(--color-mm-border)",
              background: "white",
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {selectedUser.image ? (
                  <img
                    src={selectedUser.image}
                    alt={selectedUser.name}
                    className="rounded-full object-cover shrink-0"
                    style={{ width: 72, height: 72 }}
                  />
                ) : (
                  <Avatar name={selectedUser.name} size={72} />
                )}
                <div>
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: "var(--color-mm-dark)" }}
                  >
                    {selectedUser.name}
                  </h2>
                  <div
                    className="text-sm mt-1"
                    style={{ color: "var(--color-mm-gray)" }}
                  >
                    {selectedUser.business}
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <StatusBadge status={selectedUser.status} />
                    <PlanBadge plan={selectedUser.plan.replace(" Plan", "")} />
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
                style={{
                  background: "white",
                  border: "1px solid var(--color-mm-border)",
                  color: "var(--color-mm-gray)",
                }}
              >
                <ArrowLeft size={16} /> Back to Users
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div
            className="flex items-center px-6 pt-4 gap-8 border-b"
            style={{ borderColor: "var(--color-mm-border)" }}
          >
            {["Profile", "Reports & Audits", "Account"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="pb-3 text-sm font-semibold transition-colors cursor-pointer"
                style={{
                  color:
                    activeTab === tab
                      ? "var(--color-mm-orange)"
                      : "var(--color-mm-gray)",
                  borderBottom:
                    activeTab === tab
                      ? "2px solid var(--color-mm-orange)"
                      : "2px solid transparent",
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
                  <h3
                    className="text-base font-semibold mb-4"
                    style={{ color: "var(--color-mm-gray)" }}
                  >
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div
                      className="flex items-center gap-4 p-4 rounded-xl border"
                      style={{
                        borderColor: "var(--color-mm-border)",
                        background: "white",
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center animate-pulse"
                        style={{ background: "rgba(224, 86, 36, 0.1)" }}
                      >
                        <Mail
                          size={18}
                          style={{ color: "var(--color-mm-orange)" }}
                        />
                      </div>
                      <div>
                        <div
                          className="text-xs font-semibold mb-0.5"
                          style={{ color: "var(--color-mm-gray)" }}
                        >
                          Email Address
                        </div>
                        <div
                          className="text-sm font-semibold"
                          style={{ color: "var(--color-mm-dark)" }}
                        >
                          {selectedUser.email}
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-4 p-4 rounded-xl border"
                      style={{
                        borderColor: "var(--color-mm-border)",
                        background: "white",
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(224, 86, 36, 0.1)" }}
                      >
                        <Phone
                          size={18}
                          style={{ color: "var(--color-mm-orange)" }}
                        />
                      </div>
                      <div>
                        <div
                          className="text-xs font-semibold mb-0.5"
                          style={{ color: "var(--color-mm-gray)" }}
                        >
                          Phone Number
                        </div>
                        <div
                          className="text-sm font-semibold"
                          style={{ color: "var(--color-mm-dark)" }}
                        >
                          {selectedUser.phone || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plan Details */}
                <div>
                  <h3
                    className="text-base font-semibold mb-4"
                    style={{ color: "var(--color-mm-gray)" }}
                  >
                    Plan Details
                  </h3>
                  <div
                    className="p-5 rounded-xl border"
                    style={{
                      borderColor: "var(--color-mm-border)",
                      background: "white",
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="font-semibold"
                        style={{ color: "var(--color-mm-dark)" }}
                      >
                        Current Plan
                      </span>
                      <PlanBadge plan={selectedUser.plan.replace(" Plan", "")} />
                    </div>
                    <div
                      className="h-px my-3"
                      style={{ background: "var(--color-mm-border)" }}
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: "var(--color-mm-gray)" }}>
                        Member Since
                      </span>
                      <span
                        className="font-semibold"
                        style={{ color: "var(--color-mm-dark)" }}
                      >
                        {selectedUser.joinedOn}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span style={{ color: "var(--color-mm-gray)" }}>
                        Account Status
                      </span>
                      <StatusBadge status={selectedUser.status} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Reports & Audits" && (
              <div className="space-y-4 max-w-2xl">
                <div
                  className="p-5 rounded-xl border flex items-center justify-between"
                  style={{
                    borderColor: "var(--color-mm-border)",
                    background: "white",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(224, 86, 36, 0.1)" }}
                    >
                      <FileText
                        size={20}
                        style={{ color: "var(--color-mm-orange)" }}
                      />
                    </div>
                    <div>
                      <div
                        className="font-semibold text-sm"
                        style={{ color: "var(--color-mm-dark)" }}
                      >
                        Q2 Marketing Audit
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: "var(--color-mm-gray)" }}
                      >
                        May 10, 2024 · PDF Report
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewDocument("Q2 Marketing Audit")}
                    className="px-4 py-1.5 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity cursor-pointer animate-pulse"
                    style={{
                      background: "rgba(224, 86, 36, 0.1)",
                      border: "1px solid var(--color-mm-orange)",
                      color: "var(--color-mm-orange)",
                    }}
                  >
                    View
                  </button>
                </div>
                <div
                  className="p-5 rounded-xl border flex items-center justify-between"
                  style={{
                    borderColor: "var(--color-mm-border)",
                    background: "white",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(224, 86, 36, 0.1)" }}
                    >
                      <FileText
                        size={20}
                        style={{ color: "var(--color-mm-orange)" }}
                      />
                    </div>
                    <div>
                      <div
                        className="font-semibold text-sm"
                        style={{ color: "var(--color-mm-dark)" }}
                      >
                        SEO Performance Report
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: "var(--color-mm-gray)" }}
                      >
                        Apr 28, 2024 · PDF Report
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewDocument("SEO Performance Report")}
                    className="px-4 py-1.5 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity cursor-pointer"
                    style={{
                      background: "rgba(224, 86, 36, 0.1)",
                      border: "1px solid var(--color-mm-orange)",
                      color: "var(--color-mm-orange)",
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            )}

            {activeTab === "Account" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                <button
                  onClick={handleResetPassword}
                  className="w-full text-left p-5 rounded-xl border hover:opacity-80 transition-opacity cursor-pointer"
                  style={{
                    borderColor: "var(--color-mm-border)",
                    background: "white",
                    color: "var(--color-mm-gray)",
                    fontWeight: 600,
                  }}
                >
                  Reset Password
                </button>
                <button
                  onClick={handleSuspendUser}
                  className="w-full text-left p-5 rounded-xl border hover:opacity-80 transition-opacity cursor-pointer"
                  style={{
                    borderColor:
                      selectedUser.status === "Inactive" || selectedUser.status === "Suspended"
                        ? "var(--color-mm-green)"
                        : "var(--color-mm-red)",
                    background:
                      selectedUser.status === "Inactive" || selectedUser.status === "Suspended"
                        ? "rgba(92, 177, 62, 0.1)"
                        : "rgba(224, 86, 36, 0.1)",
                    color:
                      selectedUser.status === "Inactive" || selectedUser.status === "Suspended"
                        ? "var(--color-mm-green)"
                        : "var(--color-mm-red)",
                    fontWeight: 600,
                  }}
                >
                  {selectedUser.status === "Inactive" || selectedUser.status === "Suspended"
                    ? "Reactivate Account"
                    : "Suspend Account"}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── USERS TABLE VIEW ── */
        <>
          {/* Role Tab Selector */}
          <div
            className="flex border-b mb-6 gap-6"
            style={{ borderColor: "var(--color-mm-border)" }}
          >
            <button
              onClick={() => setRoleTab("clients")}
              className="pb-3 text-sm font-semibold px-2 transition-all cursor-pointer"
              style={{
                color: roleTab === "clients" ? "var(--color-mm-orange)" : "var(--color-mm-gray)",
                borderBottom: roleTab === "clients" ? "2px solid var(--color-mm-orange)" : "2px solid transparent",
              }}
            >
              Clients ({users.filter(u => u.role !== "admin").length})
            </button>
            <button
              onClick={() => setRoleTab("admins")}
              className="pb-3 text-sm font-semibold px-2 transition-all cursor-pointer"
              style={{
                color: roleTab === "admins" ? "var(--color-mm-orange)" : "var(--color-mm-gray)",
                borderBottom: roleTab === "admins" ? "2px solid var(--color-mm-orange)" : "2px solid transparent",
              }}
            >
              Administrators ({users.filter(u => u.role === "admin").length})
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col gap-1 w-full max-w-[280px]">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--color-mm-gray)" }}
                  />
                  <input
                    className="w-full rounded-xl pl-9 pr-8 py-2.5 text-sm outline-none transition-all"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      background: "white",
                      border: "1px solid var(--color-mm-border)",
                      color: "var(--color-mm-dark)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--color-mm-orange)";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(232,157,24,0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--color-mm-border)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X
                        size={14}
                        style={{ color: "var(--color-mm-gray)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "var(--color-mm-red)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "var(--color-mm-gray)")
                        }
                      />
                    </button>
                  )}
                </div>
                {hasActiveFilters && (
                  <div
                    style={{
                      color: "var(--color-mm-gray)",
                      fontSize: "12px",
                      paddingLeft: "4px",
                    }}
                  >
                    Showing {filteredUsers.length} of {mappedUsers.length} users
                  </div>
                )}
              </div>

              <div className="relative" ref={planRef}>
                <button
                  onClick={() => setIsPlanOpen(!isPlanOpen)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
                  style={{
                    background: "white",
                    border:
                      planFilter === "All Plans"
                        ? "1px solid var(--color-mm-border)"
                        : "1px solid var(--color-mm-orange)",
                    color:
                      planFilter === "All Plans"
                        ? "var(--color-mm-gray)"
                        : "var(--color-mm-orange)",
                  }}
                >
                  {planFilter}
                  <ChevronDown
                    size={14}
                    style={{
                      transform: isPlanOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 150ms ease",
                    }}
                  />
                </button>
                {isPlanOpen && (
                  <div
                    style={{
                      background: "white",
                      border: "1px solid var(--color-mm-border)",
                      borderRadius: "16px",
                      padding: "8px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                      minWidth: "200px",
                      position: "absolute",
                      zIndex: 100,
                      marginTop: "4px",
                    }}
                  >
                    {[
                      { label: "All Plans", badge: null },
                      {
                        label: "Basic Plan",
                        badge: {
                          text: "Basic Plan",
                          bg: "var(--color-mm-subtle)",
                          color: "var(--color-mm-gray)",
                          border: "1px solid var(--color-mm-border)",
                        },
                      },
                      {
                        label: "Plus Plan",
                        badge: {
                          text: "Plus Plan",
                          bg: "rgba(224, 86, 36, 0.1)",
                          color: "var(--color-mm-orange)",
                          border: "1px solid rgba(224, 86, 36, 0.2)",
                        },
                      },
                      {
                        label: "Pro Plan",
                        badge: {
                          text: "Pro Plan",
                          bg: "rgba(59, 130, 246, 0.1)",
                          color: "var(--color-mm-blue)",
                          border: "1px solid rgba(59, 130, 246, 0.2)",
                        },
                      },
                    ].map((opt) => {
                      const count =
                        opt.label === "All Plans"
                          ? mappedUsers.length
                          : mappedUsers.filter((u) => {
                              const normalized = u.plan.endsWith(" Plan")
                                ? u.plan
                                : `${u.plan === "Growth" ? "Pro" : u.plan} Plan`;
                              return normalized === opt.label;
                            }).length;
                      return (
                        <div
                          key={opt.label}
                          onClick={() => {
                            setPlanFilter(opt.label);
                            setIsPlanOpen(false);
                          }}
                          style={{
                            padding: "10px 14px",
                            borderRadius: "10px",
                            color:
                              planFilter === opt.label
                                ? "var(--color-mm-orange)"
                                : "var(--color-mm-gray)",
                            fontSize: "14px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background:
                              planFilter === opt.label
                                ? "rgba(224, 86, 36, 0.1)"
                                : "transparent",
                            fontWeight: planFilter === opt.label ? 600 : 400,
                          }}
                          onMouseEnter={(e) => {
                            if (planFilter !== opt.label) {
                              e.currentTarget.style.background =
                                "rgba(224, 86, 36, 0.1)";
                              e.currentTarget.style.color =
                                "var(--color-mm-dark)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (planFilter !== opt.label) {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color =
                                "var(--color-mm-gray)";
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {opt.label}
                            {planFilter === opt.label ? (
                              <CheckCircle2
                                size={14}
                                style={{ color: "var(--color-mm-orange)" }}
                              />
                            ) : opt.badge ? (
                              <span
                                style={{
                                  background: opt.badge.bg,
                                  color: opt.badge.color,
                                  border: opt.badge.border,
                                  borderRadius: "999px",
                                  padding: "2px 8px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                }}
                              >
                                {opt.badge.text}
                              </span>
                            ) : null}
                          </div>
                          <span
                            style={{
                              color: "var(--color-mm-gray)",
                              fontSize: "12px",
                            }}
                          >
                            {count} user{count !== 1 ? "s" : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="relative" ref={statusRef}>
                <button
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
                  style={{
                    background: "white",
                    border:
                      statusFilter === "All Status"
                        ? "1px solid var(--color-mm-border)"
                        : "1px solid var(--color-mm-orange)",
                    color:
                      statusFilter === "All Status"
                        ? "var(--color-mm-gray)"
                        : "var(--color-mm-orange)",
                  }}
                >
                  {statusFilter}
                  <ChevronDown
                    size={14}
                    style={{
                      transform: isStatusOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 150ms ease",
                    }}
                  />
                </button>
                {isStatusOpen && (
                  <div
                    style={{
                      background: "white",
                      border: "1px solid var(--color-mm-border)",
                      borderRadius: "16px",
                      padding: "8px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                      minWidth: "200px",
                      position: "absolute",
                      zIndex: 100,
                      marginTop: "4px",
                    }}
                  >
                    {[
                      { label: "All Status", dot: null },
                      { label: "Active", dot: "var(--color-mm-green)" },
                      { label: "Trial", dot: "var(--color-mm-orange)" },
                      { label: "Inactive", dot: "var(--color-mm-gray)" },
                    ].map((opt) => {
                      const count =
                        opt.label === "All Status"
                          ? mappedUsers.length
                          : mappedUsers.filter((u) => u.status === opt.label)
                              .length;
                      return (
                        <div
                          key={opt.label}
                          onClick={() => {
                            setStatusFilter(opt.label);
                            setIsStatusOpen(false);
                          }}
                          style={{
                            padding: "10px 14px",
                            borderRadius: "10px",
                            color:
                              statusFilter === opt.label
                                ? "var(--color-mm-orange)"
                                : "var(--color-mm-gray)",
                            fontSize: "14px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background:
                              statusFilter === opt.label
                                ? "rgba(224, 86, 36, 0.1)"
                                : "transparent",
                            fontWeight: statusFilter === opt.label ? 600 : 400,
                          }}
                          onMouseEnter={(e) => {
                            if (statusFilter !== opt.label) {
                              e.currentTarget.style.background =
                                "rgba(224, 86, 36, 0.1)";
                              e.currentTarget.style.color =
                                "var(--color-mm-dark)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (statusFilter !== opt.label) {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color =
                                "var(--color-mm-gray)";
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {opt.label}
                            {statusFilter === opt.label ? (
                              <CheckCircle2
                                size={14}
                                style={{ color: "var(--color-mm-orange)" }}
                              />
                            ) : opt.dot ? (
                              <span
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  background: opt.dot,
                                }}
                              ></span>
                            ) : null}
                          </div>
                          <span
                            style={{
                              color: "var(--color-mm-gray)",
                              fontSize: "12px",
                            }}
                          >
                            {count} user{count !== 1 ? "s" : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs hover:underline cursor-pointer"
                  style={{ color: "var(--color-mm-orange)" }}
                >
                  Clear all filters
                </button>
              )}
              <button
                onClick={() => setIsAddUserOpen(true)}
                className="px-4 py-2 bg-mm-orange hover:bg-mm-orange/95 text-white font-semibold rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus size={16} /> Add User
              </button>
            </div>
          </div>

          <div className="bg-white border border-mm-border rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="bg-mm-subtle border-b border-mm-border text-mm-gray font-semibold">
                    <th className="w-10"></th>
                    {[
                      "User & Email",
                      "Phone",
                      "Status",
                      "No. of Businesses",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left font-semibold px-5 py-3"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((u) => {
                      const isExpanded = expandedUserIds.has(u.id);
                      return (
                        <Fragment key={u.id}>
                          <tr
                            className="transition-colors hover:bg-mm-subtle cursor-pointer"
                            onClick={() => toggleUserExpanded(u.id)}
                            style={{ borderTop: "1px solid var(--color-mm-border)" }}
                          >
                            <td className="pl-4 py-4 text-center">
                              <span className="text-mm-gray hover:text-mm-orange transition-colors">
                                <ChevronDown
                                  size={18}
                                  style={{
                                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "transform 150ms ease",
                                  }}
                                />
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                {u.image ? (
                                  <img
                                    src={u.image}
                                    alt={u.name}
                                    className="rounded-full object-cover shrink-0"
                                    style={{ width: 36, height: 36 }}
                                  />
                                ) : (
                                  <Avatar name={u.name} size={36} />
                                )}
                                <div>
                                  <div
                                    className="font-semibold text-mm-dark"
                                  >
                                    {u.name}
                                  </div>
                                  <a
                                    href={`mailto:${u.email}`}
                                    className="text-xs text-mm-gray hover:text-mm-orange hover:underline block"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {u.email}
                                  </a>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-mm-gray" onClick={(e) => e.stopPropagation()}>
                              {u.phone ? (
                                <a
                                  href={`tel:${u.phone}`}
                                  className="hover:text-mm-orange hover:underline"
                                >
                                  {u.phone}
                                </a>
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <StatusBadge status={u.status} />
                            </td>
                            <td className="px-5 py-4 font-semibold text-mm-dark">
                              {u.associatedBusinesses.length} {u.associatedBusinesses.length === 1 ? "Business" : "Businesses"}
                            </td>
                            <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setActiveTab("Profile");
                                  }}
                                  className="hover:text-mm-orange transition-colors cursor-pointer"
                                >
                                  <Eye
                                    size={16}
                                    style={{ color: "var(--color-mm-gray)" }}
                                  />
                                </button>
                                <button
                                  onClick={() => handleEditClick(u)}
                                  className="hover:text-mm-orange transition-colors cursor-pointer"
                                >
                                  <Edit2
                                    size={16}
                                    style={{ color: "var(--color-mm-gray)" }}
                                  />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="hover:text-mm-red transition-colors cursor-pointer"
                                >
                                  <Trash2
                                    size={16}
                                    style={{ color: "var(--color-mm-gray)" }}
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={6} className="bg-[#FAF9F6] px-10 py-5" style={{ borderTop: "1px solid var(--color-mm-border)" }}>
                                <div className="space-y-3">
                                  <h4 className="text-sm font-bold text-mm-dark">Associated Businesses</h4>
                                  {u.associatedBusinesses.length === 0 ? (
                                    <div className="text-xs text-mm-gray">No business accounts associated with this user.</div>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-xs min-w-[700px]">
                                        <thead>
                                          <tr className="text-mm-gray border-b border-mm-border pb-2 text-left font-semibold">
                                            <th className="pb-2 font-semibold">BUSINESS NAME</th>
                                            <th className="pb-2 font-semibold">TYPE / INDUSTRY</th>
                                            <th className="pb-2 font-semibold">WEBSITE</th>
                                            <th className="pb-2 font-semibold">CONTACT PHONE</th>
                                            <th className="pb-2 font-semibold">PLAN</th>
                                            <th className="pb-2 font-semibold">PAYMENT STATUS</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {u.associatedBusinesses.map((b) => (
                                            <tr key={b.id} className="text-mm-dark border-b border-mm-subtle last:border-0">
                                              <td className="py-2.5 font-medium">
                                                <div className="flex items-center gap-2.5">
                                                  {b.image ? (
                                                    <img
                                                      src={b.image}
                                                      alt={b.businessName}
                                                      className="w-8 h-8 rounded-full object-cover shrink-0"
                                                    />
                                                  ) : (
                                                    <Avatar name={b.businessName} size={32} />
                                                  )}
                                                  <div>
                                                    <div className="font-semibold text-mm-dark">{b.businessName}</div>
                                                    {b.contactEmail ? (
                                                      <a
                                                        href={`mailto:${b.contactEmail}`}
                                                        className="text-[10px] text-mm-gray hover:text-mm-orange hover:underline block"
                                                        onClick={(e) => e.stopPropagation()}
                                                      >
                                                        {b.contactEmail}
                                                      </a>
                                                    ) : (
                                                      <div className="text-[10px] text-mm-gray">No email</div>
                                                    )}
                                                  </div>
                                                </div>
                                              </td>
                                              <td className="py-2.5 text-mm-gray">{b.businessType || "Consulting"}</td>
                                              <td className="py-2.5 text-mm-gray">
                                                {b.websiteUrl ? (
                                                  <a
                                                    href={b.websiteUrl.startsWith("http") ? b.websiteUrl : `https://${b.websiteUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-mm-orange hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                  >
                                                    {b.websiteUrl}
                                                  </a>
                                                ) : (
                                                  "N/A"
                                                )}
                                              </td>
                                              <td className="py-2.5 text-mm-gray" onClick={(e) => e.stopPropagation()}>
                                                {b.contactPhone ? (
                                                  <a
                                                    href={`tel:${b.contactPhone}`}
                                                    className="hover:text-mm-orange hover:underline"
                                                  >
                                                    {b.contactPhone}
                                                  </a>
                                                ) : (
                                                  "N/A"
                                                )}
                                              </td>
                                              <td className="py-2.5">
                                                <PlanBadge plan={b.plan} />
                                              </td>
                                              <td className="py-2.5">
                                                <StatusBadge status={b.paymentStatus} />
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-12">
                        <div className="flex flex-col items-center justify-center">
                          <SearchX
                            size={32}
                            style={{ color: "var(--color-mm-gray)" }}
                          />
                          <div
                            style={{
                              color: "var(--color-mm-gray)",
                              fontSize: "14px",
                              marginTop: "12px",
                              fontWeight: 600,
                            }}
                          >
                            No users found for '{searchQuery}'
                          </div>
                          <div
                            style={{
                              color: "var(--color-mm-gray)",
                              fontSize: "12px",
                              marginTop: "4px",
                            }}
                          >
                            Try a different name, email or business
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              style={{ borderTop: "1px solid var(--color-mm-border)" }}
            >
              <span
                className="text-xs"
                style={{ color: "var(--color-mm-gray)" }}
              >
                Showing{" "}
                {filteredUsers.length === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}{" "}
                to {Math.min(currentPage * itemsPerPage, filteredUsers.length)}{" "}
                of {filteredUsers.length} users
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
                  style={{
                    background: "white",
                    border: "1px solid var(--color-mm-border)",
                    color: "var(--color-mm-gray)",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className="w-8 h-8 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                      style={
                        p === currentPage
                          ? {
                              background: "var(--color-mm-orange)",
                              color: "white",
                            }
                          : {
                              background: "white",
                              border: "1px solid var(--color-mm-border)",
                              color: "var(--color-mm-gray)",
                            }
                      }
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
                  style={{
                    background: "white",
                    border: "1px solid var(--color-mm-border)",
                    color: "var(--color-mm-gray)",
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                  }}
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
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300"
          style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(4px)" }}
          onClick={handleAddClose}
        >
          <div
            className="w-full relative transition-all duration-300"
            style={{
              background: "white",
              borderRadius: "24px",
              border: "1px solid var(--color-mm-border)",
              maxWidth: "600px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              transform: "translateY(0)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="p-6 border-b flex justify-between items-center"
              style={{ borderColor: "var(--color-mm-border)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(224, 86, 36, 0.1)" }}
                >
                  <Plus size={20} style={{ color: "var(--color-mm-orange)" }} />
                </div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: "var(--color-mm-dark)" }}
                >
                  Add New User
                </h2>
              </div>
              <button onClick={handleAddClose} className="hover:opacity-70 cursor-pointer">
                <X size={20} style={{ color: "var(--color-mm-gray)" }} />
              </button>
            </div>

            {confirmClose && (
              <div
                className="m-6 p-4 rounded-xl border flex flex-col gap-3"
                style={{
                  background: "rgba(224, 86, 36, 0.1)",
                  borderColor: "var(--color-mm-orange)",
                }}
              >
                <div>
                  <div
                    className="font-semibold text-[14px]"
                    style={{ color: "var(--color-mm-dark)" }}
                  >
                    Discard changes?
                  </div>
                  <div
                    className="text-[12px]"
                    style={{ color: "var(--color-mm-gray)" }}
                  >
                    You have unsaved changes that will be lost.
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setConfirmClose(false)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
                    style={{
                      color: "var(--color-mm-gray)",
                      background: "white",
                      border: "1px solid var(--color-mm-border)",
                    }}
                  >
                    Keep Editing
                  </button>
                  <button
                    onClick={() => {
                      setConfirmClose(false);
                      setIsAddUserOpen(false);
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white hover:opacity-90 transition-opacity cursor-pointer"
                    style={{ background: "var(--color-mm-red)" }}
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  label: "Full Name",
                  key: "name",
                  placeholder: "e.g. John Doe",
                },
                {
                  label: "Business Name",
                  key: "business",
                  placeholder: "Business Inc.",
                },
                {
                  label: "Email Address",
                  key: "email",
                  placeholder: "john@example.com",
                },
                {
                  label: "Phone Number",
                  key: "phone",
                  placeholder: "+1 (555) 000-0000",
                },
                {
                  label: "Password",
                  key: "password",
                  placeholder: "Min. 8 characters",
                  type: "password",
                },
                {
                  label: "Confirm Password",
                  key: "confirmPassword",
                  placeholder: "Confirm password",
                  type: "password",
                },
              ].map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <label
                    className="text-[13px] font-semibold block"
                    style={{ color: "var(--color-mm-gray)" }}
                  >
                    {f.label}
                  </label>
                  <input
                    type={f.type || "text"}
                    value={(addForm as any)[f.key]}
                    onChange={(e) =>
                      setAddForm({ ...addForm, [f.key]: e.target.value })
                    }
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors"
                    placeholder={f.placeholder}
                    style={{
                      background: "white",
                      border: addErrors[f.key]
                        ? "1px solid var(--color-mm-red)"
                        : "1px solid var(--color-mm-border)",
                      color: "var(--color-mm-dark)",
                    }}
                    onFocus={(e) => {
                      if (addErrors[f.key]) {
                        const newErrs = { ...addErrors };
                        delete newErrs[f.key];
                        setAddErrors(newErrs);
                      }
                      e.target.style.borderColor = addErrors[f.key]
                        ? "var(--color-mm-red)"
                        : "var(--color-mm-orange)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = addErrors[f.key]
                        ? "var(--color-mm-red)"
                        : "var(--color-mm-border)";
                    }}
                  />
                  {addErrors[f.key] && (
                    <div
                      style={{
                        color: "var(--color-mm-red)",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {addErrors[f.key]}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div
              className="p-6 border-t flex items-center justify-end gap-3"
              style={{
                borderColor: "var(--color-mm-border)",
                background: "white",
                borderBottomLeftRadius: "24px",
                borderBottomRightRadius: "24px",
              }}
            >
              <button
                onClick={handleAddClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-80 cursor-pointer"
                style={{
                  background: "white",
                  border: "1px solid var(--color-mm-border)",
                  color: "var(--color-mm-gray)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubmit}
                disabled={isCreatingUser}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  background: "var(--color-mm-orange)",
                  color: "white",
                  cursor: isCreatingUser ? "not-allowed" : "pointer",
                  opacity: isCreatingUser ? 0.7 : 1,
                  minWidth: "120px",
                }}
              >
                {isCreatingUser && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
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
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(4px)" }}
          onClick={() => setEditingUser(null)}
        >
          <div
            className="w-full"
            style={{
              background: "white",
              borderRadius: "24px",
              border: "1px solid var(--color-mm-border)",
              maxWidth: "560px",
              padding: "32px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                style={{
                  color: "var(--color-mm-dark)",
                  fontWeight: 700,
                  fontSize: "20px",
                }}
              >
                Edit User
              </h2>
              <button
                onClick={() => setEditingUser(null)}
                className="hover:opacity-70 transition-opacity cursor-pointer"
              >
                <X
                  size={20}
                  style={{ color: "var(--color-mm-gray)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--color-mm-red)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--color-mm-gray)")
                  }
                />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  style={{
                    color: "var(--color-mm-gray)",
                    fontWeight: 600,
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Full Name*
                </label>
                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  style={{
                    background: "white",
                    border: editErrors.name
                      ? "1px solid var(--color-mm-red)"
                      : "1px solid var(--color-mm-border)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    color: "var(--color-mm-dark)",
                    width: "100%",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    if (!editErrors.name)
                      e.target.style.borderColor = "var(--color-mm-orange)";
                  }}
                  onBlur={(e) => {
                    if (!editErrors.name)
                      e.target.style.borderColor = "var(--color-mm-border)";
                  }}
                />
                {editErrors.name && (
                  <div
                    style={{
                      color: "var(--color-mm-red)",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    {editErrors.name}
                  </div>
                )}
              </div>
              <div>
                <label
                  style={{
                    color: "var(--color-mm-gray)",
                    fontWeight: 600,
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Business Name*
                </label>
                <input
                  value={editForm.business}
                  onChange={(e) =>
                    setEditForm({ ...editForm, business: e.target.value })
                  }
                  style={{
                    background: "white",
                    border: editErrors.business
                      ? "1px solid var(--color-mm-red)"
                      : "1px solid var(--color-mm-border)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    color: "var(--color-mm-dark)",
                    width: "100%",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    if (!editErrors.business)
                      e.target.style.borderColor = "var(--color-mm-orange)";
                  }}
                  onBlur={(e) => {
                    if (!editErrors.business)
                      e.target.style.borderColor = "var(--color-mm-border)";
                  }}
                />
                {editErrors.business && (
                  <div
                    style={{
                      color: "var(--color-mm-red)",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    {editErrors.business}
                  </div>
                )}
              </div>
              <div>
                <label
                  style={{
                    color: "var(--color-mm-gray)",
                    fontWeight: 600,
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Email Address*
                </label>
                <input
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  style={{
                    background: "white",
                    border: editErrors.email
                      ? "1px solid var(--color-mm-red)"
                      : "1px solid var(--color-mm-border)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    color: "var(--color-mm-dark)",
                    width: "100%",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    if (!editErrors.email)
                      e.target.style.borderColor = "var(--color-mm-orange)";
                  }}
                  onBlur={(e) => {
                    if (!editErrors.email)
                      e.target.style.borderColor = "var(--color-mm-border)";
                  }}
                />
                {editErrors.email && (
                  <div
                    style={{
                      color: "var(--color-mm-red)",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    {editErrors.email}
                  </div>
                )}
              </div>
              <div>
                <label
                  style={{
                    color: "var(--color-mm-gray)",
                    fontWeight: 600,
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Phone Number*
                </label>
                <input
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  style={{
                    background: "white",
                    border: editErrors.phone
                      ? "1px solid var(--color-mm-red)"
                      : "1px solid var(--color-mm-border)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    color: "var(--color-mm-dark)",
                    width: "100%",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    if (!editErrors.phone)
                      e.target.style.borderColor = "var(--color-mm-orange)";
                  }}
                  onBlur={(e) => {
                    if (!editErrors.phone)
                      e.target.style.borderColor = "var(--color-mm-border)";
                  }}
                />
                {editErrors.phone && (
                  <div
                    style={{
                      color: "var(--color-mm-red)",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    {editErrors.phone}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    style={{
                      color: "var(--color-mm-gray)",
                      fontWeight: 600,
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Industry
                  </label>
                  <select
                    value={editForm.industry || "E-commerce"}
                    onChange={(e) =>
                      setEditForm({ ...editForm, industry: e.target.value })
                    }
                    style={{
                      background: "white",
                      border: "1px solid var(--color-mm-border)",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      color: "var(--color-mm-dark)",
                      width: "100%",
                      outline: "none",
                    }}
                  >
                    <option>E-commerce</option>
                    <option>Retail</option>
                    <option>Healthcare</option>
                    <option>Agency</option>
                    <option>Real Estate</option>
                    <option>Technology</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      color: "var(--color-mm-gray)",
                      fontWeight: 600,
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Plan
                  </label>
                  <select
                    value={editForm.plan}
                    onChange={(e) =>
                      setEditForm({ ...editForm, plan: e.target.value })
                    }
                    style={{
                      background: "white",
                      border: "1px solid var(--color-mm-border)",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      color: "var(--color-mm-dark)",
                      width: "100%",
                      outline: "none",
                    }}
                  >
                    <option>Basic Plan</option>
                    <option>Plus Plan</option>
                    <option>Pro Plan</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  style={{
                    color: "var(--color-mm-gray)",
                    fontWeight: 600,
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Website URL
                </label>
                <input
                  value={editForm.website || ""}
                  placeholder="https://"
                  onChange={(e) =>
                    setEditForm({ ...editForm, website: e.target.value })
                  }
                  style={{
                    background: "white",
                    border: "1px solid var(--color-mm-border)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    color: "var(--color-mm-dark)",
                    width: "100%",
                    outline: "none",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--color-mm-orange)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--color-mm-border)")
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    color: "var(--color-mm-gray)",
                    fontWeight: 600,
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  style={{
                    background: "white",
                    border: "1px solid var(--color-mm-border)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    color: "var(--color-mm-dark)",
                    width: "100%",
                    outline: "none",
                  }}
                >
                  <option>Active</option>
                  <option>Trial</option>
                  <option>Inactive</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    color: "var(--color-mm-gray)",
                    fontWeight: 600,
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Role
                </label>
                <select
                  value={editForm.role || "client"}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value })
                  }
                  style={{
                    background: "white",
                    border: "1px solid var(--color-mm-border)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    color: "var(--color-mm-dark)",
                    width: "100%",
                    outline: "none",
                  }}
                >
                  <option value="client">Client</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    style={{
                      color: "var(--color-mm-gray)",
                      fontWeight: 600,
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={editForm.newPassword || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, newPassword: e.target.value })
                    }
                    style={{
                      background: "white",
                      border: "1px solid var(--color-mm-border)",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      color: "var(--color-mm-dark)",
                      width: "100%",
                      outline: "none",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--color-mm-orange)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "var(--color-mm-border)")
                    }
                  />
                </div>
                <div>
                  <label
                    style={{
                      color: "var(--color-mm-gray)",
                      fontWeight: 600,
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={editForm.confirmPassword || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    style={{
                      background: "white",
                      border: editErrors.confirmPassword
                        ? "1px solid var(--color-mm-red)"
                        : "1px solid var(--color-mm-border)",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      color: "var(--color-mm-dark)",
                      width: "100%",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      if (!editErrors.confirmPassword)
                        e.target.style.borderColor = "var(--color-mm-orange)";
                    }}
                    onBlur={(e) => {
                      if (!editErrors.confirmPassword)
                        e.target.style.borderColor = "var(--color-mm-border)";
                    }}
                  />
                  {editErrors.confirmPassword && (
                    <div
                      style={{
                        color: "var(--color-mm-red)",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {editErrors.confirmPassword}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              className="mt-6 pt-4 flex justify-end gap-3"
              style={{ borderTop: "1px solid var(--color-mm-border)" }}
            >
              <button
                onClick={() => setEditingUser(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity cursor-pointer"
                style={{
                  background: "white",
                  border: "1px solid var(--color-mm-border)",
                  color: "var(--color-mm-gray)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                style={{ background: "var(--color-mm-orange)", color: "white" }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="fixed bottom-6 right-6 z-100 px-5 py-3.5 rounded-xl shadow-lg transition-all animate-in fade-in slide-in-from-bottom-5 duration-300 flex items-center gap-2.5"
          style={{
            background: "rgba(92, 177, 62, 0.1)",
            border: "1px solid var(--color-mm-green)",
            borderLeft: "4px solid var(--color-mm-green)",
            boxShadow: "0 4px 12px rgba(76,175,80,0.15)",
          }}
        >
          <div className="w-5 h-5 rounded-full flex items-center justify-center bg-mm-green text-white shrink-0">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div className="flex flex-col">
            <div
              style={{
                color: "var(--color-mm-green)",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              {toast.title}
            </div>
            {toast.sub && (
              <div
                style={{
                  color: "var(--color-mm-gray)",
                  fontSize: "12px",
                  marginTop: "2px",
                }}
              >
                {toast.sub}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
