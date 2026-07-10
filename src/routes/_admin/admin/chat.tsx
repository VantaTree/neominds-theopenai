import React, { useState, useEffect, useRef, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { StreamChat } from "stream-chat";
import { z } from "zod";
import {
  Search,
  Plus,
  SendHorizontal,
  ArrowLeft,
  MoreVertical,
  MessageSquare,
  Sparkles,
  AlertCircle,
  Monitor,
  Megaphone,
  Zap,
  Lock,
  ChevronDown,
  ChevronUp,
  Check,
  CheckCheck,
} from "lucide-react";
import {
  getUsersFn,
  getBusinessesFn,
  getStreamCredentialsFn,
} from "@/lib/server-functions";
import type { User, Business } from "@/lib/schemas";
import { getStreamChannelId } from "@/lib/utils";
import { Avatar } from "@/components/admin/shared";

const chatSearchSchema = z.object({
  user: z.string().optional(),
  business: z.string().optional(),
  domain: z.string().optional(),
});

export function formatChatTimestamp(dateInput: Date | string | null | undefined) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const isToday = date.getDate() === now.getDate() &&
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.getDate() === yesterday.getDate() &&
                      date.getMonth() === yesterday.getMonth() &&
                      date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return "Yesterday";
  }

  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ============================================================================
// ROUTE REGISTRATION & LOADER
// ============================================================================
export const Route = createFileRoute("/_admin/admin/chat")({
  validateSearch: (search) => chatSearchSchema.parse(search),
  loader: async () => {
    try {
      const [users, businesses] = await Promise.all([
        getUsersFn(),
        getBusinessesFn(),
      ]);
      return { users, businesses };
    } catch (err) {
      console.error("Loader failed to fetch chat users/businesses:", err);
      return { users: [], businesses: [] };
    }
  },
  component: ChatRouteComponent,
});

// ============================================================================
// CHAT SUB-COMPONENTS
// ============================================================================

interface ChatSidebarProps {
  groupedChats: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeGroupKey: string | null;
  activeDropdownId: string | null;
  setActiveDropdownId: (id: string | null) => void;
  activeActionDropdownId: string | null;
  setActiveActionDropdownId: (id: string | null) => void;
  activeUserId: string | undefined;
  activeDomain: string | undefined;
  handleSelectGroup: (chat: any) => void;
  handleSelectDomain: (
    userId: string,
    businessId: string,
    domain: string,
  ) => void;
  handleRemoveChat: (userId: string, businessId: string) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  actionMenuRef: React.RefObject<HTMLDivElement | null>;
  activeBusinessId: string | undefined;
  typingStates: Record<string, boolean>;
}

function ChatSidebar({
  groupedChats,
  searchQuery,
  setSearchQuery,
  activeGroupKey,
  activeDropdownId,
  setActiveDropdownId,
  activeActionDropdownId,
  setActiveActionDropdownId,
  activeUserId,
  activeBusinessId,
  activeDomain,
  handleSelectGroup,
  handleSelectDomain,
  handleRemoveChat,
  dropdownRef,
  actionMenuRef,
  typingStates,
}: ChatSidebarProps) {
  const { businesses } = Route.useLoaderData();
  return (
    <div
      className={`${
        activeUserId && activeDomain ? "hidden md:flex" : "flex"
      } w-full md:w-[320px] lg:w-[380px] border-r border-mm-border flex-col h-full bg-[#FCFDFE] shrink-0`}
    >
      {/* Sidebar Search Bar */}
      <div className="p-3.5 shrink-0 bg-[#FCFDFE] border-b border-mm-border/50">
        <div className="relative flex items-center bg-[#F0F2F5] rounded-xl px-3 py-2 text-mm-gray focus-within:text-mm-dark transition-all">
          <Search className="h-4 w-4 shrink-0 mr-3 text-mm-gray/80" />
          <input
            type="text"
            placeholder="Search clients or businesses"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-xs font-semibold placeholder-mm-gray/60 outline-hidden text-mm-dark"
          />
        </div>
      </div>

      {/* Chats Sidebar Rows */}
      <div className="flex-1 h-full overflow-y-auto divide-y divide-mm-border/30 relative">
        {groupedChats.length > 0 ? (
          groupedChats.map((chat) => {
            const groupKey = `${chat.userId}_${chat.businessId}`;
            const isActive = activeGroupKey === groupKey;

            const websiteChan = chat.channels["website"];
            const isWebsiteTyping = !!(
              websiteChan && typingStates[websiteChan.id]
            );
            const websiteMessages = websiteChan?.state?.messages || [];
            const hasWebsite = websiteMessages.length > 0;
            const websiteLastMsg = hasWebsite
              ? websiteMessages[websiteMessages.length - 1]
              : null;
            const websiteText = isWebsiteTyping
              ? "typing..."
              : websiteLastMsg
                ? `${websiteLastMsg.user?.id === "admin" ? "You" : (websiteLastMsg.user?.name || chat.userName || "Client")}: ${websiteLastMsg.text}`
                : "No messages yet";
            const websiteTime = websiteLastMsg
              ? formatChatTimestamp(websiteLastMsg.created_at)
              : "";
            const isGroupActive =
              activeUserId === chat.userId &&
              activeBusinessId === chat.businessId;
            const websiteUnread =
              isGroupActive && activeDomain === "website"
                ? 0
                : websiteChan?.countUnread?.() || 0;

            const marketingChan = chat.channels["marketing"];
            const isMarketingTyping = !!(
              marketingChan && typingStates[marketingChan.id]
            );
            const marketingMessages = marketingChan?.state?.messages || [];
            const hasMarketing = marketingMessages.length > 0;
            const marketingLastMsg = hasMarketing
              ? marketingMessages[marketingMessages.length - 1]
              : null;
            const marketingText = isMarketingTyping
              ? "typing..."
              : marketingLastMsg
                ? `${marketingLastMsg.user?.id === "admin" ? "You" : (marketingLastMsg.user?.name || chat.userName || "Client")}: ${marketingLastMsg.text}`
                : "No messages yet";
            const marketingTime = marketingLastMsg
              ? formatChatTimestamp(marketingLastMsg.created_at)
              : "";
            const marketingUnread =
              isGroupActive && activeDomain === "marketing"
                ? 0
                : marketingChan?.countUnread?.() || 0;

            const automationChan = chat.channels["automation"];
            const isAutomationTyping = !!(
              automationChan && typingStates[automationChan.id]
            );
            const automationMessages = automationChan?.state?.messages || [];
            const hasAutomation = automationMessages.length > 0;
            const automationLastMsg = hasAutomation
              ? automationMessages[automationMessages.length - 1]
              : null;
            const businessObj = businesses.find((b) => b.id === chat.businessId);
            const isAutomationLocked = businessObj ? businessObj.plan !== "Pro" : true;
            const automationText = isAutomationTyping
              ? "typing..."
              : automationLastMsg
                ? `${automationLastMsg.user?.id === "admin" ? "You" : (automationLastMsg.user?.name || chat.userName || "Client")}: ${automationLastMsg.text}`
                : isAutomationLocked
                  ? "Upgrade to unlock automation chat & sync task updates directly."
                  : "No messages yet";
            const automationTime = automationLastMsg
              ? formatChatTimestamp(automationLastMsg.created_at)
              : "";
            const automationUnread =
              isGroupActive && activeDomain === "automation"
                ? 0
                : automationChan?.countUnread?.() || 0;

            const isGroupTyping =
              isWebsiteTyping || isMarketingTyping || isAutomationTyping;
            const totalUnread =
              websiteUnread + marketingUnread + automationUnread;

            // Resolve last message details
            let displayLastMsg = isGroupTyping
              ? "typing..."
              : "No messages yet";
            let lastMsgTime = "";

            const activeChans = Object.values(chat.channels);
            if (activeChans.length > 0 && !isGroupTyping) {
              let latestMsgObj: any = null;
              activeChans.forEach((c: any) => {
                const messagesList = c.state?.messages || [];
                if (messagesList.length > 0) {
                  const lm = messagesList[messagesList.length - 1];
                  if (
                    !latestMsgObj ||
                    new Date(lm.created_at).getTime() >
                      new Date(latestMsgObj.created_at).getTime()
                  ) {
                    latestMsgObj = lm;
                  }
                }
              });
              if (latestMsgObj) {
                displayLastMsg = `${latestMsgObj.user?.id === "admin" ? "You" : (latestMsgObj.user?.name || chat.userName || "Client")}: ${latestMsgObj.text}`;
                lastMsgTime = formatChatTimestamp(latestMsgObj.created_at);
              }
            }

            const lastDom =
              (typeof window !== "undefined"
                ? localStorage.getItem(
                    `last_domain_${chat.userId}_${chat.businessId}`,
                  )
                : null) || "website";

            const displayDom = chat.latestDomain || lastDom || "website";

            return (
              <div
                key={groupKey}
                className="flex flex-col border-b border-mm-border/30 bg-white"
              >
                <div
                  onClick={() => handleSelectGroup(chat)}
                  className={`relative flex items-center gap-3 px-4 py-4 cursor-pointer transition-colors ${
                    isActive
                      ? "bg-[#F0F2F5]"
                      : "hover:bg-mm-subtle/50 active:bg-mm-subtle"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-mm-orange" />
                  )}

                  <div className="relative w-12 h-12 shrink-0">
                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-mm-border bg-white flex items-center justify-center">
                      {chat.businessImage &&
                      chat.businessImage !== "undefined" &&
                      chat.businessImage !== "null" ? (
                        <img
                          src={chat.businessImage}
                          alt={chat.businessName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-mm-orange text-white text-xs font-black">
                          {chat.businessName.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full overflow-hidden border-2 border-white bg-white flex items-center justify-center shadow-xs">
                      {chat.userImage &&
                      chat.userImage !== "undefined" &&
                      chat.userImage !== "null" ? (
                        <img
                          src={chat.userImage}
                          alt={chat.userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Avatar name={chat.userName} size={20} />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-xs text-mm-dark truncate">
                          {chat.businessName}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider shrink-0 ${
                            displayDom === "website"
                              ? "bg-blue-50 text-blue-600 border border-blue-100"
                              : displayDom === "marketing"
                                ? "bg-red-50 text-red-600 border border-red-100"
                                : "bg-purple-50 text-purple-600 border border-purple-100"
                          }`}
                        >
                          {displayDom === "website"
                            ? "Website"
                            : displayDom === "marketing"
                              ? "Marketing"
                              : "Automation"}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-mm-gray shrink-0">
                        {lastMsgTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-mm-orange truncate max-w-[70%]">
                        {chat.userName}
                      </span>
                      {totalUnread > 0 ? (
                        <span className="h-4.5 min-w-4.5 px-1 flex items-center justify-center bg-mm-green text-white text-[9px] font-black rounded-full shadow-xs animate-pulse">
                          {totalUnread}
                        </span>
                      ) : (
                        <span className="text-[9px] font-medium text-mm-gray truncate">
                          {chat.businessType}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-[11px] truncate mt-1 ${
                        isGroupTyping
                          ? "text-mm-green animate-pulse font-bold"
                          : totalUnread > 0
                            ? "font-bold text-mm-dark"
                            : "font-medium text-mm-gray"
                      }`}
                    >
                      {displayLastMsg}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownId(
                          activeDropdownId === groupKey ? null : groupKey,
                        );
                      }}
                      className="p-1 rounded-lg text-mm-gray hover:bg-black/5 hover:text-mm-dark transition-all cursor-pointer"
                    >
                      {activeDropdownId === groupKey ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveActionDropdownId(
                            activeActionDropdownId === groupKey
                              ? null
                              : groupKey,
                          );
                        }}
                        className="p-1 rounded-lg text-mm-gray hover:bg-black/5 hover:text-mm-dark transition-all cursor-pointer"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeActionDropdownId === groupKey && (
                        <div
                          ref={actionMenuRef}
                          style={{
                            background: "white",
                            border: "1px solid var(--color-mm-border)",
                            borderRadius: "10px",
                            boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                            minWidth: "120px",
                            position: "absolute",
                            right: 0,
                            top: "28px",
                            zIndex: 210,
                          }}
                          className="py-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              handleRemoveChat(chat.userId, chat.businessId);
                              setActiveActionDropdownId(null);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-1.5 cursor-pointer"
                          >
                            Remove Chat
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {activeDropdownId === groupKey && (
                  <div
                    ref={dropdownRef}
                    className="bg-[#F5F7FA] border-t border-mm-border/30 p-2.5 space-y-2.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-1 text-[9px] font-black text-mm-gray uppercase tracking-wider mb-1">
                      Select Channel
                    </div>

                    {/* Website & SEO */}
                    <div
                      onClick={() =>
                        handleSelectDomain(
                          chat.userId,
                          chat.businessId,
                          "website",
                        )
                      }
                      className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${
                        isActive && activeDomain === "website"
                          ? "bg-blue-50/40 border-blue-500 animate-pulse"
                          : "bg-white border-transparent hover:bg-[#F0F2F5]"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-[#eff6ff] text-[#2563eb]">
                        <Monitor size={18} />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-[11px] text-mm-dark truncate">
                            Website & SEO
                          </span>
                          <span className="text-[8px] font-bold text-mm-gray shrink-0">
                            {websiteTime}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={`text-[10px] truncate flex-1 ${
                              isWebsiteTyping
                                ? "text-mm-green animate-pulse font-bold"
                                : websiteUnread > 0
                                  ? "font-bold text-mm-dark"
                                  : "text-mm-gray font-medium"
                            }`}
                          >
                            {websiteText}
                          </p>
                          {websiteUnread > 0 && (
                            <span className="h-4.5 min-w-4.5 px-1 flex items-center justify-center bg-mm-green text-white text-[8px] font-black rounded-full shadow-xs animate-pulse shrink-0">
                              {websiteUnread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Marketing */}
                    <div
                      onClick={() =>
                        handleSelectDomain(
                          chat.userId,
                          chat.businessId,
                          "marketing",
                        )
                      }
                      className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${
                        isActive && activeDomain === "marketing"
                          ? "bg-red-50/40 border-red-500 animate-pulse"
                          : "bg-white border-transparent hover:bg-[#F0F2F5]"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-[#fff5f5] text-[#ef4444]">
                        <Megaphone size={18} />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-[11px] text-mm-dark truncate">
                            Marketing
                          </span>
                          <span className="text-[8px] font-bold text-mm-gray shrink-0">
                            {marketingTime}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={`text-[10px] truncate flex-1 ${
                              isMarketingTyping
                                ? "text-mm-green animate-pulse font-bold"
                                : marketingUnread > 0
                                  ? "font-bold text-mm-dark"
                                  : "text-mm-gray font-medium"
                            }`}
                          >
                            {marketingText}
                          </p>
                          {marketingUnread > 0 && (
                            <span className="h-4.5 min-w-4.5 px-1 flex items-center justify-center bg-mm-green text-white text-[8px] font-black rounded-full shadow-xs animate-pulse shrink-0">
                              {marketingUnread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Automation */}
                    <div
                      onClick={() =>
                        handleSelectDomain(
                          chat.userId,
                          chat.businessId,
                          "automation",
                        )
                      }
                      className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${
                        isActive && activeDomain === "automation"
                          ? "bg-purple-50/40 border-purple-500 animate-pulse"
                          : "bg-white border-transparent hover:bg-[#F0F2F5]"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-[#f5f3ff] text-[#7c3aed]">
                        <Zap size={18} />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-[11px] text-mm-dark truncate">
                            Automation
                          </span>
                          <span className="text-[8px] font-bold text-mm-gray shrink-0">
                            {automationTime}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={`text-[10px] truncate flex-1 ${
                              isAutomationTyping
                                ? "text-mm-green animate-pulse font-bold"
                                : automationUnread > 0 && !isAutomationLocked
                                  ? "font-bold text-mm-dark"
                                  : "text-mm-gray font-medium"
                            }`}
                          >
                            {isAutomationLocked && (
                              <Lock
                                size={10}
                                className="inline text-mm-gray mr-0.5 align-middle"
                              />
                            )}
                            {automationText}
                          </p>
                          {automationUnread > 0 && !isAutomationLocked && (
                            <span className="h-4.5 min-w-4.5 px-1 flex items-center justify-center bg-mm-green text-white text-[8px] font-black rounded-full shadow-xs animate-pulse shrink-0">
                              {automationUnread}
                            </span>
                          )}
                          {isAutomationLocked && (
                            <span className="px-1.5 py-0.5 bg-[#FF5924]/10 text-[#FF5924] text-[7px] font-black tracking-wider uppercase rounded-md shrink-0">
                              Locked
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <MessageSquare size={36} className="text-mm-gray/40 mb-2" />
            <p className="text-xs font-bold text-mm-gray">
              No recent chats found
            </p>
            <p className="text-[10px] text-mm-gray/60 mt-0.5">
              Select a business or project to start a new chat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface ChatAreaProps {
  activeChannel: any;
  messages: any[];
  inputText: string;
  setInputText: (text: string) => void;
  handleSendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleBackToSidebar: () => void;
  users: User[];
  businesses: Business[];
  activeUserId: string | undefined;
  activeBusinessId: string | undefined;
  activeDomain: string | undefined;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  isTyping: boolean;
}

function ChatArea({
  activeChannel,
  messages,
  inputText,
  setInputText,
  handleSendMessage,
  handleKeyPress,
  handleBackToSidebar,
  users,
  businesses,
  activeUserId,
  activeBusinessId,
  activeDomain,
  scrollRef,
  isTyping,
}: ChatAreaProps) {
  return (
    <div className="flex-1 flex-col h-full bg-[#F9FAFC] relative min-w-0 flex">
      {/* Header */}
      <div className="h-16 border-b border-mm-border/80 px-4 shrink-0 bg-[#F0F2F5] flex items-center justify-between select-none">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleBackToSidebar}
            className="md:hidden p-1 text-mm-gray hover:text-mm-dark cursor-pointer transition-colors mr-1 rounded-full hover:bg-black/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-xs text-mm-dark truncate">
                {businesses.find((b) => b.id === activeBusinessId)
                  ?.businessName || "Business"}
              </span>
              <span className="text-[10px] text-mm-gray font-semibold">|</span>
              <span className="text-[10px] text-mm-orange font-bold truncate">
                {users.find((u) => u.id === activeUserId)?.fullName || "Client"}
              </span>
            </div>
            {isTyping ? (
              <span className="text-[10px] font-bold text-mm-green flex items-center gap-1 mt-0.5 animate-pulse">
                typing...
              </span>
            ) : (
              <span className="text-[9px] font-bold text-mm-gray/80 capitalize flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-mm-green" />
                Domain: {activeDomain}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4.5 py-5 space-y-3.5 bg-white"
      >
        {messages.map((msg, index) => {
          const isMe = msg.user?.id === "admin";
          const senderName = isMe ? "Admin" : msg.user?.name || "Client";
          const isSystem = msg.user?.id === "system";

          if (isSystem) {
            return (
              <div
                key={msg.id || index}
                className="w-full flex justify-center py-2 select-none"
              >
                <span className="bg-[#F0F2F5] text-mm-gray px-3 py-1 rounded-full text-[9px] font-bold border border-mm-border/40 flex items-center gap-1">
                  <Sparkles size={10} className="text-mm-orange" />
                  {msg.text}
                </span>
              </div>
            );
          }

          const isClientRead = () => {
            if (!activeUserId || !activeChannel?.state?.read?.[activeUserId])
              return false;
            const lastReadTime = new Date(
              activeChannel.state.read[activeUserId].last_read,
            );
            const msgTime = new Date(msg.created_at);
            return msgTime <= lastReadTime;
          };

          return (
            <div
              key={msg.id || index}
              className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-2xs text-xs font-semibold relative ${
                  isMe
                    ? "bg-mm-orange text-white rounded-tr-none"
                    : "bg-[#F0F2F5] text-mm-dark rounded-tl-none border border-mm-border/30"
                }`}
              >
                {!isMe && (
                  <span className="block text-[8px] font-bold text-mm-orange mb-0.5">
                    {senderName}
                  </span>
                )}
                <p className="whitespace-pre-line leading-relaxed">
                  {msg.text}
                </p>
                <span
                  className={`block text-[8px] text-right mt-1.5 font-bold tracking-tight ${isMe ? "text-white/80" : "text-mm-gray/80"}`}
                >
                  {msg.created_at
                    ? new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                  {isMe && (
                    <span className="inline-flex ml-1.5 align-middle select-none">
                      {isClientRead() ? (
                        <CheckCheck className="h-3 w-3 text-sky-400" />
                      ) : (
                        <Check className="h-3 w-3 text-white/60" />
                      )}
                    </span>
                  )}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex w-full justify-start animate-in fade-in duration-200">
            <div className="bg-[#F0F2F5] text-mm-dark px-4 py-3 rounded-2xl rounded-tl-none border border-mm-border/30 flex items-center gap-1 shadow-2xs">
              <span
                className="w-1.5 h-1.5 bg-mm-gray/60 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1.5 h-1.5 bg-mm-gray/60 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-1.5 h-1.5 bg-mm-gray/60 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Input Message Area */}
      <div className="p-3 bg-[#F0F2F5] border-t border-mm-border/60 flex items-center gap-3 w-full shrink-0">
        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 bg-white border border-mm-border/45 rounded-2xl px-4 py-2.5 text-xs font-semibold placeholder-mm-gray/60 outline-hidden transition-all text-mm-dark focus:border-mm-orange/70"
        />

        <button
          onClick={handleSendMessage}
          disabled={!inputText.trim()}
          className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-all select-none ${
            inputText.trim()
              ? "bg-mm-orange text-white shadow-md active:scale-90 hover:opacity-95 cursor-pointer"
              : "bg-mm-border/40 text-mm-gray cursor-not-allowed"
          }`}
        >
          <SendHorizontal className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}

interface NoChatSelectedProps {
  activeGroupKey: string | null;
  handleBackToSidebar: () => void;
}

function NoChatSelected({
  activeGroupKey,
  handleBackToSidebar,
}: NoChatSelectedProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#F8F9FA] select-none h-full w-full">
      <div className="w-16 h-16 rounded-full bg-mm-orange/10 flex items-center justify-center text-mm-orange mb-4 shadow-xs animate-pulse">
        <MessageSquare className="h-8 w-8" />
      </div>
      <h2 className="text-sm font-bold text-mm-dark">Select a Channel</h2>
      <p className="text-xs text-mm-gray mt-1 max-w-[340px] font-medium leading-relaxed">
        {activeGroupKey
          ? "Select one of the three service channels (Website, Marketing, or Automation) from the sidebar's actions dropdown to start messaging this business."
          : "Select a client conversation from the sidebar list or click the Chat actions icon in the projects list to start messaging."}
      </p>
    </div>
  );
}

// ============================================================================
// MAIN ADMIN CHAT ROUTE COMPONENT
// ============================================================================

function ChatRouteComponent() {
  const { users, businesses } = Route.useLoaderData();
  const {
    user: activeUserId,
    business: activeBusinessId,
    domain: activeDomain,
  } = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeUserId && activeBusinessId && activeDomain) {
      localStorage.setItem(
        `last_domain_${activeUserId}_${activeBusinessId}`,
        activeDomain,
      );
    }
  }, [activeUserId, activeBusinessId, activeDomain]);

  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingStates, setTypingStates] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [activeActionDropdownId, setActiveActionDropdownId] = useState<
    string | null
  >(null);
  const [hiddenChats, setHiddenChats] = useState<string[]>(() => {
    try {
      if (typeof window !== "undefined") {
        return JSON.parse(localStorage.getItem("hidden_chat_keys") || "[]");
      }
      return [];
    } catch {
      return [];
    }
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setActiveDropdownId(null);
      }
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(e.target as Node)
      ) {
        setActiveActionDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Stream credentials and initialize connection
  useEffect(() => {
    let clientInstance: StreamChat | null = null;
    let isSubscribed = true;

    async function initStream() {
      try {
        const { apiKey, token } = await getStreamCredentialsFn();
        if (!isSubscribed) return;

        clientInstance = StreamChat.getInstance(apiKey);

        await clientInstance.connectUser(
          { id: "admin", name: "Admin Manager" },
          token,
        );

        if (isSubscribed) {
          setChatClient(clientInstance);
        }
      } catch (err) {
        console.error("Failed to initialize Stream Chat client:", err);
      }
    }

    initStream();

    return () => {
      isSubscribed = false;
      if (clientInstance) {
        clientInstance.disconnectUser();
      }
    };
  }, []);

  // Fetch / sync recent channels from Stream
  const refreshChannels = async () => {
    if (!chatClient) return;
    try {
      const filter = { type: "messaging", members: { $in: ["admin"] } };
      const sort = [{ last_message_at: -1 }];
      const queryList = await chatClient.queryChannels(filter, sort, {
        watch: true,
        state: true,
      });
      setChannels(queryList);
    } catch (e) {
      console.error("Failed to query Stream channels:", e);
    }
  };

  useEffect(() => {
    if (!chatClient) return;

    refreshChannels();

    const handleGlobalEvent = (event: any) => {
      if (
        event.type === "message.new" ||
        event.type === "message.read" ||
        event.type === "notification.message_new"
      ) {
        refreshChannels();
      }

      const channelId =
        event.channel_id ||
        event.channel?.id ||
        (event.cid ? event.cid.split(":")[1] : "");
      if (channelId) {
        if (event.type === "typing.start") {
          if (event.user?.id !== "admin") {
            setTypingStates((prev) => ({ ...prev, [channelId]: true }));
          }
        } else if (event.type === "typing.stop") {
          if (event.user?.id !== "admin") {
            setTypingStates((prev) => ({ ...prev, [channelId]: false }));
          }
        }
      }
    };

    chatClient.on(handleGlobalEvent);
    return () => {
      chatClient.off(handleGlobalEvent);
    };
  }, [chatClient]);

  // Handle URL changes to load/create active channel
  useEffect(() => {
    if (!chatClient || !activeUserId || !activeBusinessId) {
      setActiveChannel(null);
      setMessages([]);
      return;
    }

    // Resolve user and business details
    const userObj = users.find((u) => u.id === activeUserId);
    const businessObj = businesses.find((b) => b.id === activeBusinessId);
    const uName = userObj?.fullName || "Client User";
    const bName = businessObj?.businessName || "Business";

    // Setup channel ID safe format
    const targetDomain = activeDomain || "website";
    const cleanId = getStreamChannelId(
      activeUserId,
      activeBusinessId,
      targetDomain,
    );

    const channel = chatClient.channel("messaging", cleanId, {
      members: ["admin", activeUserId],
      user_id: activeUserId,
      business_id: activeBusinessId,
      domain: targetDomain,
      userName: uName,
      businessName: bName,
    } as any);

    let unsubscribe: any = null;

    async function watchChannel() {
      try {
        const state = await channel.watch();
        setActiveChannel(channel);
        setMessages(state.messages || []);

        // Mark read immediately
        await channel.markRead();

        // Refresh sidebar channel list
        await refreshChannels();

        // Listen for new messages
        const listener = channel.on("message.new", (event: any) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === event.message.id)) return prev;
            return [...prev, event.message];
          });
          if (activeUserId && activeBusinessId) {
            handleRestoreChat(activeUserId, activeBusinessId);
          }
          // Mark read on incoming message
          channel.markRead().catch(console.error);
        });

        // Listen for read receipts
        const readListener = channel.on("message.read", () => {
          setMessages((prev) => [...prev]);
        });

        // Listen for typing events
        const typingStartListener = channel.on("typing.start", (event: any) => {
          if (event.user?.id !== "admin") {
            setIsTyping(true);
          }
        });

        const typingStopListener = channel.on("typing.stop", (event: any) => {
          if (event.user?.id !== "admin") {
            setIsTyping(false);
          }
        });

        unsubscribe = () => {
          listener.unsubscribe();
          readListener.unsubscribe();
          typingStartListener.unsubscribe();
          typingStopListener.unsubscribe();
        };
      } catch (err) {
        console.error("Error watching channel:", err);
      }
    }

    watchChannel();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [chatClient, activeUserId, activeBusinessId, activeDomain]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Send Message
  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeChannel) return;

    const textToSend = inputText.trim();
    setInputText("");

    if (activeUserId && activeBusinessId) {
      handleRestoreChat(activeUserId, activeBusinessId);
    }

    try {
      await activeChannel.sendMessage({ text: textToSend });
      // Update sidebar channels sorting/latest message preview
      refreshChannels();
    } catch (err) {
      console.error("Failed to send message via Stream:", err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Group channels by user_id -> business_id for the sidebar
  const groupedChats = useMemo(() => {
    const map = new Map<
      string,
      {
        userId: string;
        businessId: string;
        userName: string;
        userEmail: string;
        userImage: string;
        businessName: string;
        businessType: string;
        businessImage: string;
        createdAt: string;
        latestTimestamp: string;
        latestDomain: string;
        channels: Record<string, any>;
      }
    >();

    // Incorporate current active URL chat in case it's not yet in Stream channels list
    const allChannels = [...channels];
    if (activeUserId && activeBusinessId && activeDomain) {
      const activeCleanId = getStreamChannelId(
        activeUserId,
        activeBusinessId,
        activeDomain,
      );
      if (!allChannels.some((c) => c.id === activeCleanId)) {
        // Resolve info
        const u = users.find((x) => x.id === activeUserId);
        const b = businesses.find((x) => x.id === activeBusinessId);
        allChannels.push({
          id: activeCleanId,
          data: {
            user_id: activeUserId,
            business_id: activeBusinessId,
            domain: activeDomain,
            userName: u?.fullName || "Client User",
            businessName: b?.businessName || "Business",
          },
          state: { messages: [] },
        });
      }
    }

    allChannels.forEach((c) => {
      const uId = c.data?.user_id;
      const bId = c.data?.business_id;
      const dom = c.data?.domain;

      if (!uId || !bId) return;

      const groupKey = `${uId}_${bId}`;
      const userObj = users.find((u) => u.id === uId);
      const businessObj = businesses.find((b) => b.id === bId);

      const uName = c.data?.userName || userObj?.fullName || "Client User";
      const bName =
        c.data?.businessName || businessObj?.businessName || "Business";
      const uEmail = userObj?.email || "";
      const uImage = userObj?.image || "";
      const bType = businessObj?.businessType || "";
      const bImage = businessObj?.image || "";

      const bCreatedAt = businessObj?.createdAt
        ? new Date(businessObj.createdAt).toISOString()
        : new Date(0).toISOString();
      const lastMsgTime =
        c.state?.messages?.[c.state.messages.length - 1]?.created_at ||
        c.last_message_at ||
        new Date(0).toISOString();

      if (!map.has(groupKey)) {
        map.set(groupKey, {
          userId: uId,
          businessId: bId,
          userName: uName,
          userEmail: uEmail,
          userImage: uImage,
          businessName: bName,
          businessType: bType,
          businessImage: bImage,
          createdAt: bCreatedAt,
          latestTimestamp: lastMsgTime,
          latestDomain: lastMsgTime !== new Date(0).toISOString() ? dom : "",
          channels: {},
        });
      }

      const existing = map.get(groupKey)!;
      existing.channels[dom] = c;

      // Update latest timestamp & latest domain
      if (
        new Date(lastMsgTime).getTime() >
        new Date(existing.latestTimestamp).getTime()
      ) {
        existing.latestTimestamp = lastMsgTime;
        existing.latestDomain = lastMsgTime !== new Date(0).toISOString() ? dom : "";
      }
    });

    const list = Array.from(map.values());

    // Only show chats in the sidebar that have messages or are currently active
    const filteredList = list.filter((chat) => {
      const key = `${chat.userId}_${chat.businessId}`;
      if (
        hiddenChats.includes(key) &&
        !(activeUserId === chat.userId && activeBusinessId === chat.businessId)
      ) {
        return false;
      }
      const hasMessages = Object.values(chat.channels).some(
        (c: any) => c.state?.messages?.length > 0,
      );
      const isActiveGroup =
        activeUserId === chat.userId && activeBusinessId === chat.businessId;
      return hasMessages || isActiveGroup;
    });

    // Sort by latest message timestamp, falling back to creation date
    const getSortTime = (chat: any) => {
      let maxMsgTime = 0;
      Object.values(chat.channels).forEach((c: any) => {
        if (c.last_message_at) {
          const t = new Date(c.last_message_at).getTime();
          if (!isNaN(t) && t > maxMsgTime) maxMsgTime = t;
        } else {
          const messagesList = c.state?.messages || [];
          if (messagesList.length > 0) {
            const t = new Date(
              messagesList[messagesList.length - 1].created_at,
            ).getTime();
            if (!isNaN(t) && t > maxMsgTime) maxMsgTime = t;
          }
        }
      });
      if (maxMsgTime > 0) return maxMsgTime;
      return chat.createdAt ? new Date(chat.createdAt).getTime() : 0;
    };

    filteredList.sort((a, b) => getSortTime(b) - getSortTime(a));

    // Apply Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return filteredList.filter(
        (chat) =>
          chat.userName.toLowerCase().includes(query) ||
          chat.businessName.toLowerCase().includes(query) ||
          chat.userEmail.toLowerCase().includes(query),
      );
    }

    return filteredList;
  }, [
    channels,
    users,
    businesses,
    searchQuery,
    activeUserId,
    activeBusinessId,
    activeDomain,
    hiddenChats,
    typingStates,
  ]);

  // Navigation handlers
  const handleSelectDomain = (
    userId: string,
    businessId: string,
    domain: string,
  ) => {
    setActiveDropdownId(null);
    navigate({
      to: "/admin/chat",
      search: { user: userId, business: businessId, domain },
    });
  };

  const handleSelectGroup = (chat: any) => {
    const biz = businesses.find((b) => b.id === chat.businessId);
    const isAutomationLocked = biz?.plan !== "Pro";

    const websiteUnread = chat.channels.website?.unreadCount || 0;
    const marketingUnread = chat.channels.marketing?.unreadCount || 0;
    const automationUnread = isAutomationLocked
      ? 0
      : chat.channels.automation?.unreadCount || 0;

    const unreadDomains: string[] = [];
    if (websiteUnread > 0) unreadDomains.push("website");
    if (marketingUnread > 0) unreadDomains.push("marketing");
    if (automationUnread > 0) unreadDomains.push("automation");

    const groupKey = `${chat.userId}_${chat.businessId}`;

    if (unreadDomains.length > 1) {
      // Toggle dropdown panel to choose domain
      setActiveDropdownId(activeDropdownId === groupKey ? null : groupKey);
    } else if (unreadDomains.length === 1) {
      // Navigate directly to the single unread domain
      handleSelectDomain(chat.userId, chat.businessId, unreadDomains[0]);
    } else {
      // Fallback: navigate to the domain that has the latest message, or the last active domain, or website
      const fallbackDom =
        chat.latestDomain ||
        localStorage.getItem(`last_domain_${chat.userId}_${chat.businessId}`) ||
        "website";
      handleSelectDomain(chat.userId, chat.businessId, fallbackDom);
    }
  };

  const handleRemoveChat = (userId: string, businessId: string) => {
    const key = `${userId}_${businessId}`;
    setHiddenChats((prev) => {
      const next = prev.includes(key) ? prev : [...prev, key];
      localStorage.setItem("hidden_chat_keys", JSON.stringify(next));
      return next;
    });
    if (activeUserId === userId && activeBusinessId === businessId) {
      handleBackToSidebar();
    }
  };

  const handleRestoreChat = (userId: string, businessId: string) => {
    const key = `${userId}_${businessId}`;
    setHiddenChats((prev) => {
      if (!prev.includes(key)) return prev;
      const next = prev.filter((k) => k !== key);
      localStorage.setItem("hidden_chat_keys", JSON.stringify(next));
      return next;
    });
  };

  const handleBackToSidebar = () => {
    navigate({
      to: "/admin/chat",
      search: {},
    });
  };

  const activeGroupKey =
    activeUserId && activeBusinessId
      ? `${activeUserId}_${activeBusinessId}`
      : null;

  return (
    <div className="flex h-full overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <ChatSidebar
        groupedChats={groupedChats}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeGroupKey={activeGroupKey}
        activeDropdownId={activeDropdownId}
        setActiveDropdownId={setActiveDropdownId}
        activeActionDropdownId={activeActionDropdownId}
        setActiveActionDropdownId={setActiveActionDropdownId}
        activeUserId={activeUserId}
        activeDomain={activeDomain}
        handleSelectGroup={handleSelectGroup}
        handleSelectDomain={handleSelectDomain}
        handleRemoveChat={handleRemoveChat}
        dropdownRef={dropdownRef}
        actionMenuRef={actionMenuRef}
        activeBusinessId={activeBusinessId}
        typingStates={typingStates}
      />

      {activeChannel ? (
        <ChatArea
          activeChannel={activeChannel}
          messages={messages}
          inputText={inputText}
          setInputText={(val) => {
            setInputText(val);
            if (activeChannel) {
              if (val.trim()) {
                activeChannel.keystroke().catch(console.error);
              } else {
                activeChannel.stopTyping().catch(console.error);
              }
            }
          }}
          handleSendMessage={handleSendMessage}
          handleKeyPress={handleKeyPress}
          handleBackToSidebar={handleBackToSidebar}
          users={users}
          businesses={businesses}
          activeUserId={activeUserId}
          activeBusinessId={activeBusinessId}
          activeDomain={activeDomain}
          scrollRef={scrollRef}
          isTyping={isTyping}
        />
      ) : (
        <NoChatSelected
          activeGroupKey={activeGroupKey}
          handleBackToSidebar={handleBackToSidebar}
        />
      )}
    </div>
  );
}
