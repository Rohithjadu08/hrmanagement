export type ApiError = {

  error?: string
  status?: number
}

// Use the provided API URL for production. If not set (like in local dev), fallback to relative path which Vite proxies
export const API_BASE = import.meta.env.VITE_API_URL || ''

async function requestJson(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  })

  const text = await res.text()
  const data = text ? safeJsonParse(text) : null

  if (!res.ok) {
    const err: ApiError = {}
    if (data && typeof data === 'object') {
      if ('error' in data) err.error = (data as any).error
    }
    err.status = res.status
    let fallbackMessage = `API_ERROR:${res.status}`
    if (res.status === 404) fallbackMessage = 'Resource not found (404)'
    else if (res.status === 401) fallbackMessage = 'Unauthorized (401)'
    else if (res.status === 403) fallbackMessage = 'Forbidden (403)'
    else if (res.status === 500) fallbackMessage = 'Internal Server Error (500)'
    
    throw Object.assign(new Error(err.error || fallbackMessage), err)
  }

  return data
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export const api = {
  health: () => requestJson('/health'),

  signup: (payload: {
    name: string
    email: string
    role: string
    department: string
    employeeId: string
    password: string
  }) =>
    requestJson('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  login: (payload: { email: string; password: string; accountType?: 'EMPLOYEE' | 'HR' }) =>
    requestJson('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  me: () => requestJson('/api/auth/me', { method: 'GET' }),
  logout: () => requestJson('/api/auth/logout', { method: 'POST' }),

  hrPendingEmployees: () => requestJson('/api/hr/pending-employees', { method: 'GET' }),

  hrApprove: (employeeId: string) =>
    requestJson(`/api/hr/approve/${encodeURIComponent(employeeId)}`, { method: 'PATCH' }),

  hrDecline: (employeeId: string, declineReason?: string) =>
    requestJson(`/api/hr/decline/${encodeURIComponent(employeeId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ declineReason })
    }),

  hrStats: () => requestJson('/api/hr/stats', { method: 'GET' }),

  hrDocuments: () => requestJson('/api/hr/documents', { method: 'GET' }),

  hrAllEmployees: () => requestJson('/api/hr/employees', { method: 'GET' }),

  hrTasks: () => requestJson('/api/hr/tasks', { method: 'GET' }),

  hrCreateTask: (payload: { title: string, description?: string, assignee_id?: string, priority: string, due_date?: string, category?: string, notes?: string }) => 
    requestJson('/api/hr/tasks', { method: 'POST', body: JSON.stringify(payload) }),

  hrUpdateTask: (id: string, status: string) => 
    requestJson(`/api/hr/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  hrNotifications: () => requestJson('/api/hr/notifications', { method: 'GET' }),

  hrReadNotifications: () => requestJson('/api/hr/notifications/read', { method: 'PATCH' }),

  chatMessage: (message: string, conversationId?: string) => 
    requestJson('/api/chat/message', { method: 'POST', body: JSON.stringify({ message, conversationId }) }),

  chatConversations: () => requestJson('/api/chat/conversations', { method: 'GET' }),

  employeeTasks: () => requestJson('/api/employee/tasks', { method: 'GET' }),

  employeeUpdateTask: (id: string, status: string) =>
    requestJson(`/api/employee/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  employeeSubmitTask: async (id: string, file: File | null, notes: string) => {
    const formData = new FormData()
    if (file) formData.append('file', file)
    if (notes) formData.append('notes', notes)
    const res = await fetch(`${API_BASE}/api/employee/tasks/${id}/submit`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'SUBMIT_FAILED')
    return data
  },

  hrReviewTask: (id: string, hr_approval_status: string, hr_feedback: string) =>
    requestJson(`/api/hr/tasks/${id}/review`, { method: 'POST', body: JSON.stringify({ hr_approval_status, hr_feedback }) }),

  uploadDocument: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${API_BASE}/api/hr/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'UPLOAD_FAILED')
    return data
  },

  // --- NEW: Attendance ---
  employeeCheckIn: () => requestJson('/api/employee/attendance/check-in', { method: 'POST' }),
  employeeCheckOut: () => requestJson('/api/employee/attendance/check-out', { method: 'POST' }),
  employeeGetAttendance: () => requestJson('/api/employee/attendance', { method: 'GET' }),
  
  hrGetAttendance: (date?: string) => requestJson(`/api/hr/attendance${date ? `?date=${date}` : ''}`, { method: 'GET' }),
  hrGetAttendanceStats: (date?: string) => requestJson(`/api/hr/attendance/stats${date ? `?date=${date}` : ''}`, { method: 'GET' }),

  // --- NEW: Leaves ---
  employeeApplyLeave: (payload: { leave_type: string, start_date: string, end_date: string, reason: string, additional_notes?: string }) => 
    requestJson('/api/employee/leaves', { method: 'POST', body: JSON.stringify(payload) }),
  employeeGetLeaves: () => requestJson('/api/employee/leaves', { method: 'GET' }),
  
  hrGetLeaves: () => requestJson('/api/hr/leaves', { method: 'GET' }),
  hrApproveLeave: (id: string) => requestJson(`/api/hr/leaves/${id}/approve`, { method: 'PATCH' }),
  hrRejectLeave: (id: string, rejection_reason: string) => 
    requestJson(`/api/hr/leaves/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ rejection_reason }) }),

  // --- NEW: Chat History ---
  chatMessages: (conversationId: string) => requestJson(`/api/chat/conversations/${conversationId}/messages`, { method: 'GET' })
}

