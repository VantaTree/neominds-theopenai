import { PaymentRepository } from "../repositories/payment.repository";
import { AuditRepository } from "../repositories/audit.repository";
import { type Payment } from "@/lib/schemas";
import { NotFoundError } from "../../errors";

export class PaymentService {
  private paymentRepo = new PaymentRepository();
  private auditRepo = new AuditRepository();

  async getPayments(): Promise<Payment[]> {
    return this.paymentRepo.getPayments();
  }

  async savePayments(payments: Payment[]): Promise<void> {
    await this.paymentRepo.savePayments(payments);
  }

  async refundPayment(actor: any, paymentId: string): Promise<Payment> {
    const payments = await this.paymentRepo.getPayments();
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) {
      throw new NotFoundError("Payment not found.");
    }

    payment.status = "Refunded";
    await this.paymentRepo.savePayments([payment]);

    const actorName = actor.name || actor.email || "Admin";
    await this.auditRepo.logAuditEvent(
      actor.uid,
      "payment_refunded",
      { paymentId, amount: payment.amount, currency: payment.currency },
      actorName
    );

    return payment;
  }

  async sendPaymentReminder(actor: any, paymentId: string, clientEmail: string): Promise<void> {
    console.log(`[Email Dispatch Simulation] Sending payment reminder for payment ID ${paymentId} to ${clientEmail}`);

    const actorName = actor.name || actor.email || "Admin";
    await this.auditRepo.logAuditEvent(
      actor.uid,
      "payment_reminder_sent",
      { paymentId, recipientEmail: clientEmail },
      actorName
    );
  }

  async logCsvExport(actor: any, recordCount: number): Promise<void> {
    const actorName = actor.name || actor.email || "Admin";
    await this.auditRepo.logAuditEvent(
      actor.uid,
      "payments_csv_exported",
      { recordCount },
      actorName
    );
  }
}
