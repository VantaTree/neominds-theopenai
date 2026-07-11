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
          {/* <img
            src="/images/why/Why-Icon-3.svg"
            alt="New beginnings icon"
            className="h-auto w-full"
            draggable={false}
          /> */}
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
          Because There Had to Be a Better Way.
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
            On the other were cheap solutions and delivered very generic websites, poor marketing strategies and if client wanted any updates they were charged  a high amount which was not even needed for minor changes or updates 

there was very little line in between 

          </p>
          <p className="font-sans tracking-[-0.011em]">
            
We asked ourselves:
why does digital growth feel complicated, expensive , and out of reach for businesses that need it the most 

Why should professional websites, AI - powered insights , branding , SEO, and digital marketing  be considered a  luxury or expensive instead of necessity?

          </p>
        </motion.div>
      </div>
    </section>
  );
}
