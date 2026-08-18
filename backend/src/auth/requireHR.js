export function requireHR(req, res, next) {
  const userId = req.supabaseUser?.id;
  if (!userId) return res.status(401).json({ error: 'UNAUTHORIZED' });

  import('../../config/supabaseClient.js').then(({ supabaseAdmin }) => {
    supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) return res.status(403).json({ error: 'FORBIDDEN' });
        if (data.role !== 'hr') return res.status(403).json({ error: 'FORBIDDEN' });
        next();
      })
      .catch(() => res.status(403).json({ error: 'FORBIDDEN' }));
  });
}
