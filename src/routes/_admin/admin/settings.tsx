import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/admin/shared";
import { useState, useEffect } from "react";
import { CreditCard, Check, Settings as SettingsIcon, Bell, User, CheckCircle2, Database, Loader2, AlertTriangle, Wifi } from "lucide-react";
import {
  getNotificationSettingsFn,
  saveNotificationSettingsFn,
  testFirestoreConnectionFn,
  seedDatabaseFn
} from "@/lib/server-functions";

export const Route = createFileRoute("/_admin/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — GrowConsult AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Billing");
  const [toast, setToast] = useState<string | null>(null);

  const [billingPlan, setBillingPlan] = useState("Plus Plan");
  const [isAnnual, setIsAnnual] = useState(false);

  const [billingInfo, setBillingInfo] = useState({
    companyName: "GrowConsult AI",
    email: "billing@growconsult.ai",
    address: "123 Business Avenue, Suite 100, New York, NY 10001"
  });

  const isFirebaseConfigured = true;

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleSavePlan = () => {
    setToast("✓ Billing Settings saved successfully!");
  };

  const handleSaveInfo = () => {
    setToast("✓ Billing Info updated successfully!");
  };

  const [seeding, setSeeding] = useState(false);
  const [seedLog, setSeedLog] = useState<string[]>([]);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  const [testError, setTestError] = useState("");

  const handleTestConnection = async () => {
    setTestStatus("testing");
    setTestError("");
    try {
      const res = await testFirestoreConnectionFn();
      if (res.ok) {
        setTestStatus("ok");
      } else {
        setTestStatus("fail");
        setTestError(res.error || "Connection failed.");
      }
    } catch (e: any) {
      setTestStatus("fail");
      setTestError(e.message || "Failed to test connection.");
    }
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setSeedLog([]);
    const log = (msg: string) => setSeedLog(prev => [...prev, msg]);
    try {
      log("Seeding database via server function...");
      const res = await seedDatabaseFn({
        data: { emailNotif, smsNotif, auditNotif, weeklyNotif }
      });
      if (res.success) {
        log("🎉 Database seeded successfully! Collections seeded on server.");
        setToast("✓ Firebase database seeded successfully!");
      } else {
        log("✗ Seeding failed.");
      }
    } catch (e: any) {
      log(`✗ Error: ${e.message}`);
      setToast("✗ Seeding failed.");
    }
    setSeeding(false);
  };

  const tabs = [
    { id: "General", icon: User },
    { id: "Billing", icon: CreditCard },
    { id: "Notifications", icon: Bell },
    { id: "Database", icon: Database },
  ];

  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [auditNotif, setAuditNotif] = useState(true);
  const [weeklyNotif, setWeeklyNotif] = useState(true);

  useEffect(() => {
    getNotificationSettingsFn().then(data => {
      setEmailNotif(data.emailNotif);
      setSmsNotif(data.smsNotif);
      setAuditNotif(data.auditNotif);
      setWeeklyNotif(data.weeklyNotif);
    });
  }, []);

  const handleSaveNotifications = () => {
    saveNotificationSettingsFn({
      data: {
        emailNotif,
        smsNotif,
        auditNotif,
        weeklyNotif
      }
    }).then(() => {
      setToast("✓ Notification Settings saved successfully!");
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-[#E8DCC8]">
          <SettingsIcon size={20} style={{ color: "#E89D18" }} />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "#4E342E" }}>Settings</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
              style={{
                background: activeTab === t.id ? "#FFF3D6" : "transparent",
                color: activeTab === t.id ? "#E89D18" : "#8D6E63"
              }}
            >
              <t.icon size={18} /> {t.id}
            </button>
          ))}
        </div>

        <div className="flex-1">
          {activeTab === "Billing" && (
            <div className="space-y-6">
              <Card>
                <h3 className="font-bold text-lg mb-4" style={{ color: "#4E342E" }}>Billing Plan</h3>

                <div className="flex items-center justify-center gap-3 mb-6">
                  <span style={{ color: "#4E342E", fontWeight: 600, fontSize: "14px" }}>Monthly</span>
                  <div
                    onClick={() => setIsAnnual(!isAnnual)}
                    style={{
                      width: "44px", height: "24px", borderRadius: "999px",
                      background: "#E89D18", cursor: "pointer", position: "relative"
                    }}
                  >
                    <div style={{
                      width: "20px", height: "20px", background: "white", borderRadius: "50%",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.15)", position: "absolute", top: "2px",
                      transform: isAnnual ? "translateX(22px)" : "translateX(2px)",
                      transition: "transform 300ms ease"
                    }} />
                  </div>
                  <span style={{ color: "#4E342E", fontWeight: 600, fontSize: "14px" }}>Annual pricing</span>
                  <span style={{
                    background: "#E8F5E9", color: "#4CAF50", border: "1px solid #4CAF50",
                    borderRadius: "999px", fontSize: "11px", fontWeight: 700, padding: "2px 10px"
                  }}>SAVE 20%</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    {
                      name: "Basic Plan",
                      tagline: "Essential assets to kickstart your business presence.",
                      priceMonthly: "$29", priceAnnual: "$23", billedAnnual: "$276",
                      features: ["Website (Template)", "3 Posts + 1 Reel per month", "AI Chatbot + Voice support", "Basic SEO optimization", "Google Business Profile setup"]
                    },
                    {
                      name: "Plus Plan",
                      tagline: "Designed for expanding businesses seeking growth.",
                      priceMonthly: "$59", priceAnnual: "$47", billedAnnual: "$564",
                      features: ["Website (Customized layout)", "5 Posts + 2 Reels per month", "AI Voicebot integration", "Advanced SEO optimization", "Email marketing campaigns", "Includes all Basic features"]
                    },
                    {
                      name: "Pro Plan",
                      tagline: "Ultimate features for scaling market leaders.",
                      priceMonthly: "$89", priceAnnual: "$71", billedAnnual: "$852",
                      features: ["Modern 3D Website design", "7 Posts + 3 Reels per month", "AI Voice + Chatbot agents", "Deep performance analytics", "Paid Ads (Google & Meta)", "All Social Media Optimization", "SEO + GEO + AEO optimization", "Includes all Plus features"]
                    }
                  ].map(plan => (
                    <div
                      key={plan.name}
                      onClick={() => setBillingPlan(plan.name)}
                      className="p-5 rounded-2xl cursor-pointer transition-all border-2"
                      style={{
                        background: billingPlan === plan.name ? "#FFFDF8" : "#FCF8F1",
                        borderColor: billingPlan === plan.name ? "#E89D18" : "transparent",
                        boxShadow: billingPlan === plan.name ? "0 8px 24px rgba(232,157,24,0.15)" : "none"
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-lg" style={{ color: "#4E342E" }}>{plan.name}</div>
                        {billingPlan === plan.name && <CheckCircle2 size={20} style={{ color: "#E89D18" }} />}
                      </div>
                      <div style={{ color: "#8D6E63", fontSize: "13px", marginBottom: "16px" }}>{plan.tagline}</div>

                      <div className="mb-4 flex flex-col justify-end" style={{ minHeight: "90px" }}>
                        {isAnnual ? (
                          <div style={{ color: "#A1887F", fontSize: "14px", textDecoration: "line-through" }}>
                            {plan.priceMonthly}
                          </div>
                        ) : (
                          <div style={{ height: "20px" }} />
                        )}
                        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                          <span style={{ color: "#E89D18", fontWeight: 700, fontSize: "36px" }}>
                            {isAnnual ? plan.priceAnnual : plan.priceMonthly}
                          </span>
                          <span style={{ color: "#8D6E63", fontSize: "16px" }}>/mth</span>
                        </div>
                        <div style={{ color: "#A1887F", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", marginTop: "4px", display: "block" }}>
                          {isAnnual ? `BILLED ${plan.billedAnnual}/YEAR` : "BILLED MONTHLY"}
                        </div>
                        {isAnnual ? (
                          <div style={{ color: "#4CAF50", fontSize: "12px", fontWeight: 600, marginTop: "4px" }}>
                            SAVE 20%
                          </div>
                        ) : (
                          <div style={{ height: "18px" }} />
                        )}
                      </div>

                      <ul className="space-y-2" style={{ color: "#6D4C41", fontSize: "14px" }}>
                        {plan.features.map(f => (
                          <li key={f} className="flex items-start gap-2.5">
                            <Check size={16} className="shrink-0 mt-0.5" style={{ color: "#E89D18" }} /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="pt-5 border-t flex justify-end" style={{ borderColor: "#E8DCC8" }}>
                  <button onClick={handleSavePlan} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-90" style={{ background: "#E89D18", color: "white" }}>
                    Save Billing Settings
                  </button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "Notifications" && (
            <Card>
              <h3 className="font-bold text-lg mb-4" style={{ color: "#4E342E" }}>Notification Settings</h3>
              <p className="text-xs text-[#8D6E63] mb-6">Configure how you receive alerts and updates from the GrowConsult AI platform.</p>

              <div className="space-y-6">
                {[
                  { id: "email", label: "Email Notifications", desc: "Receive automated weekly updates, invoices, and reports in your inbox.", state: emailNotif, setter: setEmailNotif },
                  { id: "sms", label: "SMS Alerts", desc: "Receive text message alerts for urgent payment overdue or system warnings.", state: smsNotif, setter: setSmsNotif },
                  { id: "audit", label: "Audit Log Changes", desc: "Notify when administrators change plans or suspend user accounts.", state: auditNotif, setter: setAuditNotif },
                  { id: "weekly", label: "Weekly Performance Digest", desc: "Receive summary of user reports generated by agents.", state: weeklyNotif, setter: setWeeklyNotif }
                ].map(n => (
                  <div key={n.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DCC8]/40 last:border-0 last:pb-0">
                    <div>
                      <div className="font-semibold text-sm" style={{ color: "#4E342E" }}>{n.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#8D6E63" }}>{n.desc}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => n.setter(true)}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        style={{
                          background: n.state ? "#E89D18" : "#F8F1E7",
                          color: n.state ? "white" : "#6D4C41",
                          border: n.state ? "1px solid #E89D18" : "1px solid #E8DCC8"
                        }}
                      >
                        On
                      </button>
                      <button
                        onClick={() => n.setter(false)}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        style={{
                          background: !n.state ? "#E89D18" : "#F8F1E7",
                          color: !n.state ? "white" : "#6D4C41",
                          border: !n.state ? "1px solid #E89D18" : "1px solid #E8DCC8"
                        }}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t mt-6 flex justify-end" style={{ borderColor: "#E8DCC8" }}>
                <button onClick={handleSaveNotifications} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-90" style={{ background: "#E89D18", color: "white" }}>
                  Save Notifications
                </button>
              </div>
            </Card>
          )}

          {activeTab === "Database" && (
            <div className="space-y-5">
              {/* Step 1: Connection Status */}
              <Card>
                <h3 className="font-bold text-base mb-3" style={{ color: "#4E342E" }}>Step 1 — Test Firebase Connection</h3>

                <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl text-xs font-semibold" style={{
                  background: isFirebaseConfigured ? "#E8F5E9" : "#FEF2F2",
                  color: isFirebaseConfigured ? "#4CAF50" : "#EF5350",
                  border: `1px solid ${isFirebaseConfigured ? "#4CAF50" : "#EF5350"}`
                }}>
                  {isFirebaseConfigured
                    ? <><CheckCircle2 size={14} /> Server database connection initialized</>
                    : <><AlertTriangle size={14} /> Server database connection error</>}
                </div>

                {isFirebaseConfigured && (
                  <>
                    <button
                      onClick={handleTestConnection}
                      disabled={testStatus === "testing"}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 mb-4"
                      style={{ background: "#4E342E", color: "white" }}
                    >
                      {testStatus === "testing" ? <Loader2 size={15} className="animate-spin" /> : <Wifi size={15} />}
                      {testStatus === "testing" ? "Testing..." : "Test Firestore Connection"}
                    </button>

                    {testStatus === "ok" && (
                      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold" style={{ background: "#E8F5E9", color: "#4CAF50", border: "1px solid #4CAF50" }}>
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                        <span>Firestore is connected and writable! Proceed to Step 2 to seed the database.</span>
                      </div>
                    )}

                    {testStatus === "fail" && (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold" style={{ background: "#FEF2F2", color: "#EF5350", border: "1px solid #EF5350" }}>
                          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                          <span>{testError}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Card>

              {/* Step 2: Seed */}
              <Card>
                <h3 className="font-bold text-base mb-1" style={{ color: "#4E342E" }}>Step 2 — Seed Collections</h3>
                <p className="text-xs mb-4" style={{ color: "#8D6E63" }}>
                  Writes plans, admin config, notifications, and users to Firestore. Run once.
                </p>

                <button
                  onClick={handleSeedDatabase}
                  disabled={seeding || !isFirebaseConfigured || testStatus !== "ok"}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                  style={{ background: "#E89D18", color: "white" }}
                >
                  {seeding ? <Loader2 size={15} className="animate-spin" /> : <Database size={15} />}
                  {seeding ? "Seeding..." : testStatus !== "ok" ? "Test connection first ↑" : "Seed Firebase Now"}
                </button>

                {seedLog.length > 0 && (
                  <div className="rounded-xl p-4 font-mono text-xs space-y-1 max-h-64 overflow-y-auto"
                    style={{ background: "#1C1C1E", color: "#E8E8E8" }}>
                    {seedLog.map((line, i) => (
                      <div key={i} style={{ color: line.startsWith("✓") ? "#4CAF50" : line.startsWith("✗") ? "#EF5350" : line.startsWith("🎉") ? "#E89D18" : "#E8E8E8" }}>
                        {line || "\u00A0"}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}


          {activeTab === "General" && (
            <Card>
              <div className="py-12 text-center" style={{ color: "#8D6E63" }}>
                General settings coming soon.
              </div>
            </Card>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-100 px-5 py-3 rounded-xl shadow-lg transition-all animate-in slide-in-from-bottom-5" style={{ background: "#E8F5E9", border: "1px solid #4CAF50", color: "#4CAF50", fontWeight: 600 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
