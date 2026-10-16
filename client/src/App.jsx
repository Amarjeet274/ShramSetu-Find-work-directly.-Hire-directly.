import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useSocket } from './hooks/useSocket';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import WorkerLayout from './layouts/WorkerLayout';
import EmployerLayout from './layouts/EmployerLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';

// Public
import Landing from './pages/public/Landing';

// Auth
import AuthPage from './pages/auth/AuthPage';
import ChooseRole from './pages/auth/ChooseRole';
import LanguagePage from './pages/auth/LanguagePage';

// Worker
import WorkerHome from './pages/worker/WorkerHome';
import FindWork from './pages/worker/FindWork';
import JobDetails from './pages/worker/JobDetails';
import MyApplications from './pages/worker/MyApplications';
import MyWork from './pages/worker/MyWork';
import Earnings from './pages/worker/Earnings';
import WorkerProfile from './pages/worker/WorkerProfile';
import SavedJobs from './pages/worker/SavedJobs';
import WorkerProfileEdit from './pages/worker/WorkerProfileEdit';

// Employer
import EmployerDashboard from './pages/employer/EmployerDashboard';
import PostJob from './pages/employer/PostJob';
import MatchCenter from './pages/employer/MatchCenter';
import Pipeline from './pages/employer/Pipeline';
import JobApplicants from './pages/employer/JobApplicants';
import EmployerProfile from './pages/employer/EmployerProfile';
import EmployerPayments from './pages/employer/EmployerPayments';
import EmployerProfileEdit from './pages/employer/EmployerProfileEdit';

// Shared
import Messages from './pages/shared/Messages';
import Notifications from './pages/shared/Notifications';
import Support from './pages/shared/Support';
import Settings from './pages/shared/Settings';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AdminVerifications from './pages/admin/AdminVerifications';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminJobs from './pages/admin/AdminJobs';
import AdminPayments from './pages/admin/AdminPayments';
import AdminDisputes from './pages/admin/AdminDisputes';

// Chatbot
import Chatbot from './components/chatbot/Chatbot';

/* =========================================================
 * Route guard — reads user from store (token is HTTP-only cookie now)
 * ======================================================= */
function RequireAuth({ role, children }) {
  const { user } = useAuthStore();
  const location = useLocation();
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user } = useAuthStore();
  useSocket(); // establishes socket after login

  return (
    <>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
        </Route>

        {/* Auth */}
        <Route element={<AuthLayout />}>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/role" element={<ChooseRole />} />
          <Route path="/auth/language" element={<LanguagePage />} />
        </Route>

        {/* Worker */}
        <Route
          path="/worker"
          element={
            <RequireAuth role="worker">
              <WorkerLayout />
            </RequireAuth>
          }
        >
          <Route index element={<WorkerHome />} />
          <Route path="profile/edit" element={<WorkerProfileEdit />} />
          <Route path="find" element={<FindWork />} />
          <Route path="jobs/:id" element={<JobDetails />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="my-work" element={<MyWork />} />
          <Route path="earnings" element={<Earnings />} />
          <Route path="saved" element={<SavedJobs />} />
          <Route path="profile" element={<WorkerProfile />} />
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="support" element={<Support />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Employer */}
        <Route
          path="/employer"
          element={
            <RequireAuth role="employer">
              <EmployerLayout />
            </RequireAuth>
          }
        >
          <Route index element={<EmployerDashboard />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="jobs/:id/applicants" element={<JobApplicants />} />
          {/* Match Center — works with and without a jobId */}
          <Route path="match" element={<MatchCenter />} />
          <Route path="match/:jobId" element={<MatchCenter />} />

          {/* Pipeline — works with and without a jobId */}
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="pipeline/:jobId" element={<Pipeline />} />
          <Route path="profile" element={<EmployerProfile />} />
          <Route path="profile/edit" element={<EmployerProfileEdit />} />
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="support" element={<Support />} />
          <Route path="settings" element={<Settings />} />
          <Route path="payments" element={<EmployerPayments />} />
        </Route>

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <RequireAuth role="admin">
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="verifications" element={<AdminVerifications />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="disputes" element={<AdminDisputes />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {user && <Chatbot />}
    </>
  );
}