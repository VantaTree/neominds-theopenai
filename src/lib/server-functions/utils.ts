import { createServerFn } from "@tanstack/react-start";
import { adminMiddleware, authenticatedMiddleware } from "./middleware";

export const testFirestoreConnectionFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const { adminDb } = await import("@/lib/firebase-admin.server");
    
    try {
      if (!adminDb) {
        return { ok: false, error: "Firebase Admin Firestore is not initialized." };
      }
      const dbRef = adminDb.collection("_connectionTest").doc("ping");
      await dbRef.set({ ts: Date.now(), ok: true });
      const snap = await dbRef.get();
      if (snap.exists) {
        await dbRef.delete();
        return { ok: true };
      }
      return { ok: false, error: "Read back failed" };
    } catch (e: any) {
      return { ok: false, error: e.message || "Unknown error" };
    }
  });

export const getStreamCredentialsFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const apiKey = process.env.VITE_STREAM_API_KEY || import.meta.env.VITE_STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET || (import.meta.env as any).STREAM_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error("Stream credentials are not configured in environment variables.");
    }

    const { StreamChat: NodeStreamChat } = await import("stream-chat");
    const serverClient = NodeStreamChat.getInstance(apiKey, apiSecret);

    await serverClient.upsertUser({
      id: "admin",
      role: "admin",
      name: "Admin Manager",
    } as any);

    const token = serverClient.createToken("admin");

    return { apiKey, token };
  });

export const getClientStreamCredentialsFn = createServerFn({ method: "GET" })
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }) => {
    const decoded = context.user;

    const apiKey = process.env.VITE_STREAM_API_KEY || import.meta.env.VITE_STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET || (import.meta.env as any).STREAM_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error("Stream credentials are not configured in environment variables.");
    }

    const uid = decoded.uid;
    const email = decoded.email;
    const name = decoded.name || email?.split("@")[0] || "Client User";

    const { StreamChat: NodeStreamChat } = await import("stream-chat");
    const serverClient = NodeStreamChat.getInstance(apiKey, apiSecret);
    
    await serverClient.upsertUsers([
      {
        id: uid,
        role: "user",
        name: name,
        email: email,
      },
      {
        id: "admin",
        role: "admin",
        name: "Admin Manager",
      }
    ] as any);

    const token = serverClient.createToken(uid);

    return { apiKey, token, uid, name };
  });
