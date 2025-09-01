import { useState } from 'react';
import { Box, Grid, TextField, Button, Paper, Typography } from '@mui/material';
import { z } from 'zod';
import { createRemoteLogger } from 'logging-middleware';

const formSchema = z.object({
  url: z.string().url(),
  validity: z.string().optional(),
  shortcode: z.string().regex(/^[a-zA-Z0-9_-]{3,30}$/).optional().or(z.literal(''))
});

interface Entry extends z.infer<typeof formSchema> {
  id: string;
  status?: 'idle'|'loading'|'done'|'error';
  result?: { shortLink: string; expiry: string };
  errorMsg?: string;
}

const logger = createRemoteLogger({ token: 'frontend-local', fireAndForget: true, defaultStack: 'frontend', defaultPackage: 'component' });

export default function ShortenerPage() {
  const [entries, setEntries] = useState<Entry[]>(Array.from({length:5}, (_,i)=> ({ id: String(i), url:'', validity:'', shortcode:'' } as Entry)));
  const backendBase = 'http://localhost:3001';

  function update(id: string, patch: Partial<Entry>) {
    setEntries(prev => prev.map(e => e.id===id ? {...e, ...patch}: e));
  }

  async function submit() {
    logger.info('component','shorten.submit');
    const toProcess = entries.filter(e => e.url.trim());
    for (const e of toProcess) {
      try {
        update(e.id, { status:'loading', errorMsg: undefined });
        const parsed = formSchema.safeParse({ url: e.url, validity: e.validity || undefined, shortcode: e.shortcode || undefined });
        if (!parsed.success) {
          logger.warn('component','shorten.validation_error',{ issues: parsed.error.issues });
          update(e.id, { status:'error', errorMsg: 'Validation error'});
          continue;
        }
        const body: any = { url: parsed.data.url };
        if (parsed.data.validity) body.validity = parseInt(parsed.data.validity,10);
        if (parsed.data.shortcode) body.shortcode = parsed.data.shortcode;
        const res = await fetch(backendBase + '/shorturls', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
        if (!res.ok) {
          const errJson = await res.json().catch(()=>({}));
          logger.error('component','shorten.api_error',{ status: res.status, body: errJson });
          update(e.id, { status:'error', errorMsg: 'API error '+res.status });
        } else {
          const data = await res.json();
          logger.info('component','shorten.success',{ shortcode: data.shortLink });
          update(e.id, { status:'done', result: data });
          try {
            const code = data.shortLink.split('/').pop();
            if (code) {
              const existing = JSON.parse(localStorage.getItem('shortcodes') || '[]');
              if (!existing.includes(code)) {
                existing.push(code);
                localStorage.setItem('shortcodes', JSON.stringify(existing));
              }
            }
          } catch {}
        }
      } catch (err:any) {
        logger.error('component','shorten.exception',{ message: err.message });
        update(e.id, { status:'error', errorMsg: err.message });
      }
    }
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Shorten up to 5 URLs</Typography>
      <Grid container spacing={2}>
        {entries.map(e => (
          <Grid item xs={12} md={6} key={e.id}>
            <Paper sx={{ p:2, display:'flex', flexDirection:'column', gap:1 }}>
              <TextField size="small" label="Original URL" value={e.url} onChange={ev=>update(e.id,{url:ev.target.value})} fullWidth />
              <TextField size="small" label="Validity (minutes)" value={e.validity} onChange={ev=>update(e.id,{validity:ev.target.value})} fullWidth />
              <TextField size="small" label="Preferred Shortcode" value={e.shortcode} onChange={ev=>update(e.id,{shortcode:ev.target.value})} fullWidth />
              <Box>
                {e.status==='loading' && <Typography variant="body2" color="info.main">Creating...</Typography>}
                {e.status==='error' && <Typography variant="body2" color="error.main">{e.errorMsg}</Typography>}
                {e.status==='done' && e.result && (
                  <Typography variant="body2">Short: <a href={e.result.shortLink} target="_blank" rel="noreferrer">{e.result.shortLink}</a><br/>Expiry: {new Date(e.result.expiry).toLocaleString()}</Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Box mt={3}>
        <Button variant="contained" onClick={submit}>Shorten</Button>
      </Box>
    </Box>
  );
}
