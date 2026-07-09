import React, { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Home, Folder, Building2, Crown, Settings, ChevronDown, LogOut, User, MessageCircle } from "lucide-react";

export default function ClientNav() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userProfile, setUserProfile] = useState({
    name: "John Doe",
    avatar: "",
  });

  // Load user profile from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("user_profile");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.name) {
            setUserProfile({
              name: parsed.name,
              avatar: parsed.avatar || "",
            });
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "U";
  };

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
    <nav className="w-full h-16 bg-white border-b border-mm-border px-5 md:px-8 flex items-center justify-between font-sans select-none fixed top-0 left-0 right-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-8 lg:gap-12">
        <img
          src="/logos/logo.PNG"
          alt="theopenai logo"
          style={{ height: "24px", width: "auto", display: "block" }}
        />

        <div className="hidden md:flex items-center gap-1.5 flex-wrap">
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
            search={{ activeCard: undefined }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
            activeProps={{ className: "bg-mm-orange/10 text-mm-orange" }}
            inactiveProps={{ className: "text-mm-gray hover:text-mm-dark hover:bg-mm-subtle" }}
          >
            <Folder className="h-4 w-4" />
            <span>Projects</span>
          </Link>

          <Link
            to="/chat"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
            activeProps={{ className: "bg-mm-orange/10 text-mm-orange" }}
            inactiveProps={{ className: "text-mm-gray hover:text-mm-dark hover:bg-mm-subtle" }}
          >
            <MessageCircle className="h-4 w-4" />
            <span>Chat</span>
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

      <div className="flex items-center gap-3">
        <button className="h-7 w-7 rounded-full bg-mm-orange/10 border border-mm-orange/20 flex items-center justify-center text-mm-orange cursor-pointer transition-all active:scale-95 md:inline-flex md:items-center md:gap-1.5 md:bg-mm-orange md:border-transparent md:text-white md:px-4 md:py-2 md:h-auto md:w-auto md:shadow-sm md:hover:opacity-95 md:rounded-xl">
          <Crown className="h-3.5 w-3.5 fill-mm-orange/10 md:fill-white" />
          <span className="hidden md:inline">Upgrade</span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-mm-subtle transition-all cursor-pointer"
          >
            {userProfile.avatar ? (
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="h-7 w-7 rounded-full object-cover border border-mm-orange/20"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-mm-orange/10 text-mm-orange border border-mm-orange/20 flex items-center justify-center text-xs font-extrabold">
                {getInitials(userProfile.name)}
              </div>
            )}
            <ChevronDown className={`h-3.5 w-3.5 text-mm-gray transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-mm-border rounded-2xl shadow-lg py-2 z-50 animate-in fade-in-50 slide-in-from-top-1">
              <div className="px-4 py-2 border-b border-mm-border mb-1">
                <p className="text-xs text-mm-gray">Signed in as</p>
                <p className="text-sm font-bold text-mm-dark truncate">{userProfile.name}</p>
              </div>
              
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-mm-dark hover:bg-mm-subtle transition-colors text-left cursor-pointer"
              >
                <User className="h-4 w-4 text-mm-gray" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-mm-dark hover:bg-mm-subtle transition-colors text-left cursor-pointer"
              >
                <Settings className="h-4 w-4 text-mm-gray" />
                <span>Settings</span>
              </Link>
              
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
