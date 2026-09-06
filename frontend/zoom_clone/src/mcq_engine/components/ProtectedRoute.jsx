import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../contents/AuthContents';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ allowedRoles }) => {
  const { userRole, currentUser } = useContext(AuthContext);
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  const currentRole = userRole || currentUser?.role || 'student';

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
