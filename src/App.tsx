
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
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
    <BrowserRouter>
      <Routes>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
