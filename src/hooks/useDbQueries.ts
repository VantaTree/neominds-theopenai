import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dbKeys } from "@/lib/db-keys";
import {
  getUsersFn,
  getUserFn,
  saveUserFn,
  deleteUserFn,
  ensureUserDocumentFn,
  getBusinessesFn,
  getBusinessFn,
  getMyBusinessesFn,
  getBusinessesByUserFn,
  saveBusinessFn,
  deleteBusinessFn,
  getProjectsFn,
  getProjectsByBusinessFn,
  saveProjectFn,
  deleteProjectFn,
  getPaymentsFn,
  savePaymentsFn,
  getNotificationSettingsFn,
  saveNotificationSettingsFn,
  getProfileFn,
  saveProfileFn,
  getPlansFn,
  savePlanFn,
  deletePlanFn,
  getSubscriptionsFn,
  getUserSubscriptionFn,
  saveSubscriptionFn,
  getReportsFn,
  getReportsByUserFn,
  getReportsByBusinessFn,
  saveReportFn,
  deleteReportFn,
  getAuditLogFn,
  logAuditEventFn,
  testFirestoreConnectionFn,
  seedDatabaseFn,
} from "@/lib/server-functions";
import type {
  User,
  Business,
  Project,
  Payment,
  Profile,
  Plan,
  Subscription,
  Report,
  AuditLog,
} from "@/lib/schemas";

// ==================== USERS ====================

export const useUsersList = () => {
  return useQuery<User[]>({
    queryKey: dbKeys.users(),
    queryFn: async () => {
      const res = await getUsersFn();
      return res as User[];
    },
  });
};

export const useUser = (id: string, options?: { enabled?: boolean }) => {
  return useQuery<User | null>({
    queryKey: dbKeys.user(id),
    queryFn: async () => {
      const res = await getUserFn({ data: id });
      return res as User | null;
    },
    enabled: options?.enabled ?? !!id,
  });
};

export const useSaveUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: User) => {
      const res = await saveUserFn({ data: user });
      return res;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dbKeys.users() });
      queryClient.invalidateQueries({ queryKey: dbKeys.user(variables.id) });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteUserFn({ data: id });
      return res;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dbKeys.users() });
      queryClient.invalidateQueries({ queryKey: dbKeys.user(variables) });
    },
  });
};

export const useEnsureUserDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { user: any }) => {
      const res = await ensureUserDocumentFn({ data: payload });
      return res;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dbKeys.users() });
      if (variables.user?.uid) {
        queryClient.invalidateQueries({ queryKey: dbKeys.user(variables.user.uid) });
      }
    },
  });
};

// ==================== BUSINESSES ====================

export const useBusinessesList = () => {
  return useQuery<Business[]>({
    queryKey: dbKeys.businesses(),
    queryFn: async () => {
      const res = await getBusinessesFn();
      return res as Business[];
    },
  });
};

export const useMyBusinesses = (options?: { enabled?: boolean }) => {
  return useQuery<Business[]>({
    queryKey: ["myBusinesses"],
    queryFn: async () => {
      const res = await getMyBusinessesFn();
      return res as Business[];
    },
    enabled: options?.enabled,
  });
};

export const useBusiness = (id: string, options?: { enabled?: boolean }) => {
  return useQuery<Business | null>({
    queryKey: dbKeys.business(id),
    queryFn: async () => {
      const res = await getBusinessFn({ data: id });
      return res as Business | null;
    },
    enabled: options?.enabled ?? !!id,
  });
};

export const useBusinessesByUser = (userId: string, options?: { enabled?: boolean }) => {
  return useQuery<Business[]>({
    queryKey: dbKeys.businessesByUser(userId),
    queryFn: async () => {
      const res = await getBusinessesByUserFn({ data: userId });
      return res as Business[];
    },
    enabled: options?.enabled ?? !!userId,
  });
};

export const useSaveBusiness = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (business: Business) => {
      const res = await saveBusinessFn({ data: business });
      return res;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dbKeys.businesses() });
      queryClient.invalidateQueries({ queryKey: dbKeys.business(variables.id) });
      const uId =
        typeof variables.userId === "string"
          ? variables.userId
          : (variables.userId as any)?.id;
      if (uId) {
        queryClient.invalidateQueries({ queryKey: dbKeys.businessesByUser(uId) });
      }
    },
  });
};

export const useDeleteBusiness = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteBusinessFn({ data: id });
      return res;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dbKeys.businesses() });
      queryClient.invalidateQueries({ queryKey: dbKeys.business(variables) });
      // Invalidate byUser prefix to clear lists for any user
      queryClient.invalidateQueries({ queryKey: [...dbKeys.businesses(), "byUser"] });
    },
  });
};

// ==================== PROJECTS ====================

export const useProjectsList = () => {
  return useQuery<Project[]>({
    queryKey: dbKeys.projects(),
    queryFn: async () => {
      const res = await getProjectsFn();
      return res as Project[];
    },
  });
};

export const useProjectsByBusiness = (businessId: string, options?: { enabled?: boolean }) => {
  return useQuery<Project[]>({
    queryKey: dbKeys.projectsByBusiness(businessId),
    queryFn: async () => {
      const res = await getProjectsByBusinessFn({ data: businessId });
      return res as Project[];
    },
    enabled: options?.enabled ?? !!businessId,
  });
};

export const useSaveProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (project: Project) => {
      const res = await saveProjectFn({ data: project as any });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dbKeys.projects() });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteProjectFn({ data: id });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dbKeys.projects() });
    },
  });
};

// ==================== PAYMENTS ====================

export const usePaymentsList = () => {
  return useQuery<Payment[]>({
    queryKey: dbKeys.payments(),
    queryFn: async () => {
      const res = await getPaymentsFn();
      return res as Payment[];
    },
  });
};

export const useSavePayments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payments: Payment[]) => {
      const res = await savePaymentsFn({ data: payments });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dbKeys.payments() });
    },
  });
};

// ==================== SETTINGS ====================

export const useNotificationSettings = () => {
  return useQuery<{
    emailNotif: boolean;
    smsNotif: boolean;
    auditNotif: boolean;
    weeklyNotif: boolean;
  }>({
    queryKey: dbKeys.notificationSettings(),
    queryFn: async () => {
      const res = await getNotificationSettingsFn();
      return res as {
        emailNotif: boolean;
        smsNotif: boolean;
        auditNotif: boolean;
        weeklyNotif: boolean;
      };
    },
  });
};

export const useSaveNotificationSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: {
      emailNotif: boolean;
      smsNotif: boolean;
      auditNotif: boolean;
      weeklyNotif: boolean;
    }) => {
      const res = await saveNotificationSettingsFn({ data: settings });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dbKeys.notificationSettings() });
    },
  });
};

// ==================== PROFILES ====================

export const useProfile = (uid: string, options?: { enabled?: boolean }) => {
  return useQuery<Profile | null>({
    queryKey: dbKeys.profile(uid),
    queryFn: async () => {
      const res = await getProfileFn({ data: uid });
      return res as Profile | null;
    },
    enabled: options?.enabled ?? !!uid,
  });
};

export const useSaveProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { uid: string; data: any }) => {
      const res = await saveProfileFn({ data: payload });
      return res;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dbKeys.profile(variables.uid) });
    },
  });
};

// ==================== PLANS ====================

export const usePlansList = () => {
  return useQuery<Plan[]>({
    queryKey: dbKeys.plans(),
    queryFn: async () => {
      const res = await getPlansFn();
      return res as Plan[];
    },
  });
};

export const useSavePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (plan: any) => {
      const res = await savePlanFn({ data: plan });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dbKeys.plans() });
    },
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deletePlanFn({ data: id });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dbKeys.plans() });
    },
  });
};

// ==================== SUBSCRIPTIONS ====================

export const useSubscriptionsList = () => {
  return useQuery<Subscription[]>({
    queryKey: dbKeys.subscriptions(),
    queryFn: async () => {
      const res = await getSubscriptionsFn();
      return res as Subscription[];
    },
  });
};

export const useUserSubscription = (uid: string, options?: { enabled?: boolean }) => {
  return useQuery<Subscription | null>({
    queryKey: dbKeys.userSubscription(uid),
    queryFn: async () => {
      const res = await getUserSubscriptionFn({ data: uid });
      return res as Subscription | null;
    },
    enabled: options?.enabled ?? !!uid,
  });
};

export const useSaveSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sub: any) => {
      const res = await saveSubscriptionFn({ data: sub });
      return res;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dbKeys.subscriptions() });
      const uId =
        typeof variables.uid === "string"
          ? variables.uid
          : (variables.uid as any)?.id;
      if (uId) {
        queryClient.invalidateQueries({ queryKey: dbKeys.userSubscription(uId) });
      }
    },
  });
};

// ==================== REPORTS ====================

export const useReportsList = () => {
  return useQuery<Report[]>({
    queryKey: dbKeys.reports(),
    queryFn: async () => {
      const res = await getReportsFn();
      return res as Report[];
    },
  });
};

export const useReportsByUser = (uid: string, options?: { enabled?: boolean }) => {
  return useQuery<Report[]>({
    queryKey: dbKeys.reportsByUser(uid),
    queryFn: async () => {
      const res = await getReportsByUserFn({ data: uid });
      return res as Report[];
    },
    enabled: options?.enabled ?? !!uid,
  });
};

export const useReportsByBusiness = (businessId: string, options?: { enabled?: boolean }) => {
  return useQuery<Report[]>({
    queryKey: dbKeys.reportsByBusiness(businessId),
    queryFn: async () => {
      const res = await getReportsByBusinessFn({ data: businessId });
      return res as Report[];
    },
    enabled: options?.enabled ?? !!businessId,
  });
};

export const useSaveReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (report: Report) => {
      const res = await saveReportFn({ data: report });
      return res;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dbKeys.reports() });
      const uId =
        typeof variables.businessId === "string"
          ? variables.businessId
          : (variables.businessId as any)?.id;
      if (uId) {
        // Since user is linked via business, invalidate reports by user prefix
        queryClient.invalidateQueries({ queryKey: [...dbKeys.reports(), "byUser"] });
      }
    },
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteReportFn({ data: id });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dbKeys.reports() });
      queryClient.invalidateQueries({ queryKey: [...dbKeys.reports(), "byUser"] });
    },
  });
};

// ==================== AUDIT LOGS ====================

export const useAuditLog = (limit?: number) => {
  return useQuery<AuditLog[]>({
    queryKey: dbKeys.auditLogs(limit),
    queryFn: async () => {
      const res = await getAuditLogFn({ data: limit });
      return res as AuditLog[];
    },
  });
};

export const useLogAuditEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      uid: string;
      action: string;
      payload: Record<string, any>;
      userName?: string;
    }) => {
      const res = await logAuditEventFn({ data: payload });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...dbKeys.all, "auditLogs"] });
    },
  });
};

// ==================== DEV / UTILS ====================

export const useTestFirestoreConnection = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await testFirestoreConnectionFn();
      return res;
    },
  });
};

export const useSeedDatabase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: {
      emailNotif: boolean;
      smsNotif: boolean;
      auditNotif: boolean;
      weeklyNotif: boolean;
    }) => {
      const res = await seedDatabaseFn({ data: settings });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dbKeys.all });
    },
  });
};
