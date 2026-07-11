import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Target, 
  ShieldAlert, ListTodo, Briefcase, MapPin, Activity, Calendar, 
  Award, ArrowRight
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import AnimatedPlanCard from "./AnimatedPlanCard";
import PLANS from "@/data/plans";

// Fallback dummy audit report data matching fallback_audit_report.json
const DUMMY_REPORT = {
  "executive_summary": {
    "overall_score": 55,
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
    "overall": 55,
    "website": 55,
    "branding": 60,
    "marketing": 55,
    "social_media": 55,
    "growth_readiness": 60
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
    "risk_score": 60,
    "top_risks": [
      "Low search visibility",
      "Inconsistent marketing",
      "Weak customer engagement",
      "Growing digital competition"
    ]
  },
  "competitor_analysis": {
    "competitive_score": 55,
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
  "add_ons": {
    "service": ""
  }
};

interface ReportProps {
  apiUrl?: string;
}

export default function Report({ apiUrl }: ReportProps) {
  const [data, setData] = useState<typeof DUMMY_REPORT>(DUMMY_REPORT);
  const [loading, setLoading] = useState(false);

  // States for slide dot indicators
  const [activeSwotIndex, setActiveSwotIndex] = useState(0);
  const [activeRoadmapIndex, setActiveRoadmapIndex] = useState(0);

  const swotScrollRef = useRef<HTMLDivElement>(null);
  const roadmapScrollRef = useRef<HTMLDivElement>(null);

  // Fetch report data if apiUrl is provided
  useEffect(() => {
    if (!apiUrl) return;

    setLoading(true);
    fetch(apiUrl)
      .then((res) => res.json())
      .then((json) => {
        if (json && json.data) {
          setData(json.data);
        } else if (json) {
          setData(json);
        }
      })
      .catch((err) => {
        console.error("Error fetching report from apiUrl:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [apiUrl]);

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
    recommended_plan
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

  const matchedPlan = PLANS[matchedIndex];
  const cardType = matchedIndex === 3 ? "custom" : "default";

  const scoreChartData = [
    { name: "Score", value: executive_summary.overall_score },
    { name: "Remaining", value: 100 - executive_summary.overall_score }
  ];

  return (
    <div className="w-full space-y-12 text-mm-dark font-sans select-none animate-fadeIn pb-12">
      
      {/* 1. Executive Summary Panel (No wrapper card, direct layout with Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Score Donut Chart (Kept) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center relative bg-white border border-[#E2E6EE] rounded-3xl p-6 shadow-xs h-60 w-full">
          <div className="relative w-44 h-44">
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-mm-orange/10 text-mm-orange mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Executive Audit Summary
            </span>
            <p className="text-base sm:text-lg text-mm-gray leading-relaxed font-semibold">
              {executive_summary.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-[#E2E6EE] flex items-start gap-4 shadow-xs">
              <div className="p-2.5 bg-emerald-500 rounded-xl text-white">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide block">Top Strength</span>
                <span className="text-sm text-emerald-950 font-semibold leading-relaxed block mt-1">{executive_summary.top_strength}</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-[#E2E6EE] flex items-start gap-4 shadow-xs">
              <div className="p-2.5 bg-rose-500 rounded-xl text-white">
                <ShieldAlert className="w-5 h-5" />
              </div>
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
            <Briefcase className="w-5 h-5 text-mm-orange" />
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

        {/* Right Side: Digital Performance Scorecard Card (Horizontal Progress Bars stacked vertically) */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-[#111418] flex items-center gap-2">
            <Activity className="w-5 h-5 text-mm-orange" />
            Digital Performance Scorecard
          </h3>
          <div className="bg-white border border-[#E2E6EE] rounded-3xl p-6 sm:p-8 shadow-xs w-full space-y-5">
            
            {/* Website Usability */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-[#748297]">Website Usability</span>
                <span className="text-mm-dark font-black">{business_scorecard.website} / 100</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-mm-orange rounded-full transition-all duration-500" style={{ width: `${business_scorecard.website}%` }} />
              </div>
            </div>

            {/* Branding */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-[#748297]">Branding & Visuals</span>
                <span className="text-mm-dark font-black">{business_scorecard.branding} / 100</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-mm-orange rounded-full transition-all duration-500" style={{ width: `${business_scorecard.branding}%` }} />
              </div>
            </div>

            {/* Marketing */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-[#748297]">Marketing Strategy</span>
                <span className="text-mm-dark font-black">{business_scorecard.marketing} / 100</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-mm-orange rounded-full transition-all duration-500" style={{ width: `${business_scorecard.marketing}%` }} />
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-[#748297]">Social Media Presence</span>
                <span className="text-mm-dark font-black">{business_scorecard.social_media} / 100</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-mm-orange rounded-full transition-all duration-500" style={{ width: `${business_scorecard.social_media}%` }} />
              </div>
            </div>

            {/* Growth Readiness */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-[#748297]">Growth Readiness</span>
                <span className="text-mm-dark font-black">{business_scorecard.growth_readiness} / 100</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-mm-orange rounded-full transition-all duration-500" style={{ width: `${business_scorecard.growth_readiness}%` }} />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. SWOT Matrix (Horizontal Scroll on Mobile, Grid/Side-by-Side on Desktop/Laptop) */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#111418] flex items-center gap-2">
          <Award className="w-5 h-5 text-mm-orange" />
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
                    <span className="text-emerald-500 font-bold select-none">•</span>
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
                    <span className="text-rose-500 font-bold select-none">•</span>
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
                    <span className="text-blue-500 font-bold select-none">•</span>
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
                    <span className="text-amber-500 font-bold select-none">•</span>
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
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeSwotIndex === idx ? 'bg-mm-orange w-5' : 'bg-gray-300 w-2 hover:bg-gray-400'
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
                  <span className="text-emerald-500 font-bold select-none">•</span>
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
                  <span className="text-rose-500 font-bold select-none">•</span>
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
                  <span className="text-blue-500 font-bold select-none">•</span>
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
                  <span className="text-amber-500 font-bold select-none">•</span>
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
          <ListTodo className="w-5 h-5 text-mm-orange" />
          Recommended Priority Action Checklist
        </h3>

        <div className="overflow-x-auto bg-white border border-[#E2E6EE] rounded-3xl p-6 shadow-xs">
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
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      act.impact === "High" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                    }`}>
                      {act.impact}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      act.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {act.difficulty}
                    </span>
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
            <TrendingUp className="w-5 h-5 text-mm-orange" />
            Competitive Overview
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm pb-2 border-b border-[#F1F4F9]">
              <span className="font-semibold text-[#748297]">Competitive Index</span>
              <span className="font-bold text-mm-orange">{competitor_analysis.competitive_score} / 100</span>
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
            <AlertTriangle className="w-5 h-5 text-mm-orange" />
            Risk Assessment
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm pb-2 border-b border-[#F1F4F9]">
              <span className="font-semibold text-[#748297]">Overall Risk Level</span>
              <span className={`font-bold ${
                risk_assessment.overall_risk === "High" ? "text-[#EA4335]" : "text-amber-500"
              }`}>{risk_assessment.overall_risk}</span>
            </div>

            <div className="flex justify-between items-center text-sm pb-2 border-b border-[#F1F4F9]">
              <span className="font-semibold text-[#748297]">Risk Rating Score</span>
              <span className="font-bold text-[#111418]">{risk_assessment.risk_score} / 100</span>
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
          <Calendar className="w-5 h-5 text-mm-orange" />
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
                      <span className="text-mm-orange select-none">✓</span>
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
                      <span className="text-mm-orange select-none">✓</span>
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
                      <span className="text-mm-orange select-none">✓</span>
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
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeRoadmapIndex === idx ? 'bg-mm-orange w-5' : 'bg-gray-300 w-2 hover:bg-gray-400'
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
                    <span className="text-mm-orange select-none">✓</span>
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
                    <span className="text-mm-orange select-none">✓</span>
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
                    <span className="text-mm-orange select-none">✓</span>
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-mm-orange/10 text-mm-orange mb-3">
            <Sparkles className="w-3.5 h-3.5" />
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
              <AnimatedPlanCard plan={matchedPlan} i={matchedIndex} cardType={cardType} animate={false} />
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

            {/* Bottom Section: Expected Results */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-mm-dark flex items-center gap-2">
                <Target className="w-5 h-5 text-mm-orange" />
                Expected Growth Results
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(recommended_plan?.expected_results || []).map((result: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-mm-orange/20 transition-colors duration-200">
                    <span className="text-mm-orange font-bold text-sm select-none mt-0.5">✓</span>
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
      
    </div>
  );
}
