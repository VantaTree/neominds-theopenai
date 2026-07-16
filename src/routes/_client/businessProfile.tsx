import React, { useState, useRef, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Camera, Building2, Mail, Phone, Loader2, Search, Tags, Globe, Shield } from "lucide-react";
import { uploadFileToStorage } from "@/lib/firebase";
import { saveBusinessFn } from "@/lib/server-functions";
import { useBusiness } from "@/hooks/use-business";
import { type Business } from "@/lib/schemas";

export const Route = createFileRoute("/_client/businessProfile")({
  component: RouteComponent,
});

interface BusinessFormData {
  businessName: string;
  businessType: string;
  contactEmail: string;
  contactPhone: string;
  image: string;
  websiteUrl: string;
  plan: string;
}

function RouteComponent() {
  const { businesses, activeBusiness, setActiveBusiness, loading, refetch } = useBusiness();

  // Search filter query for left column
  const [searchQuery, setSearchQuery] = useState("");

  // Editable form state
  const [formData, setFormData] = useState<BusinessFormData>({
    businessName: "",
    businessType: "",
    contactEmail: "",
    contactPhone: "",
    image: "",
    websiteUrl: "",
    plan: "None",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form details when the active business changes
  useEffect(() => {
    if (activeBusiness) {
      setFormData({
        businessName: activeBusiness.businessName || "",
        businessType: activeBusiness.businessType || "",
        contactEmail: activeBusiness.contactEmail || "",
        contactPhone: activeBusiness.contactPhone || "",
        image: activeBusiness.image || "",
        websiteUrl: activeBusiness.websiteUrl || "",
        plan: activeBusiness.plan || "None",
      });
    }
  }, [activeBusiness]);

  // Check if form has unsaved modifications
  const hasChanges =
    activeBusiness &&
    (formData.businessName.trim() !== (activeBusiness.businessName || "") ||
      formData.businessType.trim() !== (activeBusiness.businessType || "") ||
      formData.contactEmail.trim() !== (activeBusiness.contactEmail || "") ||
      formData.contactPhone.trim() !== (activeBusiness.contactPhone || "") ||
      formData.image !== (activeBusiness.image || "") ||
      formData.websiteUrl.trim() !== (activeBusiness.websiteUrl || ""));

  // Prevent closing/reloading window if changes are unsaved
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to discard them?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  // Handle inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Image Upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeBusiness) {
      setIsUploadingAvatar(true);
      try {
        const url = await uploadFileToStorage(
          file,
          "businesses",
          activeBusiness.id,
          "businessImg",
          formData.image || undefined
        );
        setFormData((prev) => ({ ...prev, image: url }));
      } catch (err: any) {
        console.error("Failed to upload logo:", err);
        alert(err.message || "Failed to upload logo");
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  // Switch active business in list (with unsaved changes confirmation)
  const handleSelectBusiness = (biz: Business) => {
    if (biz.id === activeBusiness?.id) return;
    if (hasChanges) {
      const confirmSwitch = window.confirm(
        "You have unsaved changes on the current business profile. Are you sure you want to switch and discard these changes?"
      );
      if (!confirmSwitch) return;
    }
    setActiveBusiness(biz);
  };

  // Save changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges || !activeBusiness) return;

    setIsSaving(true);
    try {
      const updatedBusiness: Business = {
        ...activeBusiness,
        businessName: formData.businessName.trim(),
        businessType: formData.businessType.trim(),
        contactEmail: formData.contactEmail.trim() ? formData.contactEmail.trim() : null,
        contactPhone: formData.contactPhone.trim(),
        image: formData.image || "",
        websiteUrl: formData.websiteUrl.trim(),
        
        // Ensure read-only / system fields are NOT changed
        id: activeBusiness.id,
        userId: activeBusiness.userId,
        plan: activeBusiness.plan,
        addons: activeBusiness.addons,
        paymentStatus: activeBusiness.paymentStatus,
        createdAt: activeBusiness.createdAt,
        updatedAt: activeBusiness.updatedAt,
      };

      await saveBusinessFn({ data: updatedBusiness });
      
      // Update global active business id in localStorage to persist selection across page reloads
      if (typeof window !== "undefined") {
        localStorage.setItem("active_business_id", activeBusiness.id);
      }

      // Optimistically update context to avoid UI delay
      setActiveBusiness(updatedBusiness);

      // Refresh standard business context lists and dropdown states
      await refetch();

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save business profile changes:", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (activeBusiness) {
      setFormData({
        businessName: activeBusiness.businessName || "",
        businessType: activeBusiness.businessType || "",
        contactEmail: activeBusiness.contactEmail || "",
        contactPhone: activeBusiness.contactPhone || "",
        image: activeBusiness.image || "",
        websiteUrl: activeBusiness.websiteUrl || "",
        plan: activeBusiness.plan || "None",
      });
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "B";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Loading spinner state
  if (loading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center p-12 min-h-[50vh]">
        <Loader2 className="h-8 w-8 text-mm-orange animate-spin" />
      </div>
    );
  }

  // Graceful empty state handling
  if (!activeBusiness) {
    return (
      <div className="flex-1 w-full px-4.5 py-6 text-center select-none font-sans text-mm-dark flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Building2 className="h-12 w-12 text-mm-gray/30 animate-pulse" />
        <h3 className="text-lg font-bold text-mm-dark">No Business Selected</h3>
        <p className="text-xs text-mm-gray max-w-sm">
          Please select or create a business using the selector dropdown in the navigation bar to configure your business profile details.
        </p>
      </div>
    );
  }

  // Filtering businesses for sidebar list
  const filteredBusinesses = businesses.filter((biz) => {
    const q = searchQuery.toLowerCase();
    return (
      biz.businessName.toLowerCase().includes(q) ||
      (biz.businessType || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 w-full flex flex-col min-[769px]:flex-row gap-8 px-4.5 py-6 min-[769px]:px-8 min-[769px]:py-10 select-none font-sans text-mm-dark relative pb-24">
      
      {/* Left Column: Selector sidebar list (hidden on mobile, visible on desktop >= 769px) */}
      <div className="hidden min-[769px]:flex w-80 shrink-0 flex-col gap-4 border-r border-mm-border pr-6">
        <div className="space-y-1">
          <h3 className="text-sm font-black uppercase tracking-wider text-mm-gray">My Businesses</h3>
          <p className="text-[10px] text-mm-gray/70">Switch between profiles to edit them</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mm-gray" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search businesses..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-mm-border focus:border-mm-orange focus:ring-1 focus:ring-mm-orange outline-none text-xs font-bold text-mm-dark bg-white transition-all shadow-xs"
          />
        </div>

        {/* Businesses list */}
        <div className="flex-1 overflow-y-auto space-y-2 max-h-[calc(100vh-16rem)] pr-1">
          {filteredBusinesses.map((biz) => {
            const isActive = biz.id === activeBusiness.id;
            return (
              <div
                key={biz.id}
                onClick={() => handleSelectBusiness(biz)}
                className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                  isActive
                    ? "border-mm-orange bg-mm-orange/5"
                    : "border-mm-border bg-white hover:bg-mm-subtle/40"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {biz.image ? (
                    <img
                      src={biz.image}
                      alt={biz.businessName}
                      className="h-8.5 w-8.5 rounded-xl object-cover border border-mm-border aspect-square shrink-0"
                    />
                  ) : (
                    <div className="h-8.5 w-8.5 rounded-xl bg-mm-orange/10 text-mm-orange border border-mm-orange/20 flex items-center justify-center text-xs font-black uppercase shrink-0">
                      {biz.businessName.charAt(0)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-mm-dark truncate leading-tight">
                      {biz.businessName}
                    </h4>
                    <p className="text-[9px] text-mm-gray truncate mt-0.5 leading-none">
                      {biz.businessType || "Consulting"}
                    </p>
                  </div>
                </div>

                {/* Plan Badge */}
                {biz.plan && (
                  <span
                    className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 border ${
                      biz.plan === "Pro"
                        ? "bg-purple-50 text-purple-700 border-purple-100"
                        : biz.plan === "Plus"
                        ? "bg-blue-50 text-blue-700 border-blue-100"
                        : biz.plan === "Basic"
                        ? "bg-slate-50 text-slate-700 border-slate-100"
                        : "bg-gray-50 text-gray-500 border-gray-100"
                    }`}
                  >
                    {biz.plan}
                  </span>
                )}
              </div>
            );
          })}

          {filteredBusinesses.length === 0 && (
            <div className="text-center py-8 text-mm-gray text-xs font-medium border border-dashed border-mm-border rounded-2xl bg-white/50">
              No businesses found
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Edit form layout (Takes full width on mobile, flex-1 on desktop) */}
      <div className="flex-1 max-w-xl min-[769px]:mx-0 mx-auto w-full space-y-8 mt-4">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className="h-28 w-28 rounded-full border border-mm-border overflow-hidden bg-white flex items-center justify-center transition-all group-hover:opacity-90 shadow-sm relative">
              {isUploadingAvatar ? (
                <div className="absolute inset-0 bg-mm-dark/20 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-mm-orange animate-spin" />
                </div>
              ) : formData.image ? (
                <img src={formData.image} alt="Logo" className="h-full w-full object-cover aspect-square" />
              ) : (
                <div className="h-full w-full bg-mm-orange/10 text-mm-orange text-3xl font-black flex items-center justify-center">
                  {getInitials(formData.businessName || "B")}
                </div>
              )}
              
              {/* Hover Camera Icon overlay */}
              <div className="absolute inset-0 bg-mm-dark/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            
            {/* Hidden Input field */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            {/* Small camera badge */}
            <button
              type="button"
              onClick={handleAvatarClick}
              className="absolute bottom-1 right-1 p-2 rounded-full bg-white border border-mm-border text-mm-dark shadow-sm hover:bg-mm-subtle transition-colors cursor-pointer"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-1 w-full">
            <h3 className="text-lg font-black text-mm-dark">{activeBusiness.businessName}</h3>
            <div className="flex items-center justify-center gap-2">
              <p className="text-xs text-mm-gray">{activeBusiness.businessType || "No Type Specified"}</p>
              <span className="h-1 w-1 rounded-full bg-mm-gray/30" />
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                activeBusiness.plan === "Pro"
                  ? "bg-purple-50 text-purple-700 border-purple-100"
                  : activeBusiness.plan === "Plus"
                  ? "bg-blue-50 text-blue-700 border-blue-100"
                  : activeBusiness.plan === "Basic"
                  ? "bg-slate-50 text-slate-700 border-slate-100"
                  : "bg-gray-50 text-gray-500 border-gray-100"
              }`}>
                {activeBusiness.plan} Plan
              </span>
            </div>
          </div>
        </div>

        {/* Business Profile Edit Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-5">
            
            {/* Field 1: Business Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-mm-gray uppercase tracking-wider block">
                Business Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-mm-gray" />
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="Enter business name"
                  required
                  className="w-full pl-11 pr-4.5 py-3 rounded-2xl border border-mm-border focus:border-mm-orange focus:ring-1 focus:ring-mm-orange outline-none text-xs font-bold text-mm-dark bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Field 2: Business Type */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-mm-gray uppercase tracking-wider block">
                Business Type
              </label>
              <div className="relative">
                <Tags className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-mm-gray" />
                <input
                  type="text"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  placeholder="Enter business type (e.g. Consulting, E-Commerce)"
                  className="w-full pl-11 pr-4.5 py-3 rounded-2xl border border-mm-border focus:border-mm-orange focus:ring-1 focus:ring-mm-orange outline-none text-xs font-bold text-mm-dark bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Field 3: Contact Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-mm-gray uppercase tracking-wider block">
                Contact Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-mm-gray" />
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="Enter contact email address"
                  className="w-full pl-11 pr-4.5 py-3 rounded-2xl border border-mm-border focus:border-mm-orange focus:ring-1 focus:ring-mm-orange outline-none text-xs font-bold text-mm-dark bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Field 4: Contact Phone */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-mm-gray uppercase tracking-wider block">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-mm-gray" />
                <input
                  type="text"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  placeholder="Enter contact phone number"
                  className="w-full pl-11 pr-4.5 py-3 rounded-2xl border border-mm-border focus:border-mm-orange focus:ring-1 focus:ring-mm-orange outline-none text-xs font-bold text-mm-dark bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Field 5: Website URL */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-mm-gray uppercase tracking-wider block">
                Website URL
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-mm-gray" />
                <input
                  type="text"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleInputChange}
                  placeholder="Enter website URL (e.g. https://mybusiness.com)"
                  className="w-full pl-11 pr-4.5 py-3 rounded-2xl border border-mm-border focus:border-mm-orange focus:ring-1 focus:ring-mm-orange outline-none text-xs font-bold text-mm-dark bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Field 6: Subscription Plan (Non-Editable) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-mm-gray uppercase tracking-wider block">
                Active Plan
              </label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-mm-gray/50" />
                <input
                  type="text"
                  name="plan"
                  value={`${formData.plan} Plan`}
                  readOnly
                  disabled
                  className="w-full pl-11 pr-4.5 py-3 rounded-2xl border border-mm-border outline-none text-xs font-bold text-mm-gray bg-mm-subtle/30 cursor-not-allowed transition-all shadow-sm"
                />
              </div>
            </div>

          </div>

          {/* Conditional Save changes bar: Only visible when unsaved data is detected */}
          <div
            className={`sticky bottom-0 border-t border-mm-border/80 pt-4 md:pb-4 mt-6 z-20 flex items-center justify-end gap-3.5 transition-all duration-300 ${
              hasChanges ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-3 rounded-2xl border border-mm-border text-xs font-bold text-mm-gray hover:bg-mm-subtle hover:text-mm-dark transition-colors cursor-pointer bg-white"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploadingAvatar}
              className="px-6 py-3 rounded-2xl bg-mm-dark hover:opacity-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Floating Success Toast notification */}
      {showSuccess && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-mm-dark text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-bottom duration-300 select-none">
          <span className="text-xs font-bold">Business changes saved successfully!</span>
        </div>
      )}

    </div>
  );
}
