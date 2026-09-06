import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

export const PageLoader = ({ message = 'Loading...' }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10, gap: 2 }}>
    <CircularProgress size={40} sx={{ color: '#0e71eb' }} />
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{message}</Typography>
  </Box>
);

export const ButtonSpinner = ({ size = 20 }) => (
  <CircularProgress size={size} sx={{ color: 'inherit' }} />
);

export const TableSkeleton = ({ rows = 5 }) => (
  <Box sx={{ p: 2, background: '#242428', borderRadius: '12px', border: '1px solid #333338' }}>
    {Array.from({ length: rows }).map((_, i) => (
      <Box key={i} sx={{ height: 40, mb: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px' }} />
    ))}
  </Box>
);

export const CardSkeleton = ({ count = 4 }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 2 }}>
    {Array.from({ length: count }).map((_, i) => (
      <Box key={i} sx={{ height: 120, backgroundColor: '#242428', border: '1px solid #333338', borderRadius: '12px' }} />
    ))}
  </Box>
);

export default PageLoader;
