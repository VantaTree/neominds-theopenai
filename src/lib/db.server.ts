import { UserRepository } from "./server/repositories/user.repository";
import { BusinessRepository } from "./server/repositories/business.repository";
import { ProjectRepository } from "./server/repositories/project.repository";
import { PaymentRepository } from "./server/repositories/payment.repository";
import { ReportRepository } from "./server/repositories/report.repository";
import { SubscriptionRepository } from "./server/repositories/subscription.repository";
import { PlanRepository } from "./server/repositories/plan.repository";
import { AuditRepository } from "./server/repositories/audit.repository";
import { ConfigRepository } from "./server/repositories/config.repository";
import { BlogRepository } from "./server/repositories/blog.repository";

import type {
  User,
  Business,
  Project,
  Payment,
  Report,
  Subscription,
  Plan,
  AdminConfig,
  Blog,
} from "./schemas";
import type { NotificationSettings } from "./server/repositories/config.repository";

const userRepo = new UserRepository();
const businessRepo = new BusinessRepository();
const projectRepo = new ProjectRepository();
const paymentRepo = new PaymentRepository();
const reportRepo = new ReportRepository();
const subscriptionRepo = new SubscriptionRepository();
const planRepo = new PlanRepository();
const auditRepo = new AuditRepository();
const configRepo = new ConfigRepository();
const blogRepo = new BlogRepository();

// ==================== USERS ====================
export const getUsers = () => userRepo.getUsers();
export const getUser = (userId: string) => userRepo.getUser(userId);
export const saveUser = (user: User) => userRepo.saveUser(user);
export const deleteUser = (userId: string) => userRepo.deleteUser(userId);
export const ensureUserDocument = (user: any) => userRepo.ensureUserDocument(user);

// ==================== BUSINESSES ====================
export const getBusinesses = () => businessRepo.getBusinesses();
export const getBusiness = (businessId: string) => businessRepo.getBusiness(businessId);
export const getBusinessesByUser = (userId: string) => businessRepo.getBusinessesByUser(userId);
export const saveBusiness = (business: Business) => businessRepo.saveBusiness(business);
export const deleteBusiness = (businessId: string) => businessRepo.deleteBusiness(businessId);

// ==================== PROJECTS ====================
export const getProjects = () => projectRepo.getProjects();
export const saveProject = (project: Project) => projectRepo.saveProject(project);
export const deleteProject = (projectId: string) => projectRepo.deleteProject(projectId);
export const getProjectsByBusiness = (businessId: string) => projectRepo.getProjectsByBusiness(businessId);

// ==================== PAYMENTS ====================
export const getPayments = () => paymentRepo.getPayments();
export const savePayments = (payments: Payment[]) => paymentRepo.savePayments(payments);

// ==================== SETTINGS ====================
export const getNotificationSettings = () => configRepo.getNotificationSettings();
export const saveNotificationSettings = (settings: NotificationSettings) =>
  configRepo.saveNotificationSettings(settings);

// ==================== PLANS ====================
export const getPlans = () => planRepo.getPlans();
export const savePlan = (plan: Plan) => planRepo.savePlan(plan);
export const deletePlan = (planId: string) => planRepo.deletePlan(planId);

// ==================== SUBSCRIPTIONS ====================
export const getSubscriptions = () => subscriptionRepo.getSubscriptions();
export const getUserSubscription = (uid: string) => subscriptionRepo.getUserSubscription(uid);
export const saveSubscription = (sub: Subscription) => subscriptionRepo.saveSubscription(sub);

// ==================== REPORTS ====================
export const getReports = () => reportRepo.getReports();
export const getReportsByUser = (uid: string) => reportRepo.getReportsByUser(uid);
export const getReportsByBusiness = (businessId: string) => reportRepo.getReportsByBusiness(businessId);
export const saveReport = (report: Report) => reportRepo.saveReport(report);
export const deleteReport = (reportId: string) => reportRepo.deleteReport(reportId);

// ==================== AUDIT LOGS ====================
export const logAuditEvent = (
  uid: string,
  action: string,
  payload: Record<string, any>,
  actor = "System",
  ipAddress?: string,
  userAgent?: string,
) => auditRepo.logAuditEvent(uid, action, payload, actor, ipAddress, userAgent);

export const getAuditLog = (limitCount = 100) => auditRepo.getAuditLog(limitCount);

// ==================== ADMIN CONFIG ====================
export const getAdminConfig = () => configRepo.getAdminConfig();
export const saveAdminConfig = (config: AdminConfig) => configRepo.saveAdminConfig(config);

// ==================== BLOGS ====================
export const fetchBlogs = (onlyPublished = false) => blogRepo.fetchBlogs(onlyPublished);
export const fetchBlogBySlug = (slug: string) => blogRepo.fetchBlogBySlug(slug);
export const createBlog = (data: Omit<Blog, "id" | "createdAt" | "updatedAt">) =>
  blogRepo.createBlog(data);
export const updateBlog = (id: string, data: Partial<Blog>) => blogRepo.updateBlog(id, data);
export const deleteBlog = (id: string) => blogRepo.deleteBlog(id);
export { type NotificationSettings };
