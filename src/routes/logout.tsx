import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export const Route = createFileRoute("/logout")({
  head: () => ({
    meta: [
      { title: "Logging Out..." },
    ],
  }),
  component: LogoutPage,
});

function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    async function performLogout() {
      try {
        if (auth) {
          await signOut(auth);
        }
      } catch (err) {
        console.error("Error signing out:", err);
      } finally {
        // Clear session cookie
        document.cookie = `__session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        
        // Redirect to login page
        navigate({ to: "/login" });
      }
    }

    performLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-mm-bg-wrap font-sans">
      <div className="text-center p-8 bg-white rounded-2xl border border-mm-border shadow-lg max-w-sm w-full mx-4">
        <div className="w-10 h-10 border-4 border-mm-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-lg font-bold text-mm-dark">Logging Out</h2>
        <p className="text-sm text-mm-gray mt-1">Please wait while we clear your session...</p>
      </div>
    </div>
  );
}
