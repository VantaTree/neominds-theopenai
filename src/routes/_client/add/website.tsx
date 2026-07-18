import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useBusiness } from "@/hooks/use-business";
import { PLAN_LIMITS } from "@/data/plans";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  UploadCloud,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  GripVertical
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
  isFinishedAdding?: boolean;
}

interface WizardStep {
  id: number;
  type: string;
  label: string;
  sectionId?: string;
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
  },
  {
    type: "vision",
    title: "Vision & Mission",
    defaultDescription: "A section outlining our long-term company vision, immediate mission goals, and our core underlying philosophy."
  },
  {
    type: "team",
    title: "Our Team",
    defaultDescription: "A profile section introducing team members, founders, leadership, and their bios with headshots and role descriptions."
  },
  {
    type: "pricing",
    title: "Pricing Plans",
    defaultDescription: "A grid comparing our different pricing plans, detailing the features included in each plan and action buttons to select a plan."
  },
  {
    type: "portfolio",
    title: "Portfolio/Gallery",
    defaultDescription: "A masonry grid or catalog displaying case studies, past projects, product photography, or recent work highlights."
  },
  {
    type: "footer",
    title: "Footer Section",
    defaultDescription: "The bottom area containing site-wide links, social media icons, copyright declarations, newsletters, and contact details."
  }
];

function RouteComponent() {
  const { activeBusiness } = useBusiness();
  const navigate = useNavigate();
  
  const storageKey = activeBusiness ? `website_brief_${activeBusiness.id}` : "website_brief_default";

  // Resolve business plan limits
  const currentPlan = activeBusiness?.plan || "Basic";
  const limits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS["Basic"];

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
  
  // Dynamic step management
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxVisitedStep, setMaxVisitedStep] = useState<number>(1);
  const [isFinishedAdding, setIsFinishedAdding] = useState<boolean>(false);
  const [showAddSectionStep, setShowAddSectionStep] = useState<boolean>(false);
  const [draggedOverId, setDraggedOverId] = useState<string | null>(null);
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);
  const [draggedOverCardIndex, setDraggedOverCardIndex] = useState<number | null>(null);
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Compute dynamic steps list dynamically
  const dynamicSteps: WizardStep[] = [
    { id: 1, type: "colors", label: "Brand Colors" },
    { id: 2, type: "logo", label: "Brand Logo" },
  ];

  // Add existing sections as steps
  sections.forEach((sec, idx) => {
    if (sec.type === "placeholder") {
      dynamicSteps.push({
        id: 3 + idx,
        type: "select-section",
        sectionId: sec.id,
        label: "Add Section"
      });
    } else {
      dynamicSteps.push({
        id: 3 + idx,
        type: "edit-section",
        sectionId: sec.id,
        label: sec.title
      });
    }
  });

  const canAddMore = sections.length < limits.maxWebsiteSections;
  const showAddStep = canAddMore && showAddSectionStep;

  if (showAddStep) {
    dynamicSteps.push({
      id: 3 + sections.length,
      type: "select-section",
      label: "Add Section"
    });
  }

  const offset = showAddStep ? 1 : 0;
  dynamicSteps.push(
    {
      id: 3 + sections.length + offset,
      type: "notes",
      label: "Final Details"
    },
    {
      id: 4 + sections.length + offset,
      type: "review",
      label: "Review & Order"
    }
  );

  const activeStep = dynamicSteps.find(s => s.id === currentStep) || dynamicSteps[0];

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: SavedBrief = JSON.parse(saved);
        if (parsed.brandSettings) {
          setBrandSettings(prev => ({ ...prev, ...parsed.brandSettings }));
        }
        if (parsed.sections) {
          setSections(parsed.sections);
        }
        if (typeof parsed.isFinishedAdding === "boolean") {
          setIsFinishedAdding(parsed.isFinishedAdding);
        }
      } catch (e) {
        console.error("Failed to parse website brief settings", e);
      }
    }
  }, [storageKey]);

  // Save to local storage helper
  const saveProgress = (
    updatedBrand: BrandSettings,
    updatedSections: WebsiteSection[],
    finishedState: boolean = isFinishedAdding
  ) => {
    const dataToSave: SavedBrief = {
      brandSettings: updatedBrand,
      sections: updatedSections,
      isFinishedAdding: finishedState
    };
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
  };

  const cleanAndNavigate = (action: "next" | "prev" | "goto", targetStep?: number) => {
    const isLeavingAddSectionStep = activeStep.type === "select-section" && !(activeStep as any).sectionId;
    const placeholderIdx = sections.findIndex(s => s.type === "placeholder");

    if (placeholderIdx === -1) {
      if (action === "next") {
        const isFromLogoWithNoSections = activeStep.type === "logo" && sections.length === 0;
        const isLastSectionStep = activeStep.type === "edit-section" && (activeStep as any).sectionId === sections[sections.length - 1]?.id;
        
        if ((isFromLogoWithNoSections || isLastSectionStep) && sections.length < limits.maxWebsiteSections) {
          setShowAddSectionStep(true);
          setIsFinishedAdding(false);
          const nextStepId = 3 + sections.length;
          setCurrentStep(nextStepId);
          if (nextStepId > maxVisitedStep) {
            setMaxVisitedStep(nextStepId);
          }
          saveProgress(brandSettings, sections, false);
          return;
        }

        if (isLeavingAddSectionStep) {
          setShowAddSectionStep(false);
          const nextStepId = 3 + sections.length; // Notes step shifts to 3 + sections.length
          setCurrentStep(nextStepId);
          if (nextStepId > maxVisitedStep) {
            setMaxVisitedStep(nextStepId);
          }
          return;
        }

        const next = currentStep + 1;
        if (next <= dynamicSteps.length) {
          setCurrentStep(next);
          if (next > maxVisitedStep) {
            setMaxVisitedStep(next);
          }
        }
      } else if (action === "prev") {
        if (isLeavingAddSectionStep) {
          setShowAddSectionStep(false);
          const prevStepId = 2 + sections.length; // Last section editor
          setCurrentStep(prevStepId);
          return;
        }

        if (currentStep > 1) {
          setCurrentStep(currentStep - 1);
        }
      } else if (action === "goto" && targetStep !== undefined) {
        if (isLeavingAddSectionStep) {
          setShowAddSectionStep(false);
          const addSectionStepId = 3 + sections.length;
          if (targetStep > addSectionStepId) {
            setCurrentStep(targetStep - 1);
          } else {
            setCurrentStep(targetStep);
          }
        } else {
          setCurrentStep(targetStep);
        }
      }
      return;
    }

    // We have a placeholder section! Clean it up.
    if (isLeavingAddSectionStep) {
      setShowAddSectionStep(false);
    }
    const placeholderStepId = 3 + placeholderIdx;
    const updatedSections = sections.filter(s => s.type !== "placeholder");
    setSections(updatedSections);
    saveProgress(brandSettings, updatedSections, isFinishedAdding);

    if (action === "next") {
      if (currentStep < placeholderStepId) {
        setCurrentStep(currentStep + 1);
      } else {
        const maxStepsAfterCleanup = dynamicSteps.length - 1;
        if (currentStep <= maxStepsAfterCleanup) {
          setCurrentStep(currentStep);
        } else {
          setCurrentStep(maxStepsAfterCleanup);
        }
      }
    } else if (action === "prev") {
      setCurrentStep(placeholderStepId - 1);
    } else if (action === "goto" && targetStep !== undefined) {
      if (targetStep > placeholderStepId) {
        setCurrentStep(targetStep - 1);
      } else {
        setCurrentStep(targetStep);
      }
    }
  };

  const handleNextStep = () => {
    cleanAndNavigate("next");
  };

  const handlePrevStep = () => {
    cleanAndNavigate("prev");
  };

  const handleGoToStep = (stepNum: number) => {
    if (stepNum <= maxVisitedStep) {
      cleanAndNavigate("goto", stepNum);
    }
  };

  const handleColorChange = (key: "primaryColor" | "secondaryColor", value: string) => {
    const newSettings = { ...brandSettings, [key]: value };
    setBrandSettings(newSettings);
    saveProgress(newSettings, sections, isFinishedAdding);
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
      if ((brandSettings.logos.length + loadedImages.length) > 2) {
        alert("You can only upload up to 2 logo images.");
        return;
      }
      const newSettings = {
        ...brandSettings,
        logos: [...brandSettings.logos, ...loadedImages]
      };
      setBrandSettings(newSettings);
      saveProgress(newSettings, sections, isFinishedAdding);
    } else {
      const targetSec = sections.find(s => s.id === targetId);
      if (targetSec && (targetSec.images.length + loadedImages.length) > limits.maxImagesPerSection) {
        alert(`You can only upload up to ${limits.maxImagesPerSection} reference images per section on the ${currentPlan} plan.`);
        return;
      }

      const updatedSections = sections.map(s => {
        if (s.id === targetId) {
          return { ...s, images: [...s.images, ...loadedImages] };
        }
        return s;
      });
      setSections(updatedSections);
      saveProgress(brandSettings, updatedSections, isFinishedAdding);
    }
  };

  const removeImage = (sectionId: string, imageId: string, isLogo: boolean = false) => {
    if (isLogo) {
      const newSettings = {
        ...brandSettings,
        logos: brandSettings.logos.filter(img => img.id !== imageId)
      };
      setBrandSettings(newSettings);
      saveProgress(newSettings, sections, isFinishedAdding);
    } else {
      const updatedSections = sections.map(s => {
        if (s.id === sectionId) {
          return { ...s, images: s.images.filter(img => img.id !== imageId) };
        }
        return s;
      });
      setSections(updatedSections);
      saveProgress(brandSettings, updatedSections, isFinishedAdding);
    }
  };

  // Section flow template selector and addition triggers
  const handleAddSectionTemplate = (template: typeof SECTION_TEMPLATES[number]) => {
    const newSection: WebsiteSection = {
      id: `${template.type}_${Date.now()}`,
      type: template.type,
      title: template.title,
    //   description: template.defaultDescription,
      description: "",
      images: []
    };
    
    let updatedSections;
    if (currentSection) {
      updatedSections = sections.map(s => s.id === currentSection.id ? newSection : s);
    } else {
      updatedSections = [...sections, newSection];
    }
    setSections(updatedSections);
    
    if (!currentSection) {
      const newSectionStepId = 3 + sections.length;
      setCurrentStep(newSectionStepId);
      if (newSectionStepId > maxVisitedStep) {
        setMaxVisitedStep(newSectionStepId);
      }
    }
    
    setShowAddSectionStep(false);
    saveProgress(brandSettings, updatedSections, isFinishedAdding);
  };

  const handleAddCustomSection = () => {
    if (!limits.eligibilityForCustomSection) return;

    const newSection: WebsiteSection = {
      id: `custom_${Date.now()}`,
      type: "custom",
      title: "Custom Section",
      description: "",
      images: []
    };
    
    let updatedSections;
    if (currentSection) {
      updatedSections = sections.map(s => s.id === currentSection.id ? newSection : s);
    } else {
      updatedSections = [...sections, newSection];
    }
    setSections(updatedSections);
    
    if (!currentSection) {
      const newSectionStepId = 3 + sections.length;
      setCurrentStep(newSectionStepId);
      if (newSectionStepId > maxVisitedStep) {
        setMaxVisitedStep(newSectionStepId);
      }
    }
    
    setShowAddSectionStep(false);
    saveProgress(brandSettings, updatedSections, isFinishedAdding);
  };

  const handleRemoveSection = (id: string) => {
    const sectionIndex = sections.findIndex(s => s.id === id);
    if (sectionIndex !== -1) {
      const updatedSections = [...sections];
      updatedSections[sectionIndex] = {
        id: `placeholder_${Date.now()}`,
        type: "placeholder",
        title: "Add Section",
        description: "",
        images: []
      };
      setSections(updatedSections);
      setIsFinishedAdding(false);
      saveProgress(brandSettings, updatedSections, false);
      // We remain on the current step, which now resolves to a select-section step!
    }
  };

  const handleFinishAddingSections = () => {
    setIsFinishedAdding(true);
    const notesStepId = 3 + sections.length;
    setCurrentStep(notesStepId);
    if (notesStepId > maxVisitedStep) {
      setMaxVisitedStep(notesStepId);
    }
    saveProgress(brandSettings, sections, true);
  };

  const handleTriggerAddSectionFromReview = () => {
    setShowAddSectionStep(true);
    setIsFinishedAdding(false);
    const addSectionStepId = 3 + sections.length;
    setCurrentStep(addSectionStepId);
    if (addSectionStepId > maxVisitedStep) {
      setMaxVisitedStep(addSectionStepId);
    }
    saveProgress(brandSettings, sections, false);
  };

  const handleSectionTextChange = (id: string, text: string) => {
    const updatedSections = sections.map(s => (s.id === id ? { ...s, description: text } : s));
    setSections(updatedSections);
    saveProgress(brandSettings, updatedSections, isFinishedAdding);
  };

  const handleSectionTitleChange = (id: string, title: string) => {
    if (!limits.eligibilityForCustomSection) return;
    const targetSec = sections.find(s => s.id === id);
    if (targetSec && targetSec.type !== "custom") return;

    const updatedSections = sections.map(s => (s.id === id ? { ...s, title } : s));
    setSections(updatedSections);
    saveProgress(brandSettings, updatedSections, isFinishedAdding);
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    
    setSections(updated);
    saveProgress(brandSettings, updated, isFinishedAdding);
  };
  const handleCardDrop = (targetIdx: number) => {
    if (draggedSectionIndex === null || draggedSectionIndex === targetIdx) return;
    const updated = [...sections];
    const [removed] = updated.splice(draggedSectionIndex, 1);
    updated.splice(targetIdx, 0, removed);
    setSections(updated);
    saveProgress(brandSettings, updated, isFinishedAdding);
  };
  const handleTouchStart = (idx: number, e: React.TouchEvent) => {
    setDraggedSectionIndex(idx);
    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedSectionIndex === null) return;
    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });

    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const cardElement = element?.closest("[data-section-index]");
    if (cardElement) {
      const hoveredIdx = parseInt(cardElement.getAttribute("data-section-index") || "", 10);
      if (!isNaN(hoveredIdx)) {
        setDraggedOverCardIndex(hoveredIdx);
      }
    } else {
      setDraggedOverCardIndex(null);
    }
  };
  const handleTouchEnd = () => {
    if (draggedSectionIndex !== null && draggedOverCardIndex !== null && draggedSectionIndex !== draggedOverCardIndex) {
      handleCardDrop(draggedOverCardIndex);
    }
    setDraggedSectionIndex(null);
    setDraggedOverCardIndex(null);
    setTouchPosition(null);
  };
  const handleSubmitBrief = () => {
    setIsSubmitSuccess(true);
    localStorage.removeItem(storageKey);
    setTimeout(() => {
      navigate({ to: "/projects" });
    }, 2500);
  };

  const currentSection = activeStep.type === "edit-section" || activeStep.type === "select-section"
    ? sections.find(s => s.id === (activeStep as any).sectionId) 
    : null;

  return (
    <div className="fixed inset-0 w-screen h-full overflow-hidden bg-white text-[#0F172A] font-sans select-none flex flex-row overscroll-none">
      
      {/* 1. Left Sidebar Navigation - Seamless and thin (Only show steps visited/reached) */}
      <aside className="w-6 md:w-12 shrink-0 flex flex-col justify-between items-end py-10 z-20 h-full">
        {/* Back Button */}
        <Link
          to="/add"
          className="hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors text-gray-400 cursor-pointer shrink-0"
          title="Back to Services"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        {/* Stepper container - vertical dashes with a fixed gap of 1 */}
        <div className="flex-1 w-full flex flex-col justify-center items-end py-12 my-6">
          <div className="flex flex-col items-center gap-1">
            {dynamicSteps
              .filter(step => step.id <= maxVisitedStep)
              .map((step) => {
                const isActive = currentStep === step.id;
                const isVisited = step.id <= maxVisitedStep;

                return (
                  <button
                    key={step.id}
                    onClick={() => handleGoToStep(step.id)}
                    disabled={!isVisited}
                    className={`transition-all duration-350 cursor-pointer outline-none w-[2px] ${
                      isActive
                        ? "h-8 bg-blue-600 rounded-full"
                        : isVisited
                          ? "h-3 bg-blue-600/40 hover:bg-blue-600 rounded-full"
                          : "h-3 bg-gray-150 rounded-full"
                    }`}
                    title={step.label}
                  />
                );
              })}
          </div>
        </div>

        {/* Info Icon */}
        <div className="text-gray-300 hover:text-blue-600 transition-colors cursor-pointer shrink-0" title="Need help? Go back to chat.">
          <HelpCircle className="w-4 h-4" />
        </div>
      </aside>

      {/* 2. Main Content Canvas Area (Always fits screen height) */}
      <main className="flex-1 h-full flex flex-col justify-between overflow-hidden bg-white">
        
        {/* Form Container (Scrollable internally) */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 md:px-12 py-8 md:py-12 max-w-3xl w-full mx-auto flex flex-col justify-start">
          
          {/* STEP 1: Colors selection */}
          {activeStep.type === "colors" && (
            <div className="space-y-8 animate-in fade-in duration-300 text-left">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block mb-2">
                  Step {activeStep.id} / Color Palette
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  Pick your brand colors
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Choose primary and secondary colors that represent your brand.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                {/* Primary Color */}
                <div className="flex items-center gap-6 text-left">
                  <div
                    className="w-28 h-28 rounded-3xl border border-gray-200 shadow-inner cursor-pointer relative overflow-hidden transition-transform duration-200 hover:scale-105 shrink-0"
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
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Primary Color</span>
                    <input
                      type="text"
                      value={brandSettings.primaryColor}
                      onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                      className="text-sm font-bold text-[#0F172A] uppercase bg-transparent outline-none border-b border-gray-200 focus:border-blue-600 pb-0.5 w-24"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="flex items-center gap-6 text-left">
                  <div
                    className="w-28 h-28 rounded-3xl border border-gray-200 shadow-inner cursor-pointer relative overflow-hidden transition-transform duration-200 hover:scale-105 shrink-0"
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
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Secondary Color</span>
                    <input
                      type="text"
                      value={brandSettings.secondaryColor}
                      onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                      className="text-sm font-bold text-[#0F172A] uppercase bg-transparent outline-none border-b border-gray-200 focus:border-blue-600 pb-0.5 w-24"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Logo upload or description */}
          {activeStep.type === "logo" && (
            <div className="space-y-8 animate-in fade-in duration-300 text-left">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block mb-2">
                  Step {activeStep.id} / Brand Identity
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  Brand Logo
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Upload your existing logo image, or describe your concept if you don't have one.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Option A: Upload Logo</span>
                  
                  {brandSettings.logos.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      {brandSettings.logos.map(logo => (
                        <div key={logo.id} className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 aspect-video shadow-xs animate-in zoom-in-95 duration-200 group">
                          <img src={logo.url} alt={logo.name} className="w-full h-full object-contain p-2" />
                          <div className="absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage("logo", logo.id, true);
                              }}
                              className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-md flex items-center justify-center"
                              title="Delete Logo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                   {brandSettings.logos.length >= 2 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-[20px] p-6 text-center flex flex-col items-center justify-center bg-gray-50/50 min-h-[160px] opacity-75">
                      <CheckCircle className="w-8 h-8 text-green-500 mb-2.5" />
                      <p className="text-xs font-bold text-gray-700">Logo files uploaded (maximum 2)</p>
                      <p className="text-[10px] text-gray-400 mt-1">To upload a different logo, remove one of the existing files first.</p>
                    </div>
                  ) : (
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
                      <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, SVG up to 1.5MB (max 2 logos)</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4 flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Option B: Describe Logo Concept</span>
                  <textarea
                    value={brandSettings.logoDescription}
                    onChange={(e) => {
                      const newSettings = { ...brandSettings, logoDescription: e.target.value };
                      setBrandSettings(newSettings);
                      saveProgress(newSettings, sections, isFinishedAdding);
                    }}
                    rows={7}
                    placeholder="Describe what you'd like your logo to look like (e.g. style, symbols, emblem, text, key ideas)..."
                    className="w-full flex-1 text-sm text-[#0F172A] p-4 border border-gray-200 rounded-[20px] focus:border-blue-600 bg-gray-50/30 outline-none transition-all resize-none placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 (Template selector step for adding sections) */}
          {activeStep.type === "select-section" && (
            <div className="space-y-8 animate-in fade-in duration-300 text-left">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block mb-2">
                  Step {activeStep.id} / Blueprint Section Choice
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  Add website section
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Choose a structural template block to add. You can add up to {limits.maxWebsiteSections} sections under your {currentPlan} plan (currently: {sections.length}).
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 pt-4">
                {limits.eligibilityForCustomSection && (
                  <button
                    onClick={handleAddCustomSection}
                    className="flex flex-col items-start p-5 bg-white border border-dashed border-gray-300 rounded-[20px] text-left hover:border-blue-600 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <h4 className="font-bold text-sm text-blue-600 mb-1">Custom Section</h4>
                    <p className="hidden md:block text-[10px] text-gray-400 leading-relaxed">Specify a completely custom structural section with unique goals.</p>
                  </button>
                )}
                {SECTION_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.type}
                    onClick={() => handleAddSectionTemplate(tmpl)}
                    className="flex flex-col items-start p-5 bg-white border border-gray-200 rounded-[20px] text-left hover:border-blue-600 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <h4 className="font-bold text-sm text-[#0F172A] mb-1 group-hover:text-blue-600">{tmpl.title}</h4>
                    <p className="hidden md:block text-[10px] text-gray-400 leading-relaxed line-clamp-3">{tmpl.defaultDescription}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3+ (Dynamic sections editors) */}
          {activeStep.type === "edit-section" && currentSection && (
            <div className="space-y-8 animate-in fade-in duration-300 text-left">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block">
                    Step {activeStep.id} / Configure Section
                  </span>
                  <button
                    onClick={() => handleRemoveSection(currentSection.id)}
                    className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Section</span>
                  </button>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-3">
                  {currentSection.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Specify details, objectives, reference layout, or images for this block.
                </p>
              </div>

              <div className="space-y-6 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Section Name</label>
                  <input
                    type="text"
                    value={currentSection.title}
                    onChange={(e) => handleSectionTitleChange(currentSection.id, e.target.value)}
                    disabled={currentSection.type !== "custom" || !limits.eligibilityForCustomSection}
                    className={`w-full text-sm font-bold text-[#0F172A] p-3 border border-gray-200 rounded-xl outline-none bg-white transition-all ${
                      currentSection.type !== "custom" || !limits.eligibilityForCustomSection
                        ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-150" 
                        : "focus:border-blue-600"
                    }`}
                    placeholder="Enter section name"
                  />
                  {currentSection.type !== "custom" ? (
                    <p className="text-[10px] text-gray-400 font-medium">Standard section names are fixed.</p>
                  ) : !limits.eligibilityForCustomSection ? (
                    <p className="text-[10px] text-amber-600 font-medium">Upgrade to Pro plan to customize section names.</p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">
                    What Copy / Layout goes here?
                  </label>
                  <textarea
                    value={currentSection.description}
                    onChange={(e) => handleSectionTextChange(currentSection.id, e.target.value)}
                    rows={6}
                    className="w-full text-sm text-[#0F172A] p-3.5 border border-gray-200 rounded-xl focus:border-blue-600 outline-none bg-white transition-all resize-y placeholder:text-gray-400"
                    placeholder="Describe the content details, headings, action buttons, pricing info, or layout details for this section..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                    Reference Images / Layouts (Max {limits.maxImagesPerSection} images under {currentPlan} plan)
                  </label>
                  
                  {currentSection.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-2">
                      {currentSection.images.map(img => (
                        <div key={img.id} className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 aspect-video shadow-xs group">
                          <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(currentSection.id, img.id);
                              }}
                              className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-md flex items-center justify-center"
                              title="Delete reference image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentSection.images.length < limits.maxImagesPerSection && (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDraggedOverId(currentSection.id); }}
                      onDragLeave={() => setDraggedOverId(null)}
                      onDrop={(e) => { e.preventDefault(); setDraggedOverId(null); processFiles(currentSection.id, e.dataTransfer.files); }}
                      onClick={() => document.getElementById(`sect_file_${currentSection.id}`)?.click()}
                      className={`border-2 border-dashed rounded-xl p-5 text-center flex flex-col items-center justify-center transition-all cursor-pointer bg-gray-50/20 ${
                        draggedOverId === currentSection.id ? "border-blue-600 bg-blue-50/30" : "border-gray-200 hover:border-blue-600"
                      }`}
                    >
                      <input
                        id={`sect_file_${currentSection.id}`}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => processFiles(currentSection.id, e.target.files)}
                        className="hidden"
                      />
                      <UploadCloud className="w-7 h-7 text-gray-400 mb-1.5" />
                      <p className="text-xs font-bold text-gray-700">
                        Drag & drop layouts, or <span className="text-blue-600 hover:underline">browse</span>
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG up to 1.5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: General project details / instructions */}
          {activeStep.type === "notes" && (
            <div className="space-y-8 animate-in fade-in duration-300 text-left">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block mb-2">
                  Step {activeStep.id} / Context & Details
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  Final details & notes
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Add target audience preferences, references, or general project instructions.
                </p>
              </div>

              <div className="space-y-5 pt-4">
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
                      saveProgress(newSettings, sections, isFinishedAdding);
                    }}
                    className="w-full text-sm text-[#0F172A] p-3 border border-gray-200 rounded-xl focus:border-blue-600 outline-none bg-gray-50/20 transition-all placeholder:text-gray-400"
                    placeholder="E.g., Young professionals, local foodies, corporate HR managers..."
                  />
                </div>

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
                      saveProgress(newSettings, sections, isFinishedAdding);
                    }}
                    className="w-full text-sm text-[#0F172A] p-3 border border-gray-200 rounded-xl focus:border-blue-600 outline-none bg-gray-50/20 transition-all placeholder:text-gray-400"
                    placeholder="E.g., https://competitor.com, https://inspiration.design..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                    General Project Instructions & Notes
                  </label>
                  <textarea
                    value={brandSettings.generalNotes}
                    onChange={(e) => {
                      const newSettings = { ...brandSettings, generalNotes: e.target.value };
                      setBrandSettings(newSettings);
                      saveProgress(newSettings, sections, isFinishedAdding);
                    }}
                    rows={6}
                    placeholder="Add key objectives, font preferences, visual branding requirements, or any other final instruction details..."
                    className="w-full text-sm text-[#0F172A] p-3.5 border border-gray-200 rounded-xl focus:border-blue-600 bg-gray-50/20 outline-none transition-all resize-y placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Outline Review and Rearrange */}
          {activeStep.type === "review" && (
            <div className="space-y-8 animate-in fade-in duration-300 text-left">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block mb-2">
                  Step {activeStep.id} / Confirmation
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  Review & Rearrange Sections
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Drag and drop your website sections to change the order they will appear to your users.
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
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleGoToStep(1)}
                      className="p-5 border border-gray-150 rounded-[20px] bg-gray-50/30 text-left hover:bg-gray-50 hover:border-blue-200 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block group-hover:text-blue-500 transition-colors">Palette</span>
                        <div className="flex items-center gap-2">
                          <div className="size-6 aspect-square rounded-full border border-gray-300" style={{ backgroundColor: brandSettings.primaryColor }} />
                          <div className="size-6 aspect-square rounded-full border border-gray-300" style={{ backgroundColor: brandSettings.secondaryColor }} />
                          <span className="text-xs font-bold text-gray-550 uppercase">{brandSettings.primaryColor} / {brandSettings.secondaryColor}</span>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleGoToStep(2)}
                      className="p-5 border border-gray-150 rounded-[20px] bg-gray-50/30 text-left hover:bg-gray-50 hover:border-blue-200 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="space-y-2.5 w-full">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block group-hover:text-blue-500 transition-colors">Brand Logo / Concept</span>
                        <div className="flex items-center gap-2 min-w-0">
                          {brandSettings.logos.length > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-1.5">
                                {brandSettings.logos.map((logo) => (
                                  <img
                                    key={logo.id}
                                    src={logo.url}
                                    alt="Logo preview"
                                    className="w-7 h-7 rounded-lg object-contain border border-gray-250 bg-white p-0.5 shadow-xs shrink-0"
                                  />
                                ))}
                              </div>
                              <span className="text-xs font-bold text-gray-700">
                                {brandSettings.logos.length} logo file(s)
                              </span>
                            </div>
                          ) : brandSettings.logoDescription ? (
                            <p className="text-xs font-medium text-gray-700 italic border-l-2 border-blue-500 pl-2 line-clamp-2 leading-relaxed">
                              "{brandSettings.logoDescription}"
                            </p>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold text-amber-600 bg-amber-50 border border-amber-100">
                              <AlertTriangle className="w-3 h-3" />
                              <span>No logo or concept specified</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                        Website Sections ({sections.length} / {limits.maxWebsiteSections})
                      </span>
                      
                      {sections.length < limits.maxWebsiteSections && (
                        <button
                          onClick={handleTriggerAddSectionFromReview}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg border border-blue-100"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Section</span>
                        </button>
                      )}
                    </div>

                    {sections.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No sections have been defined in this blueprint.</p>
                    ) : (
                      <div className="space-y-3">
                        {sections.map((section, idx) => {
                          // Find template description if applicable
                          const templateInfo = SECTION_TEMPLATES.find(t => t.type === section.type);
                          const subtitle = templateInfo ? templateInfo.defaultDescription : "Custom structural website section.";

                          return (
                            <div
                              key={section.id}
                              data-section-index={idx}
                              draggable
                              onDragStart={(e) => {
                                setDraggedSectionIndex(idx);
                                e.dataTransfer.effectAllowed = "move";
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                              }}
                              onDragEnter={(e) => {
                                e.preventDefault();
                                setDraggedOverCardIndex(idx);
                              }}
                              onDragLeave={() => setDraggedOverCardIndex(null)}
                              onDrop={(e) => {
                                e.preventDefault();
                                handleCardDrop(idx);
                                setDraggedOverCardIndex(null);
                              }}
                              onDragEnd={() => {
                                setDraggedSectionIndex(null);
                                setDraggedOverCardIndex(null);
                              }}
                              onClick={(e) => {
                                if (draggedSectionIndex !== null) return;
                                const target = e.target as HTMLElement;
                                if (target.closest("button") || target.closest(".cursor-grab")) return;
                                handleGoToStep(3 + idx);
                              }}
                              className={`relative flex items-center justify-between p-4 rounded-2xl transition-all duration-200 select-none cursor-pointer ${
                                draggedSectionIndex === idx
                                  ? "opacity-40 border border-dashed border-blue-400 bg-blue-50/10 shadow-none scale-[0.98]"
                                  : draggedOverCardIndex === idx && draggedSectionIndex !== null
                                  ? `${
                                      draggedSectionIndex < idx ? "-translate-y-2" : "translate-y-2"
                                    } bg-blue-50/5 border border-blue-500 shadow-md`
                                  : "bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 translate-y-0"
                              }`}
                            >
                              {/* Drag insertion indicator line */}
                              {draggedSectionIndex !== null && draggedOverCardIndex === idx && draggedSectionIndex !== idx && (
                                <div
                                  className={`absolute left-4 right-4 h-0.5 bg-blue-600 rounded-full z-20 pointer-events-none animate-pulse ${
                                    draggedSectionIndex < idx ? "bottom-[-8px]" : "top-[-8px]"
                                  }`}
                                />
                              )}
                              <div className={`flex items-center gap-3.5 min-w-0 flex-1 ${draggedSectionIndex !== null ? "pointer-events-none" : ""}`}>
                                <div
                                  onTouchStart={(e) => handleTouchStart(idx, e)}
                                  onTouchMove={handleTouchMove}
                                  onTouchEnd={handleTouchEnd}
                                  className="p-1 cursor-grab active:cursor-grabbing hover:bg-gray-50 rounded shrink-0 pointer-events-auto"
                                >
                                  <GripVertical className="text-gray-300 w-4 h-4 hover:text-gray-400 transition-colors" />
                                </div>
                                <div className="min-w-0 text-left">
                                  <h4 className="font-bold text-sm text-[#0F172A] truncate">{section.title}</h4>
                                  <p className="text-[11px] text-gray-400 truncate mt-0.5 max-w-md">{subtitle}</p>
                                </div>
                              </div>
                              
                              <div className={`flex items-center gap-4 shrink-0 pl-4 ${draggedSectionIndex !== null ? "pointer-events-none" : ""}`}>
                                <button
                                  onClick={() => handleGoToStep(3 + idx)}
                                  className="text-xs font-bold text-blue-650 hover:underline cursor-pointer pointer-events-auto"
                                >
                                  Edit
                                </button>
 
                                <div className="flex items-center gap-0.5 border border-gray-150 rounded-lg p-0.5 bg-gray-50/50 pointer-events-auto">
                                  <button
                                    onClick={() => moveSection(idx, "up")}
                                    disabled={idx === 0}
                                    className="p-1 hover:bg-gray-105 rounded disabled:opacity-20 text-gray-500 disabled:cursor-not-allowed cursor-pointer"
                                    title="Move Up"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => moveSection(idx, "down")}
                                    disabled={idx === sections.length - 1}
                                    className="p-1 hover:bg-gray-105 rounded disabled:opacity-20 text-gray-500 disabled:cursor-not-allowed cursor-pointer"
                                    title="Move Down"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
          <div className="border-t border-gray-100 bg-white px-4 sm:px-6 md:px-12 py-4 sm:py-5 max-w-3xl w-full mx-auto flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="px-2.5 sm:px-4 py-2.5 text-[10px] sm:text-xs font-bold text-gray-500 hover:text-[#0F172A] disabled:opacity-20 transition-all cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
              >
                <span className="hidden sm:inline">Previous Step</span>
                <span className="sm:hidden">Previous</span>
              </button>

              {/* Finished Adding Sections button available during section building */}
              {(activeStep.type === "edit-section" || activeStep.type === "select-section") && (
                <button
                  onClick={handleFinishAddingSections}
                  className="px-2.5 sm:px-4 py-2.5 text-[10px] sm:text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 rounded-xl border border-amber-100 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Finished Adding Sections</span>
                  <span className="sm:hidden">Finish Adding</span>
                </button>
              )}
            </div>

            {currentStep === dynamicSteps.length ? (
              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] sm:text-xs rounded-xl shadow-xs cursor-pointer transition-all active:scale-95 whitespace-nowrap"
              >
                Submit Brief
              </button>
            ) : (
              <button
                onClick={handleNextStep}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] sm:text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </main>

      {/* 4. Submission Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-[24px] max-w-sm w-full mx-4 shadow-xl border border-gray-150 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-[#0F172A] tracking-tight">Submit & Lock Brief?</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              This action is irreversible. Once submitted, your brief is locked for production and cannot be modified. Please confirm all details are correct.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-2.5 text-xs font-bold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer bg-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSubmitConfirm(false);
                  handleSubmitBrief();
                }}
                className="flex-1 py-2.5 text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 5. Mobile Drag Floating Preview */}
      {draggedSectionIndex !== null && touchPosition && (
        <div 
          className="fixed pointer-events-none z-50 bg-white/95 border border-blue-500 rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 opacity-90 transition-all transform scale-[1.02] max-w-xs truncate"
          style={{
            left: `${touchPosition.x - 120}px`,
            top: `${touchPosition.y - 65}px`,
          }}
        >
          <GripVertical className="text-blue-500 w-4 h-4 shrink-0" />
          <span className="font-extrabold text-xs text-[#0F172A] truncate">
            {sections[draggedSectionIndex]?.title || "Moving section..."}
          </span>
        </div>
      )}
    </div>
  );
}
