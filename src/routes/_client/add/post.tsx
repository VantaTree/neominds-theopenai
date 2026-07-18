import React, { useRef, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
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
} from "lucide-react";
import { toast } from "sonner";
import {
  PlusIcon,
  Trash2Icon,
} from "@animateicons/react/lucide";

export const Route = createFileRoute("/_client/add/post")({
  component: RouteComponent,
});

function RouteComponent() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [mode, setMode] = useState<"select" | "reference" | "describe">("select");
  const [description, setDescription] = useState("");
  const [describeText, setDescribeText] = useState("");
  const [showOverlay, setShowOverlay] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const hasContent = images.length > 0 || description || describeText;

  const handleSaveClick = () => {
    setShowSaveModal(true);
  };

  // Drag-to-scroll carousel refs and states
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const dragDistance = useRef(0);

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = "auto";
      descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
  }, [description]);

  useEffect(() => {
    if (carouselRef.current && images.length > 0) {
      const width = carouselRef.current.clientWidth;
      carouselRef.current.scrollLeft = currentIndex * width;
    }
  }, [images.length]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!carouselRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeft.current = carouselRef.current.scrollLeft;
    dragDistance.current = 0;
    carouselRef.current.style.scrollBehavior = "auto";
  };

  const handleMouseLeave = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    snapCarousel();
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    snapCarousel();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    dragDistance.current = Math.abs(x - startX.current);
    carouselRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const snapCarousel = () => {
    if (carouselRef.current) {
      carouselRef.current.style.scrollBehavior = "smooth";
      const width = carouselRef.current.clientWidth;
      const currentScroll = carouselRef.current.scrollLeft;
      const targetIndex = Math.round(currentScroll / width);
      carouselRef.current.scrollLeft = targetIndex * width;
      setCurrentIndex(targetIndex);
    }
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const width = carouselRef.current.clientWidth;
      const currentScroll = carouselRef.current.scrollLeft;
      const index = Math.round(currentScroll / width);
      if (index !== currentIndex && index >= 0 && index < images.length) {
        setCurrentIndex(index);
      }
    }
  };

  const handleCarouselClick = (e: React.MouseEvent) => {
    if (dragDistance.current > 5) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setShowOverlay((prev) => !prev);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const validFiles: File[] = [];
      const exceededFiles: string[] = [];

      Array.from(files).forEach((file) => {
        if (file.size > 2 * 1024 * 1024) {
          exceededFiles.push(file.name);
        } else {
          validFiles.push(file);
        }
      });

      if (exceededFiles.length > 0) {
        toast.error(`Image size must be less than 2MB. Exceeded: ${exceededFiles.join(", ")}`);
      }

      if (validFiles.length === 0) return;

      const newImagesPromises = validFiles.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve(event.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(newImagesPromises).then((newImageUrls) => {
        setImages((prev) => {
          const updated = [...prev, ...newImageUrls];
          if (prev.length === 0) {
            setCurrentIndex(0);
          }
          return updated;
        });
      });
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the upload window
    if (images.length === 0) return;

    const newImages = [...images];
    newImages.splice(currentIndex, 1);
    setImages(newImages);

    // Correct the current index
    if (currentIndex >= newImages.length && newImages.length > 0) {
      setCurrentIndex(newImages.length - 1);
    } else if (newImages.length === 0) {
      setCurrentIndex(0);
      setMode("select");
    }
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;

    // Split text into words and delimiters, identifying hashtags
    const parts = text.split(/(\s+)/);
    return parts.map((part, idx) => {
      if (part.startsWith("#") && part.length > 1) {
        // Regex to separate the hashtag text from any punctuation at the end (like comma or dot)
        const match = part.match(/^(#[a-zA-Z0-9_]+)(.*)$/);
        if (match) {
          return (
            <React.Fragment key={idx}>
              <span className="text-blue-600 font-semibold">{match[1]}</span>
              <span>{match[2]}</span>
            </React.Fragment>
          );
        }
        return (
          <span key={idx} className="text-blue-600 font-semibold">
            {part}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="relative h-screen w-full bg-[#F9FAFC] text-[#0F172A] flex flex-col items-center justify-center p-4 font-sans select-none overflow-hidden">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Phone Center Wrapper */}
      <div className="relative my-auto flex items-center justify-center w-full h-full max-h-[92vh]">
        {/* Outer Bezel (Sized to fit viewport height nicely) */}
        <div
          style={{ height: "min(725px, 90vh)" }}
          className="relative aspect-[360/740] bg-black rounded-[44px] p-1.5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] border-2 border-gray-950 ring-1 ring-white/10 flex flex-col justify-between overflow-hidden"
        >
          {/* Speaker / Dynamic Island */}
          {/* <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800 absolute right-3" />
          </div> */}

          {/* Inner Screen */}
          <div className="relative w-full h-full bg-white rounded-[36px] overflow-hidden flex flex-col justify-between pt-1 border border-zinc-950/5">
            {/* iOS Status Bar */}
            <div className="flex justify-between items-center px-6 py-1 text-[11px] font-semibold text-zinc-900 bg-white shrink-0">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                {/* Cellular Signal Icon */}
                <svg className="w-4 h-2.5" viewBox="0 0 17 11" fill="currentColor">
                  <rect x="0" y="8" width="2.5" height="3" rx="0.5" />
                  <rect x="4" y="6" width="2.5" height="5" rx="0.5" />
                  <rect x="8" y="4" width="2.5" height="7" rx="0.5" />
                  <rect x="12" y="1" width="2.5" height="10" rx="0.5" />
                </svg>
                {/* Wi-Fi Icon */}
                <svg className="w-3.5 h-3" viewBox="0 0 14 10" fill="currentColor">
                  <path d="M7 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-4.95-4.95a6.978 6.978 0 0 1 9.9 0l-.707.707a5.978 5.978 0 0 0-8.485 0l-.708-.707ZM.172 2.172a9.969 9.969 0 0 1 13.656 0l-.707.707a8.969 8.969 0 0 0-12.242 0l-.707-.707Z" />
                </svg>
                {/* Battery Icon */}
                <div className="w-5 h-2.5 border border-current rounded-sm p-0.5 flex items-center">
                  <div className="h-full w-full bg-current rounded-2xs" />
                </div>
              </div>
            </div>

            {/* Instagram Top Navigation Bar */}
            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100 bg-white shrink-0">
              <span className="font-serif italic font-semibold text-xl tracking-tight select-none">
                Instagram
              </span>
              <div className="text-zinc-900 flex items-center justify-center p-1">
                <Send className="w-5 h-5 -rotate-12 translate-y-[-2px] translate-x-[2px] pointer-events-none" />
              </div>
            </div>

            {/* Main Instagram Feed Content Scroll Area */}
            <div className="flex-1 min-h-0 overflow-y-auto bg-white scrollbar-none">
              {/* Post Header */}
              <div className="flex justify-between items-center px-3 py-2 shrink-0">
                <div className="flex items-center gap-2">
                  {/* Avatar */}
                  <img
                    src="/images/avatar_john_doe.png"
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80";
                    }}
                  />
                  <div>
                    <div className="text-[12px] font-bold text-zinc-900 leading-tight">
                      yourusername
                    </div>
                    <div className="text-[10px] text-gray-500 leading-tight">
                      Location
                    </div>
                  </div>
                </div>
                <button className="text-zinc-700 hover:text-zinc-900">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Content Area (Reference / Describe / Select Options) */}
              <div className="w-full aspect-square bg-[#FAFAFA] border-y border-gray-100 flex flex-col relative overflow-hidden shrink-0">
                {mode === "select" || (mode === "reference" && images.length === 0) ? (
                  /* Box Options styled like index.tsx, smaller height, centered */
                  <div className="flex gap-4 p-4 w-full h-full items-center justify-center bg-[#FAFAFA]">
                    {/* Card 1: Reference */}
                    <button
                      onClick={() => {
                        setMode("reference");
                        setTimeout(() => {
                          fileInputRef.current?.click();
                        }, 50);
                      }}
                      className="flex-1 flex flex-col items-center p-4 bg-white border border-gray-200 rounded-[16px] shadow-xs hover:border-mm-orange hover:ring-2 hover:ring-mm-orange/10 transition-all duration-200 text-center cursor-pointer group max-w-[130px] justify-center"
                    >
                      <div className="bg-gray-50 border border-gray-100 text-gray-500 rounded-xl p-2.5 mb-2.5 shrink-0 transition-colors group-hover:bg-mm-orange/10 group-hover:text-mm-orange group-hover:border-mm-orange/20">
                        <Plus className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-xs text-[#0F172A] mb-1 transition-colors group-hover:text-mm-orange">
                        Reference
                      </h3>
                      <p className="text-[9px] text-gray-400 leading-normal line-clamp-2">
                        Upload images
                      </p>
                    </button>

                    {/* Card 2: Describe */}
                    <button
                      onClick={() => setMode("describe")}
                      className="flex-1 flex flex-col items-center p-4 bg-white border border-gray-200 rounded-[16px] shadow-xs hover:border-mm-orange hover:ring-2 hover:ring-mm-orange/10 transition-all duration-200 text-center cursor-pointer group max-w-[130px] justify-center"
                    >
                      <div className="bg-gray-50 border border-gray-100 text-gray-500 rounded-xl p-2.5 mb-2.5 shrink-0 transition-colors group-hover:bg-mm-orange/10 group-hover:text-mm-orange group-hover:border-mm-orange/20">
                        <PlusSquare className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-xs text-[#0F172A] mb-1 transition-colors group-hover:text-mm-orange">
                        Describe
                      </h3>
                      <p className="text-[9px] text-gray-400 leading-normal line-clamp-2">
                        Write details
                      </p>
                    </button>
                  </div>
                ) : mode === "reference" ? (
                  /* Carousel Preview Container */
                  <div className="w-full h-full flex items-center justify-center overflow-hidden relative select-none">
                    {/* The Scrollable Slide Area */}
                    <div
                      ref={carouselRef}
                      onScroll={handleScroll}
                      onMouseDown={handleMouseDown}
                      onMouseLeave={handleMouseLeave}
                      onMouseUp={handleMouseUp}
                      onMouseMove={handleMouseMove}
                      onClick={handleCarouselClick}
                      className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none relative cursor-grab active:cursor-grabbing"
                    >
                      {images.map((img, idx) => (
                        <div key={idx} className="w-full h-full shrink-0 snap-start relative">
                          <img
                            src={img}
                            alt={`Instagram Post Content ${idx + 1}`}
                            className="w-full h-full object-contain select-none pointer-events-none"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Always-visible Back Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMode("select");
                      }}
                      className="absolute top-3 left-3 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-all active:scale-90 z-20 cursor-pointer flex items-center justify-center"
                      title="Back to Selection"
                    >
                      <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    {/* Dynamic Page Badge */}
                    <div className="absolute top-3 right-3 bg-black/75 text-white font-semibold text-[10px] px-2 py-0.5 rounded-full select-none z-10">
                      {currentIndex + 1}/{images.length}
                    </div>

                    {/* Actions Overlay (Toggleable on click) */}
                    <div
                      className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-4 transition-opacity duration-200 z-20 ${
                        showOverlay
                          ? "opacity-100 pointer-events-auto"
                          : "opacity-0 pointer-events-none"
                      }`}
                      onClick={handleCarouselClick}
                    >
                      {/* Add Image Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick();
                        }}
                        className="bg-white/25 hover:bg-white/45 backdrop-blur-md text-white p-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg cursor-pointer"
                        title="Add Image"
                      >
                        <PlusIcon className="w-5 h-5 stroke-[2.5]" />
                      </button>

                      {/* Describe Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMode("describe");
                        }}
                        className="bg-white/25 hover:bg-white/45 backdrop-blur-md text-white p-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg cursor-pointer"
                        title="Describe design instructions"
                      >
                        <FileText className="w-5 h-5" />
                      </button>

                      {/* Remove Current Image Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(e);
                        }}
                        className="bg-red-500/80 hover:bg-red-600 backdrop-blur-md text-white p-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg cursor-pointer"
                        title="Remove Current Image"
                      >
                        <Trash2Icon className="w-5 h-5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Describe Text Area View */
                  <div className="w-full h-full p-4 flex flex-col justify-between bg-[#FCFCFC]">
                    <div className="flex items-center gap-1.5 mb-2.5 border-b border-zinc-100 pb-2">
                      <button
                        onClick={() => {
                          if (images.length > 0) {
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
                    <textarea
                      value={describeText}
                      onChange={(e) => setDescribeText(e.target.value)}
                      placeholder="Write details of how you need the post design to be created..."
                      className="w-full flex-1 bg-transparent border-none outline-none resize-none text-[12px] text-zinc-800 placeholder-gray-400 font-medium leading-relaxed"
                    />
                    <div className="text-[9px] text-gray-400 text-right font-medium select-none pt-2 border-t border-zinc-100">
                      {describeText.length} characters
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Area */}
              <div className="flex justify-between items-center px-3.5 py-3 relative shrink-0">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setLiked(!liked)}
                    className="hover:scale-110 active:scale-95 transition-all text-zinc-900"
                  >
                    <Heart
                      className={`w-[22px] h-[22px] ${liked ? "fill-red-500 text-red-500" : ""}`}
                    />
                  </button>
                  <button className="hover:scale-110 active:scale-95 transition-all text-zinc-900">
                    <MessageCircle className="w-[22px] h-[22px]" />
                  </button>
                  <button className="hover:scale-110 active:scale-95 transition-all text-zinc-900">
                    <Send className="w-[22px] h-[22px]" />
                  </button>
                </div>

                {/* Carousel Dots centered absolutely */}
                {images.length > 1 && (
                  <div className="absolute left-1/2 -translate-x-1/2 flex gap-1 z-10">
                    {images.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          idx === currentIndex ? "bg-blue-500 scale-110" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  className="hover:scale-110 active:scale-95 transition-all text-zinc-900"
                >
                  <Bookmark
                    className={`w-6 h-6 ${bookmarked ? "fill-black text-black" : ""}`}
                  />
                </button>
              </div>

              {/* Content Description Area */}
              <div className="px-3.5 pb-4 text-[12px] text-zinc-900 leading-normal">
                {/* Selection and alignment style helper */}
                <style>{`
                  @keyframes pulse-gentle {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.12); }
                  }
                  .animate-pulse-gentle {
                    animation: pulse-gentle 2.5s infinite ease-in-out;
                  }
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
                <div className="font-bold mb-1">1,234 likes</div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold">yourusername</span>
                  
                  <div className="relative w-full">
                    {/* Hidden textarea as the relative flow base layout element */}
                    <textarea
                      ref={descriptionRef}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={1}
                      className="relative w-full bg-transparent outline-none resize-none focus:ring-0 text-transparent caret-zinc-900 whitespace-pre-wrap break-words highlight-textarea syntax-input-base"
                      style={{
                        overflow: "hidden",
                        display: "block",
                      }}
                    />

                    {/* Highlighted text layer absolutely overlaid on top */}
                    <div
                      className="absolute top-0 left-0 w-full text-zinc-800 whitespace-pre-wrap break-words pointer-events-none select-none syntax-input-base"
                    >
                      {renderFormattedText(description) || "\u00A0"}
                    </div>

                    {/* Placeholder layer when text is empty */}
                    {!description && (
                      <div className="absolute top-0 left-0 w-full text-gray-400 leading-normal pointer-events-none select-none syntax-input-base">
                        Write a description... <span className="text-blue-600/70 font-semibold">#design</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Instagram Bottom App Bar */}
            <div className="flex justify-between items-center px-6 py-2.5 border-t border-gray-100 bg-white shrink-0">
              <button className="text-zinc-900 hover:scale-105 transition-transform">
                <Home className="w-5.5 h-5.5 fill-black" />
              </button>
              <button className="text-zinc-900 hover:scale-105 transition-transform">
                <Search className="w-5.5 h-5.5" />
              </button>
              <button
                className={`text-zinc-900 transition-all hover:scale-110 active:scale-95 flex items-center justify-center ${
                  hasContent ? "animate-pulse-gentle text-mm-orange scale-110" : "hover:scale-105"
                }`}
                onClick={hasContent ? handleSaveClick : handleImageClick}
              >
                {hasContent ? (
                  <Save className="w-5.5 h-5.5" />
                ) : (
                  <PlusSquare className="w-5.5 h-5.5" />
                )}
              </button>
              <button className="text-zinc-900 hover:scale-105 transition-transform">
                <Heart className="w-5.5 h-5.5" />
              </button>
              {/* Tiny User Avatar */}
              <div className="w-[23px] h-[23px] rounded-full border border-zinc-900 p-[1px] cursor-pointer">
                <img
                  src="/images/avatar_john_doe.png"
                  alt="user avatar"
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80";
                  }}
                />
              </div>
            </div>

            {/* iOS Bottom Swipe Bar */}
            <div className="w-full bg-white pb-2 flex justify-center shrink-0">
              <div className="w-28 h-1 bg-zinc-900/40 rounded-full" />
            </div>

            {/* Save Panel Modal Overlay */}
            {showSaveModal && (
              <div
                onClick={() => setShowSaveModal(false)}
                className="absolute inset-0 bg-black/35 backdrop-blur-[12px] z-40 flex flex-col justify-end p-4 rounded-[36px] transition-all duration-300 cursor-pointer animate-in fade-in duration-300"
              >
                {/* Modal Sheet Content */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom duration-300 cursor-default"
                >
                  {/* Pull indicator */}
                  <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-1" />

                  {/* Header Title */}
                  <div className="text-center">
                    <h3 className="font-bold text-[14px] text-[#0F172A]">Save Options</h3>
                    <p className="text-[10px] text-gray-500 mt-1 leading-normal">
                      Choose how you want to save your Instagram post design.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2.5 mt-2">
                    <button
                      onClick={() => {
                        toast.success("Design saved as Draft!");
                        setShowSaveModal(false);
                      }}
                      className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-zinc-800 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer active:scale-98 border border-zinc-100"
                    >
                      Save as Draft
                    </button>
                    <button
                      onClick={() => {
                        toast.success("Design submitted successfully!");
                        setShowSaveModal(false);
                      }}
                      className="w-full py-3 bg-mm-orange text-white hover:bg-mm-orange/95 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer active:scale-98"
                    >
                      Save & Submit
                    </button>
                  </div>

                  {/* Cancel Button */}
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
    </div>
  );
}
