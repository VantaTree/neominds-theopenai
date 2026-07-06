import React, { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Home, Folder, Building2, Crown, Settings, ChevronDown, LogOut, User } from "lucide-react";

export default function ClientNav() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="md:mb-0 w-full h-16 bg-white border-b border-mm-border px-6 md:px-8 flex items-center justify-between font-sans select-none fixed top-0 left-0 right-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left: Brand Logo & Navigation Tabs */}
      <div className="flex items-center gap-8 lg:gap-12">
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
          <img
            src="/logos/logo.PNG"
            alt="theopenai logo"
            style={{ height: "24px", width: "auto", display: "block" }}
          />
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
            activeProps={{ className: "bg-mm-orange/10 text-mm-orange" }}
            inactiveProps={{ className: "text-mm-gray hover:text-mm-dark hover:bg-mm-subtle" }}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>

          <Link
            to="/projects"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
            activeProps={{ className: "bg-mm-orange/10 text-mm-orange" }}
            inactiveProps={{ className: "text-mm-gray hover:text-mm-dark hover:bg-mm-subtle" }}
          >
            <Folder className="h-4 w-4" />
            <span>Projects</span>
          </Link>

          <button
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-mm-gray/40 cursor-not-allowed"
            disabled
            title="Coming soon"
          >
            <Building2 className="h-4 w-4" />
            <span>Our Businesses</span>
          </button>
        </div>
      </div>

      {/* Right: Actions (Upgrade, Settings, Profile Dropdown) */}
      <div className="flex items-center gap-3">
        {/* Upgrade Call to Action */}
        <button className="inline-flex items-center gap-1.5 bg-mm-orange hover:opacity-95 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer">
          <Crown className="h-3.5 w-3.5 fill-white" />
          <span>Upgrade</span>
        </button>

        {/* Settings Button */}
        <button className="p-2 text-mm-gray hover:text-mm-dark hover:bg-mm-subtle rounded-xl transition-all cursor-pointer">
          <Settings className="h-4.5 w-4.5" />
        </button>

        {/* Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-mm-subtle transition-all cursor-pointer"
          >
            {/* User Initials Circle */}
            <div className="h-7 w-7 rounded-full bg-mm-orange/10 text-mm-orange border border-mm-orange/20 flex items-center justify-center text-xs font-extrabold">
              JD
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-mm-gray transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-mm-border rounded-2xl shadow-lg py-2 z-50 animate-in fade-in-50 slide-in-from-top-1">
              <div className="px-4 py-2 border-b border-mm-border mb-1">
                <p className="text-xs text-mm-gray">Signed in as</p>
                <p className="text-sm font-bold text-mm-dark truncate">John Doe</p>
              </div>
              
              <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-mm-dark hover:bg-mm-subtle transition-colors text-left cursor-pointer">
                <User className="h-4 w-4 text-mm-gray" />
                <span>My Profile</span>
              </button>
              
              <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-mm-red hover:bg-mm-red/5 transition-colors text-left cursor-pointer">
                <LogOut className="h-4 w-4 text-mm-red/70" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
