import React, { createContext, useContext, useState, useEffect } from "react";
import { type Business } from "@/lib/schemas";
import { useMyBusinesses } from "./useDbQueries";

interface BusinessContextType {
  businesses: Business[];
  activeBusiness: Business | null;
  setActiveBusiness: (biz: Business) => void;
  loading: boolean;
  refetch: () => Promise<any>;
}

export const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({
  children,
  initialBusinesses = [],
}: {
  children: React.ReactNode;
  initialBusinesses?: Business[];
}) {
  const { data: businesses = initialBusinesses, isLoading: loading, refetch } = useMyBusinesses();

  const [activeBusiness, setActiveBusiness] = useState<Business | null>(() => {
    if (initialBusinesses.length > 0) {
      if (typeof window !== "undefined") {
        const savedId = localStorage.getItem("active_business_id");
        if (savedId) {
          const found = initialBusinesses.find((b) => b.id === savedId);
          if (found) return found;
        }
      }
      return initialBusinesses[0];
    }
    return null;
  });

  useEffect(() => {
    if (businesses && businesses.length > 0) {
      const savedId = typeof window !== "undefined" ? localStorage.getItem("active_business_id") : null;
      const found = businesses.find((b) => b.id === savedId) || businesses[0];
      setActiveBusiness((prev) => {
        // Only update if it actually changed to prevent render loops
        if (prev?.id === found.id) return prev;
        return found;
      });
    } else {
      setActiveBusiness(null);
    }
  }, [businesses]);

  const handleSetActiveBusiness = (biz: Business) => {
    setActiveBusiness(biz);
    if (typeof window !== "undefined") {
      localStorage.setItem("active_business_id", biz.id);
    }
  };

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        activeBusiness,
        setActiveBusiness: handleSetActiveBusiness,
        loading,
        refetch,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
};
