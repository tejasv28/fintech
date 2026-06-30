import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import ProtectedRoute from './components/layout/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AllApplications from './pages/admin/AllApplications';
import AllActiveLoans from './pages/admin/AllActiveLoans';
import OfficerReports from './pages/admin/OfficerReports';

// Officer Pages
import OfficerDashboard from './pages/officer/OfficerDashboard';
import ApplicationQueue from './pages/officer/ApplicationQueue';
import ApplicationDetail from './pages/officer/ApplicationDetail';

// Applicant Pages
import ApplicantDashboard from './pages/applicant/ApplicantDashboard';
import ApplyLoan from './pages/applicant/ApplyLoan';
import MyApplications from './pages/applicant/MyApplications';
import MyLoans from './pages/applicant/MyLoans';
import EligibilityChecker from './pages/applicant/EligibilityChecker';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/applications" element={<ProtectedRoute allowedRoles={['ADMIN']}><AllApplications /></ProtectedRoute>} />
        <Route path="/admin/loans" element={<ProtectedRoute allowedRoles={['ADMIN']}><AllActiveLoans /></ProtectedRoute>} />
        <Route path="/admin/officer-reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><OfficerReports /></ProtectedRoute>} />

        {/* Officer Routes */}
        <Route path="/officer" element={<ProtectedRoute allowedRoles={['LOAN_OFFICER']}><OfficerDashboard /></ProtectedRoute>} />
        <Route path="/officer/queue" element={<ProtectedRoute allowedRoles={['LOAN_OFFICER']}><ApplicationQueue /></ProtectedRoute>} />
        <Route path="/officer/applications/:id" element={<ProtectedRoute allowedRoles={['LOAN_OFFICER']}><ApplicationDetail /></ProtectedRoute>} />

        {/* Applicant Routes */}
        <Route path="/applicant" element={<ProtectedRoute allowedRoles={['APPLICANT']}><ApplicantDashboard /></ProtectedRoute>} />
        <Route path="/applicant/apply" element={<ProtectedRoute allowedRoles={['APPLICANT']}><ApplyLoan /></ProtectedRoute>} />
        <Route path="/applicant/eligibility-check" element={<ProtectedRoute allowedRoles={['APPLICANT']}><EligibilityChecker /></ProtectedRoute>} />
        <Route path="/applicant/applications" element={<ProtectedRoute allowedRoles={['APPLICANT']}><MyApplications /></ProtectedRoute>} />
        <Route path="/applicant/loans" element={<ProtectedRoute allowedRoles={['APPLICANT']}><MyLoans /></ProtectedRoute>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
