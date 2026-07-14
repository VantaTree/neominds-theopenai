import { z } from "zod";
import { UserSchema } from "../db/user";

export const GetUserSchema = z.string().min(1, "User ID is required");
export const DeleteUserSchema = z.string().min(1, "User ID is required");

export const EnsureUserDocumentSchema = z.object({
  user: z.object({
    uid: z.string().min(1, "UID is required"),
    displayName: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    phoneNumber: z.string().optional().nullable(),
  }),
});

export const CheckUserExistsSchema = z.object({
  uid: z.string().min(1, "UID is required"),
});

// To preserve client integrations, we accept the full UserSchema shape
// but the backend will sanitize/ignore server-controlled fields based on permissions.
export const SaveUserSchema = UserSchema;
