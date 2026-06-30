import { useState } from "react";
import { motion } from "framer-motion";
import PriceCard from "../PriceCard";

const PLANS = [
  {
    name: "Basic Plan",
    description: "Essential assets to kickstart your business presence.",
    monthlyPrice: 29.99,
    annualPrice: 23.99, // 20% discount
    features: [
      "Website (Template)",
      "3 Posts + 1 Reel per month",
      "AI Chatbot Agent",
      "Basic SEO optimization",
      "Google Business Profile setup",
    ],
    isPopular: false,
    buttonText: "Get started",
  },
  {
    name: "Plus Plan",
    description: "Designed for expanding businesses seeking growth.",
    monthlyPrice: 59.99,
    annualPrice: 47.99, // 20% discount
    features: [
      "Website (Customized layout)",
      "5 Posts + 2 Reels per month",
      "AI Voicebot integration",
      "Advanced SEO optimization",
      "Email marketing campaigns",
      "Includes all Basic features",
    ],
    isPopular: true,
    buttonText: "Get started",
  },
  {
    name: "Pro Plan",
    description: "Ultimate features for scaling market leaders.",
    monthlyPrice: 89.99,
    annualPrice: 71.99, // 20% discount
    features: [
      "Modern 3D Website design",
      "7 Posts + 3 Reels per month",
      "AI Voice + Chatbot agents",
      "Deep performance analytics",
      "Paid Ads (Google & Meta)",
      "All Social Media Optimization",
      "SEO + GEO + AEO optimization",
      "Includes all Plus features",
    ],
    isPopular: false,
    buttonText: "Get started",
  },
];

export function MymindDownloads() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section
      className="w-full overflow-x-hidden py-20 md:py-28"
      style={{ background: "#fff0ec" }}
      id="downloads"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Text */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-mm-orange bg-mm-orange/10"
          >
            Pricing plans
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-mm-dark"
            style={{
              fontFamily: "'Louize', Georgia, serif",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              letterSpacing: "-0.03em",
              fontWeight: 400,
            }}
          >
            Plans for all sizes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="text-mm-gray text-sm sm:text-base leading-relaxed max-w-lg mx-auto"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Simple, transparent pricing that grows with you.
          </motion.p>
        </div>

        {/* Annual Toggle Switch */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex items-center justify-center gap-3.5 mb-14"
        >
          <span
            className={`text-sm font-bold tracking-tight transition-colors duration-300 ${
              !isAnnual ? "text-mm-dark" : "text-mm-gray"
            }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative flex h-7 w-13 items-center rounded-full bg-mm-dark/10 p-1 cursor-pointer transition-colors duration-200 focus:outline-none"
            aria-label="Toggle annual billing"
          >
            <motion.div
              layout
              className="h-5 w-5 rounded-full bg-mm-orange shadow-sm"
              animate={{ x: isAnnual ? "24px" : "0px" }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span
            className={`text-sm font-bold tracking-tight transition-colors duration-300 flex items-center gap-2 ${
              isAnnual ? "text-mm-dark" : "text-mm-gray"
            }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Annual pricing
            <span className="text-[10px] font-extrabold text-mm-orange bg-mm-orange/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              save 20%
            </span>
          </span>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto items-stretch">
          {PLANS.map((plan, i) => (
            <PriceCard key={plan.name} plan={plan} isAnnual={isAnnual} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
