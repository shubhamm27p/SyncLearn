import React, { useState, useContext } from 'react';
import {
  Button,
  CssBaseline,
  TextField,
  Paper,
  Box,
  Typography,
  Container,
  Snackbar,
  Alert,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Select,
  MenuItem
} from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';
import LockResetIcon from '@mui/icons-material/LockReset';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contents/AuthContents';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '10px' }}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const labelSx = {
  display: 'block',
  color: '#374151',
  fontSize: '13px',
  fontWeight: 500,
  mb: '6px'
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    color: '#111827',
    fontSize: '14px',
    '& fieldset': {
      borderColor: '#d1d5db',
    },
    '&:hover fieldset': {
      borderColor: '#9ca3af',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#0e71eb',
      borderWidth: '1px',
      boxShadow: '0 0 0 2px rgba(14, 113, 235, 0.2)',
    },
    '& input': {
      padding: '10px 14px',
      color: '#111827',
      '&::placeholder': {
        color: '#9ca3af',
        opacity: 1
      }
    }
  }
};

export default function Authentication() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Password reset state
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Google Modal state
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  // 0: Log In, 1: Sign Up, 2: Forgot Password, 3: Reset Password
  const [formState, setFormState] = useState(0);
  const [open, setOpen] = useState(false);

  const routeTo = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const {
    handleRegister,
    handleLogin,
    handleGoogleLogin,
    handleForgotPassword,
    handleResetPassword
  } = useContext(AuthContext);

  const handleAuth = async () => {
    try {
      if (formState === 0) {
        let result = await handleLogin(username, password);
        setMessage(result || 'Logged in successfully!');
        setOpen(true);
        setError('');
        routeTo('/home');
      } else if (formState === 1) {
        let result = await handleRegister(name, username, password, role);
        setMessage(result || 'Registered successfully!');
        setOpen(true);
        setError('');
        setFormState(0);
      } else if (formState === 2) {
        let result = await handleForgotPassword(username);
        setMessage(result.message || 'New password generated and sent to your email!');
        setOpen(true);
        setError('');
        if (result.newPassword) {
          setPassword(result.newPassword);
        }
        setFormState(0);
      } else if (formState === 3) {
        let result = await handleResetPassword(username, resetToken, newPassword);
        setMessage(result || 'Password reset successfully!');
        setOpen(true);
        setError('');
        setFormState(0);
      }
    } catch (err) {
      console.log(err);
      let errMsg = err.response?.data?.message;
      if (!errMsg) {
        if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
          errMsg = 'Network Error: Cannot reach server. Please ensure backend is running on http://localhost:8000.';
        } else {
          errMsg = err.message || 'An error occurred';
        }
      }
      setError(errMsg);
    }
  };

  const handleGoogleAuthSubmit = async () => {
    if (!googleEmail.trim()) {
      setError('Please enter a valid Google email address');
      return;
    }
    try {
      const result = await handleGoogleLogin(
        googleEmail.trim(),
        googleName.trim() || googleEmail.split('@')[0],
        `google_${Date.now()}`,
        role
      );
      setMessage(result || 'Signed in with Google!');
      setOpen(true);
      setGoogleModalOpen(false);
      routeTo('/home');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Google Sign-In failed');
    }
  };

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
      <Container component="main" sx={{ p: 0, maxWidth: '420px !important' }}>
        <CssBaseline />
        <Paper
          elevation={0}
          sx={{
            padding: '36px 30px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: '16px',
            width: '100%',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
            position: 'relative'
          }}
        >
          {/* Logo & Header Section */}
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'rgba(14, 113, 235, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2
            }}
          >
            {formState === 2 || formState === 3 ? (
              <LockResetIcon sx={{ fontSize: 30, color: '#0e71eb' }} />
            ) : (
              <VideoCallIcon sx={{ fontSize: 32, color: '#0e71eb' }} />
            )}
          </Box>

          <Typography
            component="h1"
            variant="h5"
            sx={{ fontWeight: 800, fontSize: '24px', color: '#101828', mb: 0.5, letterSpacing: '-0.3px' }}
          >
            SyncLearn
          </Typography>
          <Typography variant="body2" sx={{ color: '#667085', fontSize: '14px', mb: 3, textAlign: 'center' }}>
            {formState === 0 && 'Sign in to access your meeting rooms'}
            {formState === 1 && 'Create an account to get started'}
            {formState === 2 && 'Enter your username or email to receive a reset code'}
            {formState === 3 && 'Enter your reset code and new password'}
          </Typography>

          {/* Segmented Switcher ("Log In" / "Sign Up") */}
          {(formState === 0 || formState === 1) && (
            <Box
              sx={{
                display: 'flex',
                gap: '4px',
                mb: 3,
                width: '100%',
                backgroundColor: '#f3f4f6',
                p: '4px',
                borderRadius: '8px'
              }}
            >
              <Button
                fullWidth
                disableRipple
                onClick={() => { setFormState(0); setError(''); }}
                sx={{
                  borderRadius: '6px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  py: 0.9,
                  backgroundColor: formState === 0 ? '#0e71eb' : 'transparent',
                  color: formState === 0 ? '#ffffff' : '#4b5563',
                  boxShadow: formState === 0 ? '0 2px 8px rgba(14, 113, 235, 0.25)' : 'none',
                  '&:hover': {
                    backgroundColor: formState === 0 ? '#0c62ce' : '#e5e7eb',
                    color: formState === 0 ? '#ffffff' : '#111827'
                  }
                }}
              >
                Log In
              </Button>
              <Button
                fullWidth
                disableRipple
                onClick={() => { setFormState(1); setError(''); }}
                sx={{
                  borderRadius: '6px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  py: 0.9,
                  backgroundColor: formState === 1 ? '#0e71eb' : 'transparent',
                  color: formState === 1 ? '#ffffff' : '#4b5563',
                  boxShadow: formState === 1 ? '0 2px 8px rgba(14, 113, 235, 0.25)' : 'none',
                  '&:hover': {
                    backgroundColor: formState === 1 ? '#0c62ce' : '#e5e7eb',
                    color: formState === 1 ? '#ffffff' : '#111827'
                  }
                }}
              >
                Sign Up
              </Button>
            </Box>
          )}

          {/* Form Fields Section */}
          <Box component="form" noValidate sx={{ width: '100%' }}>
            {formState === 1 && (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography component="label" sx={labelSx}>
                    Full Name
                  </Typography>
                  <TextField
                    hiddenLabel
                    placeholder="Enter your full name"
                    fullWidth
                    id="name"
                    name="name"
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={inputSx}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography component="label" sx={labelSx}>
                    Account Role
                  </Typography>
                  <Select
                    fullWidth
                    id="role-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    sx={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      color: '#111827',
                      fontSize: '14px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#d1d5db',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#9ca3af',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#0e71eb',
                        borderWidth: '1px',
                        boxShadow: '0 0 0 2px rgba(14, 113, 235, 0.2)',
                      },
                      '& .MuiSelect-select': {
                        padding: '10px 14px',
                      },
                      '& .MuiSelect-icon': {
                        color: '#6b7280',
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: '#ffffff',
                          color: '#111827',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          mt: 0.5,
                          '& .MuiMenuItem-root': {
                            fontSize: '14px',
                            '&:hover': {
                              bgcolor: '#f3f4f6',
                            },
                            '&.Mui-selected': {
                              bgcolor: 'rgba(14, 113, 235, 0.1)',
                              color: '#0e71eb',
                              '&:hover': {
                                bgcolor: 'rgba(14, 113, 235, 0.15)',
                              }
                            }
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="trainer">Trainer</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </Box>
              </>
            )}

            {(formState === 0 || formState === 1 || formState === 2 || formState === 3) && (
              <Box sx={{ mb: 2 }}>
                <Typography component="label" sx={labelSx}>
                  {formState === 2 ? "Username or Email" : "Username / Email"}
                </Typography>
                <TextField
                  hiddenLabel
                  placeholder={formState === 2 ? "Enter your username or email" : "Enter username or email"}
                  fullWidth
                  id="username"
                  name="username"
                  autoComplete="username"
                  autoFocus={formState === 0 || formState === 2}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={inputSx}
                />
              </Box>
            )}

            {formState === 3 && (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography component="label" sx={labelSx}>
                    6-Digit Reset Code
                  </Typography>
                  <TextField
                    hiddenLabel
                    placeholder="Enter reset code"
                    fullWidth
                    id="resetToken"
                    name="resetToken"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <KeyIcon sx={{ color: '#0e71eb', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={inputSx}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography component="label" sx={labelSx}>
                    New Password
                  </Typography>
                  <TextField
                    hiddenLabel
                    placeholder="Enter new password"
                    fullWidth
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                              sx={{ color: '#6b7280' }}
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
              </>
            )}

            {(formState === 0 || formState === 1) && (
              <Box sx={{ mb: 1 }}>
                <Typography component="label" sx={labelSx}>
                  Password
                </Typography>
                <TextField
                  hiddenLabel
                  placeholder="Enter password"
                  fullWidth
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                            sx={{ color: '#6b7280' }}
                          >
                            {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={inputSx}
                />

                {formState === 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 1 }}>
                    <Button
                      variant="text"
                      onClick={() => { setFormState(2); setError(''); }}
                      sx={{
                        textTransform: 'none',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#0e71eb',
                        padding: 0,
                        minWidth: 'auto',
                        '&:hover': {
                          background: 'transparent',
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      Forgot Password?
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2, width: '100%', borderRadius: '8px', bgcolor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                {error}
              </Alert>
            )}

            {/* Primary Action Button */}
            <Button
              type="button"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                mb: 2,
                py: 1.4,
                backgroundColor: '#0e71eb',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#0b5ed7',
                  boxShadow: '0 6px 18px rgba(14, 113, 235, 0.35)'
                },
                fontSize: '15px',
                fontWeight: 600,
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(14, 113, 235, 0.25)'
              }}
              onClick={handleAuth}
            >
              {formState === 0 && 'Sign In'}
              {formState === 1 && 'Create Account'}
              {formState === 2 && 'Send Reset Code to Email'}
              {formState === 3 && 'Reset Password'}
            </Button>

            {(formState === 2 || formState === 3) && (
              <Button
                fullWidth
                variant="text"
                startIcon={<ArrowBackIcon />}
                onClick={() => { setFormState(0); setError(''); }}
                sx={{ textTransform: 'none', fontWeight: 600, color: '#6b7280', '&:hover': { color: '#111827' } }}
              >
                Back to Sign In
              </Button>
            )}

            {(formState === 0 || formState === 1) && (
              <>
                <Divider sx={{ my: 2.5, fontSize: '12px', color: '#9ca3af', '&::before, &::after': { borderColor: '#e5e7eb' } }}>
                  OR
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setError('');
                    setGoogleModalOpen(true);
                  }}
                  sx={{
                    py: 1.3,
                    backgroundColor: '#ffffff',
                    borderColor: '#d1d5db',
                    color: '#374151',
                    fontWeight: 600,
                    fontSize: '14px',
                    textTransform: 'none',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: '#f9fafb',
                      borderColor: '#9ca3af'
                    }
                  }}
                >
                  <GoogleIcon /> Sign in with Google
                </Button>
              </>
            )}
          </Box>
        </Paper>

        <Snackbar
          open={open}
          autoHideDuration={4000}
          onClose={() => setOpen(false)}
        >
          <Alert severity="success" sx={{ width: '100%', borderRadius: '8px' }}>
            {message}
          </Alert>
        </Snackbar>

        {/* Google Authentication Dialog */}
        <Dialog
          open={googleModalOpen}
          onClose={() => setGoogleModalOpen(false)}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: {
              backgroundColor: '#ffffff',
              color: '#111827',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              p: 1
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: '#111827' }}>
            <GoogleIcon /> Google Sign-In
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
              Continue to SyncLearn using your Google Account.
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography component="label" sx={labelSx}>
                Google Email Address
              </Typography>
              <TextField
                hiddenLabel
                type="email"
                fullWidth
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                placeholder="user@gmail.com"
                sx={inputSx}
              />
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography component="label" sx={labelSx}>
                Display Name (Optional)
              </Typography>
              <TextField
                hiddenLabel
                type="text"
                fullWidth
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                placeholder="John Doe"
                sx={inputSx}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setGoogleModalOpen(false)}
              sx={{ textTransform: 'none', color: '#6b7280', '&:hover': { color: '#111827' } }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleGoogleAuthSubmit}
              sx={{
                backgroundColor: '#0e71eb',
                '&:hover': { backgroundColor: '#0b5ed7' },
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                px: 3
              }}
            >
              Continue with Google
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}