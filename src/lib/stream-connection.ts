import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { getClientStreamCredentialsFn, getStreamCredentialsFn } from "@/lib/server-functions";

let clientInstance: StreamChat | null = null;
let activeConnectionPromise: Promise<StreamChat> | null = null;
let currentUserId: string | null = null;
let referenceCount = 0;
let disconnectTimeout: NodeJS.Timeout | null = null;

// Cache credential fetch promises to prevent parallel/duplicate fetch requests
const clientCredentialsPromises = new Map<string, Promise<any>>();
let adminCredentialsPromise: Promise<any> | null = null;

export function getCachedClientStreamCredentials(businessId: string) {
  if (!clientCredentialsPromises.has(businessId)) {
    const promise = getClientStreamCredentialsFn({ data: businessId });
    clientCredentialsPromises.set(businessId, promise);
  }
  return clientCredentialsPromises.get(businessId)!;
}

export function getCachedAdminStreamCredentials() {
  if (!adminCredentialsPromise) {
    adminCredentialsPromise = getStreamCredentialsFn();
  }
  return adminCredentialsPromise;
}

export interface StreamConnectionOptions {
  apiKey: string;
  user: {
    id: string;
    name?: string;
  };
  token: string;
}

/**
 * Safely connects a StreamChat user, checking for existing active connections
 * and sharing in-flight connection promises to avoid consecutive connectUser calls.
 */
export async function connectStreamUser({
  apiKey,
  user,
  token,
}: StreamConnectionOptions): Promise<StreamChat> {
  // Cancel any scheduled disconnection since we are requesting a connection
  if (disconnectTimeout) {
    clearTimeout(disconnectTimeout);
    disconnectTimeout = null;
  }

  // Increment references
  referenceCount++;

  const client = StreamChat.getInstance(apiKey);
  clientInstance = client;

  // If already connected as the correct user, return immediately
  if (client.userID === user.id && client.user) {
    return client;
  }

  // If there's an active connection promise for the same user, wait for it
  if (activeConnectionPromise && currentUserId === user.id) {
    return activeConnectionPromise;
  }

  // If a different user was connected, we must disconnect them first
  if (client.userID && client.userID !== user.id) {
    await client.disconnectUser();
  }

  currentUserId = user.id;
  activeConnectionPromise = (async () => {
    try {
      await client.connectUser(
        { id: user.id, name: user.name || user.id },
        token
      );
      return client;
    } catch (err) {
      // Clear connection state on failure so retry works
      if (currentUserId === user.id) {
        activeConnectionPromise = null;
        currentUserId = null;
      }
      throw err;
    } finally {
      // Clear active connection promise once resolved/rejected
      // so subsequent calls check client.userID and client.user
      if (currentUserId === user.id) {
        activeConnectionPromise = null;
      }
    }
  })();

  return activeConnectionPromise;
}

/**
 * Decrements active connection count and schedules disconnection if no more consumers exist.
 */
export function disconnectStreamUser(): void {
  // Decrement references
  referenceCount--;
  if (referenceCount < 0) {
    referenceCount = 0;
  }

  // If no more components are using the connection, schedule a disconnect
  if (referenceCount === 0 && clientInstance) {
    if (disconnectTimeout) {
      clearTimeout(disconnectTimeout);
    }

    const instanceToDisconnect = clientInstance;
    disconnectTimeout = setTimeout(async () => {
      try {
        await instanceToDisconnect.disconnectUser();
        if (clientInstance === instanceToDisconnect) {
          clientInstance = null;
          currentUserId = null;
        }
        console.log("Stream Chat client disconnected successfully");
      } catch (err) {
        console.error("Error disconnecting Stream client:", err);
      } finally {
        disconnectTimeout = null;
      }
    }, 1500); // 1.5 seconds buffer to handle StrictMode double mounts/navigation
  }
}

/**
 * Custom React hook to safely manage Stream connection lifecycle inside components.
 */
export function useStreamConnection(options: StreamConnectionOptions | null) {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!options) {
      setClient(null);
      setLoading(false);
      return;
    }

    let isSubscribed = true;
    setLoading(true);

    connectStreamUser(options)
      .then((connectedClient) => {
        if (isSubscribed) {
          setClient(connectedClient);
          setError(null);
        }
      })
      .catch((err) => {
        console.error("Failed to connect Stream Chat client via hook:", err);
        if (isSubscribed) {
          setClient(null);
          setError(err);
        }
      })
      .finally(() => {
        if (isSubscribed) {
          setLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
      disconnectStreamUser();
    };
  }, [options?.apiKey, options?.user.id, options?.token]);

  return { client, loading, error };
}
