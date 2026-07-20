import { useState, useEffect, useRef } from "react";
import {
  createFileRoute,
  Outlet,
  useLocation,
  redirect,
  useMatches,
  useRouterState,
} from "@tanstack/react-router";
import ClientNav from "../../components/client/ClientNav";
import ClientBottomLinks from "../../components/client/ClientBottomLinks";
import { checkUserRoleFn, getMyBusinessesFn } from "@/lib/server-functions";
import { BusinessProvider } from "@/hooks/use-business";

export const Route = createFileRoute("/_client")({
  beforeLoad: async ({ context, location }: { context: any; location: any }) => {
    let userRole: string | null = null;
    let isAuthenticated = false;

    try {
      const res = await context.queryClient.ensureQueryData({
        queryKey: ["userRole"],
        queryFn: async () => {
          const r = await checkUserRoleFn();
          return r;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
      });
      if (res && res.role) {
        userRole = res.role;
        isAuthenticated = true;
      }
    } catch (e) {
      // Ignore session check error, fall back to client auth
    }

    if (!isAuthenticated) {
      if (typeof window !== "undefined") {
        await context.auth.waitUntilInitialized();
        if (!context.auth.user) {
          throw redirect({
            to: "/login",
            search: { redirect: location.pathname },
          } as any);
        }
      } else {
        throw redirect({
          to: "/login",
          search: { redirect: location.pathname },
        } as any);
      }
    }

    if (userRole === "admin") {
      throw redirect({
        to: "/admin",
      } as any);
    }
    try {
      const businesses = await context.queryClient.ensureQueryData({
        queryKey: ["myBusinesses"],
        queryFn: async () => {
          return await getMyBusinessesFn();
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
      });
      if (!businesses || businesses.length === 0) {
        throw redirect({
          to: "/assessment",
        } as any);
      }
    } catch (e: any) {
      if (e && (e.to || e.isRedirect || typeof e.then === "function")) {
        throw e;
      }
      console.error("Error fetching user businesses in beforeLoad:", e);
    }
  },
  loader: async ({ context }: { context: any }) => {
    try {
      const data = await context.queryClient.ensureQueryData({
        queryKey: ["myBusinesses"],
        queryFn: async () => {
          return await getMyBusinessesFn();
        },
        staleTime: 1000 * 60 * 5,
      });
      return {
        initialBusinesses: data || [],
      };
    } catch (e) {
      return {
        initialBusinesses: [],
      };
    }
  },
  component: RouteComponent,
});

function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const matches = useMatches();
  const leafMatch = matches[matches.length - 1];
  const currentPath = leafMatch?.pathname || "/";
  
  const [displayChildren, setDisplayChildren] = useState(children);
  const [prevChildren, setPrevChildren] = useState<React.ReactNode>(null);
  const [animating, setAnimating] = useState(false);
  const prevPath = useRef(currentPath);

  useEffect(() => {
    if (currentPath !== prevPath.current) {
      const isChatTransition =
        currentPath.startsWith("/chat") &&
        prevPath.current.startsWith("/chat");

      if (isChatTransition) {
        setDisplayChildren(children);
        prevPath.current = currentPath;
      } else {
        setPrevChildren(displayChildren);
        setDisplayChildren(children);
        setAnimating(true);
        prevPath.current = currentPath;
      }
    } else {
      setDisplayChildren(children);
    }
  }, [currentPath, children]);

  const handleAnimationEnd = () => {
    setAnimating(false);
    setPrevChildren(null);
  };

  const isChatRoute = currentPath.startsWith("/chat");

  return (
    <div
      className={`relative w-full h-full flex-1 flex flex-col ${isChatRoute ? "overflow-hidden" : ""}`}
    >
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
        <div className="relative w-full h-full flex-1 overflow-hidden">
          {/* Old Page */}
          <div
            className={`absolute inset-x-0 top-0 w-full h-full flex flex-col page-exit ${isChatRoute ? "overflow-hidden" : ""}`}
          >
            {prevChildren}
          </div>
          {/* New Page */}
          <div
            className={`w-full h-full flex flex-col page-enter ${isChatRoute ? "overflow-hidden" : ""}`}
            onAnimationEnd={handleAnimationEnd}
          >
            {displayChildren}
          </div>
        </div>
      ) : (
        <div
          className={`w-full h-full flex-1 flex flex-col ${isChatRoute ? "overflow-hidden" : ""}`}
        >
          {displayChildren}
        </div>
      )}
    </div>
  );
}

function RouteComponent() {
  const { initialBusinesses } = Route.useLoaderData();
  const location = useLocation();
  const routerState = useRouterState();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia("(max-width: 768px)");
    setIsMobile(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const isChatDomainMobile =
    isMobile &&
    location.pathname.startsWith("/chat/") &&
    location.pathname !== "/chat";
  const isChatRoute = location.pathname.startsWith("/chat");
  const isRouterLoading = routerState.status === "pending";
  const isAddRoute = location.pathname.startsWith("/add");

  const renderContent = () => {
    if (isChatDomainMobile) {
      return (
        <div className="h-dvh w-screen bg-white flex flex-col font-sans relative overflow-hidden">
          <main className="flex-1 w-full flex flex-col overflow-hidden">
            <PageTransitionWrapper>
              <Outlet />
            </PageTransitionWrapper>
          </main>
        </div>
      );
    }

    if (isAddRoute) {
      return (
        <div className="min-h-screen bg-[#F9FAFC] flex flex-col font-sans">
          <main className="flex-1 w-full flex flex-col">
            <PageTransitionWrapper>
              <Outlet />
            </PageTransitionWrapper>
          </main>
        </div>
      );
    }

    // Unify mobile and desktop layouts to prevent unmounting/remounting of ClientNav
    const containerClasses = isMobile
      ? "h-dvh w-screen bg-[#F9FAFC] flex flex-col font-sans relative overflow-hidden"
      : `${isChatRoute ? "h-screen overflow-hidden" : "min-h-screen"} bg-[#F9FAFC] flex flex-col font-sans`;

    const mainClasses = isMobile
      ? "flex-1 w-full flex flex-col overflow-y-auto pb-20"
      : `flex-1 w-full flex flex-col ${isChatRoute ? "overflow-hidden" : ""}`;

    return (
      <div className={containerClasses}>
        <ClientNav />
        <div className="h-16 shrink-0" />
        <main className={mainClasses}>
          <PageTransitionWrapper>
            <Outlet />
          </PageTransitionWrapper>
        </main>
        {isMobile && <ClientBottomLinks />}
      </div>
    );
  };

  return (
    <BusinessProvider initialBusinesses={initialBusinesses}>
      <style>{`
        @keyframes loadingBar {
          0% { width: 0%; }
          50% { width: 70%; }
          90% { width: 90%; }
          100% { width: 100%; }
        }
        .top-progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, #F39C12, #F1C40F, #E67E22);
          z-index: 9999;
          animation: loadingBar 2s cubic-bezier(0.1, 0.8, 0.1, 1) forwards;
        }
      `}</style>
      {mounted && isRouterLoading && <div className="top-progress-bar" />}
      {renderContent()}
    </BusinessProvider>
  );
}
