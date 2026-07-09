import { motion } from "framer-motion";
import AnimatedPlanCard from "../AnimatedPlanCard";
import PLANS from "@/data/plans";

export function MymindDownloads() {
  return (
    <section
      className="w-full overflow-x-hidden py-16 md:py-20"
      // style={{ background: "#fff0ec" }} FFF5F0
      style={{
        background:
          // "linear-gradient(180deg, #FFF5F0 0%, #fff0ec 30%, #fff0ec 100%)",
          "#FFFFFF"
      }}
      id="downloads"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-3 text-center text-2xl font-semibold uppercase tracking-[0.22em]"
          style={{ color: "#000000" }}
        >
          PRICING
        </motion.p>
        {/* <motion.h2
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
        </motion.h2> */}

        {/* Pricing cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 ">
          {PLANS.slice(0, 3).map((plan, i) => (
            <AnimatedPlanCard key={plan.name} plan={plan} i={i} cardType="default" />
          ))}
          {PLANS.slice(3, 4).map((plan, i) => (
            <AnimatedPlanCard key={plan.name} plan={plan} i={i} cardType="custom" />
          ))}
        </div>

        {/* Note */}
        {/* <motion.p
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
        </motion.p> */}
      </div>
    </section>
  );
}
