import { useState, useEffect, useRef } from "react";
import {
  createFileRoute,
  Outlet,
  useLocation,
  redirect,
} from "@tanstack/react-router";
import ClientNav from "../../components/client/ClientNav";
import ClientBottomLinks from "../../components/client/ClientBottomLinks";
import { checkUserRoleFn, getMyBusinessesFn } from "@/lib/server-functions";
import { BusinessProvider } from "@/hooks/use-business";

export const Route = createFileRoute("/_client")({
  beforeLoad: async ({ context, location }) => {
    let userRole: string | null = null;
    let isAuthenticated = false;

    try {
      const res = await checkUserRoleFn();
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
          });
        }
      } else {
        throw redirect({
          to: "/login",
          search: { redirect: location.pathname },
        });
      }
    }

    if (userRole === "admin") {
      throw redirect({
        to: "/admin",
      });
    }
    try {
      const businesses = await getMyBusinessesFn();
      if (!businesses || businesses.length === 0) {
        throw redirect({
          to: "/assessment",
        });
      }
    } catch (e: any) {
      if (e && (e.to || e.isRedirect || typeof e.then === "function")) {
        throw e;
      }
      console.error("Error fetching user businesses in beforeLoad:", e);
    }
  },
  loader: async () => {
    try {
      const data = await getMyBusinessesFn();
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
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [prevChildren, setPrevChildren] = useState<React.ReactNode>(null);
  const [animating, setAnimating] = useState(false);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      const isChatTransition =
        location.pathname.startsWith("/chat") &&
        prevPath.current.startsWith("/chat");

      if (isChatTransition) {
        setDisplayChildren(children);
        prevPath.current = location.pathname;
      } else {
        setPrevChildren(displayChildren);
        setDisplayChildren(children);
        setAnimating(true);
        prevPath.current = location.pathname;
      }
    } else {
      setDisplayChildren(children);
    }
  }, [location.pathname, children]);

  const handleAnimationEnd = () => {
    setAnimating(false);
    setPrevChildren(null);
  };

  const isChatRoute = location.pathname.startsWith("/chat");

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
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

    if (isMobile) {
      return (
        <div className="h-dvh w-screen bg-[#F9FAFC] flex flex-col font-sans relative overflow-hidden">
          <ClientNav />
          <div className="h-16 shrink-0" />

          <main className="flex-1 w-full flex flex-col overflow-y-auto pb-20">
            <PageTransitionWrapper>
              <Outlet />
            </PageTransitionWrapper>
          </main>

          <ClientBottomLinks />
        </div>
      );
    }

    return (
      <div
        className={`${isChatRoute ? "h-screen overflow-hidden" : "min-h-screen"} bg-[#F9FAFC] flex flex-col font-sans`}
      >
        <ClientNav />
        <div className="h-16 shrink-0" />
        <main
          className={`flex-1 w-full flex flex-col ${isChatRoute ? "overflow-hidden" : ""}`}
        >
          <PageTransitionWrapper>
            <Outlet />
          </PageTransitionWrapper>
        </main>
      </div>
    );
  };

  return (
    <BusinessProvider initialBusinesses={initialBusinesses}>
      {renderContent()}
    </BusinessProvider>
  );
}
