import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Lock, Mail, Eye, EyeOff, X, Loader2 } from "lucide-react";
import { questions } from "@/data/questions";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  ensureUserDocumentFn,
  createSessionCookieFn,
  submitAssessmentFn,
} from "@/lib/server-functions";
import Loader from "@/components/Loader";

export const Route = createFileRoute("/assessment")({
  component: AssessmentPage,
});

// A rich set of industries for the searchable dropdown
const INDUSTRIES = [
  "Technology & Software",
  "Retail & E-commerce",
  "Healthcare & Medical",
  "Finance & Investment",
  "Education & EdTech",
  "Real Estate & Construction",
  "Food & Beverage",
  "Travel & Hospitality",
  "Marketing & Advertising",
  "Legal Services",
  "Consulting & Professional Services",
  "Entertainment & Media",
  "Automotive",
  "Energy & Sustainability",
  "Manufacturing & Logistics",
  "Fashion & Apparel",
  "Beauty & Wellness",
  "Fitness & Sports",
  "Agriculture & Food Science",
  "Nonprofit & Social Impact",
  "Design & Creative Agencies",
  "Telecommunications"
];

interface IndustryDropdownProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
}

function IndustryDropdown({ value, onChange, placeholder, required }: IndustryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = search.trim()
    ? INDUSTRIES.filter(ind => ind.toLowerCase().includes(search.toLowerCase()))
    : INDUSTRIES;

  const handleSelect = (ind: string) => {
    onChange(ind);
    setSearch(ind);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    onChange(val);
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        required={required}
        value={search}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-mm-border bg-mm-subtle/10 text-mm-dark focus:outline-none focus:ring-2 focus:ring-mm-orange/40 focus:border-mm-orange/80 transition-all duration-200 text-sm"
      />
      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-20 w-full mt-1 max-h-60 overflow-y-auto rounded-xl border border-mm-border bg-white shadow-2xl focus:outline-none py-1.5 scrollbar-none">
          {filtered.map((ind) => (
            <li
              key={ind}
              onClick={() => handleSelect(ind)}
              className="px-4 py-2 text-sm text-mm-dark hover:bg-mm-orange/10 hover:text-mm-orange cursor-pointer transition-colors"
            >
              {ind}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AssessmentPage() {
  const navigate = useNavigate();

  // Assessment Form States
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    return questions.reduce((acc, q) => {
      acc[q.id] = "";
      return acc;
    }, {} as Record<string, string>);
  });

  // Teaser and Signup States
  const [showTeaser, setShowTeaser] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Confirmation Panel States
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<"analyze" | "google_signup" | "email_signup" | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing analyzer...");

  useEffect(() => {
    if (!isLoading) {
      setElapsedTime(0);
      setProgress(0);
      setStatusText("Initializing analyzer...");
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);

      // Simulate progress slowly: 1% every 1.5 seconds up to 98%
      const calculatedProgress = Math.min(Math.floor((elapsed / 150) * 100), 98);
      setProgress(calculatedProgress);

      if (elapsed < 10) {
        setStatusText("Resolving DNS records and mapping framework...");
      } else if (elapsed < 25) {
        setStatusText("Running Google Lighthouse check on website performance...");
      } else if (elapsed < 45) {
        setStatusText("Analyzing meta description, page speed, and keywords...");
      } else if (elapsed < 70) {
        setStatusText("Scraping competitor profiles and marketing channels...");
      } else if (elapsed < 100) {
        setStatusText("Generating personalized optimization report...");
      } else {
        setStatusText("Finalizing results, formatting database records...");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!showConfirmation && !isLoading) {
      setIsConfirmed(false);
      setError("");
    }
  }, [showConfirmation, isLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAnalyzeClick = (e: React.FormEvent) => {
    e.preventDefault();

    // Save assessment data
    const assessmentData = {
      businessName: formData.businessName || "",
      industry: formData.industry || "",
      businessDescription: formData.businessDescription || "",
      websiteUrl: formData.websiteUrl || null,
      primaryGoal: formData.primaryGoal || "",
      targetAudience: formData.targetAudience || "",
      location: formData.location || "",
      submittedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem("assessment_data", JSON.stringify(assessmentData));
      
      // If already logged in, skip step 2 and go directly to confirmation
      if (currentUser) {
        setConfirmationAction("analyze");
        setShowConfirmation(true);
      } else {
        setShowTeaser(true); // Move straight to Step 2 of 2
      }
    } catch (err) {
      console.error("Failed to save assessment to localStorage:", err);
    }
  };

  const handleConfirmAction = async () => {
    setIsLoading(true);
    setError("");
    setShowConfirmation(false);

    const assessmentData = {
      businessName: formData.businessName || "",
      industry: formData.industry || "",
      businessDescription: formData.businessDescription || "",
      websiteUrl: formData.websiteUrl || null,
      primaryGoal: formData.primaryGoal || "",
      targetAudience: formData.targetAudience || "",
      location: formData.location || "",
      submittedAt: new Date().toISOString(),
    };

    try {
      let activeUser = currentUser;

      // 1. If not logged in, execute signup first
      if (!activeUser) {
        if (!auth) {
          throw new Error("Authentication service is not available.");
        }

        if (confirmationAction === "email_signup") {
          if (!signupEmail || !signupPassword) {
            throw new Error("Please enter your email and password.");
          }
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            signupEmail,
            signupPassword
          );
          activeUser = userCredential.user;
        } else if (confirmationAction === "google_signup") {
          const provider = new GoogleAuthProvider();
          const userCredential = await signInWithPopup(auth, provider);
          activeUser = userCredential.user;
        } else {
          throw new Error("No signup method selected.");
        }

        if (!activeUser) {
          throw new Error("Failed to create user account.");
        }

        // Get ID token and register cookie/db user
        const token = await activeUser.getIdToken();
        const { sessionCookie } = await createSessionCookieFn({
          data: { idToken: token },
        });

        const isSecure = window.location.protocol === "https:";
        document.cookie = `__session=${sessionCookie}; path=/; max-age=604800;${
          isSecure ? " Secure;" : ""
        } SameSite=Lax`;

        await ensureUserDocumentFn({
          data: {
            user: {
              uid: activeUser.uid,
              displayName: activeUser.displayName,
              email: activeUser.email,
              phoneNumber: activeUser.phoneNumber,
            },
          },
        });
      }

      // 2. Call the server function to create business/report
      const res = await submitAssessmentFn({ data: assessmentData });

      localStorage.setItem("assessment_data", JSON.stringify(assessmentData));
      localStorage.setItem("audit_unlocked", "true");

      if (res && res.businessId) {
        localStorage.setItem("active_business_id", res.businessId);
      }

      setShowConfirmation(false);
      navigate({
        to: "/projects",
        search: { activeCard: "report" },
      });
    } catch (err: any) {
      console.error("Failed to execute signup/assessment creation:", err);
      setError(
        err.message || "An error occurred during account creation/assessment submission."
      );
      setShowConfirmation(true);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleConfirm = () => {
    setIsConfirmed((prev) => !prev);
  };

  const triggerConfirm = () => {
    if (isConfirmed) return;
    setIsConfirmed(true);
    setTimeout(() => {
      handleConfirmAction();
    }, 450);
  };

  return (
    <div className="min-h-screen w-full bg-[var(--color-mm-subtle)]/30 relative flex flex-col items-center justify-center font-sans pt-24 pb-12 lg:py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <Link
        to="/"
        className="absolute top-8 left-8 sm:left-12 sm:top-10 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-mm-border hover:bg-mm-subtle/40 text-mm-dark text-xs font-semibold shadow-sm transition-all select-none cursor-pointer z-50"
      >
        ← Back
      </Link>

      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-mm-blue/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-mm-pink/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* Center-screen Modal Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white border border-mm-border shadow-2xl rounded-3xl p-6 sm:p-10 max-w-sm w-full text-center space-y-6 animate-scaleIn relative">
            {!isLoading && (
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="absolute top-4 right-4 text-mm-gray/40 hover:text-mm-dark transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <div className="space-y-2">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-mm-dark">
                Confirm Details
              </h3>
              <p className="text-sm text-mm-gray leading-relaxed">
                Are you sure all the information is correct?
              </p>
            </div>

            {error && (
              <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-xl text-left font-medium leading-normal max-h-32 overflow-y-auto">
                {error}
              </div>
            )}
            
            <div className="flex flex-col items-center space-y-4 w-full">
              {/* Checkbox Banner - Government Declaration style */}
              <label
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-mm-subtle/10 border border-mm-border hover:bg-mm-subtle/25 transition-all cursor-pointer w-full text-left"
              >
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={toggleConfirm}
                  disabled={isLoading}
                  className="sr-only"
                />
                <div
                  className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-[8px] transition-all duration-200 border-2 ${
                    isConfirmed
                      ? "bg-[#2563eb] border-[#2563eb]"
                      : "bg-white border-gray-300"
                  }`}
                >
                  {isConfirmed && (
                    <svg
                      className="w-4 h-4 text-white animate-scaleIn"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={4.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className="text-xs font-semibold text-mm-dark select-none leading-snug">
                  I confirm that all the information provided is correct.
                </span>
              </label>

              <div className="flex justify-between w-full gap-4">
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={!isConfirmed || isLoading}
                  className={`w-full py-3.5 text-white font-bold rounded-xl transition-all text-sm select-none shadow-md flex items-center justify-center gap-2 ${
                    isConfirmed && !isLoading
                      ? "bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.99] cursor-pointer"
                      : "bg-gray-300 cursor-not-allowed shadow-none text-gray-500"
                  }`}
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? "Processing..." : "Continue"}
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowConfirmation(false)}
                  className={`w-full py-3 font-bold rounded-xl transition-all text-sm ${
                    isLoading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-mm-dark/5 hover:bg-mm-dark/10 text-mm-dark cursor-pointer"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <Loader
          statusText={statusText}
          elapsedTime={elapsedTime}
          progress={progress}
          showProgress={true}
        />
      ) : (
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mt-8">
        {/* Left Side: Descriptive Text with Orange-Red Gradient Accent */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-mm-dark leading-[1.15]">
              Before You Invest
              <br />
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-mm-orange to-mm-pink">
                Know What You Actually Need.
              </span>
            </h1>
            <p className="text-base text-mm-gray leading-relaxed">
              Answer a few simple questions about your business, and our AI will analyze your current position, identify growth opportunities, and recommend exactly what your business should focus on next.
            </p>
          </div>
        </div>

        {/* Right Side: Glassmorphism Card Form */}
        <div className="lg:col-span-7 relative">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-mm-orange to-mm-pink rounded-3xl blur opacity-15 -z-10"></div>

          <div className="relative bg-white/85 backdrop-blur-xl border border-mm-border shadow-2xl rounded-3xl p-6 sm:p-10 min-h-[500px] flex flex-col justify-between">

            {/* Progress Lines inside Card */}
            <div className="flex gap-2.5 w-full mb-6">
              <div className={`h-1 flex-1 transition-all duration-500 ${showTeaser || showConfirmation ? 'bg-mm-orange shadow-[0_0_8px_rgba(255,89,36,0.3)]' : 'bg-gray-200/80'
                }`}></div>
              <div className={`h-1 flex-1 transition-all duration-500 ${showConfirmation ? 'bg-mm-orange shadow-[0_0_8px_rgba(255,89,36,0.3)]' : 'bg-gray-200/80'
                }`}></div>
            </div>

            {showTeaser ? (
              /* Signup Form Card (Step 2 of 2) */
              <div className="flex flex-col h-full justify-between space-y-6 animate-fadeIn">
                <div className="space-y-6">
                  {/* Step Header */}
                  <div className="flex justify-between items-center pb-4 border-b border-mm-border/50">
                    <span className="text-xs font-bold text-mm-orange uppercase tracking-widest">
                      Create Account
                    </span>
                    <span className="text-xs font-bold text-mm-gray/60 font-sans">
                      2 of 2
                    </span>
                  </div>

                  <div className="text-center">
                    <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-mm-dark">
                      Free Sign Up & Unlock
                    </h2>
                    <p className="text-xs sm:text-sm text-mm-gray mt-2">
                      Create your free account to see your custom report instantly.
                    </p>
                  </div>

                  {/* Google Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmationAction("google_signup");
                      setShowConfirmation(true);
                    }}
                    className="w-full py-3.5 bg-white border border-mm-border hover:bg-mm-subtle/50 active:scale-[0.98] text-mm-dark font-semibold text-sm rounded-[14px] transition-all flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </button>

                  {/* Separator */}
                  <div className="flex items-center my-4">
                    <div className="grow border-t border-mm-border/60"></div>
                    <span className="px-3 text-[10px] text-mm-gray/60 font-semibold uppercase tracking-wider">or</span>
                    <div className="grow border-t border-mm-border/60"></div>
                  </div>

                  {/* Email Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setConfirmationAction("email_signup");
                      setShowConfirmation(true);
                    }}
                    className="space-y-4 text-left"
                  >
                    <div>
                      <label className="block text-[10px] font-bold tracking-wider text-mm-gray uppercase mb-1.5">
                        Email Address
                      </label>
                      <div className="flex items-center gap-3 px-4 py-3 border border-mm-border rounded-[14px] bg-mm-subtle/10 focus-within:border-mm-orange focus-within:bg-white focus-within:ring-1 focus-within:ring-mm-orange/40 transition-all">
                        <Mail className="w-5 h-5 text-mm-gray/50" strokeWidth={1.5} />
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="w-full bg-transparent border-none outline-none text-sm text-mm-dark placeholder:text-mm-gray/45 font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold tracking-wider text-mm-gray uppercase mb-1.5">
                        Password
                      </label>
                      <div className="flex items-center gap-3 px-4 py-3 border border-mm-border rounded-[14px] bg-mm-subtle/10 focus-within:border-mm-orange focus-within:bg-white focus-within:ring-1 focus-within:ring-mm-orange/40 transition-all">
                        <Lock className="w-5 h-5 text-mm-gray/50" strokeWidth={1.5} />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="w-full bg-transparent border-none outline-none text-sm text-mm-dark placeholder:text-mm-gray/45 font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-mm-gray/50 hover:text-mm-dark transition-colors focus:outline-none cursor-pointer"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" strokeWidth={1.5} />
                          ) : (
                            <Eye className="w-5 h-5" strokeWidth={1.5} />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-gradient-to-r from-mm-orange to-mm-pink text-white font-semibold text-sm rounded-[14px] shadow-lg shadow-mm-orange/15 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center"
                    >
                      Create Account & Unlock
                    </button>
                  </form>
                </div>

                {/* Footer Nav */}
                <div className="pt-4 flex justify-between items-center text-xs">
                  <button
                    onClick={() => setShowTeaser(false)}
                    className="text-mm-gray hover:text-mm-dark font-medium underline"
                  >
                    Back to Step 1
                  </button>
                  <button
                    onClick={() => setShowTeaser(false)}
                    className="text-mm-gray hover:text-mm-dark font-medium underline"
                  >
                    Cancel & Edit details
                  </button>
                </div>
              </div>
            ) : (
              /* Assessment Form Card (Step 1 of 2) */
              <>
                {/* Step Header */}
                <div className="flex justify-between items-center pb-4 border-b border-mm-border/50 mb-6">
                  <span className="text-xs font-bold text-mm-orange uppercase tracking-widest">
                    AI Business Assessment
                  </span>
                  <span className="text-xs font-bold text-mm-gray/60 font-sans">
                    1 of 2
                  </span>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-mm-dark flex items-center gap-2">
                    AI Business Assessment
                  </h2>
                  <p className="mt-2 text-sm text-mm-gray">
                    Answer the 6 business profile questions below to configure your custom AI audit.
                  </p>
                </div>

                <form onSubmit={handleAnalyzeClick} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {questions.map((q) => {
                      const isTextArea = q.type === "textarea";
                      const colSpan = isTextArea || q.id === "targetAudience" ? "sm:col-span-2" : "";

                      return (
                        <div key={q.id} className={colSpan}>
                          <label htmlFor={q.id} className="block text-xs font-bold uppercase tracking-wider text-mm-gray mb-2 flex items-center justify-between">
                            <span>{q.label}</span>
                            {!q.required && <span className="text-[10px] text-mm-gray/60 normal-case font-medium bg-mm-dark/5 px-2 py-0.5 rounded-md">Optional</span>}
                          </label>
                          {isTextArea ? (
                            <textarea
                              id={q.id}
                              name={q.id}
                              required={q.required}
                              value={formData[q.id] || ""}
                              onChange={handleChange}
                              placeholder={q.placeholder}
                              rows={3}
                              className="w-full px-4 py-3 rounded-xl border border-mm-border bg-mm-subtle/10 text-mm-dark focus:outline-none focus:ring-2 focus:ring-mm-orange/40 focus:border-mm-orange/80 transition-all duration-200 text-sm resize-y"
                            />
                          ) : q.id === "industry" ? (
                            <IndustryDropdown
                              value={formData.industry || ""}
                              onChange={(val) => setFormData(prev => ({ ...prev, industry: val }))}
                              placeholder={q.placeholder}
                              required={q.required}
                            />
                          ) : (
                            <input
                              type={q.type}
                              id={q.id}
                              name={q.id}
                              required={q.required}
                              value={formData[q.id] || ""}
                              onChange={handleChange}
                              placeholder={q.placeholder}
                              className="w-full px-4 py-3 rounded-xl border border-mm-border bg-mm-subtle/10 text-mm-dark focus:outline-none focus:ring-2 focus:ring-mm-orange/40 focus:border-mm-orange/80 transition-all duration-200 text-sm"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-mm-orange to-mm-pink text-white font-bold hover:opacity-95 shadow-md shadow-mm-orange/15 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group text-sm"
                  >
                    Analyze My Business
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
