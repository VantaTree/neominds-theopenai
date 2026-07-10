import { motion } from "framer-motion";
import FeatureProjector from "../FeatureProjector";

export function MymindSmartBookmarking() {
  return (
    <section
      className="w-full overflow-x-hidden"
      id="smart-bookmarking"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
          className="mb-6 leading-tight text-mm-dark"
          style={{
            fontFamily: "'Louize', Georgia, serif",
            fontSize: "clamp(2rem, 6vw, 4.5rem)",
            letterSpacing: "-0.03em",
            fontWeight: 400,
          }}
        >
          Everything your business needs.
          <br />
          Completely managed.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto max-w-xl text-center text-mm-gray"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
            lineHeight: 1.7,
          }}
        >
           From websites to Digital marketing and AI automations.
           <p>We handle it all so you can focus on running your business.</p>
        </motion.p>
      </div>

      <div className="mx-auto max-w-4xl px-4 overflow-visible">
        <FeatureProjector />
      </div>
    </section>
  );
}
