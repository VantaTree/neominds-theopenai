import { createFileRoute, Link } from "@tanstack/react-router";
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
  Camera,
  User,
  MessageSquare,
  Loader2,
  MoreVertical,
  Key,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo, Fragment } from "react";
import { Avatar, PlanBadge, StatusBadge } from "@/components/admin/shared";
import { uploadFileToStorage, sendPasswordResetEmailFn } from "@/lib/firebase";
import {
  getUsersFn,
  saveUserFn,
  deleteUserFn,
  getBusinessesFn,
  saveBusinessFn,
  deleteBusinessFn,
  getReportsFn,
  setAdminClaimFn,
} from "@/lib/server-functions";
import { AdminLoader } from "@/components/AdminLoader";
import type { User as DBUser, Business as DBBusiness } from "@/lib/schemas";

export const Route = createFileRoute("/_admin/admin/users")({
  head: () => ({ meta: [{ title: "Users — GrowConsult AI" }] }),
  loader: async () => {
    try {
      const [users, businesses, reports] = await Promise.all([
        getUsersFn(),
        getBusinessesFn(),
        getReportsFn(),
      ]);
      return { users, businesses, reports };
    } catch (err) {
      console.error("Loader failed to fetch users/businesses/reports data:", err);
      return { users: [], businesses: [], reports: [] };
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
  const { users: initialUsers, businesses: initialBusinesses, reports: initialReports = [] } =
    Route.useLoaderData();
  const [users, setUsers] = useState<DBUser[]>(initialUsers);
  const [businesses, setBusinesses] = useState<DBBusiness[]>(initialBusinesses);
  const [reports, setReports] = useState<any[]>(initialReports);

  useEffect(() => {
    setUsers(initialUsers);
    setBusinesses(initialBusinesses);
    setReports(initialReports);
  }, [initialUsers, initialBusinesses, initialReports]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingUserAvatar, setIsUploadingUserAvatar] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingUser) {
      setIsUploadingUserAvatar(true);
      try {
        const url = await uploadFileToStorage(
          file,
          "users",
          editingUser.id,
          "profileImg",
          editingUser.image || undefined
        );
        setEditForm((prev: any) => ({ ...prev, image: url }));
      } catch (err: any) {
        console.error("Failed to upload avatar:", err);
        alert(err.message || "Failed to upload avatar");
      } finally {
        setIsUploadingUserAvatar(false);
      }
    }
  };

  const [expandedUserIds, setExpandedUserIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedUser, setSelectedUser] = useState<MappedUser | null>(null);
  const [activeTab, setActiveTab] = useState("Profile");
  const [roleTab, setRoleTab] = useState<"clients" | "admins">("clients");

  const [editingUser, setEditingUser] = useState<MappedUser | null>(null);
  const [editingBusiness, setEditingBusiness] = useState<DBBusiness | null>(
    null,
  );
  const [editBusinessForm, setEditBusinessForm] = useState<any>({});
  const [editBusinessErrors, setEditBusinessErrors] = useState<
    Record<string, string>
  >({});
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);
  const businessFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingBusinessLogo, setIsUploadingBusinessLogo] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<DBBusiness | null>(null);
  const [isDeletingBusiness, setIsDeletingBusiness] = useState(false);

  const handleBusinessAvatarClick = () => {
    businessFileInputRef.current?.click();
  };

  const handleBusinessFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file && editingBusiness) {
      setIsUploadingBusinessLogo(true);
      try {
        const url = await uploadFileToStorage(
          file,
          "businesses",
          editingBusiness.id,
          "businessImg",
          editingBusiness.image || undefined
        );
        setEditBusinessForm((prev: any) => ({ ...prev, image: url }));
      } catch (err: any) {
        console.error("Failed to upload logo:", err);
        alert(err.message || "Failed to upload logo");
      } finally {
        setIsUploadingBusinessLogo(false);
      }
    }
  };

  const handleEditBusinessClick = (b: DBBusiness) => {
    setEditingBusiness(b);
    setEditBusinessForm({ ...b });
    setEditBusinessErrors({});
  };
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editForm, setEditForm] = useState<any>({});
  const [toast, setToast] = useState<{ title: string; sub?: string } | null>(
    null,
  );
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; left: number } | null>(null);

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

      const target = e.target as HTMLElement;
      if (openDropdownId && !target.closest(".actions-dropdown-container")) {
        setOpenDropdownId(null);
      }
    }

    function handleScrollOrResize() {
      setOpenDropdownId(null);
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [openDropdownId]);

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
        (b) =>
          (typeof b.userId === "string" ? b.userId : b.userId?.id) === u.id,
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
      const rawUser = users.find((ru) => ru.id === u.id);
      const isRoleMatch =
        roleTab === "admins"
          ? rawUser?.role === "admin"
          : rawUser?.role !== "admin";
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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / itemsPerPage),
  );

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

  const handleEditClick = (u: MappedUser) => {
    setEditingUser(u);
    const normalizedPlan = u.plan.endsWith(" Plan")
      ? u.plan
      : `${u.plan === "Growth" ? "Pro" : u.plan} Plan`;
    setEditForm({
      ...u,
      plan: normalizedPlan,
    });
    setEditErrors({});
  };

  const handleEditSubmit = () => {
    // const errs: Record<string, string> = {};
    // if (!editForm.name?.trim()) errs.name = "Full Name is required.";
    // if (!editForm.business?.trim())
    //   errs.business = "Business Name is required.";
    // if (!editForm.email?.trim()) errs.email = "Email Address is required.";
    // if (!editForm.phone?.trim()) errs.phone = "Phone Number is required.";
    // if (
    //   editForm.newPassword &&
    //   editForm.newPassword !== editForm.confirmPassword
    // ) {
    //   errs.confirmPassword = "Passwords do not match.";
    // }

    // if (Object.keys(errs).length > 0) {
    //   setEditErrors(errs);
    //   return;
    // }

    const userId = editingUser!.id;
    const userSchemaData: DBUser = {
      id: userId,
      fullName: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      status: editForm.status as any,
      role: editingUser!.role as any,
      image: editForm.image || null,
      businessCount: users.find((u) => u.id === userId)?.businessCount || 1,
      createdAt: users.find((u) => u.id === userId)?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    const matchedBiz = businesses.find(
      (b) =>
        (typeof b.userId === "string" ? b.userId : b.userId?.id) === userId,
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
      websiteUrl: editForm.website || null,
      paymentStatus: matchedBiz ? matchedBiz.paymentStatus : "Paid",
      createdAt: matchedBiz ? matchedBiz.createdAt : new Date(),
      updatedAt: new Date(),
    };

    Promise.all([
      saveUserFn({ data: userSchemaData }),
      saveBusinessFn({ data: businessSchemaData }),
    ]).then(() => {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? userSchemaData : u)),
      );
      setBusinesses((prev) =>
        prev.map((b) => (b.id === bizId ? businessSchemaData : b)),
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
          role: editingUser!.role,
          industry: editForm.industry,
          website: editForm.website,
          image: editForm.image,
        });
      }
      setEditingUser(null);
      setToast({ title: "✓ User updated successfully!" });
    });
  };

  const handleEditBusinessSubmit = () => {
    const errs: Record<string, string> = {};
    if (!editBusinessForm.businessName?.trim()) {
      errs.businessName = "Business name is required";
    }
    if (
      editBusinessForm.contactEmail &&
      !/^\S+@\S+\.\S+$/.test(editBusinessForm.contactEmail)
    ) {
      errs.contactEmail = "Please enter a valid email";
    }

    if (Object.keys(errs).length > 0) {
      setEditBusinessErrors(errs);
      return;
    }

    setIsSavingBusiness(true);
    const updatedBiz: DBBusiness = {
      ...editingBusiness!,
      businessName: editBusinessForm.businessName,
      businessType: editBusinessForm.businessType || "",
      websiteUrl: editBusinessForm.websiteUrl || "",
      contactPhone: editBusinessForm.contactPhone || "",
      contactEmail: editBusinessForm.contactEmail || null,
      plan: editBusinessForm.plan || "None",
      paymentStatus: editBusinessForm.paymentStatus || "Pending",
      image: editBusinessForm.image || "",
      updatedAt: new Date(),
    };

    saveBusinessFn({ data: updatedBiz })
      .then(() => {
        setIsSavingBusiness(false);
        setEditingBusiness(null);
        setBusinesses((prev) =>
          prev.map((b) => (b.id === updatedBiz.id ? updatedBiz : b)),
        );
        if (selectedUser) {
          const updatedBizs = selectedUser.associatedBusinesses.map((b) =>
            b.id === updatedBiz.id ? updatedBiz : b,
          );
          const primaryBiz = updatedBizs[0];
          const newPlan = primaryBiz
            ? `${primaryBiz.plan || "Basic"} Plan`
            : "Basic Plan";
          setSelectedUser({
            ...selectedUser,
            business: primaryBiz ? primaryBiz.businessName : "No business",
            plan: newPlan,
            associatedBusinesses: updatedBizs,
          });
        }
        setToast({ title: "✓ Business updated successfully!" });
      })
      .catch((err) => {
        console.error("Failed to save business:", err);
        setIsSavingBusiness(false);
        setToast({ title: "✗ Failed to update business" });
      });
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    if (window.confirm(`Are you sure you want to delete ${user.fullName}?`)) {
      deleteUserFn({ data: userId }).then(() => {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setBusinesses((prev) =>
          prev.filter(
            (b) =>
              (typeof b.userId === "string" ? b.userId : b.userId?.id) !==
              userId,
          ),
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

  const handleDeleteBusiness = () => {
    if (!businessToDelete) return;
    const bizId = businessToDelete.id;
    const bizName = businessToDelete.businessName;
    setIsDeletingBusiness(true);
    deleteBusinessFn({ data: bizId })
      .then(() => {
        setBusinesses((prev) => prev.filter((b) => b.id !== bizId));
        if (selectedUser) {
          const updatedBizs = selectedUser.associatedBusinesses.filter(
            (b) => b.id !== bizId,
          );
          const primaryBiz = updatedBizs[0];
          const newPlan = primaryBiz
            ? `${primaryBiz.plan || "Basic"} Plan`
            : "Basic Plan";
          setSelectedUser({
            ...selectedUser,
            business: primaryBiz ? primaryBiz.businessName : "No business",
            plan: newPlan,
            associatedBusinesses: updatedBizs,
          });
        }
        setToast({
          title: "✓ Business deleted successfully!",
          sub: `${bizName} has been removed.`,
        });
        setBusinessToDelete(null);
      })
      .catch((err: any) => {
        console.error("Failed to delete business:", err);
        setToast({
          title: "✗ Failed to delete business",
          sub: err.message || "An error occurred.",
        });
      })
      .finally(() => {
        setIsDeletingBusiness(false);
      });
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

  const handleResetPassword = (email?: string) => {
    const targetEmail = email || selectedUser?.email;
    if (!targetEmail) return;
    if (
      window.confirm(
        `Are you sure you want to send a password reset link to ${targetEmail}?`,
      )
    ) {
      sendPasswordResetEmailFn(targetEmail)
        .then(() => {
          setToast({
            title: "✓ Password Reset Sent!",
            sub: `A password reset link has been sent to ${targetEmail}.`,
          });
        })
        .catch((err) => {
          console.error("Failed to send password reset email:", err);
          alert(err.message || "Failed to send password reset email");
        });
    }
  };

  const handleSuspendUser = () => {
    if (!selectedUser) return;
    const userObj = users.find((u) => u.id === selectedUser.id);
    if (!userObj) return;
    const isSuspended =
      userObj.status === "Inactive" || userObj.status === "Suspended";
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
          list.map((u) => (u.id === selectedUser.id ? updatedUser : u)),
        );
        setSelectedUser((prev) =>
          prev ? { ...prev, status: newStatus } : null,
        );
        setToast({
          title: isSuspended
            ? "✓ Account Reactivated!"
            : "✓ Account Suspended!",
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
            Review and manage platform users and their associated business
            ventures.
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
                {selectedUser.image &&
                selectedUser.image.trim() !== "" &&
                selectedUser.image !== "undefined" &&
                selectedUser.image !== "null" ? (
                  <img
                    src={selectedUser.image}
                    alt={selectedUser.name}
                    className="rounded-full object-cover aspect-square shrink-0"
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
                      <PlanBadge
                        plan={selectedUser.plan.replace(" Plan", "")}
                      />
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
                  onClick={() => handleResetPassword()}
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
                      selectedUser.status === "Inactive" ||
                      selectedUser.status === "Suspended"
                        ? "var(--color-mm-green)"
                        : "var(--color-mm-red)",
                    background:
                      selectedUser.status === "Inactive" ||
                      selectedUser.status === "Suspended"
                        ? "rgba(92, 177, 62, 0.1)"
                        : "rgba(224, 86, 36, 0.1)",
                    color:
                      selectedUser.status === "Inactive" ||
                      selectedUser.status === "Suspended"
                        ? "var(--color-mm-green)"
                        : "var(--color-mm-red)",
                    fontWeight: 600,
                  }}
                >
                  {selectedUser.status === "Inactive" ||
                  selectedUser.status === "Suspended"
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
                color:
                  roleTab === "clients"
                    ? "var(--color-mm-orange)"
                    : "var(--color-mm-gray)",
                borderBottom:
                  roleTab === "clients"
                    ? "2px solid var(--color-mm-orange)"
                    : "2px solid transparent",
              }}
            >
              Clients ({users.filter((u) => u.role !== "admin").length})
            </button>
            <button
              onClick={() => setRoleTab("admins")}
              className="pb-3 text-sm font-semibold px-2 transition-all cursor-pointer"
              style={{
                color:
                  roleTab === "admins"
                    ? "var(--color-mm-orange)"
                    : "var(--color-mm-gray)",
                borderBottom:
                  roleTab === "admins"
                    ? "2px solid var(--color-mm-orange)"
                    : "2px solid transparent",
              }}
            >
              Administrators ({users.filter((u) => u.role === "admin").length})
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
                      { label: "Inactive", dot: "var(--color-mm-gray)" },
                      { label: "Suspended", dot: "var(--color-mm-red)" },
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
                      <th key={h} className="text-left font-semibold px-5 py-3">
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
                            style={{
                              borderTop: "1px solid var(--color-mm-border)",
                            }}
                          >
                            <td className="pl-4 py-4 text-center">
                              <span className="text-mm-gray hover:text-mm-orange transition-colors">
                                <ChevronDown
                                  size={18}
                                  style={{
                                    transform: isExpanded
                                      ? "rotate(180deg)"
                                      : "rotate(0deg)",
                                    transition: "transform 150ms ease",
                                  }}
                                />
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                {u.image &&
                                u.image.trim() !== "" &&
                                u.image !== "undefined" &&
                                u.image !== "null" ? (
                                  <img
                                    src={u.image}
                                    alt={u.name}
                                    className="rounded-full object-cover aspect-square shrink-0"
                                    style={{ width: 36, height: 36 }}
                                  />
                                ) : (
                                  <Avatar name={u.name} size={36} />
                                )}
                                <div>
                                  <div className="font-semibold text-mm-dark">
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
                            <td
                              className="px-5 py-4 text-mm-gray"
                              onClick={(e) => e.stopPropagation()}
                            >
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
                              {u.associatedBusinesses.length}{" "}
                              {u.associatedBusinesses.length === 1
                                ? "Business"
                                : "Businesses"}
                            </td>
                            <td
                              className="px-5 py-4"
                              onClick={(e) => e.stopPropagation()}
                            >
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
                                <div className="relative inline-block actions-dropdown-container">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      const dropdownHeight = 80;
                                      const dropdownWidth = 160;
                                      let top = rect.bottom;
                                      if (top + dropdownHeight > window.innerHeight) {
                                        top = rect.top - dropdownHeight - 8;
                                      }
                                      let left = rect.right - dropdownWidth;
                                      if (left < 8) {
                                        left = 8;
                                      }
                                      setDropdownCoords({ top, left });
                                      setOpenDropdownId(
                                        openDropdownId === u.id ? null : u.id,
                                      );
                                    }}
                                    className="p-1 rounded-lg hover:bg-mm-subtle transition-colors cursor-pointer text-mm-gray hover:text-mm-dark flex items-center justify-center"
                                    title="More Actions"
                                  >
                                    <MoreVertical size={16} />
                                  </button>
                                  {openDropdownId === u.id && dropdownCoords && (
                                    <div
                                      className="fixed mt-1 w-40 bg-white border border-mm-border rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                                      style={{
                                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                        top: `${dropdownCoords.top}px`,
                                        left: `${dropdownCoords.left}px`,
                                      }}
                                    >
                                      <button
                                        onClick={() => {
                                          handleResetPassword(u.email);
                                          setOpenDropdownId(null);
                                        }}
                                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-mm-orange hover:bg-mm-orange/5 transition-colors cursor-pointer font-semibold"
                                      >
                                        <Key size={14} />
                                        <span>Reset Password</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td
                                colSpan={6}
                                className="bg-[#FAF9F6] px-10 py-5"
                                style={{
                                  borderTop: "1px solid var(--color-mm-border)",
                                }}
                              >
                                <div className="space-y-3">
                                  <h4 className="text-sm font-bold text-mm-dark">
                                    Associated Businesses
                                  </h4>
                                  {u.associatedBusinesses.length === 0 ? (
                                    <div className="text-xs text-mm-gray">
                                      No business accounts associated with this
                                      user.
                                    </div>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-xs min-w-[700px]">
                                        <thead>
                                          <tr className="text-mm-gray border-b border-mm-border pb-2 text-left font-semibold">
                                            <th className="pb-2 font-semibold">
                                              BUSINESS NAME
                                            </th>
                                            <th className="pb-2 font-semibold">
                                              TYPE / INDUSTRY
                                            </th>
                                            <th className="pb-2 font-semibold">
                                              WEBSITE
                                            </th>
                                            <th className="pb-2 font-semibold">
                                              CONTACT PHONE
                                            </th>
                                            <th className="pb-2 font-semibold">
                                              PLAN
                                            </th>
                                            <th className="pb-2 font-semibold">
                                              PAYMENT STATUS
                                            </th>
                                            <th className="pb-2 font-semibold text-right">
                                              ACTIONS
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {u.associatedBusinesses.map((b) => {
                                            const report = reports.find((r) => r.businessId === b.id);
                                            return (
                                              <tr
                                                key={b.id}
                                                className="text-mm-dark border-b border-mm-subtle last:border-0"
                                              >
                                                <td className="py-2.5 font-medium">
                                                  <div className="flex items-center gap-2.5">
                                                    {b.image &&
                                                    b.image.trim() !== "" &&
                                                    b.image !== "undefined" &&
                                                    b.image !== "null" ? (
                                                      <img
                                                        src={b.image}
                                                        alt={b.businessName}
                                                        className="rounded-full object-cover aspect-square shrink-0"
                                                        style={{
                                                          width: 32,
                                                          height: 32,
                                                        }}
                                                      />
                                                    ) : (
                                                      <Avatar
                                                        name={b.businessName}
                                                        size={32}
                                                      />
                                                    )}
                                                    <div>
                                                      <div className="font-semibold text-mm-dark">
                                                        {b.businessName}
                                                      </div>
                                                      {b.contactEmail ? (
                                                        <a
                                                          href={`mailto:${b.contactEmail}`}
                                                          className="text-[10px] text-mm-gray hover:text-mm-orange hover:underline block"
                                                          onClick={(e) =>
                                                            e.stopPropagation()
                                                          }
                                                        >
                                                          {b.contactEmail}
                                                        </a>
                                                      ) : (
                                                        <div className="text-[10px] text-mm-gray">
                                                          No email
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                </td>
                                                <td className="py-2.5 text-mm-gray">
                                                  {b.businessType || "Consulting"}
                                                </td>
                                                <td className="py-2.5 text-mm-gray">
                                                  {b.websiteUrl ? (
                                                    <a
                                                      href={
                                                        b.websiteUrl.startsWith(
                                                          "http",
                                                        )
                                                          ? b.websiteUrl
                                                          : `https://${b.websiteUrl}`
                                                      }
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-mm-orange hover:underline"
                                                      onClick={(e) =>
                                                        e.stopPropagation()
                                                      }
                                                    >
                                                      {b.websiteUrl}
                                                    </a>
                                                  ) : (
                                                    "N/A"
                                                  )}
                                                </td>
                                                <td
                                                  className="py-2.5 text-mm-gray"
                                                  onClick={(e) =>
                                                    e.stopPropagation()
                                                  }
                                                >
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
                                                  <StatusBadge
                                                    status={b.paymentStatus}
                                                  />
                                                </td>
                                                <td className="py-2.5 text-right">
                                                  <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                      to="/admin/chat"
                                                      search={{
                                                        user:
                                                          typeof b.userId ===
                                                          "string"
                                                            ? b.userId
                                                            : b.userId?.id || "",
                                                        business: b.id,
                                                      }}
                                                      className="hover:text-mm-orange transition-colors cursor-pointer inline-flex items-center"
                                                      title="Chat"
                                                    >
                                                      <MessageSquare
                                                        size={14}
                                                        style={{
                                                          color:
                                                            "var(--color-mm-gray)",
                                                        }}
                                                      />
                                                    </Link>
                                                    <button
                                                      onClick={() =>
                                                        handleEditBusinessClick(b)
                                                      }
                                                      className="hover:text-mm-orange transition-colors cursor-pointer inline-flex items-center"
                                                    >
                                                      <Edit2
                                                        size={14}
                                                        style={{
                                                          color:
                                                            "var(--color-mm-gray)",
                                                        }}
                                                      />
                                                    </button>
                                                    {report && (
                                                      <Link
                                                        to="/admin/reports/$id"
                                                        params={{ id: report.id }}
                                                        className="hover:text-mm-orange transition-colors cursor-pointer inline-flex items-center"
                                                        title="View Report"
                                                      >
                                                        <FileText
                                                          size={14}
                                                          style={{
                                                            color:
                                                              "var(--color-mm-gray)",
                                                          }}
                                                        />
                                                      </Link>
                                                    )}
                                                    <button
                                                      onClick={() => setBusinessToDelete(b)}
                                                      className="hover:text-mm-red transition-colors cursor-pointer inline-flex items-center"
                                                      title="Delete Business"
                                                    >
                                                      <Trash2
                                                        size={14}
                                                        style={{
                                                          color:
                                                            "var(--color-mm-gray)",
                                                        }}
                                                      />
                                                    </button>
                                                  </div>
                                                </td>
                                              </tr>
                                            );
                                          })}
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
                  ),
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

      {/* ── EDIT USER MODAL ── */}
      {editingUser && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
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

            <div className="flex flex-col items-center mb-6">
              <div
                className="relative group cursor-pointer"
                onClick={handleAvatarClick}
                style={{
                  width: "96px",
                  height: "96px",
                  borderRadius: "50%",
                  border: "2px solid var(--color-mm-orange)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--color-mm-subtle)",
                  overflow: "hidden",
                }}
              >
                {isUploadingUserAvatar ? (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-mm-orange animate-spin" />
                  </div>
                ) : editForm.image &&
                  editForm.image.trim() !== "" &&
                  editForm.image !== "undefined" &&
                  editForm.image !== "null" ? (
                  <img
                    src={editForm.image}
                    alt="Profile"
                    className="w-full h-full object-cover aspect-square"
                  />
                ) : (
                  <User className="w-12 h-12 text-mm-gray" />
                )}
                <div
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ borderRadius: "50%" }}
                >
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <p className="text-xs text-mm-gray mt-2">
                Click to change profile picture
              </p>
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
                  Full Name
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
                  Business Name
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
                  Email Address
                </label>
                <input
                  disabled
                  value={editForm.email}
                  className="cursor-not-allowed text-mm-gray bg-mm-subtle/30"
                  style={{
                    border: editErrors.email
                      ? "1px solid var(--color-mm-red)"
                      : "1px solid var(--color-mm-border)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    width: "100%",
                    outline: "none",
                  }}
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
                  Phone Number
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
                  <option>Inactive</option>
                  <option>Suspended</option>
                </select>
              </div>

              {/* Role and password change option removed from UI */}
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
                disabled={isUploadingUserAvatar}
                onClick={handleEditSubmit}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--color-mm-orange)", color: "white" }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT BUSINESS MODAL ── */}
      {editingBusiness && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(4px)" }}
          onClick={() => setEditingBusiness(null)}
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
                Edit Business
              </h2>
              <button
                onClick={() => setEditingBusiness(null)}
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

            {/* Business Avatar picture upload */}
            <div className="flex flex-col items-center mb-6">
              <div
                className="relative group cursor-pointer"
                onClick={handleBusinessAvatarClick}
                style={{
                  width: "96px",
                  height: "96px",
                  borderRadius: "50%",
                  border: "2px solid var(--color-mm-orange)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--color-mm-subtle)",
                  overflow: "hidden",
                }}
              >
                {isUploadingBusinessLogo ? (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-mm-orange animate-spin" />
                  </div>
                ) : editBusinessForm.image &&
                  editBusinessForm.image.trim() !== "" &&
                  editBusinessForm.image !== "undefined" &&
                  editBusinessForm.image !== "null" ? (
                  <img
                    src={editBusinessForm.image}
                    alt="Business Avatar"
                    className="w-full h-full object-cover aspect-square"
                  />
                ) : (
                  <User className="w-12 h-12 text-mm-gray" />
                )}
                <div
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ borderRadius: "50%" }}
                >
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <input
                type="file"
                ref={businessFileInputRef}
                onChange={handleBusinessFileChange}
                accept="image/*"
                className="hidden"
              />
              <p className="text-xs text-mm-gray mt-2">
                Click to change business logo
              </p>
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
                  Business Name*
                </label>
                <input
                  value={editBusinessForm.businessName || ""}
                  onChange={(e) =>
                    setEditBusinessForm({
                      ...editBusinessForm,
                      businessName: e.target.value,
                    })
                  }
                  style={{
                    background: "white",
                    border: editBusinessErrors.businessName
                      ? "1px solid var(--color-mm-red)"
                      : "1px solid var(--color-mm-border)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    color: "var(--color-mm-dark)",
                    width: "100%",
                    outline: "none",
                  }}
                />
                {editBusinessErrors.businessName && (
                  <div
                    style={{
                      color: "var(--color-mm-red)",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    {editBusinessErrors.businessName}
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
                    Type / Industry
                  </label>
                  <input
                    value={editBusinessForm.businessType}
                    onChange={(e) =>
                      setEditBusinessForm({
                        ...editBusinessForm,
                        businessType: e.target.value,
                      })
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
                    Plan
                  </label>
                  <select
                    value={editBusinessForm.plan || "None"}
                    onChange={(e) =>
                      setEditBusinessForm({
                        ...editBusinessForm,
                        plan: e.target.value,
                      })
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
                    <option value="None">None</option>
                    <option value="Basic">Basic Plan</option>
                    <option value="Plus">Plus Plan</option>
                    <option value="Pro">Pro Plan</option>
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
                  value={editBusinessForm.websiteUrl || ""}
                  placeholder="https://"
                  onChange={(e) =>
                    setEditBusinessForm({
                      ...editBusinessForm,
                      websiteUrl: e.target.value,
                    })
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
                />
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
                    Contact Phone
                  </label>
                  <input
                    value={editBusinessForm.contactPhone || ""}
                    onChange={(e) =>
                      setEditBusinessForm({
                        ...editBusinessForm,
                        contactPhone: e.target.value,
                      })
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
                    Contact Email
                  </label>
                  <input
                    value={editBusinessForm.contactEmail || ""}
                    onChange={(e) =>
                      setEditBusinessForm({
                        ...editBusinessForm,
                        contactEmail: e.target.value,
                      })
                    }
                    style={{
                      background: "white",
                      border: editBusinessErrors.contactEmail
                        ? "1px solid var(--color-mm-red)"
                        : "1px solid var(--color-mm-border)",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      color: "var(--color-mm-dark)",
                      width: "100%",
                      outline: "none",
                    }}
                  />
                  {editBusinessErrors.contactEmail && (
                    <div
                      style={{
                        color: "var(--color-mm-red)",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {editBusinessErrors.contactEmail}
                    </div>
                  )}
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
                  Payment Status
                </label>
                <select
                  value={editBusinessForm.paymentStatus || "Pending"}
                  onChange={(e) =>
                    setEditBusinessForm({
                      ...editBusinessForm,
                      paymentStatus: e.target.value,
                    })
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
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>

            <div
              className="mt-6 pt-4 flex justify-end gap-3"
              style={{ borderTop: "1px solid var(--color-mm-border)" }}
            >
              <button
                onClick={() => setEditingBusiness(null)}
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
                disabled={isSavingBusiness || isUploadingBusinessLogo}
                onClick={handleEditBusinessSubmit}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--color-mm-orange)", color: "white" }}
              >
                {isSavingBusiness ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE BUSINESS CONFIRM MODAL ── */}
      {businessToDelete && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(4px)" }}
          onClick={() => setBusinessToDelete(null)}
        >
          <div
            className="w-full"
            style={{
              background: "white",
              borderRadius: "24px",
              border: "1px solid var(--color-mm-border)",
              maxWidth: "440px",
              padding: "32px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                style={{
                  color: "var(--color-mm-dark)",
                  fontWeight: 700,
                  fontSize: "20px",
                }}
              >
                Delete Business
              </h2>
              <button
                onClick={() => setBusinessToDelete(null)}
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

            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--color-mm-gray)" }}>
              Are you sure you want to delete <strong style={{ color: "var(--color-mm-dark)" }}>{businessToDelete.businessName}</strong>? This action cannot be undone and will remove all data associated with this business.
            </p>

            <div
              className="pt-4 flex justify-end gap-3"
              style={{ borderTop: "1px solid var(--color-mm-border)" }}
            >
              <button
                onClick={() => setBusinessToDelete(null)}
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
                disabled={isDeletingBusiness}
                onClick={handleDeleteBusiness}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--color-mm-red)", color: "white" }}
              >
                {isDeletingBusiness ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  "Delete"
                )}
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
