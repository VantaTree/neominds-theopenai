import { createServerFn } from "@tanstack/react-start";
import { businessOwnerMiddleware } from "./middleware";
import PLANS from "@/data/plans";
import { type Payment } from "@/lib/schemas";

export const createRazorpayOrderFn = createServerFn({ method: "POST" })
  .validator((d: { businessId: string; planName: "Basic" | "Plus" | "Pro" }) => d)
  .middleware([businessOwnerMiddleware])
  .handler(async ({ data, context }) => {
    const biz = (context as any).business;
    if (biz && biz.plan === data.planName) {
      throw new Error(`BadRequest: You already have the ${data.planName} plan.`);
    }

    // Find the plan in plans.ts dynamically
    const plan = PLANS.find((p) => p.name.toLowerCase() === data.planName.toLowerCase());
    if (!plan) {
      throw new Error(`Plan ${data.planName} not found in plans configuration.`);
    }

    // Parse price value (e.g. "$0.99" -> 0.99)
    const priceValue = parseFloat(plan.price.replace(/[^0-9.]/g, ""));
    if (isNaN(priceValue)) {
      throw new Error(`Invalid plan price format for ${data.planName}: ${plan.price}`);
    }

    // Convert USD to INR (Razorpay test key uses INR currency)
    // Using a conversion rate of 1 USD = 83 INR
    const USD_TO_INR = 83;
    const amountInInr = priceValue * USD_TO_INR;
    const amountInPaise = Math.round(amountInInr * 100);

    const keyId = (import.meta.env.VITE_RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "").trim();
    const keySecret = ((import.meta.env as any).RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || "").trim();

    try {
      const { default: Razorpay } = await import("razorpay");
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `rcpt_${data.businessId.substring(0, 10)}_${Date.now()}`,
      });

      return {
        orderId: order.id,
        amount: order.amount as number,
        currency: order.currency,
      };
    } catch (err: any) {
      console.error("Failed to create Razorpay order:", err);
      throw new Error(err.description || err.message || "Failed to create order on Razorpay");
    }
  });

export const verifyRazorpayPaymentFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      businessId: string;
      planName: "Basic" | "Plus" | "Pro";
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }) => d
  )
  .middleware([businessOwnerMiddleware])
  .handler(async ({ data, context }) => {
    const decoded = (context as any).user;
    const biz = (context as any).business;

    if (biz && biz.plan === data.planName) {
      throw new Error(`BadRequest: You already have the ${data.planName} plan.`);
    }

    const { BusinessRepository } = await import("../server/repositories/business.repository");
    const { PaymentRepository } = await import("../server/repositories/payment.repository");
    const { AuditService } = await import("../server/services/audit.service");

    const keyId = (import.meta.env.VITE_RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "").trim();
    const keySecret = ((import.meta.env as any).RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || "").trim();

    // Verify signature using official Razorpay static utility method
    const { default: Razorpay } = await import("razorpay");
    const isValid = (Razorpay as any).validatePaymentVerification(
      { order_id: data.razorpayOrderId, payment_id: data.razorpayPaymentId },
      data.razorpaySignature,
      keySecret
    );

    if (!isValid) {
      throw new Error("Payment verification failed: Invalid signature.");
    }

    // Update business document
    biz.plan = data.planName;
    biz.paymentStatus = "Paid";
    biz.updatedAt = new Date();
    
    const businessRepo = new BusinessRepository();
    await businessRepo.saveBusiness(biz);

    // Save payment record - fetch actual payment details from Razorpay to record actual amount credited
    let amountInInr = 0;
    let paymentMethod: any = "Other";
    let currency = "INR";

    try {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      const paymentDetails = await razorpay.payments.fetch(data.razorpayPaymentId);
      amountInInr = (paymentDetails.amount as number) / 100;
      if (paymentDetails.currency) {
        currency = paymentDetails.currency;
      }
      if (paymentDetails.method) {
        const rzpMethod = paymentDetails.method.toLowerCase();
        if (rzpMethod === "card") paymentMethod = "Card";
        else if (rzpMethod === "upi") paymentMethod = "UPI";
        else if (rzpMethod === "netbanking") paymentMethod = "Netbanking";
        else if (rzpMethod === "wallet") paymentMethod = "Wallet";
        else if (rzpMethod === "bank_transfer") paymentMethod = "BankTransfer";
      }
    } catch (fetchErr) {
      console.error("Error fetching payment details from Razorpay, falling back to static calculation:", fetchErr);
      const plan = PLANS.find((p) => p.name.toLowerCase() === data.planName.toLowerCase());
      const usdPrice = plan ? parseFloat(plan.price.replace(/[^0-9.]/g, "")) : 0;
      amountInInr = isNaN(usdPrice) ? 0 : usdPrice * 83;
    }

    const paymentEntry: Payment = {
      id: data.razorpayPaymentId,
      userId: decoded.uid,
      businessId: data.businessId,
      status: "Paid",
      amount: amountInInr,
      currency: currency,
      paymentMethod: paymentMethod,
      gateway: "Razorpay",
      gatewayInfo: {
        orderId: data.razorpayOrderId,
        paymentId: data.razorpayPaymentId,
        signature: data.razorpaySignature,
      },
      purchaseItem: `${data.planName} Plan Subscription`,
      timestamp: new Date(),
    };

    const paymentRepo = new PaymentRepository();
    await paymentRepo.savePayments([paymentEntry]);

    // Log Audit Event
    const auditService = new AuditService();
    await auditService.logAuditEvent(
      decoded.uid,
      "subscription_payment_verified",
      {
        businessId: data.businessId,
        planName: data.planName,
        razorpayOrderId: data.razorpayOrderId,
        razorpayPaymentId: data.razorpayPaymentId,
        amount: amountInInr,
      },
      decoded.name || decoded.email || "Client"
    );

    return { success: true, plan: data.planName };
  });
