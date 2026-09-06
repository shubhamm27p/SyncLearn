import React, { useContext, useState } from "react";
import withAuth from '../utils/withAuth';
import { useNavigate } from "react-router-dom";
import RestoreIcon from '@mui/icons-material/Restore';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Button, TextField, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Box, Typography, Paper, Container } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import QuizIcon from '@mui/icons-material/Quiz';
import PersonIcon from '@mui/icons-material/Person';
import { AuthContext } from '../contents/AuthContents';
import toast from 'react-hot-toast';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const [meetingCodeError, setMeetingCodeError] = useState("");
    const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);

    const { addToUserHistory } = useContext(AuthContext);

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
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f8f9fa", display: "flex", flexDirection: "column" }}>
            {/* Header Navigation Bar */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: { xs: 3, md: 6 },
                    py: 2,
                    backgroundColor: "#ffffff",
                    borderBottom: "1px solid #eaecf0"
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }} onClick={() => navigate('/home')}>
                    <VideoCallIcon sx={{ fontSize: 32, color: "#0e71eb" }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#101828", fontSize: "20px", letterSpacing: "-0.4px" }}>
                        SyncLearn
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Button 
                        startIcon={<QuizIcon />} 
                        onClick={() => navigate('/tests')}
                        sx={{ color: "#0e71eb", fontWeight: 600, fontSize: "14px", textTransform: "none" }}
                    >
                        Test Hub
                    </Button>
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
                        <Divider sx={{ my: 0.5 }} />
                        <MenuItem 
                            onClick={() => {
                                setSettingsAnchorEl(null);
                                localStorage.removeItem("token");
                                navigate('/auth');
                            }}
                            sx={{ py: 1.2, px: 2, borderRadius: "8px", gap: 1.5, color: "#dc2626" }}
                        >
                            <ListItemIcon sx={{ color: "#dc2626", minWidth: "auto !important" }}>
                                <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600, fontSize: "0.9rem", color: "#dc2626" }} />
                        </MenuItem>
                    </Menu>
                </Box>   
            </Box>   

            {/* Content Body */}
            <Container maxWidth="lg" sx={{ flex: 1, display: "flex", alignItems: "center", py: 6 }}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 6,
                        width: "100%"
                    }}
                >
                    {/* Left Join Card */}
                    <Paper
                        elevation={0}
                        sx={{
                            flex: 1,
                            maxWidth: 520,
                            p: 4,
                            backgroundColor: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "12px",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)"
                        }}
                    >
                        <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827", mb: 1, letterSpacing: "-0.3px" }}>
                            Quality Video Meetings & Live Examinations
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#475569", mb: 3.5, lineHeight: 1.6 }}>
                            Connect, collaborate, and conduct interactive examinations from anywhere with SyncLearn.
                        </Typography>
                        
                        <Button 
                            onClick={() => navigate('/tests')}
                            variant="contained"
                            size="large"
                            startIcon={<QuizIcon />}
                            sx={{ 
                                backgroundColor: "#0e71eb", 
                                "&:hover": { backgroundColor: "#0b5ed7" },
                                textTransform: "none", 
                                fontSize: "1rem", 
                                fontWeight: 600, 
                                py: 1.4, 
                                px: 3, 
                                borderRadius: "8px",
                                width: "100%",
                                mb: 1.5,
                                boxShadow: "0 4px 12px rgba(14, 113, 235, 0.2)"
                            }}
                        >
                            Create / Manage Tests
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
                                fontSize: "1rem", 
                                fontWeight: 600, 
                                py: 1.4, 
                                px: 3, 
                                borderRadius: "8px",
                                width: "100%",
                                mb: 3,
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
                                        "& input": { py: 1.4, fontSize: "0.95rem", color: "#111827" }
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
                                maxHeight: 380,
                                height: "auto",
                                objectFit: "contain"
                            }}
                        />
                    </Box>
                </Box>
            </Container> 
        </Box>
    );
}

export default withAuth(HomeComponent);