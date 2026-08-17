import { loadDotEnv } from '../loadEnv.mjs'
loadDotEnv()

import { supabaseAdmin } from '../config/supabaseClient.js'

function getEnv(name, fallback) {
  const v = process.env[name]
  if (v === undefined || v === '') return fallback
  return v
}

async function seed() {
  const email = getEnv('HR_ADMIN_EMAIL', 'hr@reckongroup.com')
  const password = getEnv('HR_ADMIN_PASSWORD', 'Admin@123')

  console.log('Attempting to seed HR admin in Supabase:', email)

  // 1. Create user in auth.users
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      account_type: 'hr'
    }
  })

  let userId = authData?.user?.id

  if (authError) {
    if (String(authError.message || '').toLowerCase().includes('already')) {
      console.log('User already exists in Supabase Auth. Fetching ID to update profile...')
      
      // We can find the user ID by listing users in auth
      const { data: usersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers()
      const existingUser = usersData?.users?.find(u => u.email === email)
      
      if (listErr || !existingUser) {
        console.error('User exists in Auth but could not retrieve ID:', listErr?.message)
        process.exit(1)
      }
      userId = existingUser.id
      
      // Update auth info
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: password,
        user_metadata: { account_type: 'hr' }
      })
    } else {
      console.error('Error creating user in Supabase Auth:', authError.message)
      process.exit(1)
    }
  }

  // 2. Upsert into profiles table
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: userId,
      full_name: 'HR Admin',
      email: email,
      role: 'hr',
      department: 'Administration',
      employee_id: 'HR-ADMIN',
      approval_status: 'approved'
    })

  if (profileError) {
    console.error('Error upserting profile:', profileError.message)
    process.exit(1)
  }

  console.log('Successfully seeded HR admin:', email)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
