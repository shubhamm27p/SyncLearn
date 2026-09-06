import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

export default function SignInCard(props) {
  return (
    <Card variant="outlined" sx={{ maxWidth: 400 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Sign In
        </Typography>
        <Box component="form" noValidate autoComplete="off">
          <TextField
            id="email"
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Sign In
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
