import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';

// Import Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { StudentDashboard } from './pages/StudentDashboard';
import { Projects } from './pages/Projects';
import { ProjectDetails } from './pages/ProjectDetails';
import { Skills } from './pages/Skills';
import { Badges } from './pages/Badges';
import { Leaderboard } from './pages/Leaderboard';
import { AIInsights } from './pages/AIInsights';
import { StaffDashboard } from './pages/StaffDashboard';
import { ProjectReview } from './pages/ProjectReview';
import { Onboarding } from './pages/Onboarding';
import { UserProfile } from './pages/UserProfile';
import { SkillTester } from './pages/SkillTester';
import { Settings } from './pages/Settings';
import { ProjectsShowcase } from './pages/ProjectsShowcase';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
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
              
              {/* Student Role Routes */}
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
            </Route>

            {/* Fallback Catch-All Redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
