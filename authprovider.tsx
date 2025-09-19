import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (provider: string) => Promise<void>
  signOut: () => Promise<void>
  getSession: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const getSession = useCallback(async (): Promise<User | null> => {
    const res = await fetch('/api/auth/session')
    if (!res.ok) {
      throw new Error('Failed to fetch session')
    }
    const data = await res.json()
    return data.user || null
  }, [])

  const signIn = useCallback(async (provider: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || 'Sign in failed')
      }
      const data = await res.json()
      setUser(data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/signout', { method: 'POST' })
      if (!res.ok) {
        throw new Error('Sign out failed')
      }
      setUser(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    const initialize = async () => {
      setLoading(true)
      setError(null)
      try {
        const sessionUser = await getSession()
        if (isMounted) {
          setUser(sessionUser)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    initialize()
    return () => {
      isMounted = false
    }
  }, [getSession])

  const value = useMemo(
    () => ({ user, loading, error, signIn, signOut, getSession }),
    [user, loading, error, signIn, signOut, getSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
