import React, { useContext, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, IconButton, Drawer, List,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Divider,
  Chip, useMediaQuery, useTheme
} from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import QuizIcon from '@mui/icons-material/Quiz';
import HomeIcon from '@mui/icons-material/Home';
import RestoreIcon from '@mui/icons-material/Restore';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';
import { AuthContext } from '../../contents/AuthContents';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const getActiveUser = () => {
    try {
      const sUser = sessionStorage.getItem('user');
      const lUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
      if (sUser && sUser !== 'undefined' && sUser !== 'null') return JSON.parse(sUser);
      if (lUser && lUser !== 'undefined' && lUser !== 'null') return JSON.parse(lUser);
      return {};
    } catch (e) {
      return {};
    }
  };
  const activeUser = getActiveUser();
  const isAdmin = sessionStorage.getItem('admin_authenticated') === 'true' || activeUser?.role === 'admin' || activeUser?.role === 'trainer';

  const navItems = [
    ...(isAdmin ? [
      {
        label: 'Manage Tests',
        path: '/admin/tests',
        icon: <AdminPanelSettingsIcon />,
        active: location.pathname.startsWith('/admin/tests')
      },
      {
        label: 'View Results',
        path: '/admin/results',
        icon: <AssessmentIcon />,
        active: location.pathname === '/admin/results'
      }
    ] : []),
    {
      label: isAdmin ? 'Assessment Portal' : 'Student Portal',
      path: '/student/dashboard',
      icon: <SchoolIcon />,
      active: location.pathname === '/student/dashboard'
    },
    {
      label: 'My Results',
      path: '/student/results',
      icon: <AssessmentIcon />,
      active: location.pathname.startsWith('/student/results')
    },
    {
      label: 'Main Dashboard',
      path: '/home',
      icon: <HomeIcon />,
      active: location.pathname === '/home'
    }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (path) => {
    navigate(path);
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', color: '#101828' }}>
      {/* SyncLearn Dynamic Responsive Navigation Header */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3, md: 5 },
          py: 1.5,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #eaecf0',
          borderRadius: 0,
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}
      >
        {/* Brand Logo & Title */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
          onClick={() => navigate('/home')}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              backgroundColor: 'rgba(14,113,235,0.08)',
              border: '1px solid rgba(14,113,235,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <VideoCallIcon sx={{ fontSize: 26, color: '#0e71eb' }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#101828',
                fontSize: { xs: '17px', sm: '19px' },
                letterSpacing: '-0.4px',
                lineHeight: 1.2
              }}
            >
              SyncLearn
            </Typography>
            <Typography variant="caption" sx={{ color: '#0e71eb', fontSize: '11px', fontWeight: 600 }}>
              Assessment Portal
            </Typography>
          </Box>
        </Box>

        {/* Desktop Navigation Links */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                startIcon={item.icon}
                onClick={() => handleNavClick(item.path)}
                sx={{
                  color: item.active ? '#0e71eb' : '#344054',
                  backgroundColor: item.active ? 'rgba(14,113,235,0.08)' : 'transparent',
                  border: item.active ? '1px solid rgba(14,113,235,0.2)' : '1px solid transparent',
                  borderRadius: '10px',
                  px: 2,
                  py: 0.8,
                  fontWeight: item.active ? 700 : 500,
                  fontSize: '13px',
                  textTransform: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: item.active ? 'rgba(14,113,235,0.12)' : '#f2f4f7',
                    color: item.active ? '#0e71eb' : '#101828',
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        {/* Right Side Controls / User Badge / Mobile Hamburger */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Role Chip */}
          <Chip
            label={isAdmin ? 'Trainer / Admin' : 'Student'}
            size="small"
            sx={{
              backgroundColor: isAdmin ? 'rgba(217,119,6,0.1)' : 'rgba(16,185,129,0.1)',
              color: isAdmin ? '#d97706' : '#059669',
              border: `1px solid ${isAdmin ? 'rgba(217,119,6,0.25)' : 'rgba(16,185,129,0.25)'}`,
              fontWeight: 700,
              fontSize: '11px',
              display: { xs: 'none', sm: 'inline-flex' }
            }}
          />

          {/* Mobile Hamburger Toggle Button */}
          {isMobile && (
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                color: '#101828',
                backgroundColor: '#ffffff',
                border: '1px solid #eaecf0',
                borderRadius: '10px',
                p: 1,
              }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          )}
        </Box>
      </Paper>

      {/* Mobile Slide-Out Drawer Menu */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            width: 280,
            backgroundColor: '#ffffff',
            color: '#101828',
            borderLeft: '1px solid #eaecf0',
            p: 2,
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, pb: 1, borderBottom: '1px solid #eaecf0' }}>
          <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 700, color: '#101828' }}>
            Navigation Menu
          </Typography>
          <IconButton onClick={handleDrawerToggle} sx={{ color: '#667085' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <List sx={{ width: '100%' }}>
          {navItems.map((item) => (
            <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavClick(item.path)}
                selected={item.active}
                sx={{
                  borderRadius: '10px',
                  backgroundColor: item.active ? 'rgba(14,113,235,0.08)' : 'transparent',
                  color: item.active ? '#0e71eb' : '#344054',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(14,113,235,0.08)',
                    color: '#0e71eb',
                  },
                  '&:hover': {
                    backgroundColor: '#f2f4f7',
                    color: '#101828',
                  }
                }}
              >
                <ListItemIcon sx={{ color: item.active ? '#0e71eb' : '#667085', minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '14px', fontWeight: item.active ? 700 : 500 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2, borderColor: '#eaecf0' }} />

        <Box sx={{ p: 1 }}>
          <Chip
            label={isAdmin ? 'Role: Trainer / Admin' : 'Role: Student'}
            size="small"
            sx={{
              width: '100%',
              backgroundColor: isAdmin ? 'rgba(217,119,6,0.1)' : 'rgba(16,185,129,0.1)',
              color: isAdmin ? '#d97706' : '#059669',
              border: `1px solid ${isAdmin ? 'rgba(217,119,6,0.25)' : 'rgba(16,185,129,0.25)'}`,
              fontWeight: 700,
              fontSize: '12px',
              py: 0.5
            }}
          />
        </Box>
      </Drawer>

      {/* Main Content Container */}
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: '1400px', margin: '0 auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
