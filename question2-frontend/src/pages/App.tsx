import { useState } from 'react';
import { Box, Container, Tabs, Tab } from '@mui/material';
import ShortenerPage from './ShortenerPage';
import StatsPage from './StatsPage';

export default function App() {
  const [tab, setTab] = useState(0);
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Tabs value={tab} onChange={(_,v)=>setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Shorten URLs" />
        <Tab label="Statistics" />
      </Tabs>
      <Box hidden={tab!==0}><ShortenerPage /></Box>
      <Box hidden={tab!==1}><StatsPage /></Box>
    </Container>
  );
}
