import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import StudentDashboard from "./pages/student/StudentDashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";
import ProtectedRoute from "./auth/ProtectedRoute";
import RoleGuard from "./auth/RoleGuard";
import Signup from "./pages/auth/Signup";
import Layout from "./components/layout/Layout";
import Skills from "./pages/student/Skills";
import Projects from "./pages/student/Projects";
import Badges from "./pages/student/Badges";
import ToastProvider from "./components/notifications/ToastProvider";
import ProjectReview from "./pages/staff/ProjectReview";
import StaffAnalytics from "./pages/staff/StaffAnalytics";

export default function App() {
  return (
    <>
      <ToastProvider />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Student */}
        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRole="STUDENT">
                <Layout>
                  <StudentDashboard />
                </Layout>
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/skills"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRole="STUDENT">
                <Layout>
                  <Skills />
                </Layout>
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/projects"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRole="STUDENT">
                <Layout>
                  <Projects />
                </Layout>
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/badges"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRole="STUDENT">
                <Layout>
                  <Badges />
                </Layout>
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        {/* Staff */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRole="STAFF">
                <Layout>
                  <StaffDashboard />
                </Layout>
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/analytics"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRole="STAFF">
                <Layout>
                  <StaffAnalytics />
                </Layout>
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/projects"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRole="STAFF">
                <Layout>
                  <ProjectReview />
                </Layout>
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
