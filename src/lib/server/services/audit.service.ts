import { AuditRepository } from "../repositories/audit.repository";
import { type AuditLog } from "@/lib/schemas";

export class AuditService {
  private auditRepo = new AuditRepository();

  async logAuditEvent(
    uid: string,
    action: string,
    payload: Record<string, any>,
    actor?: string
  ): Promise<void> {
    await this.auditRepo.logAuditEvent(uid, action, payload, actor);
  }

  async getAuditLog(limitCount = 100): Promise<AuditLog[]> {
    return this.auditRepo.getAuditLog(limitCount);
  }
}
