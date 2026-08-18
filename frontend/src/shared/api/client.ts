export type ApiError = {

  error?: string
  status?: number
}

export const API_BASE = 'https://hrmanagement-ayto.onrender.com'

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
    throw Object.assign(new Error(`API_ERROR:${res.status}`), err)
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
  }
}

