import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Target,
  ShieldAlert, ListTodo, Briefcase, MapPin, Activity, Calendar,
  Award, ArrowRight, ChevronDown
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import AnimatedPlanCard from "./AnimatedPlanCard";
import PLANS from "@/data/plans";
import { useRazorpayCheckout } from "@/hooks/use-razorpay-checkout";
import { downloadReportAsPDF } from "@/utils/downloadReport";

const ScorecardCircularProgress = ({ score }: { score: number }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // ~282.74

  // Total arc angle is exactly 120 degrees
  const arcLength = (120 / 360) * circumference; // ~94.25
  const emptyLength = circumference - arcLength; // ~188.49

  // If the score is out of 10, scale it to 100 for color coding
  const normalizedScore = score <= 10 ? score * 10 : score;

  // Calculate progress filled length dynamically to prevent dash offset wrapping quirks
  const scorePercent = score <= 10 ? score / 10 : score / 100;
  const filledLength = scorePercent * arcLength;
  const remainingLength = circumference - filledLength;

  // Color coding matching user specifications
  let strokeColor = "#FF5924"; // default orange
  if (normalizedScore >= 80) strokeColor = "#10B981"; // green
  else if (normalizedScore < 50) strokeColor = "#EF4444"; // red

  return (
    <div className="relative w-28 h-16 flex items-center justify-center overflow-hidden">
      <svg className="w-full h-full" viewBox="0 10 120 55">
        {/* Track Arc (Always 120 degrees total) */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="transparent"
          stroke="#F1F4F9"
          strokeWidth="7"
          strokeDasharray={`${arcLength} ${emptyLength}`}
          strokeLinecap="round"
          transform="rotate(-150 60 60)"
        />
        {/* Progress Arc (Length is proportional to the percentage of 120 degrees) */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth="7"
          strokeDasharray={`${filledLength} ${remainingLength}`}
          strokeLinecap="round"
          transform="rotate(-150 60 60)"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {/* Score Text */}
      <div className="absolute bottom-1.5 flex flex-col items-center">
        <span className="text-lg font-black text-mm-dark leading-none">{score}</span>
        <span className="text-[8px] font-bold text-[#748297] uppercase tracking-wider mt-0.5">/ 10</span>
      </div>
    </div>
  );
};

// Fallback dummy audit report data matching fallback_audit_report.json
const DUMMY_REPORT = {
  "executive_summary": {
    "overall_score": 5,
    "summary": "This report provides a general assessment of a business's digital presence based on common industry best practices. It identifies typical strengths, challenges, and opportunities that influence online visibility, customer engagement, and long-term business growth.",
    "top_strength": "The business has an existing foundation that can be improved through structured digital optimization.",
    "biggest_challenge": "Limited digital optimization across website, SEO, branding, marketing, and customer engagement.",
    "growth_potential": "High"
  },
  "business_profile": {
    "business_name": "Business",
    "industry": "General",
    "location": "Not Specified",
    "business_model": "Products and/or Services",
    "target_audience": [
      "Potential customers based on the business niche"
    ],
    "revenue_sources": [
      "Product Sales",
      "Service Revenue",
      "Subscriptions",
      "Bookings"
    ]
  },
  "business_scorecard": {
    "overall": 5,
    "website": 5,
    "branding": 6,
    "marketing": 5,
    "social_media": 5,
    "growth_readiness": 6
  },
  "current_status": {
    "website": {
      "status": "Existing website or digital presence with opportunities for performance, usability, and conversion improvements."
    },
    "marketing": {
      "status": "Marketing activities exist but require better consistency and strategic execution."
    },
    "social_media": {
      "status": "Social media presence can benefit from consistent posting, stronger branding, and improved engagement."
    },
    "seo": {
      "status": "Basic SEO improvements are recommended to increase online visibility and search rankings."
    },
    "digital_maturity": {
      "level": "Developing"
    }
  },
  "key_findings": {
    "strengths": [
      "Existing digital presence",
      "Growth opportunities across multiple digital channels",
      "Scalable business potential"
    ],
    "weaknesses": [
      "Limited SEO optimization",
      "Inconsistent digital marketing",
      "Website optimization opportunities",
      "Brand consistency can be improved"
    ],
    "opportunities": [
      "Website optimization",
      "Google Business Profile optimization",
      "Content marketing",
      "AI-powered customer support",
      "Lead generation automation"
    ],
    "threats": [
      "Increasing digital competition",
      "Reduced online visibility",
      "Missed customer acquisition opportunities",
      "Changing customer expectations"
    ]
  },
  "risk_assessment": {
    "overall_risk": "Medium",
    "risk_score": 6,
    "top_risks": [
      "Low search visibility",
      "Inconsistent marketing",
      "Weak customer engagement",
      "Growing digital competition"
    ]
  },
  "competitor_analysis": {
    "competitive_score": 5,
    "major_competitors": [
      "Local Competitors",
      "Regional Competitors",
      "Online Industry Competitors"
    ],
    "key_advantage": "Opportunity to differentiate through better customer experience, branding, SEO, and automation.",
    "largest_gap": "Digital marketing consistency and online visibility."
  },
  "priority_actions": [
    {
      "priority": 1,
      "title": "Optimize Website Performance and User Experience",
      "impact": "High",
      "difficulty": "Medium"
    },
    {
      "priority": 2,
      "title": "Improve SEO and Search Visibility",
      "impact": "High",
      "difficulty": "Medium"
    },
    {
      "priority": 3,
      "title": "Maintain Consistent Social Media Content",
      "impact": "Medium",
      "difficulty": "Easy"
    },
    {
      "priority": 4,
      "title": "Implement AI Customer Support and Automation",
      "impact": "High",
      "difficulty": "Medium"
    },
    {
      "priority": 5,
      "title": "Optimize Google Business Profile",
      "impact": "Medium",
      "difficulty": "Easy"
    }
  ],
  "recommended_services": [
    "Website Optimization",
    "SEO Optimization",
    "Branding Improvements",
    "Social Media Management",
    "Google Business Profile Optimization",
    "Content Marketing",
    "Email Marketing",
    "AI Chatbot & Automation"
  ],
  "roadmap": {
    "30_days": [
      "Optimize website performance",
      "Implement basic SEO improvements",
      "Set up or optimize Google Business Profile",
      "Create a social media content plan"
    ],
    "60_days": [
      "Publish consistent content",
      "Strengthen branding",
      "Improve search rankings",
      "Increase customer engagement"
    ],
    "90_days": [
      "Implement AI automation",
      "Monitor analytics and KPIs",
      "Optimize lead generation",
      "Scale digital marketing efforts"
    ]
  },
  "recommended_plan": {
    "plan_name": "basic plan",
    "monthly_price": 30,
    "confidence": 75,
    "reason": "The Basic Plan provides the essential digital services most businesses need to establish a professional online presence and improve customer engagement while remaining cost-effective.",
    "expected_results": [
      "Improved online visibility",
      "Better customer engagement",
      "Higher search rankings",
      "Stronger brand credibility",
      "Increased customer inquiries"
    ]
  },
  "add_ons": [
    {
      "service": "Advanced SEO Booster Pack",
      "priority": "High",
      "reason": "Includes detailed keyword targeting and indexing fixes to boost organic traffic faster."
    },
    {
      "service": "AI Customer Support Agent",
      "priority": "Medium",
      "reason": "Automates responses to customer queries 24/7, improving lead conversion rate."
    }
  ],
};

interface ReportProps {
  initialData?: typeof DUMMY_REPORT;
  businessId?: string;
  isAdmin?: boolean;
}

export default function Report({ initialData, businessId, isAdmin }: ReportProps) {
  const [data, setData] = useState<typeof DUMMY_REPORT>(initialData || DUMMY_REPORT);
  const { handleSelectPlan, renderModals } = useRazorpayCheckout();
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      await downloadReportAsPDF(data);
    } catch (err) {
      console.error("Error downloading PDF:", err);
    } finally {
      setDownloading(false);
    }
  };

  // States for slide dot indicators
  const [activeSwotIndex, setActiveSwotIndex] = useState(0);
  const [activeRoadmapIndex, setActiveRoadmapIndex] = useState(0);

  const swotScrollRef = useRef<HTMLDivElement>(null);
  const roadmapScrollRef = useRef<HTMLDivElement>(null);

  // States for scroll indicators
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Refs for tracking current indices inside useEffect timers
  const activeSwotIndexRef = useRef(0);
  const activeRoadmapIndexRef = useRef(0);

  // Keep refs in sync with state updates
  useEffect(() => {
    activeSwotIndexRef.current = activeSwotIndex;
  }, [activeSwotIndex]);

  useEffect(() => {
    activeRoadmapIndexRef.current = activeRoadmapIndex;
  }, [activeRoadmapIndex]);

  // Page Scroll Listener for Progress
  useEffect(() => {
    setMounted(true);

    const handleScroll = (e?: Event) => {
      const docEl = document.documentElement;
      const body = document.body;

      // Let's get scroll values from window/document
      let scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
      let scrollHeight = docEl.scrollHeight || body.scrollHeight;
      let clientHeight = docEl.clientHeight || window.innerHeight;

      // Check if there is a vertical scrollable container in the DOM (e.g. template container)
      if (scrollTop === 0) {
        const scrollableDivs = document.querySelectorAll('.overflow-y-auto, [class*="layout"], [class*="main"]');
        for (let i = 0; i < scrollableDivs.length; i++) {
          const div = scrollableDivs[i];
          if (div.scrollTop > 0) {
            scrollTop = div.scrollTop;
            scrollHeight = div.scrollHeight;
            clientHeight = div.clientHeight;
            break;
          }
        }
      }

      const totalHeight = scrollHeight - clientHeight;
      if (totalHeight > 0) {
        const progress = (scrollTop / totalHeight) * 100;
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }
    };

    // Use capturing phase so we capture scroll events from ANY scrollable container
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll, true);

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll, true);
    };
  }, []);

  // Auto sliding carousel triggers
  useEffect(() => {
    const swotInterval = setInterval(() => {
      const next = (activeSwotIndexRef.current + 1) % 4;
      scrollToSwot(next);
    }, 5000);

    const roadmapInterval = setInterval(() => {
      const next = (activeRoadmapIndexRef.current + 1) % 3;
      scrollToRoadmap(next);
    }, 5000);

    return () => {
      clearInterval(swotInterval);
      clearInterval(roadmapInterval);
    };
  }, []);

  const handleSwotScroll = () => {
    if (swotScrollRef.current) {
      const scrollLeft = swotScrollRef.current.scrollLeft;
      const itemWidth = swotScrollRef.current.offsetWidth;
      if (itemWidth > 0) {
        const index = Math.round(scrollLeft / itemWidth);
        setActiveSwotIndex(index);
      }
    }
  };

  const handleRoadmapScroll = () => {
    if (roadmapScrollRef.current) {
      const scrollLeft = roadmapScrollRef.current.scrollLeft;
      const itemWidth = roadmapScrollRef.current.offsetWidth;
      if (itemWidth > 0) {
        const index = Math.round(scrollLeft / itemWidth);
        setActiveRoadmapIndex(index);
      }
    }
  };

  const scrollToSwot = (idx: number) => {
    if (swotScrollRef.current) {
      const width = swotScrollRef.current.offsetWidth;
      swotScrollRef.current.scrollTo({
        left: idx * width,
        behavior: "smooth"
      });
      setActiveSwotIndex(idx);
    }
  };

  const scrollToRoadmap = (idx: number) => {
    if (roadmapScrollRef.current) {
      const width = roadmapScrollRef.current.offsetWidth;
      roadmapScrollRef.current.scrollTo({
        left: idx * width,
        behavior: "smooth"
      });
      setActiveRoadmapIndex(idx);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-mm-orange border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-mm-gray font-medium">Loading Business Audit Report...</p>
        </div>
      </div>
    );
  }

  const {
    executive_summary,
    business_profile,
    business_scorecard,
    key_findings,
    risk_assessment,
    competitor_analysis,
    priority_actions,
    roadmap,
    recommended_plan,
    add_ons
  } = data;

  // Find recommended plan from PLANS matching recommended_plan.plan_name
  const recPlanName = recommended_plan?.plan_name?.toLowerCase() || "";
  let matchedIndex = PLANS.findIndex(p => {
    const planNameLower = p.name.toLowerCase();
    if (planNameLower === "customize") {
      return recPlanName.includes("custom") || recPlanName.includes("customize");
    }
    return recPlanName.includes(planNameLower);
  });

  if (matchedIndex === -1) {
    matchedIndex = 0; // Default fallback to Basic plan
  }

  let matchedPlan = PLANS[matchedIndex];
  matchedPlan.highlight = true;
  const cardType = matchedIndex === 3 ? "custom" : "default";

  const scoreChartData = [
    { name: "Score", value: executive_summary.overall_score },
    { name: "Remaining", value: 10 - executive_summary.overall_score }
  ];

  const scorecardChartData = [
    { name: "Website Usability", score: business_scorecard.website },
    { name: "Branding & Visuals", score: business_scorecard.branding },
    { name: "Marketing Strategy", score: business_scorecard.marketing },
    { name: "Social Media", score: business_scorecard.social_media },
    { name: "Growth Readiness", score: business_scorecard.growth_readiness }
  ];

  const renderYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const words = payload.value.split(" ");
    const yOffset = -((words.length - 1) * 10) / 2 + 3;
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={-8}
          y={yOffset}
          textAnchor="end"
          fill="#748297"
          fontSize={10}
          fontWeight={700}
        >
          {words.map((word: string, idx: number) => (
            <tspan x={-8} dy={idx > 0 ? 10 : 0} key={idx}>
              {word}
            </tspan>
          ))}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full space-y-12 text-mm-dark font-sans animate-fadeIn pb-12">
      {/* Top action header containing Download PDF button */}
      <div className="flex justify-end items-center gap-4 no-print">
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="flex items-center gap-2 px-5 py-2.5 bg-mm-dark hover:bg-mm-dark/90 text-white rounded-xl text-xs font-bold tracking-wider uppercase shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none"
        >
          {downloading ? (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="stroke-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          )}
          <span>{downloading ? "Generating PDF..." : "Download Report"}</span>
        </button>
      </div>

      {/* Right-side Green Scroll Progress Line */}
      <div className="fixed top-0 right-0 w-2 h-full bg-gray-100/30 z-9999 pointer-events-none rounded-l-md overflow-hidden no-print">
        <div
          className="w-full bg-[#10B981] rounded-l-md transition-all duration-75"
          style={{ height: `${scrollProgress}%` }}
        />
      </div>

      {/* 1. Executive Summary Panel (No wrapper card, direct layout with Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

        {/* Left Side: Score Donut Chart (Kept) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center relative bg-white border border-[#E2E6EE] rounded-3xl p-6 shadow-xs h-60 w-full">
          <div className="relative w-44 h-44">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoreChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    <Cell fill="#FF5924" stroke="none" />
                    <Cell fill="#F1F4F9" stroke="none" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4.5xl font-black text-[#111418] leading-none">
                {executive_summary.overall_score}
              </span>
              <span className="text-[10px] font-bold text-[#748297] tracking-wider uppercase mt-1">
                Overall Score
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Highlights */}
        <div className="lg:col-span-8 space-y-5 px-4.5 sm:px-6 lg:px-0">
          <div>
            <span className="inline-flex items-center gap-1.5 pb-1 border-b-2 border-mm-orange text-[10px] font-bold uppercase tracking-wider text-mm-orange mb-3">
              Executive Audit Summary
            </span>
            <p className="text-base sm:text-lg text-mm-gray leading-relaxed font-semibold">
              {executive_summary.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-[#E2E6EE] flex items-start gap-4 shadow-xs">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide block">Top Strength</span>
                <span className="text-sm text-emerald-950 font-semibold leading-relaxed block mt-1">{executive_summary.top_strength}</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-[#E2E6EE] flex items-start gap-4 shadow-xs">
              <div>
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wide block">Key Challenge</span>
                <span className="text-sm text-rose-950 font-semibold leading-relaxed block mt-1">{executive_summary.biggest_challenge}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Side-by-Side: Business Profile & Scorecard on Desktop/Large Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* Left Side: Business Profile Card */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-[#111418] flex items-center gap-2">
            Business Profile
          </h3>
          <div className="bg-white border border-[#E2E6EE] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 w-full">
            <div className="flex justify-between items-center text-sm border-b border-[#F1F4F9] pb-3">
              <span className="font-semibold text-[#748297]">Company Name</span>
              <span className="font-bold text-[#111418]">{business_profile.business_name}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-[#F1F4F9] pb-3">
              <span className="font-semibold text-[#748297]">Industry</span>
              <span className="font-bold text-[#111418]">{business_profile.industry}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-[#F1F4F9] pb-3">
              <span className="font-semibold text-[#748297]">Location</span>
              <span className="font-bold text-[#111418]">{business_profile.location}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-[#F1F4F9] pb-3">
              <span className="font-semibold text-[#748297]">Business Model</span>
              <span className="font-bold text-[#111418]">{business_profile.business_model}</span>
            </div>

            {/* Target Audience Row */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm border-b border-[#F1F4F9] pb-3 gap-2">
              <span className="font-semibold text-[#748297]">Target Audience</span>
              <div className="flex flex-wrap gap-1.5 justify-end">
                {business_profile.target_audience.map((item: string, idx: number) => (
                  <span key={idx} className="text-xs font-semibold px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-lg text-mm-dark">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Revenue Channels Row */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm pb-1 gap-2">
              <span className="font-semibold text-[#748297]">Revenue Channels</span>
              <div className="flex flex-wrap gap-1.5 justify-end">
                {business_profile.revenue_sources.map((item: string, idx: number) => (
                  <span key={idx} className="text-xs font-semibold px-2.5 py-1 bg-mm-orange/5 border border-mm-orange/10 rounded-lg text-mm-orange">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Digital Performance Scorecard Card */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-[#111418] flex items-center gap-2">
            Digital Performance Scorecard
          </h3>

          {/* Mobile View: Single card containing all 5 metrics listed one by one */}
          <div className="block md:hidden bg-white border border-[#E2E6EE] rounded-3xl p-6 shadow-xs w-full">
            <div className="divide-y divide-[#F1F4F9]">
              {scorecardChartData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center gap-4 py-4.5 first:pt-0 last:pb-0">
                  <span className="text-xs sm:text-sm font-bold text-mm-dark leading-snug">
                    {item.name}
                  </span>
                  <div className="shrink-0">
                    <ScorecardCircularProgress score={item.score} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Laptop/Desktop View: Vertical Bar Graph (Recharts) */}
          <div className="hidden md:flex flex-col justify-center bg-white border border-[#E2E6EE] rounded-3xl p-6 sm:p-8 shadow-xs w-full min-h-[350px] relative">
            <div className="h-72 w-full min-w-0">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={scorecardChartData}
                    layout="horizontal"
                    barCategoryGap="5%"
                    margin={{ top: 15, right: 15, left: 15, bottom: 48 }}
                  >
                    <defs>
                      <linearGradient id="excellentGrad" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#34D399" />
                      </linearGradient>
                      <linearGradient id="developingGrad" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="#FF8559" />
                        <stop offset="100%" stopColor="#FF3D00" />
                      </linearGradient>
                      <linearGradient id="criticalGrad" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="#EF4444" />
                        <stop offset="100%" stopColor="#F87171" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#F1F4F9" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      type="category"
                      tick={{ angle: -45, textAnchor: 'end', fontSize: 10, fill: '#748297', fontWeight: 700 } as any}
                      height={30}
                      interval={0}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="number"
                      domain={[1, 10]}
                      ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                      interval={0}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#748297", fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(0, 0, 0, 0.02)', radius: 6 }}
                      contentStyle={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E6EE', fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <Bar
                      dataKey="score"
                      radius={[6, 6, 0, 0]}
                      barSize={50}
                      background={{ fill: '#F1F4F9', radius: 6 }}
                    >
                      {scorecardChartData.map((entry, index) => {
                        const score = entry.score;
                        let fill = "url(#developingGrad)";
                        if (score >= 80) fill = "url(#excellentGrad)";
                        else if (score < 50) fill = "url(#criticalGrad)";
                        return <Cell key={`cell-${index}`} fill={fill} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SWOT Matrix (Horizontal Scroll on Mobile, Grid/Side-by-Side on Desktop/Laptop) */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#111418] flex items-center gap-2">
          SWOT Key Findings
        </h3>

        {/* Mobile View: Scroll Slider Container with dots */}
        <div className="block md:hidden space-y-4">
          <div
            ref={swotScrollRef}
            onScroll={handleSwotScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2"
          >
            {/* Card 1: Strengths */}
            <div className="w-full min-w-full snap-start bg-white border border-[#E2E6EE] rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 border-b border-[#F1F4F9] pb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="font-extrabold text-sm uppercase tracking-wider">Strengths</span>
              </div>
              <ul className="space-y-3">
                {key_findings.strengths.map((item: string, idx: number) => (
                  <li key={idx} className="text-sm text-emerald-950 font-semibold flex gap-2.5 items-start">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 2: Weaknesses */}
            <div className="w-full min-w-full snap-start bg-white border border-[#E2E6EE] rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-rose-800 border-b border-[#F1F4F9] pb-3">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <span className="font-extrabold text-sm uppercase tracking-wider">Weaknesses</span>
              </div>
              <ul className="space-y-3">
                {key_findings.weaknesses.map((item: string, idx: number) => (
                  <li key={idx} className="text-sm text-rose-950 font-semibold flex gap-2.5 items-start">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 3: Opportunities */}
            <div className="w-full min-w-full snap-start bg-white border border-[#E2E6EE] rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-blue-800 border-b border-[#F1F4F9] pb-3">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="font-extrabold text-sm uppercase tracking-wider">Opportunities</span>
              </div>
              <ul className="space-y-3">
                {key_findings.opportunities.map((item: string, idx: number) => (
                  <li key={idx} className="text-sm text-blue-950 font-semibold flex gap-2.5 items-start">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 4: Threats */}
            <div className="w-full min-w-full snap-start bg-white border border-[#E2E6EE] rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-amber-800 border-b border-[#F1F4F9] pb-3">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span className="font-extrabold text-sm uppercase tracking-wider">Threats</span>
              </div>
              <ul className="space-y-3">
                {key_findings.threats.map((item: string, idx: number) => (
                  <li key={idx} className="text-sm text-amber-950 font-semibold flex gap-2.5 items-start">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Carousel Dots */}
          <div className="flex justify-center gap-2 pt-2">
            {[0, 1, 2, 3].map((idx) => (
              <button
                key={idx}
                onClick={() => scrollToSwot(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${activeSwotIndex === idx ? 'bg-mm-orange w-5' : 'bg-gray-300 w-2 hover:bg-gray-400'
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Laptop/Desktop View: Standard Side-by-Side 4-Column Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Strengths */}
          <div className="bg-white border border-[#E2E6EE] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 border-b border-[#F1F4F9] pb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="font-extrabold text-sm uppercase tracking-wider">Strengths</span>
            </div>
            <ul className="space-y-2">
              {key_findings.strengths.map((item: string, idx: number) => (
                <li key={idx} className="text-xs sm:text-sm text-emerald-950 font-medium flex gap-2 items-start leading-relaxed">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: Weaknesses */}
          <div className="bg-white border border-[#E2E6EE] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-rose-800 border-b border-[#F1F4F9] pb-3">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span className="font-extrabold text-sm uppercase tracking-wider">Weaknesses</span>
            </div>
            <ul className="space-y-2">
              {key_findings.weaknesses.map((item: string, idx: number) => (
                <li key={idx} className="text-xs sm:text-sm text-rose-950 font-medium flex gap-2 items-start leading-relaxed">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 3: Opportunities */}
          <div className="bg-white border border-[#E2E6EE] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-blue-800 border-b border-[#F1F4F9] pb-3">
              <Target className="w-5 h-5 text-blue-500" />
              <span className="font-extrabold text-sm uppercase tracking-wider">Opportunities</span>
            </div>
            <ul className="space-y-2">
              {key_findings.opportunities.map((item: string, idx: number) => (
                <li key={idx} className="text-xs sm:text-sm text-blue-950 font-medium flex gap-2 items-start leading-relaxed">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 4: Threats */}
          <div className="bg-white border border-[#E2E6EE] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-amber-800 border-b border-[#F1F4F9] pb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span className="font-extrabold text-sm uppercase tracking-wider">Threats</span>
            </div>
            <ul className="space-y-2">
              {key_findings.threats.map((item: string, idx: number) => (
                <li key={idx} className="text-xs sm:text-sm text-amber-950 font-medium flex gap-2 items-start leading-relaxed">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 4. Priority Actions List (Rendered directly on background, no wrapper card) */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-[#111418] flex items-center gap-2">
          Recommended Priority Action Checklist
        </h3>

        {/* Mobile View: Vertical list of cards (one for each action item) stacked one by one below */}
        <div className="block md:hidden space-y-4">
          {priority_actions.map((act: any) => (
            <div
              key={act.priority}
              className="w-full bg-white border border-[#E2E6EE] rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[160px]"
            >
              <div className="space-y-4">
                {/* Top Row: Priority # */}
                <div className="flex justify-between items-center border-b border-[#F1F4F9] pb-3">
                  <span className="text-[10px] font-bold text-[#748297] uppercase tracking-wider">
                    Priority Action #{act.priority}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-mm-dark leading-snug">
                  {act.title}
                </h4>

                {/* Rating Details: Impact & Difficulty */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#F1F4F9]">
                  {/* Business Impact */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#748297] uppercase tracking-wider block">
                      Business Impact
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-gray-150 flex-shrink-0"
                        style={{
                          background: `conic-gradient(${act.impact === "High" ? "#10B981" : act.impact === "Medium" ? "#F59E0B" : "#EF4444"
                            } ${act.impact === "High" ? "100%" : act.impact === "Medium" ? "66%" : "33%"
                            }, #F1F4F9 0)`
                        }}
                      />
                      <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${act.impact === "High" ? "bg-emerald-50 text-emerald-700" : act.impact === "Medium" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                        }`}>
                        {act.impact}
                      </span>
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#748297] uppercase tracking-wider block">
                      Difficulty
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-gray-150 flex-shrink-0"
                        style={{
                          background: `conic-gradient(${act.difficulty === "Easy" ? "#10B981" : act.difficulty === "Medium" ? "#F59E0B" : "#EF4444"
                            } ${act.difficulty === "Easy" ? "100%" : act.difficulty === "Medium" ? "66%" : "33%"
                            }, #F1F4F9 0)`
                        }}
                      />
                      <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${act.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700" : act.difficulty === "Medium" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                        }`}>
                        {act.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Laptop/Desktop View: Full Width Table */}
        <div className="hidden md:block overflow-x-auto bg-white border border-[#E2E6EE] rounded-3xl p-6 shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E6EE] text-[10px] font-bold text-[#748297] uppercase tracking-wider">
                <th className="pb-3 text-center w-12">#</th>
                <th className="pb-3">Action Item</th>
                <th className="pb-3 w-32">Business Impact</th>
                <th className="pb-3 w-32">Difficulty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F4F9]">
              {priority_actions.map((act: any) => (
                <tr key={act.priority} className="text-xs sm:text-sm text-mm-dark">
                  <td className="py-4 text-center font-bold text-[#748297]">{act.priority}</td>
                  <td className="py-4 font-bold text-mm-dark">{act.title}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-150 flex-shrink-0"
                        style={{
                          background: `conic-gradient(${act.impact === "High" ? "#10B981" : act.impact === "Medium" ? "#F59E0B" : "#EF4444"
                            } ${act.impact === "High" ? "100%" : act.impact === "Medium" ? "66%" : "33%"
                            }, #F1F4F9 0)`
                        }}
                      />
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${act.impact === "High" ? "bg-emerald-50 text-emerald-700" : act.impact === "Medium" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                        }`}>
                        {act.impact}
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-150 flex-shrink-0"
                        style={{
                          background: `conic-gradient(${act.difficulty === "Easy" ? "#10B981" : act.difficulty === "Medium" ? "#F59E0B" : "#EF4444"
                            } ${act.difficulty === "Easy" ? "100%" : act.difficulty === "Medium" ? "66%" : "33%"
                            }, #F1F4F9 0)`
                        }}
                      />
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${act.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700" : act.difficulty === "Medium" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                        }`}>
                        {act.difficulty}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Competitors & Risk Ratings (Rendered directly on background, no wrapper card) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Competitor Grid */}
        <div className="bg-white border border-[#E2E6EE] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="text-lg font-bold text-[#111418] border-b border-[#E2E6EE] pb-4 flex items-center gap-2">
            Competitive Overview
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm pb-2 border-b border-[#F1F4F9]">
              <span className="font-semibold text-[#748297]">Competitive Index</span>
              <span className="font-bold text-mm-orange">{competitor_analysis.competitive_score} / 10</span>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#748297] uppercase tracking-wider block">Competitor Focus</span>
              <div className="flex flex-wrap gap-2">
                {competitor_analysis.major_competitors.map((comp: string, idx: number) => (
                  <span key={idx} className="text-xs font-semibold px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-lg text-mm-dark">
                    {comp}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#748297] uppercase tracking-wider block">Opportunity Advantage</span>
              <p className="text-xs text-mm-gray leading-relaxed font-medium">
                {competitor_analysis.key_advantage}
              </p>
            </div>

            <div className="space-y-1 pt-2 border-t border-[#F1F4F9]">
              <span className="text-[11px] font-bold text-[#748297] uppercase tracking-wider block">Largest Identified Gap</span>
              <p className="text-xs text-[#EA4335] leading-relaxed font-bold">
                {competitor_analysis.largest_gap}
              </p>
            </div>
          </div>
        </div>

        {/* Risk Grid */}
        <div className="bg-white border border-[#E2E6EE] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="text-lg font-bold text-[#111418] border-b border-[#E2E6EE] pb-4 flex items-center gap-2">
            Risk Assessment
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm pb-2 border-b border-[#F1F4F9]">
              <span className="font-semibold text-[#748297]">Overall Risk Level</span>
              <span className={`font-bold ${risk_assessment.overall_risk === "High" ? "text-[#EA4335]" : "text-amber-500"
                }`}>{risk_assessment.overall_risk}</span>
            </div>

            <div className="flex justify-between items-center text-sm pb-2 border-b border-[#F1F4F9]">
              <span className="font-semibold text-[#748297]">Risk Rating Score</span>
              <span className="font-bold text-[#111418]">{risk_assessment.risk_score} / 10</span>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#748297] uppercase tracking-wider block">Top Critical Risks</span>
              <ul className="space-y-2">
                {risk_assessment.top_risks.map((risk: string, idx: number) => (
                  <li key={idx} className="text-xs text-mm-gray font-medium flex gap-2 items-start">
                    <span className="text-[#EA4335] font-bold">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Growth & Optimization Roadmap (Horizontal Scroll on Mobile, 3 columns on Laptop/Desktop) */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#111418] flex items-center gap-2">
          {/* <Calendar className="w-5 h-5 text-mm-orange" /> */}
          Growth Roadmap Implementation Plan
        </h3>

        {/* Mobile View: Scroll Slider Container with dots */}
        <div className="block md:hidden space-y-4">
          <div
            ref={roadmapScrollRef}
            onScroll={handleRoadmapScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2"
          >
            {/* Milestone 30 Days */}
            <div className="w-full min-w-full snap-start bg-white border border-[#E2E6EE] rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[250px]">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2E6EE] pb-3">
                  <span className="text-sm font-bold text-mm-orange uppercase tracking-wider">30-Day Milestone</span>
                  <span className="text-xs font-bold text-mm-gray bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">Month 1</span>
                </div>
                <ul className="space-y-2.5">
                  {roadmap["30_days"].map((item: string, idx: number) => (
                    <li key={idx} className="text-sm text-mm-gray font-semibold flex gap-2.5 items-start leading-relaxed">
                      <span className="text-mm-orange">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Milestone 60 Days */}
            <div className="w-full min-w-full snap-start bg-white border border-[#E2E6EE] rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[250px]">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2E6EE] pb-3">
                  <span className="text-sm font-bold text-mm-orange uppercase tracking-wider">60-Day Milestone</span>
                  <span className="text-xs font-bold text-mm-gray bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">Month 2</span>
                </div>
                <ul className="space-y-2.5">
                  {roadmap["60_days"].map((item: string, idx: number) => (
                    <li key={idx} className="text-sm text-mm-gray font-semibold flex gap-2.5 items-start leading-relaxed">
                      <span className="text-mm-orange">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Milestone 90 Days */}
            <div className="w-full min-w-full snap-start bg-white border border-[#E2E6EE] rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[250px]">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2E6EE] pb-3">
                  <span className="text-sm font-bold text-mm-orange uppercase tracking-wider">90-Day Milestone</span>
                  <span className="text-xs font-bold text-mm-gray bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">Month 3</span>
                </div>
                <ul className="space-y-2.5">
                  {roadmap["90_days"].map((item: string, idx: number) => (
                    <li key={idx} className="text-sm text-mm-gray font-semibold flex gap-2.5 items-start leading-relaxed">
                      <span className="text-mm-orange">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Carousel Dots */}
          <div className="flex justify-center gap-2 pt-2">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => scrollToRoadmap(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${activeRoadmapIndex === idx ? 'bg-mm-orange w-5' : 'bg-gray-300 w-2 hover:bg-gray-400'
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Laptop/Desktop View: Side-by-Side 3-Column Grid */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {/* Milestone 30 Days */}
          <div className="bg-white border border-[#E2E6EE] rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[220px]">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E6EE] pb-3">
                <span className="text-sm font-bold text-mm-orange uppercase tracking-wider">30-Day Milestone</span>
                <span className="text-xs font-bold text-mm-gray bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">Month 1</span>
              </div>
              <ul className="space-y-2">
                {roadmap["30_days"].map((item: string, idx: number) => (
                  <li key={idx} className="text-xs sm:text-sm text-mm-gray font-medium flex gap-2 items-start leading-relaxed">
                    <span className="text-mm-orange">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Milestone 60 Days */}
          <div className="bg-white border border-[#E2E6EE] rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[220px]">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E6EE] pb-3">
                <span className="text-sm font-bold text-mm-orange uppercase tracking-wider">60-Day Milestone</span>
                <span className="text-xs font-bold text-mm-gray bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">Month 2</span>
              </div>
              <ul className="space-y-2">
                {roadmap["60_days"].map((item: string, idx: number) => (
                  <li key={idx} className="text-xs sm:text-sm text-mm-gray font-medium flex gap-2 items-start leading-relaxed">
                    <span className="text-mm-orange">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Milestone 90 Days */}
          <div className="bg-white border border-[#E2E6EE] rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[220px]">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E6EE] pb-3">
                <span className="text-sm font-bold text-mm-orange uppercase tracking-wider">90-Day Milestone</span>
                <span className="text-xs font-bold text-mm-gray bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">Month 3</span>
              </div>
              <ul className="space-y-2">
                {roadmap["90_days"].map((item: string, idx: number) => (
                  <li key={idx} className="text-xs sm:text-sm text-mm-gray font-medium flex gap-2 items-start leading-relaxed">
                    <span className="text-mm-orange">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Recommended Business Plan / CTA Box */}
      <div className="space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 pb-1 border-b-2 border-mm-orange text-[10px] font-bold uppercase tracking-wider text-mm-orange mb-3">
            {/* <Sparkles className="w-3.5 h-3.5" /> */}
            Recommended Action Plan
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111418] tracking-tight">
            Our Recommendation for Your Business
          </h2>
          <p className="text-xs sm:text-sm text-mm-gray font-medium mt-1">
            Based on your audit score and digital footprint, we recommend the following growth plan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Recommended Plan Card */}
          <div className="lg:col-span-4 flex flex-col justify-start">
            <div className="w-full max-w-sm mx-auto lg:max-w-none">
              <AnimatedPlanCard 
                plan={matchedPlan} 
                i={matchedIndex} 
                cardType={cardType} 
                animate={false} 
                onSelectPlan={() => {
                  // if (!isAdmin) {
                  //   window.location.href = "https://neominds.theopenai.vercel.app/plans";
                  // }
                  handleSelectPlan(matchedPlan.name, businessId)
                }} 
                disabled={isAdmin}
              />
            </div>
          </div>

          {/* Details & Confidence Score */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-6 bg-white border border-[#E2E6EE] rounded-3xl p-6 sm:p-8 shadow-xs">

            {/* Top Row: Title, Reason & Confidence Chart */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

              {/* Reason / Analysis */}
              <div className="md:col-span-8 space-y-3 order-2 md:order-1">
                <h3 className="text-lg font-bold text-mm-dark">
                  Why this plan fits your business
                </h3>
                <p className="text-sm text-mm-gray leading-relaxed font-medium">
                  {recommended_plan?.reason || "Based on your business needs, this plan covers all the foundational elements required to accelerate your online growth."}
                </p>
              </div>

              {/* Confidence Pie/Donut Chart */}
              <div className="md:col-span-4 flex flex-col items-center justify-center order-1 md:order-2">
                <div className="relative w-36 h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Confidence", value: recommended_plan?.confidence || 80 },
                          { name: "Remaining", value: 100 - (recommended_plan?.confidence || 80) }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={60}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                      >
                        <Cell fill="#FF5924" stroke="none" />
                        <Cell fill="#F1F4F9" stroke="none" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-[#111418] leading-none">
                      {recommended_plan?.confidence || 80}%
                    </span>
                    <span className="text-[9px] font-bold text-[#748297] tracking-wider uppercase mt-0.5">
                      Confidence
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#E2E6EE] w-full" />

            {/* Recommended Add-ons Section */}
            {add_ons && add_ons.length > 0 && (
              <>
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-mm-dark flex items-center gap-2">
                    Recommended Add-ons for Extra Growth
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {add_ons.map((addon: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="p-4 rounded-2xl bg-amber-50/20 border border-amber-100/60 hover:border-amber-200/80 transition-colors duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-mm-dark">
                              {addon.service}
                            </span>
                            {addon.priority && (
                              <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                                addon.priority.toLowerCase() === "high" 
                                  ? "bg-rose-50 text-rose-700" 
                                  : addon.priority.toLowerCase() === "medium" 
                                  ? "bg-amber-50 text-amber-700" 
                                  : "bg-emerald-50 text-emerald-700"
                              }`}>
                                {addon.priority} Priority
                              </span>
                            )}
                          </div>
                          {addon.reason && (
                            <p className="text-xs text-mm-gray font-medium leading-relaxed">
                              {addon.reason}
                            </p>
                          )}
                        </div>
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 shrink-0 self-start sm:self-center">
                          Optional Add-on
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-[#E2E6EE] w-full" />
              </>
            )}

            {/* Bottom Section: Expected Results */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-mm-dark flex items-center gap-2">
                <Target className="w-5 h-5 text-mm-orange" />
                Expected Growth Results
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(recommended_plan?.expected_results || []).map((result: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-mm-orange/20 transition-colors duration-200">
                    <span className="text-mm-orange font-bold text-sm mt-0.5">✓</span>
                    <span className="text-xs sm:text-sm text-mm-gray font-semibold leading-relaxed">
                      {result}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Checkout Modals */}
      {!isAdmin && renderModals()}
    </div>
  );
}
