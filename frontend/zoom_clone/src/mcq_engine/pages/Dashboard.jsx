import React from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminDashboard from './admin/AdminDashboard';
import StudentDashboard from './student/StudentDashboard';

const Dashboard = () => {
  const { role } = useAuth();

  if (role === 'admin' || role === 'trainer') {
    return <AdminDashboard />;
  }

  return <StudentDashboard />;
};

export default Dashboard;
