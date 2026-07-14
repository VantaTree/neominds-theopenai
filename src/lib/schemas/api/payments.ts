import { z } from "zod";
import { PaymentSchema } from "../db/payment";

export const SavePaymentsSchema = z.array(PaymentSchema);
export const RefundPaymentSchema = z.string().min(1, "Payment ID is required");

export const SendPaymentReminderSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
  clientEmail: z.string().email("Invalid client email address"),
});

export const LogCsvExportSchema = z.object({
  recordCount: z.number().int().nonnegative(),
});
