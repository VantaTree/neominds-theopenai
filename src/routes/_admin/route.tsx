import { useState, useEffect, useRef } from "react";
import { createFileRoute, Outlet, useLocation, redirect } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import AdminAside from "@/components/admin/AdminAside";
import { verifyAdminAccessFn } from "@/lib/server-functions";

export const Route = createFileRoute("/_admin")({
  beforeLoad: async ({ context, location }) => {
    let isAdmin = false;
    let isAuthenticated = false;

    try {
      const res = await verifyAdminAccessFn();
      if (res && res.authorized) {
        isAdmin = true;
        isAuthenticated = true;
      }
    } catch (e) {
      // Ignore, fall back to client checks
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
        const res = await verifyAdminAccessFn();
        if (!res.authorized) {
          throw redirect({
            to: "/dashboard",
          });
        }
      } else {
        throw redirect({
          to: "/login",
          search: { redirect: location.pathname },
        });
      }
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

  const is0PadRoute = location.pathname.startsWith("/admin/chat") || location.pathname.startsWith("/admin/projects");

  return (
    <div className={`relative w-full ${is0PadRoute ? "h-full flex flex-col overflow-hidden" : ""}`}>
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
        <div className={`relative w-full overflow-hidden ${is0PadRoute ? "flex-1 flex flex-col" : "min-h-[60vh]"}`}>
          {/* Old Page */}
          <div className={`absolute inset-x-0 top-0 w-full page-exit ${is0PadRoute ? "h-full flex flex-col overflow-hidden" : ""}`}>
            {prevChildren}
          </div>
          {/* New Page */}
          <div
            className={`w-full page-enter ${is0PadRoute ? "flex-1 flex flex-col h-full overflow-hidden" : ""}`}
            onAnimationEnd={handleAnimationEnd}
          >
            {displayChildren}
          </div>
        </div>
      ) : (
        <div className={`w-full ${is0PadRoute ? "flex-1 flex flex-col h-full overflow-hidden" : ""}`}>{displayChildren}</div>
      )}
    </div>
  );
}

function RouteComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  const is0PadRoute = location.pathname.startsWith("/admin/chat") || location.pathname.startsWith("/admin/projects");
  // const overflowRoute = location.pathname.startsWith("/admin/projects")

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`flex bg-white text-mm-dark font-sans flex-col md:flex-row ${is0PadRoute ? "h-dvh overflow-hidden" : "min-h-screen"}`}>
        {/* Responsive Sidebar & Mobile Header Bar */}
        <AdminAside />

        {/* Main Viewport Panel */}
        <div className={`flex-1 flex flex-col min-w-0 bg-mm-bg-wrap ${is0PadRoute ? "h-full overflow-hidden" : ""}`}>
          {/* Content Area */}
          <main className={`flex-1 ${is0PadRoute ? "h-full overflow-hidden flex flex-col" : "overflow-y-auto px-6 py-8 md:px-12 md:py-10"}`}>
            <PageTransitionWrapper>
              <Outlet />
            </PageTransitionWrapper>
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
