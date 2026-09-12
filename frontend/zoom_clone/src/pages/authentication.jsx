import React from 'react';
import { Box, Container, CssBaseline } from '@mui/material';
import { SignIn } from '@clerk/clerk-react';

export default function Authentication() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa',
        py: 4,
        px: 2
      }}
    >
      <Container component="main" sx={{ p: 0, display: 'flex', justifyContent: 'center' }}>
        <CssBaseline />
        <SignIn 
          routing="path" 
          path="/auth" 
          appearance={{
            elements: {
              footerAction: { display: "none" }
            }
          }}
        />
      </Container>
    </Box>
  );
}