import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Globe,
  Cpu,
  Layers,
  Zap,
  Award,
  RotateCcw,
  FileText,
  BarChart3,
  Compass,
  Target,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  ListTodo,
  Calendar,
  Lock,
  Unlock
} from "lucide-react";
import Loader from "../components/Loader";
import PriceCard from "../components/PriceCard";
import { questions } from "../data/questions";

export const Route = createFileRoute("/assessment")({
  component: AssessmentPage,
});

// A rich set of industries for the searchable dropdown
const INDUSTRIES = [
  "Technology & Software",
  "Retail & E-commerce",
  "Healthcare & Medical",
  "Finance & Investment",
  "Education & EdTech",
  "Real Estate & Construction",
  "Food & Beverage",
  "Travel & Hospitality",
  "Marketing & Advertising",
  "Legal Services",
  "Consulting & Professional Services",
  "Entertainment & Media",
  "Automotive",
  "Energy & Sustainability",
  "Manufacturing & Logistics",
  "Fashion & Apparel",
  "Beauty & Wellness",
  "Fitness & Sports",
  "Agriculture & Food Science",
  "Nonprofit & Social Impact",
  "Design & Creative Agencies",
  "Telecommunications"
];

interface IndustryDropdownProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
}

function IndustryDropdown({ value, onChange, placeholder, required }: IndustryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state if value is modified externally (e.g. form reset)
  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = search.trim()
    ? INDUSTRIES.filter(ind => ind.toLowerCase().includes(search.toLowerCase()))
    : INDUSTRIES;

  const handleSelect = (ind: string) => {
    onChange(ind);
    setSearch(ind);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    onChange(val);
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        required={required}
        value={search}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-mm-border bg-mm-subtle/10 text-mm-dark focus:outline-none focus:ring-2 focus:ring-mm-orange/40 focus:border-mm-orange/80 transition-all duration-200 text-sm"
      />
      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-20 w-full mt-1 max-h-60 overflow-y-auto rounded-xl border border-mm-border bg-white shadow-2xl focus:outline-none py-1.5 scrollbar-none">
          {filtered.map((ind) => (
            <li
              key={ind}
              onClick={() => handleSelect(ind)}
              className="px-4 py-2 text-sm text-mm-dark hover:bg-mm-orange/10 hover:text-mm-orange cursor-pointer transition-colors"
            >
              {ind}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AgentLoadingConsole() {
  const [elapsedTime, setElapsedTime] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine current stage status text
  let statusText = "Initiating assessment crew...";
  if (elapsedTime > 220) {
    statusText = "Compiling structured JSON report payload...";
  } else if (elapsedTime > 160) {
    statusText = "Synthesizing SWOT matrix & growth opportunities...";
  } else if (elapsedTime > 80) {
    statusText = "Auditing competitors & online SEO presence...";
  } else if (elapsedTime > 15) {
    statusText = "Running discovery checks on business profile...";
  }

  const progress = Math.min(98, 5 + (elapsedTime / 240) * 93);

  return (
    <Loader
      statusText={statusText}
      elapsedTime={elapsedTime}
      progress={progress}
      showProgress={true}
    />
  );
}

interface AuditReportDashboardProps {
  report: any;
  onReset: () => void;
}

const renderValue = (val: any): React.ReactNode => {
  if (val === null || val === undefined) return "N/A";
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (Array.isArray(val)) {
    return (
      <ul className="list-disc pl-4 space-y-1">
        {val.map((item, i) => (
          <li key={i}>{typeof item === "object" ? renderValue(item) : String(item)}</li>
        ))}
      </ul>
    );
  }
  if (typeof val === "object") {
    return (
      <div className="space-y-1">
        {Object.entries(val).map(([k, v]) => (
          <div key={k} className="text-xs text-mm-dark">
            <span className="font-bold text-mm-dark/75 uppercase tracking-wider text-[10px] mr-1.5">{k.replace(/_/g, " ")}:</span>
            <span>{typeof v === "object" ? renderValue(v) : String(v)}</span>
          </div>
        ))}
      </div>
    );
  }
  return String(val);
};

function AuditReportDashboard({ report, onReset }: AuditReportDashboardProps) {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem("audit_unlocked") === "true";
  });
  const [activeTab, setActiveTab] = useState<"overview" | "signup" | "status" | "market" | "roadmap">("overview");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left");
  const [cooldown, setCooldown] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  
  const [bottomProgress, setBottomProgress] = useState(0);
  const bottomProgressRef = useRef(0);
  const updateBottomProgress = (newVal: number) => {
    const val = Math.max(0, Math.min(100, newVal));
    bottomProgressRef.current = val;
    setBottomProgress(val);
  };

  const slides = isUnlocked
    ? ["overview", "status", "market", "roadmap"]
    : ["overview", "signup"];

  const triggerSlideTransition = (targetTab: "overview" | "signup" | "status" | "market" | "roadmap", direction: "left" | "right") => {
    if (isTransitioning || activeTab === targetTab) return;
    setIsTransitioning(true);
    setSlideDirection(direction);

    // Smoothly scroll to the dashboard card container
    if (dashboardRef.current) {
      dashboardRef.current.scrollIntoView({ behavior: "smooth" });
    }

    setTimeout(() => {
      setActiveTab(targetTab);
      setIsTransitioning(false);
    }, 400);
  };

  useEffect(() => {
    if (cooldown || isTransitioning) {
      updateBottomProgress(0);
      return;
    }

    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const isAtBottom = maxScroll - currentScroll <= 20;

      if (!isAtBottom) {
        updateBottomProgress(0);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (cooldown || isTransitioning) return;

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const isAtBottom = maxScroll - currentScroll <= 20;

      if (isAtBottom) {
        const currentIndex = slides.indexOf(activeTab);
        const hasNext = currentIndex !== -1 && currentIndex < slides.length - 1;

        if (hasNext) {
          if (e.deltaY > 0) {
            // Fill bar dynamically proportional to scroll speed
            const increment = Math.min(25, Math.abs(e.deltaY) * 0.15);
            const nextProgress = bottomProgressRef.current + increment;
            updateBottomProgress(nextProgress);

            if (nextProgress >= 100) {
              const nextTab = slides[currentIndex + 1] as any;
              setCooldown(true);
              triggerSlideTransition(nextTab, "left");
              setTimeout(() => {
                setCooldown(false);
                updateBottomProgress(0);
              }, 1200);
            }
          } else if (e.deltaY < 0) {
            updateBottomProgress(0);
          }
        }
      } else {
        updateBottomProgress(0);
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (cooldown || isTransitioning) return;

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const isAtBottom = maxScroll - currentScroll <= 20;

      if (isAtBottom) {
        const currentIndex = slides.indexOf(activeTab);
        const hasNext = currentIndex !== -1 && currentIndex < slides.length - 1;

        if (hasNext && e.touches.length === 1) {
          const touchY = e.touches[0].clientY;
          const deltaY = touchStartY - touchY; // positive means swiping up/scrolling down

          if (deltaY > 0) {
            const increment = deltaY * 0.45;
            const nextProgress = bottomProgressRef.current + increment;
            touchStartY = touchY; // reset for continuous drag tracking
            updateBottomProgress(nextProgress);

            if (nextProgress >= 100) {
              const nextTab = slides[currentIndex + 1] as any;
              setCooldown(true);
              triggerSlideTransition(nextTab, "left");
              setTimeout(() => {
                setCooldown(false);
                updateBottomProgress(0);
              }, 1200);
            }
          } else if (deltaY < -10) {
            updateBottomProgress(0);
          }
        }
      } else {
        updateBottomProgress(0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [activeTab, isUnlocked, isTransitioning, cooldown, slides]);

  // Slow decay back to 0% if scrolling stops
  useEffect(() => {
    if (bottomProgress === 0 || cooldown || isTransitioning) return;

    const timer = setInterval(() => {
      updateBottomProgress(bottomProgressRef.current - 1.5);
    }, 30);

    return () => clearInterval(timer);
  }, [bottomProgress, cooldown, isTransitioning]);

  const overview = report?.business_overview || {};

  const sectionLabels = {
    overview: "Executive Summary & SWOT",
    signup: "Unlock Full Report",
    status: "Capabilities & Pain Points",
    market: "Market & Competitor Audit",
    roadmap: "Growth Plan & Pricing"
  };

  const renderSlideFooter = () => {
    const currentIndex = slides.indexOf(activeTab);
    const prevSlide = currentIndex > 0 ? slides[currentIndex - 1] : null;
    const nextSlide = currentIndex < slides.length - 1 ? slides[currentIndex + 1] : null;

    if (!prevSlide && !nextSlide) return null;

    return (
      <div className="mt-12 pt-6 border-t border-mm-border flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
        {prevSlide ? (
          <button
            onClick={() => triggerSlideTransition(prevSlide as any, "right")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-mm-dark/5 hover:bg-mm-dark/10 text-mm-dark text-xs font-bold py-2.5 px-5 rounded-xl border border-mm-border transition duration-200 cursor-pointer select-none"
          >
            ← Back to {sectionLabels[prevSlide as keyof typeof sectionLabels]}
          </button>
        ) : (
          <div className="hidden sm:block" />
        )}

        {nextSlide ? (
          <button
            onClick={() => {
              if (nextSlide === "signup" && !isUnlocked) {
                triggerSlideTransition("signup", "left");
              } else {
                triggerSlideTransition(nextSlide as any, "left");
              }
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-mm-orange/10 hover:bg-mm-orange/20 text-mm-orange text-xs font-bold py-2.5 px-5 rounded-xl border border-mm-orange/20 transition duration-200 cursor-pointer select-none"
          >
            Go to {sectionLabels[nextSlide as keyof typeof sectionLabels]} →
          </button>
        ) : (
          <div className="hidden sm:block" />
        )}
      </div>
    );
  };

  return (
    <div ref={dashboardRef} className="max-w-7xl w-full mx-auto space-y-8 animate-fadeIn scroll-mt-20">
      {/* Top Banner Header */}
      <div className="relative bg-white/80 backdrop-blur-xl border border-mm-border shadow-2xl rounded-2xl py-4 px-6 sm:py-5 sm:px-8 overflow-hidden">
        <div className="absolute -inset-1.5 bg-gradient-to-r from-mm-orange to-mm-pink rounded-2xl blur opacity-5 -z-10"></div>
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-mm-orange/30 bg-mm-orange/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-mm-orange uppercase select-none">
            <Award className="h-3 w-3 text-mm-orange" />
            Audit Complete
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-mm-dark">
            {overview.business_name || "Business"} Audit Report
          </h1>
          <div className="text-xs text-mm-gray flex flex-wrap gap-2 items-center">
            <span>Industry:</span>
            <span className="font-semibold text-mm-dark">{renderValue(overview.industry)}</span>
            <span className="text-mm-border">&bull;</span>
            <span>Target:</span>
            <span className="font-semibold text-mm-dark">{renderValue(overview.target_audience)}</span>
          </div>
        </div>
      </div>

      {/* Tabs list selector */}
      <div className="flex border-b border-mm-border/60 overflow-x-auto gap-2 scrollbar-none pb-0.5 animate-fadeIn">
        {[
          { id: "overview", label: "Executive Summary & SWOT", icon: FileText, locked: false },
          { id: "status", label: "Capabilities & Pain Points", icon: BarChart3, locked: !isUnlocked },
          { id: "market", label: "Market & Competitor Audit", icon: Compass, locked: !isUnlocked },
          { id: "roadmap", label: "Growth Plan & Pricing", icon: Target, locked: !isUnlocked }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.locked) {
                  triggerSlideTransition("signup", "left");
                } else {
                  const currentIndex = ["overview", "signup", "status", "market", "roadmap"].indexOf(activeTab);
                  const targetIndex = ["overview", "signup", "status", "market", "roadmap"].indexOf(tab.id);
                  if (currentIndex !== -1 && targetIndex !== -1) {
                    const direction = targetIndex > currentIndex ? "left" : "right";
                    triggerSlideTransition(tab.id as any, direction);
                  }
                }
              }}
              className={`flex items-center gap-2 py-3 px-5 text-sm font-bold border-b-2 whitespace-nowrap transition duration-200 cursor-pointer ${isActive
                ? "border-mm-orange text-mm-orange"
                : "border-transparent text-mm-gray hover:text-mm-dark hover:border-mm-border/80"
                }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.locked && <Lock className="h-3 w-3 text-mm-gray/50 ml-1" />}
            </button>
          );
        })}
      </div>

      {/* Tab Contents Container */}
      <div
        className={`bg-white/80 backdrop-blur-xl border border-mm-border shadow-2xl rounded-3xl p-6 sm:p-10 min-h-[400px] transition-all duration-300 ${isTransitioning
          ? "opacity-0 scale-[0.99] translate-y-1"
          : "opacity-100 scale-100 translate-y-0"
          }`}
      >
        <div className={isTransitioning ? "" : slideDirection === "left" ? "animate-slideInRight" : "animate-slideInLeft"}>
          {/* Tab 1: Overview & SWOT */}
          {activeTab === "overview" && (
            <SWOTPanel
              report={report}
              slideDirection={slideDirection}
              renderSlideFooter={renderSlideFooter}
            />
          )}

          {/* Tab: Signup Teaser Slide */}
          {activeTab === "signup" && !isUnlocked && (
            <TeaserGatePanel
              slideDirection={slideDirection}
              triggerSlideTransition={triggerSlideTransition}
            />
          )}

          {/* Tab 2: Status & Pain Points */}
          {activeTab === "status" && isUnlocked && (
            <CapabilitiesPanel
              report={report}
              slideDirection={slideDirection}
              renderSlideFooter={renderSlideFooter}
            />
          )}

          {/* Tab 3: Market & Competitors */}
          {activeTab === "market" && isUnlocked && (
            <CompetitorPanel
              report={report}
              slideDirection={slideDirection}
              renderSlideFooter={renderSlideFooter}
            />
          )}

          {/* Tab 4: Roadmap & Pricing Recommendation */}
          {activeTab === "roadmap" && isUnlocked && (
            <RoadmapPanel
              report={report}
              slideDirection={slideDirection}
              renderSlideFooter={renderSlideFooter}
            />
          )}
        </div>
      </div>
      {bottomProgress > 0 && (
        <div className="fixed bottom-0 left-0 w-full h-1 bg-transparent z-[9999] pointer-events-none no-print">
          <div 
            className="h-full bg-mm-orange transition-all duration-75 ease-out shadow-[0_0_8px_#FF5924]"
            style={{ width: `${bottomProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}
interface PanelProps {
  report: any;
  slideDirection: "left" | "right";
  renderSlideFooter: () => React.ReactNode;
}

interface TeaserGatePanelProps {
  slideDirection: "left" | "right";
  triggerSlideTransition: (targetTab: "overview" | "signup" | "status" | "market" | "roadmap", direction: "left" | "right") => void;
}

// SWOT Panel
function SWOTPanel({ report, slideDirection, renderSlideFooter }: PanelProps) {
  const summary = report?.executive_summary || {};
  const overview = report?.business_overview || {};
  const swot = report?.swot_analysis || {};

  return (
    <div className={`space-y-8 ${slideDirection === "left" ? "animate-slideInRight" : "animate-slideInLeft"}`}>
      {/* Executive Summary */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-mm-dark flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-mm-orange" />
          Executive Summary
        </h2>
        <p className="text-sm text-mm-dark/80 leading-relaxed bg-mm-subtle/10 p-5 rounded-2xl border border-mm-border/50">
          {renderValue(summary.summary)}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-3">
          <div className="p-4 rounded-xl bg-mm-subtle/10 border border-mm-border/50">
            <h4 className="font-bold text-mm-orange mb-1 uppercase tracking-wider">Current State</h4>
            <p className="text-mm-dark/95">{renderValue(summary.current_state)}</p>
          </div>
          <div className="p-4 rounded-xl bg-mm-subtle/10 border border-mm-border/50">
            <h4 className="font-bold text-mm-pink mb-1 uppercase tracking-wider">Growth Opportunities</h4>
            <p className="text-mm-dark/95">{renderValue(summary.opportunities)}</p>
          </div>
        </div>
      </div>

      {/* SWOT Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-mm-dark flex items-center gap-2">
          <Layers className="h-5 w-5 text-mm-orange" />
          SWOT Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="p-6 rounded-2xl bg-mm-green/5 border border-mm-green/20 text-mm-green space-y-2">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
              <span className="p-1.5 rounded-lg bg-mm-green/10"><CheckCircle2 className="h-4 w-4" /></span>
              Strengths
            </div>
            <div className="text-sm leading-relaxed text-mm-dark/85">{renderValue(swot.strengths)}</div>
          </div>

          {/* Weaknesses */}
          <div className="p-6 rounded-2xl bg-mm-red/5 border border-mm-red/20 text-mm-red space-y-2">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
              <span className="p-1.5 rounded-lg bg-mm-red/10"><AlertTriangle className="h-4 w-4" /></span>
              Weaknesses
            </div>
            <div className="text-sm leading-relaxed text-mm-dark/85">{renderValue(swot.weaknesses)}</div>
          </div>

          {/* Opportunities */}
          <div className="p-6 rounded-2xl bg-mm-blue/5 border border-mm-blue/20 text-mm-blue space-y-2">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
              <span className="p-1.5 rounded-lg bg-mm-blue/10"><TrendingUp className="h-4 w-4" /></span>
              Opportunities
            </div>
            <div className="text-sm leading-relaxed text-mm-dark/85">{renderValue(swot.opportunities)}</div>
          </div>

          {/* Threats */}
          <div className="p-6 rounded-2xl bg-mm-orange/5 border border-mm-orange/20 text-mm-orange space-y-2">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
              <span className="p-1.5 rounded-lg bg-mm-orange/10"><ShieldAlert className="h-4 w-4" /></span>
              Threats
            </div>
            <div className="text-sm leading-relaxed text-mm-dark/85">{renderValue(swot.threats)}</div>
          </div>
        </div>
      </div>

      {/* Business Profile Details */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-mm-dark">Business Profile Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { label: "Core Services", val: overview.core_services },
            { label: "Revenue Model", val: overview.revenue_model },
            { label: "Business Idea", val: overview.business_idea }
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-mm-subtle/10 border border-mm-border/50 text-sm space-y-1">
              <span className="text-xs font-semibold text-mm-gray uppercase tracking-wider">{item.label}</span>
              <div className="text-mm-dark/95 font-medium">{renderValue(item.val)}</div>
            </div>
          ))}
        </div>
      </div>

      {renderSlideFooter()}
    </div>
  );
}

// Teaser Gate Panel
function TeaserGatePanel({ slideDirection, triggerSlideTransition }: TeaserGatePanelProps) {
  const navigate = useNavigate();

  return (
    <div className={`flex flex-col items-center justify-center py-6 text-center space-y-8 max-w-2xl mx-auto ${slideDirection === "left" ? "animate-slideInRight" : "animate-slideInLeft"}`}>
      
      {/* Circular Lock Badge */}
      <div className="relative">
        <div className="absolute -inset-1.5 bg-mm-red/20 rounded-full blur-md opacity-50 animate-pulse"></div>
        <div className="relative p-5 bg-white border border-mm-red/20 rounded-full text-mm-red shadow-lg shadow-mm-red/5">
          <Lock className="h-9 w-9 text-mm-red" strokeWidth={1.5} />
        </div>
      </div>

      {/* Title & Banner */}
      <div className="space-y-4 w-full">
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-mm-dark">
          Unlock the Complete Audit
        </h2>
        <div className="bg-mm-pink/5 border border-mm-pink/20 py-4 px-6 rounded-2xl max-w-xl mx-auto">
          <p className="text-sm sm:text-base font-bold text-mm-dark leading-relaxed">
            Unlock the complete report to see what's holding your business back and exactly what to do next.
          </p>
        </div>
      </div>

      {/* Benefits 3-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left font-sans">
        <div className="p-5 rounded-2xl bg-white border border-mm-border space-y-1.5 shadow-sm">
          <span className="text-mm-red font-bold text-xs sm:text-sm block">Business Health Score</span>
          <span className="text-mm-gray text-xs leading-relaxed block">See your overall business performance and discover the biggest opportunities for growth.</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-mm-border space-y-1.5 shadow-sm">
          <span className="text-mm-red font-bold text-xs sm:text-sm block">Competitor Analysis</span>
          <span className="text-mm-gray text-xs leading-relaxed block">See how your business performs against others in your industry.</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-mm-border space-y-1.5 shadow-sm">
          <span className="text-mm-red font-bold text-xs sm:text-sm block">AI Recommendations</span>
          <span className="text-mm-gray text-xs leading-relaxed block">Know exactly which services your business actually needs from website and SEO to CRM, chatbots, automation, and marketing.</span>
        </div>
      </div>

      {/* Sign Up Teaser & Action */}
      <div className="space-y-5 w-full pt-4">
        <p className="text-sm font-medium text-mm-gray">
          It's completely free! Sign up here to view your report.
        </p>

        <button
          onClick={() => navigate({ to: "/signup" })}
          className="inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl bg-mm-red hover:opacity-90 text-white font-bold transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-mm-red/10 w-full sm:w-auto"
        >
          <Lock className="h-4 w-4" />
          Sign Up & Unlock Report
        </button>
      </div>

      {/* Standalone Bottom Back Pill */}
      <div className="pt-6 w-full border-t border-mm-border/50 flex justify-center">
        <button
          onClick={() => triggerSlideTransition("overview", "right")}
          className="inline-flex items-center justify-center gap-2 bg-mm-dark/5 hover:bg-mm-dark/10 text-mm-dark text-xs font-semibold py-2.5 px-5 rounded-full border border-transparent transition duration-200 cursor-pointer select-none mx-auto w-fit"
        >
          Back to Executive Summary & SWOT
        </button>
      </div>
    </div>
  );
}

// Capabilities Panel
function CapabilitiesPanel({ report, slideDirection, renderSlideFooter }: PanelProps) {
  const status = report?.current_business_status || {};
  const painPoints = report?.pain_points || {};

  return (
    <div className={`space-y-8 ${slideDirection === "left" ? "animate-slideInRight" : "animate-slideInLeft"}`}>
      {/* Business Status Metrics */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-mm-dark">Current Digital Capabilities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { title: "Website Presence", desc: status.website_presence },
            { title: "Search Engine Visibility", desc: status.search_engine_visibility },
            { title: "Marketing Presence", desc: status.marketing_presence },
            { title: "Social Media Presence", desc: status.social_media_presence },
            { title: "Brand Awareness", desc: status.brand_awareness },
            { title: "Digital Maturity", desc: status.digital_maturity }
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-mm-subtle/10 border border-mm-border/50 space-y-2">
              <h3 className="text-sm font-bold text-mm-orange">{item.title}</h3>
              <div className="text-xs text-mm-dark/75 leading-relaxed">{renderValue(item.desc)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pain Points */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-mm-dark flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-mm-orange" />
          Identified Pain Points & Roadblocks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { title: "Business Challenges", text: painPoints.business_challenges },
            { title: "Marketing Challenges", text: painPoints.marketing_challenges },
            { title: "Website & UX Challenges", text: painPoints.website_challenges },
            { title: "SEO Obstacles", text: painPoints.seo_challenges },
            { title: "Branding Bottlenecks", text: painPoints.branding_challenges },
            { title: "Lead Generation Gaps", text: painPoints.lead_generation_challenges }
          ].map((item, idx) => (
            <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-mm-red/5 border border-mm-red/15">
              <div className="text-mm-red font-bold text-lg select-none">!</div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-mm-dark/80">{item.title}</h4>
                <div className="text-xs text-mm-dark/90 leading-relaxed">{renderValue(item.text)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {renderSlideFooter()}
    </div>
  );
}

// Competitor Panel
function CompetitorPanel({ report, slideDirection, renderSlideFooter }: PanelProps) {
  const competitor = report?.competitor_analysis || {};
  const positioning = report?.market_positioning || {};
  const risk = report?.risk_assessment || {};

  return (
    <div className={`space-y-8 ${slideDirection === "left" ? "animate-slideInRight" : "animate-slideInLeft"}`}>
      {/* Competitor Analysis */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-mm-dark flex items-center gap-2">
          <Globe className="h-5 w-5 text-mm-orange" />
          Competitor Analysis
        </h2>
        <div className="text-sm text-mm-dark/85 leading-relaxed bg-mm-subtle/10 p-5 rounded-2xl border border-mm-border/50">
          <span className="font-semibold text-mm-dark">Competitor Landscape: </span>
          {renderValue(competitor.competitor_landscape)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: "Major Competitors", text: competitor.major_competitors, color: "border-mm-border bg-mm-subtle/10" },
            { label: "Competitor Strengths", text: competitor.competitor_strengths, color: "border-mm-green/20 bg-mm-green/5 text-mm-green" },
            { label: "Competitor Weaknesses", text: competitor.competitor_weaknesses, color: "border-mm-red/20 bg-mm-red/5 text-mm-red" }
          ].map((item, idx) => (
            <div key={idx} className={`p-5 rounded-2xl border ${item.color} space-y-2`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-mm-dark/80">{item.label}</h4>
              <div className="text-xs text-mm-dark/95 leading-relaxed">{renderValue(item.text)}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {[
            { label: "Competitive Advantages", text: competitor.competitive_advantages },
            { label: "Competitive Gaps", text: competitor.competitive_gaps },
            { label: "Missed Opportunities", text: competitor.missed_opportunities }
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-mm-subtle/10 border border-mm-border/50 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-mm-dark/80">{item.label}</h4>
              <div className="text-xs text-mm-dark/90 leading-relaxed">{renderValue(item.text)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Positioning */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-mm-dark">Market Positioning</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: "Current Market Position", text: positioning.current_market_position },
            { label: "Industry Standing", text: positioning.industry_standing },
            { label: "Online Visibility", text: positioning.online_visibility },
            { label: "Brand Positioning", text: positioning.brand_positioning }
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-mm-subtle/10 border border-mm-border/50 space-y-1">
              <span className="text-xs font-semibold text-mm-gray uppercase tracking-wider">{item.label}</span>
              <div className="text-xs text-mm-dark/90 leading-relaxed">{renderValue(item.text)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="p-6 rounded-3xl bg-mm-subtle/10 border border-mm-border space-y-6">
        <div className="flex justify-between items-center border-b border-mm-border pb-4">
          <h3 className="text-lg font-bold text-mm-dark flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-mm-orange" />
            Risk Assessment Profile
          </h3>
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold select-none border uppercase tracking-widest ${risk.overall_risk_level?.toLowerCase() === "high"
            ? "bg-mm-red/10 text-mm-red border-mm-red/30"
            : risk.overall_risk_level?.toLowerCase() === "medium"
              ? "bg-mm-orange/10 text-mm-orange border-mm-orange/30"
              : "bg-mm-green/10 text-mm-green border-mm-green/30"
            }`}>
            {risk.overall_risk_level || "Medium"} Risk
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { label: "Major Risks", text: risk.major_risks },
            { label: "Business Threats", text: risk.business_threats },
            { label: "Digital Risks", text: risk.digital_risks },
            { label: "Market Risks", text: risk.market_risks }
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white/60 border border-mm-border text-xs space-y-1">
              <span className="font-semibold text-mm-gray">{item.label}</span>
              <div className="text-mm-dark/90 leading-relaxed">{renderValue(item.text)}</div>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-2xl bg-mm-green/5 border border-mm-green/15 text-xs space-y-1">
          <span className="font-bold text-mm-green uppercase tracking-wide">Mitigation Strategies</span>
          <div className="text-mm-dark/90 leading-relaxed">{renderValue(risk.mitigation_strategies)}</div>
        </div>
      </div>

      {renderSlideFooter()}
    </div>
  );
}

// Roadmap Panel
function RoadmapPanel({ report, slideDirection, renderSlideFooter }: PanelProps) {
  const priority = report?.priority_action_plan || {};
  const roadmap = report?.roadmap_30_60_90 || {};
  const growth = report?.growth_opportunities || {};
  const recommendedPlan = report?.recommended_plan || {};
  const services = report?.recommended_services || {};

  return (
    <div className={`space-y-8 ${slideDirection === "left" ? "animate-slideInRight" : "animate-slideInLeft"}`}>
      {/* Priority Action Items */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-mm-dark flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-mm-orange" />
          Priority Action Plan
        </h2>
        <div className="space-y-3.5">
          {[
            { prio: "Priority 1", val: priority.priority_1 },
            { prio: "Priority 2", val: priority.priority_2 },
            { prio: "Priority 3", val: priority.priority_3 },
            { prio: "Priority 4", val: priority.priority_4 },
            { prio: "Priority 5", val: priority.priority_5 }
          ].filter(p => p.val).map((item, idx) => (
            <div key={idx} className="flex gap-4 items-center p-4 bg-mm-subtle/10 border border-mm-border rounded-2xl text-sm">
              <span className="h-8 w-8 rounded-xl bg-mm-orange/10 border border-mm-orange/30 text-mm-orange font-bold flex items-center justify-center text-xs select-none">
                {idx + 1}
              </span>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-mm-gray uppercase tracking-wider">{item.prio}</span>
                <div className="text-mm-dark/90 font-medium leading-relaxed">{renderValue(item.val)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 30-60-90 Roadmap */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-mm-dark flex items-center gap-2">
          <Calendar className="h-5 w-5 text-mm-orange" />
          30-60-90 Days Implementation Roadmap
        </h2>
        <div className="relative border-l-2 border-mm-border ml-3.5 pl-6 py-2 space-y-6">
          {[
            { day: "30 Days Plan", detail: roadmap["30_days"], icon: Zap },
            { day: "60 Days Plan", detail: roadmap["60_days"], icon: TrendingUp },
            { day: "90 Days Plan", detail: roadmap["90_days"], icon: Sparkles }
          ].filter(r => r.detail).map((item, idx) => (
            <div key={idx} className="relative group">
              <span className="absolute -left-[35px] top-1 p-1 bg-white border-2 border-mm-orange rounded-full text-mm-orange transition-colors duration-300">
                <item.icon className="h-4.5 w-4.5" />
              </span>
              <div className="bg-white/60 border border-mm-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h4 className="text-sm font-bold text-mm-dark flex items-center gap-2">
                  {item.day}
                </h4>
                <div className="text-xs text-mm-gray leading-relaxed mt-2">
                  {renderValue(item.detail)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Growth Opportunities */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-mm-dark flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-mm-orange" />
          Strategic Growth Opportunities
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { label: "Website Improvements", text: growth.website },
            { label: "SEO Optimizations", text: growth.seo },
            { label: "Local SEO Profile", text: growth.local_seo },
            { label: "Social Media Strategy", text: growth.social_media },
            { label: "Brand Positioning", text: growth.branding },
            { label: "Content Marketing", text: growth.content_marketing },
            { label: "Customer Acquisition", text: growth.customer_acquisition },
            { label: "Lead Generation Features", text: growth.lead_generation },
            { label: "Automation Potential", text: growth.automation }
          ].filter(g => g.text).map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-mm-subtle/10 border border-mm-border space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-mm-orange">{item.label}</h4>
              <div className="text-xs text-mm-gray leading-relaxed">{renderValue(item.text)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Plan / Pricing Section */}
      {(() => {
        const parsedFeatures = typeof recommendedPlan.features_included_in_the_plan === "string"
          ? recommendedPlan.features_included_in_the_plan.split(/[,\n]/).map((f: string) => f.trim()).filter(Boolean)
          : Array.isArray(recommendedPlan.features_included_in_the_plan)
            ? recommendedPlan.features_included_in_the_plan.map((f: any) => String(f).trim()).filter(Boolean)
            : ["AI Deep Audit Report", "Competitor Benchmarking", "Growth Implementation Guide"];

        const planData = {
          name: recommendedPlan.plan_name || "Basic Plan",
          price: recommendedPlan.monthly_price ? `$${recommendedPlan.monthly_price}` : "$30",
          period: "/ month",
          action: "Choose Plan",
          features: parsedFeatures,
          highlight: recommendedPlan.plan_name?.toLowerCase().includes("premium") || recommendedPlan.plan_name?.toLowerCase().includes("pro") || false,
        };

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-4">
            {/* Plan Card */}
            <div className="lg:col-span-6 flex justify-center">
              <PriceCard plan={planData} i={0} />
            </div>

            {/* Recommended Services Grid */}
            <div className="lg:col-span-6 bg-white/60 border border-mm-border rounded-3xl p-6 sm:p-8 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-mm-dark">Recommended Technical Improvements</h3>
                <p className="text-xs text-mm-gray leading-relaxed">
                  Based on your profile, the AI audit engine has targeted these specific services to improve your online presence:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs h-full overflow-y-auto max-h-[300px] pr-1">
                {[
                  { label: "Website", val: services.website_improvements },
                  { label: "SEO Optimization", val: services.seo_improvements },
                  { label: "Brand Identity", val: services.branding_improvements },
                  { label: "Social Strategy", val: services.social_media_improvements },
                  { label: "Local SEO Profile", val: services.google_business_profile_optimization },
                  { label: "Content Marketing", val: services.content_marketing },
                  { label: "Email Campaigns", val: services.email_marketing },
                  { label: "AI & Automation", val: services.automation_opportunities }
                ].filter(s => s.val).map((item, idx) => (
                  <div key={idx} className="p-3 bg-mm-subtle/10 rounded-xl border border-mm-border space-y-1">
                    <span className="font-bold text-mm-gray uppercase tracking-wider text-[9px]">{item.label}</span>
                    <div className="text-[11px] text-mm-dark/85 leading-relaxed font-medium">{renderValue(item.val)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {renderSlideFooter()}
    </div>
  );
}

function AssessmentPage() {
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    return questions.reduce((acc, q) => {
      acc[q.id] = "";
      return acc;
    }, {} as Record<string, string>);
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [auditReport, setAuditReport] = useState<any | null>(() => {
    try {
      const saved = localStorage.getItem("latest_audit_report");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("http://localhost:8000/api/assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setAuditReport(data);
      localStorage.setItem("latest_audit_report", JSON.stringify(data));

      // Reset form fields
      setFormData(
        questions.reduce((acc, q) => {
          acc[q.id] = "";
          return acc;
        }, {} as Record<string, string>)
      );
    } catch (err: any) {
      console.error("Submission failed:", err);
      setSubmitError("Failed to connect to backend server. Make sure FastAPI is running on port 8000.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <div className="h-screen w-full overflow-hidden bg-[var(--color-mm-subtle)]/30 relative flex flex-col items-center justify-center font-sans px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="absolute top-8 left-8 sm:left-12 sm:top-10 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-mm-border hover:bg-mm-subtle/40 text-mm-dark text-xs font-semibold shadow-sm transition-all select-none cursor-pointer z-50 no-print"
        >
          ← Back
        </Link>
        {/* Decorative ambient background glows */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-mm-blue/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-mm-pink/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <AgentLoadingConsole />
      </div>
    );
  }

  if (auditReport) {
    return (
      <div className="min-h-screen w-full pt-28 pb-12 px-4 sm:px-6 lg:px-8 bg-[var(--color-mm-subtle)]/30 relative overflow-hidden flex flex-col items-center justify-center font-sans">
        <Link
          to="/"
          className="absolute top-8 left-8 sm:left-12 sm:top-10 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-mm-border hover:bg-mm-subtle/40 text-mm-dark text-xs font-semibold shadow-sm transition-all select-none cursor-pointer z-50 no-print"
        >
          ← Back
        </Link>
        {/* Decorative ambient background glows */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-mm-blue/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-mm-pink/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <AuditReportDashboard
          report={auditReport}
          onReset={() => {
            localStorage.removeItem("latest_audit_report");
            localStorage.removeItem("audit_unlocked");
            setAuditReport(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full lg:h-screen lg:overflow-hidden bg-[var(--color-mm-subtle)]/30 relative flex flex-col items-center justify-center font-sans py-12 px-4 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="absolute top-8 left-8 sm:left-12 sm:top-10 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-mm-border hover:bg-mm-subtle/40 text-mm-dark text-xs font-semibold shadow-sm transition-all select-none cursor-pointer z-50 no-print"
      >
        ← Back
      </Link>
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-mm-blue/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-mm-pink/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Side: Descriptive Text with Orange-Red Gradient Accent */}
        <div className="lg:col-span-5 space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-mm-orange/30 bg-mm-orange/10 px-3.5 py-1.5 text-xs font-bold tracking-wider text-mm-orange uppercase select-none w-fit">
            <Zap className="h-3.5 w-3.5 text-mm-orange animate-bounce" />
            AI BUSINESS ANALYZER
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-mm-dark leading-[1.15]">
              Before You Invest
              <br />
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-mm-orange to-mm-pink">
                Know What You Actually Need.
                <span className="absolute bottom-1 left-0 h-[6px] w-full bg-mm-orange/25 -z-10 rounded-full"></span>
              </span>
            </h1>
            <p className="text-base text-mm-gray leading-relaxed">
              Answer a few simple questions about your business, and our AI will analyze your current position, identify growth opportunities, and recommend exactly what your business should focus on next.
            </p>
          </div>

          {/* Benefits Bullet Points
          <div className="space-y-4 pt-2">
            {[
              {
                icon: Globe,
                title: "Competitor Benchmarking",
                desc: "Check your site metrics head-to-head with competitor URLs."
              },
              {
                icon: Cpu,
                title: "AI Readiness Score",
                desc: "Identify easy integration opportunities for chat, search, and logic."
              },
              {
                icon: Layers,
                title: "Stack Recommendations",
                desc: "Get frameworks & libraries suggestions based on your target users."
              }
            ].map((benefit, idx) => (
              <div key={idx} className="flex gap-4 items-start group">
                <div className="p-3 rounded-2xl bg-mm-orange/5 border border-mm-orange/15 text-mm-orange group-hover:bg-mm-orange/10 transition-colors">
                  <benefit.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-mm-dark">{benefit.title}</h3>
                  <p className="text-xs text-mm-gray mt-0.5">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div> */}
        </div>

        {/* Right Side: Glassmorphism Card Form */}
        <div className="lg:col-span-7 relative">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-mm-orange to-mm-pink rounded-3xl blur opacity-15 -z-10 group-hover:opacity-20 transition duration-1000"></div>

          <div className="relative bg-white/85 backdrop-blur-xl border border-mm-border shadow-2xl rounded-3xl p-6 sm:p-10">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-mm-dark flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-mm-orange animate-pulse" />
                AI Business Assessment
              </h2>
              <p className="mt-2 text-sm text-mm-gray">
                Answer the 6 business profile questions below to configure your custom AI audit.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {questions.map((q) => {
                  const isTextArea = q.type === "textarea";
                  const colSpan = isTextArea || q.id === "targetAudience" ? "sm:col-span-2" : "";

                  return (
                    <div key={q.id} className={colSpan}>
                      <label htmlFor={q.id} className="block text-xs font-bold uppercase tracking-wider text-mm-gray mb-2 flex items-center justify-between">
                        <span>{q.label}</span>
                        {!q.required && <span className="text-[10px] text-mm-gray/60 normal-case font-medium bg-mm-dark/5 px-2 py-0.5 rounded-md">Optional</span>}
                      </label>
                      {isTextArea ? (
                        <textarea
                          id={q.id}
                          name={q.id}
                          required={q.required}
                          value={formData[q.id] || ""}
                          onChange={handleChange}
                          placeholder={q.placeholder}
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-mm-border bg-mm-subtle/10 text-mm-dark focus:outline-none focus:ring-2 focus:ring-mm-orange/40 focus:border-mm-orange/80 transition-all duration-200 text-sm resize-y"
                        />
                      ) : q.id === "industry" ? (
                        <IndustryDropdown
                          value={formData.industry || ""}
                          onChange={(val) => setFormData(prev => ({ ...prev, industry: val }))}
                          placeholder={q.placeholder}
                          required={q.required}
                        />
                      ) : (
                        <input
                          type={q.type}
                          id={q.id}
                          name={q.id}
                          required={q.required}
                          value={formData[q.id] || ""}
                          onChange={handleChange}
                          placeholder={q.placeholder}
                          className="w-full px-4 py-3 rounded-xl border border-mm-border bg-mm-subtle/10 text-mm-dark focus:outline-none focus:ring-2 focus:ring-mm-orange/40 focus:border-mm-orange/80 transition-all duration-200 text-sm"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {submitError && (
                <div className="p-4 rounded-xl bg-mm-red/10 border border-mm-red/20 text-xs text-mm-red font-semibold animate-fadeIn">
                  {submitError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-mm-orange to-mm-pink text-white font-bold hover:opacity-95 shadow-md shadow-mm-orange/15 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Generating..." : "Analyze My Business"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
