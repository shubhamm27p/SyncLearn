import './App.css';
import { lazy, Suspense } from 'react';
import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contents/AuthContents.jsx';
import AppTheme from './shared-theme/AppTheme';
import withAuth from './utils/withAuth.jsx';
import { Toaster } from 'react-hot-toast';

import ErrorBoundary from './mcq_engine/components/ErrorBoundary.jsx';
import ProtectedRoute from './mcq_engine/components/ProtectedRoute.jsx';

const Authentication = lazy(() => import('./pages/authentication.jsx'));
const LandingPage = lazy(() => import('./pages/landing.jsx'));
const HomeComponent = lazy(() => import('./pages/home.jsx'));
const History = lazy(() => import('./pages/history.jsx'));
const VideoMeetComponent = lazy(() => import('./pages/videomate.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));
const AdminLogin = lazy(() => import('./pages/AdminLogin.jsx'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const ApplicationDetails = lazy(() => import('./pages/ApplicationDetails.jsx'));
const TermsAndConditions = lazy(() => import('./pages/termsAndConditions.jsx'));
const DashboardLayout = lazy(() => import('./mcq_engine/components/DashboardLayout.jsx'));
const Dashboard = lazy(() => import('./mcq_engine/pages/Dashboard.jsx'));
const MCQAdminDashboard = lazy(() => import('./mcq_engine/pages/admin/AdminDashboard.jsx'));
const ManageTests = lazy(() => import('./mcq_engine/pages/admin/ManageTests.jsx'));
const CreateTest = lazy(() => import('./mcq_engine/pages/admin/CreateTest.jsx'));
const EditTest = lazy(() => import('./mcq_engine/pages/admin/EditTest.jsx'));
const UploadQuestions = lazy(() => import('./mcq_engine/pages/admin/UploadQuestions.jsx'));
const UploadAnswerKey = lazy(() => import('./mcq_engine/pages/admin/UploadAnswerKey.jsx'));
const ManageStudents = lazy(() => import('./mcq_engine/pages/admin/ManageStudents.jsx'));
const ViewResults = lazy(() => import('./mcq_engine/pages/admin/ViewResults.jsx'));
const ManageCodingProblems = lazy(() => import('./mcq_engine/pages/admin/ManageCodingProblems.jsx'));
const ViewCodingSubmissions = lazy(() => import('./mcq_engine/pages/admin/ViewCodingSubmissions.jsx'));
const AdminCombinedResult = lazy(() => import('./mcq_engine/pages/admin/AdminCombinedResult.jsx'));
const StudentDashboard = lazy(() => import('./mcq_engine/pages/student/StudentDashboard.jsx'));
const TakeTest = lazy(() => import('./mcq_engine/pages/student/TakeTest.jsx'));
const MyResults = lazy(() => import('./mcq_engine/pages/student/MyResults.jsx'));
const ResultDetail = lazy(() => import('./mcq_engine/pages/student/ResultDetail.jsx'));
const TakeCodingTest = lazy(() => import('./mcq_engine/pages/student/TakeCodingTest.jsx'));
const CodingResults = lazy(() => import('./mcq_engine/pages/student/CodingResults.jsx'));
const CombinedResult = lazy(() => import('./mcq_engine/pages/student/CombinedResult.jsx'));

const ProtectedVideoMeetComponent = withAuth(VideoMeetComponent);

function App() {
  return (
    <AppTheme>
      <div className="App">
        <Toaster position="top-center" />
        <ErrorBoundary>
          <Router>
            <AuthProvider> 
              <Suspense fallback={<div className="app-loading" aria-label="Loading" />}>
              <Routes>
              <Route path='/' element={<LandingPage />} />
              <Route path='/about' element={<ApplicationDetails />} />
              <Route path='/terms' element={<TermsAndConditions />} />
              <Route path='/auth' element={<Authentication />} />
              <Route path='/auth/sso-callback' element={<Authentication />} />
              <Route path='/home' element={<HomeComponent />} />
              <Route path='/history' element={<History />} />
              <Route path='/admin-login' element={<AdminLogin />} />
              <Route path='/admin' element={<AdminDashboard />} />
              <Route path='/profile' element={<ProfileSettings />} />
              <Route path='/settings' element={<ProfileSettings />} />

              {/* Integrated MCQ Engine Shell */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'trainer']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path='/tests/create' element={<CreateTest />} />
                  <Route path='/tests/gradebook' element={<ViewResults />} />
                  <Route path='/admin/dashboard' element={<MCQAdminDashboard />} />
                  <Route path='/admin/tests' element={<ManageTests />} />
                  <Route path='/admin/tests/create' element={<CreateTest />} />
                  <Route path='/admin/tests/:id/edit' element={<EditTest />} />
                  <Route path='/admin/tests/:id/questions' element={<UploadQuestions />} />
                  <Route path='/admin/tests/:id/answerkey' element={<UploadAnswerKey />} />
                  <Route path='/admin/students' element={<ManageStudents />} />
                  <Route path='/admin/results' element={<ViewResults />} />
                  <Route path='/admin/tests/:id/coding' element={<ManageCodingProblems />} />
                  <Route path='/admin/tests/:id/coding-results' element={<ViewCodingSubmissions />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['student', 'trainer', 'admin']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path='/tests' element={<Dashboard />} />
                  <Route path='/student/dashboard' element={<StudentDashboard />} />
                  <Route path='/student/results' element={<MyResults />} />
                  <Route path='/student/results/:id' element={<ResultDetail />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin', 'trainer']} />}>
                <Route path='/admin/combined-result/:testId/:studentId' element={<AdminCombinedResult />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['student', 'trainer', 'admin']} />}>
                <Route path='/student/test/:id' element={<TakeTest />} />
                <Route path='/test/:testId/take' element={<TakeTest />} />
                <Route path='/student/coding-test/:id' element={<TakeCodingTest />} />
                <Route path='/student/coding-results/:testId' element={<CodingResults />} />
                <Route path='/student/combined-result/:testId' element={<CombinedResult />} />
              </Route>

              {/* Standalone Fullscreen MCQ & Coding Test Taking & Results */}
              <Route path="/:url" element={<ProtectedVideoMeetComponent />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
              </Suspense>
          </AuthProvider>
        </Router>
        </ErrorBoundary>
      </div>
    </AppTheme>
  );
}

export default App;
