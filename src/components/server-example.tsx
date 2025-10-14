import { auth } from "@/lib/auth"

export async function ServerExample() {
  const session = await auth()
  
  if (!session) {
    return <p>Not authenticated</p>
  }
  
  return (
    <div className="p-4 bg-green-100 rounded-lg">
      <h3 className="font-semibold">Server Component</h3>
      <p>Hello {session.user?.name}!</p>
      <p>Email: {session.user?.email}</p>
      {session.user?.role && <p>Role: {session.user.role}</p>}
    </div>
  )
}
