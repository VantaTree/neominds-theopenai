import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Check,
  Sparkles,
} from "lucide-react";
import GradientGlow from "../GradientGlow";

const SERVICES = [
  { id: "website", label: "Website Design", color: "#FF5924" },
  { id: "seo", label: "SEO & Marketing", color: "#FF7DD3" },
  { id: "crm", label: "CRM & Automation", color: "#FFE926" },
  { id: "consulting", label: "Consulting", color: "#5CB13E" },
  { id: "other", label: "Other Inquiries", color: "#85D3FF" },
];

export function MymindContact() {
  const [selectedService, setSelectedService] = useState("website");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1800);
  };

  const activeColor =
    SERVICES.find((s) => s.id === selectedService)?.color || "#FF5924";

  return (
    <section
      id="contact"
      className="relative w-full overflow-hidden bg-white py-20 border-t border-mm-border"
    >
      {/* Decorative Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <GradientGlow
          position="absolute"
          size="600px"
          color1="var(--color-mm-orange)"
          color2="var(--color-mm-pink)"
          color3="var(--color-mm-yellow)"
          speed="25s"
          blur="120px"
          glowOpacity={0.05}
          style={{ top: "10%", left: "5%", transform: "translateX(0)" }}
        />
        <GradientGlow
          position="absolute"
          size="700px"
          color1="var(--color-mm-blue)"
          color2="var(--color-mm-pink)"
          color3="var(--color-mm-yellow)"
          speed="30s"
          blur="140px"
          glowOpacity={0.04}
          style={{ bottom: "10%", right: "-10%", transform: "translateX(0)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.22em]"
            style={{ color: "#FF5924" }}
          >
            Let's Collaborate
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-serif font-bold text-mm-dark leading-[1.1] mb-6"
          >
            Connect with our experts
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-mm-gray font-normal leading-relaxed"
          >
            Tell us about your project goals. We analyze your requirements and
            assemble the ideal team to design, manage, and scale your digital
            solution.
          </motion.p>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Contact Cards & Business Info */}
          <div className="col-span-1 lg:col-span-5 space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-serif font-bold text-mm-dark mb-2">
                Direct Contact
              </h3>
              <p className="text-sm sm:text-base text-mm-gray leading-relaxed mb-6">
                Prefer to reach out directly? Use the channels below. We look
                forward to hearing from you.
              </p>
            </motion.div>

            {/* Contact Details List */}
            <div className="space-y-4">
              {[
                {
                  id: "contact-email",
                  icon: Mail,
                  label: "Email Address",
                  value: "hello@theopenai.org",
                  href: "mailto:hello@theopenai.org",
                  delay: 0.1,
                },
                {
                  id: "contact-phone",
                  icon: Phone,
                  label: "Phone Support",
                  value: "+91 98765 43210",
                  href: "tel:+919876543210",
                  delay: 0.15,
                },
                {
                  id: "contact-location",
                  icon: MapPin,
                  label: "Office Location",
                  value: "Hyderabad, India",
                  delay: 0.2,
                },
              ].map((item) => {
                const IconComp = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: item.delay }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="flex items-start gap-4 p-5 rounded-2xl border border-mm-border bg-white shadow-sm hover:shadow-md hover:border-mm-dark/10 transition-all group"
                  >
                    <div className="p-3 rounded-xl bg-mm-subtle/50 text-mm-orange group-hover:bg-mm-orange group-hover:text-white transition-colors duration-300">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold tracking-widest text-mm-gray uppercase mb-1">
                        {item.label}
                      </span>
                      {item.href ? (
                        <a
                          id={item.id}
                          href={item.href}
                          className="text-base font-semibold text-mm-dark hover:text-mm-orange transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <span
                          id={item.id}
                          className="text-base font-semibold text-mm-dark"
                        >
                          {item.value}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Business Hours */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="p-5 rounded-2xl border border-mm-border bg-mm-subtle/25"
            >
              <div className="flex items-center gap-3 text-mm-dark/80 font-semibold text-sm mb-2">
                <Clock className="w-4.5 h-4.5 text-mm-orange" />
                <span>Operating Hours</span>
              </div>
              <p className="text-xs sm:text-sm text-mm-gray leading-relaxed">
                Monday through Friday, 9:00 AM – 6:00 PM IST. We strive to
                review and reply to all project submissions within one business
                day.
              </p>
            </motion.div>
          </div>

          {/* Right Column: Animated Glassmorphic Form Card */}
          <div className="col-span-1 lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative rounded-3xl border border-mm-border bg-white shadow-xl shadow-mm-dark/5 p-6 sm:p-10 overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.div
                    key="form-view"
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-mm-dark mb-6">
                      Send a message
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Interactive Selection Pills */}
                      <div>
                        <label className="block text-[10px] font-bold tracking-wider text-mm-gray uppercase mb-3">
                          What are you looking for?
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {SERVICES.map((srv) => (
                            <button
                              key={srv.id}
                              type="button"
                              id={`service-pill-${srv.id}`}
                              onClick={() => setSelectedService(srv.id)}
                              className="relative px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer focus:outline-none overflow-hidden"
                              style={{
                                borderColor:
                                  selectedService === srv.id
                                    ? srv.color
                                    : "var(--color-mm-border)",
                                color:
                                  selectedService === srv.id
                                    ? "#fff"
                                    : "var(--color-mm-dark)",
                              }}
                            >
                              <span className="relative z-10">{srv.label}</span>
                              {selectedService === srv.id && (
                                <motion.span
                                  layoutId="active-pill-bg-section"
                                  className="absolute inset-0 z-0"
                                  style={{ backgroundColor: srv.color }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 380,
                                    damping: 30,
                                  }}
                                />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Name Input */}
                      <div className="relative">
                        <label className="block text-[10px] font-bold tracking-wider text-mm-gray uppercase mb-1.5">
                          Your Name
                        </label>
                        <div
                          className={`flex items-center gap-3 px-4 py-3.5 border rounded-2xl bg-mm-subtle/10 transition-all ${
                            focusedField === "name"
                              ? "border-mm-dark bg-white ring-2 ring-mm-dark/5"
                              : "border-mm-border"
                          }`}
                        >
                          <input
                            type="text"
                            required
                            id="input-name"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onFocus={() => setFocusedField("name")}
                            onBlur={() => setFocusedField(null)}
                            className="w-full bg-transparent border-none outline-none text-sm text-mm-dark placeholder:text-mm-gray/40 font-sans"
                          />
                        </div>
                      </div>

                      {/* Email Input */}
                      <div className="relative">
                        <label className="block text-[10px] font-bold tracking-wider text-mm-gray uppercase mb-1.5">
                          Email Address
                        </label>
                        <div
                          className={`flex items-center gap-3 px-4 py-3.5 border rounded-2xl bg-mm-subtle/10 transition-all ${
                            focusedField === "email"
                              ? "border-mm-dark bg-white ring-2 ring-mm-dark/5"
                              : "border-mm-border"
                          }`}
                        >
                          <input
                            type="email"
                            required
                            id="input-email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocusedField("email")}
                            onBlur={() => setFocusedField(null)}
                            className="w-full bg-transparent border-none outline-none text-sm text-mm-dark placeholder:text-mm-gray/40 font-sans"
                          />
                        </div>
                      </div>

                      {/* Project Details Message */}
                      <div className="relative">
                        <label className="block text-[10px] font-bold tracking-wider text-mm-gray uppercase mb-1.5 font-sans">
                          Tell us about your project
                        </label>
                        <div
                          className={`flex items-start gap-3 px-4 py-3.5 border rounded-2xl bg-mm-subtle/10 transition-all ${
                            focusedField === "message"
                              ? "border-mm-dark bg-white ring-2 ring-mm-dark/5"
                              : "border-mm-border"
                          }`}
                        >
                          <textarea
                            required
                            rows={4}
                            id="input-message"
                            placeholder="Tell us what you're building, your target timelines, or any specific challenges you're facing..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onFocus={() => setFocusedField("message")}
                            onBlur={() => setFocusedField(null)}
                            className="w-full bg-transparent border-none outline-none text-sm text-mm-dark placeholder:text-mm-gray/40 font-sans resize-none"
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        id="submit-contact"
                        className="w-full py-4 rounded-2xl text-white font-semibold text-sm shadow-lg active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 group relative overflow-hidden"
                        style={{
                          background: activeColor,
                          boxShadow: `0 10px 25px -5px ${activeColor}40`,
                        }}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full bg-white animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            />
                            <span
                              className="w-2 h-2 rounded-full bg-white animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            />
                            <span
                              className="w-2 h-2 rounded-full bg-white animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            />
                          </div>
                        ) : (
                          <>
                            <span>Send Message</span>
                            <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  // Submitted Success State View (Framer Motion Animated Check)
                  <motion.div
                    key="success-view"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center justify-center text-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: 0.15,
                      }}
                      className="w-20 h-20 rounded-full flex items-center justify-center text-white mb-8"
                      style={{ backgroundColor: activeColor }}
                    >
                      <Check className="w-10 h-10 stroke-[3]" />
                    </motion.div>

                    <h3 className="text-3xl font-serif font-bold text-mm-dark mb-4">
                      Message Sent!
                    </h3>
                    <p className="text-mm-gray text-base max-w-sm mb-8 leading-relaxed font-sans">
                      Thank you for reaching out,{" "}
                      <span className="font-semibold text-mm-dark">{name}</span>
                      . We've received your request about{" "}
                      <span className="font-semibold text-mm-dark">
                        {SERVICES.find((s) => s.id === selectedService)?.label}
                      </span>{" "}
                      and will get back to you shortly.
                    </p>

                    <button
                      type="button"
                      id="reset-form"
                      onClick={() => {
                        setIsSubmitted(false);
                        setName("");
                        setEmail("");
                        setMessage("");
                      }}
                      className="px-6 py-2.5 rounded-full border border-mm-border text-xs font-semibold text-mm-gray hover:text-mm-dark hover:border-mm-dark transition-all cursor-pointer"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
