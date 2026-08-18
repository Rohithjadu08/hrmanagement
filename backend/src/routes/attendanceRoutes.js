import express from 'express';
import { checkIn, checkOut, getEmployeeAttendance, getAllAttendance, getAttendanceStats } from '../services/attendanceService.js';
import { requireSupabaseAuth } from '../auth/supabaseAuth.js';
import { requireHR } from '../auth/requireHR.js';

const router = express.Router();

// --- EMPLOYEE ROUTES ---

router.post('/employee/attendance/check-in', requireSupabaseAuth, async (req, res) => {
  try {
    const data = await checkIn(req.supabaseUser.id);
    res.json(data);
  } catch (err) {
    if (err.message === 'ALREADY_CHECKED_IN') return res.status(400).json({ error: 'You have already checked in today.' });
    res.status(500).json({ error: 'Failed to check in.' });
  }
});

router.post('/employee/attendance/check-out', requireSupabaseAuth, async (req, res) => {
  try {
    const data = await checkOut(req.supabaseUser.id);
    res.json(data);
  } catch (err) {
    if (err.message === 'NOT_CHECKED_IN') return res.status(400).json({ error: 'You have not checked in today.' });
    if (err.message === 'ALREADY_CHECKED_OUT') return res.status(400).json({ error: 'You have already checked out today.' });
    res.status(500).json({ error: 'Failed to check out.' });
  }
});

router.get('/employee/attendance', requireSupabaseAuth, async (req, res) => {
  try {
    const data = await getEmployeeAttendance(req.supabaseUser.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get attendance.' });
  }
});

// --- HR ROUTES ---

router.get('/hr/attendance', requireSupabaseAuth, requireHR, async (req, res) => {
  try {
    const { date } = req.query;
    const data = await getAllAttendance(date);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get attendance.' });
  }
});

router.get('/hr/attendance/stats', requireSupabaseAuth, requireHR, async (req, res) => {
  try {
    const { date } = req.query;
    const data = await getAttendanceStats(date);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get attendance stats.' });
  }
});

export default router;
