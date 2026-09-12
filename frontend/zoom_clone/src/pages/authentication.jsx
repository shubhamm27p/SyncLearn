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
import { useSignIn, AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '10px' }} fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

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
  const { signIn, isLoaded } = useSignIn();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Password reset state
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [supportModalOpen, setSupportModalOpen] = useState(false);
  
  const handleClerkOAuth = async (strategy) => {
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/auth/sso-callback',
        redirectUrlComplete: '/home'
      });
    } catch (err) {
      console.error(err);
      toast.error('OAuth Sign-In failed');
    }
  };

  if (location.pathname.includes('/sso-callback')) {
    return <AuthenticateWithRedirectCallback />;
  }

  // 0: Log In, 2: Forgot Password, 3: Reset Password
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
    handleGoogleLogin,
    handleForgotPassword,
    handleResetPassword
  } = useContext(AuthContext);

  const handleAuth = async () => {
    setFieldErrors({});
    setError('');
    let errors = {};
    
    if (formState === 0) {
      if (!username) errors.username = "Username/Email is required";
      if (!password) errors.password = "Password is required";
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
            {formState === 0 && 'Sign in to access your meeting rooms'}
            {formState === 2 && 'Enter your username or email to receive a reset code'}
            {formState === 3 && 'Enter your reset code and new password'}
          </Typography>

          {/* Form Fields Section */}
          <Box component="form" noValidate sx={{ width: '100%' }}>
            {(formState === 0 || formState === 2 || formState === 3) && (
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
                  error={!!fieldErrors.username}
                  helperText={fieldErrors.username}
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

            {(formState === 0) && (
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
                  {formState === 2 && 'Send Reset Code to Email'}
                  {formState === 3 && 'Reset Password'}
                </>
              )}
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

            {(formState === 0) && (
              <>
                <Divider sx={{ my: 2.5, fontSize: '12px', color: '#9ca3af', '&::before, &::after': { borderColor: '#e5e7eb' } }}>
                  OR
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setError('');
                    handleClerkOAuth('oauth_google');
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
                
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setError('');
                    handleClerkOAuth('oauth_github');
                  }}
                  sx={{
                    mt: 1.5,
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
                  <GitHubIcon /> Sign in with GitHub
                </Button>
              </>
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