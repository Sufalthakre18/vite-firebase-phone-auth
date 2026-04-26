import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'

export function useAuth() {
  const [user, setUser] = useState(undefined) 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u ?? null))
    return unsubscribe
  }, [])

  return { user, loading: user === undefined }
}