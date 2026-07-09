import React, { useState, useRef, useEffect } from "react";
import { createFileRoute, useNavigate, useParams, redirect } from "@tanstack/react-router";
import ProjectLogo, { ProjectCategory } from "../../../components/client/ProjectLogo";
import { SendHorizontal, ArrowLeft, MoreVertical, Lock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_client/chat/$domain")({
  beforeLoad: ({ params }) => {
    const validDomains = ["website", "marketing", "automation"];
    if (!validDomains.includes(params.domain)) {
      throw redirect({
        to: "/chat",
      });
    }
  },
  component: RouteComponent,
});

interface ChatMessage {
  id: number;
  sender: "client" | "provider";
  text: string;
  timestamp: string;
}

interface ChatChannelConfig {
  name: string;
  category: ProjectCategory;
  initialMessages: ChatMessage[];
  queries: string[];
}

const CHANNELS_CONFIG: Record<string, ChatChannelConfig> = {
  website: {
    name: "Website & SEO",
    category: "seo",
    queries: [
      "Request SEO audit report",
      "Schedule performance call",
      "Review targeting keywords",
      "Request page speed updates",
    ],
    initialMessages: [
      {
        id: 1,
        sender: "provider",
        text: "Hi Raj! I'm Sarah, your dedicated Website & SEO account manager. How can I help you today?",
        timestamp: "10:00 AM",
      },
      {
        id: 2,
        sender: "client",
        text: "Hi Sarah, I wanted to check the status of our Website Redesign. Are we on track for the June 15 deadline?",
        timestamp: "10:02 AM",
      },
      {
        id: 3,
        sender: "provider",
        text: "Yes, we are! The design phase is 70% complete. We will upload the preview link by tomorrow.",
        timestamp: "10:05 AM",
      },
    ],
  },
  marketing: {
    name: "Marketing",
    category: "marketing",
    queries: [
      "View media budget plan",
      "Approve ad copy drafts",
      "Add new social platform",
      "Request analytics summary",
    ],
    initialMessages: [
      {
        id: 1,
        sender: "provider",
        text: "Hello Raj! I've uploaded the draft ad creatives for the upcoming Google Ads search campaign.",
        timestamp: "Yesterday, 3:12 PM",
      },
      {
        id: 2,
        sender: "client",
        text: "Awesome, let me review it. Can we try to allocate more budget to search ads next week?",
        timestamp: "Yesterday, 3:15 PM",
      },
      {
        id: 3,
        sender: "provider",
        text: "Absolutely! I will update the media allocation draft and send it over for your approval shortly.",
        timestamp: "Yesterday, 3:18 PM",
      },
    ],
  },
  automation: {
    name: "Automation",
    category: "automation",
    queries: [],
    initialMessages: [],
  },
};

const THEME_CONFIG = {
  website: {
    clientBubble: "bg-blue-600 text-white rounded-tr-none",
    inputFocus: "focus:border-blue-500/70",
    sendButton: "bg-blue-600 hover:bg-blue-700",
    onlineStatus: "text-blue-600",
  },
  marketing: {
    clientBubble: "bg-red-500 text-white rounded-tr-none",
    inputFocus: "focus:border-red-500/70",
    sendButton: "bg-red-500 hover:bg-red-600",
    onlineStatus: "text-red-500",
  },
  automation: {
    clientBubble: "bg-purple-600 text-white rounded-tr-none",
    inputFocus: "focus:border-purple-500/70",
    sendButton: "bg-purple-600 hover:bg-purple-700",
    onlineStatus: "text-purple-600",
  },
};

// 1. Header Component
interface ChatHeaderProps {
  name: string;
  category: ProjectCategory;
  onlineStatusClass: string;
  onBack: () => void;
}

function ChatHeader({ name, category, onlineStatusClass, onBack }: ChatHeaderProps) {
  return (
    <div className="h-16 border-b border-mm-border/80 px-4 shrink-0 bg-[#F0F2F5] flex items-center justify-between select-none w-full">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="md:hidden p-1 text-mm-gray hover:text-mm-dark cursor-pointer transition-colors mr-1 rounded-full hover:bg-black/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <ProjectLogo
          category={category}
          size="sm"
          className="w-10 h-10 rounded-2xl border border-mm-border/40 bg-white"
        />

        <div className="flex flex-col">
          <span className="font-black text-sm text-mm-dark leading-tight">{name}</span>
          <span className={`text-[10px] font-bold ${onlineStatusClass}`}>Online</span>
        </div>
      </div>
    </div>
  );
}

// 2. Messages List Component
interface ChatMessagesListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  clientBubbleClass: string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

function ChatMessagesList({ messages, isTyping, clientBubbleClass, scrollRef }: ChatMessagesListProps) {
  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4.5 py-5 space-y-4 bg-white w-full"
    >
      {messages.map((msg) => {
        const isMe = msg.sender === "client";
        return (
          <div
            key={msg.id}
            className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-xs text-xs font-semibold relative ${
                isMe
                  ? clientBubbleClass
                  : "bg-[#F0F2F5] text-mm-dark rounded-tl-none border border-mm-border/30"
              }`}
            >
              <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
              <span className={`block text-[9px] text-right mt-1.5 font-bold tracking-tight ${isMe ? "text-white/80" : "text-mm-gray/80"}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        );
      })}

      {isTyping && (
        <div className="flex w-full justify-start">
          <div className="bg-[#F0F2F5] text-mm-dark px-4 py-3 rounded-2xl rounded-tl-none border border-mm-border/30 flex items-center gap-1 shadow-xs">
            <span className="w-1.5 h-1.5 bg-mm-gray/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-mm-gray/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-mm-gray/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}
    </div>
  );
}

// 3. Input Message Panel Component
interface ChatInputProps {
  inputText: string;
  setInputText: (val: string) => void;
  onSend: (text: string) => void;
  queries: string[];
  inputFocusClass: string;
  sendButtonClass: string;
}

function ChatInput({
  inputText,
  setInputText,
  onSend,
  queries,
  inputFocusClass,
  sendButtonClass,
}: ChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (inputText.trim()) {
        onSend(inputText);
      }
    }
  };

  return (
    <div className="w-full shrink-0 flex flex-col">
      {/* Quick action query chips */}
      {queries.length > 0 && (
        <div className="px-4 py-2 bg-[#F0F2F5]/40 border-t border-mm-border/40 overflow-x-auto select-none w-full scrollbar-none">
          <div className="flex gap-2 w-max py-0.5">
            {queries.map((query, idx) => (
              <button
                key={idx}
                onClick={() => onSend(query)}
                className={`px-3.5 py-1.5 bg-white border border-mm-border/70 text-mm-dark text-[11px] font-black rounded-full transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-2xs hover:text-white hover:border-transparent hover:${sendButtonClass}`}
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Message Panel */}
      <div className="p-3 bg-[#F0F2F5] border-t border-mm-border/60 flex items-center gap-3 w-full">
        <input
          type="text"
          placeholder="Type a message"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          className={`flex-1 bg-white border border-mm-border/45 rounded-2xl px-4 py-2.5 text-xs font-semibold placeholder-mm-gray/60 outline-hidden transition-all text-mm-dark ${inputFocusClass}`}
        />

        <button
          onClick={() => {
            if (inputText.trim()) {
              onSend(inputText);
            }
          }}
          disabled={!inputText.trim()}
          className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-all select-none ${
            inputText.trim()
              ? `${sendButtonClass} text-white shadow-md active:scale-90 hover:opacity-95 cursor-pointer`
              : "bg-mm-border/40 text-mm-gray cursor-not-allowed"
          }`}
        >
          <SendHorizontal className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}

function RouteComponent() {
  const { domain } = useParams({ from: "/_client/chat/$domain" });
  const navigate = useNavigate();

  const activeChatKey = domain; // "website", "marketing", "automation"
  const config = CHANNELS_CONFIG[activeChatKey] || CHANNELS_CONFIG.website;
  const theme = THEME_CONFIG[activeChatKey as keyof typeof THEME_CONFIG] || THEME_CONFIG.website;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Maintain separate message histories for each chat channel
  const [channelsHistory, setChannelsHistory] = useState<Record<string, ChatMessage[]>>({
    website: CHANNELS_CONFIG.website.initialMessages,
    marketing: CHANNELS_CONFIG.marketing.initialMessages,
    automation: [],
  });

  // Whenever the active chat channel changes, swap message history
  useEffect(() => {
    if (activeChatKey && channelsHistory[activeChatKey]) {
      setMessages(channelsHistory[activeChatKey]);
    } else {
      setMessages([]);
    }
    setInputText("");
    setIsTyping(false);
  }, [activeChatKey]);

  // Sync messages state updates back to channelsHistory
  useEffect(() => {
    if (activeChatKey) {
      setChannelsHistory((prev) => ({
        ...prev,
        [activeChatKey]: messages,
      }));
    }
  }, [messages, activeChatKey]);

  // Auto-scroll to bottom of messages container
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim() || !activeChatKey) return;

    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newClientMsg: ChatMessage = {
      id: Date.now(),
      sender: "client",
      text: textToSend,
      timestamp: currentTime,
    };

    setMessages((prev) => [...prev, newClientMsg]);
    setInputText("");

    // Simulate agent typing indicator and auto-reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const autoReplyMsg: ChatMessage = {
        id: Date.now() + 1,
        sender: "provider",
        text: `Got it! A specialist from our ${config.name} team will review your message and reply shortly.`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, autoReplyMsg]);
    }, 1200);
  };

  const handleBackToSidebar = () => {
    navigate({
      to: "/chat",
    });
  };

  if (activeChatKey === "automation") {
    return (
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-6 bg-[#F8F9FA] overflow-y-auto">
        <div className="md:hidden w-full flex items-center justify-start py-2 shrink-0 self-start mb-4">
          <button
            onClick={handleBackToSidebar}
            className="flex items-center gap-1 text-sm font-extrabold text-mm-gray hover:text-mm-dark cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Chats</span>
          </button>
        </div>

        <div className="max-w-md w-full bg-white border border-mm-border rounded-3xl p-6.5 text-center shadow-xl space-y-5 animate-in zoom-in-95 duration-300">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mx-auto">
            <Lock className="h-6 w-6" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-black text-mm-dark">Automation Channel Locked</h3>
            <p className="text-xs leading-relaxed text-mm-gray">
              Direct developer chats for Workflow Automations and Zapier integrations are exclusive to our **Premium** plans.
            </p>
          </div>

          <div className="bg-purple-50/50 rounded-2xl p-4 text-left border border-purple-100/30">
            <span className="text-[10px] uppercase font-black tracking-wider text-purple-600 block mb-1">Premium Benefits:</span>
            <ul className="text-xs text-mm-gray font-bold space-y-1.5">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Dedicated Automation Engineer
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Slack / WhatsApp Direct Support
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Unlimited custom script updates
              </li>
            </ul>
          </div>

          <button className="w-full py-3.5 bg-mm-orange hover:bg-mm-orange/95 text-white text-xs font-black rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5">
            <span>Upgrade to Premium</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-white overflow-hidden relative">
      {/* 1. Header Component (Pinned/Sticky at top) */}
      <ChatHeader
        name={config.name}
        category={config.category}
        onlineStatusClass={theme.onlineStatus}
        onBack={handleBackToSidebar}
      />

      {/* 2. Messages List Component (Scrollable middle container) */}
      <ChatMessagesList
        messages={messages}
        isTyping={isTyping}
        clientBubbleClass={theme.clientBubble}
        scrollRef={scrollRef}
      />

      {/* 3. Input Message Panel Component (Pinned/Sticky at bottom) */}
      <ChatInput
        inputText={inputText}
        setInputText={setInputText}
        onSend={handleSendMessage}
        queries={config.queries}
        inputFocusClass={theme.inputFocus}
        sendButtonClass={theme.sendButton}
      />
    </div>
  );
}
