import { motion } from "framer-motion";
import PriceCard from "../PriceCard";

const PLANS = [
  {
    name: "Starter",
    price: "$9.99",
    period: "/mo",
    action: "GET STARTED",
    features: [
      "Custom website",
      "Hosting & SSL",
      "SEO built-in",
      "Unlimited edits",
      "24hr turnaround",
    ],
    highlight: false,
  },
  {
    name: "Growth",
    price: "$19.99",
    period: "/mo",
    action: "GET STARTED",
    features: [
      "Everything in Starter",
      "Automated review requests",
      "Lead routing & CRM",
      "Monthly SEO optimization",
      "Priority support",
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    action: "CONTACT US",
    features: [
      "Multi-location sites",
      "Custom integrations",
      "Dedicated account manager",
      "White-glove onboarding",
      "SLA guarantee",
    ],
    highlight: false,
  },
];

export function MymindDownloads() {
  return (
    <section
      className="w-full overflow-x-hidden py-16 md:py-20"
      style={{ background: "#fff0ec" }}
      id="downloads"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.22em]"
          style={{ color: "#FF5924" }}
        >
          PRICING
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="mb-10 text-center leading-tight"
          style={{
            fontFamily: "'Louize', Georgia, serif",
            fontSize: "clamp(1.8rem, 4vw, 3rem)",
            letterSpacing: "-0.03em",
            color: "#111418",
            fontWeight: 400,
          }}
        >
          Agency quality. DIY speed.
          <br />
          <em>Cheaper than both.</em>
        </motion.h2>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PLANS.map((plan, i) => (
            <PriceCard key={plan.name} plan={plan} i={i} />
          ))}
        </div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 text-center text-sm"
          style={{ color: "#748297", fontFamily: "'Inter', sans-serif" }}
        >
          No setup fee. No contracts. No surprise renewals.{" "}
          <a href="mailto:hey@theopenai.org" style={{ color: "#FF5924" }}>
            Questions? hey@theopenai.org
          </a>
        </motion.p>
      </div>
    </section>
  );
}
