import { z } from "zod";

export const GetAuthUrlSchema = z.object({
  platform: z.enum(["google", "meta"]),
  businessId: z.string().min(1),
  origin: z.string().optional(),
});

export const ExchangeAuthCodeSchema = z.object({
  code: z.string().min(1),
  platform: z.enum(["google", "meta"]),
  businessId: z.string().min(1),
  origin: z.string().optional(),
});

export const ActivatePlusPlatformSchema = z.object({
  businessId: z.string().min(1),
  platform: z.enum(["instagram", "facebook"]),
});
