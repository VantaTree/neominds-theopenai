import { motion } from "framer-motion";

export default function WhyTechRelationship() {
  return (
    <section
      id="section_3e12j34gy"
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
            src="/images/why/Why-Icon-2.svg"
            alt="Relationship with tech icon"
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
          Because Businesses Deserve Better.
        </motion.h2>

        {/* Content Paragraphs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12 text-justify text-sm leading-[1.556rem] md:text-base md:leading-[1.889rem]"
          style={{ color: "var(--color-mm-charcoal)" }}
        >
          <p className="mb-6 font-sans tracking-[-0.011em]">
            There are small -to medium-sized business owners who want to invest in digital marketing. Instead of receiving a complete digital solution, they are sold individual services, and most of them are surprised by how much they are asked to pay for even a simple website, and they end up regretting paying more. 
          </p>
          <p className="mb-6 font-sans tracking-[-0.011em]">
           At times, the most visually appealing websites may also fail to deliver meaningful results,
for minor content updates or any changes, they charge more and more, which initially seemed to be an affordable project will become increasingly expensive over time.
          </p>
          <p className="mb-6 font-sans tracking-[-0.011em]">
            Agencies usually  start charging from 30k, going till lakhs, which ultimately can't be afforded by a small-medium sized business owners
          </p>
          {/* <p className="font-sans tracking-[-0.011em]">
            We decided we could.
          </p> */}
        </motion.div>

        {/* Section divider label */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-6 text-xs font-semibold uppercase tracking-[0.22em]"
          style={{ color: "var(--color-mm-gray)" }}
        >
       
        </motion.p>

        {/* Links Cards */}
        {/* <div className="w-full max-w-lg flex flex-col gap-3">
          {[
            {
              title: "Our promise from us to you.",
              url: "https://mymind.com/our-promise",
            },
            {
              title: "A thought from mymind on social features.",
              url: "https://mymind.com/private-first",
            },
            {
              title: "A tool that works with your brain, not against it.",
              url: "https://mymind.com/adhd",
            },
          ].map((item, i) => (
            <motion.a
              key={item.title}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="flex items-center rounded-full bg-white px-6 py-3.5 transition-all duration-200"
              style={{
                boxShadow: "4px 4px 33px rgba(116, 130, 151, 0.13)",
              }}
            >
              <img
                src="/images/why/more-book-new.svg"
                alt="Book icon"
                className="mr-3 h-6 w-6 flex-shrink-0"
                draggable={false}
              />
              <span
                className="text-left font-sans text-sm md:text-base font-medium tracking-[-0.011em] text-[var(--color-mm-gray)] transition-colors duration-200 hover:text-[var(--color-mm-orange)]"
              >
                {item.title}
              </span>
            </motion.a>
          ))}
        </div> */}
      </div>
    </section>
  );
}
