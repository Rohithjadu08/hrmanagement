import nodemailer from 'nodemailer'
import dns from 'node:dns'

// Force IPv4 resolution to prevent ENETUNREACH errors on systems with broken IPv6 routing
dns.setDefaultResultOrder('ipv4first')

function requireEnv(name) {
  const v = process.env[name]
  if (v === undefined || v === '') throw new Error(`Missing required env var: ${name}`)
  return v
}

function getLoginLink() {
  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
  // Frontend route used by the existing app
  return `${clientOrigin.replace(/\/$/, '')}/login`
}

let transporter = null

function getTransporter() {
  if (transporter) return transporter

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: requireEnv('EMAIL_USER'),
      pass: requireEnv('EMAIL_APP_PASSWORD')
    }
  })

  return transporter
}

export async function sendApprovalEmail(toEmail, status, reason) {
  if (!toEmail) throw new Error('sendApprovalEmail: toEmail is required')

  const safeReason = reason ? String(reason).trim() : ''
  const loginLink = getLoginLink()

  if (String(status).toUpperCase() === 'APPROVED') {
    const subject = "You're approved — Welcome to Reckon Group of Company"

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.4;">
        <p>Hi there,</p>
        <p>Good news — your application has been <b>approved</b>.</p>
        <p>You can log in and continue your onboarding here:</p>
        <p><a href="${loginLink}" target="_blank" rel="noopener">Login to Reckon Group of Company</a></p>
        <p>Welcome aboard!</p>
      </div>
    `

    return getTransporter().sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject,
      html
    })
  }

  if (String(status).toUpperCase() === 'DECLINED') {
    const subject = 'Update on your Reckon Group of Company application'

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.4;">
        <p>Hi there,</p>
        <p>Thank you for your application. At this time, it has been <b>declined</b>.</p>
        ${safeReason ? `<p><b>Reason:</b> ${safeReason}</p>` : ''}
        <p>If you believe this is a mistake, please contact our HR team.</p>
      </div>
    `

    return getTransporter().sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject,
      html
    })
  }

  throw new Error(`sendApprovalEmail: unsupported status: ${status}`)
}

export async function notifyHRNewSignup(name, email, department, role) {
  const hrEmail = process.env.HR_ADMIN_EMAIL || 'hr@reckongroup.com'
  const subject = `New Employee Signup: ${name} (${department})`
  
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.4;">
      <p>Hi HR Team,</p>
      <p>A new employee has just signed up and is waiting for approval.</p>
      <ul>
        <li><b>Name:</b> ${name}</li>
        <li><b>Email:</b> ${email}</li>
        <li><b>Department:</b> ${department}</li>
        <li><b>Role:</b> ${role}</li>
      </ul>
      <p>Please log in to the HR Dashboard to review and approve their access.</p>
    </div>
  `

  return getTransporter().sendMail({
    from: process.env.EMAIL_USER,
    to: hrEmail,
    subject,
    html
  })
}
