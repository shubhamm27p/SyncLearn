import { useContext } from 'react';
import { AuthContext } from '../../contents/AuthContents';

export const useAuth = () => {
  const { currentUser, userRole, handleLogin, handleRegister } = useContext(AuthContext);

  const user = currentUser
    ? {
        ...currentUser,
        role: userRole || currentUser.role || 'student',
        id: currentUser._id || currentUser.id || 'user_1',
      }
    : {
        name: 'User',
        email: 'user@synclearn.com',
        role: userRole || 'student',
        id: 'user_1',
      };

  return {
    user,
    role: userRole || user?.role || 'student',
    token: localStorage.getItem('token'),
    login: handleLogin,
    register: handleRegister,
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userRole');
      window.location.href = '/auth';
    },
  };
};

export default useAuth;
