import { loadDotEnv } from '../loadEnv.mjs'
loadDotEnv()

import { RagService } from './services/ragService.js'
import { supabaseAdmin } from '../config/supabaseClient.js'

const documentText = `ZAYA GROUP — HR EMPLOYEE HANDBOOK
Sample Knowledge Base Document for RAG Testing

1. Working Hours and Attendance
• Standard working hours are Monday to Friday, 9:00 AM to 6:00 PM.
• Employees receive a one-hour lunch break between 1:00 PM and 2:00 PM.
• Employees should inform their reporting manager if they expect to be late by more than 15 minutes.
• Remote work is permitted up to two days per week for eligible employees, subject to manager approval.

2. Leave Policy
• Employees receive 18 paid leave days per calendar year.
• Employees may use up to 6 sick leave days per year without submitting a medical certificate. A medical certificate may be requested for longer absences.
• Leave requests should normally be submitted at least 3 working days before the planned leave.
• Emergency leave should be communicated to the manager as soon as reasonably possible.
• Unused paid leave can be carried forward up to a maximum of 5 days into the next calendar year.

3. Employee Onboarding
• New employees must complete their profile, upload required documents, and finish the onboarding checklist.
• HR reviews onboarding requests before the employee account becomes fully active.
• Typical onboarding documents include government identification, educational certificates, bank details, and an emergency contact.
• An employee cannot access restricted company resources until the onboarding request has been approved.

4. Task Management
• Tasks assigned through the HR platform can have the statuses To Do, In Progress, Completed, or Overdue.
• Employees should update a task to In Progress when they begin work on it.
• Tasks should be marked Completed only after the required work has been finished.
• Managers can assign tasks, set priorities, update due dates, and review completion status.

5. Performance Reviews
• Formal performance reviews are conducted twice each year, normally in June and December.
• Performance discussions cover goals, technical skills, teamwork, communication, and professional development.
• Employees may request a one-to-one discussion with their manager at any time when they need feedback or support.

6. Information Security
• Employees must never share passwords, API keys, service-role keys, or other confidential credentials.
• Company documents containing confidential information should only be uploaded to approved company systems.
• Suspicious emails, unauthorized access attempts, or suspected data leaks must be reported to the IT or security team immediately.
• Employees should lock their workstation whenever they leave it unattended.

7. HR AI Assistant
• The HR AI Assistant answers questions using the organization's approved HR knowledge base.
• When the knowledge base does not contain enough information to answer a question, the assistant should clearly state that the information is unavailable rather than inventing a policy.
• HR staff should verify important employment decisions against the official company policy documents.

8. Benefits
• Eligible full-time employees receive company-provided health insurance after completing the applicable eligibility period.
• Employees can contact HR for information about insurance enrollment, dependents, and benefit changes.
• Benefits may vary by employment type and applicable company policy.

9. Contact and Escalation
• For leave and attendance questions, employees should contact HR or their reporting manager.
• For technical access problems, employees should contact the IT support team.
• For suspected security incidents, employees should immediately notify the security or IT team.`;

async function main() {
  console.log('Seeding HR Knowledge Base...')
  
  // Get an admin user ID for uploaded_by
  const { data: usersData } = await supabaseAdmin.auth.admin.listUsers()
  const hrAdmin = usersData?.users?.find(u => u.email === process.env.HR_ADMIN_EMAIL)
  const uploaderId = hrAdmin?.id || null

  const buffer = Buffer.from(documentText, 'utf-8')
  
  console.log('Processing document (generating embeddings and chunks)...')
  const result = await RagService.processDocument(buffer, 'HR_Employee_Handbook.txt', 'text/plain', uploaderId)
  
  if (result.success) {
    console.log('Successfully seeded HR Handbook into the knowledge base!')
    console.log('Document ID:', result.documentId)
  } else {
    console.error('Failed to seed document:', result.error)
  }
}

main().catch(console.error)
