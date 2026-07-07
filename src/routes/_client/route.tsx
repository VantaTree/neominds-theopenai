import { useState, useEffect, useRef } from "react";
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import ClientDesktopNav from "../../components/client/ClientDesktopNav";
import ClientMobileNav from "../../components/client/ClientMobileNav";
import ClientBottomLinks from "../../components/client/ClientBottomLinks";

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
          <div className="w-full page-enter" onAnimationEnd={handleAnimationEnd}>
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
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    setIsMobile(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#F9FAFC] flex flex-col font-sans relative pb-16">
        <ClientMobileNav />

        <main className="flex-1 w-full flex flex-col overflow-y-auto">
          <PageTransitionWrapper>
            <Outlet />
          </PageTransitionWrapper>
        </main>

        <ClientBottomLinks />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFC] flex flex-col font-sans">
      <ClientDesktopNav />
      <div className="h-15 shrink-0" />
      <main className="flex-1 w-full flex flex-col">
        <PageTransitionWrapper>
          <Outlet />
        </PageTransitionWrapper>
      </main>
    </div>
  );
}