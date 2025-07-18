'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock authentication - in real implementation this would connect to Firebase Auth
    setLoading(false)
    setUser({ id: 'mock-user', email: 'user@example.com' }) // Mock user for demo
  }, [])

  const signIn = async (email: string, _password: string) => {
    // Mock sign in
    setUser({ id: 'mock-user', email })
  }

  const signUp = async (email: string, _password: string) => {
    // Mock sign up
    setUser({ id: 'mock-user', email })
  }

  const signOut = async () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}