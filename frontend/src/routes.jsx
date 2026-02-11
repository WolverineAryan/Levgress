import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import StudentDashboard from "./pages/student/Dashboard";
import StaffDashboard from "./pages/staff/Dashboard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/staff" element={<StaffDashboard />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
