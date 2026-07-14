import React, { createContext, useContext, useState, useEffect } from "react";
import { type Business } from "@/lib/schemas";
import { getMyBusinessesFn } from "@/lib/server-functions";

interface BusinessContextType {
  businesses: Business[];
  activeBusiness: Business | null;
  setActiveBusiness: (biz: Business) => void;
  loading: boolean;
  refetch: () => Promise<void>;
}

export const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({
  children,
  initialBusinesses = [],
}: {
  children: React.ReactNode;
  initialBusinesses?: Business[];
}) {
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(
    initialBusinesses.length > 0 ? initialBusinesses[0] : null
  );
  const [loading, setLoading] = useState(initialBusinesses.length === 0);

  useEffect(() => {
    if (typeof window !== "undefined" && initialBusinesses.length > 0) {
      const savedId = localStorage.getItem("active_business_id");
      if (savedId) {
        const found = initialBusinesses.find((b) => b.id === savedId);
        if (found) {
          setActiveBusiness(found);
        }
      }
    }
  }, [initialBusinesses]);

  const fetchBusinesses = async () => {
    try {
      if (businesses.length === 0) {
        setLoading(true);
      }
      const data = await getMyBusinessesFn();
      setBusinesses(data);
      if (data && data.length > 0) {
        const savedId = typeof window !== "undefined" ? localStorage.getItem("active_business_id") : null;
        const found = data.find((b) => b.id === savedId) || data[0];
        setActiveBusiness(found);
      } else {
        setActiveBusiness(null);
      }
    } catch (error) {
      console.error("Error loading businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

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
        refetch: fetchBusinesses,
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
