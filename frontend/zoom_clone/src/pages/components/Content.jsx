import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

export default function Content(props) {
  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        {props.children}
      </Box>
    </Container>
  );
}
