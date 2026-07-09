import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Home, Folder, Building2, MessageCircle } from "lucide-react";
import { useBusiness } from "@/hooks/use-business";

export default function ClientBottomLinks() {
  const location = useLocation();
  const { businesses, activeBusiness, setActiveBusiness, loading } = useBusiness();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-mm-border h-16 flex items-center justify-around select-none font-sans">
      {/* Home */}
      <Link
        to="/dashboard"
        className={`flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors ${location.pathname === "/dashboard" ? "text-mm-orange" : "text-mm-gray hover:text-mm-dark"
          }`}
      >
        <Home className="h-4.5 w-4.5" />
        <span className="text-[10px] font-black tracking-wide">Home</span>
      </Link>

      {/* Projects */}
      <Link
        to="/projects"
        search={{ activeCard: undefined }}
        className={`flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors ${location.pathname === "/projects" ? "text-mm-orange" : "text-mm-gray hover:text-mm-dark"
          }`}
      >
        <Folder className="h-4.5 w-4.5" />
        <span className="text-[10px] font-extrabold tracking-wide">Projects</span>
      </Link>

      <Link
        to="/chat"
        className={`flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors ${location.pathname.startsWith("/chat") ? "text-mm-orange" : "text-mm-gray hover:text-mm-dark"}`}
      >
        <MessageCircle className="h-4.5 w-4.5" />
        <span className="text-[10px] font-extrabold tracking-wide">chat</span>
      </Link>

      {/* Our Business Dropdown */}
      {loading ? (
        <button
          disabled
          className="flex flex-col items-center justify-center space-y-1 text-mm-gray/40 cursor-not-allowed"
        >
          <Building2 className="h-4.5 w-4.5 animate-pulse" />
          <span className="text-[10px] font-extrabold tracking-wide">Loading...</span>
        </button>
      ) : businesses.length > 0 ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors ${dropdownOpen ? "text-mm-orange" : "text-mm-gray hover:text-mm-dark"}`}
          >
            <Building2 className="h-4.5 w-4.5" />
            <span className="text-[10px] font-extrabold tracking-wide max-w-[80px] truncate">
              {activeBusiness?.businessName || "Business"}
            </span>
          </button>
          
          {dropdownOpen && (
            <div className="absolute bottom-16 right-1/2 translate-x-1/2 mb-1 w-52 bg-white border border-mm-border rounded-2xl shadow-lg py-2 z-50 animate-in fade-in-50 slide-in-from-bottom-2">
              <div className="px-4 py-1.5 border-b border-mm-border mb-1">
                <p className="text-[10px] uppercase font-bold text-mm-gray tracking-wider">Switch Business</p>
              </div>
              {businesses.map((biz) => (
                <button
                  key={biz.id}
                  onClick={() => {
                    setActiveBusiness(biz);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-mm-subtle transition-colors cursor-pointer ${biz.id === activeBusiness?.id ? "font-bold text-mm-dark bg-mm-subtle/40" : "text-mm-gray"}`}
                >
                  <span className="truncate mr-2">{biz.businessName}</span>
                  {biz.plan && biz.plan !== "None" && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-mm-orange/10 text-mm-orange font-bold uppercase tracking-wider">
                      {biz.plan}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button
          disabled
          className="flex flex-col items-center justify-center space-y-1 text-mm-gray/40 cursor-not-allowed"
        >
          <Building2 className="h-4.5 w-4.5" />
          <span className="text-[10px] font-extrabold tracking-wide">No Business</span>
        </button>
      )}
    </div>
  );
}