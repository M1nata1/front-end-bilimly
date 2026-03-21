// src/App.tsx

import { Routes, Route, useLocation } from "react-router-dom";
import PublicRoute    from "@/router/PublicRoute";
import ProtectedRoute from "@/router/ProtectedRoute";

import Landing    from "@/pages/Landing/Landing";
import Auth       from "@/pages/Auth/Auth";
import FAQ        from "@/pages/FAQ/FAQ";
import TrialExam  from "@/pages/Exam/TrialExam";
import Dashboard  from "@/pages/Dashboard/Dashboard";

// import Courses     from "@/pages/Courses/Courses";
// import CoursePage  from "@/pages/Courses/CoursePage";
// import TopicPage   from "@/pages/Topic/TopicPage";
// import QuizPage    from "@/pages/Quiz/QuizPage";
// import ExamPage    from "@/pages/Exam/ExamPage";
// import ExamResult  from "@/pages/Exam/ExamResult";
// import AdminPanel  from "@/pages/Admin/AdminPanel";

export default function App() {
  const location = useLocation();

  return (
    <div key={location.key} className="page-enter">
      <Routes location={location}>

        {/* ── Полностью публичные (без проверки авторизации) ── */}
        <Route path="/faq"        element={<FAQ />} />
        <Route path="/exam/trial" element={<TrialExam />} />
        {/* <Route path="/policy"  element={<Policy />} /> */}

        {/* ── Публичные, авторизованный → /dashboard ── */}
        <Route element={<PublicRoute />}>
          <Route path="/"     element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
        </Route>

        {/* ── Защищённые — неавторизованный → /auth ── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route path="/courses"                         element={<Courses />} /> */}
          {/* <Route path="/courses/:courseId"               element={<CoursePage />} /> */}
          {/* <Route path="/courses/:courseId/:topicId"      element={<TopicPage />} /> */}
          {/* <Route path="/courses/:courseId/:topicId/quiz" element={<QuizPage />} /> */}
          {/* <Route path="/exam"                            element={<ExamPage />} /> */}
          {/* <Route path="/exam/result"                     element={<ExamResult />} /> */}
        </Route>

        {/* ── Только admin ── */}
        {/* <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/admin/*" element={<AdminPanel />} />
        </Route> */}

      </Routes>
    </div>
  );
}
