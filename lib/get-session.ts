import { auth } from "@/lib/auth"

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function requireAuth(): Promise<{ id: string; email: string; name: string | null }> {
  const user = await getCurrentUser()
  if (!user || !user.id || !user.email) {
    const { redirect } = await import("next/navigation")
    redirect("/login")
    // redirect()はneverを返すため、ここには到達しません
    throw new Error("Unauthorized")
  }
  // この時点でuserは確実に存在し、idとemailも存在します
  return {
    id: user.id,
    email: user.email,
    name: user.name || null,
  }
}

