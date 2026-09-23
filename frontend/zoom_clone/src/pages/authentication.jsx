import React, { useState, useContext, useEffect } from 'react';
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
  MenuItem,
  CircularProgress
} from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';
import LockResetIcon from '@mui/icons-material/LockReset';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contents/AuthContents';
import toast from 'react-hot-toast';
import ContactSupportModal from '../components/ContactSupportModal.jsx';
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

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
      },
      '&:-webkit-autofill': {
        WebkitBoxShadow: '0 0 0 1000px #f9fafb inset !important',
        WebkitTextFillColor: '#111827 !important',
        borderRadius: '8px'
      }
    }
  }
};

export default function Authentication() {
  const routeTo = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Password reset state
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [supportModalOpen, setSupportModalOpen] = useState(false);
  



  // 0: Log In, 1: Register/Sign Up, 2: Forgot Password, 3: Reset Password
  const [formState, setFormState] = useState(0);
  const [open, setOpen] = useState(false);

  const goAfterAuthentication = () => {
    const params = new URLSearchParams(location.search);
    const redirectUrl = params.get('redirect');
    if (redirectUrl) {
      routeTo(redirectUrl, { replace: true });
    } else {
      routeTo(location.state?.from || '/home', { replace: true });
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const {
    handleRegister,
    handleLogin,
    handleForgotPassword,
    handleResetPassword,
    isAuthReady
  } = useContext(AuthContext);

  const isSsoCallback = location.pathname.includes('/sso-callback');

  useEffect(() => {
    if (isSsoCallback) return;
    if (!isAuthReady) return;
    const token = localStorage.getItem('token');
    if (token) {
      goAfterAuthentication();
    }
  }, [isAuthReady, isSsoCallback, location.search, location.state]);

  if (isSsoCallback) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2, color: '#667085' }}>Completing sign-in…</Typography>
        </Box>
        <AuthenticateWithRedirectCallback
          signInFallbackRedirectUrl="/home"
          signUpFallbackRedirectUrl="/home"
          signInForceRedirectUrl="/home"
          signUpForceRedirectUrl="/home"
        />
      </Box>
    );
  }

  const hasAppToken = Boolean(localStorage.getItem('token'));
  if (!isAuthReady) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2, color: '#667085' }}>Signing you in…</Typography>
        </Box>
      </Box>
    );
  }

  const handleAuth = async () => {
    setFieldErrors({});
    setError('');
    let errors = {};
    
    if (formState === 0) {
      if (!username) errors.username = "Username/Email is required";
      if (!password) errors.password = "Password is required";
    } else if (formState === 1) {
      if (!name || !name.trim()) errors.name = "Full name is required";
      if (!username || !username.trim()) errors.username = "Username/Email is required";
      if (!password) errors.password = "Password is required";
      else if (password.length < 6) errors.password = "Password must be at least 6 characters";
      if (!confirmPassword) errors.confirmPassword = "Please confirm your password";
      else if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";
    } else if (formState === 2) {
      if (!username) errors.username = "Username/Email is required";
    } else if (formState === 3) {
      if (!resetToken) errors.resetToken = "Reset code is required";
      if (!newPassword) errors.newPassword = "New password is required";
      else if (newPassword.length < 6) errors.newPassword = "Password must be at least 6 characters";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fix the highlighted errors in the form.");
      return;
    }

    setIsLoading(true);
    try {
      if (formState === 0) {
        let result = await handleLogin(username, password);
        setMessage(result || 'Logged in successfully!');
        setOpen(true);
        setError('');
        goAfterAuthentication();
      } else if (formState === 1) {
        let result = await handleRegister(name.trim(), username.trim(), password, role);
        setMessage(result || 'Account created successfully! Please sign in.');
        setOpen(true);
        setError('');
        toast.success('Registration successful! You can now log in.');
        setFormState(0);
        setPassword('');
        setConfirmPassword('');
      } else if (formState === 2) {
        let result = await handleForgotPassword(username);
        setMessage(result.message || 'A password reset code was sent to your email.');
        setOpen(true);
        setError('');
        setFormState(3);
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
          errMsg = 'Network Error: Cannot reach the backend server. Please check your internet connection or backend status.';
        } else {
          errMsg = err.message || 'An error occurred';
        }
      }
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
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
            {formState === 0 && 'Sign in to access your meeting rooms and tests'}
            {formState === 1 && 'Create an account to join live classes & exams'}
            {formState === 2 && 'Enter your username or email to receive a reset code'}
            {formState === 3 && 'Enter your reset code and new password'}
          </Typography>

          {/* Form Fields Section */}
          <Box component="form" noValidate sx={{ width: '100%' }}>
            {formState === 1 && (
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
                  autoFocus={formState === 1}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={inputSx}
                  error={!!fieldErrors.name}
                  helperText={fieldErrors.name}
                />
              </Box>
            )}

            {(formState === 0 || formState === 1 || formState === 2 || formState === 3) && (
              <Box sx={{ mb: 2 }}>
                <Typography component="label" sx={labelSx}>
                  {formState === 2 ? "Username or Email" : (formState === 1 ? "Username / Email Address" : "Username / Email")}
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
                  error={!!fieldErrors.username}
                  helperText={fieldErrors.username}
                />
              </Box>
            )}

            {formState === 1 && (
              <Box sx={{ mb: 2 }}>
                <Typography component="label" sx={labelSx}>
                  Account Type / Role
                </Typography>
                <Select
                  fullWidth
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  sx={{
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#111827',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9ca3af' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#0e71eb',
                      boxShadow: '0 0 0 2px rgba(14, 113, 235, 0.2)',
                    },
                    '& .MuiSelect-select': { padding: '10px 14px' }
                  }}
                >
                  <MenuItem value="student">Student (Take Tests & Attend Meetings)</MenuItem>
                  <MenuItem value="trainer">Trainer / Instructor (Host Meetings & Manage Tests)</MenuItem>
                </Select>
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
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <KeyIcon sx={{ color: '#0e71eb', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                    error={!!fieldErrors.resetToken}
                    helperText={fieldErrors.resetToken}
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
                    InputProps={{
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
                    }}
                    sx={inputSx}
                    error={!!fieldErrors.newPassword}
                    helperText={fieldErrors.newPassword}
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
                  autoComplete={formState === 0 ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
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
                  }}
                  sx={inputSx}
                  error={!!fieldErrors.password}
                  helperText={fieldErrors.password}
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

            {formState === 1 && (
              <Box sx={{ mb: 2 }}>
                <Typography component="label" sx={labelSx}>
                  Confirm Password
                </Typography>
                <TextField
                  hiddenLabel
                  placeholder="Re-enter password to confirm"
                  fullWidth
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  sx={inputSx}
                  error={!!fieldErrors.confirmPassword}
                  helperText={fieldErrors.confirmPassword}
                />
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
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : (
                <>
                  {formState === 0 && 'Sign In'}
                  {formState === 1 && 'Create Account'}
                  {formState === 2 && 'Send Reset Code to Email'}
                  {formState === 3 && 'Reset Password'}
                </>
              )}
            </Button>

            {/* Toggle Between Sign In and Sign Up */}
            {formState === 0 && (
              <Box sx={{ textAlign: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '13px' }}>
                  Don't have an account?{' '}
                  <Typography
                    component="span"
                    onClick={() => { setFormState(1); setError(''); setFieldErrors({}); }}
                    sx={{ color: '#0e71eb', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Sign Up
                  </Typography>
                </Typography>
              </Box>
            )}

            {formState === 1 && (
              <Box sx={{ textAlign: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '13px' }}>
                  Already have an account?{' '}
                  <Typography
                    component="span"
                    onClick={() => { setFormState(0); setError(''); setFieldErrors({}); }}
                    sx={{ color: '#0e71eb', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Sign In
                  </Typography>
                </Typography>
              </Box>
            )}

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


          </Box>
        </Paper>

        {/* Contact Support Footer */}
        <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '13px', mt: 2.5, textAlign: 'center' }}>
          Need help?{' '}
          <Typography
            component="span"
            onClick={() => setSupportModalOpen(true)}
            sx={{
              color: '#0e71eb',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Contact Support (synclearn.pvt@gmail.com)
          </Typography>
        </Typography>

        <Snackbar
          open={open}
          autoHideDuration={4000}
          onClose={() => setOpen(false)}
        >
          <Alert severity="success" sx={{ width: '100%', borderRadius: '8px' }}>
            {message}
          </Alert>
        </Snackbar>

        <ContactSupportModal open={supportModalOpen} onClose={() => setSupportModalOpen(false)} />
      </Container>
    </Box>
  );
}