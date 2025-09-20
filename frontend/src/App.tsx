import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Bookings from './pages/Bookings'
import Screening from './pages/Screening'
import Resources from './pages/Resources'
import AdminDashboard from './pages/AdminDashboard'
import UserManagement from './pages/UserManagement'
import StudentDashboard from './pages/StudentDashboard'
import PeerCommunity from './pages/PeerCommunity'
import SampleLogins from './pages/SampleLogins'
import CounsellorDashboard from './pages/CounsellorDashboard'
import CounsellorProfile from './pages/CounsellorProfile'
import CounsellorBookings from './pages/CounsellorBookings'
import NotFound from './pages/NotFound'

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="dashboard" element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="bookings" element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            } />
            <Route path="screening" element={
              <ProtectedRoute>
                <Screening />
              </ProtectedRoute>
            } />
            <Route path="resources" element={<Resources />} />
            <Route path="admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="admin/users" element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="peer-community" element={
              <ProtectedRoute>
                <PeerCommunity />
              </ProtectedRoute>
            } />
            <Route path="counsellor-dashboard" element={
              <ProtectedRoute>
                <CounsellorDashboard />
              </ProtectedRoute>
            } />
            <Route path="counsellor-profile" element={
              <ProtectedRoute>
                <CounsellorProfile />
              </ProtectedRoute>
            } />
            <Route path="counsellor-bookings" element={
              <ProtectedRoute>
                <CounsellorBookings />
              </ProtectedRoute>
            } />
            <Route path="sample-logins" element={<SampleLogins />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
