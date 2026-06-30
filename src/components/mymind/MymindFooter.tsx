import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
} from "lucide-react";

const BLOG_POSTS = [
  {
    category: "SEO TIPS",
    title: "How small businesses rank on Page 1 without an agency",
    href: "#",
    image: "/images/blog-newquicknote.jpg",
  },
  {
    category: "CASE STUDY",
    title: "From Thumbtack to 2 bookings a day: Maria's story",
    href: "#",
    image: "/images/blog-human-endeavor.jpg",
  },
  {
    category: "PRODUCT",
    title: "How theopenai gets your business found on ChatGPT",
    href: "#",
    image: "/images/blog-on-posters.jpg",
  },
];

export function MymindFooter() {
  return (
    <footer className="w-full overflow-x-hidden" style={{ background: "#fff" }}>
      {/* Blog posts */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-6 pt-12 sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-10 sm:mb-12"
        >
          <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-3">
            {BLOG_POSTS.map((post) => (
              <motion.a
                key={post.href + post.title}
                href={post.href}
                whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(0,0,0,0.10)" }}
                transition={{ duration: 0.25 }}
                className="group flex flex-col gap-3 overflow-hidden rounded-2xl"
                style={{ background: "#F0F2F5" }}
              >
                <div className="overflow-hidden rounded-2xl" style={{ aspectRatio: "16/10" }}>
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="px-1 pb-3">
                  <p
                    className="mb-1 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: "#748297" }}
                  >
                    {post.category}
                  </p>
                  <p
                    className="text-sm font-medium leading-snug"
                    style={{ color: "#24272D" }}
                  >
                    {post.title}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Footer Main Content Grid */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 py-12 border-t border-mm-border"
        >
          {/* Logo & Tagline column */}
          <div className="col-span-1 md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mm-orange text-white text-lg font-bold">
                ∅
              </div>
              <span className="font-extrabold text-xl text-mm-dark font-sans tracking-tight">
                The Open AI
              </span>
            </div>
            <div className="space-y-1 pt-2">
              <p className="text-lg font-bold text-mm-dark leading-tight font-sans">
                AI Finds the <span className="text-mm-orange">Problem</span>.
              </p>
              <p className="text-lg font-bold text-mm-dark leading-tight font-sans">
                Experts Deliver the <span className="text-mm-orange">Solution</span>.
              </p>
            </div>
            <p className="text-sm text-mm-dark/60 leading-relaxed max-w-sm font-sans pt-2">
              We help businesses identify growth bottlenecks, prioritize opportunities,
              and execute the right solutions for sustainable growth.
            </p>
          </div>

          {/* Contact details column */}
          <div className="col-span-1 md:col-span-3 space-y-4 pt-4 md:pt-14">
            <div className="flex flex-col gap-4 font-sans text-sm text-mm-dark/80">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mm-orange/10 text-mm-orange">
                  <Mail className="h-4 w-4" />
                </div>
                <a
                  href="mailto:hello@theopenai.org"
                  className="hover:text-mm-orange transition-colors"
                >
                  hello@theopenai.org
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mm-orange/10 text-mm-orange">
                  <Phone className="h-4 w-4" />
                </div>
                <a
                  href="tel:+919876543210"
                  className="hover:text-mm-orange transition-colors"
                >
                  +91 98765 43210
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mm-orange/10 text-mm-orange">
                  <MapPin className="h-4 w-4" />
                </div>
                <span>Hyderabad, India</span>
              </div>
            </div>
          </div>

          {/* Solutions column */}
          <div className="col-span-1 md:col-span-2">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-mm-orange border-b-2 border-mm-orange/20 pb-1 w-max">
              Solutions
            </p>
            <div className="flex flex-col gap-2.5 font-sans">
              {[
                "Business Audit",
                "Website Development",
                "SEO Optimization",
                "Digital Marketing",
                "Google Ads",
                "Social Media Marketing",
                "Business Consulting",
              ].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm text-mm-dark/70 hover:text-mm-orange transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Company column */}
          <div className="col-span-1 md:col-span-2">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-mm-orange border-b-2 border-mm-orange/20 pb-1 w-max">
              Company
            </p>
            <div className="flex flex-col gap-2.5 font-sans">
              {[
                { label: "About Us", href: "#" },
                { label: "How It Works", href: "#" },
                { label: "Pricing", href: "#" },
                { label: "Contact Us", href: "#" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-mm-dark/70 hover:text-mm-orange transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Follow Us column */}
          <div className="col-span-1 md:col-span-1">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-mm-orange border-b-2 border-mm-orange/20 pb-1 w-max">
              Follow Us
            </p>
            <div className="flex flex-row md:flex-col lg:flex-row flex-wrap gap-2">
              {[
                { Icon: Linkedin, href: "#" },
                { Icon: Instagram, href: "#" },
                { Icon: Facebook, href: "#" },
                { Icon: Youtube, href: "#" },
                { Icon: Twitter, href: "#" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-mm-border text-mm-dark hover:border-mm-orange hover:text-mm-orange hover:bg-mm-orange/5 transition-all duration-300"
                >
                  <social.Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bottom bar */}
        <div className="mt-6 h-px w-full bg-mm-border" />
        <div className="mt-6 mb-8 flex flex-col items-center justify-between gap-4 text-xs sm:flex-row text-mm-gray font-sans">
          <p>© 2026 The Open AI. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-mm-orange shrink-0" />
            <span>Secure. Trusted. Committed to Your Growth.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
