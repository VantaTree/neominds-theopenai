/**
 * Centralized Query Keys Factory for all database collections and queries.
 * Use these keys in TanStack Query to ensure consistent query keys and
 * clean cache invalidations.
 * This file is isomorphic and safe to import on both client and server.
 */
export const dbKeys = {
  all: ["db"] as const,

  users: () => [...dbKeys.all, "users"] as const,
  user: (id: string) => [...dbKeys.users(), id] as const,

  businesses: () => [...dbKeys.all, "businesses"] as const,
  business: (id: string) => [...dbKeys.businesses(), id] as const,
  businessesByUser: (userId: string) => [...dbKeys.businesses(), "byUser", userId] as const,

  projects: () => [...dbKeys.all, "projects"] as const,

  payments: () => [...dbKeys.all, "payments"] as const,

  notificationSettings: () => [...dbKeys.all, "notificationSettings"] as const,

  profiles: () => [...dbKeys.all, "profiles"] as const,
  profile: (uid: string) => [...dbKeys.profiles(), uid] as const,

  plans: () => [...dbKeys.all, "plans"] as const,

  subscriptions: () => [...dbKeys.all, "subscriptions"] as const,
  userSubscription: (uid: string) => [...dbKeys.subscriptions(), "byUser", uid] as const,

  reports: () => [...dbKeys.all, "reports"] as const,
  reportsByUser: (uid: string) => [...dbKeys.reports(), "byUser", uid] as const,

  auditLogs: (limit?: number) => [...dbKeys.all, "auditLogs", { limit }] as const,

  blogs: (onlyPublished?: boolean) => [...dbKeys.all, "blogs", { onlyPublished }] as const,
  blog: (slug: string) => [...dbKeys.all, "blog", slug] as const,
} as const;
