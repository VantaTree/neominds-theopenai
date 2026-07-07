import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Home, Folder, Building2, User, LogOut } from "lucide-react";

export default function ClientBottomLinks() {
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-mm-border h-16 flex items-center justify-around select-none font-sans">
      {/* Home */}
      <Link
        to="/dashboard"
        className={`flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors ${
          location.pathname === "/dashboard" ? "text-mm-orange" : "text-mm-gray hover:text-mm-dark"
        }`}
      >
        <Home className="h-4.5 w-4.5" />
        <span className="text-[10px] font-black tracking-wide">Home</span>
      </Link>

      {/* Projects */}
      <Link
        to="/projects"
        search={{ activeCard: undefined }}
        className={`flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors ${
          location.pathname === "/projects" ? "text-mm-orange" : "text-mm-gray hover:text-mm-dark"
        }`}
      >
        <Folder className="h-4.5 w-4.5" />
        <span className="text-[10px] font-extrabold tracking-wide">Projects</span>
      </Link>

      {/* Our Business */}
      <button
        disabled
        className="flex flex-col items-center justify-center space-y-1 text-mm-gray/40 cursor-not-allowed"
      >
        <Building2 className="h-4.5 w-4.5" />
        <span className="text-[10px] font-extrabold tracking-wide">Our Business</span>
      </button>

      {/* Profile Dropdown Container */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className={`flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors ${
            profileOpen ? "text-mm-orange" : "text-mm-gray hover:text-mm-dark"
          }`}
        >
          <User className="h-4.5 w-4.5" />
          <span className="text-[10px] font-extrabold tracking-wide">Profile</span>
        </button>

        {/* Profile Popover / Dropdown appearing ABOVE the nav link */}
        {profileOpen && (
          <div className="absolute right-[-10px] bottom-14 w-44 bg-white border border-mm-border rounded-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)] py-2 z-50 animate-in fade-in-50 slide-in-from-bottom-2">
            <div className="px-4 py-2 border-b border-mm-border mb-1">
              <p className="text-[10px] text-mm-gray">Signed in as</p>
              <p className="text-xs font-black text-mm-dark truncate">John Doe</p>
            </div>
            
            <button className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-mm-dark hover:bg-mm-subtle transition-colors text-left cursor-pointer">
              <User className="h-3.5 w-3.5 text-mm-gray" />
              <span>My Profile</span>
            </button>
            
            <button className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#FF5924] hover:bg-[#FF5924]/5 transition-colors text-left cursor-pointer">
              <LogOut className="h-3.5 w-3.5 text-[#FF5924]/85" />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}