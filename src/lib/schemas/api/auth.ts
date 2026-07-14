import { z } from "zod";

export const CreateSessionCookieSchema = z.object({
  idToken: z.string().min(1, "ID token is required"),
});

export type CreateSessionCookieInput = z.infer<typeof CreateSessionCookieSchema>;
