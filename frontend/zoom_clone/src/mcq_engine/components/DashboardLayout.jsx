import React, { useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import QuizIcon from '@mui/icons-material/Quiz';
import HomeIcon from '@mui/icons-material/Home';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../../contents/AuthContents';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', color: '#101828' }}>
      {/* SyncLearn Navigation Header Bar */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          px: { xs: 3, md: 6 },
          py: 2,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #eaecf0',
          borderRadius: 0
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/home')}>
          <VideoCallIcon sx={{ fontSize: 32, color: '#0e71eb' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#101828', fontSize: '20px', letterSpacing: '-0.4px' }}>
            SyncLearn
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<QuizIcon />}
            onClick={() => navigate('/tests')}
            sx={{
              color: location.pathname.startsWith('/tests') ? '#0e71eb' : '#344054',
              fontWeight: location.pathname.startsWith('/tests') ? 700 : 500,
              fontSize: '14px',
              textTransform: 'none'
            }}
          >
            Test Hub
          </Button>
          <Button
            startIcon={<RestoreIcon />}
            onClick={() => navigate('/history')}
            sx={{
              color: location.pathname === '/history' ? '#0e71eb' : '#344054',
              fontWeight: location.pathname === '/history' ? 700 : 500,
              fontSize: '14px',
              textTransform: 'none'
            }}
          >
            History
          </Button>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/home')}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', color: '#344054', borderColor: '#d1d5db', fontSize: '14px' }}
          >
            Dashboard
          </Button>
        </Box>
      </Paper>

      {/* Main Content View */}
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
