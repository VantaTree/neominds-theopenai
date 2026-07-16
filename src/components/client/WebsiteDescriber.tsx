import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Trash2,
  Plus,
  UploadCloud,
  CheckCircle,
  X,
  Edit2,
  Check,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { type Business } from "@/lib/schemas";

interface ImageFile {
  id: string;
  name: string;
  url: string; // base64 URL
  size: string;
}

interface WebsiteSection {
  id: string;
  type: string;
  title: string;
  description: string;
  images: ImageFile[];
}

interface BrandSettings {
  primaryColor: string;
  secondaryColor: string;
  logos: ImageFile[];
  generalNotes: string;
}

interface WebsiteDescriberProps {
  activeBusiness: Business | null;
  onClose: () => void;
}

interface SavedBrief {
  brandSettings: BrandSettings;
  sections: WebsiteSection[];
}

const SECTION_TEMPLATES = [
  {
    type: "home",
    title: "Home Page",
    defaultDescription: "Home page welcoming visitors, highlighting our core value proposition, key services, and primary call to action (e.g., Book a Consultation or Order Now)."
  },
  {
    type: "about",
    title: "About Section",
    defaultDescription: "A section detailing our company story, mission, core values, team members, and what makes us unique in our industry."
  },
  {
    type: "contact",
    title: "Contact Us",
    defaultDescription: "A page/section showing contact forms, office locations, maps, phone numbers, emails, and operating hours."
  },
  {
    type: "menu",
    title: "Menu Page",
    defaultDescription: "A catalog showcasing our food menu items, prices, high-quality images, and specific dietary tags (e.g., Gluten-Free, Vegan)."
  },
  {
    type: "services",
    title: "Services Section",
    defaultDescription: "A list of services we provide, highlighting key features, individual package pricing details, and 'Get Started' action links."
  },
  {
    type: "testimonials",
    title: "Testimonials",
    defaultDescription: "A review slider or grid featuring client reviews, customer photos, star ratings, and quotes from our top clients."
  },
  {
    type: "faq",
    title: "FAQ Section",
    defaultDescription: "Accordion of frequently asked questions covering booking, cancellation policies, pricing details, and service deliverable times."
  }
];

export default function WebsiteDescriber({ activeBusiness, onClose }: WebsiteDescriberProps) {
  const storageKey = activeBusiness ? `website_brief_${activeBusiness.id}` : "website_brief_default";
  
  // Brand & identity settings (default fixed section)
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    primaryColor: "#2563EB",
    secondaryColor: "#1E3A8A",
    logos: [],
    generalNotes: ""
  });
  
  // Dynamic website sections list
  const [sections, setSections] = useState<WebsiteSection[]>([]);
  
  // Active expanded section tracking (starts with brand settings)
  const [activeSectionId, setActiveSectionId] = useState<string>("brand_settings");
  
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [draggedOverId, setDraggedOverId] = useState<string | null>(null);
  
  // Custom Delete confirmation states (Text buttons only, validation checkbox)
  const [sectionToDelete, setSectionToDelete] = useState<WebsiteSection | null>(null);
  const [isDeleteConfirmedCheckbox, setIsDeleteConfirmedCheckbox] = useState(false);
  
  // Drag-and-drop index tracking states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<"left" | "right" | null>(null);

  // Mobile navigation bottom sheet toggle state
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  
  // Snapshot cache of the last saved state to track changes
  const [lastSavedData, setLastSavedData] = useState<SavedBrief | null>(null);
  
  const listEndRef = useRef<HTMLDivElement>(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: SavedBrief = JSON.parse(saved);
        if (parsed.brandSettings) {
          setBrandSettings(parsed.brandSettings);
        }
        if (parsed.sections) {
          setSections(parsed.sections);
        }
        setLastSavedData(parsed);
      } catch (e) {
        console.error("Failed to parse website brief settings", e);
      }
    } else {
      const initial: SavedBrief = {
        brandSettings: {
          primaryColor: "#2563EB",
          secondaryColor: "#1E3A8A",
          logos: [],
          generalNotes: ""
        },
        sections: []
      };
      setLastSavedData(initial);
    }
  }, [storageKey]);

  // Determine if there are unsaved inputs
  const hasUnsavedChanges = () => {
    if (!lastSavedData) return false;
    const currentData: SavedBrief = { brandSettings, sections };
    return JSON.stringify(currentData) !== JSON.stringify(lastSavedData);
  };

  // Back icon button click handler
  const handleBackClick = () => {
    if (hasUnsavedChanges()) {
      setIsUnsavedModalOpen(true);
    } else {
      onClose();
    }
  };

  // Save to local storage
  const handleSave = () => {
    const dataToSave: SavedBrief = {
      brandSettings,
      sections
    };
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    setLastSavedData(dataToSave);
    setIsSavedModalOpen(true);
  };

  // Exit saving helper
  const handleSaveAndExit = () => {
    const dataToSave: SavedBrief = {
      brandSettings,
      sections
    };
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    setLastSavedData(dataToSave);
    setIsUnsavedModalOpen(false);
    onClose();
  };

  // Chevron navigation commands
  const handlePreviousSection = () => {
    if (activeSectionId === "brand_settings") return;
    const currentIdx = sections.findIndex(s => s.id === activeSectionId);
    if (currentIdx === 0) {
      setActiveSectionId("brand_settings");
    } else if (currentIdx > 0) {
      setActiveSectionId(sections[currentIdx - 1].id);
    }
  };

  const handleNextSection = () => {
    if (sections.length === 0) return;
    if (activeSectionId === "brand_settings") {
      setActiveSectionId(sections[0].id);
      return;
    }
    const currentIdx = sections.findIndex(s => s.id === activeSectionId);
    if (currentIdx < sections.length - 1) {
      setActiveSectionId(sections[currentIdx + 1].id);
    }
  };

  // Drag and Drop Tab Reordering handlers (applied directly to buttons)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleTabDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left; // relative X position inside target
    const position = x < rect.width / 2 ? "left" : "right";
    
    if (draggedOverIndex !== index || dropPosition !== position) {
      setDraggedOverIndex(index);
      setDropPosition(position);
    }
  };

  const handleDropTab = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    let newIndex = targetIndex;
    
    // Adjust index if the item is moving from left to right to account for splicing
    if (draggedIndex < targetIndex && dropPosition === "left") {
      newIndex = targetIndex;
    } else if (draggedIndex < targetIndex && dropPosition === "right") {
      newIndex = targetIndex;
    } else if (draggedIndex > targetIndex && dropPosition === "left") {
      newIndex = targetIndex;
    } else if (draggedIndex > targetIndex && dropPosition === "right") {
      newIndex = targetIndex + 1;
    }
    
    if (draggedIndex === newIndex) {
      // Reset drag indicators
      setDraggedOverIndex(null);
      setDropPosition(null);
      return;
    }

    const updated = [...sections];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    
    // Adjust splice target if moving forward
    const destIndex = draggedIndex < newIndex ? newIndex - 1 : newIndex;
    updated.splice(destIndex, 0, draggedItem);
    
    setSections(updated);
    setDraggedOverIndex(null);
    setDropPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDraggedOverIndex(null);
    setDropPosition(null);
  };

  // Add section
  const handleAddSection = (template: typeof SECTION_TEMPLATES[number]) => {
    const newSection: WebsiteSection = {
      id: `${template.type}_${Date.now()}`,
      type: template.type,
      title: template.title,
      description: template.defaultDescription,
      images: []
    };
    
    setSections(prev => [...prev, newSection]);
    setActiveSectionId(newSection.id); // Focus new section card
  };

  const handleAddCustomSection = () => {
    const newSection: WebsiteSection = {
      id: `custom_${Date.now()}`,
      type: "custom",
      title: "Custom Section",
      description: "",
      images: []
    };
    
    setSections(prev => [...prev, newSection]);
    setActiveSectionId(newSection.id); // Focus new section card
  };

  // Remove section
  const handleRemoveSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
    if (activeSectionId === id) {
      setActiveSectionId("brand_settings"); // fall back to brand settings
    }
  };

  // Update description
  const handleDescriptionChange = (id: string, text: string) => {
    setSections(prev =>
      prev.map(s => (s.id === id ? { ...s, description: text } : s))
    );
  };

  // Handle title editing
  const startEditingTitle = (id: string, currentTitle: string) => {
    setEditingTitleId(id);
    setCustomTitle(currentTitle);
  };

  const saveTitle = (id: string) => {
    setSections(prev =>
      prev.map(s => (s.id === id ? { ...s, title: customTitle.trim() || s.title } : s))
    );
    setEditingTitleId(null);
  };

  // File Upload Handlers (converts images to base64 for localstorage persistence)
  const processFiles = async (targetId: string, files: FileList | null, isLogo: boolean = false) => {
    if (!files) return;

    const loadedImages: ImageFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

      // Limit to 1.5MB to avoid localStorage quick saturation
      if (file.size > 1.5 * 1024 * 1024) {
        alert(`Image "${file.name}" exceeds the 1.5MB limit. Please upload a smaller image.`);
        continue;
      }

      try {
        const base64Url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = e => reject(e);
        });

        const sizeStr = file.size > 1024 * 1024 
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

        loadedImages.push({
          id: `${file.name}_${Date.now()}_${i}`,
          name: file.name,
          url: base64Url,
          size: sizeStr
        });
      } catch (err) {
        console.error("Error reading file", err);
      }
    }

    if (isLogo) {
      setBrandSettings(prev => ({
        ...prev,
        logos: [...prev.logos, ...loadedImages]
      }));
    } else {
      setSections(prev =>
        prev.map(s => {
          if (s.id === targetId) {
            return { ...s, images: [...s.images, ...loadedImages] };
          }
          return s;
        })
      );
    }
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDraggedOverId(id);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string, isLogo: boolean = false) => {
    e.preventDefault();
    setDraggedOverId(null);
    processFiles(targetId, e.dataTransfer.files, isLogo);
  };

  const removeImage = (sectionId: string, imageId: string, isLogo: boolean = false) => {
    if (isLogo) {
      setBrandSettings(prev => ({
        ...prev,
        logos: prev.logos.filter(img => img.id !== imageId)
      }));
    } else {
      setSections(prev =>
        prev.map(s => {
          if (s.id === sectionId) {
            return { ...s, images: s.images.filter(img => img.id !== imageId) };
          }
          return s;
        })
      );
    }
  };

  // Find currently active section object
  const activeSection = sections.find(s => s.id === activeSectionId);

  // Available library templates (hides once added to workspace outline)
  const availableTemplates = SECTION_TEMPLATES.filter(
    template => sections.every(s => s.type !== template.type)
  );

  // Pagination dots index tracking variables
  const totalCards = sections.length + 1;
  const currentCardIndex = activeSectionId === "brand_settings"
    ? 0
    : sections.findIndex(s => s.id === activeSectionId) + 1;

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300 text-left relative">
      
      {/* Top Header Area: 2-line layout on mobile (line 1 for Back/Add, line 2 for Stepper Tabs) and 1-line layout on desktop */}
      <div className="pb-4 border-b border-[#E2E6EE] w-full">
        
        {/* Mobile Header Row (Line 1): Back button on left, Add Section button on right */}
        <div className="flex md:hidden items-center justify-between w-full pb-3 border-b border-[#E2E6EE] mb-3.5">
          <button
            onClick={handleBackClick}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer text-mm-gray hover:text-mm-dark border border-transparent hover:border-gray-200"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100/80 rounded-xl border border-blue-200 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-xs"
            title="Open Sections Library"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Section</span>
          </button>
        </div>

        {/* Desktop Header row & Mobile Header Row (Line 2) */}
        <div className="flex items-center gap-4 w-full">
          {/* Desktop-only Back button */}
          <button
            onClick={handleBackClick}
            className="hidden md:flex p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer text-mm-gray hover:text-mm-dark border border-transparent hover:border-gray-200 shrink-0"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Outline tabs list: scrollable horizontal row */}
          <div className="flex-1 overflow-x-auto scrollbar-none px-1">
            <div className="flex items-center gap-2">
              
              {/* Permanent Brand Settings Tab */}
              <button
                onClick={() => setActiveSectionId("brand_settings")}
                className={`flex items-center gap-2 px-4.5 py-2.5 rounded-full border text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeSectionId === "brand_settings"
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "bg-white border-gray-200 text-mm-dark hover:bg-gray-50"
                }`}
              >
                <span className={activeSectionId === "brand_settings" ? "text-blue-200" : "text-mm-gray"}>01</span>
                <span>Brand & Settings</span>
              </button>

              {/* Dynamic Draggable tabs */}
              {sections.map((section, idx) => {
                const isActive = activeSectionId === section.id;
                const numberStr = (idx + 2).toString().padStart(2, "0");
                const isDragged = draggedIndex === idx;
                
                return (
                  <div key={section.id} className="flex items-center shrink-0">
                    {/* Left drop line indicator */}
                    {draggedIndex !== null && draggedOverIndex === idx && dropPosition === "left" && (
                      <div className="w-1 h-7 bg-blue-500 rounded-full mx-1 animate-pulse shrink-0" />
                    )}

                    <button
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleTabDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDropTab(e, idx)}
                      onClick={() => setActiveSectionId(section.id)}
                      className={`flex items-center gap-2 px-4.5 py-2.5 rounded-full border text-xs font-bold transition-all cursor-grab active:cursor-grabbing select-none shrink-0 ${
                        isActive
                          ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                          : "bg-white border-gray-200 text-mm-dark hover:bg-gray-50"
                      } ${isDragged ? "opacity-30 scale-95" : ""}`}
                    >
                      <span className={isActive ? "text-blue-200" : "text-mm-gray"}>{numberStr}</span>
                      <span>{section.title}</span>
                    </button>

                    {/* Right drop line indicator */}
                    {draggedIndex !== null && draggedOverIndex === idx && dropPosition === "right" && (
                      <div className="w-1 h-7 bg-blue-500 rounded-full mx-1 animate-pulse shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Main Workspace Layout (col-span-10 workspace, col-span-2 library sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        
        {/* Left Workspace Panel (w-5/6 on desktop, full width on mobile) */}
        <div className="lg:col-span-10 flex flex-col gap-6">
          <div className="w-full">
            {activeSectionId === "brand_settings" ? (
              
              // 1. Brand & Settings Editor card (Active - Key prop triggers slide-up fade-in entrance transition)
              <div key="brand_settings" className="bg-white border border-[#E2E6EE] rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="px-5 py-4 border-b border-[#E2E6EE] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Up/Down chevron icons near title on the left (Hidden on mobile) */}
                    <div className="hidden md:flex items-center gap-0.5">
                      <button
                        onClick={handlePreviousSection}
                        disabled={activeSectionId === "brand_settings"}
                        className="p-1 hover:bg-gray-100 rounded text-mm-gray disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Previous section"
                      >
                        <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                      </button>
                      <button
                        onClick={handleNextSection}
                        disabled={sections.length === 0}
                        className="p-1 hover:bg-gray-100 rounded text-mm-gray disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Next section"
                      >
                        <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>

                    <span className="font-bold text-mm-dark text-base">
                      Brand & General Settings
                    </span>
                  </div>
                </div>
                
                <div className="p-5 space-y-6">
                  {/* Colors Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-mm-gray uppercase tracking-wider block">
                        Primary Color
                      </label>
                      <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl p-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                          <input
                            type="color"
                            value={brandSettings.primaryColor}
                            onChange={(e) => setBrandSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="absolute inset-0 w-full h-full scale-150 cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          value={brandSettings.primaryColor}
                          onChange={(e) => setBrandSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                          placeholder="#000000"
                          className="w-full text-xs font-bold text-mm-dark outline-none bg-transparent"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-mm-gray uppercase tracking-wider block">
                        Secondary Color
                      </label>
                      <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl p-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                          <input
                            type="color"
                            value={brandSettings.secondaryColor}
                            onChange={(e) => setBrandSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            className="absolute inset-0 w-full h-full scale-150 cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          value={brandSettings.secondaryColor}
                          onChange={(e) => setBrandSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          placeholder="#000000"
                          className="w-full text-xs font-bold text-mm-dark outline-none bg-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Logo Upload Section */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-mm-gray uppercase tracking-wider block">
                      Brand Logo(s)
                    </label>

                    {/* Logo previews */}
                    {brandSettings.logos.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        {brandSettings.logos.map(logo => (
                          <div
                            key={logo.id}
                            className="group relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 aspect-video shadow-xs animate-in zoom-in-95 duration-200"
                          >
                            <img
                              src={logo.url}
                              alt={logo.name}
                              className="w-full h-full object-contain p-2"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                              <button
                                onClick={() => removeImage("brand_settings", logo.id, true)}
                                className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                                title="Delete Logo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] px-1.5 py-0.5 truncate">
                              {logo.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Logo Drop Zone */}
                    <div
                      onDragOver={(e) => handleDragOver(e, "brand_settings")}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, "brand_settings", true)}
                      className={`border-2 border-dashed rounded-xl p-4.5 text-center flex flex-col items-center justify-center transition-all cursor-pointer bg-gray-50/50 ${
                        draggedOverId === "brand_settings"
                          ? "border-blue-500 bg-blue-50/20"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        const input = document.getElementById("logo_file_input") as HTMLInputElement;
                        if (input) input.click();
                      }}
                    >
                      <input
                        id="logo_file_input"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => processFiles("brand_settings", e.target.files, true)}
                        className="hidden"
                      />
                      <UploadCloud className="w-7 h-7 text-gray-400 mb-1.5" />
                      <p className="text-xs font-bold text-mm-dark">
                        Drag & drop website logo, or <span className="text-blue-600 hover:underline">browse</span>
                      </p>
                      <p className="text-[10px] text-mm-gray mt-0.5">
                        PNG, JPG, SVG up to 1.5MB
                      </p>
                    </div>
                  </div>

                  {/* General Instructions Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-mm-gray uppercase tracking-wider block">
                      General Project Instructions & Notes
                    </label>
                    <textarea
                      value={brandSettings.generalNotes}
                      onChange={(e) => setBrandSettings(prev => ({ ...prev, generalNotes: e.target.value }))}
                      rows={4}
                      placeholder="Add key objectives, target audience information, font preferences, website reference links, or other general notes..."
                      className="w-full text-sm text-mm-dark p-3.5 border border-[#E2E6EE] rounded-xl focus:border-blue-500 bg-gray-50/30 outline-none transition-all resize-y"
                    />
                  </div>
                </div>
              </div>
            ) : activeSection ? (
              
              // 2. Dynamic Section Editor card (Active - Key prop triggers slide-up fade-in entrance transition)
              <div key={activeSection.id} className="bg-white border border-[#E2E6EE] rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="px-5 py-4 border-b border-[#E2E6EE] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Up/Down chevron icons near title on the left (Hidden on mobile) */}
                    <div className="hidden md:flex items-center gap-0.5">
                      <button
                        onClick={handlePreviousSection}
                        className="p-1 hover:bg-gray-100 rounded text-mm-gray cursor-pointer"
                        title="Previous section"
                      >
                        <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                      </button>
                      <button
                        onClick={handleNextSection}
                        disabled={sections.findIndex(s => s.id === activeSection.id) === sections.length - 1}
                        className="p-1 hover:bg-gray-100 rounded text-mm-gray disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Next section"
                      >
                        <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>

                    {editingTitleId === activeSection.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                          className="border border-blue-500 rounded-lg px-2.5 py-1 text-sm font-bold text-mm-dark bg-blue-50/20 outline-none w-48 sm:w-64"
                          placeholder="Enter section name"
                          autoFocus
                          onKeyDown={(e) => e.key === "Enter" && saveTitle(activeSection.id)}
                        />
                        <button
                          onClick={() => saveTitle(activeSection.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded cursor-pointer"
                        >
                          <Check className="w-4 h-4 stroke-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <span className="font-bold text-mm-dark text-base">
                          {activeSection.title}
                        </span>
                        <button
                          onClick={() => startEditingTitle(activeSection.id, activeSection.title)}
                          className="text-mm-gray opacity-0 group-hover:opacity-100 hover:text-mm-dark transition-all p-1 cursor-pointer"
                          title="Edit Section Name"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Plain text button for deleting, NO icons */}
                  <button
                    onClick={() => {
                      setSectionToDelete(activeSection);
                      setIsDeleteConfirmedCheckbox(false);
                    }}
                    className="font-bold text-xs text-red-500 hover:text-red-700 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Delete Section
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Text Description Box */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-mm-gray uppercase tracking-wider block">
                      What Content / Copy Should Be Written here?
                    </label>
                    <textarea
                      value={activeSection.description}
                      onChange={(e) => handleDescriptionChange(activeSection.id, e.target.value)}
                      rows={6}
                      placeholder={activeSection.type === "custom"
                        ? "Describe what copy, headings, product listings, or buttons should exist on this custom section..."
                        : `Briefly describe the key points, copy goals, or layout requirements for the ${activeSection.title}...`}
                      className="w-full text-sm text-mm-dark p-3.5 border border-[#E2E6EE] rounded-xl focus:border-blue-500 bg-gray-50/30 outline-none transition-all resize-y"
                    />
                  </div>

                  {/* Image Dropzone & Previews */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-mm-gray uppercase tracking-wider block">
                      Include Images / Mockups for reference (Max 1.5MB)
                    </label>

                    {/* File previews */}
                    {activeSection.images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-3">
                        {activeSection.images.map(image => (
                          <div
                            key={image.id}
                            className="group relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 aspect-video shadow-xs animate-in zoom-in-95 duration-200"
                          >
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                              <button
                                onClick={() => removeImage(activeSection.id, image.id)}
                                className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                                title="Delete Image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] px-1.5 py-0.5 truncate">
                              {image.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Drop Zone */}
                    <div
                      onDragOver={(e) => handleDragOver(e, activeSection.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, activeSection.id)}
                      className={`border-2 border-dashed rounded-xl p-4.5 text-center flex flex-col items-center justify-center transition-all cursor-pointer bg-gray-50/50 ${
                        draggedOverId === activeSection.id
                          ? "border-blue-500 bg-blue-50/20"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        const input = document.getElementById(`file_input_${activeSection.id}`) as HTMLInputElement;
                        if (input) input.click();
                      }}
                    >
                      <input
                        id={`file_input_${activeSection.id}`}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => processFiles(activeSection.id, e.target.files)}
                        className="hidden"
                      />
                      <UploadCloud className="w-7 h-7 text-gray-400 mb-1.5" />
                      <p className="text-xs font-bold text-mm-dark">
                        Drag & drop image files, or <span className="text-blue-600 hover:underline">browse</span>
                      </p>
                      <p className="text-[10px] text-mm-gray mt-0.5">
                        PNG, JPG, JPEG up to 1.5MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#E2E6EE] rounded-[24px] p-6 text-center">
                <p className="text-xs text-mm-gray">Select or add a section to start editing.</p>
              </div>
            )}
          </div>

          {/* Mobile Card Pagination & Horizontal Left/Right Arrow Navigation (< and >) Row */}
          <div className="flex justify-center items-center gap-4 pt-4 md:hidden">
            {/* Previous Card Button (<) */}
            <button
              onClick={handlePreviousSection}
              disabled={activeSectionId === "brand_settings"}
              className="p-2 bg-white border border-gray-200 rounded-full text-mm-gray hover:text-mm-dark disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-90 shadow-xs"
              aria-label="Previous section"
            >
              <span className="text-sm font-bold block px-1.5">&lt;</span>
            </button>

            {/* Pagination dots indicators */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalCards }).map((_, idx) => {
                const isCurrent = idx === currentCardIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (idx === 0) {
                        setActiveSectionId("brand_settings");
                      } else {
                        setActiveSectionId(sections[idx - 1].id);
                      }
                    }}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      isCurrent ? "w-5 bg-blue-600" : "w-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to section ${idx + 1}`}
                  />
                );
              })}
            </div>

            {/* Next Card Button (>) */}
            <button
              onClick={handleNextSection}
              disabled={sections.length === 0 || (activeSectionId !== "brand_settings" && sections.findIndex(s => s.id === activeSectionId) === sections.length - 1)}
              className="p-2 bg-white border border-gray-200 rounded-full text-mm-gray hover:text-mm-dark disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-90 shadow-xs"
              aria-label="Next section"
            >
              <span className="text-sm font-bold block px-1.5">&gt;</span>
            </button>
          </div>
        </div>

        {/* Right Sidebar Library Panel: visible only on desktop (screens > 768px) */}
        <div className="hidden md:flex lg:col-span-2 lg:sticky lg:top-24 lg:h-[calc(100vh-220px)] flex-col justify-between select-none">
          
          {/* Scrollable Templates Area */}
          <div className="flex-1 overflow-y-hidden hover:overflow-y-auto no-scrollbar hover:scrollbar-thin space-y-3 pb-3 pr-1">
            {/* Show templates ONLY if they are not already in the workspace sections list */}
            {availableTemplates.map(template => {
              return (
                <div key={template.type} className="relative group/tooltip">
                  <button
                    onClick={() => handleAddSection(template)}
                    className="w-full flex items-center justify-between text-left p-4 rounded-2xl border border-[#E2E6EE] bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm hover:border-blue-200 cursor-pointer"
                  >
                    <span className="font-bold text-mm-dark text-xs block">
                      {template.title}
                    </span>
                    <Plus className="w-3.5 h-3.5 text-mm-gray shrink-0" />
                  </button>
                  
                  {/* Tooltip bubble on hover */}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 z-50 text-left border border-slate-800">
                    <div className="font-bold text-blue-400 mb-1">{template.title} guidelines</div>
                    <p className="text-[11px] leading-relaxed text-slate-200">{template.defaultDescription}</p>
                    {/* Tooltip arrow */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-full border-[6px] border-transparent border-l-slate-900" />
                  </div>
                </div>
              );
            })}

            {/* Custom Section retains a dashed border style and remains visible */}
            <button
              onClick={handleAddCustomSection}
              className="w-full flex items-center justify-between text-left p-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/30 transition-all hover:bg-gray-50/60 hover:-translate-y-0.5 hover:shadow-xs cursor-pointer"
            >
              <span className="font-bold text-mm-dark text-xs block">
                Custom Section
              </span>
              <Plus className="w-3.5 h-3.5 text-mm-gray shrink-0" />
            </button>
          </div>

          {/* Action buttons (Clear and Save Draft) sitting side-by-side at the bottom, FIXED in height (Balanced equal width flex-1) */}
          <div className="pt-3 border-t border-gray-100 flex items-center gap-2 shrink-0 bg-transparent w-full">
            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear this entire brief? This cannot be undone.")) {
                  setSections([]);
                  setBrandSettings({
                    primaryColor: "#2563EB",
                    secondaryColor: "#1E3A8A",
                    logos: [],
                    generalNotes: ""
                  });
                  localStorage.removeItem(storageKey);
                  setActiveSectionId("brand_settings");
                }
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 font-bold text-[10px] py-2.5 rounded-full transition-all active:scale-95 border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50 cursor-pointer shrink-0"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>

            <button
              onClick={handleSave}
              className="flex-1 inline-flex items-center justify-center gap-1.5 font-extrabold text-[10px] py-2.5 rounded-full transition-all active:scale-95 shadow-sm border border-blue-600 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shrink-0"
            >
              <CheckCircle className="w-3 h-3" />
              Save Draft
            </button>
          </div>
        </div>
        
      </div>

      {/* Mobile drawer backdrop overlay */}
      {isMobileDrawerOpen && (
        <div
          onClick={() => setIsMobileDrawerOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Mobile Slide-Up Bottom Sheet (slides up from bottom, rounded top edges, scrollable templates list) */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-2xl z-50 flex flex-col justify-between p-6 border-t border-gray-100 transition-transform duration-300 ease-out md:hidden max-h-[80vh] ${
          isMobileDrawerOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
          <span className="font-extrabold text-sm text-mm-dark">Add Sections</span>
          <button
            onClick={() => setIsMobileDrawerOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-lg text-mm-gray hover:text-mm-dark cursor-pointer transition-colors"
            aria-label="Close library bottom sheet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Templates list inside Drawer */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-3">
          {availableTemplates.map(template => (
            <button
              key={template.type}
              onClick={() => {
                handleAddSection(template);
                setIsMobileDrawerOpen(false);
              }}
              className="w-full flex items-center justify-between text-left p-4 rounded-2xl border border-[#E2E6EE] bg-white transition-all hover:border-blue-200 cursor-pointer animate-in fade-in zoom-in-95 duration-200"
            >
              <span className="font-bold text-mm-dark text-xs block">
                {template.title}
              </span>
              <Plus className="w-3.5 h-3.5 text-mm-gray shrink-0" />
            </button>
          ))}

          <button
            onClick={() => {
              handleAddCustomSection();
              setIsMobileDrawerOpen(false);
            }}
            className="w-full flex items-center justify-between text-left p-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/30 transition-all hover:bg-gray-50/60 cursor-pointer animate-in fade-in zoom-in-95 duration-200"
          >
            <span className="font-bold text-mm-dark text-xs block">
              Custom Section
            </span>
            <Plus className="w-3.5 h-3.5 text-mm-gray shrink-0" />
          </button>
        </div>

        {/* Action buttons (Clear & Save) aligned side-by-side at the bottom of bottom sheet */}
        <div className="pt-3.5 border-t border-gray-100 flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setIsMobileDrawerOpen(false);
              if (confirm("Are you sure you want to clear this entire brief? This cannot be undone.")) {
                setSections([]);
                setBrandSettings({
                  primaryColor: "#2563EB",
                  secondaryColor: "#1E3A8A",
                  logos: [],
                  generalNotes: ""
                });
                localStorage.removeItem(storageKey);
                setActiveSectionId("brand_settings");
              }
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 font-bold text-[10px] py-2.5 rounded-full border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50 cursor-pointer shrink-0"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>

          <button
            onClick={() => {
              setIsMobileDrawerOpen(false);
              handleSave();
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 font-extrabold text-[10px] py-2.5 rounded-full shadow-sm border border-blue-600 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shrink-0"
          >
            <CheckCircle className="w-3 h-3" />
            Save Draft
          </button>
        </div>
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      {isUnsavedModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] p-6 max-w-sm w-full relative shadow-2xl border border-gray-100 animate-in scale-in duration-200 text-center space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-mm-dark">Unsaved Changes</h3>
              <p className="text-xs text-mm-gray leading-relaxed max-w-xs mx-auto">
                You have made changes to your website outline. Would you like to save before exiting?
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={handleSaveAndExit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
              >
                Save & Exit
              </button>
              
              <button
                onClick={() => {
                  setIsUnsavedModalOpen(false);
                  onClose(); // Exit without saving
                }}
                className="w-full border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer active:scale-95"
              >
                Discard Changes
              </button>

              <button
                onClick={() => setIsUnsavedModalOpen(false)}
                className="w-full border border-gray-200 hover:bg-gray-50 text-mm-dark font-bold text-xs py-3 rounded-xl transition-all cursor-pointer active:scale-95"
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Text-Only Section Delete Confirmation Modal with Checkbox validation */}
      {sectionToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] p-6 max-w-sm w-full relative shadow-2xl border border-gray-100 animate-in scale-in duration-200 space-y-5">
            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-mm-dark">Delete Section</h3>
              <p className="text-xs text-mm-gray leading-relaxed">
                Are you sure you want to delete the "{sectionToDelete.title}" section? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-start gap-2.5 bg-gray-50 border border-gray-100 rounded-xl p-3.5">
              <input
                type="checkbox"
                id="confirm_delete_checkbox"
                checked={isDeleteConfirmedCheckbox}
                onChange={(e) => setIsDeleteConfirmedCheckbox(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
              />
              <label htmlFor="confirm_delete_checkbox" className="text-xs font-semibold text-mm-dark leading-tight select-none cursor-pointer">
                Yes, I am sure I want to permanently delete this section from my website brief.
              </label>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  setSectionToDelete(null);
                  setIsDeleteConfirmedCheckbox(false);
                }}
                className="flex-1 border border-gray-200 hover:bg-gray-50 text-mm-dark font-bold text-xs py-3 rounded-xl transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (isDeleteConfirmedCheckbox) {
                    handleRemoveSection(sectionToDelete.id);
                    setSectionToDelete(null);
                    setIsDeleteConfirmedCheckbox(false);
                  }
                }}
                disabled={!isDeleteConfirmedCheckbox}
                className={`flex-1 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer text-center text-white ${
                  isDeleteConfirmedCheckbox 
                    ? "bg-red-600 hover:bg-red-700 active:scale-95" 
                    : "bg-red-300 cursor-not-allowed"
                }`}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Success Popup Modal */}
      {isSavedModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] p-6 max-w-sm w-full relative shadow-2xl border border-gray-100 animate-in scale-in duration-200 text-center space-y-4">
            <button
              onClick={() => setIsSavedModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="h-14 w-14 rounded-full bg-green-50 border border-green-100 text-green-500 flex items-center justify-center mx-auto shadow-sm">
              <Check className="w-6 h-6 stroke-3" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-mm-dark">Brief Saved Successfully!</h3>
              <p className="text-xs text-mm-gray leading-relaxed max-w-xs mx-auto">
                Your website blueprint draft has been updated. You can modify these settings anytime or hand this brief over to our team.
              </p>
            </div>

            <button
              onClick={() => {
                setIsSavedModalOpen(false);
                onClose(); // go back to projects dashboard
              }}
              className="w-full bg-mm-dark hover:bg-mm-dark/90 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
            >
              Back to Projects
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
