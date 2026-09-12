import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/auth" replace />;
  }

  // Fallback to student role if metadata is not provided
  const currentRole = user?.publicMetadata?.role || 'student';

  if (allowedRoles) {
    const roleMatch = allowedRoles.some((role) => {
      if (role === 'admin' || role === 'trainer') {
        return currentRole === 'admin' || currentRole === 'trainer';
      }
      return currentRole === role;
    });

    if (!roleMatch) {
      return <Navigate to="/home" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
