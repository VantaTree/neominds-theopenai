import { requireAuth } from "./session";
import { ForbiddenError } from "../../errors";

export enum Permission {
  READ_USERS = "READ_USERS",
  EDIT_USERS = "EDIT_USERS",
  DELETE_USERS = "DELETE_USERS",
  READ_PAYMENTS = "READ_PAYMENTS",
  REFUND_PAYMENT = "REFUND_PAYMENT",
  CREATE_REPORT = "CREATE_REPORT",
  DELETE_REPORT = "DELETE_REPORT",
  MANAGE_BUSINESS = "MANAGE_BUSINESS",
  MANAGE_SUBSCRIPTIONS = "MANAGE_SUBSCRIPTIONS",
}

export async function requireAdmin() {
  const decoded = await requireAuth();
  if (decoded.admin !== true) {
    throw new ForbiddenError("Forbidden: Admin privileges required.");
  }
  return decoded;
}

export function hasPermission(decoded: any, permission: Permission): boolean {
  if (decoded.admin === true) {
    return true;
  }
  const clientPermissions = [
    Permission.CREATE_REPORT,
    Permission.MANAGE_BUSINESS,
  ];
  return clientPermissions.includes(permission);
}

export async function requirePermission(permission: Permission) {
  const decoded = await requireAuth();
  if (!hasPermission(decoded, permission)) {
    throw new ForbiddenError(`Forbidden: Missing permission ${permission}`);
  }
  return decoded;
}
