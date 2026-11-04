import {
  ClerkProvider,
  SignInButton as ClerkSignInButton,
  SignUpButton as ClerkSignUpButton,
  SignIn as ClerkSignIn,
  SignUp as ClerkSignUp,
  useAuth as useClerkAuth,
  useUser as useClerkUser,
} from '@clerk/clerk-react'
import { useState } from 'react'
import { useEffect } from 'react'
import { setAuthTokenGetter } from '../utils/api'

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const hasClerkKey = CLERK_KEY?.startsWith('pk_') && !CLERK_KEY.includes('xxx')
export const isLocalAuth = import.meta.env.DEV && import.meta.env.VITE_USE_LOCAL_AUTH === 'true'

export function useAuth() {
  if (isLocalAuth) {
    return {
      isLoaded: true,
      isSignedIn: Boolean(localStorage.getItem('local-auth-user')),
      signOut: async () => localStorage.removeItem('local-auth-user'),
    }
  }
  return useClerkAuth()
}

export function useUser() {
  if (isLocalAuth) {
    const storedUser = localStorage.getItem('local-auth-user')
    return {
      isLoaded: true,
      user: storedUser ? JSON.parse(storedUser) : null,
    }
  }
  return useClerkUser()
}

function LocalAuthButton({ children, forceRedirectUrl = '/' }) {
  const handleClick = () => {
    localStorage.setItem('local-auth-user', JSON.stringify({
      id: 'mock-user-1',
      fullName: 'Local User',
      imageUrl: '',
    }))
    window.location.assign(forceRedirectUrl)
  }

  return <button type="button" onClick={handleClick}>{children}</button>
}

export function SignInButton({ children, ...props }) {
  return isLocalAuth ? <LocalAuthButton {...props}>{children}</LocalAuthButton> : <ClerkSignInButton {...props}>{children}</ClerkSignInButton>
}

export function SignUpButton({ children, ...props }) {
  return isLocalAuth ? <LocalAuthButton {...props}>{children}</LocalAuthButton> : <ClerkSignUpButton {...props}>{children}</ClerkSignUpButton>
}

function LocalAuthForm({ mode, redirectUrl = '/' }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const submit = (event) => {
    event.preventDefault()
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    const recruiter = window.location.pathname.startsWith('/recruiter')
    localStorage.setItem('local-auth-user', JSON.stringify({
      id: recruiter ? 'recruiter_clerk_1' : 'mock-user-1',
      fullName: recruiter ? 'Local Recruiter' : 'Local Candidate',
      imageUrl: '',
    }))
    window.location.assign(redirectUrl)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="local-auth-email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
        <input id="local-auth-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input-field" placeholder="you@example.com" autoComplete="email" />
      </div>
      {mode === 'signup' && (
        <div>
          <label htmlFor="local-auth-password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
          <input id="local-auth-password" type="password" className="input-field" placeholder="At least 8 characters" minLength={8} required />
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="btn-primary w-full justify-center">
        {mode === 'signup' ? 'Create account' : 'Sign in'}
      </button>
      <p className="text-center text-xs text-slate-500">Local development authentication is enabled.</p>
    </form>
  )
}

export function SignIn({ fallbackRedirectUrl = '/', ...props }) {
  return isLocalAuth ? <LocalAuthForm mode="signin" redirectUrl={fallbackRedirectUrl} /> : <ClerkSignIn {...props} fallbackRedirectUrl={fallbackRedirectUrl} />
}

export function SignUp({ fallbackRedirectUrl = '/', ...props }) {
  return isLocalAuth ? <LocalAuthForm mode="signup" redirectUrl={fallbackRedirectUrl} /> : <ClerkSignUp {...props} fallbackRedirectUrl={fallbackRedirectUrl} />
}

function ClerkAuthBridge({ children }) {
  const { getToken } = useClerkAuth()

  useEffect(() => {
    setAuthTokenGetter(getToken)
    return () => setAuthTokenGetter(null)
  }, [getToken])

  return children
}

export default function AuthProvider({ children }) {
  if (isLocalAuth) return children

  if (!hasClerkKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-900">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Clerk configuration required</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Set VITE_CLERK_PUBLISHABLE_KEY in frontend/.env and restart the frontend.</p>
        </div>
      </div>
    )
  }

  return (
    <ClerkProvider publishableKey={CLERK_KEY}>
      <ClerkAuthBridge>{children}</ClerkAuthBridge>
    </ClerkProvider>
  )
}
