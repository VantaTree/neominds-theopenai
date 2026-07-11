import { motion } from "framer-motion";

export default function WhyPrinciples() {
  return (
    <section
      id="section_7wbybw60d"
      className="w-full pb-20 md:pb-28 bg-[var(--color-mm-bg-gray)] flex justify-center"
    >
      <div className="w-full max-w-3xl px-6 sm:px-8 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full bg-white rounded-[2rem] px-8 py-12 md:px-16 md:py-16 flex flex-col items-center"
          style={{
            boxShadow: "4px 4px 33px rgba(116, 130, 151, 0.13)",
          }}
        >
          {/* MM Crest */}
          <div className="mb-10 w-16 h-16 flex items-center justify-center">
            {/* <img
              src="/images/why/MM-Crest.svg"
              alt="MM Crest"
              className="h-auto w-full"
              draggable={false}
            /> */}
          </div>

          {/* Principle 1 */}
          <div className="text-center w-full flex flex-col items-center">
            <h3
              className="mb-4 font-serif text-[1.778rem] leading-[2rem] tracking-[-0.011em] md:text-[2.222rem] md:leading-[2.444rem] md:tracking-[-0.044em]"
              style={{ color: "var(--color-mm-charcoal)" }}
            >
             The Online Choice.
            </h3>
            <p
              className="font-sans text-sm md:text-base leading-[1.556rem] md:leading-[1.889rem] tracking-[-0.011em] max-w-xl"
              style={{ color: "var(--color-mm-charcoal)" }}
            >
              Having a great business is no longer enough. Traditional methods like word-of-mouth and manual outreach still hold value, but they can't scale alone. In a digital market, if people can't easily find you online, they simply won't choose you.
            </p>
          </div>

          {/* Spacer */}
          <hr className="my-10 w-full border-t border-[var(--color-mm-border-light)]" />

          {/* Principle 2 */}
          <div className="text-center w-full flex flex-col items-center">
            <h3
              className="mb-4 font-serif text-[1.778rem] leading-[2rem] tracking-[-0.044em] md:text-[2.222rem] md:leading-[2.444rem]"
              style={{ color: "var(--color-mm-charcoal)" }}
            >
             High Costs and Complexities.
            </h3>
            <p
              className="font-sans text-sm md:text-base leading-[1.556rem] md:leading-[1.889rem] tracking-[-0.011em] max-w-xl"
              style={{ color: "var(--color-mm-charcoal)" }}
            >
             The market has forced you into an unfair choice: pay high agency rates (from 30k up) for complex services, or settle for generic, template-driven solutions. Neither delivers true value or transparent pricing for growth. Why should these essentials be luxuries?
            </p>
          </div>

          {/* Spacer */}
          <hr className="my-10 w-full border-t border-[var(--color-mm-border-light)]" />

          {/* Principle 3 */}
          <div className="text-center w-full flex flex-col items-center mb-12">
            <h3
              className="mb-4 font-serif text-[1.778rem] leading-[2rem] tracking-[-0.044em] md:text-[2.222rem] md:leading-[2.444rem]"
              style={{ color: "var(--color-mm-charcoal)" }}
            >
              A Real Solution.
            </h3>
            <p
              className="font-sans text-sm md:text-base leading-[1.556rem] md:leading-[1.889rem] tracking-[-0.011em] max-w-xl"
              style={{ color: "var(--color-mm-charcoal)" }}
            >
              We believe growing businesses deserve a real partner. So, we created BusinessBuddy. A single, integrated approach that combines AI-driven insights, professional web design, SEO, and marketing, all at an affordable, realistic price you can truly invest in.
            </p>
          </div>

          {/* Signature */}
          <div className="w-40 flex items-center justify-center">
            {/* <img
              src="/images/why/Team-Signature.svg"
              alt="Team Signature"
              className="h-auto w-full"
              draggable={false}
            /> */}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
