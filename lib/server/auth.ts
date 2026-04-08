import { hasSupabaseConfig } from "@/lib/server/env";
import { findUserById, getAuthSession } from "@/lib/server/repository";
import { getCurrentSession } from "@/lib/server/session";

export async function getSessionSummary() {
  const fallbackSession = await getAuthSession();
  const session = await getCurrentSession();
  const user = session ? await findUserById(session.userId) : null;

  return {
    ...fallbackSession,
    authenticated: Boolean(user),
    configured: hasSupabaseConfig(),
    user: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      : null,
  };
}
