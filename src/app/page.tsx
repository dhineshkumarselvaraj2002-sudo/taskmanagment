import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function Home() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/signin")
  }

  // Redirect to appropriate dashboard based on user role
  if (session.user.role === "ADMIN") {
    redirect("/admin/dashboard")
  } else {
    redirect("/user/dashboard")
  }
}
