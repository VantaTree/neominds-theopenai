import { z } from "zod";
import { BusinessSchema } from "../db/business";

export const GetBusinessSchema = z.string().min(1, "Business ID is required");
export const GetBusinessesByUserSchema = z.string().min(1, "User ID is required");
export const DeleteBusinessSchema = z.string().min(1, "Business ID is required");

// Accepts the BusinessSchema shape for client compatibility,
// but the backend will validate ownership and restrict plan changes on save.
export const SaveBusinessSchema = BusinessSchema;
