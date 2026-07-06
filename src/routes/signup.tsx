import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import GradientGlow from "@/components/GradientGlow";
import { MymindNav } from "@/components/mymind/MymindNav";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up" },
      { name: "description", content: "Create your account on theopenai" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    setError("");

    // Simulate API request
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem("audit_unlocked", "true");
      alert(`Signed up successfully with: ${email}`);
      navigate({ to: "/assessment" });
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--color-mm-subtle)]/30 py-12 px-4 font-sans">
      <MymindNav/>
      <div className="w-full max-w-[860px] bg-white rounded-[24px] shadow-2xl shadow-mm-dark/5 flex flex-col md:flex-row overflow-hidden border border-mm-border">
        {/* Left Side: Brand Hero Background Gradient */}
        <div className="w-full md:w-[45%] min-h-[200px] md:min-h-full relative overflow-hidden flex items-center justify-center p-8">
          {/* Glowing Filled Orange Circle using GradientGlow */}
          <GradientGlow
            position="absolute"
            size="380px"
            color1="var(--color-mm-orange)"
            color2="var(--color-mm-pink)"
            color3="var(--color-mm-yellow)"
            speed="12s"
            blur="10px"
            inset="-20%"
            maskCenter={true}
            glowOpacity={0.85} // Make the colors shine and glow brightly
            style={
              isMobile
                ? { left: "50%", top: "100%", transform: "translate(-50%, -50%)" }
                : { left: "100%", top: "50%", transform: "translate(-50%, -50%)" }
            }
          />
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-[55%] bg-white p-8 md:p-12 flex flex-col justify-between relative z-20">
          <div>
            {/* Header */}
            <div className="text-center md:text-left mb-8">
              <h1 className="font-serif text-3xl font-semibold text-mm-dark leading-tight">Create Account</h1>
              <p className="text-sm text-mm-gray mt-2 font-sans font-normal">
                Please fill in details to create your account.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-xs rounded-xl bg-mm-red/10 border border-mm-red/20 text-mm-red text-center font-semibold animate-fadeIn">
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-[10px] font-semibold tracking-wider text-mm-gray uppercase mb-1.5">
                  Email Address
                </label>
                <div className="flex items-center gap-3 px-4 py-3.5 border border-mm-border rounded-[14px] bg-mm-subtle/10 focus-within:border-mm-gray focus-within:bg-white focus-within:ring-1 focus-within:ring-mm-gray transition-all">
                  <Mail className="w-5 h-5 text-mm-gray/50" strokeWidth={1.5} />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm text-mm-dark placeholder:text-mm-gray/45"
                  />
                </div>
              </div>

              {/* Password Input (No "Forgot?" for signup) */}
              <div>
                <label className="block text-[10px] font-semibold tracking-wider text-mm-gray uppercase mb-1.5">
                  Password
                </label>
                <div className="flex items-center gap-3 px-4 py-3.5 border border-mm-border rounded-[14px] bg-mm-subtle/10 focus-within:border-mm-gray focus-within:bg-white focus-within:ring-1 focus-within:ring-mm-gray transition-all">
                  <Lock className="w-5 h-5 text-mm-gray/50" strokeWidth={1.5} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm text-mm-dark placeholder:text-mm-gray/45"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-mm-gray/50 hover:text-mm-dark transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" strokeWidth={1.5} />
                    ) : (
                      <Eye className="w-5 h-5" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-mm-orange text-white font-semibold text-sm rounded-[14px] shadow-lg shadow-mm-orange/20 hover:bg-mm-orange/90 active:scale-[0.98] transition-all mt-6 cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin mr-2" />
                    Signing Up...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>
          </div>

          {/* Footer Navigation */}
          <div className="text-center mt-8">
            <p className="text-xs text-mm-gray">
              Already have an account?{" "}
              <Link to="/login" className="text-mm-orange font-semibold hover:underline">
                Sign in here.
              </Link>
            </p>
            <div className="flex justify-center gap-3 mt-6 text-[10px] text-mm-gray/50 font-medium">
              <a href="#" className="hover:text-mm-gray transition-colors">Terms of Use</a>
              <span>|</span>
              <a href="#" className="hover:text-mm-gray transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
