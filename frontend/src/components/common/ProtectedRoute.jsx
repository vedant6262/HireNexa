import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthProvider'
import LoadingScreen from './LoadingScreen'
import { useProfile } from '../../hooks/useProfile'

export default function ProtectedRoute({ children, redirectTo = '/login' }) {
  const auth = useAuth()
  const location = useLocation()

  const isLoaded = auth.isLoaded ?? true
  const profileQuery = useProfile({ enabled: isLoaded && Boolean(auth.isSignedIn) })
  if (!isLoaded) return <LoadingScreen />
  if (!auth.isSignedIn) return <Navigate to={redirectTo} state={{ from: location }} replace />
  if (profileQuery.isLoading) return <LoadingScreen />
  return children
}
