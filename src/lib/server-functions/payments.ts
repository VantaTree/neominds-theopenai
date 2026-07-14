import { createServerFn } from "@tanstack/react-start";
import { adminMiddleware } from "./middleware";
import {
  SavePaymentsSchema,
  RefundPaymentSchema,
  SendPaymentReminderSchema,
  LogCsvExportSchema,
} from "../schemas/api/payments";

export const getPaymentsFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const { PaymentService } = await import("../server/services/payment.service");
    const paymentService = new PaymentService();
    return paymentService.getPayments();
  });

export const savePaymentsFn = createServerFn({ method: "POST" })
  .validator((d: any) => SavePaymentsSchema.parse(d))
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const { PaymentService } = await import("../server/services/payment.service");
    const paymentService = new PaymentService();
    await paymentService.savePayments(data);
    return { success: true };
  });

export const refundPaymentFn = createServerFn({ method: "POST" })
  .validator((d: any) => RefundPaymentSchema.parse(d))
  .middleware([adminMiddleware])
  .handler(async ({ data, context }) => {
    const { PaymentService } = await import("../server/services/payment.service");
    const decoded = context.user;
    const paymentService = new PaymentService();
    const payment = await paymentService.refundPayment(decoded, data);
    return { success: true, payment };
  });

export const sendPaymentReminderFn = createServerFn({ method: "POST" })
  .validator((d: any) => SendPaymentReminderSchema.parse(d))
  .middleware([adminMiddleware])
  .handler(async ({ data, context }) => {
    const { PaymentService } = await import("../server/services/payment.service");
    const decoded = context.user;
    const paymentService = new PaymentService();
    await paymentService.sendPaymentReminder(decoded, data.paymentId, data.clientEmail);
    return { success: true };
  });

export const logCsvExportFn = createServerFn({ method: "POST" })
  .validator((d: any) => LogCsvExportSchema.parse(d))
  .middleware([adminMiddleware])
  .handler(async ({ data, context }) => {
    const { PaymentService } = await import("../server/services/payment.service");
    const decoded = context.user;
    const paymentService = new PaymentService();
    await paymentService.logCsvExport(decoded, data.recordCount);
    return { success: true };
  });
