import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import RoleBasedRoute from './components/RoleBasedRoute'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Bookings from './pages/Bookings'
import Screening from './pages/Screening'
import Resources from './pages/Resources'
import AdminDashboard from './pages/AdminDashboard'
import AdminAnalytics from './pages/AdminAnalytics'
import UserManagement from './pages/UserManagement'
import AdminVideoManager from './pages/AdminVideoManager'
import StudentDashboard from './pages/StudentDashboard'
import PeerCommunity from './pages/PeerCommunity'
import SampleLogins from './pages/SampleLogins'
import CounsellorDashboard from './pages/CounsellorDashboard'
import CounsellorProfile from './pages/CounsellorProfile'
import CounsellorBookings from './pages/CounsellorBookings'
import AIChatbot from './pages/AIChatbot'
import BreathingExercisePage from './pages/BreathingExercisePage'
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
              <RoleBasedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </RoleBasedRoute>
            } />
            <Route path="bookings" element={
              <RoleBasedRoute allowedRoles={['student']}>
                <Bookings />
              </RoleBasedRoute>
            } />
            <Route path="screening" element={
              <RoleBasedRoute allowedRoles={['student']}>
                <Screening />
              </RoleBasedRoute>
            } />
            <Route path="resources" element={<Resources />} />
            <Route path="admin" element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleBasedRoute>
            } />
            <Route path="admin/users" element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <UserManagement />
              </RoleBasedRoute>
            } />
            <Route path="admin/videos" element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <AdminVideoManager />
              </RoleBasedRoute>
            } />
            <Route path="admin/analytics" element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <AdminAnalytics />
              </RoleBasedRoute>
            } />
            <Route path="peer-community" element={
              <RoleBasedRoute allowedRoles={['student', 'counsellor', 'admin']}>
                <PeerCommunity />
              </RoleBasedRoute>
            } />
            <Route path="counsellor-dashboard" element={
              <RoleBasedRoute allowedRoles={['counsellor']}>
                <CounsellorDashboard />
              </RoleBasedRoute>
            } />
            <Route path="counsellor-profile" element={
              <RoleBasedRoute allowedRoles={['counsellor']}>
                <CounsellorProfile />
              </RoleBasedRoute>
            } />
            <Route path="counsellor-bookings" element={
              <RoleBasedRoute allowedRoles={['counsellor']}>
                <CounsellorBookings />
              </RoleBasedRoute>
            } />
            <Route path="ai-chatbot" element={
              <RoleBasedRoute allowedRoles={['student', 'counsellor', 'admin']}>
                <AIChatbot />
              </RoleBasedRoute>
            } />
            <Route path="breathing-exercise" element={
              <RoleBasedRoute allowedRoles={['student', 'counsellor', 'admin']}>
                <BreathingExercisePage />
              </RoleBasedRoute>
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
