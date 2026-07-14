import { AuditRepository } from "../repositories/audit.repository";

export async function withAuditLogging<T>(
  uid: string,
  action: string,
  payload: Record<string, any>,
  actor: string,
  fn: () => Promise<T>
): Promise<T> {
  const auditRepo = new AuditRepository();
  const startTime = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    await auditRepo.logAuditEvent(uid, action, { ...payload, durationMs: duration }, actor);
    return result;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    await auditRepo.logAuditEvent(
      uid,
      `${action}_failed`,
      { ...payload, error: error.message, durationMs: duration },
      actor
    );
    throw error;
  }
}
