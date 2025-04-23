import { Route, Routes } from 'react-router'
import { MainLayout } from './components/global/main-layout'
import Landing from './app/landing/page'
import Login from './app/auth/login/login'
import PageNotFound from './app/page-not-found/page'
import Dashboard from './app/main/page'
import AuthLayout from './app/auth/layout'
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/protected-route'
import DashboardLayout from './app/main/layout'

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
        </Route>
        
        {/* Protected routes (require authentication) */}
        <Route element={<DashboardLayout/>}>
        <Route path="/*" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        </Route>
      
        
        {/* 404 route */}
        <Route path="*" element={<PageNotFound/>} />
      </Routes>
    </MainLayout>
  )
}

export default App
 
 