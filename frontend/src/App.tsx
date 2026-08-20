import { Navigate, Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { RequireAuth } from './pages/RootRouter'

// Auth & Public
import LandingPage from './pages/LandingPage/LandingPage'
import SignupPage from './pages/Auth/SignupPage'
import LoginPage from './pages/Auth/LoginPage'

// Lazy loaded Employee pages
const EmployeePendingPage = lazy(() => import('./pages/Employee/EmployeePendingPage'))
const EmployeeDashboardPage = lazy(() => import('./pages/Employee/EmployeeDashboardPage'))
const EmployeeTasksPage = lazy(() => import('./pages/Employee/EmployeeTasksPage'))
const EmployeeAiAssistantPage = lazy(() => import('./pages/Employee/EmployeeAiAssistantPage'))
const EmployeeDeclinedPage = lazy(() => import('./pages/Employee/EmployeeDeclinedPage'))
const EmployeeAttendancePage = lazy(() => import('./pages/Employee/EmployeeAttendancePage'))
const EmployeeLeavePage = lazy(() => import('./pages/Employee/EmployeeLeavePage'))
const EmployeeChatHistoryPage = lazy(() => import('./pages/Employee/EmployeeChatHistoryPage'))
const EmployeePendingConfirmationPage = lazy(() => import('./pages/Employee/EmployeePendingConfirmationPage'))

// Lazy loaded HR pages
const HrDashboard = lazy(() => import('./pages/Hr/HrDashboard'))
const EmployeesPage = lazy(() => import('./pages/Hr/EmployeesPage'))
const TasksPage = lazy(() => import('./pages/Hr/TasksPage'))
const AiAssistantPage = lazy(() => import('./pages/Hr/AiAssistantPage'))
const KnowledgeBasePage = lazy(() => import('./pages/Hr/KnowledgeBasePage'))
const NotificationsPage = lazy(() => import('./pages/Hr/NotificationsPage'))
const HrAttendancePage = lazy(() => import('./pages/Hr/HrAttendancePage'))
const HrLeavePage = lazy(() => import('./pages/Hr/HrLeavePage'))
const HrChatHistoryPage = lazy(() => import('./pages/Hr/HrChatHistoryPage'))

export default function App() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#0A0A0B]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    }>
      <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route path="/home" element={<LandingPage />} />


      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/pending"
        element={
          <RequireAuth allowedAccountType="EMPLOYEE">
            <EmployeePendingPage />
          </RequireAuth>
        }
      />
      <Route
        path="/pending-confirmation"
        element={
          <RequireAuth allowedAccountType="EMPLOYEE">
            <EmployeePendingConfirmationPage />
          </RequireAuth>
        }
      />
      <Route
        path="/declined"
        element={
          <RequireAuth allowedAccountType="EMPLOYEE">
            <EmployeeDeclinedPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth allowedAccountType="EMPLOYEE">
            <EmployeeDashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/tasks"
        element={
          <RequireAuth allowedAccountType="EMPLOYEE">
            <EmployeeTasksPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/chat"
        element={
          <RequireAuth allowedAccountType="EMPLOYEE">
            <EmployeeAiAssistantPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/attendance"
        element={
          <RequireAuth allowedAccountType="EMPLOYEE">
            <EmployeeAttendancePage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/leaves"
        element={
          <RequireAuth allowedAccountType="EMPLOYEE">
            <EmployeeLeavePage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/chat/history"
        element={
          <RequireAuth allowedAccountType="EMPLOYEE">
            <EmployeeChatHistoryPage />
          </RequireAuth>
        }
      />

      <Route
        path="/hr"
        element={
          <RequireAuth allowedAccountType="HR">
            <HrDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/hr/employees"
        element={
          <RequireAuth allowedAccountType="HR">
            <EmployeesPage />
          </RequireAuth>
        }
      />
      <Route
        path="/hr/tasks"
        element={
          <RequireAuth allowedAccountType="HR">
            <TasksPage />
          </RequireAuth>
        }
      />
      <Route
        path="/hr/chat"
        element={
          <RequireAuth allowedAccountType="HR">
            <AiAssistantPage />
          </RequireAuth>
        }
      />
      <Route
        path="/hr/knowledge"
        element={
          <RequireAuth allowedAccountType="HR">
            <KnowledgeBasePage />
          </RequireAuth>
        }
      />
      <Route
        path="/hr/notifications"
        element={
          <RequireAuth allowedAccountType="HR">
            <NotificationsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/hr/attendance"
        element={
          <RequireAuth allowedAccountType="HR">
            <HrAttendancePage />
          </RequireAuth>
        }
      />
      <Route
        path="/hr/leaves"
        element={
          <RequireAuth allowedAccountType="HR">
            <HrLeavePage />
          </RequireAuth>
        }
      />
      <Route
        path="/hr/chat/history"
        element={
          <RequireAuth allowedAccountType="HR">
            <HrChatHistoryPage />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
    </Suspense>
  )
}





