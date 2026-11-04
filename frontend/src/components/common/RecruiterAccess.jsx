import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthProvider'
import api from '../../utils/api'
import LoadingScreen from './LoadingScreen'

export default function RecruiterAccess({ children }) {
  const auth = useAuth()
  const location = useLocation()
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  const enableAccess = () => {
    setError('')
    setReady(false)
    api.post('/users/activate-recruiter')
      .then(() => setReady(true))
      .catch((requestError) => setError(requestError.message))
  }

  useEffect(() => {
    if (auth.isLoaded === false || !auth.isSignedIn) return
    enableAccess()
  }, [auth.isLoaded, auth.isSignedIn])

  if (auth.isLoaded === false) return <LoadingScreen />
  if (!auth.isSignedIn) return <Navigate to="/recruiter/login" state={{ from: location }} replace />
  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card max-w-md p-6 text-center">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Could not open recruiter dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
        <button type="button" onClick={enableAccess} className="btn-primary mt-5">Try again</button>
      </div>
    </div>
  )
  if (!ready) return <LoadingScreen />
  return children
}
