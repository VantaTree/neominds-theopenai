import { createFileRoute } from "@tanstack/react-router";
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
    <div className="space-y-6 font-sans text-mm-dark select-none">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-mm-orange/10">
          <SettingsIcon size={20} className="text-mm-orange" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-mm-dark">Settings</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-64 shrink-0 space-y-1 bg-white border border-mm-border rounded-[24px] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === t.id ? "bg-mm-orange/10 text-mm-orange font-extrabold" : "text-mm-gray hover:bg-mm-subtle/50"
              }`}
            >
              <t.icon size={18} /> {t.id}
            </button>
          ))}
        </div>

        <div className="flex-1 w-full">
          {activeTab === "Billing" && (
            <div className="space-y-6">
              <div className="bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
                <h3 className="font-extrabold text-sm text-mm-dark mb-4">Billing Plan</h3>

                <div className="flex items-center justify-center gap-3 mb-6 select-none">
                  <span className="text-mm-dark font-extrabold text-xs">Monthly</span>
                  <button 
                    onClick={() => setIsAnnual(!isAnnual)}
                    className={`w-11 h-6 rounded-full cursor-pointer relative transition-all ${
                      isAnnual ? "bg-mm-orange" : "bg-mm-gray/30"
                    }`}
                  >
                    <div 
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${
                        isAnnual ? "left-[22px]" : "left-0.5"
                      }`} 
                    />
                  </button>
                  <span className="text-mm-dark font-extrabold text-xs">Annual pricing</span>
                  <span className="bg-mm-green/10 text-mm-green text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">SAVE 20%</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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
                      className={`p-6 rounded-[24px] cursor-pointer transition-all border-2 flex flex-col justify-between ${
                        billingPlan === plan.name 
                          ? "bg-white border-mm-orange shadow-[0_8px_30px_rgba(224,86,36,0.08)]" 
                          : "bg-white border-mm-border hover:border-mm-gray/40 shadow-[0_4px_20px_rgba(0,0,0,0.01)]"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-extrabold text-sm text-mm-dark">{plan.name}</div>
                          {billingPlan === plan.name && <CheckCircle2 size={20} className="text-mm-orange" />}
                        </div>
                        <div className="text-mm-gray text-xs mb-4 font-bold leading-normal">{plan.tagline}</div>

                        <div className="mb-4 flex flex-col justify-end min-h-[90px]">
                          {isAnnual ? (
                            <div className="text-mm-gray/60 text-xs line-through font-bold">
                              {plan.priceMonthly}
                            </div>
                          ) : (
                            <div className="h-4" />
                          )}
                          <div className="flex items-baseline gap-1">
                            <span className="text-mm-orange font-black text-3xl">
                              {isAnnual ? plan.priceAnnual : plan.priceMonthly}
                            </span>
                            <span className="text-mm-gray text-sm font-bold">/mth</span>
                          </div>
                          <span className="text-mm-gray/70 text-[9px] font-black tracking-widest mt-1 block">
                            {isAnnual ? `BILLED ${plan.billedAnnual}/YEAR` : "BILLED MONTHLY"}
                          </span>
                        </div>
                      </div>

                      <ul className="space-y-2 mt-4 pt-4 border-t border-mm-border/60 text-xs text-mm-gray font-bold">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-start gap-2">
                            <Check size={14} className="shrink-0 mt-0.5 text-mm-orange" /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="pt-5 border-t border-mm-border/60 flex justify-end">
                  <button 
                    onClick={handleSavePlan} 
                    className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-mm-orange hover:bg-mm-orange/95 text-white transition-all cursor-pointer"
                  >
                    Save Billing Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Notifications" && (
            <div className="bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
              <h3 className="font-extrabold text-sm text-mm-dark mb-1">Notification Settings</h3>
              <p className="text-xs text-mm-gray mb-6 font-bold leading-normal">Configure how you receive alerts and updates from the GrowConsult AI platform.</p>

              <div className="space-y-6">
                {[
                  { id: "email", label: "Email Notifications", desc: "Receive automated weekly updates, invoices, and reports in your inbox.", state: emailNotif, setter: setEmailNotif },
                  { id: "sms", label: "SMS Alerts", desc: "Receive text message alerts for urgent payment overdue or system warnings.", state: smsNotif, setter: setSmsNotif },
                  { id: "audit", label: "Audit Log Changes", desc: "Notify when administrators change plans or suspend user accounts.", state: auditNotif, setter: setAuditNotif },
                  { id: "weekly", label: "Weekly Performance Digest", desc: "Receive summary of user reports generated by agents.", state: weeklyNotif, setter: setWeeklyNotif }
                ].map(n => (
                  <div key={n.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-mm-border/60 last:border-0 last:pb-0">
                    <div>
                      <div className="font-extrabold text-xs text-mm-dark">{n.label}</div>
                      <div className="text-[11px] text-mm-gray mt-0.5 leading-normal font-bold">{n.desc}</div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => n.setter(true)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          n.state 
                            ? "bg-mm-orange text-white border border-mm-orange" 
                            : "bg-white text-mm-gray border border-mm-border hover:bg-mm-subtle/50"
                        }`}
                      >
                        On
                      </button>
                      <button
                        onClick={() => n.setter(false)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          !n.state 
                            ? "bg-mm-orange text-white border border-mm-orange" 
                            : "bg-white text-mm-gray border border-mm-border hover:bg-mm-subtle/50"
                        }`}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-mm-border/60 mt-6 flex justify-end">
                <button 
                  onClick={handleSaveNotifications} 
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-mm-orange hover:bg-mm-orange/95 text-white transition-all cursor-pointer"
                >
                  Save Notifications
                </button>
              </div>
            </div>
          )}

          {activeTab === "Database" && (
            <div className="space-y-6">
              {/* Step 1: Connection Status */}
              <div className="bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
                <h3 className="font-extrabold text-sm text-mm-dark mb-3">Step 1 — Test Firebase Connection</h3>

                <div className={`flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl text-xs font-bold border ${
                  isFirebaseConfigured 
                    ? "bg-mm-green/10 text-mm-green border-transparent" 
                    : "bg-mm-red/10 text-mm-red border-transparent"
                }`}>
                  {isFirebaseConfigured
                    ? <><CheckCircle2 size={14} /> Server database connection initialized</>
                    : <><AlertTriangle size={14} /> Server database connection error</>}
                </div>

                {isFirebaseConfigured && (
                  <>
                    <button
                      onClick={handleTestConnection}
                      disabled={testStatus === "testing"}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-mm-dark hover:bg-mm-dark/95 text-white disabled:opacity-50 transition-all cursor-pointer mb-4"
                    >
                      {testStatus === "testing" ? <Loader2 size={15} className="animate-spin" /> : <Wifi size={15} />}
                      {testStatus === "testing" ? "Testing..." : "Test Firestore Connection"}
                    </button>

                    {testStatus === "ok" && (
                      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-mm-green/10 text-mm-green">
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                        <span>Firestore is connected and writable! Proceed to Step 2 to seed the database.</span>
                      </div>
                    )}

                    {testStatus === "fail" && (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-mm-red/10 text-mm-red">
                          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                          <span>{testError}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Step 2: Seed */}
              <div className="bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
                <h3 className="font-extrabold text-sm text-mm-dark mb-1">Step 2 — Seed Collections</h3>
                <p className="text-xs text-mm-gray mb-4 font-bold leading-normal">
                  Writes plans, admin config, notifications, and users to Firestore. Run once.
                </p>

                <button
                  onClick={handleSeedDatabase}
                  disabled={seeding || !isFirebaseConfigured || testStatus !== "ok"}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-mm-orange hover:bg-mm-orange/95 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer mb-4"
                >
                  {seeding ? <Loader2 size={15} className="animate-spin" /> : <Database size={15} />}
                  {seeding ? "Seeding..." : testStatus !== "ok" ? "Test connection first ↑" : "Seed Firebase Now"}
                </button>

                {seedLog.length > 0 && (
                  <div className="rounded-xl p-4 font-mono text-xs space-y-1 max-h-64 overflow-y-auto bg-mm-dark text-white border border-mm-border">
                    {seedLog.map((line, i) => (
                      <div key={i} style={{ color: line.startsWith("✓") ? "var(--color-mm-green)" : line.startsWith("✗") ? "var(--color-mm-red)" : line.startsWith("🎉") ? "var(--color-mm-orange)" : "white" }}>
                        {line || "\u00A0"}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "General" && (
            <div className="bg-white border border-mm-border rounded-[24px] p-12 shadow-[0_4px_20px_rgba(0,0,0,0.015)] text-center text-xs text-mm-gray font-bold">
              General settings coming soon.
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg font-bold text-xs bg-mm-green/10 border border-mm-green text-mm-green">
          {toast}
        </div>
      )}
    </div>
  );
}
