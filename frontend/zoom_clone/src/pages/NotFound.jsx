import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import WarningIcon from '@mui/icons-material/Warning';
import HomeIcon from '@mui/icons-material/Home';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#f8f9fa' 
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <WarningIcon sx={{ fontSize: 100, color: '#dc2626', mb: 2 }} />
        <Typography variant="h3" fontWeight="bold" sx={{ color: '#101828', mb: 2 }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ color: '#344054', mb: 2 }}>
          Oops! Page Not Found
        </Typography>
        <Typography variant="body1" sx={{ color: '#667085', mb: 4 }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<HomeIcon />}
          onClick={() => navigate('/home')}
          sx={{
            backgroundColor: '#0e71eb',
            '&:hover': { backgroundColor: '#0b5ed7' },
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            py: 1.2,
            px: 4,
            borderRadius: '8px'
          }}
        >
          Back to Home
        </Button>
      </Container>
    </Box>
  );
}
