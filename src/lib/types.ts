// ============================================================
// Central TypeScript types for all Firestore collections
// ============================================================

export interface Profile {
  uid: string;
  planId: string;
  planStart: number;
  planEnd: number | null;
  quota: { reports: number; storageGb: number };
  used: { reports: number; storageGb: number };
  preferences: { language: string; darkMode: boolean };
}

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  billedYearly: number;
  features: string[];
  maxReports: number;
  maxStorageGb: number;
  supportLevel: "basic" | "priority" | "dedicated";
  stripeProductId?: string;
  active: boolean;
}

export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";

export interface Subscription {
  id: string;
  uid: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: number;
  endDate: number | null;
  billingCycle: "monthly" | "yearly";
  amount: number;
  notes?: string;
}

export type ReportStatus = "ready" | "processing" | "failed";

export interface Report {
  id: string;
  uid: string;
  projectId?: string;
  title: string;
  createdAt: number;
  content: string;
  status: ReportStatus;
  metadata: { tokensUsed: number; durationMs: number; agentVersion?: string };
}

export interface AuditLogEntry {
  id: string;
  uid: string;
  userName?: string;
  action: string;
  payload: Record<string, any>;
  timestamp: number;
}

export interface AdminConfig {
  maintenanceMode: boolean;
  featureFlags: Record<string, boolean>;
  welcomeMessage: string;
  updatedAt: number;
}
