import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CustomerForm from './pages/CustomerForm';
import CustomerDetails from './pages/CustomerDetails';
import CustomerList from './pages/CustomerList';
import Contacts from './pages/Contact';
import AddContact from './pages/AddContact';
import EmpDashboard from './pages/EmpDashboard';
import AdminDashboard from './components/AdminDashboard';
import WhatsAppGenerator from './pages/WhatsAppGenerator';
import MessageTemplate from './pages/MessageTemplate';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

// Role-based redirect component
const RoleBasedRedirect = () => {
  const { employeeData } = useAuth();

  // Check if user is an employee/agent
  const isEmployee = employeeData &&
    (employeeData.role?.toLowerCase() === 'agent' || employeeData.role?.toLowerCase() === 'employee');

  if (isEmployee) {
    return <Navigate to="/emp-dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } />

          {/* backward-compatible route: redirect old /AdminDashboard to /dashboard */}
          <Route path="/AdminDashboard" element={<Navigate to="/dashboard" replace />} />

          <Route path="/emp-dashboard" element={
            <ProtectedRoute>
              <Layout>
                <EmpDashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/customer-list" element={
            <ProtectedRoute>
              <Layout>
                <CustomerList />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/customer/:id/edit" element={
            <ProtectedRoute>
              <Layout>
                <CustomerForm />
              </Layout>
            </ProtectedRoute>
          } />




          <Route path="/customer/:id" element={
            <ProtectedRoute>
              <Layout>
                <CustomerDetails />
              </Layout>
            </ProtectedRoute>
          } />


          <Route path="/loan-categories" element={
            <ProtectedRoute>
              <Layout>
                <CustomerList />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/loan-categories/auto/:subtype" element={
            <ProtectedRoute>
              <Layout>
                {/* AutoLoanDetail component removed — redirecting to Loan Categories */}
                <Navigate to="/loan-categories" replace />
              </Layout>
            </ProtectedRoute>
          } />



          <Route path="/contacts" element={
            <ProtectedRoute>
              <Layout>
                <Contacts />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/add-contact" element={
            <ProtectedRoute>
              <Layout>
                <AddContact />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/edit-contact/:id" element={
            <ProtectedRoute>
              <Layout>
                <AddContact />
              </Layout>
            </ProtectedRoute>
          } />



          <Route path="/whatsapp-reminder/:id" element={
            <ProtectedRoute>
              <Layout>
                <WhatsAppGenerator />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/message-template" element={
            <ProtectedRoute>
              <Layout>
                <MessageTemplate />
              </Layout>
            </ProtectedRoute>
          } />


          <Route path="/" element={
            <ProtectedRoute>
              <RoleBasedRedirect />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
