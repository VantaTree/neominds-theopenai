import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — theopenai" },
      { name: "description", content: "Create your account on theopenai" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signup submitted:", { email, password });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF8FA] py-12 px-4 font-sans">
      <div className="w-full max-w-[860px] bg-white rounded-[24px] shadow-[0_24px_70px_rgba(0,0,0,0.06)] flex flex-col md:flex-row overflow-hidden border border-mm-border">
        {/* Left Side: Brand Hero Background Gradient */}
        <div
          className="w-full md:w-[45%] min-h-[200px] md:min-h-full relative overflow-hidden flex items-center justify-center p-8"
          style={{
            background: `
              radial-gradient(ellipse 55% 80% at 8% 50%, rgba(255, 110, 40, 0.82) 0%, transparent 60%),
              radial-gradient(ellipse 55% 80% at 92% 50%, rgba(255, 155, 125, 0.72) 0%, transparent 60%),
              radial-gradient(ellipse 52% 62% at 50% 48%, #ffffff 0%, rgba(255, 242, 236, 0.96) 42%, transparent 72%),
              linear-gradient(155deg, #ffd4b8 0%, #ffe8d8 35%, #ffc8b4 100%)
            `,
          }}
        >
          {/* Subtle Dotted Pattern Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#E2E6EE_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-70 pointer-events-none" />
          
          {/* Glowing Filled Orange Circle */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 md:bottom-auto md:left-auto md:right-0 md:top-1/2 md:translate-x-1/2 md:-translate-y-1/2 w-[240px] h-[240px] md:w-[280px] md:h-[280px] rounded-full border-[6px] border-white bg-[#FF5924] shadow-[0_0_35px_rgba(255,89,36,0.45)] z-10 pointer-events-none" />
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
              {/* Email Input */}
              <div>
                <label className="block text-[10px] font-semibold tracking-wider text-mm-gray uppercase mb-1.5">
                  Email Address
                </label>
                <div className="flex items-center gap-3 px-4 py-3.5 border border-mm-border rounded-[14px] bg-[#FCFBFE] focus-within:border-mm-gray focus-within:bg-white focus-within:ring-1 focus-within:ring-mm-gray transition-all">
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
                <div className="flex items-center gap-3 px-4 py-3.5 border border-mm-border rounded-[14px] bg-[#FCFBFE] focus-within:border-mm-gray focus-within:bg-white focus-within:ring-1 focus-within:ring-mm-gray transition-all">
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
                className="w-full py-4 bg-[#FF5924] text-white font-semibold text-sm rounded-[14px] shadow-[0_8px_20px_rgba(255,89,36,0.3)] hover:bg-[#e04513] active:scale-[0.98] transition-all mt-6 cursor-pointer"
              >
                Sign Up
              </button>
            </form>
          </div>

          {/* Footer Navigation */}
          <div className="text-center mt-8">
            <p className="text-xs text-mm-gray">
              Already have an account?{" "}
              <Link to="/login" className="text-[#FF5924] font-semibold hover:underline">
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
