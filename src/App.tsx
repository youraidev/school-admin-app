import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RequireAuth } from './components/auth/RequireAuth';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Index from './pages/Index';
import StudentsPage from './pages/StudentsPage';
import StudentDetailPage from './pages/StudentDetailPage';
import StaffPage from './pages/StaffPage';
import AddStaffPage from './pages/AddStaffPage';
import EditStaffPage from './pages/EditStaffPage';
import StaffDetailPage from './pages/StaffDetailPage';
import DepartmentsPage from './pages/DepartmentsPage';
import AddDepartmentPage from './pages/AddDepartmentPage';
import EditDepartmentPage from './pages/EditDepartmentPage';
import CompliancePage from './pages/CompliancePage';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"            element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password"  element={<ResetPasswordPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Index />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="students/:id" element={<StudentDetailPage />} />
              <Route path="staff" element={<StaffPage />} />
              <Route path="staff/new" element={<AddStaffPage />} />
              <Route path="staff/:id/edit" element={<EditStaffPage />} />
              <Route path="staff/:id" element={<StaffDetailPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="departments/new" element={<AddDepartmentPage />} />
              <Route path="departments/:id/edit" element={<EditDepartmentPage />} />
              <Route path="compliance" element={<CompliancePage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
