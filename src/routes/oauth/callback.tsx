import React, { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Loader2, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { exchangeAuthCodeFn } from "@/lib/server-functions";

// Validation schema for incoming OAuth query parameters
const OAuthSearchSchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  error: z.string().optional(),
});

export const Route = createFileRoute("/oauth/callback")({
  validateSearch: OAuthSearchSchema,
  component: OAuthCallbackComponent,
});

function OAuthCallbackComponent() {
  const { code, state, error } = Route.useSearch();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function handleExchange() {
      if (error) {
        setStatus("error");
        setErrorMessage(error);
        toast.error(`Integration failed: ${error}`);
        return;
      }

      if (!code || !state) {
        setStatus("error");
        setErrorMessage("Missing authorization code or state validation parameters.");
        toast.error("Integration failed: Missing code or state parameters.");
        return;
      }

      try {
        // Decode state parameter (base64 JSON containing platform & businessId)
        const decodedState = JSON.parse(window.atob(state));
        const { platform, businessId } = decodedState;

        if (!platform || !businessId) {
          throw new Error("Invalid state parameters: missing platform or business ID.");
        }

        // Call the secure TanStack Start Server Function to save hashed credentials
        await exchangeAuthCodeFn({
          data: {
            code,
            platform,
            businessId,
            origin: window.location.origin,
          },
        });

        setStatus("success");
        toast.success(`Successfully integrated with ${platform === "google" ? "Google" : "Meta"}!`);

        // Automatically redirect back to the dashboard after a short delay
        setTimeout(() => {
          navigate({ to: "/dashboard" });
        }, 2000);
      } catch (err: any) {
        console.error("OAuth callback exchange failed:", err);
        setStatus("error");
        setErrorMessage(err.message || "Failed to finalize integration token exchange.");
        toast.error("Authentication integration failed. Please try again.");
      }
    }

    handleExchange();
  }, [code, state, error, navigate]);

  return (
    <div className="min-h-screen bg-mm-bg-wrap flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-white border border-mm-border rounded-3xl p-8 max-w-md w-full shadow-[0_8px_30px_rgba(0,0,0,0.015)] text-center space-y-6 animate-in fade-in zoom-in-95">
        {status === "loading" && (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-full bg-mm-subtle flex items-center justify-center">
                <Loader2 className="h-7 w-7 text-mm-orange animate-spin" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-mm-dark">Connecting Service</h2>
            <p className="text-sm text-mm-gray">
              Please wait while we establish a secure connection to fetch your analytics...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-mm-dark">Connection Successful</h2>
            <p className="text-sm text-mm-gray">
              Your service is connected! Redirecting you back to your client dashboard...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-mm-dark">Connection Failed</h2>
            <p className="text-sm text-red-500 font-medium">{errorMessage}</p>
            <p className="text-xs text-mm-gray max-w-xs">
              Make sure you have approved all required profile permissions during authorization.
            </p>
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="mt-2 flex items-center gap-1.5 px-4.5 py-2 bg-mm-dark text-white hover:bg-mm-charcoal font-bold text-[13px] rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Dashboard</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
