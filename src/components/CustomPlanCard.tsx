import React, { useState, useRef, useEffect } from "react";
import PLANS, { Plan, AddOns } from "@/data/plans";
import { ShoppingCart } from "lucide-react";

type Props = {
  plan: Plan;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  buttonCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const CustomPlanCard = ({ plan, buttonRef, buttonCanvasRef }: Props) => {
  const [selectedBase, setSelectedBase] = useState<string>("Basic");
  const [extraFeatures, setExtraFeatures] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Contact form step states
  const [showContactForm, setShowContactForm] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find the selected base plan details
  const basePlan = PLANS.find((p) => p.name === selectedBase) || PLANS[0];

  // Get other plans (Basic, Plus, Pro) to extract extra add-on features
  const otherPlans = PLANS.filter((p) => p.name !== selectedBase && p.name !== "Customize");

  // Gather unique available features from the other plans that are not in the selected base package
  const baseFeatures = basePlan.features;
  const availableExtras = Array.from(
    new Set(otherPlans.flatMap((p) => p.features))
  ).filter((f) => !baseFeatures.includes(f));

  const handleToggleFeature = (feature: string) => {
    setExtraFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const handleContactUs = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!showContactForm) {
      setShowContactForm(true);
      return;
    }

    // Input Validation
    if (!email.trim() || !phone.trim()) {
      alert("Please fill in both your Email and Contact Number.");
      return;
    }

    const compiledPlan = {
      basePlanName: selectedBase,
      extraFeatures: extraFeatures,
      contactInfo: {
        email: email.trim(),
        phone: phone.trim(),
      },
      timestamp: new Date().toISOString(),
    };

    console.log("Compiled custom plan request submitted:", compiledPlan);
    alert(`Thank you! Your custom plan request has been submitted.\nCheck the console for the full object payload.`);

    // Reset Form & Selection
    setShowContactForm(false);
    setEmail("");
    setPhone("");
    setExtraFeatures([]);
    setSelectedBase("Basic");
  };

  return (
    <div className="px-8 sm:px-9 py-6 sm:py-7 flex flex-col flex-1 relative z-10 h-full font-sans text-left">
      {/* Plan Header */}
      <div className="flex items-start justify-between w-full">
        <div>
          <p
            className="mb-1 text-xs font-bold uppercase tracking-widest"
            style={{
              color: plan.highlight ? "rgba(255,255,255,0.7)" : "#748297",
            }}
          >
            {plan.name}
          </p>
          <div className="mb-5 flex items-end gap-1">
            <span
              style={{
                fontFamily: "'Louize', Georgia, serif",
                fontSize: "clamp(2rem, 5vw, 2.8rem)",
                fontWeight: 400,
                letterSpacing: "-0.04em",
                color: plan.highlight ? "#fff" : "#111418",
              }}
            >
              {plan.price}
            </span>
            {plan.period && (
              <span
                className="mb-1 text-sm"
                style={{
                  color: plan.highlight ? "rgba(255,255,255,0.7)" : "#748297",
                }}
              >
                {plan.period}
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Shopping Cart Icon & Badge */}
        <div className="relative p-2 bg-white/10 hover:bg-white/15 transition-all rounded-full flex items-center justify-center text-white shrink-0 mt-1">
          <ShoppingCart size={18} className="stroke-[2.5]" />
          {extraFeatures.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-[#FF5924] font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-lg border border-[#FF5924]/10 animate-bounce">
              {extraFeatures.length}
            </span>
          )}
        </div>
      </div>

      {!showContactForm ? (
        <>
          {/* Base Plan Dropdown Selector (Custom design with dark charcoal dropdown menu) */}
          <div className="mb-5 flex flex-col gap-1.5 w-full relative" ref={dropdownRef}>
            <label className="text-[10px] font-black uppercase tracking-wider text-white/70">
              Select Base Package:
            </label>
            
            {/* Dropdown Button Trigger */}
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full bg-white/10 text-white border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-black flex items-center justify-between hover:bg-white/20 active:scale-[0.99] transition-all cursor-pointer select-none"
            >
              <span>{selectedBase}</span>
              <span className={`transform transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>

            {/* Dropdown Popover List (Sleek deep charcoal bg instead of orange) */}
            {dropdownOpen && (
              <div className="absolute top-[100%] left-0 right-0 mt-1 bg-[#111418] border border-white/10 rounded-xl shadow-2xl py-1.5 z-30 animate-in fade-in-50 slide-in-from-top-1 overflow-hidden">
                {["Basic", "Plus", "Pro"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSelectedBase(option);
                      setExtraFeatures([]); // Clear add-ons when switching base packages
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-black text-white transition-colors cursor-pointer hover:bg-white/10 flex items-center justify-between ${
                      selectedBase === option ? "bg-white/10" : ""
                    }`}
                  >
                    <span>{option}</span>
                    {selectedBase === option && <span className="text-white text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Optional Extra Add-on Features List */}
          <div className="mb-6 flex flex-col gap-2 flex-1 min-h-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/70">
              Add Extra Features:
            </span>
            <ul
              data-lenis-prevent
              className="flex flex-col gap-2 w-full overflow-y-auto flex-1 pr-1 max-h-[220px] overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {AddOns.map((f) => {
                const isAdded = extraFeatures.includes(f);
                return (
                  <div
                    key={f}
                    onClick={() => handleToggleFeature(f)}
                    className={`flex items-center justify-between gap-3 text-xs font-bold transition-all duration-200 rounded-xl px-3.5 py-2.5 cursor-pointer select-none border ${
                      isAdded
                        ? "bg-white border-white text-[#FF5924] shadow-md scale-[1.01]"
                        : "text-white bg-white/5 border-white/10 hover:bg-white/15 hover:border-white/20"
                    }`}
                  >
                    <span className="flex-1 pr-1">{f}</span>
                    <button
                      type="button"
                      className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 border transition-all text-xs font-black select-none cursor-pointer ${
                        isAdded
                          ? "bg-[#FF5924] text-white border-transparent"
                          : "border-white/40 text-white/80 hover:border-white"
                      }`}
                    >
                      {isAdded ? "−" : "+"}
                    </button>
                  </div>
                );
              })}
            </ul>
          </div>
        </>
      ) : (
        /* Contact Form Fields View */
        <div className="flex flex-col gap-4.5 mb-6 flex-1 justify-center animate-in fade-in-50 duration-200">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/70">
              Submit Configuration
            </span>
            <p className="text-[11px] text-white/85 leading-normal">
              Enter your details below to request a personalized quote.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-white/80 uppercase tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 text-white placeholder-white/40 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-hidden hover:bg-white/15 focus:border-white/40 transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-white/80 uppercase tracking-wide">
              Contact Number
            </label>
            <input
              type="tel"
              placeholder="e.g. +1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white/10 text-white placeholder-white/40 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-hidden hover:bg-white/15 focus:border-white/40 transition-all"
              required
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setShowContactForm(false);
              setEmail("");
              setPhone("");
            }}
            className="text-[10px] font-bold text-white/60 hover:text-white underline cursor-pointer mt-1 self-start"
          >
            ← Back to customization
          </button>
        </div>
      )}

      {/* Action Button */}
      <button
        ref={buttonRef}
        // href="#"
        onClick={handleContactUs}
        className="flex items-center justify-center rounded-full py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden mt-auto shadow-md"
        style={{
          background: "#111418",
          color: "#ffffff",
          minHeight: 44,
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <canvas
          ref={buttonCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none rounded-[inherit]"
        />
        <span className="relative z-10">
          {showContactForm ? "SUBMIT REQUEST" : plan.action}
        </span>
      </button>
    </div>
  );
};

export default CustomPlanCard;