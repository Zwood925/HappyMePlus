import { useSessionContext } from "@supabase/auth-helpers-react"
import { useEffect, useState } from "react"

export function useUser() {
  const { session, isLoading } = useSessionContext()
  const [user, setUser] = useState(session?.user ?? null)

  useEffect(() => {
    setUser(session?.user ?? null)
  }, [session])

  return { user, isLoading }
}
