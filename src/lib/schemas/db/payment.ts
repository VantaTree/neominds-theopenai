import { z } from "zod";
import { DateField, Reference } from "../common";
import { UserSchema } from "./user";
import { BusinessSchema, PaymentStatusEnum } from "./business";

export const PaymentMethodEnum = z.enum([
  "Card",
  "UPI",
  "Netbanking",
  "Wallet",
  "BankTransfer",
  "Other",
]);
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

export const RazorpayInfoSchema = z.object({
  orderId: z.string().optional(),
  paymentId: z.string().optional(),
  signature: z.string().optional(),
});

export const PaymentSchema = z.object({
  id: z.string().min(1, "Payment ID is required"),
  userId: Reference(UserSchema, "User ID reference is required"),
  businessId: Reference(BusinessSchema, "Business ID reference is required"),
  status: PaymentStatusEnum.default("Pending"),
  amount: z.number().positive("Amount must be a positive number"),
  currency: z.string().default("INR"),
  paymentMethod: PaymentMethodEnum.default("Other"),
  gateway: z.string().default("Razorpay"),
  gatewayInfo: RazorpayInfoSchema.optional().nullable(),
  purchaseItem: z.string().min(1, "Purchase item is required"),
  timestamp: DateField,
});

export type Payment = z.infer<typeof PaymentSchema>;
