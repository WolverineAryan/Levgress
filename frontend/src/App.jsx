import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Loader2 } from 'lucide-react';

// Lazy Loaded Pages for performance optimization
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Signup = lazy(() => import('./pages/Signup').then(m => ({ default: m.Signup })));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const Projects = lazy(() => import('./pages/Projects').then(m => ({ default: m.Projects })));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails').then(m => ({ default: m.ProjectDetails })));
const Skills = lazy(() => import('./pages/Skills').then(m => ({ default: m.Skills })));
const Badges = lazy(() => import('./pages/Badges').then(m => ({ default: m.Badges })));
const Leaderboard = lazy(() => import('./pages/Leaderboard').then(m => ({ default: m.Leaderboard })));
const AIInsights = lazy(() => import('./pages/AIInsights').then(m => ({ default: m.AIInsights })));
const StaffDashboard = lazy(() => import('./pages/StaffDashboard').then(m => ({ default: m.StaffDashboard })));
const ProjectReview = lazy(() => import('./pages/ProjectReview').then(m => ({ default: m.ProjectReview })));
const Onboarding = lazy(() => import('./pages/Onboarding').then(m => ({ default: m.Onboarding })));
const UserProfile = lazy(() => import('./pages/UserProfile').then(m => ({ default: m.UserProfile })));
const SkillTester = lazy(() => import('./pages/SkillTester').then(m => ({ default: m.SkillTester })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const ProjectsShowcase = lazy(() => import('./pages/ProjectsShowcase').then(m => ({ default: m.ProjectsShowcase })));
const Certificates = lazy(() => import('./pages/Certificates').then(m => ({ default: m.Certificates })));
const CertificateManagement = lazy(() => import('./pages/CertificateManagement').then(m => ({ default: m.CertificateManagement })));
const Announcements = lazy(() => import('./pages/Announcements').then(m => ({ default: m.Announcements })));

const PageFallbackLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Suspense fallback={<PageFallbackLoader />}>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Onboarding Route */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute isOnboardingPage={true}>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />

              {/* Authenticated Layout Routes */}
              <Route element={<Layout />}>
                
                {/* Student & Shared Role Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <Projects />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/project/:id"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT', 'STAFF']}>
                      <ProjectDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/skills"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <Skills />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/badges"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <Badges />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/certificates"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <Certificates />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/announcements"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT', 'STAFF']}>
                      <Announcements />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leaderboard"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT', 'STAFF']}>
                      <Leaderboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-insights"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <AIInsights />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/:id"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT', 'STAFF']}>
                      <UserProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT', 'STAFF']}>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tester"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <SkillTester />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/showcase"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT', 'STAFF']}>
                      <ProjectsShowcase />
                    </ProtectedRoute>
                  }
                />

                {/* Staff/Instructor Role Routes */}
                <Route
                  path="/staff-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['STAFF']}>
                      <StaffDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/project-review"
                  element={
                    <ProtectedRoute allowedRoles={['STAFF']}>
                      <ProjectReview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/certificate-management"
                  element={
                    <ProtectedRoute allowedRoles={['STAFF']}>
                      <CertificateManagement />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Fallback Catch-All Redirect */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
