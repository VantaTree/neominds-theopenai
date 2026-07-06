import { useState, useEffect, useRef } from "react";
import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
  redirect,
} from "@tanstack/react-router";
import ClientAside from "@/components/client/ClientAside";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";

export const Route = createFileRoute("/_client")({
  component: RouteComponent,
});

function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [prevChildren, setPrevChildren] = useState<React.ReactNode>(null);
  const [animating, setAnimating] = useState(false);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      setPrevChildren(displayChildren);
      setDisplayChildren(children);
      setAnimating(true);
      prevPath.current = location.pathname;
    } else {
      setDisplayChildren(children);
    }
  }, [location.pathname, children]);

  const handleAnimationEnd = () => {
    setAnimating(false);
    setPrevChildren(null);
  };

  return (
    <div className="relative w-full">
      <style>{`
        @keyframes slideOutToBottom {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(60px);
            opacity: 0;
          }
        }
        @keyframes slideInFromAbove {
          0% {
            transform: translateY(-60px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .page-exit {
          animation: slideOutToBottom 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          pointer-events: none;
        }
        .page-enter {
          animation: slideInFromAbove 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {animating ? (
        <div className="relative w-full min-h-[60vh] overflow-hidden">
          {/* Old Page */}
          <div className="absolute inset-x-0 top-0 w-full page-exit">
            {prevChildren}
          </div>
          {/* New Page */}
          <div
            className="w-full page-enter"
            onAnimationEnd={handleAnimationEnd}
          >
            {displayChildren}
          </div>
        </div>
      ) : (
        <div className="w-full">{displayChildren}</div>
      )}
    </div>
  );
}

function RouteComponent() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check initial auth state synchronously first if possible
    if (auth && auth.currentUser) {
      setCurrentUser(auth.currentUser);
      setInitialized(true);
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u);
      setInitialized(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Only redirect if auth has finished checking and no user is found
    if (initialized && !currentUser) {
      navigate({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  }, [initialized, currentUser, navigate, location.href]);

  if (typeof window === "undefined" || !initialized || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-mm-orange/20 border-t-mm-orange rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white text-mm-dark font-sans flex-col md:flex-row">
      {/* Responsive Sidebar & Mobile Header Bar */}
      <ClientAside />

      {/* Main Viewport Panel */}
      <div className="flex-1 flex flex-col min-w-0 bg-mm-bg-wrap">
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-12 md:py-10">
          <PageTransitionWrapper>
            <Outlet />
          </PageTransitionWrapper>
        </main>
      </div>
    </div>
  );
}
