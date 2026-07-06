import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().nonempty(),
  email: z.string().email().nonempty(),
  bussiness: z.string(),
  joinedOn: z.date(),
  name: z.string(),
  phone: z.string(),
  plan: z.string().nonempty(),
  status: z.string().nonempty(),
});



export type User = z.infer<typeof UserSchema>;
