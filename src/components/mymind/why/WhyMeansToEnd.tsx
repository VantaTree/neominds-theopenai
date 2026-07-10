import { motion } from "framer-motion";

export default function WhyMeansToEnd() {
  return (
    <section
      id="section_lg3bso8b7"
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
            src="/images/why/Why-Icon-4.svg"
            alt="Means to an end icon"
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
          Because a tool is just the means to an end, not the end in itself.
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
            We built mymind for doers and makers. For people who are busy doing other things and simply need a place to collect and remember what they care about.
          </p>
          <p className="mb-6 font-sans tracking-[-0.011em]">
            mymind doesn't interfere, doesn't bother and doesn't ask to be maintained. It’s meant to serve you, as an extension of your mind. So you can think about anything and everything except the tool itself.
          </p>
          <p className="font-sans tracking-[-0.011em]">
            Because that’s all it is: A tool meant to help you achieve something else. Those who like to procrastinate with folders and unmaintainable systems will find plenty of other apps to keep them busy. mymind is for those who would rather draw, write, build, dance and sing.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
