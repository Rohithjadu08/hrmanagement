import express from 'express';
import { applyLeave, getEmployeeLeaves, getAllLeaves, approveLeave, rejectLeave } from '../services/leaveService.js';
import { requireSupabaseAuth } from '../auth/supabaseAuth.js';
import { requireHR } from '../auth/requireHR.js';
import { z } from 'zod';

const router = express.Router();

const applyLeaveSchema = z.object({
  leave_type: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  reason: z.string(),
  additional_notes: z.string().optional()
});

// --- EMPLOYEE ROUTES ---

router.post('/employee/leaves', requireSupabaseAuth, async (req, res) => {
  const body = applyLeaveSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'INVALID_PAYLOAD' });

  try {
    const data = await applyLeave(req.supabaseUser.id, body.data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to apply for leave.' });
  }
});

router.get('/employee/leaves', requireSupabaseAuth, async (req, res) => {
  try {
    const data = await getEmployeeLeaves(req.supabaseUser.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get leaves.' });
  }
});

// --- HR ROUTES ---

router.get('/hr/leaves', requireSupabaseAuth, requireHR, async (req, res) => {
  try {
    const data = await getAllLeaves();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get leaves.' });
  }
});

router.patch('/hr/leaves/:id/approve', requireSupabaseAuth, requireHR, async (req, res) => {
  try {
    const data = await approveLeave(req.params.id, req.supabaseUser.id);
    res.json(data);
  } catch (err) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'Leave request not found.' });
    res.status(500).json({ error: 'Failed to approve leave.' });
  }
});

const rejectLeaveSchema = z.object({
  rejection_reason: z.string().min(1)
});

router.patch('/hr/leaves/:id/reject', requireSupabaseAuth, requireHR, async (req, res) => {
  const body = rejectLeaveSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'Rejection reason is required.' });

  try {
    const data = await rejectLeave(req.params.id, req.supabaseUser.id, body.data.rejection_reason);
    res.json(data);
  } catch (err) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'Leave request not found.' });
    res.status(500).json({ error: 'Failed to reject leave.' });
  }
});

export default router;
