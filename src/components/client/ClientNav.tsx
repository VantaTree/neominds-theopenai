import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Home, Folder, Building2, Crown, Settings, ChevronDown, LogOut, User, MessageCircle, Plus } from "lucide-react";
import { useBusiness } from "@/hooks/use-business";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getClientStreamCredentialsFn } from "@/lib/server-functions";

export default function ClientNav() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { businesses, activeBusiness, setActiveBusiness, loading } = useBusiness();
  const [businessDropdownOpen, setBusinessDropdownOpen] = useState(false);
  const businessDropdownRef = useRef<HTMLDivElement>(null);
  const [mobileBusinessDropdownOpen, setMobileBusinessDropdownOpen] = useState(false);
  const mobileBusinessDropdownRef = useRef<HTMLDivElement>(null);
  
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    let active = true;
    let client: any = null;

    async function checkUnread() {
      const businessId = activeBusiness?.id;
      if (!businessId) {
        setUnreadChatCount(0);
        return;
      }

      try {
        const creds = await getClientStreamCredentialsFn({ data: businessId });
        if (!active) return;
        const { StreamChat } = await import("stream-chat");
        client = StreamChat.getInstance(creds.apiKey);
        const userState = await client.connectUser(
          { id: creds.uid, name: creds.name },
          creds.token
        );
        if (!active) return;
        setUnreadChatCount(userState.me.total_unread_count || 0);

        // Listen for new messages / read receipts globally to update count in real-time
        client.on((event: any) => {
          if (!active) return;
          if (
            event.type === "message.new" ||
            event.type === "message.read" ||
            event.type === "notification.message_new" ||
            event.type === "notification.mark_read"
          ) {
            setUnreadChatCount(client.user?.total_unread_count || 0);
          }
        });
      } catch (err) {
        // Silent error
        if (active) {
          setUnreadChatCount(0);
        }
      }
    }

    checkUnread();

    return () => {
      active = false;
      if (client) {
        client.disconnectUser();
      }
    };
  }, [activeBusiness?.id]);

  const [userProfile, setUserProfile] = useState({
    name: "John Doe",
    email: "",
    avatar: "",
  });

  // Load user profile from firebase auth on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserProfile({
          name: user.displayName || user.email?.split("@")[0] || "User",
          email: user.email || "",
          avatar: user.photoURL || "",
        });
      } else {
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem("user_profile");
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setUserProfile({
                name: parsed.name || "User",
                email: parsed.email || "",
                avatar: parsed.avatar || "",
              });
              return;
            } catch (e) {}
          }
        }
        setUserProfile({
          name: "User",
          email: "",
          avatar: "",
        });
      }
    });
    return unsubscribe;
  }, []);

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "U";
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (businessDropdownRef.current && !businessDropdownRef.current.contains(event.target as Node)) {
        setBusinessDropdownOpen(false);
      }
      if (mobileBusinessDropdownRef.current && !mobileBusinessDropdownRef.current.contains(event.target as Node)) {
        setMobileBusinessDropdownOpen(false);
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
            {unreadChatCount > 0 && (
              <span className="ml-1 h-4.5 min-w-4.5 px-1.5 flex items-center justify-center bg-mm-green text-white text-[9px] font-black rounded-full shadow-xs animate-pulse">
                {unreadChatCount}
              </span>
            )}
          </Link>
          
          {loading ? (
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-mm-gray/40 cursor-not-allowed"
              disabled
            >
              <div className="h-4 w-4 rounded bg-mm-orange/10 text-mm-orange flex items-center justify-center text-[9px] font-black uppercase animate-pulse" />
              <span>Loading...</span>
            </button>
          ) : businesses.length > 0 ? (
            <div className="relative" ref={businessDropdownRef}>
              <button
                onClick={() => setBusinessDropdownOpen(!businessDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-mm-gray hover:text-mm-dark hover:bg-mm-subtle transition-all cursor-pointer"
              >
                {activeBusiness?.image ? (
                  <img src={activeBusiness.image} alt={activeBusiness.businessName} className="h-4 w-4 rounded object-cover aspect-square" />
                ) : (
                  <div className="h-4 w-4 rounded bg-mm-orange/10 text-mm-orange flex items-center justify-center text-[9px] font-black uppercase">
                    {activeBusiness?.businessName?.charAt(0) || "B"}
                  </div>
                )}
                <span className="max-w-[120px] truncate">{activeBusiness?.businessName || "Select Business"}</span>
                {activeBusiness?.plan && activeBusiness.plan !== "None" && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-mm-orange/10 text-mm-orange font-bold uppercase tracking-wider scale-90">
                    {activeBusiness.plan}
                  </span>
                )}
                <ChevronDown className={`h-3 w-3 text-mm-gray/60 transition-transform duration-200 ${businessDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {businessDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white border border-mm-border rounded-2xl shadow-lg py-2 z-50 animate-in fade-in-50 slide-in-from-top-1">
                  <div className="px-4 py-1.5 border-b border-mm-border mb-1">
                    <p className="text-[10px] uppercase font-bold text-mm-gray tracking-wider">Switch Business</p>
                  </div>
                  {businesses.map((biz) => (
                    <div
                      key={biz.id}
                      onClick={() => {
                        setActiveBusiness(biz);
                        setBusinessDropdownOpen(false);
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
                          setBusinessDropdownOpen(false);
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
                    onClick={() => setBusinessDropdownOpen(false)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-mm-orange font-semibold hover:bg-mm-orange/5 transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Business</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/assessment"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-mm-orange hover:bg-mm-orange/5 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Businesses</span>
            </Link>
          )}

        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Mobile Business Selector is hidden/removed */}

        <Link 
        to="/plans"
        className="h-7 w-7 rounded-full bg-mm-orange/10 border border-mm-orange/20 flex items-center justify-center text-mm-orange cursor-pointer transition-all active:scale-95 md:inline-flex md:items-center md:gap-1.5 md:bg-mm-orange md:border-transparent md:text-white md:px-4 md:py-2 md:h-auto md:w-auto md:shadow-sm md:hover:opacity-95 md:rounded-xl">
          <Crown className="h-3.5 w-3.5 fill-mm-orange/10 md:fill-white" />
          <span className="hidden md:inline">Upgrade</span>
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-mm-subtle transition-all cursor-pointer"
          >
            {userProfile.avatar ? (
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="h-7 w-7 rounded-full object-cover border border-mm-orange/20 aspect-square"
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
                <p className="text-sm font-bold text-mm-dark truncate">{userProfile.name}</p>
                {userProfile.email && (
                  <p className="text-[10px] text-mm-gray truncate mt-0.5">{userProfile.email}</p>
                )}
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
                to="/businessProfile"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-mm-dark hover:bg-mm-subtle transition-colors text-left cursor-pointer"
              >
                <Building2 className="h-4 w-4 text-mm-gray" />
                <span>Business Profile</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-mm-dark hover:bg-mm-subtle transition-colors text-left cursor-pointer"
              >
                <Settings className="h-4 w-4 text-mm-gray" />
                <span>Settings</span>
              </Link>
              
              <button 
                onClick={async () => {
                  try {
                    await signOut(auth);
                    // Clear the session cookie
                    document.cookie = `__session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
                    navigate({ to: "/login" });
                  } catch (e) {
                    console.error("Logout failed:", e);
                  }
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-mm-red hover:bg-mm-red/5 transition-colors text-left cursor-pointer"
              >
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
