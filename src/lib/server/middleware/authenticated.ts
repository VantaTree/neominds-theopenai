import { createMiddleware } from "@tanstack/react-start";
import { verifyServerSession } from "../auth/session";

export const authenticatedMiddleware = createMiddleware()
  .server(async ({ next }) => {
    const user = await verifyServerSession();
    return next({
      context: {
        user,
      },
    });
  });
