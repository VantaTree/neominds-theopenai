import { createMiddleware } from "@tanstack/react-start";
import { requireAdmin } from "../auth/permissions";

export const adminMiddleware = createMiddleware()
  .server(async ({ next }) => {
    const user = await requireAdmin();
    return next({
      context: {
        user,
      },
    });
  });
