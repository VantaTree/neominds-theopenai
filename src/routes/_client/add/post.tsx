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
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import Calendar from "@/components/Calendar";
import SubmitConfirmModal from "@/components/SubmitConfirmModal";
import {
  PlusIcon,
  Trash2Icon,
} from "@animateicons/react/lucide";

const TOUR_STEPS = [
  "reference",
  "overlay_add",
  "overlay_describe",
  "overlay_remove",
  "select_date",
  "save_button",
] as const;

type TourStep = (typeof TOUR_STEPS)[number];

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
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [tourStep, setTourStep] = useState<TourStep | null>(null);

  useEffect(() => {
    const hasSeen = localStorage.getItem("has_seen_post_onboarding_v5");
    if (!hasSeen) {
      setTourStep("reference");
    }
  }, []);

  useEffect(() => {
    if (
      tourStep === "overlay_add" ||
      tourStep === "overlay_describe" ||
      tourStep === "overlay_remove"
    ) {
      setShowOverlay(true);
    }
  }, [tourStep]);

  const dismissTour = () => {
    setTourStep(null);
    localStorage.setItem("has_seen_post_onboarding_v5", "true");
  };

  const hasContent = images.length > 0 || description || describeText;

  const handleSaveClick = () => {
    setShowSaveModal(true);
    if (tourStep === "save_button") {
      dismissTour();
    }
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
      if (images.length + files.length > 5) {
        toast.error("Maximum 5 images allowed per post.");
        return;
      }
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
        setMode("reference");
        setShowOverlay(true);
        if (tourStep === "reference") {
          setTourStep("overlay_add");
        }
      });
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the upload window
    if (images.length === 0) return;

    const newImages = [...images];
    newImages.splice(currentIndex, 1);
    setImages(newImages);

    if (tourStep === "overlay_remove") {
      setTourStep("select_date");
    }

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
      {/* Back Button (Outside the Mobile Preview) */}
      <div className="absolute top-6 left-6 z-50">
        <Link
          to="/add"
          className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors text-gray-400 cursor-pointer flex items-center justify-center"
          title="Back to Services"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

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

            {/* Onboarding Action-Driven Floating Arrow Tooltip Overlay */}
            {tourStep && !showCalendarModal && (
              <div className="absolute inset-0 z-40 rounded-[36px] pointer-events-none overflow-hidden select-none">
                {/* Step 1: Reference Upload Tooltip */}
                {tourStep === "reference" && (
                  <div className="absolute top-[210px] left-[20px] w-[145px] h-[145px]">
                    <div className="w-full h-full rounded-2xl ring-2 ring-sky-400 border-2 border-sky-400 animate-pulse shadow-[0_0_20px_rgba(56,189,248,0.6)]" />
                    <div className="absolute -bottom-[95px] -left-4 w-[210px] bg-[#1E293B] text-white p-3 rounded-xl shadow-2xl border border-slate-700/80 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-b-6 border-b-[#1E293B]" />
                      <p className="text-[11px] leading-snug font-medium">
                        <span className="font-bold text-sky-400">Click here to upload reference image(s)</span> for your post design (Max 5 images).
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 2A: + Add Image Icon Tooltip */}
                {tourStep === "overlay_add" && (
                  <div className="absolute top-[345px] left-[92px] w-[46px] h-[46px]">
                    <div className="w-full h-full rounded-full ring-2 ring-sky-400 border-2 border-sky-400 animate-pulse shadow-[0_0_15px_rgba(56,189,248,0.6)]" />
                    <div className="absolute -bottom-[95px] -left-[80px] w-[210px] bg-[#1E293B] text-white p-3 rounded-xl shadow-2xl border border-slate-700/80 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-b-6 border-b-[#1E293B]" />
                      <p className="text-[11px] leading-snug font-medium">
                        <span className="font-bold text-sky-400">Add Image (+):</span> Click this + icon to add more images to your post carousel.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 2B: Document Describe Icon Tooltip */}
                {tourStep === "overlay_describe" && (
                  <div className="absolute top-[345px] left-[156px] w-[46px] h-[46px]">
                    <div className="w-full h-full rounded-full ring-2 ring-sky-400 border-2 border-sky-400 animate-pulse shadow-[0_0_15px_rgba(56,189,248,0.6)]" />
                    <div className="absolute -bottom-[95px] -left-[80px] w-[210px] bg-[#1E293B] text-white p-3 rounded-xl shadow-2xl border border-slate-700/80 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-b-6 border-b-[#1E293B]" />
                      <p className="text-[11px] leading-snug font-medium">
                        <span className="font-bold text-sky-400">Describe Details:</span> Click this document icon to add design instructions for this image.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 2C: Bin Remove Icon Tooltip */}
                {tourStep === "overlay_remove" && (
                  <div className="absolute top-[345px] left-[220px] w-[46px] h-[46px]">
                    <div className="w-full h-full rounded-full ring-2 ring-sky-400 border-2 border-sky-400 animate-pulse shadow-[0_0_15px_rgba(56,189,248,0.6)]" />
                    <div className="absolute -bottom-[95px] -left-[80px] w-[210px] bg-[#1E293B] text-white p-3 rounded-xl shadow-2xl border border-slate-700/80 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-b-6 border-b-[#1E293B]" />
                      <p className="text-[11px] leading-snug font-medium">
                        <span className="font-bold text-sky-400">Remove Image:</span> Click this trash bin icon to remove this image from your post.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 3: Select Your Date Tooltip */}
                {tourStep === "select_date" && (
                  <div className="absolute bottom-[130px] left-[16px] w-[130px] h-[28px]">
                    <div className="w-full h-full rounded-lg ring-2 ring-sky-400 border-2 border-sky-400 animate-pulse shadow-[0_0_15px_rgba(56,189,248,0.6)]" />
                    <div className="absolute -top-[85px] left-0 w-[210px] bg-[#1E293B] text-white p-3 rounded-xl shadow-2xl border border-slate-700/80 z-50 animate-in slide-in-from-bottom-2 duration-200">
                      <div className="absolute -bottom-2 left-8 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-[#1E293B]" />
                      <p className="text-[11px] leading-snug font-medium">
                        <span className="font-bold text-sky-400">Select Date:</span> Click here to pick your publishing date on the Calendar.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 4: Save Icon Tooltip */}
                {tourStep === "save_button" && (
                  <div className="absolute bottom-[14px] left-[152px] w-[36px] h-[36px]">
                    <div className="w-full h-full rounded-xl ring-2 ring-sky-400 border-2 border-sky-400 animate-pulse shadow-[0_0_15px_rgba(56,189,248,0.6)]" />
                    <div className="absolute -top-[85px] -left-[90px] w-[210px] bg-[#1E293B] text-white p-3 rounded-xl shadow-2xl border border-slate-700/80 z-50 animate-in slide-in-from-bottom-2 duration-200">
                      <div className="absolute -bottom-2 right-12 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-[#1E293B]" />
                      <p className="text-[11px] leading-snug font-medium">
                        <span className="font-bold text-sky-400">Save & Submit:</span> Click the Save icon to lock and submit your post design!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {showCalendarModal ? (
              <div className="flex-1 min-h-0 bg-white flex flex-col overflow-hidden animate-in fade-in duration-200">
                <Calendar
                  role="client"
                  onClose={() => setShowCalendarModal(false)}
                  onConfirmSchedule={(selectedDate, time, title) => {
                    toast.success(
                      `Post scheduled for ${selectedDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })} at ${time}!`
                    );
                    setShowCalendarModal(false);
                  }}
                />
              </div>
            ) : (
              <>
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
                          className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-4 transition-opacity duration-200 z-20 ${showOverlay
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
                              if (tourStep === "overlay_add") {
                                setTourStep("overlay_describe");
                              }
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
                              if (tourStep === "overlay_describe") {
                                setTourStep("overlay_remove");
                              }
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
                              if (tourStep === "overlay_remove") {
                                setTourStep("select_date");
                              }
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
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-blue-500 scale-110" : "bg-gray-300"
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
                    <button
                      type="button"
                      onClick={() => {
                        setShowCalendarModal(true);
                        if (tourStep === "select_date") {
                          setTourStep("save_button");
                        }
                      }}
                      className="text-blue-600 font-bold text-[12px] hover:underline cursor-pointer block mb-1.5 transition-colors"
                    >
                      Select your date
                    </button>
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
                    className={`transition-all hover:scale-110 active:scale-95 flex items-center justify-center ${hasContent ? "text-mm-orange" : "text-zinc-900 hover:scale-105"
                      }`}
                    onClick={hasContent ? handleSaveClick : handleImageClick}
                    title={hasContent ? "Save Post" : "Add Image"}
                  >
                    {hasContent ? (
                      <div className="flex flex-col items-center justify-center -my-1">
                        <span className="text-[13px] font-extrabold tracking-wide uppercase leading-none mb-0.5 text-mm-orange">
                          Save
                        </span>
                        <Save className="w-5 h-5 text-mm-orange stroke-[2.2]" />
                      </div>
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

                {/* Submit Confirmation Modal Component */}
                <SubmitConfirmModal
                  isOpen={showSaveModal}
                  title="Submit & Lock Post Design?"
                  description="This action is irreversible. Once submitted, your post design is locked for production and scheduling. Please confirm all details are correct."
                  confirmText="Yes, Submit"
                  cancelText="Cancel"
                  containerMode="absolute"
                  onConfirm={() => {
                    setShowSaveModal(false);
                    setShowCalendarModal(true);
                  }}
                  onCancel={() => setShowSaveModal(false)}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
