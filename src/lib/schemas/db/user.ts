import { z } from "zod";
import { DateField } from "../common";

export const UserStatusEnum = z.enum(["Active", "Inactive", "Suspended"]);
export type UserStatus = z.infer<typeof UserStatusEnum>;

export const UserRoleEnum = z.enum(["admin", "client"]);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const UserSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  fullName: z.string().default(""),
  image: z.string().url().optional(),
  phone: z.string().default(""),
  role: UserRoleEnum.default("client"),
  status: UserStatusEnum.default("Active"),
  businessCount: z.number().int().nonnegative().default(0),
  createdAt: DateField,
  updatedAt: DateField,
});

export type User = z.infer<typeof UserSchema>;
