import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { useBusiness } from "@/hooks/use-business";

export const Route = createFileRoute("/_client/settings")({
  component: RouteComponent,
});

type SettingsTab = "profile" | "notifications" | "billing" | "account";

function RouteComponent() {
  const { activeBusiness } = useBusiness();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Form State
  const [businessName, setBusinessName] = useState("Choco Bliss");
  const [businessType, setBusinessType] = useState("Food & Beverages");
  const [website, setWebsite] = useState("https://chocobliss.com");
  const [email, setEmail] = useState("hello@chocobliss.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [address, setAddress] = useState("123, MG Road, Bangalore, Karnataka, India");
  const [primaryColor, setPrimaryColor] = useState("#FF6B35");

  // Toast status
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("Saving changes...");
    setTimeout(() => {
      setSaveStatus("Settings updated successfully!");
      setTimeout(() => setSaveStatus(null), 3000);
    }, 800000000000); // Oops, let's use a normal 800ms
  };

  const triggerSave = () => {
    setSaveStatus("Saving changes...");
    setTimeout(() => {
      setSaveStatus("Settings updated successfully!");
      setTimeout(() => setSaveStatus(null), 3000);
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2 font-sans text-mm-dark select-none">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-mm-dark font-sans">
            Settings
          </h2>
          <p className="text-sm text-mm-gray mt-1">
            Manage your account and preferences.
          </p>
        </div>
        {saveStatus && (
          <div className="bg-mm-green/10 text-mm-green border border-mm-green/20 px-4 py-2 rounded-xl text-xs font-bold animate-fadeIn">
            {saveStatus}
          </div>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-6 border-b border-mm-border pb-px text-sm font-semibold mt-4">
        <button
          onClick={() => setActiveTab("profile")}
          className={`${
            activeTab === "profile"
              ? "text-mm-dark border-b-2 border-mm-orange pb-3 -mb-px font-extrabold"
              : "text-mm-gray hover:text-mm-dark pb-3 cursor-pointer"
          } transition-all`}
        >
          Business Profile
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`${
            activeTab === "notifications"
              ? "text-mm-dark border-b-2 border-mm-orange pb-3 -mb-px font-extrabold"
              : "text-mm-gray hover:text-mm-dark pb-3 cursor-pointer"
          } transition-all`}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`${
            activeTab === "billing"
              ? "text-mm-dark border-b-2 border-mm-orange pb-3 -mb-px font-extrabold"
              : "text-mm-gray hover:text-mm-dark pb-3 cursor-pointer"
          } transition-all`}
        >
          Billing & Plan
        </button>
        <button
          onClick={() => setActiveTab("account")}
          className={`${
            activeTab === "account"
              ? "text-mm-dark border-b-2 border-mm-orange pb-3 -mb-px font-extrabold"
              : "text-mm-gray hover:text-mm-dark pb-3 cursor-pointer"
          } transition-all`}
        >
          Account Settings
        </button>
      </div>

      {/* Main Switcher Panels */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Panel: Business Information Card */}
          <div className="lg:col-span-2 bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] space-y-6 animate-fadeIn">
            <h3 className="text-sm font-extrabold text-mm-dark tracking-tight">
              Business Information
            </h3>

            <div className="space-y-4">
              {/* Row 1: Business Name */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-xs font-bold text-mm-dark">
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="col-span-2 bg-white border border-mm-border focus:border-mm-gray focus:outline-none rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all"
                />
              </div>

              {/* Row 2: Business Type */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-xs font-bold text-mm-dark">
                  Business Type
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="col-span-2 bg-white border border-mm-border focus:border-mm-gray focus:outline-none rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                >
                  <option>Food & Beverages</option>
                  <option>Retail</option>
                  <option>Technology</option>
                  <option>Services</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Row 3: Website */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-xs font-bold text-mm-dark">
                  Website
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="col-span-2 bg-white border border-mm-border focus:border-mm-gray focus:outline-none rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all"
                />
              </div>

              {/* Row 4: Business Email */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-xs font-bold text-mm-dark">
                  Business Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="col-span-2 bg-white border border-mm-border focus:border-mm-gray focus:outline-none rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all"
                />
              </div>

              {/* Row 5: Phone Number */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-xs font-bold text-mm-dark">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="col-span-2 bg-white border border-mm-border focus:border-mm-gray focus:outline-none rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all"
                />
              </div>

              {/* Row 6: Business Address */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-xs font-bold text-mm-dark">
                  Business Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="col-span-2 bg-white border border-mm-border focus:border-mm-gray focus:outline-none rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all"
                />
              </div>
            </div>
          </div>

          {/* Right Panel: Branding & Business Details */}
          <div className="space-y-6">
            {/* Branding Card */}
            <div className="bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] space-y-4 animate-fadeIn">
              <h3 className="text-sm font-extrabold text-mm-dark tracking-tight">
                Branding
              </h3>

              {/* Logo Upload Section */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-mm-gray uppercase tracking-wider block">
                  Logo
                </span>
                <div className="flex items-center gap-4">
                  {/* Styled CSS/SVG Logo Container */}
                  <div className="h-20 w-20 bg-[#FAF7F2] border border-[#E9E0D2] rounded-xl flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 100 100" className="w-16 h-16">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#78350F"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="36"
                        fill="none"
                        stroke="#78350F"
                        strokeWidth="0.8"
                      />
                      <text
                        x="50"
                        y="45"
                        fontSize="11"
                        fontWeight="900"
                        fill="#78350F"
                        textAnchor="middle"
                        fontFamily="serif"
                      >
                        Choco
                      </text>
                      <text
                        x="50"
                        y="58"
                        fontSize="11"
                        fontWeight="900"
                        fill="#78350F"
                        textAnchor="middle"
                        fontFamily="serif"
                      >
                        Bliss
                      </text>
                      <path
                        d="M40 68 Q 50 72 60 68"
                        fill="none"
                        stroke="#FF6B35"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <button className="flex items-center gap-2 border border-mm-border hover:bg-mm-subtle text-xs font-bold text-mm-dark px-4 py-2.5 rounded-xl transition-all cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Upload New Logo
                  </button>
                </div>
              </div>

              {/* Primary Color Section */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-mm-gray uppercase tracking-wider block">
                  Primary Color
                </span>
                <div className="flex items-center gap-3">
                  {/* Color preview circle/square */}
                  <div
                    className="h-9 w-9 rounded-xl border border-mm-border/50 shrink-0 shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 bg-white border border-mm-border focus:border-mm-gray focus:outline-none rounded-xl px-4 py-2 text-xs font-semibold uppercase transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Business Details Save Card */}
            <div className="bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] space-y-4 animate-fadeIn">
              <h3 className="text-sm font-extrabold text-mm-dark tracking-tight">
                Business Details
              </h3>
              <p className="text-xs text-mm-gray leading-relaxed">
                Tell us more about your business to help us serve you better.
              </p>
              <button
                onClick={triggerSave}
                className="w-full py-3.5 bg-white border border-mm-border hover:bg-mm-subtle active:scale-98 text-mm-dark text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Update Details
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] space-y-6 animate-fadeIn max-w-2xl">
          <h3 className="text-sm font-extrabold text-mm-dark tracking-tight">
            Notification Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-mm-border/40">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-mm-dark">Email Updates</h4>
                <p className="text-[10px] sm:text-xs text-mm-gray mt-0.5">Weekly report and project progress reports.</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-mm-border text-mm-orange focus:ring-mm-orange cursor-pointer" />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-mm-border/40">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-mm-dark">Instant Alerts</h4>
                <p className="text-[10px] sm:text-xs text-mm-gray mt-0.5">Immediate notifications for new messages.</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-mm-border text-mm-orange focus:ring-mm-orange cursor-pointer" />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-mm-dark">Marketing Updates</h4>
                <p className="text-[10px] sm:text-xs text-mm-gray mt-0.5">Newsletters, features, and optimization suggestions.</p>
              </div>
              <input type="checkbox" className="h-4 w-4 rounded border-mm-border text-mm-orange focus:ring-mm-orange cursor-pointer" />
            </div>
          </div>
        </div>
      )}

      {activeTab === "billing" && (
        <div className="bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] space-y-6 animate-fadeIn max-w-2xl">
          <h3 className="text-sm font-extrabold text-mm-dark tracking-tight">
            Plan & Billing
          </h3>
          {activeBusiness ? (
            <div className="p-4 bg-mm-subtle/30 border border-mm-border rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-mm-gray uppercase tracking-wider block">Current Plan</span>
                <h4 className="text-sm font-extrabold text-mm-dark mt-1">
                  {activeBusiness.plan !== "None" ? `${activeBusiness.plan} Plan` : "Free Tier"}
                </h4>
                <span className="text-xs font-bold text-mm-orange mt-0.5 block">
                  {activeBusiness.plan === "Pro" ? "₹7,499 / month" :
                   activeBusiness.plan === "Plus" ? "₹4,999 / month" :
                   activeBusiness.plan === "Basic" ? "₹2,499 / month" :
                   "₹0 / month"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                  activeBusiness.paymentStatus === "Paid" && activeBusiness.plan !== "None"
                    ? "text-mm-green bg-mm-green/10"
                    : "text-amber-600 bg-amber-50"
                }`}>
                  {activeBusiness.paymentStatus === "Paid" && activeBusiness.plan !== "None" ? "Active" : "Pending Upgrade"}
                </span>
                <button
                  onClick={() => {
                    navigate({
                      to: "/plans",
                      search: { businessId: activeBusiness.id }
                    });
                  }}
                  className="text-xs font-bold bg-mm-dark hover:opacity-90 text-white px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  {activeBusiness.plan !== "None" ? "Change Plan" : "Upgrade"}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-mm-subtle/30 border border-mm-border rounded-2xl text-center text-xs font-bold text-mm-gray">
              No active business profile selected.
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-mm-gray uppercase tracking-wider">Billing Info</h4>
            <div className="border border-mm-border rounded-xl p-4 text-xs space-y-2 text-mm-dark font-semibold">
              <div className="flex justify-between">
                <span className="text-mm-gray">Billing Email</span>
                <span>{activeBusiness?.contactEmail || "No email associated"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mm-gray">Billing Phone</span>
                <span>{activeBusiness?.contactPhone || "No contact number"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mm-gray">Billing Status</span>
                <span className={activeBusiness?.paymentStatus === "Paid" ? "text-mm-green" : "text-amber-600"}>
                  {activeBusiness?.paymentStatus || "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "account" && (
        <div className="bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] space-y-6 animate-fadeIn max-w-md">
          <h3 className="text-sm font-extrabold text-mm-dark tracking-tight">
            Account Security
          </h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-mm-dark">Current Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-white border border-mm-border focus:border-mm-gray focus:outline-none rounded-xl px-4 py-2.5 text-xs font-semibold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-mm-dark">New Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-white border border-mm-border focus:border-mm-gray focus:outline-none rounded-xl px-4 py-2.5 text-xs font-semibold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-mm-dark">Confirm New Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-white border border-mm-border focus:border-mm-gray focus:outline-none rounded-xl px-4 py-2.5 text-xs font-semibold" />
            </div>
            <button onClick={triggerSave} className="w-full py-3 bg-mm-orange hover:opacity-95 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer">
              Update Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
