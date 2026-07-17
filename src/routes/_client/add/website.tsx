import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useBusiness } from "@/hooks/use-business";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  UploadCloud,
  ChevronUp,
  ChevronDown,
  Layers,
  CheckCircle,
  HelpCircle
} from "lucide-react";

export const Route = createFileRoute("/_client/add/website")({
  component: RouteComponent,
});

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
  logoDescription: string;
  generalNotes: string;
  targetAudience: string;
  referenceLinks: string;
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

function RouteComponent() {
  const { activeBusiness } = useBusiness();
  const navigate = useNavigate();
  
  const storageKey = activeBusiness ? `website_brief_${activeBusiness.id}` : "website_brief_default";

  // Step state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxVisitedStep, setMaxVisitedStep] = useState<number>(1);

  // Brand & identity settings
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    primaryColor: "#2563EB",
    secondaryColor: "#1E293B",
    logos: [],
    logoDescription: "",
    generalNotes: "",
    targetAudience: "",
    referenceLinks: ""
  });

  // Dynamic website sections list
  const [sections, setSections] = useState<WebsiteSection[]>([]);
  
  // Section workspace views
  const [sectionWorkspaceView, setSectionWorkspaceView] = useState<"list" | "select" | "edit">("list");
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  
  const [draggedOverId, setDraggedOverId] = useState<string | null>(null);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: SavedBrief = JSON.parse(saved);
        if (parsed.brandSettings) {
          setBrandSettings(prev => ({
            ...prev,
            ...parsed.brandSettings
          }));
        }
        if (parsed.sections) {
          setSections(parsed.sections);
        }
      } catch (e) {
        console.error("Failed to parse website brief settings", e);
      }
    }
  }, [storageKey]);

  // Save to local storage helper
  const saveProgress = (updatedBrand: BrandSettings, updatedSections: WebsiteSection[]) => {
    const dataToSave: SavedBrief = {
      brandSettings: updatedBrand,
      sections: updatedSections
    };
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
  };

  const handleNextStep = () => {
    const next = currentStep + 1;
    setCurrentStep(next);
    if (next > maxVisitedStep) {
      setMaxVisitedStep(next);
    }
    saveProgress(brandSettings, sections);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoToStep = (stepNum: number) => {
    if (stepNum <= maxVisitedStep) {
      setCurrentStep(stepNum);
    }
  };

  // Color selection helpers
  const handleColorChange = (key: "primaryColor" | "secondaryColor", value: string) => {
    const newSettings = { ...brandSettings, [key]: value };
    setBrandSettings(newSettings);
    saveProgress(newSettings, sections);
  };

  // File Upload Handlers
  const processFiles = async (targetId: string, files: FileList | null, isLogo: boolean = false) => {
    if (!files) return;

    const loadedImages: ImageFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

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
      const newSettings = {
        ...brandSettings,
        logos: [...brandSettings.logos, ...loadedImages]
      };
      setBrandSettings(newSettings);
      saveProgress(newSettings, sections);
    } else {
      const updatedSections = sections.map(s => {
        if (s.id === targetId) {
          return { ...s, images: [...s.images, ...loadedImages] };
        }
        return s;
      });
      setSections(updatedSections);
      saveProgress(brandSettings, updatedSections);
    }
  };

  const removeImage = (sectionId: string, imageId: string, isLogo: boolean = false) => {
    if (isLogo) {
      const newSettings = {
        ...brandSettings,
        logos: brandSettings.logos.filter(img => img.id !== imageId)
      };
      setBrandSettings(newSettings);
      saveProgress(newSettings, sections);
    } else {
      const updatedSections = sections.map(s => {
        if (s.id === sectionId) {
          return { ...s, images: s.images.filter(img => img.id !== imageId) };
        }
        return s;
      });
      setSections(updatedSections);
      saveProgress(brandSettings, updatedSections);
    }
  };

  // Section blueprint add/edit helpers
  const handleAddSectionTemplate = (template: typeof SECTION_TEMPLATES[number]) => {
    const newSection: WebsiteSection = {
      id: `${template.type}_${Date.now()}`,
      type: template.type,
      title: template.title,
      description: template.defaultDescription,
      images: []
    };
    
    const updatedSections = [...sections, newSection];
    setSections(updatedSections);
    setEditingSectionId(newSection.id);
    setSectionWorkspaceView("edit");
    saveProgress(brandSettings, updatedSections);
  };

  const handleAddCustomSection = () => {
    const newSection: WebsiteSection = {
      id: `custom_${Date.now()}`,
      type: "custom",
      title: "Custom Section",
      description: "",
      images: []
    };
    
    const updatedSections = [...sections, newSection];
    setSections(updatedSections);
    setEditingSectionId(newSection.id);
    setSectionWorkspaceView("edit");
    saveProgress(brandSettings, updatedSections);
  };

  const handleRemoveSection = (id: string) => {
    const updatedSections = sections.filter(s => s.id !== id);
    setSections(updatedSections);
    if (editingSectionId === id) {
      setEditingSectionId(null);
      setSectionWorkspaceView("list");
    }
    saveProgress(brandSettings, updatedSections);
  };

  const handleSectionTextChange = (id: string, text: string) => {
    const updatedSections = sections.map(s => (s.id === id ? { ...s, description: text } : s));
    setSections(updatedSections);
    saveProgress(brandSettings, updatedSections);
  };

  const handleSectionTitleChange = (id: string, title: string) => {
    const updatedSections = sections.map(s => (s.id === id ? { ...s, title } : s));
    setSections(updatedSections);
    saveProgress(brandSettings, updatedSections);
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    
    setSections(updated);
    saveProgress(brandSettings, updated);
  };

  const handleSubmitBrief = () => {
    setIsSubmitSuccess(true);
    localStorage.removeItem(storageKey);
    setTimeout(() => {
      navigate({ to: "/projects" });
    }, 2500);
  };

  const stepsList = [
    { id: 1, label: "Brand Colors" },
    { id: 2, label: "Brand Logo" },
    { id: 3, label: "Page Sections" },
    { id: 4, label: "Final Details" },
    { id: 5, label: "Review & Order" }
  ];

  const editingSection = sections.find(s => s.id === editingSectionId);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-white text-[#0F172A] font-sans select-none flex flex-row">
      
      {/* 1. Left Sidebar Navigation (Dots and Dashes only) */}
      <aside className="w-16 md:w-20 shrink-0 border-r border-gray-100 flex flex-col justify-between items-center py-8 bg-white z-20 h-full">
        {/* Back Button */}
        <Link
          to="/add"
          className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors text-gray-400 cursor-pointer"
          title="Back to Services"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        {/* Stepper container - dots & dashes only */}
        <div className="flex flex-col items-center gap-4">
          {stepsList.map((step, idx) => {
            const isActive = currentStep === step.id;
            const isVisited = step.id <= maxVisitedStep;
            const isNextVisited = idx < stepsList.length - 1 && stepsList[idx + 1].id <= maxVisitedStep;

            return (
              <div key={step.id} className="flex flex-col items-center">
                <button
                  onClick={() => handleGoToStep(step.id)}
                  disabled={!isVisited}
                  className={`transition-all duration-350 cursor-pointer outline-none ${
                    isActive
                      ? "w-6 h-1 bg-blue-600 rounded-full my-1.5"
                      : isVisited
                        ? "w-1.5 h-1.5 rounded-full bg-blue-600 hover:scale-125 my-1.5"
                        : "w-1.5 h-1.5 rounded-full bg-gray-200 my-1.5"
                  }`}
                  title={step.label}
                />
                {idx < stepsList.length - 1 && (
                  <div
                    className={`w-[1px] h-6 transition-colors duration-300 ${
                      isNextVisited ? "bg-blue-600" : "bg-gray-100"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Info Icon instead of block to maintain minimal look */}
        <div className="text-gray-300 hover:text-blue-600 transition-colors cursor-pointer" title="Need help? Go back to chat.">
          <HelpCircle className="w-4 h-4" />
        </div>
      </aside>

      {/* 2. Main Content Canvas Area (Always fits screen height) */}
      <main className="flex-1 h-full flex flex-col justify-between overflow-hidden bg-white">
        
        {/* Form Container (Scrollable internally) */}
        <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 md:py-12 max-w-3xl w-full mx-auto flex flex-col justify-start">
          
          {/* STEP 1: Colors selection */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in duration-300 text-left">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-650 bg-blue-50 px-2.5 py-1 rounded border border-blue-100 inline-block mb-3">
                  Step 1: Color Palette
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  Pick your brand colors
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Choose primary and secondary colors that represent your brand.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                {/* Primary color selection card */}
                <div className="p-6 bg-white border border-gray-200 hover:border-blue-600 transition-colors rounded-[24px] shadow-xs flex flex-col items-center group">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Primary Color</span>
                  <div
                    className="w-24 h-24 rounded-3xl border border-gray-150 shadow-inner mb-4 transition-transform duration-200 hover:scale-105 cursor-pointer relative overflow-hidden"
                    style={{ backgroundColor: brandSettings.primaryColor }}
                    onClick={() => document.getElementById("primary_picker")?.click()}
                  >
                    <input
                      id="primary_picker"
                      type="color"
                      value={brandSettings.primaryColor}
                      onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                      className="absolute inset-0 w-full h-full scale-150 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 w-full justify-between">
                    <span className="text-xs font-bold text-gray-500">HEX Code</span>
                    <input
                      type="text"
                      value={brandSettings.primaryColor}
                      onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                      className="text-xs font-black text-[#0F172A] uppercase bg-transparent text-right outline-none w-20"
                    />
                  </div>
                  <button
                    onClick={() => document.getElementById("primary_picker")?.click()}
                    className="mt-4 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Open Palette
                  </button>
                </div>

                {/* Secondary color selection card */}
                <div className="p-6 bg-white border border-gray-200 hover:border-blue-600 transition-colors rounded-[24px] shadow-xs flex flex-col items-center group">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Secondary Color</span>
                  <div
                    className="w-24 h-24 rounded-3xl border border-gray-150 shadow-inner mb-4 transition-transform duration-200 hover:scale-105 cursor-pointer relative overflow-hidden"
                    style={{ backgroundColor: brandSettings.secondaryColor }}
                    onClick={() => document.getElementById("secondary_picker")?.click()}
                  >
                    <input
                      id="secondary_picker"
                      type="color"
                      value={brandSettings.secondaryColor}
                      onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                      className="absolute inset-0 w-full h-full scale-150 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 w-full justify-between">
                    <span className="text-xs font-bold text-gray-500">HEX Code</span>
                    <input
                      type="text"
                      value={brandSettings.secondaryColor}
                      onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                      className="text-xs font-black text-[#0F172A] uppercase bg-transparent text-right outline-none w-20"
                    />
                  </div>
                  <button
                    onClick={() => document.getElementById("secondary_picker")?.click()}
                    className="mt-4 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Open Palette
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Logo upload or description */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in duration-300 text-left">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-650 bg-blue-50 px-2.5 py-1 rounded border border-blue-100 inline-block mb-3">
                  Step 2: Brand Identity
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  Brand Logo
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Upload your existing logo image, or describe your concept if you don't have one.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                {/* Left Side: Upload Zone */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Option A: Upload Logo</span>
                  
                  {brandSettings.logos.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      {brandSettings.logos.map(logo => (
                        <div key={logo.id} className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 aspect-video shadow-xs animate-in zoom-in-95 duration-200 group">
                          <img src={logo.url} alt={logo.name} className="w-full h-full object-contain p-2" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                            <button
                              onClick={() => removeImage("logo", logo.id, true)}
                              className="p-1.5 rounded-lg bg-red-650 hover:bg-red-700 text-white cursor-pointer"
                              title="Delete Logo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    onDragOver={(e) => { e.preventDefault(); setDraggedOverId("logo"); }}
                    onDragLeave={() => setDraggedOverId(null)}
                    onDrop={(e) => { e.preventDefault(); setDraggedOverId(null); processFiles("logo", e.dataTransfer.files, true); }}
                    onClick={() => document.getElementById("logo_file")?.click()}
                    className={`border-2 border-dashed rounded-[20px] p-6 text-center flex flex-col items-center justify-center transition-all cursor-pointer bg-gray-50/50 min-h-[160px] ${
                      draggedOverId === "logo" ? "border-blue-600 bg-blue-50/30" : "border-gray-200 hover:border-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      id="logo_file"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => processFiles("logo", e.target.files, true)}
                      className="hidden"
                    />
                    <UploadCloud className="w-8 h-8 text-gray-400 mb-2.5" />
                    <p className="text-xs font-bold text-gray-700">
                      Drag & drop logo file, or <span className="text-blue-600 hover:underline">browse</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, SVG up to 1.5MB</p>
                  </div>
                </div>

                {/* Right Side: Description Textarea */}
                <div className="space-y-4 flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Option B: Describe Logo Concept</span>
                  <textarea
                    value={brandSettings.logoDescription}
                    onChange={(e) => {
                      const newSettings = { ...brandSettings, logoDescription: e.target.value };
                      setBrandSettings(newSettings);
                      saveProgress(newSettings, sections);
                    }}
                    rows={7}
                    placeholder="Describe what you'd like your logo to look like (e.g. style, symbols, emblem, text, key ideas)..."
                    className="w-full flex-1 text-sm text-[#0F172A] p-4 border border-gray-200 rounded-[20px] focus:border-blue-600 bg-gray-50/30 outline-none transition-all resize-none placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Website sections manager */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in duration-300 text-left">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-650 bg-blue-50 px-2.5 py-1 rounded border border-blue-100 inline-block mb-3">
                  Step 3: Site Blueprint
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  Website Structure & Outline
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Choose the structural sections you want to include on your page.
                </p>
              </div>

              {/* View A: Section workspace list overview */}
              {sectionWorkspaceView === "list" && (
                <div className="space-y-6 pt-4">
                  {sections.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gray-200 rounded-[24px] bg-gray-50/50 animate-in fade-in duration-200">
                      <Layers className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <h3 className="font-bold text-gray-700 text-sm">No sections added yet</h3>
                      <p className="text-xs text-gray-400 mt-1 mb-4">Add sections to start outlining your page layout.</p>
                      <button
                        onClick={() => setSectionWorkspaceView("select")}
                        className="bg-blue-600 text-white hover:bg-blue-700 font-extrabold text-xs px-5 py-2.5 rounded-full cursor-pointer transition-all active:scale-95 shadow-sm"
                      >
                        Add Your First Section
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-xs font-bold text-gray-400">Added Sections ({sections.length})</span>
                        <button
                          onClick={() => setSectionWorkspaceView("select")}
                          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Section
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {sections.map((section, idx) => (
                          <div
                            key={section.id}
                            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl shadow-xs transition-colors hover:border-gray-300"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-extrabold text-gray-300">{(idx + 1).toString().padStart(2, "0")}</span>
                              <div>
                                <span className="font-bold text-sm text-[#0F172A]">{section.title}</span>
                                <span className="text-[10px] text-gray-400 font-medium block capitalize">{section.type} outline</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingSectionId(section.id);
                                  setSectionWorkspaceView("edit");
                                }}
                                className="text-xs font-bold text-blue-605 hover:text-blue-700 hover:underline px-3 py-1.5 hover:bg-blue-50/30 rounded-lg cursor-pointer"
                              >
                                Edit Details
                              </button>
                              <button
                                onClick={() => handleRemoveSection(section.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer"
                                title="Remove section"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* View B: Selecting a section layout template to add */}
              {sectionWorkspaceView === "select" && (
                <div className="space-y-6 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Select a layout template</span>
                    <button
                      onClick={() => setSectionWorkspaceView("list")}
                      className="text-xs font-bold text-gray-500 hover:text-[#0F172A] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SECTION_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.type}
                        onClick={() => handleAddSectionTemplate(tmpl)}
                        className="flex flex-col items-start p-5 bg-white border border-gray-200 rounded-[20px] text-left hover:border-blue-600 hover:shadow-xs transition-all cursor-pointer group"
                      >
                        <h4 className="font-bold text-sm text-[#0F172A] mb-1 group-hover:text-blue-600">{tmpl.title}</h4>
                        <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-3">{tmpl.defaultDescription}</p>
                      </button>
                    ))}
                    
                    {/* Custom Outline Card */}
                    <button
                      onClick={handleAddCustomSection}
                      className="flex flex-col items-start p-5 bg-white border border-dashed border-gray-300 rounded-[20px] text-left hover:border-blue-600 hover:shadow-xs transition-all cursor-pointer group"
                    >
                      <h4 className="font-bold text-sm text-blue-600 mb-1">Custom Section</h4>
                      <p className="text-[10px] text-gray-400 leading-relaxed">Specify a completely custom structural section with unique goals or requirements.</p>
                    </button>
                  </div>
                </div>
              )}

              {/* View C: Editing section details and uploading reference mockups */}
              {sectionWorkspaceView === "edit" && editingSection && (
                <div className="p-6 bg-gray-50/50 border border-gray-200 rounded-[24px] space-y-6 animate-in slide-in-from-bottom-3 duration-250 text-left">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Configure Section</span>
                    </div>
                    <button
                      onClick={() => setSectionWorkspaceView("list")}
                      className="text-xs font-bold text-gray-500 hover:text-[#0F172A] cursor-pointer"
                    >
                      Save & Back
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Section Title Input */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Section Name</label>
                      <input
                        type="text"
                        value={editingSection.title}
                        onChange={(e) => handleSectionTitleChange(editingSection.id, e.target.value)}
                        className="w-full text-sm font-bold text-[#0F172A] p-3 border border-gray-200 rounded-xl focus:border-blue-600 outline-none bg-white transition-all"
                        placeholder="Enter section name"
                      />
                    </div>

                    {/* Section Copy/Goal Details */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">What Copy / Layout goes here?</label>
                      <textarea
                        value={editingSection.description}
                        onChange={(e) => handleSectionTextChange(editingSection.id, e.target.value)}
                        rows={5}
                        className="w-full text-sm text-[#0F172A] p-3.5 border border-gray-200 rounded-xl focus:border-blue-600 outline-none bg-white transition-all resize-y placeholder:text-gray-400"
                        placeholder="Describe the content, copy points, buttons, images, or specific outline details for this section..."
                      />
                    </div>

                    {/* Section Reference Images */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Reference Images / Mockups (Max 1.5MB)</label>
                      
                      {editingSection.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 mb-2">
                          {editingSection.images.map(img => (
                            <div key={img.id} className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 aspect-video shadow-xs animate-in zoom-in-95 duration-200 group">
                              <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                <button
                                  onClick={() => removeImage(editingSection.id, img.id)}
                                  className="p-1 text-white bg-red-600 hover:bg-red-700 rounded cursor-pointer"
                                  title="Delete reference image"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div
                        onDragOver={(e) => { e.preventDefault(); setDraggedOverId(editingSection.id); }}
                        onDragLeave={() => setDraggedOverId(null)}
                        onDrop={(e) => { e.preventDefault(); setDraggedOverId(null); processFiles(editingSection.id, e.dataTransfer.files); }}
                        onClick={() => document.getElementById(`sect_file_${editingSection.id}`)?.click()}
                        className={`border-2 border-dashed rounded-xl p-5 text-center flex flex-col items-center justify-center transition-all cursor-pointer bg-white ${
                          draggedOverId === editingSection.id ? "border-blue-600 bg-blue-50/30" : "border-gray-200 hover:border-blue-600"
                        }`}
                      >
                        <input
                          id={`sect_file_${editingSection.id}`}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => processFiles(editingSection.id, e.target.files)}
                          className="hidden"
                        />
                        <UploadCloud className="w-7 h-7 text-gray-400 mb-1.5" />
                        <p className="text-xs font-bold text-gray-700">
                          Drag & drop reference layouts, or <span className="text-blue-600 hover:underline">browse</span>
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG up to 1.5MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: General project details / instructions */}
          {currentStep === 4 && (
            <div className="space-y-8 animate-in fade-in duration-300 text-left">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-650 bg-blue-50 px-2.5 py-1 rounded border border-blue-100 inline-block mb-3">
                  Step 4: Context & Details
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  Final details & notes
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Add target audience preferences, references, or general project instructions.
                </p>
              </div>

              <div className="space-y-5 pt-4">
                {/* Target Audience */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                    Target Audience / Core Users
                  </label>
                  <input
                    type="text"
                    value={brandSettings.targetAudience}
                    onChange={(e) => {
                      const newSettings = { ...brandSettings, targetAudience: e.target.value };
                      setBrandSettings(newSettings);
                      saveProgress(newSettings, sections);
                    }}
                    className="w-full text-sm text-[#0F172A] p-3 border border-gray-200 rounded-xl focus:border-blue-600 outline-none bg-gray-50/20 transition-all placeholder:text-gray-400"
                    placeholder="E.g., Young professionals, local foodies, corporate HR managers..."
                  />
                </div>

                {/* Reference Website links */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                    Reference / Competitor Website Links
                  </label>
                  <input
                    type="text"
                    value={brandSettings.referenceLinks}
                    onChange={(e) => {
                      const newSettings = { ...brandSettings, referenceLinks: e.target.value };
                      setBrandSettings(newSettings);
                      saveProgress(newSettings, sections);
                    }}
                    className="w-full text-sm text-[#0F172A] p-3 border border-gray-200 rounded-xl focus:border-blue-600 outline-none bg-gray-50/20 transition-all placeholder:text-gray-400"
                    placeholder="E.g., https://competitor.com, https://inspiration.design..."
                  />
                </div>

                {/* General Project Instructions */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                    General Project Instructions & Notes
                  </label>
                  <textarea
                    value={brandSettings.generalNotes}
                    onChange={(e) => {
                      const newSettings = { ...brandSettings, generalNotes: e.target.value };
                      setBrandSettings(newSettings);
                      saveProgress(newSettings, sections);
                    }}
                    rows={4}
                    placeholder="Add key objectives, font preferences, visual branding requirements, or any other final instruction details..."
                    className="w-full text-sm text-[#0F172A] p-3.5 border border-gray-200 rounded-xl focus:border-blue-600 bg-gray-50/20 outline-none transition-all resize-y placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Outline Review and Rearrange */}
          {currentStep === 5 && (
            <div className="space-y-8 animate-in fade-in duration-300 text-left">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-650 bg-blue-50 px-2.5 py-1 rounded border border-blue-100 inline-block mb-3">
                  Step 5: Confirmation
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  Review & Reorder Sections
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Verify your branding settings, rearrange section structure, and finalize your brief.
                </p>
              </div>

              {isSubmitSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center border border-green-150 rounded-[24px] bg-green-50/30 text-center animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4 animate-bounce">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-lg">Brief Submitted Successfully!</h3>
                  <p className="text-xs text-gray-500 mt-1.5">Redirecting you to your projects dashboard...</p>
                </div>
              ) : (
                <div className="space-y-6 pt-2">
                  
                  {/* Colors & Logo Metadata Summary box */}
                  <div className="p-5 border border-gray-150 rounded-[20px] bg-gray-50/30 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Palette</span>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full border border-gray-300" style={{ backgroundColor: brandSettings.primaryColor }} />
                        <div className="w-6 h-6 rounded-full border border-gray-300" style={{ backgroundColor: brandSettings.secondaryColor }} />
                        <span className="text-xs font-bold text-gray-500 uppercase">{brandSettings.primaryColor} / {brandSettings.secondaryColor}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Brand Logo / Concept</span>
                      <span className="text-xs font-semibold text-gray-700 line-clamp-2">
                        {brandSettings.logos.length > 0
                          ? `Uploaded ${brandSettings.logos.length} logo file(s)`
                          : brandSettings.logoDescription || "No logo concept specified"}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic sections rearrange container */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block border-b border-gray-100 pb-1.5">
                      Rearrange Section Order
                    </span>

                    {sections.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No sections have been defined in this blueprint.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {sections.map((section, idx) => (
                          <div
                            key={section.id}
                            className="flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-xl shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-extrabold text-gray-300">{(idx + 1).toString().padStart(2, "0")}</span>
                              <span className="font-bold text-xs text-[#0F172A]">{section.title}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => moveSection(idx, "up")}
                                disabled={idx === 0}
                                className="p-1 hover:bg-gray-150 rounded disabled:opacity-20 text-gray-500 disabled:cursor-not-allowed cursor-pointer"
                                title="Move Up"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => moveSection(idx, "down")}
                                disabled={idx === sections.length - 1}
                                className="p-1 hover:bg-gray-150 rounded disabled:opacity-20 text-gray-500 disabled:cursor-not-allowed cursor-pointer"
                                title="Move Down"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
        {!isSubmitSuccess && (
          <div className="border-t border-gray-100 bg-white px-6 md:px-12 py-5 max-w-3xl w-full mx-auto flex items-center justify-between shrink-0">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-[#0F172A] disabled:opacity-20 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              Previous Step
            </button>

            {currentStep === 5 ? (
              <button
                onClick={handleSubmitBrief}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
              >
                Submit Brief
              </button>
            ) : (
              <button
                onClick={handleNextStep}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
