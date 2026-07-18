import React, { useRef, useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreVertical,
  Home,
  Search,
  PlusSquare,
  Plus,
  ChevronLeft,
  Save,
  FileText,
  Video,
  Music,
  Camera,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/_client/add/reel")({
  component: RouteComponent,
});

function RouteComponent() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const captionRef = useRef<HTMLTextAreaElement>(null);

  const [video, setVideo] = useState<string | null>(null);
  const [mode, setMode] = useState<"select" | "reference" | "describe">("select");
  const [description, setDescription] = useState("");
  const [caption, setCaption] = useState("");
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showCaptionDrawer, setShowCaptionDrawer] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const hasContent = video !== null || description || caption;

  // Auto-resize textareas
  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = "auto";
      descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
  }, [description, mode]);

  useEffect(() => {
    if (captionRef.current) {
      captionRef.current.style.height = "auto";
      captionRef.current.style.height = `${captionRef.current.scrollHeight}px`;
    }
  }, [caption, showCaptionDrawer]);

  const handleSaveClick = () => {
    setShowSaveModal(true);
  };

  const handleVideoClick = () => {
    if (video) {
      setShowOverlay((prev) => !prev);
    }
  };

  const handleVideoDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(true);
    setShowDoubleTapHeart(true);
    setTimeout(() => {
      setShowDoubleTapHeart(false);
    }, 850);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error("Video size must be less than 20MB.");
        return;
      }
      const videoUrl = URL.createObjectURL(file);
      setVideo(videoUrl);
      setMode("reference");
      setShowOverlay(false);
    }
  };

  const handleRemoveVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (video) {
      URL.revokeObjectURL(video);
    }
    setVideo(null);
    setMode("select");
    setShowOverlay(false);
  };

  const openCaptionDrawer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCaptionDrawer(true);
  };

  const renderFormattedText = (text: string, isDarkMode = false) => {
    if (!text) return null;

    const parts = text.split(/(\s+)/);
    return parts.map((part, idx) => {
      if (part.startsWith("#") && part.length > 1) {
        const match = part.match(/^(#[a-zA-Z0-9_]+)(.*)$/);
        if (match) {
          return (
            <React.Fragment key={idx}>
              <span className={isDarkMode ? "text-sky-400 font-semibold" : "text-blue-600 font-semibold"}>
                {match[1]}
              </span>
              <span>{match[2]}</span>
            </React.Fragment>
          );
        }
        return (
          <span key={idx} className={isDarkMode ? "text-sky-400 font-semibold" : "text-blue-600 font-semibold"}>
            {part}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="relative h-screen w-full bg-[#F9FAFC] text-[#0F172A] flex flex-col items-center justify-center p-4 font-sans select-none overflow-hidden">
      {/* Hidden File Input for Video */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/*"
        className="hidden"
      />

      {/* Phone Center Wrapper */}
      <div className="relative my-auto flex items-center justify-center w-full h-full max-h-[92vh]">
        {/* Outer Bezel */}
        <div
          style={{ height: "min(725px, 90vh)" }}
          className="relative aspect-[360/740] bg-black rounded-[44px] p-1.5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] border-2 border-gray-950 ring-1 ring-white/10 flex flex-col justify-between overflow-hidden"
        >
          {/* Inner Screen */}
          <div className="relative w-full h-full rounded-[36px] overflow-hidden flex flex-col justify-between pt-1 border border-zinc-950/5 bg-[#FAFAFA]">
            
            {/* iOS Status Bar (Always light themed for mockup border integration) */}
            <div className="flex justify-between items-center px-6 py-1 text-[11px] font-semibold shrink-0 z-30 text-zinc-900 bg-transparent">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-2.5" viewBox="0 0 17 11" fill="currentColor">
                  <rect x="0" y="8" width="2.5" height="3" rx="0.5" />
                  <rect x="4" y="6" width="2.5" height="5" rx="0.5" />
                  <rect x="8" y="4" width="2.5" height="7" rx="0.5" />
                  <rect x="12" y="1" width="2.5" height="10" rx="0.5" />
                </svg>
                <svg className="w-3.5 h-3" viewBox="0 0 14 10" fill="currentColor">
                  <path d="M7 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-4.95-4.95a6.978 6.978 0 0 1 9.9 0l-.707.707a5.978 5.978 0 0 0-8.485 0l-.708-.707ZM.172 2.172a9.969 9.969 0 0 1 13.656 0l-.707.707a8.969 8.969 0 0 0-12.242 0l-.707-.707Z" />
                </svg>
                <div className="w-5 h-2.5 border border-current rounded-sm p-0.5 flex items-center">
                  <div className="h-full w-full bg-current rounded-2xs" />
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative w-full overflow-hidden flex flex-col justify-center">
              
              {/* DESCRIBE DESIGN MODE */}
              {mode === "describe" && (
                <div className="w-full h-full p-4 flex flex-col justify-between bg-[#FCFCFC] z-30">
                  <div className="flex items-center gap-1.5 mb-2.5 border-b border-zinc-100 pb-2">
                    <button
                      onClick={() => {
                        if (video) {
                          setMode("reference");
                        } else {
                          setMode("select");
                        }
                      }}
                      className="text-gray-400 hover:text-zinc-700 transition-colors p-1 cursor-pointer flex items-center justify-center rounded-lg hover:bg-zinc-100"
                    >
                      <ChevronLeft className="w-4.5 h-4.5" />
                    </button>
                    <span className="text-xs font-bold text-gray-500">Back</span>
                  </div>

                  <div className="relative w-full flex-1">
                    <style>{`
                      .highlight-textarea::selection {
                        color: transparent !important;
                        background: rgba(59, 130, 246, 0.25) !important;
                      }
                      .highlight-textarea::-moz-selection {
                        color: transparent !important;
                        background: rgba(59, 130, 246, 0.25) !important;
                      }
                      .syntax-input-base {
                        font-family: inherit !important;
                        font-size: 12px !important;
                        line-height: 1.5 !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        border: none !important;
                        letter-spacing: normal !important;
                        word-spacing: normal !important;
                        text-transform: none !important;
                        text-indent: 0px !important;
                        text-shadow: none !important;
                        text-align: start !important;
                      }
                    `}</style>
                    <textarea
                      ref={descriptionRef}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Write details of how you need the video design to be created..."
                      className="relative w-full h-full bg-transparent outline-none resize-none focus:ring-0 text-transparent caret-zinc-900 whitespace-pre-wrap break-words highlight-textarea syntax-input-base z-10"
                      style={{
                        overflowY: "auto",
                        display: "block",
                      }}
                    />

                    <div
                      className="absolute top-0 left-0 w-full h-full text-zinc-800 whitespace-pre-wrap break-words pointer-events-none select-none syntax-input-base"
                    >
                      {renderFormattedText(description) || (
                        <span className="text-gray-400 font-medium">
                          Write details of how you need the video design to be created... <span className="text-blue-600/70 font-semibold">#design</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-[9px] text-gray-400 text-right font-medium select-none pt-2 border-t border-zinc-100">
                    {description.length} characters
                  </div>
                </div>
              )}

              {/* REELS VIEWPORT */}
              {mode !== "describe" && (
                <div className="w-full h-full relative overflow-hidden flex flex-col justify-between">
                  {/* Background Video Player */}
                  {video ? (
                    <div
                      className="absolute inset-0 w-full h-full z-0 overflow-hidden cursor-pointer"
                      onClick={handleVideoClick}
                      onDoubleClick={handleVideoDoubleClick}
                    >
                      <video
                        src={video}
                        autoPlay
                        loop
                        muted={isMuted}
                        playsInline
                        className="w-full h-full object-cover"
                      />

                      <AnimatePresence>
                        {showDoubleTapHeart && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0, 1.4, 1.1, 1.2, 0], opacity: [0, 1, 1, 1, 0] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.85, ease: "easeOut" }}
                            className="absolute inset-0 flex items-center justify-center z-35 pointer-events-none"
                          >
                            <Heart className="w-16 h-16 fill-red-500 text-red-500 drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    /* Centered Option Cards directly inside mockup container (Light Mode) - Stacked vertically */
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col gap-3 px-6 z-20 pointer-events-auto items-center justify-center">
                      {/* Card 1: Reference */}
                      <button
                        onClick={() => {
                          fileInputRef.current?.click();
                        }}
                        className="w-full max-w-[170px] flex flex-col items-center p-3.5 bg-white border border-gray-200 rounded-[16px] shadow-sm hover:border-mm-orange hover:ring-2 hover:ring-mm-orange/10 transition-all duration-200 text-center cursor-pointer group justify-center active:scale-95"
                      >
                        <div className="bg-gray-50 border border-gray-100 text-gray-500 rounded-xl p-2.5 mb-2 shrink-0 transition-colors group-hover:bg-mm-orange/10 group-hover:text-mm-orange group-hover:border-mm-orange/20">
                          <Video className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-[11px] text-[#0F172A] mb-0.5 transition-colors group-hover:text-mm-orange">
                          Reference
                        </h3>
                        <p className="text-[8.5px] text-gray-400 leading-normal line-clamp-2">
                          Upload video
                        </p>
                      </button>

                      {/* Card 2: Describe */}
                      <button
                        onClick={() => setMode("describe")}
                        className="w-full max-w-[170px] flex flex-col items-center p-3.5 bg-white border border-gray-200 rounded-[16px] shadow-sm hover:border-mm-orange hover:ring-2 hover:ring-mm-orange/10 transition-all duration-200 text-center cursor-pointer group justify-center active:scale-95"
                      >
                        <div className="bg-gray-50 border border-gray-100 text-gray-500 rounded-xl p-2.5 mb-2 shrink-0 transition-colors group-hover:bg-mm-orange/10 group-hover:text-mm-orange group-hover:border-mm-orange/20">
                          <PlusSquare className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-[11px] text-[#0F172A] mb-0.5 transition-colors group-hover:text-mm-orange">
                          Describe
                        </h3>
                        <p className="text-[8.5px] text-gray-400 leading-normal line-clamp-2">
                          Write details
                        </p>
                      </button>
                    </div>
                  )}

                  {/* Reels UI Overlay Layer */}
                  <div className="absolute inset-0 flex flex-col justify-between z-10 pointer-events-none p-3.5">
                    
                    {/* Reels Header Top Bar */}
                    <div className="flex justify-between items-center w-full pointer-events-auto mt-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMode("select");
                        }}
                        className={`hover:scale-105 active:scale-95 transition-transform flex items-center justify-center p-1 ${
                          video ? "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" : "text-zinc-800"
                        }`}
                      >
                        <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                        <span className="text-sm font-bold ml-1">Reels</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info("Camera option clicked");
                        }}
                        className={`hover:scale-105 active:scale-95 transition-transform p-1 ${
                          video ? "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" : "text-zinc-800"
                        }`}
                      >
                        <Camera className="w-5.5 h-5.5 stroke-[2]" />
                      </button>
                    </div>

                    {/* Reels Controls & Description Bottom Section */}
                    <div className="w-full flex items-end justify-between gap-4 mt-auto">
                      
                      {/* Left: User Info & Caption (Matching Screenshot) */}
                      <div className={`flex-1 flex flex-col items-start gap-2 pointer-events-auto pr-4 ${
                        video ? "text-white drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.8)]" : "text-zinc-900"
                      }`}>
                        {/* Profile Logo and Username Row */}
                        <div className="flex items-center gap-2">
                          {/* Colorful Instagram gradient border ring */}
                          <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center shrink-0 shadow-md">
                            <img
                              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80"
                              alt="avatar"
                              className="w-full h-full rounded-full object-cover border border-black"
                            />
                          </div>

                          <div className="flex flex-col items-start">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold tracking-wide">
                                apache_insaan
                              </span>
                              {/* Follow Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast.success("Followed apache_insaan");
                                }}
                                className={`px-2 py-0.5 border rounded-md text-[9px] font-bold transition-all cursor-pointer active:scale-95 ${
                                  video
                                    ? "border-white/40 hover:border-white hover:bg-white/10"
                                    : "border-zinc-300 hover:border-zinc-400 hover:bg-zinc-100 text-zinc-800"
                                }`}
                              >
                                Follow
                              </button>
                            </div>

                            {/* Music Tag below username */}
                            <div className={`flex items-center gap-1 text-[8.5px] font-semibold overflow-hidden max-w-[130px] mt-0.5 select-none ${
                              video ? "text-zinc-300" : "text-zinc-500"
                            }`}>
                              <Music className="w-2.5 h-2.5 shrink-0" />
                              <div className="whitespace-nowrap overflow-hidden">
                                <span className="inline-block animate-[marquee_12s_linear_infinite]">
                                  Original Audio • apache_insaan • Original Audio
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Caption Text (Click to open Drawer) */}
                        <div
                          onClick={openCaptionDrawer}
                          className={`text-[11px] font-normal leading-relaxed max-h-[50px] overflow-hidden line-clamp-2 cursor-pointer select-none p-1.5 rounded-lg border transition-colors w-full mt-1.5 ${
                            video
                              ? "text-zinc-100 bg-black/15 hover:bg-black/30 border-white/5"
                              : "text-zinc-700 bg-zinc-200/50 hover:bg-zinc-200/70 border-zinc-200/60"
                          }`}
                          title="Click to edit Reel caption"
                        >
                          {renderFormattedText(caption, video !== null) || (
                            <span>
                              Write a caption... <span className={video ? "text-sky-300/80" : "text-blue-500/80"}>#edit</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Vertical Overlay Actions Sidebar */}
                      <div className={`flex flex-col items-center gap-4 shrink-0 pointer-events-auto ${
                        video ? "text-white drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.6)]" : "text-zinc-800"
                      }`}>
                        {/* Like */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setLiked(!liked);
                            if (!liked) toast.success("Liked Reel");
                          }}
                          className="flex flex-col items-center gap-1 hover:scale-105 active:scale-95 transition-transform"
                        >
                          <Heart
                            className={`w-6 h-6 stroke-[2] ${liked ? "fill-red-500 text-red-500" : ""}`}
                          />
                          <span className="text-[9px] font-bold">33.8K</span>
                        </button>

                        {/* Comment */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info("Comments clicked");
                          }}
                          className="flex flex-col items-center gap-1 hover:scale-105 active:scale-95 transition-transform"
                        >
                          <MessageCircle className="w-6 h-6 stroke-[2]" />
                          <span className="text-[9px] font-bold">304</span>
                        </button>

                        {/* Share / Repost Cycle Arrow */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info("Share options clicked");
                          }}
                          className="flex flex-col items-center gap-1 hover:scale-105 active:scale-95 transition-transform"
                        >
                          <svg className="w-6 h-6 stroke-[2] fill-none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3M4.5 12c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l-3 3m3-3l3 3" />
                          </svg>
                          <span className="text-[9px] font-bold">354</span>
                        </button>

                        {/* Paper plane Send */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info("Direct message share clicked");
                          }}
                          className="flex flex-col items-center gap-1 hover:scale-105 active:scale-95 transition-transform"
                        >
                          <Send className="w-6 h-6 stroke-[2]" />
                          <span className="text-[9px] font-bold">566</span>
                        </button>

                        {/* Save Bookmark */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBookmarked(!bookmarked);
                            toast.success(bookmarked ? "Removed Bookmark" : "Saved Reel");
                          }}
                          className="flex flex-col items-center gap-1 hover:scale-105 active:scale-95 transition-transform"
                        >
                          <Bookmark
                            className={`w-6 h-6 stroke-[2] ${bookmarked ? (video ? "fill-white" : "fill-zinc-800") : ""}`}
                          />
                          <span className="text-[9px] font-bold">407</span>
                        </button>

                        {/* More Options */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info("More options clicked");
                          }}
                          className="flex flex-col items-center hover:scale-105 active:scale-95 transition-transform"
                        >
                          <MoreVertical className="w-6 h-6 stroke-[2]" />
                        </button>

                        {/* Spin Disk Icon */}
                        <div className={`w-6 h-6 rounded-full border overflow-hidden flex items-center justify-center p-[1px] animate-[spin_5s_linear_infinite] mt-1 shadow-sm shrink-0 ${
                          video ? "border-white/30 bg-black/40" : "border-zinc-300 bg-zinc-200"
                        }`}>
                          <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=50&h=50&q=80"
                            alt="audio disk"
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Overlay (Toggleable on single click on video) */}
                  {video && (
                    <div
                      className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-4 transition-opacity duration-200 z-20 ${
                        showOverlay
                          ? "opacity-100 pointer-events-auto"
                          : "opacity-0 pointer-events-none"
                      }`}
                      onClick={handleVideoClick}
                    >
                      {/* Describe Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMode("describe");
                          setShowOverlay(false);
                        }}
                        className="bg-white/20 hover:bg-white/35 backdrop-blur-md text-white p-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg cursor-pointer"
                        title="Describe design instructions"
                      >
                        <FileText className="w-5.5 h-5.5" />
                      </button>

                      {/* Mute/Unmute Speaker Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMuted(!isMuted);
                          toast.success(isMuted ? "Sound Unmuted" : "Sound Muted");
                        }}
                        className="bg-white/20 hover:bg-white/35 backdrop-blur-md text-white p-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg cursor-pointer"
                        title={isMuted ? "Unmute Sound" : "Mute Sound"}
                      >
                        {isMuted ? (
                          <VolumeX className="w-5.5 h-5.5 stroke-[2.2]" />
                        ) : (
                          <Volume2 className="w-5.5 h-5.5 stroke-[2.2]" />
                        )}
                      </button>

                      {/* Remove Video Button */}
                      <button
                        onClick={handleRemoveVideo}
                        className="bg-red-500/80 hover:bg-red-600 backdrop-blur-md text-white p-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg cursor-pointer"
                        title="Remove Video"
                      >
                        <Trash2 className="w-5.5 h-5.5 stroke-[2.2]" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Caption sliding sheet (drawer) inside the phone overlay */}
              <AnimatePresence>
                {showCaptionDrawer && (
                  <>
                    {/* Drawer Backdrop Overlay inside mockup screen */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowCaptionDrawer(false)}
                      className="absolute inset-0 bg-black z-40"
                    />

                    {/* Drawer sheet container */}
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", damping: 25, stiffness: 220 }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] border-t border-gray-100 flex flex-col p-4 shadow-2xl z-50 max-h-[75%]"
                    >
                      {/* Pull Indicator */}
                      <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3 shrink-0" />

                      {/* Header */}
                      <div className="flex justify-between items-center pb-2.5 border-b border-gray-100 shrink-0">
                        <div className="w-12" /> {/* Spacer */}
                        <h4 className="font-bold text-xs text-[#0F172A]">Reel Caption</h4>
                        <button
                          onClick={() => setShowCaptionDrawer(false)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 w-12 text-right cursor-pointer"
                        >
                          Close
                        </button>
                      </div>

                      {/* Text Input area with live hashtags */}
                      <div className="flex-1 py-3 overflow-y-auto min-h-[120px] relative">
                        <textarea
                          ref={captionRef}
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          placeholder="Write a caption for your Reel..."
                          className="relative w-full h-full bg-transparent outline-none resize-none focus:ring-0 text-transparent caret-zinc-900 whitespace-pre-wrap break-words highlight-textarea syntax-input-base z-10"
                          style={{
                            minHeight: "120px",
                            display: "block",
                          }}
                        />

                        {/* Highlighted text layer */}
                        <div
                          className="absolute top-3 left-0 w-full text-zinc-800 whitespace-pre-wrap break-words pointer-events-none select-none syntax-input-base"
                        >
                          {renderFormattedText(caption) || (
                            <span className="text-gray-400 font-medium">
                              Write a caption for your Reel... <span className="text-blue-600/70 font-semibold">#dance</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-[8px] text-gray-400 text-right mt-1 shrink-0">
                        {caption.length} characters
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Instagram Bottom App Bar (Always white theme) */}
            <div className="flex justify-between items-center px-6 py-2.5 border-t shrink-0 z-30 bg-white text-zinc-900 border-gray-100">
              <Link to="/dashboard" className="hover:scale-105 transition-transform text-current">
                <Home className="w-5.5 h-5.5" />
              </Link>
              <button className="hover:scale-105 transition-transform text-current">
                <Search className="w-5.5 h-5.5" />
              </button>
              <button
                className="transition-all hover:scale-110 active:scale-95 flex items-center justify-center p-1 text-current hover:scale-105"
                onClick={hasContent ? handleSaveClick : () => fileInputRef.current?.click()}
              >
                {hasContent ? (
                  <Save className="w-5.5 h-5.5" />
                ) : (
                  <Plus className="w-5.5 h-5.5" />
                )}
              </button>
              <button className="hover:scale-105 transition-transform text-current">
                <Heart className="w-5.5 h-5.5" />
              </button>
              {/* Profile Avatar */}
              <div className="w-[23px] h-[23px] rounded-full border p-[1px] cursor-pointer border-zinc-900">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="user avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>

            {/* iOS Bottom Swipe Bar (Always white theme) */}
            <div className="w-full pb-2 flex justify-center shrink-0 z-30 bg-white">
              <div className="w-28 h-1 rounded-full bg-zinc-900/40" />
            </div>

            {/* Save Panel Modal Overlay */}
            {showSaveModal && (
              <div
                onClick={() => setShowSaveModal(false)}
                className="absolute inset-0 bg-black/45 backdrop-blur-[12px] z-50 flex flex-col justify-end p-4 rounded-[36px] transition-all duration-300 cursor-pointer"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4 cursor-default animate-in slide-in-from-bottom duration-300"
                >
                  <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-1" />

                  <div className="text-center">
                    <h3 className="font-bold text-[14px] text-[#0F172A]">Save Options</h3>
                    <p className="text-[10px] text-gray-500 mt-1 leading-normal">
                      Choose how you want to save your Reel design instructions.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5 mt-2">
                    <button
                      onClick={() => {
                        toast.success("Reel saved as Draft!");
                        setShowSaveModal(false);
                      }}
                      className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-zinc-800 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer border border-zinc-100"
                    >
                      Save as Draft
                    </button>
                    <button
                      onClick={() => {
                        toast.success("Reel submitted successfully!");
                        setShowSaveModal(false);
                      }}
                      className="w-full py-3 bg-mm-orange text-white hover:bg-mm-orange/95 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Save & Submit
                    </button>
                  </div>

                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="w-full py-2 text-center text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Marquee and Animations Styles */}
      <style>{`
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes pulse-gentle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .animate-pulse-gentle {
          animation: pulse-gentle 2.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
