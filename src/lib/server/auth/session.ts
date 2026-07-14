export { verifyServerSession, type DecodedSession } from "../../server-functions/auth";

export async function requireAuth() {
  const { verifyServerSession } = await import("../../server-functions/auth");
  return verifyServerSession();
}
