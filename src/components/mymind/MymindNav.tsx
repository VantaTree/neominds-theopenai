import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { X, Menu } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";

const NAV_LINKS = [
  { label: "What", dot: "#FF5924", href: "/" },
  { label: "Why", dot: "#FF9224", href: "/why" },
  { label: "How", dot: "#FFE926", href: "/how" },
  { label: "About Us", dot: "#FF7DD3", href: "#" },
  { label: "Pricing", dot: "#5CB13E", href: "/plans" },
];

export function MymindNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="fixed left-0 right-0 top-0 z-50 px-6"
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
                // border: "1px solid rgba(0,0,0,0.06)",
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
              style={{ height: "24px", width: "auto", display: "block" }}
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
                <span
                  className="h-[6px] w-[6px] rounded-full shrink-0"
                  style={{ background: link.dot }}
                />
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
              to={user ? "/dashboard" : "/login"}
              className="hidden text-sm transition-colors duration-200 md:block"
              style={{ color: "#748297" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#24272D")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#748297")}
            >
              Log in
            </Link>
            <Link
              to="/assessment"
              className="hidden md:flex rounded-full px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
              style={{
                background: "#FF5924",
                // minHeight: 44,
                // display: "flex",
                alignItems: "center",
              }}
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
            className="fixed inset-0 z-40 flex flex-col bg-white md:hidden h-full"
          >
            <div className="h-[68px] shrink-0" />
            <nav className="flex flex-1 flex-col justify-center items-center gap-1 px-6 sm:px-8">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className="flex w-full items-center gap-3 py-5 text-4xl"
                  style={{
                    color: "#24272D",
                    borderColor: "#E2E6EE",
                    marginTop: i === 0 ? "auto" : "0",
                  }}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ background: link.dot }}
                  />
                  {link.label}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: NAV_LINKS.length * 0.06 + 0.05,
                  duration: 0.3,
                }}
                className="mt-auto mb-4 flex w-full flex-row justify-center gap-5"
              >
                <Link
                  to={user ? "/dashboard" : "/login"}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center rounded-full border py-3 px-5 text-xl font-medium"
                  style={{
                    color: "#24272D",
                    borderColor: "#E2E6EE",
                    minHeight: 44,
                  }}
                >
                  Log in
                </Link>
                <Link
                  to="/assessment"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center rounded-full py-3 px-5 text-xl font-medium text-white"
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
