import { useEffect, useState } from 'react';
import { Box, Paper, Typography, Grid, Chip } from '@mui/material';
import { createRemoteLogger } from 'logging-middleware';

interface StatRecord {
  shortcode: string;
  originalUrl: string;
  createdAt: string;
  expiry: string;
  expired: boolean;
  totalClicks: number;
  clicks: { ts: string; referer: string | null; ip: string | null; geo: string | null }[];
}

const logger = createRemoteLogger({ token: 'frontend-local', defaultStack:'frontend', defaultPackage:'component' });

export default function StatsPage() {
  const [codes, setCodes] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('shortcodes') || '[]'); } catch { return []; }
  });
  const [stats, setStats] = useState<Record<string, StatRecord | { error: string }>>({});
  const backendBase = 'http://localhost:3001';

  useEffect(() => {
    async function load() {
      for (const code of codes) {
        try {
          logger.info('component','stats.fetch_start',{ code });
          const res = await fetch(`${backendBase}/shorturls/${code}`);
          if (!res.ok) {
            logger.warn('component','stats.fetch_failed',{ code, status: res.status });
            setStats(s => ({ ...s, [code]: { error: 'Not found' } }));
          } else {
            const data: StatRecord = await res.json();
            logger.info('component','stats.fetch_success',{ code });
            setStats(s => ({ ...s, [code]: data }));
          }
        } catch (err:any) {
          logger.error('component','stats.fetch_exception',{ code, message: err.message });
          setStats(s => ({ ...s, [code]: { error: err.message } }));
        }
      }
    }
    load();
  }, [codes]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Statistics</Typography>
      <Grid container spacing={2}>
        {codes.map(code => {
          const rec = stats[code];
          return (
            <Grid item xs={12} md={6} key={code}>
              <Paper sx={{ p:2, display:'flex', flexDirection:'column', gap:1 }}>
                <Typography variant="subtitle1">{code}</Typography>
                {rec && 'error' in rec && <Typography color="error.main">{rec.error}</Typography>}
                {rec && !('error' in rec) && (
                  <Box>
                    <Typography variant="body2">Original: {rec.originalUrl}</Typography>
                    <Typography variant="body2">Created: {new Date(rec.createdAt).toLocaleString()}</Typography>
                    <Typography variant="body2">Expiry: {new Date(rec.expiry).toLocaleString()}</Typography>
                    <Typography variant="body2">Total Clicks: {rec.totalClicks}</Typography>
                    <Box mt={1} sx={{ maxHeight:160, overflow:'auto' }}>
                      {rec.clicks.map((c,i)=>(
                        <Paper key={i} variant="outlined" sx={{ p:1, mb:1 }}>
                          <Typography variant="caption">{new Date(c.ts).toLocaleString()}</Typography><br/>
                          <Typography variant="caption">Referer: {c.referer || '—'}</Typography><br/>
                          <Typography variant="caption">Geo: {c.geo || '—'}</Typography>
                        </Paper>
                      ))}
                    </Box>
                    {rec.expired && <Chip label="Expired" size="small" color="warning" />}
                  </Box>
                )}
              </Paper>
            </Grid>
          );
        })}
        {codes.length === 0 && <Typography variant="body2" sx={{ ml:2 }}>No shortcodes stored yet. Create some first.</Typography>}
      </Grid>
    </Box>
  );
}
