import './App.css';
import Authentication from './pages/authentication.jsx';
import LandingPage from './pages/landing.jsx';
import HomeComponent from './pages/home.jsx';
import History from './pages/history.jsx';
import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contents/AuthContents.jsx';
import VideoMeetComponent from './pages/videomate.jsx';
import AppTheme from './shared-theme/AppTheme';

import AdminDashboard from './pages/AdminDashboard.jsx';
import ProfileSettings from './pages/ProfileSettings.jsx';
import NotFound from './pages/NotFound.jsx';
import { Toaster } from 'react-hot-toast';

// MCQ Engine Components & Pages
import DashboardLayout from './mcq_engine/components/DashboardLayout.jsx';
import Dashboard from './mcq_engine/pages/Dashboard.jsx';

// Admin MCQ Pages
import MCQAdminDashboard from './mcq_engine/pages/admin/AdminDashboard.jsx';
import ManageTests from './mcq_engine/pages/admin/ManageTests.jsx';
import CreateTest from './mcq_engine/pages/admin/CreateTest.jsx';
import EditTest from './mcq_engine/pages/admin/EditTest.jsx';
import UploadQuestions from './mcq_engine/pages/admin/UploadQuestions.jsx';
import UploadAnswerKey from './mcq_engine/pages/admin/UploadAnswerKey.jsx';
import ManageStudents from './mcq_engine/pages/admin/ManageStudents.jsx';
import ViewResults from './mcq_engine/pages/admin/ViewResults.jsx';
import ManageCodingProblems from './mcq_engine/pages/admin/ManageCodingProblems.jsx';
import ViewCodingSubmissions from './mcq_engine/pages/admin/ViewCodingSubmissions.jsx';
import AdminCombinedResult from './mcq_engine/pages/admin/AdminCombinedResult.jsx';

// Student MCQ Pages
import StudentDashboard from './mcq_engine/pages/student/StudentDashboard.jsx';
import TakeTest from './mcq_engine/pages/student/TakeTest.jsx';
import MyResults from './mcq_engine/pages/student/MyResults.jsx';
import ResultDetail from './mcq_engine/pages/student/ResultDetail.jsx';
import TakeCodingTest from './mcq_engine/pages/student/TakeCodingTest.jsx';
import CodingResults from './mcq_engine/pages/student/CodingResults.jsx';
import CombinedResult from './mcq_engine/pages/student/CombinedResult.jsx';

function App() {
  return (
    <AppTheme>
      <div className="App">
        <Toaster position="top-center" />
        <Router>
          <AuthProvider> 
            <Routes>
              <Route path='/' element={<LandingPage />} />
              <Route path='/auth' element={<Authentication />} />
              <Route path='/home' element={<HomeComponent />} />
              <Route path='/history' element={<History />} />
              <Route path='/admin' element={<AdminDashboard />} />
              <Route path='/profile' element={<ProfileSettings />} />
              <Route path='/settings' element={<ProfileSettings />} />

              {/* Integrated MCQ Engine Shell */}
              <Route element={<DashboardLayout />}>
                <Route path='/tests' element={<Dashboard />} />
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

                <Route path='/student/dashboard' element={<StudentDashboard />} />
                <Route path='/student/results' element={<MyResults />} />
                <Route path='/student/results/:id' element={<ResultDetail />} />
              </Route>

              {/* Standalone Fullscreen MCQ & Coding Test Taking & Results */}
              <Route path='/admin/combined-result/:testId/:studentId' element={<AdminCombinedResult />} />
              <Route path='/student/test/:id' element={<TakeTest />} />
              <Route path='/test/:testId/take' element={<TakeTest />} />
              <Route path='/student/coding-test/:id' element={<TakeCodingTest />} />
              <Route path='/student/coding-results/:testId' element={<CodingResults />} />
              <Route path='/student/combined-result/:testId' element={<CombinedResult />} />

              <Route path="/:url" element={<VideoMeetComponent />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </Router>
      </div>
    </AppTheme>
  );
}

export default App;
