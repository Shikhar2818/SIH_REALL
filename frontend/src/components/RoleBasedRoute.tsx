import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface RoleBasedRouteProps {
  children: React.ReactNode
  allowedRoles: ('student' | 'admin' | 'counsellor')[]
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default RoleBasedRoute
