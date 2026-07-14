import { adminDb } from "@/lib/firebase-admin.server";
import { type AdminConfig } from "@/lib/schemas";

export interface NotificationSettings {
  emailNotif: boolean;
  smsNotif: boolean;
  auditNotif: boolean;
  weeklyNotif: boolean;
}

const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  maintenanceMode: false,
  featureFlags: { aiReports: true, payments: true, auditLog: true },
  welcomeMessage:
    "Welcome to GrowConsult AI! Your AI-powered business growth platform.",
  updatedAt: Date.now(),
};

export class ConfigRepository {
  private get db() {
    if (!adminDb) {
      throw new Error("Firebase Admin Firestore is not initialized.");
    }
    return adminDb;
  }

  async getNotificationSettings(): Promise<NotificationSettings> {
    const snap = await this.db.collection("adminSettings").doc("notifications").get();
    if (snap.exists) {
      return snap.data() as NotificationSettings;
    }
    return {
      emailNotif: true,
      smsNotif: false,
      auditNotif: true,
      weeklyNotif: true,
    };
  }

  async saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    await this.db.collection("adminSettings").doc("notifications").set(settings, { merge: true });
  }

  async getAdminConfig(): Promise<AdminConfig> {
    const snap = await this.db.collection("adminSettings").doc("config").get();
    if (snap.exists) {
      return snap.data() as AdminConfig;
    }
    return DEFAULT_ADMIN_CONFIG;
  }

  async saveAdminConfig(config: AdminConfig): Promise<void> {
    const withTs = { ...config, updatedAt: Date.now() };
    await this.db.collection("adminSettings").doc("config").set(withTs, { merge: true });
  }
}
export { DEFAULT_ADMIN_CONFIG };
