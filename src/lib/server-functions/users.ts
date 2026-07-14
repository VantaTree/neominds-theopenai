import { createServerFn } from "@tanstack/react-start";
import { adminMiddleware, authenticatedMiddleware } from "./middleware";
import {
  GetUserSchema,
  DeleteUserSchema,
  EnsureUserDocumentSchema,
  CheckUserExistsSchema,
  SaveUserSchema,
} from "../schemas/api/users";

export const getUsersFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const { UserRepository } = await import("../server/repositories/user.repository");
    const userRepo = new UserRepository();
    return userRepo.getUsers();
  });

export const getUserFn = createServerFn({ method: "GET" })
  .validator((d: any) => GetUserSchema.parse(d))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data }) => {
    const { requireUserOwner } = await import("../server/auth/ownership");
    const { user } = await requireUserOwner(data);
    return user;
  });

export const saveUserFn = createServerFn({ method: "POST" })
  .validator((d: any) => SaveUserSchema.parse(d))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data }) => {
    const { requireUserOwner } = await import("../server/auth/ownership");
    const { UserRepository } = await import("../server/repositories/user.repository");
    
    const { decoded, user: existingUser } = await requireUserOwner(data.id);
    
    if (decoded.admin !== true && data.email !== decoded.email) {
      throw new Error("BadRequest: You cannot change your account email address.");
    }

    if (decoded.admin !== true) {
      data.role = existingUser?.role || "client";
      data.status = existingUser?.status || "Active";
      data.businessCount = existingUser?.businessCount || 0;
    }

    data.updatedAt = new Date();
    const userRepo = new UserRepository();
    await userRepo.saveUser(data);
    return data;
  });

export const deleteUserFn = createServerFn({ method: "POST" })
  .validator((d: any) => DeleteUserSchema.parse(d))
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const { UserRepository } = await import("../server/repositories/user.repository");
    const userRepo = new UserRepository();
    await userRepo.deleteUser(data);
    return { success: true };
  });

export const ensureUserDocumentFn = createServerFn({ method: "POST" })
  .validator((d: any) => EnsureUserDocumentSchema.parse(d))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const { AuthService } = await import("../server/services/auth.service");
    
    const decoded = context.user;
    if (data.user.uid !== decoded.uid) {
      throw new Error("Unauthorized: User ID mismatch.");
    }
    const authService = new AuthService();
    return authService.ensureUserDocument(data.user);
  });

export const checkUserExistsFn = createServerFn({ method: "POST" })
  .validator((d: any) => CheckUserExistsSchema.parse(d))
  .handler(async ({ data }) => {
    const { AuthService } = await import("../server/services/auth.service");
    const authService = new AuthService();
    const exists = await authService.checkUserExists(data.uid);
    return { exists };
  });

export const checkUserRoleFn = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { verifyServerSession } = await import("./auth");
      const decoded = await verifyServerSession();
      return {
        role: decoded.admin === true ? "admin" : "client",
        email: decoded.email,
        uid: decoded.uid,
      };
    } catch {
      return { role: null };
    }
  });

export const getProfileFn = createServerFn({ method: "GET" })
  .validator((d: any) => GetUserSchema.parse(d))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data }) => {
    const { requireUserOwner } = await import("../server/auth/ownership");
    const { user } = await requireUserOwner(data);
    return user;
  });

export const saveProfileFn = createServerFn({ method: "POST" })
  .validator((d: any) => SaveUserSchema.parse(d))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data }) => {
    const { requireUserOwner } = await import("../server/auth/ownership");
    const { UserRepository } = await import("../server/repositories/user.repository");
    
    const { decoded, user: existingUser } = await requireUserOwner(data.id);
    if (decoded.admin !== true && data.email !== decoded.email) {
      throw new Error("BadRequest: You cannot change your account email address.");
    }
    if (decoded.admin !== true) {
      data.role = existingUser?.role || "client";
      data.status = existingUser?.status || "Active";
      data.businessCount = existingUser?.businessCount || 0;
    }
    data.updatedAt = new Date();
    const userRepo = new UserRepository();
    await userRepo.saveUser(data);
    return data;
  });
