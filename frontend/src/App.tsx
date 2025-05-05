import { Route, Routes, Navigate } from 'react-router'
import { MainLayout } from './components/global/main-layout'
import Landing from './app/landing/page'
import Login from './app/auth/login/login'
import PageNotFound from './app/page-not-found/page'
import Dashboard from './app/main/page'
import AuthLayout from './app/auth/layout'
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/protected-route'
import DashboardLayout from './app/main/layout'
import ForgotPassword from './app/auth/forgot-password/page'

function App() {
  return (
    <MainLayout>
      <Routes>
        {/* Public routes */}
        <Route path="/landing" element={<Landing />} />
        
        {/* Auth routes (only accessible if NOT logged in) */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          } />
          <Route path="forgot-password" element={
            <PublicOnlyRoute>
              <ForgotPassword />
            </PublicOnlyRoute>
          } />
        </Route>
        
        {/* 404 route - explicitly defined paths */}
        <Route path="/404" element={<PageNotFound />} />
        
        {/* Protected routes (require authentication) */}
        <Route element={<DashboardLayout />}>
          {/* Course Masters routes */}
  

          {/* Dashboard and other routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Catch-all redirect to 404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </MainLayout>
  )
}

export default App