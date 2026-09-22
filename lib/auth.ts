import { cookies } from "next/headers";

export const SESSION_COOKIE = "shinex_admin_session";

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === "true";
}
