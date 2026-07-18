import React, { useState, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CreditCard,
  FileText,
  BookOpen,
  Shield,
  Settings,
  X,
  Menu,
  MessageSquare,
} from "lucide-react";
import { getStreamCredentialsFn } from "@/lib/server-functions";

export default function AdminAside() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    let active = true;
    let client: any = null;

    async function checkUnread() {
      try {
        const creds = await getStreamCredentialsFn();
        if (!active) return;
        const { StreamChat } = await import("stream-chat");
        client = StreamChat.getInstance(creds.apiKey);
        const userState = await client.connectUser(
          { id: "admin", name: "Admin Manager" },
          creds.token,
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
      }
    }

    checkUnread();

    return () => {
      active = false;
      if (client) {
        client.disconnectUser();
      }
    };
  }, []);

  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin",
      isRealRoute: true,
      Icon: LayoutDashboard,
    },
    {
      name: "Users",
      href: "/admin/users",
      isRealRoute: true,
      Icon: Users,
    },
    {
      name: "Projects",
      href: "/admin/projects",
      isRealRoute: true,
      Icon: FolderKanban,
    },
    {
      name: "Payments",
      href: "/admin/payments",
      isRealRoute: true,
      Icon: CreditCard,
    },
    {
      name: "Reports",
      href: "/admin/reports",
      isRealRoute: true,
      Icon: FileText,
    },
    {
      name: "Blogs",
      href: "/admin/blogs",
      isRealRoute: true,
      Icon: BookOpen,
    },
    {
      name: "Audit Log",
      href: "/admin/audit",
      isRealRoute: true,
      Icon: Shield,
    },
    {
      name: "Chat",
      href: "/admin/chat",
      isRealRoute: true,
      Icon: MessageSquare,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      isRealRoute: true,
      Icon: Settings,
    },
  ];

  const onClose = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-mm-border bg-white select-none shrink-0 font-sans">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <img
            src="/logos/logo.PNG"
            alt="theopenai logo"
            style={{ height: "24px", width: "auto", display: "block" }}
          />
        </a>
        <div className="flex items-center gap-2">
          {/* Mobile Sidebar Hamburger Trigger */}
          <button
            onClick={() => setIsOpen(true)}
            className="text-mm-gray hover:text-mm-dark hover:bg-mm-subtle rounded-xl transition-all cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-mm-dark/40 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Panel Container */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed inset-y-0 left-0 border-r border-mm-border bg-white flex flex-col h-dvh md:h-screen z-50 transition-all duration-300 ease-in-out shrink-0 select-none md:sticky md:top-0 md:translate-x-0 overflow-hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isHovered ? "w-48" : "w-48 md:w-16"
        }`}
      >
        {/* Brand Logo Header */}
        <div className="px-6 md:px-[18px] py-4 border-b border-mm-border flex items-center justify-between shrink-0">
          {/* Logo */}
          <a href="/" className="relative flex items-center h-6 shrink-0">
            <img
              src="/logos/logo.PNG"
              alt="theopenai logo"
              className={`transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-100 md:opacity-0 md:absolute md:pointer-events-none"
              }`}
              style={{ height: "24px", width: "auto" }}
            />
            <img
              src="/logos/logo_mini.png"
              alt="theopenai logo"
              className={`transition-opacity duration-300 rounded-full border border-mm-border ${
                isHovered ? "opacity-0 md:absolute md:pointer-events-none" : "opacity-0 md:opacity-100 md:block hidden"
              }`}
              style={{ height: "28px", width: "auto" }}
            />
          </a>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="md:hidden p-1.5 text-mm-gray hover:text-mm-dark hover:bg-mm-subtle rounded-lg transition-colors cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 md:px-[11px] py-6 space-y-1 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const isActive =
              currentPath === item.href ||
              (item.href !== "/" &&
                item.href !== "/admin" &&
                item.href !== "#" &&
                currentPath.startsWith(item.href));
            const Icon = item.Icon;

            const handleClick = (e: React.MouseEvent) => {
              if (!item.isRealRoute) {
                e.preventDefault();
              } else {
                onClose(); // Close mobile drawer when user navigates
              }
            };

            if (item.isRealRoute) {
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={handleClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                    isActive
                      ? "bg-mm-subtle text-mm-dark translate-x-1"
                      : "text-mm-gray hover:text-mm-dark hover:bg-mm-subtle hover:translate-x-0.5"
                  }`}
                >
                  <div className="relative flex items-center justify-center shrink-0">
                    <Icon
                      className={`h-4.5 w-4.5 transition-all duration-200 ${
                        isActive
                          ? "text-mm-orange scale-105"
                          : "text-mm-gray/80 group-hover:text-mm-dark group-hover:scale-105"
                      }`}
                    />
                    {item.name === "Chat" && unreadChatCount > 0 && !isHovered && (
                      <span className="absolute -top-1.5 -right-1.5 h-2.5 w-2.5 bg-mm-green rounded-full border-2 border-white animate-pulse" />
                    )}
                  </div>
                  <span
                    className={`transition-opacity duration-300 whitespace-nowrap ${
                      isHovered ? "opacity-100" : "opacity-100 md:opacity-0"
                    }`}
                  >
                    {item.name}
                  </span>
                  {item.name === "Chat" && unreadChatCount > 0 && isHovered && (
                    <span className="ml-auto h-5 min-w-5 px-1.5 flex items-center justify-center bg-mm-green text-white text-[9px] font-black rounded-full shadow-xs animate-pulse">
                      {unreadChatCount}
                    </span>
                  )}
                </Link>
              );
            } else {
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={handleClick}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group text-mm-gray hover:text-mm-dark hover:bg-mm-subtle hover:translate-x-0.5 cursor-pointer"
                >
                  <div className="relative flex items-center justify-center shrink-0">
                    <Icon
                      className={`h-4.5 w-4.5 transition-all duration-200 ${
                        isActive
                          ? "text-mm-orange scale-105"
                          : "text-mm-gray/80 group-hover:text-mm-dark group-hover:scale-105"
                      }`}
                    />
                    {item.name === "Chat" && unreadChatCount > 0 && !isHovered && (
                      <span className="absolute -top-1.5 -right-1.5 h-2.5 w-2.5 bg-mm-green rounded-full border-2 border-white animate-pulse" />
                    )}
                  </div>
                  <span
                    className={`transition-opacity duration-300 whitespace-nowrap ${
                      isHovered ? "opacity-100" : "opacity-100 md:opacity-0"
                    }`}
                  >
                    {item.name}
                  </span>
                  {item.name === "Chat" && unreadChatCount > 0 && isHovered && (
                    <span className="ml-auto h-5 min-w-5 px-1.5 flex items-center justify-center bg-mm-green text-white text-[9px] font-black rounded-full shadow-xs animate-pulse">
                      {unreadChatCount}
                    </span>
                  )}
                </a>
              );
            }
          })}
        </nav>

        {/* Admin Profile Card */}
        <div className="p-5 md:px-[14px] border-t border-mm-border flex items-center gap-3 shrink-0">
          <img
            src="/logos/logo_mini.png"
            alt="John Doe"
            className="h-9 w-9 rounded-full object-cover border border-mm-border shrink-0"
          />
          <div
            className={`min-w-0 font-sans transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-100 md:opacity-0"
            }`}
          >
            <p className="text-sm font-bold text-mm-dark truncate">
              Super Admin
            </p>
            <p className="text-xs text-mm-gray truncate m-0 p-0">theOpenAI</p>
            <Link to="/logout" className="text-xs text-mm-red truncate">
              logout
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
