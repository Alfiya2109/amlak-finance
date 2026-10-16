import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadLetterPage } from './pages/UploadLetterPage';
import { CreateUserPage } from './pages/CreateUserPage';
import { VerifyPublicPage } from './pages/VerifyPublicPage';
import { ProcurementPage } from './pages/ProcurementPage';
import { ApprovalHubPage } from './pages/ApprovalHubPage';
import { PurchaseOrdersPage } from './pages/PurchaseOrdersPage';
import { InvoiceMatchPage } from './pages/InvoiceMatchPage';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Sidebar>{children}</Sidebar>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Verification Route */}
          <Route path="/verify/:id" element={<VerifyPublicPage />} />

          {/* Root & Login Route */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadLetterPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/procurement"
            element={
              <ProtectedRoute>
                <ProcurementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/approvals"
            element={
              <ProtectedRoute>
                <ApprovalHubPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/purchase-orders"
            element={
              <ProtectedRoute>
                <PurchaseOrdersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <InvoiceMatchPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-user"
            element={
              <ProtectedRoute adminOnly={true}>
                <CreateUserPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
