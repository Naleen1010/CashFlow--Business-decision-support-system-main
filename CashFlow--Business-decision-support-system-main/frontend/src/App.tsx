import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

// Auth components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Layout
import DashboardLayout from './components/Layout/DashboardLayout';
import POSHome from './components/POS/POSHome';
import InventoryHome from './components/Inventory/InventoryHome';
import SettingsHome from './components/Settings/SettingsHome';
import CustomersHome from './components/Customers/CustomersHome';
import InvoicesHome from './components/Invoices/InvoicesHome';

import { SettingsProvider } from './contexts/SettingsContext';
import OrdersHome from './components/Orders/OrdersHome';
import OrderDetails from './components/Orders/OrderDetails';
import OrderEdit from './components/Orders/OrderEdit';
import HelpHome from './components/Help/HelpHome';
import DashboardHome from './components/Dashboard/DashboardHome';
import ProfilePage from './components/Profile/ProfilePage'; // Import the new component

// Protected route wrapper
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}>
        <CircularProgress sx={{ color: '#a855f7' }} />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

// Public route wrapper
interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}>
        <CircularProgress sx={{ color: '#a855f7' }} />
      </Box>
    );
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              
              {/* Protected Routes */}
              <Route path="/pos" element={<ProtectedRoute><POSHome /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute><InventoryHome /></ProtectedRoute>} />

              {/* Orders Routes */}
              <Route path="/orders" element={<ProtectedRoute><OrdersHome /></ProtectedRoute>} />
              <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
              <Route path="/orders/edit/:orderId" element={<ProtectedRoute><OrderEdit /></ProtectedRoute>} />
              
              <Route path="/customers" element={<ProtectedRoute><CustomersHome /></ProtectedRoute>} />
              <Route path="/invoices" element={<ProtectedRoute><InvoicesHome /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsHome /></ProtectedRoute>} />
              <Route path="/help" element={<ProtectedRoute><HelpHome /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Default Routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;