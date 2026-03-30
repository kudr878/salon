import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  siteLogin,
  siteMe,
  siteRegister,
  type SiteClient,
} from '../api/site'

const TOKEN_KEY = 'salon_site_token'

type AuthModalMode = 'none' | 'login' | 'register'

type AuthContextValue = {
  token: string | null
  client: SiteClient | null
  sessionLoading: boolean
  login: (phone: string, password: string) => Promise<void>
  register: (data: {
    fullName: string
    birthDate: string
    gender: 'M' | 'F'
    phone: string
    email: string
    password: string
  }) => Promise<void>
  logout: () => void
  refreshClient: () => Promise<void>
  authModal: AuthModalMode
  openLogin: () => void
  openRegister: () => void
  closeAuthModal: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  )
  const [client, setClient] = useState<SiteClient | null>(null)
  const [sessionLoading, setSessionLoading] = useState(Boolean(token))
  const [authModal, setAuthModal] = useState<AuthModalMode>('none')

  const setStoredToken = useCallback((t: string | null) => {
    setToken(t)
    if (t) {
      localStorage.setItem(TOKEN_KEY, t)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }, [])

  const refreshClient = useCallback(async () => {
    if (!token) {
      setClient(null)
      return
    }
    const me = await siteMe(token)
    setClient(me.client)
  }, [token])

  useEffect(() => {
    if (!token) {
      setClient(null)
      setSessionLoading(false)
      return
    }
    let cancelled = false
    setSessionLoading(true)
    siteMe(token)
      .then((me) => {
        if (!cancelled) {
          setClient(me.client)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStoredToken(null)
          setClient(null)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSessionLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [token, setStoredToken])

  const login = useCallback(
    async (phone: string, password: string) => {
      const r = await siteLogin(phone, password)
      setStoredToken(r.token)
      setClient(r.client)
      setAuthModal('none')
    },
    [setStoredToken],
  )

  const register = useCallback(
    async (data: {
      fullName: string
      birthDate: string
      gender: 'M' | 'F'
      phone: string
      email: string
      password: string
    }) => {
      const r = await siteRegister(data)
      setStoredToken(r.token)
      setClient(r.client)
      setAuthModal('none')
    },
    [setStoredToken],
  )

  const logout = useCallback(() => {
    setStoredToken(null)
    setClient(null)
  }, [setStoredToken])

  const value = useMemo(
    () => ({
      token,
      client,
      sessionLoading,
      login,
      register,
      logout,
      refreshClient,
      authModal,
      openLogin: () => setAuthModal('login'),
      openRegister: () => setAuthModal('register'),
      closeAuthModal: () => setAuthModal('none'),
    }),
    [
      token,
      client,
      sessionLoading,
      login,
      register,
      logout,
      refreshClient,
      authModal,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth вне AuthProvider')
  }
  return ctx
}
