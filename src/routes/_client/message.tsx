import React, { useState, useRef, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SendHorizontal, Check } from "lucide-react";

export const Route = createFileRoute("/_client/message")({
  component: RouteComponent,
});

interface ChatMessage {
  id: number;
  sender: "client" | "provider";
  text: string;
  timestamp: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    sender: "provider",
    text: "Hi Raj! I'm Sarah, your dedicated account manager. How can I help you today?",
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
];

const SUGGESTED_QUERIES = [
  "Request status update",
  "Schedule a quick call",
  "Question about SEO",
  "Upload brand assets",
];

function RouteComponent() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

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

    // Simulate auto reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const autoReplyMsg: ChatMessage = {
        id: Date.now() + 1,
        sender: "provider",
        text: "Got it! Sarah or a developer from our team will get back to you shortly.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, autoReplyMsg]);
    }, 1200);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage(inputText);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2 font-sans text-mm-dark select-none">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-mm-dark font-sans">
          Messages
        </h2>
        <p className="text-sm text-mm-gray mt-1">Contact us</p>
      </div>

      {/* Main Chat Box Card */}
      <div className="bg-white border border-mm-border rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col h-[560px] overflow-hidden">
        {/* Support Provider Agent Header Panel */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-mm-border bg-white shrink-0">
          <div className="flex items-center gap-3">
            {/* Agent Avatar */}
            <div className="relative">
              <img
                src="/logos/logo.PNG"
                alt="the open ai"
                className="w-10 rounded-full object-cover border border-mm-border"
              />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-mm-green border-2 border-white" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-mm-dark leading-none">
                theOpenAI
              </h4>
              <span className="text-[11px] font-semibold text-mm-gray mt-1 block">
                Dedicated Account Manager
              </span>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-bold text-mm-green bg-mm-green/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Active Support
            </span>
          </div>
        </div>

        {/* Message Log Thread (Scrollable) */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-mm-bg-wrap/10"
        >
          {messages.map((msg) => {
            const isClient = msg.sender === "client";
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${
                  isClient ? "ml-auto items-end" : "mr-auto items-start"
                } animate-fadeIn`}
              >
                <div
                  className={`px-4 py-3 rounded-[18px] text-xs sm:text-sm font-semibold leading-relaxed ${
                    isClient
                      ? "bg-mm-orange text-white rounded-br-xs"
                      : "bg-mm-subtle/80 text-mm-dark rounded-bl-xs border border-mm-border/50"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] font-bold text-mm-gray mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex flex-col items-start mr-auto max-w-[75%] animate-pulse">
              <div className="bg-mm-subtle/80 text-mm-dark px-4 py-2.5 rounded-[18px] rounded-bl-xs border border-mm-border/50 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-mm-gray rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 bg-mm-gray rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 bg-mm-gray rounded-full animate-bounce" />
              </div>
              <span className="text-[10px] font-bold text-mm-gray mt-1 px-1">
                Sarah is typing...
              </span>
            </div>
          )}
        </div>

        {/* Suggested Quick Queries row */}
        <div className="px-6 py-2 bg-white flex flex-wrap gap-2 overflow-x-auto shrink-0 border-t border-mm-border/40">
          {SUGGESTED_QUERIES.map((query, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(query)}
              className="px-3 py-1.5 bg-mm-subtle/40 hover:bg-mm-subtle hover:text-mm-dark text-[11px] font-bold text-mm-gray rounded-lg border border-mm-border/30 transition-all cursor-pointer whitespace-nowrap"
            >
              {query}
            </button>
          ))}
        </div>

        {/* Bottom Input Area */}
        <div className="px-6 py-4 bg-white border-t border-mm-border flex items-center gap-3 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message here..."
            className="flex-1 bg-mm-subtle/50 focus:bg-white border border-mm-border/80 focus:border-mm-gray focus:outline-none rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold transition-all placeholder:text-mm-gray/60"
          />
          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim()}
            className="h-10 w-10 bg-mm-orange text-white hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:scale-100 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
          >
            <SendHorizontal className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
