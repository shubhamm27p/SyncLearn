import React, { useContext, useState } from "react";
import withAuth from '../utils/withAuth';
import { useNavigate } from "react-router-dom";
import RestoreIcon from '@mui/icons-material/Restore';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import {
  Button, TextField, Menu, MenuItem, ListItemIcon, ListItemText, Divider,
  Box, Typography, Paper, Container, IconButton, Drawer, List, ListItem,
  ListItemButton, Chip, useMediaQuery, useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import QuizIcon from '@mui/icons-material/Quiz';
import PersonIcon from '@mui/icons-material/Person';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { AuthContext } from '../contents/AuthContents';
import toast from 'react-hot-toast';
import ContactSupportModal from '../components/ContactSupportModal';

function HomeComponent() {
    let navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [meetingCode, setMeetingCode] = useState("");
    const [meetingCodeError, setMeetingCodeError] = useState("");
    const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
    const [supportModalOpen, setSupportModalOpen] = useState(false);

    const getActiveUser = () => {
        try {
            const sUser = sessionStorage.getItem('user');
            const lUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
            if (user) return user;
            if (sUser && sUser !== 'undefined' && sUser !== 'null') return JSON.parse(sUser);
            if (lUser && lUser !== 'undefined' && lUser !== 'null') return JSON.parse(lUser);
            return {};
        } catch (e) {
            return {};
        }
    };
    const activeUser = getActiveUser();
    const isAdmin = sessionStorage.getItem('admin_authenticated') === 'true' || activeUser?.role === 'admin' || activeUser?.role === 'trainer';

    let handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) {
            setMeetingCodeError("Please enter a meeting code");
            toast.error("Please enter a meeting code to join.");
            return;
        }
        setMeetingCodeError("");
        try {
            await addToUserHistory(meetingCode);
        } catch (err) {
            console.error("Could not add to history:", err);
        }
        navigate(`/${meetingCode}`);
    };

    let handleCreateNewMeeting = async () => {
        const randomCode = `meet-${Math.random().toString(36).substring(2, 9)}`;
        try {
            await addToUserHistory(randomCode);
        } catch (err) {
            console.error("Could not add to history:", err);
        }
        navigate(`/${randomCode}`);
    };

    return (
        <Box sx={{ height: "100vh", maxHeight: "100vh", backgroundColor: "#f8f9fa", display: "flex", flexDirection: "column", overflow: { xs: "auto", md: "hidden" } }}>
            {/* Dynamic Responsive Header Navigation Bar */}
            <Box
                component="nav"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: { xs: 2, sm: 3, md: 6 },
                    py: 1.8,
                    backgroundColor: "#ffffff",
                    borderBottom: "1px solid #eaecf0",
                    position: "sticky",
                    top: 0,
                    zIndex: 1100,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }} onClick={() => navigate('/home')}>
                    <VideoCallIcon sx={{ fontSize: 32, color: "#0e71eb" }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#101828", fontSize: "20px", letterSpacing: "-0.4px" }}>
                        SyncLearn
                    </Typography>
                </Box>

                {/* Desktop Navigation Links */}
                {!isMobile ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        {isAdmin ? (
                            <Button 
                                startIcon={<AdminPanelSettingsIcon />} 
                                onClick={() => navigate('/admin/tests')}
                                sx={{ color: "#eab308", fontWeight: 600, fontSize: "14px", textTransform: "none" }}
                            >
                                Admin Panel
                            </Button>
                        ) : (
                            <Button 
                                startIcon={<SchoolIcon />} 
                                onClick={() => navigate('/student/dashboard')}
                                sx={{ color: "#0e71eb", fontWeight: 600, fontSize: "14px", textTransform: "none" }}
                            >
                                Student Portal
                            </Button>
                        )}
                        <Button 
                            startIcon={<RestoreIcon />} 
                            onClick={() => navigate('/history')}
                            sx={{ color: "#344054", fontWeight: 500, fontSize: "14px", textTransform: "none" }}
                        >
                            History
                        </Button>      
                        <Button 
                            startIcon={<SettingsIcon />} 
                            endIcon={<KeyboardArrowDownIcon />}
                            onClick={(e) => setSettingsAnchorEl(e.currentTarget)}
                            sx={{ color: "#344054", fontWeight: 500, fontSize: "14px", textTransform: "none" }}
                        >
                            Settings
                        </Button>

                        <Menu
                            anchorEl={settingsAnchorEl}
                            open={Boolean(settingsAnchorEl)}
                            onClose={() => setSettingsAnchorEl(null)}
                            PaperProps={{
                                elevation: 0,
                                sx: {
                                    mt: 1.5,
                                    borderRadius: "12px",
                                    minWidth: 200,
                                    p: 0.5,
                                    border: "1px solid #eaecf0",
                                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.06)"
                                }
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <MenuItem 
                                onClick={() => {
                                    setSettingsAnchorEl(null);
                                    navigate('/profile');
                                }}
                                sx={{ py: 1.2, px: 2, borderRadius: "8px", gap: 1.5 }}
                            >
                                <ListItemIcon sx={{ color: "#0e71eb", minWidth: "auto !important" }}>
                                    <PersonIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary="Profile & Account" primaryTypographyProps={{ fontWeight: 600, fontSize: "0.9rem", color: "#101828" }} />
                            </MenuItem>
                            <MenuItem 
                                onClick={() => {
                                    setSettingsAnchorEl(null);
                                    setSupportModalOpen(true);
                                }}
                                sx={{ py: 1.2, px: 2, borderRadius: "8px", gap: 1.5, textDecoration: "none", color: "inherit" }}
                            >
                                <ListItemIcon sx={{ color: "#0e71eb", minWidth: "auto !important" }}>
                                    <SupportAgentIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary="Contact Support" primaryTypographyProps={{ fontWeight: 600, fontSize: "0.9rem", color: "#101828" }} />
                            </MenuItem>
                            <Divider sx={{ my: 0.5 }} />
                            <MenuItem 
                                onClick={() => {
                                    setSettingsAnchorEl(null);
                                    localStorage.removeItem("token");
                                    sessionStorage.removeItem("admin_authenticated");
                                    navigate('/auth');
                                }}
                                sx={{ py: 1.2, px: 2, borderRadius: "8px", gap: 1.5, color: "#ef4444" }}
                            >
                                <ListItemIcon sx={{ color: "#ef4444", minWidth: "auto !important" }}>
                                    <LogoutIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600, fontSize: "0.9rem", color: "#ef4444" }} />
                            </MenuItem>
                        </Menu>
                    </Box>
                ) : (
                    <IconButton
                        onClick={() => setMobileOpen(!mobileOpen)}
                        sx={{ color: "#101828", border: "1px solid #eaecf0", borderRadius: "10px" }}
                    >
                        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
                    </IconButton>
                )}
            </Box>

            {/* Mobile Drawer Menu */}
            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                PaperProps={{
                    sx: { width: 280, p: 2 }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, pb: 1, borderBottom: '1px solid #eaecf0' }}>
                    <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 700, color: '#101828' }}>
                        SyncLearn Menu
                    </Typography>
                    <IconButton onClick={() => setMobileOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <List>
                    {isAdmin ? (
                        <ListItem disablePadding sx={{ mb: 1 }}>
                            <ListItemButton onClick={() => { setMobileOpen(false); navigate('/admin/tests'); }} sx={{ borderRadius: "8px" }}>
                                <ListItemIcon><AdminPanelSettingsIcon sx={{ color: "#eab308" }} /></ListItemIcon>
                                <ListItemText primary="Admin Panel" primaryTypographyProps={{ fontWeight: 600 }} />
                            </ListItemButton>
                        </ListItem>
                    ) : (
                        <ListItem disablePadding sx={{ mb: 1 }}>
                            <ListItemButton onClick={() => { setMobileOpen(false); navigate('/student/dashboard'); }} sx={{ borderRadius: "8px" }}>
                                <ListItemIcon><SchoolIcon sx={{ color: "#0e71eb" }} /></ListItemIcon>
                                <ListItemText primary="Student Portal" primaryTypographyProps={{ fontWeight: 600 }} />
                            </ListItemButton>
                        </ListItem>
                    )}
                    <ListItem disablePadding sx={{ mb: 1 }}>
                        <ListItemButton onClick={() => { setMobileOpen(false); navigate('/history'); }} sx={{ borderRadius: "8px" }}>
                            <ListItemIcon><RestoreIcon sx={{ color: "#344054" }} /></ListItemIcon>
                            <ListItemText primary="History" primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                        <ListItemButton onClick={() => { setMobileOpen(false); navigate('/profile'); }} sx={{ borderRadius: "8px" }}>
                            <ListItemIcon><PersonIcon sx={{ color: "#344054" }} /></ListItemIcon>
                            <ListItemText primary="Profile & Account" primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                        <ListItemButton onClick={() => { setMobileOpen(false); setSupportModalOpen(true); }} sx={{ borderRadius: "8px" }}>
                            <ListItemIcon><SupportAgentIcon sx={{ color: "#344054" }} /></ListItemIcon>
                            <ListItemText primary="Contact Support" primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>

            {/* Content Body */}
            <Container maxWidth="lg" sx={{ flex: 1, display: "flex", alignItems: "center", py: { xs: 3, md: 2 }, overflow: "hidden" }}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: { xs: 3, md: 5 },
                        width: "100%"
                    }}
                >
                    {/* Left Join Card */}
                    <Paper
                        elevation={0}
                        sx={{
                            flex: 1,
                            maxWidth: 520,
                            p: { xs: 3, md: 3.5 },
                            backgroundColor: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "12px",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)"
                        }}
                    >
                        <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827", mb: 1, letterSpacing: "-0.3px", fontSize: { xs: "1.5rem", md: "1.85rem" } }}>
                            Quality Video Meetings & Live Examinations
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#475569", mb: 3, lineHeight: 1.5, fontSize: "0.95rem" }}>
                            Connect, collaborate, and conduct interactive examinations from anywhere with SyncLearn.
                        </Typography>
                        
                        <Button 
                            onClick={() => navigate(isAdmin ? '/admin/tests' : '/student/dashboard')}
                            variant="contained"
                            size="large"
                            startIcon={isAdmin ? <AdminPanelSettingsIcon /> : <SchoolIcon />}
                            sx={{ 
                                backgroundColor: "#0e71eb", 
                                "&:hover": { backgroundColor: "#0b5ed7" },
                                textTransform: "none", 
                                fontSize: "0.95rem", 
                                fontWeight: 600, 
                                py: 1.2, 
                                px: 3, 
                                borderRadius: "8px",
                                width: "100%",
                                mb: 1.5,
                                boxShadow: "0 4px 12px rgba(14, 113, 235, 0.2)"
                            }}
                        >
                            {isAdmin ? "Manage Tests" : "Student Portal"}
                        </Button>

                        <Button 
                            onClick={handleCreateNewMeeting}
                            variant="contained"
                            size="large"
                            startIcon={<AddIcon />}
                            sx={{ 
                                backgroundColor: "#10b981", 
                                "&:hover": { backgroundColor: "#059669" },
                                textTransform: "none", 
                                fontSize: "0.95rem", 
                                fontWeight: 600, 
                                py: 1.2, 
                                px: 3, 
                                borderRadius: "8px",
                                width: "100%",
                                mb: 2.5,
                                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)"
                            }}
                        >
                            New Meeting
                        </Button>

                        {/* Meeting Code Input Group */}
                        <Box sx={{ display: "flex", gap: 1.5, alignItems: 'flex-start' }}>
                            <TextField 
                                onChange={(e) => {
                                    setMeetingCode(e.target.value);
                                    if(meetingCodeError) setMeetingCodeError("");
                                }} 
                                placeholder="Enter Meeting Code" 
                                variant="outlined" 
                                value={meetingCode}
                                error={!!meetingCodeError}
                                helperText={meetingCodeError}
                                sx={{
                                    flex: 1,
                                    "& .MuiOutlinedInput-root": {
                                        backgroundColor: "#f9fafb",
                                        borderRadius: "8px",
                                        "& fieldset": { borderColor: "#d1d5db" },
                                        "&:hover fieldset": { borderColor: "#9ca3af" },
                                        "&.Mui-focused fieldset": { borderColor: "#0e71eb" },
                                        "& input": { py: 1.2, fontSize: "0.95rem", color: "#111827" }
                                    }
                                }}
                            />
                            <Button 
                                onClick={handleJoinVideoCall} 
                                variant="contained"
                                size="large"
                                sx={{
                                    backgroundColor: "#0e71eb",
                                    "&:hover": { backgroundColor: "#0b5ed7" },
                                    textTransform: "none",
                                    fontSize: "0.95rem",
                                    fontWeight: 600,
                                    px: 3,
                                    py: 1.2,
                                    borderRadius: "8px"
                                }}
                            >
                                Join
                            </Button>  
                        </Box>
                    </Paper>

                    {/* Right Hero Image */}
                    <Box
                        sx={{
                            flex: 1,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                    >
                        <Box
                            component="img"
                            src="/logo3.png"
                            alt="SyncLearn Hero"
                            sx={{
                                maxWidth: "100%",
                                maxHeight: { xs: 240, md: 320 },
                                height: "auto",
                                objectFit: "contain"
                            }}
                        />
                    </Box>
                </Box>
            </Container> 
            <ContactSupportModal open={supportModalOpen} onClose={() => setSupportModalOpen(false)} />
        </Box>
    );
}

export default withAuth(HomeComponent);