import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import Landing from "./pages/Landing";
import AdminLogin from "./pages/auth/AdminLogin";
import AdminSignup from "./pages/auth/AdminSignup";
import StudentLogin from "./pages/auth/StudentLogin";
import StudentSignup from "./pages/auth/StudentSignup";
import VerifyEmail from "./pages/auth/VerifyEmail";
import AdminLayout from "./components/admin/AdminLayout";
import ExamManager from "./pages/admin/ExamManager";
import SubjectManager from "./pages/admin/SubjectManager";
import TopicManager from "./pages/admin/TopicManager";
import QuestionManager from "./pages/admin/QuestionManager";
import AIGenerator from "./pages/admin/AIGenerator";
import Annotations from "./pages/admin/Annotations";
import StudentLayout from "./components/student/StudentLayout";
import AllExams from "./pages/student/AllExams";
import ExamAttempt from "./pages/student/ExamAttempt";
import ExamResult from "./pages/student/ExamResult";
import Progress from "./pages/student/Progress";
import TestHistory from "./pages/student/TestHistory";
import Ranking from "./pages/student/Ranking";
import GroupBattle from "./pages/student/GroupBattle";
import Settings from "./pages/student/Settings";
import StudyPlanner from "./pages/student/StudyPlanner";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1a2e",
              color: "#e0e0e0",
              border: "1px solid rgba(255,255,255,0.05)",
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/signup" element={<StudentSignup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoutes allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoutes>
            }
          >
            <Route path="exams" element={<ExamManager />} />
            <Route path="subjects" element={<SubjectManager />} />
            <Route path="topics" element={<TopicManager />} />
            <Route path="questions" element={<QuestionManager />} />
            <Route path="ai-generator" element={<AIGenerator />} />
            <Route path="annotations" element={<Annotations />} />
          </Route>

          <Route
            path="/student"
            element={
              <ProtectedRoutes allowedRoles={["student"]}>
                <SocketProvider>
                  <StudentLayout />
                </SocketProvider>
              </ProtectedRoutes>
            }
          >
            <Route path="exams" element={<AllExams />} />
            <Route path="progress" element={<Progress />} />
            <Route path="history" element={<TestHistory />} />
            <Route path="ranking" element={<Ranking />} />
            <Route path="battles" element={<GroupBattle />} />
            <Route path="settings" element={<Settings />} />
            <Route path="study-planner" element={<StudyPlanner />} />
            <Route path="result/:attemptId" element={<ExamResult />} />
            <Route path="exam/:topicId" element={<ExamAttempt />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;