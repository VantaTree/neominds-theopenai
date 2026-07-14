import { ConfigRepository, type NotificationSettings } from "../repositories/config.repository";
import { type AdminConfig } from "@/lib/schemas";

export class AdminService {
  private configRepo = new ConfigRepository();

  async getNotificationSettings(): Promise<NotificationSettings> {
    return this.configRepo.getNotificationSettings();
  }

  async saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    await this.configRepo.saveNotificationSettings(settings);
  }

  async getAdminConfig(): Promise<AdminConfig> {
    return this.configRepo.getAdminConfig();
  }

  async saveAdminConfig(config: AdminConfig): Promise<void> {
    await this.configRepo.saveAdminConfig(config);
  }
}
