import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Lock, MessageSquare, MoreVertical } from "lucide-react";
import ProjectLogo, { ProjectCategory } from "./ProjectLogo";

interface ChatItem {
  id: string;
  name: string;
  category: ProjectCategory;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  locked?: boolean;
}

const CHAT_DATA: ChatItem[] = [
  {
    id: "website",
    name: "Website & SEO",
    category: "seo",
    lastMessage: "Sarah: The design phase is 70% complete. We will upload the preview link by tomorrow.",
    timestamp: "10:05 AM",
    unreadCount: 1,
  },
  {
    id: "marketing",
    name: "Marketing",
    category: "marketing",
    lastMessage: "David: Let's schedule a call tomorrow to discuss the new Instagram campaign structure.",
    timestamp: "Yesterday",
    unreadCount: 0,
  },
  {
    id: "automation",
    name: "Automation",
    category: "automation",
    lastMessage: "Upgrade to unlock automation chat & sync task updates directly.",
    timestamp: "Jul 8",
    unreadCount: 0,
    locked: true,
  },
];

const THEME_SELECT_BAR: Record<string, string> = {
  website: "bg-blue-600",
  marketing: "bg-red-500",
  automation: "bg-purple-600",
};

interface ChatNavProps {
  activeChatId?: string;
  onSelectChat?: (id: string) => void;
}

export default function ChatNav({ activeChatId, onSelectChat }: ChatNavProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = CHAT_DATA.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col bg-white border-r border-mm-border font-sans select-none">
      <div className="p-2.5 shrink-0 bg-[#FCFDFE] border-b border-mm-border/50">
        <div className="relative flex items-center bg-[#F0F2F5] rounded-xl px-3 py-2 text-mm-gray focus-within:text-mm-dark transition-all">
          <Search className="h-4 w-4 shrink-0 mr-3 text-mm-gray/80" />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-xs font-medium placeholder-mm-gray/60 outline-hidden"
          />
        </div>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto divide-y divide-mm-border/30">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => {
            const isActive = activeChatId === chat.id;
            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat?.(chat.id)}
                className={`relative flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${
                  isActive
                    ? "bg-[#F0F2F5]"
                    : "hover:bg-mm-subtle/50 active:bg-mm-subtle"
                }`}
              >
                {/* Active selection bar indicator on left side */}
                {isActive && (
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${THEME_SELECT_BAR[chat.category] || "bg-mm-orange"}`} />
                )}

                {/* Left Side Category Icon */}
                <ProjectLogo
                  category={chat.category}
                  size="sm"
                  className="w-11 h-11 shrink-0 rounded-2xl"
                />

                {/* Chat Metadata & Last Message Preview */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-black text-sm text-mm-dark truncate">
                      {chat.name}
                    </span>
                    <span className="text-[10px] font-bold text-mm-gray shrink-0">
                      {chat.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate flex-1 ${chat.unreadCount > 0 ? "font-bold text-mm-dark" : "text-mm-gray"}`}>
                      {chat.locked && (
                        <Lock className="h-3 w-3 inline text-mm-gray mr-1 shrink-0" />
                      )}
                      {chat.lastMessage}
                    </p>

                    {/* Unread count badge / lock indicator */}
                    {chat.unreadCount > 0 && !chat.locked && (
                      <span className="h-4.5 min-w-4.5 px-1.5 flex items-center justify-center bg-mm-orange text-white text-[10px] font-black rounded-full shrink-0">
                        {chat.unreadCount}
                      </span>
                    )}

                    {chat.locked && (
                      <span className="px-1.5 py-0.5 bg-[#FF5924]/10 text-[#FF5924] text-[8px] font-black tracking-wider uppercase rounded-md shrink-0">
                        Locked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <p className="text-sm font-bold text-mm-gray">No chats found</p>
            <p className="text-xs text-mm-gray/60 mt-1">Try refining your search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
