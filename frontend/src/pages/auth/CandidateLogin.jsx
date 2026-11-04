import { Navigate, Link, useLocation } from 'react-router-dom'
import { SignIn } from '@clerk/clerk-react'
import { useAuth } from '../../context/AuthProvider'
import { HiOutlineBriefcase } from 'react-icons/hi2'

export default function CandidateLogin() {
  const { isSignedIn } = useAuth()
  const location = useLocation()

  if (isSignedIn) {
    return <Navigate to={location.state?.from?.pathname || '/dashboard'} replace />
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <HiOutlineBriefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl gradient-text">JobPortal</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-6">Candidate Sign In</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to manage applications, saved jobs and more</p>
        </div>

        <div className="glass-card p-6">
          <SignIn routing="path" path="/login" fallbackRedirectUrl="/dashboard" forceRedirectUrl="/dashboard" />
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          New to JobPortal?{' '}
          <Link to="/signup" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
