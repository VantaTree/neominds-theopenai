import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import GradientGlow from "@/components/GradientGlow";
import { MymindNav } from "@/components/mymind/MymindNav";
import { z } from "zod";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ensureUserDocumentFn, createSessionCookieFn } from "@/lib/server-functions";
import { useIsMobile } from "@/hooks/use-mobile";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: loginSearchSchema,
  head: () => ({
    meta: [
      { title: "Login" },
      { name: "description", content: "Login to your theopenai account" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-recovery if already logged in client-side
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged(async (user: User | null) => {
      if (user) {
        setIsLoading(true);
        try {
          const token = await user.getIdToken();
          const { sessionCookie } = await createSessionCookieFn({ data: { idToken: token } });
          const isSecure = window.location.protocol === "https:";
          document.cookie = `__session=${sessionCookie}; path=/; max-age=604800;${isSecure ? " Secure;" : ""} SameSite=Lax`;
          navigate({ to: search.redirect || "/dashboard" });
        } catch (err) {
          console.error("Auto-login session sync failed:", err);
        } finally {
          setIsLoading(false);
        }
      }
    });
    return unsubscribe;
  }, [navigate, search.redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    if (!auth) {
      setError("Firebase Auth is not initialized.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      const token = await user.getIdToken();

      // Request session cookie from server
      const { sessionCookie } = await createSessionCookieFn({ data: { idToken: token } });

      // Set session cookie for SSR (7 days)
      const isSecure = window.location.protocol === "https:";
      document.cookie = `__session=${sessionCookie}; path=/; max-age=604800;${isSecure ? " Secure;" : ""} SameSite=Lax`;

      // Ensure user document exists in database via server function
      await ensureUserDocumentFn({
        data: {
          user: {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            phoneNumber: user.phoneNumber,
          },
        },
      });

      // Redirect back to intended page or dashboard
      navigate({ to: search.redirect || "/dashboard" });
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) {
      setError("Firebase Auth is not initialized.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      const token = await user.getIdToken();

      // Request session cookie from server
      const { sessionCookie } = await createSessionCookieFn({ data: { idToken: token } });

      // Set session cookie for SSR (7 days)
      const isSecure = window.location.protocol === "https:";
      document.cookie = `__session=${sessionCookie}; path=/; max-age=604800;${isSecure ? " Secure;" : ""} SameSite=Lax`;

      // Ensure user document exists in database via server function
      await ensureUserDocumentFn({
        data: {
          user: {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            phoneNumber: user.phoneNumber,
          },
        },
      });

      // Redirect back to intended page or dashboard
      navigate({ to: search.redirect || "/dashboard" });
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.message || "Google Sign-In failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-mm-subtle/30 py-12 px-4 font-sans">
      <MymindNav />
      <div className="w-full max-w-[860px] bg-white rounded-[24px] shadow-2xl shadow-mm-dark/5 flex flex-col md:flex-row overflow-hidden border border-mm-border animate-fadeIn">
        {/* Left Side: Brand Hero Background Gradient */}
        <div className="w-full md:w-[45%] min-h-[200px] md:min-h-full relative overflow-hidden flex items-center justify-center p-8">
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
            glowOpacity={0.85}
            style={
              isMobile
                ? {
                    left: "50%",
                    top: "100%",
                    transform: "translate(-50%, -50%)",
                  }
                : {
                    left: "100%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }
            }
          />
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-[55%] bg-white p-8 md:p-12 flex flex-col justify-between relative z-20">
          <div>
            {/* Header */}
            <div className="text-center md:text-left mb-6">
              <h1 className="font-serif text-3xl font-semibold text-mm-dark leading-tight">
                Login
              </h1>
              <p className="text-sm text-mm-gray mt-2 font-sans font-normal">
                Welcome back! Please enter your details.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 text-xs rounded-xl bg-mm-red/10 border border-mm-red/20 text-mm-red text-center font-semibold animate-fadeIn">
                {error}
              </div>
            )}

            {/* Google Sign-in Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3.5 bg-white border border-mm-border hover:bg-mm-subtle/50 active:scale-[0.98] text-mm-dark font-semibold text-sm rounded-[14px] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-5 h-5 mr-2.5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>

            {/* Separator line */}
            <div className="flex items-center my-5">
              <div className="grow border-t border-mm-border"></div>
              <span className="px-3 text-[10px] text-mm-gray/60 font-semibold uppercase tracking-wider">
                or
              </span>
              <div className="grow border-t border-mm-border"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="w-full bg-transparent border-none outline-none text-sm text-mm-dark placeholder:text-mm-gray/45 font-semibold"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-semibold tracking-wider text-mm-gray uppercase">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs text-mm-orange hover:underline font-semibold transition-all"
                  >
                    Forgot?
                  </a>
                </div>
                <div className="flex items-center gap-3 px-4 py-3.5 border border-mm-border rounded-[14px] bg-mm-subtle/10 focus-within:border-mm-gray focus-within:bg-white focus-within:ring-1 focus-within:ring-mm-gray transition-all">
                  <Lock className="w-5 h-5 text-mm-gray/50" strokeWidth={1.5} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-mm-orange text-white font-semibold text-sm rounded-[14px] shadow-lg shadow-mm-orange/20 hover:bg-mm-orange/90 active:scale-[0.98] transition-all mt-6 cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Login
              </button>
            </form>
          </div>

          {/* Footer Navigation */}
          <div className="text-center mt-8">
            <p className="text-xs text-mm-gray font-semibold">
              Don't have an account yet?{" "}
              <Link
                to="/signup"
                className="text-mm-orange font-bold hover:underline"
              >
                Sign up here.
              </Link>
            </p>
            <div className="flex justify-center gap-3 mt-6 text-[10px] text-mm-gray/50 font-medium">
              <a href="#" className="hover:text-mm-gray transition-colors">
                Terms of Use
              </a>
              <span>|</span>
              <a href="#" className="hover:text-mm-gray transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
