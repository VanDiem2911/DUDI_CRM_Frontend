import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DataManagement from './pages/admin/DataManagement';
import EmployeeManagement from './pages/admin/EmployeeManagement';

// Employee Pages
import EmployeeData from './pages/employee/EmployeeData';

// Route protection: Logged-in check
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Route protection: Admin role check
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'ROLE_ADMIN' ? children : <Navigate to="/unauthorized" replace />;
};

// Route protection: Employee role check
const EmployeeRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'ROLE_EMPLOYEE' ? children : <Navigate to="/unauthorized" replace />;
};

// Home router redirector based on current user session role
const HomeRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'ROLE_ADMIN' ? <Navigate to="/admin" replace /> : <Navigate to="/employee" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Root route router */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Admin routes group */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/data"
            element={
              <AdminRoute>
                <Layout>
                  <DataManagement />
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/employees"
            element={
              <AdminRoute>
                <Layout>
                  <EmployeeManagement />
                </Layout>
              </AdminRoute>
            }
          />


          {/* Employee routes group */}
          <Route
            path="/employee"
            element={
              <EmployeeRoute>
                <Layout>
                  <EmployeeData />
                </Layout>
              </EmployeeRoute>
            }
          />
          <Route
            path="/employee/data"
            element={<Navigate to="/employee" replace />}
          />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
