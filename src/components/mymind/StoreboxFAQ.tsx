import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What is Business Buddy",
    answer:
      "Business Buddy is an AI-powered digital growth platform that helps businesses grow through website development, SEO, digital marketing, branding, AI automation, and business strategy all in one place.",
  },
  {
    question: "How is Business Buddy different from other agencies?",
    answer:
      "We don't start by selling services. We first understand your business through an AI Business Audit and then recommend the right strategy for your goals.",
  },
  {
    question: "What is an AI Business Audit?",
    answer:
      "Our AI Business Audit analyzes your website, SEO, branding, competitors, and online presence to identify opportunities and recommend a personalized growth strategy.",
  },
  {
    question: "Why does my business need a website?",
    answer:
      "A professional website builds trust, improves your Google visibility, generates leads, and gives your business a strong online presence.",
  },
  {
    question: "What services do you offer?",
    answer:
      "We provide website development, SEO, digital marketing, branding, social media management, AI chatbots, AI voicebots, business automation, and ongoing website support.",
  },
  // {
  //   question: "Who are your services for?",
  //   answer:
  //   "We work with startups, local businesses, small businesses, growing companies, and enterprises looking to strengthen their digital presence.",
  // },
  // {
  //   question: "How long does it take to build a website?",
  //   answer:
  //   "Most business websites are completed within 1–3 weeks, depending on the project requirements.",
  // },
  // {
  //   question: "Will my website work on mobile devices?",
  //   answer:
  //   "Yes. Every website we build is fully responsive, fast, and optimized for mobile, tablet, and desktop users.",
  // },
  {
    question: "Do you provide website maintenance?",
    answer:
    "Yes. We provide ongoing maintenance, updates, security, and technical support based on your subscription plan.",
  },
  {
    question: "Can you redesign my existing website?",
    answer:
    "Absolutely. We redesign outdated websites with a modern, SEO-friendly, and high-performing design that improves user experience.",
  },
  // {
  //   question: "Why are your pricing plans affordable?",
  //   answer:
  //   "Our subscription model makes professional website development, SEO, and digital marketing accessible without high upfront costs.",
  // },
  // {
  //   question: "Do I need all your services?",
  //   answer:
  //   "No. Every business is different. We recommend only the services that match your business goals.",
  // },
  {
    question: "Can you help my website rank on Google?",
    answer:
    "Yes. Our SEO experts optimize your website using technical SEO, local SEO, keyword research, and content optimization to improve search rankings.",
  },
  {
    question: "What is AI Automation?",
    answer:
    "AI Automation helps businesses save time by automating customer support, lead generation, follow-ups, and repetitive tasks.",
  },
  // {
  //   question: "Do you provide AI Chatbots and Voicebots?",
  //   answer:
  //   "Yes. We build AI chatbots and AI voice assistants to handle customer enquiries, appointments, and support 24/7.",
  // },
  {
    question: "Can I upgrade my plan later?",
    answer:
    "Yes. You can upgrade your plan anytime as your business grows.",
  },
  // {
  //   question: "Why choose The Business Buddy?",
  //   answer:
  //   "We provide complete digital growth solutions under one roof, offer AI-driven insights, transparent pricing, and commit to your long-term success.",
  // },
  // {
  //   question: "Do you work with international clients?",
  //   answer:
  //   "Yes. We provide website development, SEO, digital marketing, and AI solutions for businesses worldwide.",
  // },
  // {
  //   question: "How do I get started?",
  //   answer:
  //   "Simply contact us for a Free AI Business Audit, and we'll create a personalized digital growth strategy for your business.",
  // },
  
];

export function StoreboxFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <section
      className="w-full overflow-x-hidden py-20 md:py-28"
      style={{ background: "#F0F2F5" }}
      id="faq"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.22em]"
            style={{ color: "#FF5924" }}
          >
            FAQs
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="leading-tight"
            style={{
              fontFamily: "'Louize', Georgia, serif",
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              letterSpacing: "-0.03em",
              color: "#111418",
              fontWeight: 400,
            }}
          >
            Got questions? We&apos;ve got answers.
          </motion.h2>
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="overflow-hidden rounded-2xl"
              style={{
                background: "white",
                border: "1px solid #E2E6EE",
              }}
            >
              <button
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-200 hover:bg-gray-50"
                style={{ minHeight: 44 }}
                aria-expanded={openIndex === i}
              >
                <span
                  className="font-semibold text-sm sm:text-base leading-snug"
                  style={{ color: "#24272D" }}
                >
                  {item.question}
                </span>
                <span
                  className="shrink-0 text-xl font-light transition-transform duration-200"
                  style={{
                    color: "#FF5924",
                    transform: openIndex === i ? "rotate(45deg)" : "rotate(0deg)",
                  }}
                >
                  +
                </span>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <p
                      className="px-6 pb-5 text-sm leading-relaxed sm:text-base"
                      style={{ color: "#748297", fontFamily: "'Inter', sans-serif" }}
                    >
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
