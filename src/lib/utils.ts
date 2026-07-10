import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStreamChannelId(userId: string, businessId: string, domain: string): string {
  const rawId = `c_${businessId}_${domain}`;
  return rawId.replace(/[^a-zA-Z0-9_-]/g, "_");
}
