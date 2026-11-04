import { Navigate, Link } from 'react-router-dom'
import { SignUp, useAuth } from '../../context/AuthProvider'
import { HiOutlineBriefcase } from 'react-icons/hi2'

export default function RecruiterSignup() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Navigate to="/recruiter" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-900">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/25">
              <HiOutlineBriefcase className="h-5 w-5 text-white" />
            </div>
            <span className="gradient-text text-2xl font-bold">JobPortal</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">Create Recruiter Account</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Join JobPortal to connect with skilled candidates</p>
        </div>

        <div className="glass-card p-6">
          <SignUp routing="path" path="/recruiter/signup" fallbackRedirectUrl="/recruiter" forceRedirectUrl="/recruiter" unsafeMetadata={{ role: 'RECRUITER' }} />
        </div>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have a recruiter account?{' '}
          <Link to="/recruiter/login" className="font-medium text-primary-600 hover:underline dark:text-primary-400">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
