import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, Folder, Building2, MessageCircle, Crown, Plus } from "lucide-react";
import { useBusiness } from "@/hooks/use-business";
import { useStreamConnection, getCachedClientStreamCredentials } from "@/lib/stream-connection";

export default function ClientBottomLinks() {
  const location = useLocation();
  const navigate = useNavigate();
  const { businesses, activeBusiness, setActiveBusiness, loading } = useBusiness();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [creds, setCreds] = useState<{ apiKey: string; uid: string; name: string; token: string } | null>(null);

  useEffect(() => {
    const businessId = activeBusiness?.id;
    if (!businessId) {
      setCreds(null);
      return;
    }

    let active = true;
    getCachedClientStreamCredentials(businessId)
      .then((res) => {
        if (active) {
          setCreds(res);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch stream credentials for bottom links:", err);
        if (active) {
          setCreds(null);
        }
      });

    return () => {
      active = false;
    };
  }, [activeBusiness?.id]);

  const connectionOptions = useMemo(() => {
    if (!creds) return null;
    return {
      apiKey: creds.apiKey,
      user: { id: creds.uid, name: creds.name },
      token: creds.token,
    };
  }, [creds]);

  const { client } = useStreamConnection(connectionOptions);

  useEffect(() => {
    if (!client) {
      setUnreadChatCount(0);
      return;
    }

    setUnreadChatCount((client.user as any)?.total_unread_count || 0);

    const handleEvent = (event: any) => {
      if (event.total_unread_count !== undefined) {
        setUnreadChatCount(event.total_unread_count);
      } else {
        setUnreadChatCount((client.user as any)?.total_unread_count || 0);
      }
    };

    client.on(handleEvent);
    return () => {
      client.off(handleEvent);
    };
  }, [client]);

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
        className={`flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors relative ${location.pathname.startsWith("/chat") ? "text-mm-orange" : "text-mm-gray hover:text-mm-dark"}`}
      >
        <div className="relative">
          <MessageCircle className="h-4.5 w-4.5" />
          {unreadChatCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 flex items-center justify-center bg-mm-green text-white text-[8px] font-black rounded-full shadow-xs animate-pulse">
              {unreadChatCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-extrabold tracking-wide">chat</span>
      </Link>

      {/* Our Business Dropdown */}
      {loading ? (
        <button
          disabled
          className="flex flex-col items-center justify-center space-y-1 text-mm-gray/40 cursor-not-allowed"
        >
          <div className="h-4.5 w-4.5 rounded bg-mm-orange/10 animate-pulse" />
          <span className="text-[10px] font-extrabold tracking-wide">Loading...</span>
        </button>
      ) : businesses.length > 0 ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors ${dropdownOpen ? "text-mm-orange" : "text-mm-gray hover:text-mm-dark"}`}
          >
            {activeBusiness?.image ? (
              <img src={activeBusiness.image} alt={activeBusiness.businessName} className="h-4.5 w-4.5 rounded object-cover aspect-square" />
            ) : (
              <div className="h-4.5 w-4.5 rounded bg-mm-orange/10 text-mm-orange flex items-center justify-center text-[9px] font-black uppercase">
                {activeBusiness?.businessName?.charAt(0) || "B"}
              </div>
            )}
            <span className="text-[10px] font-extrabold tracking-wide max-w-[80px] truncate">
              {activeBusiness?.businessName || "Business"}
            </span>
          </button>
          
          {dropdownOpen && (
            <div className="absolute bottom-16 right-0 mb-1 w-52 bg-white border border-mm-border rounded-2xl shadow-lg py-2 z-50 animate-in fade-in-50 slide-in-from-bottom-2">
              <div className="px-4 py-1.5 border-b border-mm-border mb-1">
                <p className="text-[10px] uppercase font-bold text-mm-gray tracking-wider">Switch Business</p>
              </div>
              {businesses.map((biz) => (
                <div
                  key={biz.id}
                  onClick={() => {
                    setActiveBusiness(biz);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-1.5 text-sm text-left hover:bg-mm-subtle transition-colors cursor-pointer ${biz.id === activeBusiness?.id ? "font-bold text-mm-dark bg-mm-subtle/40" : "text-mm-gray"}`}
                >
                  <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                    {biz.image ? (
                      <img src={biz.image} alt={biz.businessName} className="h-4.5 w-4.5 rounded object-cover aspect-square shrink-0" />
                    ) : (
                      <div className="h-4.5 w-4.5 rounded bg-mm-orange/10 text-mm-orange flex items-center justify-center text-[9px] font-black uppercase shrink-0">
                        {biz.businessName.charAt(0)}
                      </div>
                    )}
                    <span className="truncate">{biz.businessName}</span>
                    {biz.plan && biz.plan !== "None" && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-mm-orange/10 text-mm-orange font-bold uppercase tracking-wider shrink-0">
                        {biz.plan}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveBusiness(biz);
                      setDropdownOpen(false);
                      navigate({ to: "/plans" });
                    }}
                    title="Upgrade Business Plan"
                    className="ml-2 p-1 rounded-lg text-mm-orange hover:bg-mm-orange/10 hover:text-mm-orange transition-colors cursor-pointer shrink-0"
                  >
                    <Crown className="h-3.5 w-3.5 fill-current" />
                  </button>
                </div>
              ))}
              <div className="border-t border-mm-border my-1" />
              <Link
                to="/assessment"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-mm-orange font-semibold hover:bg-mm-orange/5 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Business</span>
              </Link>
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