import React, { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, InputAdornment, IconButton, Alert } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ShieldIcon from '@mui/icons-material/Shield';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// ─── HARDCODED ADMIN CREDENTIALS ───────────────────────────────────────────
const ADMIN_CREDENTIALS = {
  username: 'synclearn_admin',
  password: 'SyncAdmin@2026!',
};
// ───────────────────────────────────────────────────────────────────────────

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  const handleLogin = async () => {
    if (locked) {
      toast.error('Too many failed attempts. Please wait 30 seconds.');
      return;
    }

    setError('');
    if (!username || !password) {
      setError('Both fields are required.');
      return;
    }

    setIsLoading(true);
    // Simulate slight network delay for security feel
    await new Promise((r) => setTimeout(r, 900));

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      sessionStorage.setItem('admin_authenticated', 'true');
      sessionStorage.setItem('admin_login_time', Date.now().toString());
      toast.success('Welcome back, Administrator!');
      navigate('/admin');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLocked(true);
        toast.error('Account locked for 30 seconds after 5 failed attempts.');
        setTimeout(() => {
          setLocked(false);
          setAttempts(0);
        }, 30000);
        setError('Too many failed attempts. Access locked for 30 seconds.');
      } else {
        setError(`Invalid credentials. ${5 - newAttempts} attempt(s) remaining.`);
      }
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #0a1628 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative glow orbs */}
      <Box sx={{ position: 'absolute', top: -120, left: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,113,235,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -100, right: -80, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 440,
          mx: 2,
          p: '44px 40px',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Logo & Title */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 64, height: 64, borderRadius: '16px',
              background: 'linear-gradient(135deg, #0e71eb, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2.5,
              boxShadow: '0 8px 24px rgba(14,113,235,0.4)',
            }}
          >
            <ShieldIcon sx={{ fontSize: 34, color: '#fff' }} />
          </Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: '#f1f5f9', letterSpacing: '-0.5px', mb: 0.5 }}>
            Admin Control Panel
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '13px' }}>
            SyncLearn · Restricted Access Only
          </Typography>
        </Box>

        {/* Security Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(14,113,235,0.1)', border: '1px solid rgba(14,113,235,0.2)', borderRadius: '8px', px: 2, py: 1, mb: 3 }}>
          <LockOutlinedIcon sx={{ fontSize: 16, color: '#0e71eb' }} />
          <Typography variant="caption" sx={{ color: '#93c5fd', fontWeight: 500 }}>
            This area is secured. All login attempts are logged.
          </Typography>
        </Box>

        {/* Fields */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500, mb: '6px' }}>
            Admin Username
          </Typography>
          <TextField
            fullWidth hiddenLabel
            placeholder="Enter admin username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            sx={inputSx}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography sx={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500, mb: '6px' }}>
            Password
          </Typography>
          <TextField
            fullWidth hiddenLabel
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(s => !s)}
                      edge="end"
                      sx={{ color: '#475569' }}
                    >
                      {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={inputSx}
          />
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: '10px', bgcolor: 'rgba(220,38,38,0.1)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.3)', '& .MuiAlert-icon': { color: '#f87171' } }}
          >
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          disabled={isLoading || locked}
          sx={{
            py: 1.5,
            background: 'linear-gradient(135deg, #0e71eb, #7c3aed)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '15px',
            borderRadius: '10px',
            textTransform: 'none',
            boxShadow: '0 4px 20px rgba(14,113,235,0.35)',
            '&:hover': { background: 'linear-gradient(135deg, #0c62ce, #6d28d9)', boxShadow: '0 6px 24px rgba(14,113,235,0.5)' },
            '&.Mui-disabled': { background: 'rgba(255,255,255,0.1)', color: '#475569' },
            transition: 'all 0.2s ease',
          }}
        >
          {isLoading ? 'Authenticating...' : locked ? 'Locked — Wait 30s' : 'Access Admin Panel'}
        </Button>

        <Button
          fullWidth
          variant="text"
          onClick={() => navigate('/')}
          sx={{ mt: 2, color: '#475569', textTransform: 'none', fontSize: '13px', '&:hover': { color: '#94a3b8' } }}
        >
          ← Return to Main Site
        </Button>
      </Paper>
    </Box>
  );
}

const inputSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: '14px',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
    '&.Mui-focused fieldset': { borderColor: '#0e71eb', boxShadow: '0 0 0 3px rgba(14,113,235,0.15)' },
    '& input': {
      padding: '11px 14px',
      '&::placeholder': { color: '#475569', opacity: 1 },
    },
  },
};
