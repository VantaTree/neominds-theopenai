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
            <img
              src="/images/why/MM-Crest.svg"
              alt="MM Crest"
              className="h-auto w-full"
              draggable={false}
            />
          </div>

          {/* Principle 1 */}
          <div className="text-center w-full flex flex-col items-center">
            <h3
              className="mb-4 font-serif text-[1.778rem] leading-[2rem] tracking-[-0.011em] md:text-[2.222rem] md:leading-[2.444rem] md:tracking-[-0.044em]"
              style={{ color: "var(--color-mm-charcoal)" }}
            >
              Beauty is a function.
            </h3>
            <p
              className="font-sans text-sm md:text-base leading-[1.556rem] md:leading-[1.889rem] tracking-[-0.011em] max-w-xl"
              style={{ color: "var(--color-mm-charcoal)" }}
            >
              If we strive to make it beautiful, we automatically make it useful. Design that pleases the mind serves it. Our minds are a beautiful mess, and instead of interfering with that, we embrace it.
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
              Make it invisible.
            </h3>
            <p
              className="font-sans text-sm md:text-base leading-[1.556rem] md:leading-[1.889rem] tracking-[-0.011em] max-w-xl"
              style={{ color: "var(--color-mm-charcoal)" }}
            >
              The less you think about mymind, the better. We believe in clutter-free experiences, without dropdowns, filters and the usual UI you’ll find in other apps. Your mind should be a place of rest and inspiration.
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
              Less features, more magic.
            </h3>
            <p
              className="font-sans text-sm md:text-base leading-[1.556rem] md:leading-[1.889rem] tracking-[-0.011em] max-w-xl"
              style={{ color: "var(--color-mm-charcoal)" }}
            >
              We’re not concerned with churning out more features and functionalities. Your mind *just works.* It doesn’t really matter how. It does all the work for you, and not the other way around.
            </p>
          </div>

          {/* Signature */}
          <div className="w-40 flex items-center justify-center">
            <img
              src="/images/why/Team-Signature.svg"
              alt="Team Signature"
              className="h-auto w-full"
              draggable={false}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
