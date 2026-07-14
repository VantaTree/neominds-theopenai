import { createServerFn } from "@tanstack/react-start";
import { CreateSessionCookieSchema } from "../schemas/api/auth";
import { UnauthorizedError } from "../errors";

export interface DecodedSession {
  uid: string;
  email?: string;
  name?: string;
  admin?: boolean;
  [key: string]: any;
}

export async function verifyServerSession(): Promise<DecodedSession> {
  if (typeof window !== "undefined") {
    throw new Error("verifyServerSession can only be called on the server.");
  }
  
  const { getStartContext } = await import("@tanstack/start-storage-context");
  const ctx = getStartContext({ throwIfNotFound: false });
  const req = ctx?.request;
  const cookieHeader = req?.headers.get("cookie") || "";
  const match = cookieHeader.match(/__session=([^;]+)/);
  const token = match ? match[1] : null;

  if (!token) {
    throw new UnauthorizedError("Unauthorized: No session token found.");
  }

  const { adminAuth } = await import("@/lib/firebase-admin.server");
  if (!adminAuth) {
    throw new Error("Firebase Admin Auth SDK is not initialized.");
  }

  try {
    try {
      const decoded = await adminAuth.verifySessionCookie(token, true);
      return decoded as DecodedSession;
    } catch (sessionError) {
      const decoded = await adminAuth.verifyIdToken(token);
      return decoded as DecodedSession;
    }
  } catch (error) {
    throw new UnauthorizedError("Unauthorized: Invalid session token.");
  }
}

export const createSessionCookieFn = createServerFn({ method: "POST" })
  .validator((d: any) => CreateSessionCookieSchema.parse(d))
  .handler(async ({ data }) => {
    try {
      const { adminAuth } = await import("@/lib/firebase-admin.server");
      if (!adminAuth) {
        throw new Error("Firebase Admin Auth SDK is not initialized.");
      }
      const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days
      const sessionCookie = await adminAuth.createSessionCookie(data.idToken, { expiresIn });
      return { sessionCookie };
    } catch (e: any) {
      console.error("Error creating session cookie:", e);
      return { sessionCookie: data.idToken };
    }
  });
