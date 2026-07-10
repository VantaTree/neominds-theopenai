import { motion } from "framer-motion";

export default function WhyNewBeginnings() {
  return (
    <section
      id="section_hlvqr0a2t"
      className="w-full py-16 md:py-24 bg-[var(--color-mm-bg-gray)] flex justify-center"
    >
      <div className="mx-auto max-w-3xl px-6 sm:px-8 text-center flex flex-col items-center">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-8 w-10 h-10 flex items-center justify-center"
        >
          <img
            src="/images/why/Why-Icon-3.svg"
            alt="New beginnings icon"
            className="h-auto w-full"
            draggable={false}
          />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 font-serif text-[1.778rem] leading-[2rem] tracking-[-0.044em] md:text-[2.222rem] md:leading-[2.444rem]"
          style={{ color: "var(--color-mm-charcoal)" }}
        >
          Because new beginnings are beautiful.
        </motion.h2>

        {/* Content Paragraphs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-justify text-sm leading-[1.556rem] md:text-base md:leading-[1.889rem]"
          style={{ color: "var(--color-mm-charcoal)" }}
        >
          <p className="mb-6 font-sans tracking-[-0.011em]">
            There's a reason we don't have an import feature. We like the idea of starting from scratch. Not only because humanity revolves around fresh starts, but this also requires you to reevaluate your relationship with data. It inspires you to be more conscious, more meticulous, more mindful of the things you save and collect.
          </p>
          <p className="font-sans tracking-[-0.011em]">
            Digital clutter and information fatigue affect our real minds, whether we’re aware of it or not. We want your new mind to be a break from that. It’s a clean slate where you can deliberately choose what to save and consume. A mental sigh of relief.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
