import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  businessOwnerMiddleware,
  requirePlanMiddleware,
} from "./middleware";
import {
  GetAuthUrlSchema,
  ExchangeAuthCodeSchema,
  ActivatePlusPlatformSchema,
} from "../schemas/api/integrations";

// 1. Get OAuth Consent URL
export const getAuthUrlFn = createServerFn({ method: "GET" })
  .validator((d: any) => GetAuthUrlSchema.parse(d))
  .middleware([businessOwnerMiddleware])
  .handler(async ({ data }) => {
    const { platform, businessId, origin } = data;
    const { IntegrationService } = await import("../server/services/integration.service");
    const integrationService = new IntegrationService();
    return integrationService.getAuthUrl(platform, businessId, origin);
  });

// 2. Exchange Authorization Code for Tokens
export const exchangeAuthCodeFn = createServerFn({ method: "POST" })
  .validator((d: any) => ExchangeAuthCodeSchema.parse(d))
  .middleware([businessOwnerMiddleware])
  .handler(async ({ data }) => {
    const { code, platform, businessId, origin } = data;
    const { IntegrationService } = await import("../server/services/integration.service");
    const integrationService = new IntegrationService();
    return integrationService.exchangeAuthCode(code, platform, businessId, origin);
  });

// 3. Activate Plus Platform
export const activatePlusPlatformFn = createServerFn({ method: "POST" })
  .validator((d: any) => ActivatePlusPlatformSchema.parse(d))
  .middleware([businessOwnerMiddleware])
  .handler(async ({ data }) => {
    const { businessId, platform } = data;
    const { IntegrationService } = await import("../server/services/integration.service");
    const integrationService = new IntegrationService();
    return integrationService.activatePlusPlatform(businessId, platform);
  });

// 4. Get Dashboard Analytics Metrics Gated by Plan Level
export const getDashboardInsightsFn = createServerFn({ method: "GET" })
  .validator((d: any) => z.object({
    businessId: z.string(),
    range: z.string().optional()
  }).parse(typeof d === "string" ? { businessId: d, range: "30days" } : d))
  .middleware([businessOwnerMiddleware, requirePlanMiddleware("Basic")])
  .handler(async ({ context, data }) => {
    const business = (context as any)?.business;
    if (!business) {
      throw new Error("Business context not found.");
    }
    const { IntegrationService } = await import("../server/services/integration.service");
    const integrationService = new IntegrationService();
    return integrationService.getDashboardInsights(business);
  });
