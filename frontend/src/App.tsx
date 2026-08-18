import { Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage/LandingPage'
import SignupPage from './pages/Auth/SignupPage'
import LoginPage from './pages/Auth/LoginPage'
import EmployeePendingPage from './pages/Employee/EmployeePendingPage'
import EmployeeDashboardPage from './pages/Employee/EmployeeDashboardPage'
import EmployeeTasksPage from './pages/Employee/EmployeeTasksPage'
import EmployeeAiAssistantPage from './pages/Employee/EmployeeAiAssistantPage'
import EmployeeDeclinedPage from './pages/Employee/EmployeeDeclinedPage'
import EmployeeAttendancePage from './pages/Employee/EmployeeAttendancePage'
import EmployeeLeavePage from './pages/Employee/EmployeeLeavePage'
import EmployeeChatHistoryPage from './pages/Employee/EmployeeChatHistoryPage'
import HrDashboard from './pages/Hr/HrDashboard'
import EmployeesPage from './pages/Hr/EmployeesPage'
import TasksPage from './pages/Hr/TasksPage'
import AiAssistantPage from './pages/Hr/AiAssistantPage'
import KnowledgeBasePage from './pages/Hr/KnowledgeBasePage'
import NotificationsPage from './pages/Hr/NotificationsPage'
import HrAttendancePage from './pages/Hr/HrAttendancePage'
import HrLeavePage from './pages/Hr/HrLeavePage'
import HrChatHistoryPage from './pages/Hr/HrChatHistoryPage'
import { RequireAuth } from './pages/RootRouter'
import EmployeePendingConfirmationPage from './pages/Employee/EmployeePendingConfirmationPage'

export default function App() {
  return (
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
  )
}





