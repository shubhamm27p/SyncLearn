import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../contents/AuthContents';

const ProtectedRoute = ({ allowedRoles }) => {
  const { userRole, currentUser, isAuthReady } = useContext(AuthContext);

  if (!isAuthReady) {
    return (
      <div className="app-loading-wrapper">
        <div className="app-loading-spinner"></div>
        <div className="app-loading-text">Signing you in…</div>
      </div>
    );
  }

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
