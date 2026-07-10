import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Lock, MessageSquare, MoreVertical } from "lucide-react";
import ProjectLogo, { ProjectCategory } from "./ProjectLogo";
import { StreamChat } from "stream-chat";
import { useBusiness } from "@/hooks/use-business";
import { getStreamChannelId } from "@/lib/utils";

interface ChatItem {
  id: string;
  name: string;
  category: ProjectCategory;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  locked?: boolean;
}

const DEFAULT_CHATS: Omit<ChatItem, "lastMessage" | "timestamp" | "unreadCount">[] = [
  {
    id: "website",
    name: "Website & SEO",
    category: "seo",
  },
  {
    id: "marketing",
    name: "Marketing",
    category: "marketing",
  },
  {
    id: "automation",
    name: "Automation",
    category: "automation",
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
  chatClient: StreamChat | null;
  loading: boolean;
}

export default function ChatNav({ activeChatId, onSelectChat, chatClient, loading }: ChatNavProps) {
  const { activeBusiness } = useBusiness();
  const [searchQuery, setSearchQuery] = useState("");
  const [channelData, setChannelData] = useState<Record<string, { lastMessage: string; timestamp: string; unreadCount: number; lastMessageAt: number }>>({});
  const [typingStates, setTypingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const currentClient = chatClient;
    const currentBusiness = activeBusiness;
    if (!currentClient || !currentBusiness) return;

    const userId = currentClient.userID;
    if (!userId) return;

    const domains = ["website", "marketing", "automation"];

    async function queryChannels() {
      if (!currentClient || !currentBusiness) return;
      const userId = currentClient.userID;
      if (!userId) return;

      const channelIds = domains.map(dom => getStreamChannelId(userId, currentBusiness.id, dom));
      
      try {
        const queriedChannels = await currentClient.queryChannels(
          { id: { $in: channelIds } },
          {},
          { watch: true, state: true }
        );

        const updatedData: Record<string, { lastMessage: string; timestamp: string; unreadCount: number; lastMessageAt: number }> = {};
        
        // Initialize defaults
        domains.forEach(dom => {
          const isAutomationLocked = dom === "automation" && currentBusiness.plan !== "Pro";
          updatedData[dom] = {
            lastMessage: isAutomationLocked
              ? "Upgrade to unlock automation chat & sync task updates directly."
              : "No messages yet",
            timestamp: "",
            unreadCount: 0,
            lastMessageAt: 0,
          };
        });

        queriedChannels.forEach((channel) => {
          const dom = domains.find(d => channel.id === getStreamChannelId(userId, currentBusiness.id, d));
          if (!dom) return;

          const state = channel.state;
          const messages = state.messages || [];
          const lastMsgObj = messages[messages.length - 1];
          const unreadCount = channel.countUnread();
          
          const isAutomationLocked = dom === "automation" && currentBusiness.plan !== "Pro";

          let lastMessage = isAutomationLocked
            ? "Upgrade to unlock automation chat & sync task updates directly."
            : "No messages yet";
          let timestamp = "";
          let lastMessageAt = 0;
          
          if (lastMsgObj) {
            const senderName = lastMsgObj.user?.id === userId ? "You" : (lastMsgObj.user?.name || "Admin");
            lastMessage = `${senderName}: ${lastMsgObj.text}`;
            if (lastMsgObj.created_at) {
              const dateObj = new Date(lastMsgObj.created_at);
              lastMessageAt = dateObj.getTime();
              timestamp = dateObj.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
            }
          }
          
          updatedData[dom] = {
            lastMessage,
            timestamp,
            unreadCount,
            lastMessageAt,
          };
        });

        setChannelData(updatedData);
      } catch (err) {
        console.error("Error querying channels:", err);
      }
    }

    queryChannels();

    // Listen for new messages / read receipts globally to update active lists in real-time
    const handleEvent = (event: any) => {
      if (
        event.type === "message.new" || 
        event.type === "message.read" || 
        event.type === "notification.message_new" ||
        event.type === "notification.mark_read" ||
        event.type === "typing.start" ||
        event.type === "typing.stop"
      ) {
        queryChannels();
      }

      const channelId = event.channel_id || event.channel?.id || (event.cid ? event.cid.split(':')[1] : '');
      if (channelId) {
        if (event.type === "typing.start") {
          if (event.user?.id !== userId) {
            setTypingStates((prev) => ({ ...prev, [channelId]: true }));
          }
        } else if (event.type === "typing.stop") {
          if (event.user?.id !== userId) {
            setTypingStates((prev) => ({ ...prev, [channelId]: false }));
          }
        }
      }
    };

    currentClient.on(handleEvent);

    return () => {
      currentClient.off(handleEvent);
    };
  }, [chatClient, activeBusiness?.id, activeBusiness?.plan, activeChatId]);

  // Construct chats array using computed/real stream state
  const chats = DEFAULT_CHATS.map((c) => {
    const isAutomationLocked = c.id === "automation" &&
      activeBusiness?.plan !== "Pro";
      
    const streamInfo = channelData[c.id] || {
      lastMessage: isAutomationLocked
        ? "Upgrade to unlock automation chat & sync task updates directly."
        : "Loading...",
      timestamp: "",
      unreadCount: 0,
      lastMessageAt: 0,
    };

    const userId = chatClient?.userID || "";
    const businessId = activeBusiness?.id || "";
    const cleanId = userId && businessId ? getStreamChannelId(userId, businessId, c.id) : "";
    const isTyping = !!(cleanId && typingStates[cleanId]);

    return {
      ...c,
      lastMessage: isTyping ? "typing..." : streamInfo.lastMessage,
      timestamp: streamInfo.timestamp,
      unreadCount: activeChatId === c.id ? 0 : streamInfo.unreadCount,
      locked: isAutomationLocked,
      lastMessageAt: streamInfo.lastMessageAt,
      typing: isTyping,
    };
  });

  // Sort chats by latest message timestamp, pushing active chats to the top
  const sortedChats = [...chats].sort((a, b) => {
    return (b.lastMessageAt || 0) - (a.lastMessageAt || 0);
  });

  const filteredChats = sortedChats.filter(
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
                {isActive && (
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${THEME_SELECT_BAR[chat.category] || "bg-mm-orange"}`} />
                )}

                <ProjectLogo
                  category={chat.category}
                  size="sm"
                  className="w-11 h-11 shrink-0 rounded-2xl"
                />

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
                    <p className={`text-xs truncate flex-1 ${
                      chat.typing 
                        ? "text-mm-green animate-pulse font-bold" 
                        : chat.unreadCount > 0 
                          ? "font-bold text-mm-dark" 
                          : "text-mm-gray font-medium"
                    }`}>
                      {chat.locked && (
                        <Lock className="h-3 w-3 inline text-mm-gray mr-1 shrink-0" />
                      )}
                      {chat.lastMessage}
                    </p>

                    {chat.unreadCount > 0 && !chat.locked && (
                      <span className="h-4.5 min-w-4.5 px-1 flex items-center justify-center bg-mm-green text-white text-[9px] font-black rounded-full shadow-xs animate-pulse shrink-0">
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
