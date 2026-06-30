import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { X, Menu } from "lucide-react";
import { Link } from "@tanstack/react-router";

const NAV_LINKS = [
  { label: "Product", dot: "#FF5924", href: "#" },
  { label: "Pricing", dot: "#FFE926", href: "#" },
  { label: "Compare", dot: "#FF7DD3", href: "#" },
  { label: "Blog", dot: "#5CB13E", href: "#" },
];

export function MymindNav() {
  const lastY = useRef(0);
  const [isHidden, setIsHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (menuOpen) return;
      const currentY = window.scrollY;
      setScrolled(currentY > 50);
      const scrollingDown = currentY > lastY.current;
      setIsHidden(scrollingDown && currentY > 100);
      lastY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: isHidden && !menuOpen ? "-110%" : 0, opacity: 1 }}
        transition={{ duration: isHidden ? 0.25 : 0.35, ease: "easeInOut" }}
        className="fixed left-0 right-0 top-0 z-50"
        style={{ background: "transparent" }}
      >
        <div
          className="mx-auto flex items-center justify-between"
          style={
            scrolled
              ? {
                maxWidth: 900,
                margin: "12px auto",
                padding: "8px 20px",
                background: "rgba(255,255,255,0.96)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderRadius: 60,
                boxShadow: "0 2px 24px rgba(0,0,0,0.10)",
                border: "1px solid rgba(0,0,0,0.06)",
                transition: "all 0.35s ease",
              }
              : {
                maxWidth: "100%",
                padding: "20px 24px",
                transition: "all 0.35s ease",
              }
          }
        >
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <img
              src="/logos/logo.PNG"
              alt="theopenai logo"
              style={{ height: "65px", width: "auto", display: "block" }}
            />
          </a>

          {/* Center nav */}
          <nav className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                className="relative flex items-center gap-1.5 text-sm transition-colors duration-200"
                style={{ color: "#748297", fontFamily: "'Inter', sans-serif" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#24272D")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#748297")}
                whileHover="hover"
              >
                <span className="h-[6px] w-[6px] rounded-full shrink-0" style={{ background: link.dot }} />
                {link.label}
                <motion.span
                  className="absolute bottom-0 left-0 h-0.5 w-full"
                  style={{ background: "#24272D", originX: 0 }}
                  initial={{ scaleX: 0 }}
                  variants={{ hover: { scaleX: 1 } }}
                  transition={{ duration: 0.2 }}
                />
              </motion.a>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden text-sm transition-colors duration-200 md:block"
              style={{ color: "#748297" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#24272D")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#748297")}
            >
              Log in
            </Link>
            <Link
              to="/assessment"
              className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
              style={{ background: "#FF5924", minHeight: 44, display: "flex", alignItems: "center" }}
            >
              Get Free Draft
            </Link>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="flex h-11 w-11 items-center justify-center rounded-lg md:hidden"
              style={{ color: "#748297" }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile full-screen overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 flex flex-col bg-white md:hidden"
          >
            <div className="h-[68px] shrink-0" />
            <nav className="flex flex-1 flex-col items-start justify-center gap-1 px-6 sm:px-8">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className="flex w-full items-center gap-3 border-b py-5 text-2xl font-semibold"
                  style={{ color: "#24272D", borderColor: "#E2E6EE" }}
                >
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: link.dot }} />
                  {link.label}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: NAV_LINKS.length * 0.06 + 0.05, duration: 0.3 }}
                className="mt-8 flex w-full flex-col gap-3"
              >
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-full border py-3 text-sm font-medium"
                  style={{ color: "#24272D", borderColor: "#E2E6EE", minHeight: 44 }}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-full py-3 text-sm font-medium text-white"
                  style={{ background: "#FF5924", minHeight: 44 }}
                >
                  Get Free Draft
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
