import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import VideoCallIcon from '@mui/icons-material/VideoCall';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import EmailIcon from '@mui/icons-material/Email';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QuizIcon from '@mui/icons-material/Quiz';
import SecurityIcon from '@mui/icons-material/Security';
import GroupsIcon from '@mui/icons-material/Groups';
import SpeedIcon from '@mui/icons-material/Speed';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import VideocamIcon from '@mui/icons-material/Videocam';
import MicIcon from '@mui/icons-material/Mic';
import VerifiedIcon from '@mui/icons-material/Verified';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import CodeIcon from '@mui/icons-material/Code';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Chip,
  Card,
  CardContent,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Avatar,
  Stack,
  Divider,
  Paper
} from '@mui/material';
import ContactSupportModal from "../components/ContactSupportModal";

export default function LandingPage() {
    const router = useNavigate();
    const [supportModalOpen, setSupportModalOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f8fafc", color: "#0f172a", fontFamily: "'Inter', sans-serif" }}>
            
            {/* Top Announcement Bar */}
            <Box
                sx={{
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    py: 1,
                    px: 2,
                    textAlign: "center",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1
                }}
            >
                <Chip 
                    icon={<AutoAwesomeIcon sx={{ fontSize: "14px !important", color: "#fff" }} />}
                    label="NEW" 
                    size="small" 
                    sx={{ backgroundColor: "rgba(255, 255, 255, 0.2)", color: "#fff", fontWeight: 700, height: 22, fontSize: "0.72rem" }} 
                />
                <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                    Interactive Proctoring & Examination Mode is Now Live!
                </Typography>
                <Box
                    component="span"
                    onClick={() => router('/auth')}
                    sx={{ textDecoration: "underline", cursor: "pointer", fontWeight: 700, ml: 0.5, "&:hover": { opacity: 0.9 } }}
                >
                    Try It Now →
                </Box>
            </Box>

            {/* 1. Modern Header & Navigation (Glassmorphism Sticky Bar) */}
            <Box
                component="nav"
                sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1100,
                    backgroundColor: "rgba(255, 255, 255, 0.85)",
                    backdropFilter: "blur(12px)",
                    borderBottom: "1px solid #f1f5f9",
                    px: { xs: 2.5, md: 6 },
                    py: 1.8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.2s ease"
                }}
            >
                {/* Left Brand Logo */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }} onClick={() => router("/")}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "10px",
                            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ffffff",
                            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)"
                        }}
                    >
                        <VideoCallIcon sx={{ fontSize: 26 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "21px", letterSpacing: "-0.5px" }}>
                        Sync<Box component="span" sx={{ color: "#2563eb" }}>Learn</Box>
                    </Typography>
                </Box>

                {/* Center Navigation Links (Desktop) */}
                <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 4 }}>
                    <Typography
                        onClick={() => scrollToSection('features')}
                        sx={{ color: "#475569", fontWeight: 600, fontSize: "14px", cursor: "pointer", "&:hover": { color: "#2563eb" }, transition: "color 0.2s" }}
                    >
                        Features
                    </Typography>
                    <Typography
                        onClick={() => scrollToSection('examinations')}
                        sx={{ color: "#475569", fontWeight: 600, fontSize: "14px", cursor: "pointer", "&:hover": { color: "#2563eb" }, transition: "color 0.2s" }}
                    >
                        Examinations
                    </Typography>
                    <Typography
                        onClick={() => scrollToSection('solutions')}
                        sx={{ color: "#475569", fontWeight: 600, fontSize: "14px", cursor: "pointer", "&:hover": { color: "#2563eb" }, transition: "color 0.2s" }}
                    >
                        Solutions
                    </Typography>
                    <Typography
                        onClick={() => scrollToSection('pricing')}
                        sx={{ color: "#475569", fontWeight: 600, fontSize: "14px", cursor: "pointer", "&:hover": { color: "#2563eb" }, transition: "color 0.2s" }}
                    >
                        Pricing
                    </Typography>
                </Box>

                {/* Right Action CTAs (Desktop) */}
                <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 2 }}>
                    <Typography
                        onClick={() => setSupportModalOpen(true)}
                        sx={{ color: "#475569", fontWeight: 600, fontSize: "14px", cursor: "pointer", mr: 1, "&:hover": { color: "#2563eb" }, transition: "color 0.2s" }}
                    >
                        Contact Support
                    </Typography>
                    <Button
                        onClick={() => router("/auth")}
                        sx={{
                            color: "#334155",
                            fontWeight: 600,
                            textTransform: "none",
                            fontSize: "14px",
                            px: 2,
                            "&:hover": { color: "#2563eb", backgroundColor: "rgba(37, 99, 235, 0.04)" }
                        }}
                    >
                        Register
                    </Button>
                    <Button
                        onClick={() => router("/auth")}
                        variant="contained"
                        sx={{
                            backgroundColor: "#2563eb",
                            color: "#ffffff",
                            "&:hover": { backgroundColor: "#1d4ed8", transform: "translateY(-1px)", boxShadow: "0 6px 20px rgba(37, 99, 235, 0.35)" },
                            fontWeight: 600,
                            textTransform: "none",
                            borderRadius: "10px",
                            px: 3,
                            py: 1,
                            fontSize: "14px",
                            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)",
                            transition: "all 0.2s"
                        }}
                    >
                        Login
                    </Button>
                </Box>

                {/* Mobile Drawer Trigger */}
                <IconButton
                    onClick={() => setMobileOpen(true)}
                    sx={{ display: { xs: "flex", md: "none" }, color: "#0f172a" }}
                >
                    <MenuIcon />
                </IconButton>
            </Box>

            {/* Mobile Drawer Navigation */}
            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                PaperProps={{ sx: { width: 300, p: 3 } }}
            >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                        Sync<Box component="span" sx={{ color: "#2563eb" }}>Learn</Box>
                    </Typography>
                    <IconButton onClick={() => setMobileOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <List>
                    <ListItem disablePadding sx={{ mb: 1.5 }}>
                        <ListItemButton onClick={() => { setMobileOpen(false); scrollToSection('features'); }}>
                            <ListItemText primary="Features" primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding sx={{ mb: 1.5 }}>
                        <ListItemButton onClick={() => { setMobileOpen(false); scrollToSection('examinations'); }}>
                            <ListItemText primary="Examinations" primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding sx={{ mb: 1.5 }}>
                        <ListItemButton onClick={() => { setMobileOpen(false); scrollToSection('solutions'); }}>
                            <ListItemText primary="Solutions" primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding sx={{ mb: 1.5 }}>
                        <ListItemButton onClick={() => { setMobileOpen(false); scrollToSection('pricing'); }}>
                            <ListItemText primary="Pricing" primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding sx={{ mb: 3 }}>
                        <ListItemButton onClick={() => { setMobileOpen(false); setSupportModalOpen(true); }}>
                            <ListItemText primary="Contact Support" primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItemButton>
                    </ListItem>
                    <Divider sx={{ mb: 3 }} />
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => { setMobileOpen(false); router('/auth'); }}
                        sx={{ mb: 1.5, py: 1.2, borderRadius: "10px", fontWeight: 600, textTransform: "none", borderColor: "#cbd5e1", color: "#334155" }}
                    >
                        Register
                    </Button>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => { setMobileOpen(false); router('/auth'); }}
                        sx={{ py: 1.2, borderRadius: "10px", fontWeight: 600, textTransform: "none", backgroundColor: "#2563eb" }}
                    >
                        Login
                    </Button>
                </List>
            </Drawer>

            {/* 2. Above-the-Fold Hero Section (Balanced 2-Column Grid) */}
            <Container maxWidth="xl" sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 8, md: 12 }, px: { xs: 3, md: 8 } }}>
                <Grid container spacing={{ xs: 6, lg: 8 }} alignItems="center">
                    
                    {/* Left Column: Pill, Headline, Subheadline & Action CTAs */}
                    <Grid item xs={12} lg={6}>
                        <Box sx={{ maxWidth: 620 }}>
                            {/* Pill Tag */}
                            <Chip
                                icon={<VerifiedIcon sx={{ fontSize: "16px !important", color: "#2563eb" }} />}
                                label="NEW: Interactive Proctoring & Examination Mode"
                                sx={{
                                    backgroundColor: "#eff6ff",
                                    color: "#2563eb",
                                    fontWeight: 700,
                                    fontSize: "0.82rem",
                                    py: 2,
                                    px: 1,
                                    borderRadius: "100px",
                                    border: "1px solid #dbeafe",
                                    mb: 3
                                }}
                            />

                            {/* Headline */}
                            <Typography
                                variant="h1"
                                sx={{
                                    fontWeight: 800,
                                    fontSize: { xs: "38px", sm: "48px", md: "56px" },
                                    lineHeight: 1.12,
                                    letterSpacing: "-1.2px",
                                    color: "#0f172a",
                                    mb: 2.5
                                }}
                            >
                                Connect with your team & classroom{" "}
                                <Box component="span" sx={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                    effortlessly.
                                </Box>
                            </Typography>

                            {/* Subheadline */}
                            <Typography
                                variant="body1"
                                sx={{
                                    color: "#475569",
                                    fontSize: { xs: "17px", md: "19px" },
                                    lineHeight: 1.6,
                                    mb: 4,
                                    fontWeight: 400
                                }}
                            >
                                High-quality video calls and interactive examinations anywhere, anytime with SyncLearn.
                            </Typography>

                            {/* Action Buttons */}
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 5 }}>
                                <Button
                                    onClick={() => router("/auth")}
                                    variant="contained"
                                    size="large"
                                    endIcon={<ArrowForwardIcon />}
                                    sx={{
                                        backgroundColor: "#2563eb",
                                        color: "#ffffff",
                                        "&:hover": { backgroundColor: "#1d4ed8", transform: "translateY(-1px)", boxShadow: "0 8px 24px rgba(37, 99, 235, 0.4)" },
                                        fontWeight: 700,
                                        fontSize: "16px",
                                        textTransform: "none",
                                        borderRadius: "12px",
                                        px: 4,
                                        py: 1.6,
                                        boxShadow: "0 8px 24px rgba(37, 99, 235, 0.3)",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    Get Started Free
                                </Button>
                                <Button
                                    onClick={() => setSupportModalOpen(true)}
                                    variant="outlined"
                                    size="large"
                                    startIcon={<PlayCircleIcon />}
                                    sx={{
                                        borderColor: "#cbd5e1",
                                        color: "#334155",
                                        "&:hover": { borderColor: "#2563eb", color: "#2563eb", backgroundColor: "rgba(37, 99, 235, 0.04)" },
                                        fontWeight: 600,
                                        fontSize: "16px",
                                        textTransform: "none",
                                        borderRadius: "12px",
                                        px: 3.5,
                                        py: 1.6,
                                        transition: "all 0.2s"
                                    }}
                                >
                                    Watch Demo
                                </Button>
                            </Stack>

                            {/* Quick Trust Checks */}
                            <Grid container spacing={2}>
                                <Grid item xs={6} sm={4}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <CheckCircleIcon sx={{ color: "#10b981", fontSize: 18 }} />
                                        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#334155" }}>
                                            Low-Latency WebRTC
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <CheckCircleIcon sx={{ color: "#10b981", fontSize: 18 }} />
                                        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#334155" }}>
                                            AI Proctoring
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <CheckCircleIcon sx={{ color: "#10b981", fontSize: 18 }} />
                                        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#334155" }}>
                                            Zero Downloads
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                        </Box>
                    </Grid>

                    {/* Right Column: Multi-Layered Dashboard UI Illustration / Mockup */}
                    <Grid item xs={12} lg={6}>
                        <Box
                            sx={{
                                position: "relative",
                                width: "100%",
                                maxWidth: 640,
                                mx: "auto",
                                borderRadius: "24px",
                                padding: "12px",
                                background: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 25px 60px -15px rgba(37, 99, 235, 0.18)"
                            }}
                        >
                            {/* Window Chrome Header Bar */}
                            <Box
                                sx={{
                                    backgroundColor: "#0f172a",
                                    borderRadius: "16px 16px 0 0",
                                    px: 2.5,
                                    py: 1.5,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between"
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ef4444" }} />
                                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#f59e0b" }} />
                                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#10b981" }} />
                                    <Typography sx={{ color: "#94a3b8", fontSize: "12px", fontWeight: 600, ml: 1.5 }}>
                                        SyncLearn Room: CS-101 Live Examination & Meeting
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <Chip label="HD Video" size="small" sx={{ backgroundColor: "rgba(37, 99, 235, 0.2)", color: "#60a5fa", fontWeight: 700, height: 20, fontSize: "0.68rem" }} />
                                    <Chip label="● LIVE EXAM ACTIVE" size="small" sx={{ backgroundColor: "#ef4444", color: "#fff", fontWeight: 700, height: 20, fontSize: "0.68rem" }} />
                                </Box>
                            </Box>

                            {/* Main Video Call & Dashboard Canvas */}
                            <Box
                                sx={{
                                    backgroundColor: "#1e293b",
                                    borderRadius: "0 0 16px 16px",
                                    p: 2.5,
                                    position: "relative",
                                    overflow: "hidden"
                                }}
                            >
                                {/* Active Speaker / Screen Share Main Grid */}
                                <Grid container spacing={2} sx={{ mb: 2.5 }}>
                                    {/* Main Instructor Screen View */}
                                    <Grid item xs={8}>
                                        <Box
                                            sx={{
                                                height: 190,
                                                borderRadius: "12px",
                                                background: "linear-gradient(135deg, #1e3a8a, #0f172a)",
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "space-between",
                                                p: 2,
                                                position: "relative",
                                                border: "2px solid #2563eb",
                                                boxShadow: "0 8px 20px rgba(37, 99, 235, 0.3)"
                                            }}
                                        >
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <Chip label="Presenter (Host)" size="small" sx={{ backgroundColor: "#2563eb", color: "#fff", fontWeight: 700, fontSize: "0.7rem" }} />
                                                <Box sx={{ display: "flex", gap: 1 }}>
                                                    <MicIcon sx={{ color: "#10b981", fontSize: 18 }} />
                                                    <VideocamIcon sx={{ color: "#10b981", fontSize: 18 }} />
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                <Avatar sx={{ width: 44, height: 44, bgcolor: "#2563eb", fontWeight: 700 }}>Prof. A</Avatar>
                                                <Box>
                                                    <Typography sx={{ color: "#ffffff", fontWeight: 700, fontSize: "14px" }}>
                                                        Prof. Alexander Wright
                                                    </Typography>
                                                    <Typography sx={{ color: "#94a3b8", fontSize: "11px" }}>
                                                        Presenting: AI Ethics & System Design
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    {/* Student Participant Video Tiles */}
                                    <Grid item xs={4}>
                                        <Stack spacing={1.5}>
                                            <Box sx={{ height: 88, borderRadius: "12px", backgroundColor: "#334155", p: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: "#10b981", fontSize: "12px", fontWeight: 700 }}>S1</Avatar>
                                                <Box sx={{ overflow: "hidden" }}>
                                                    <Typography sx={{ color: "#f8fafc", fontSize: "12px", fontWeight: 600, noWrap: true }}>Sarah M.</Typography>
                                                    <Typography sx={{ color: "#10b981", fontSize: "10px" }}>● Active Cam</Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ height: 88, borderRadius: "12px", backgroundColor: "#334155", p: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: "#f59e0b", fontSize: "12px", fontWeight: 700 }}>D2</Avatar>
                                                <Box sx={{ overflow: "hidden" }}>
                                                    <Typography sx={{ color: "#f8fafc", fontSize: "12px", fontWeight: 600, noWrap: true }}>David K.</Typography>
                                                    <Typography sx={{ color: "#f59e0b", fontSize: "10px" }}>Exam Active</Typography>
                                                </Box>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                </Grid>

                                {/* Floating Proctor & Live Quiz Alert Banner Card */}
                                <Paper
                                    elevation={4}
                                    sx={{
                                        backgroundColor: "#ffffff",
                                        borderRadius: "14px",
                                        p: 2,
                                        border: "1px solid #e2e8f0",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 2
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        <Box sx={{ width: 36, height: 36, borderRadius: "10px", backgroundColor: "rgba(37, 99, 235, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                                            <QuizIcon fontSize="small" />
                                        </Box>
                                        <Box>
                                            <Typography sx={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>
                                                AI Proctoring Active: 0 Violations Recorded
                                            </Typography>
                                            <Typography sx={{ fontSize: "11px", color: "#64748b" }}>
                                                48 Students Connected · Live Auto-Grading Enabled
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Chip label="PROCTORED" size="small" sx={{ backgroundColor: "#10b981", color: "#fff", fontWeight: 700, fontSize: "0.7rem" }} />
                                </Paper>
                            </Box>
                        </Box>
                    </Grid>

                </Grid>
            </Container>

            {/* 3. 3-Column Feature Grid Section */}
            <Container id="features" maxWidth="lg" sx={{ py: { xs: 10, md: 14 } }}>
                <Box sx={{ textAlign: "center", maxWidth: 700, mx: "auto", mb: 8 }}>
                    <Chip label="PLATFORM CAPABILITIES" size="small" sx={{ backgroundColor: "#eff6ff", color: "#2563eb", fontWeight: 700, mb: 2, fontSize: "0.75rem" }} />
                    <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: "28px", md: "40px" }, color: "#0f172a", letterSpacing: "-0.8px", mb: 2 }}>
                        Built for Modern Classrooms & High-Scale Teams
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#475569", fontSize: "17px", lineHeight: 1.6 }}>
                        SyncLearn provides a complete suite of tools to host interactive video calls, execute AI-proctored exams, and manage classrooms effortlessly.
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {/* Card 1: Seamless Video Calls */}
                    <Grid item xs={12} md={4}>
                        <Card 
                            elevation={0} 
                            sx={{ 
                                p: 4, 
                                height: "100%", 
                                borderRadius: "20px", 
                                border: "1px solid #e2e8f0", 
                                backgroundColor: "#ffffff", 
                                transition: "all 0.3s ease", 
                                "&:hover": { boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)", borderColor: "#2563eb", transform: "translateY(-4px)" } 
                            }}
                        >
                            <Box sx={{ width: 56, height: 56, borderRadius: "16px", backgroundColor: "rgba(37, 99, 235, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", mb: 3 }}>
                                <VideocamIcon sx={{ fontSize: 30 }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a", mb: 1.5, fontSize: "20px" }}>
                                Seamless Video Calls
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.7, fontSize: "15px" }}>
                                WebRTC low-latency HD video streaming, crystal-clear audio, dynamic screen sharing, and instant room creation without plugins.
                            </Typography>
                        </Card>
                    </Grid>

                    {/* Card 2: Interactive Examinations */}
                    <Grid item xs={12} md={4}>
                        <Card 
                            elevation={0} 
                            sx={{ 
                                p: 4, 
                                height: "100%", 
                                borderRadius: "20px", 
                                border: "1px solid #e2e8f0", 
                                backgroundColor: "#ffffff", 
                                transition: "all 0.3s ease", 
                                "&:hover": { boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)", borderColor: "#2563eb", transform: "translateY(-4px)" } 
                            }}
                        >
                            <Box sx={{ width: 56, height: 56, borderRadius: "16px", backgroundColor: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981", mb: 3 }}>
                                <AssessmentIcon sx={{ fontSize: 30 }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a", mb: 1.5, fontSize: "20px" }}>
                                Interactive Examinations
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.7, fontSize: "15px" }}>
                                Host live MCQ tests and coding challenges inside video calls with automated proctoring, tab tracking, and instant analytics.
                            </Typography>
                        </Card>
                    </Grid>

                    {/* Card 3: Classroom Management */}
                    <Grid item xs={12} md={4}>
                        <Card 
                            elevation={0} 
                            sx={{ 
                                p: 4, 
                                height: "100%", 
                                borderRadius: "20px", 
                                border: "1px solid #e2e8f0", 
                                backgroundColor: "#ffffff", 
                                transition: "all 0.3s ease", 
                                "&:hover": { boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)", borderColor: "#2563eb", transform: "translateY(-4px)" } 
                            }}
                        >
                            <Box sx={{ width: 56, height: 56, borderRadius: "16px", backgroundColor: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b", mb: 3 }}>
                                <SchoolIcon sx={{ fontSize: 30 }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a", mb: 1.5, fontSize: "20px" }}>
                                Classroom Management
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.7, fontSize: "15px" }}>
                                Role-based permissions (Student, Trainer, Admin), attendance tracking, gradebooks, and instant score PDF exports.
                            </Typography>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            {/* 4. Solutions / Examinations Highlight Showcase Section */}
            <Box id="examinations" sx={{ backgroundColor: "#ffffff", py: { xs: 10, md: 14 }, borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
                <Container id="solutions" maxWidth="lg">
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Chip label="PROCTORING & ASSESSMENT" size="small" sx={{ backgroundColor: "#eff6ff", color: "#2563eb", fontWeight: 700, mb: 2, fontSize: "0.75rem" }} />
                            <Typography variant="h3" sx={{ fontWeight: 800, color: "#0f172a", fontSize: { xs: "28px", md: "36px" }, mb: 2.5, letterSpacing: "-0.5px" }}>
                                Secure Online Examinations with Live Analytics
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#475569", fontSize: "16px", lineHeight: 1.7, mb: 4 }}>
                                Eliminate academic dishonesty during online evaluations. SyncLearn combines live video monitoring with browser tab lock detection and instant auto-grading.
                            </Typography>

                            <Stack spacing={2.5}>
                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: "10px", backgroundColor: "rgba(37, 99, 235, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", flexShrink: 0 }}>
                                        <CodeIcon fontSize="small" />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "16px" }}>MCQ & Coding Test Engines</Typography>
                                        <Typography sx={{ color: "#64748b", fontSize: "14px" }}>Support for multiple choice options and live code submission evaluation.</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: "10px", backgroundColor: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981", flexShrink: 0 }}>
                                        <LockIcon fontSize="small" />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "16px" }}>Browser Tab & Focus Lockdown</Typography>
                                        <Typography sx={{ color: "#64748b", fontSize: "14px" }}>Notifies hosts immediately if a student switches tabs or loses window focus.</Typography>
                                    </Box>
                                </Box>
                            </Stack>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: "24px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)" }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", mb: 3 }}>
                                    Live Examination Gradebook Preview
                                </Typography>
                                <Stack spacing={2}>
                                    <Box sx={{ p: 2, borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <Avatar sx={{ width: 36, height: 36, bgcolor: "#2563eb", fontWeight: 700 }}>A</Avatar>
                                            <Box>
                                                <Typography sx={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>Alex Johnson</Typography>
                                                <Typography sx={{ fontSize: "12px", color: "#64748b" }}>Submitted 10/10 MCQ · 0 Violations</Typography>
                                            </Box>
                                        </Box>
                                        <Chip label="100% Score" size="small" sx={{ backgroundColor: "#10b981", color: "#fff", fontWeight: 700 }} />
                                    </Box>

                                    <Box sx={{ p: 2, borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <Avatar sx={{ width: 36, height: 36, bgcolor: "#f59e0b", fontWeight: 700 }}>M</Avatar>
                                            <Box>
                                                <Typography sx={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>Maria Garcia</Typography>
                                                <Typography sx={{ fontSize: "12px", color: "#64748b" }}>Submitted 9/10 MCQ · 1 Tab Switch Alert</Typography>
                                            </Box>
                                        </Box>
                                        <Chip label="90% Score" size="small" sx={{ backgroundColor: "#2563eb", color: "#fff", fontWeight: 700 }} />
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* 5. Refined Assistance & Support Banner */}
            <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
                <Paper
                    elevation={0}
                    sx={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "24px",
                        p: { xs: 4, md: 5 },
                        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 4
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: "18px",
                                backgroundColor: "rgba(37, 99, 235, 0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#2563eb",
                                flexShrink: 0
                            }}
                        >
                            <SupportAgentIcon sx={{ fontSize: 36 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "22px", mb: 0.5 }}>
                                Need Assistance or Have Questions?
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#475569", fontSize: "15px" }}>
                                Our dedicated support team is available 24/7 to help. Reach out to us at{" "}
                                <Box
                                    component="span"
                                    onClick={() => setSupportModalOpen(true)}
                                    sx={{ color: "#2563eb", fontWeight: 700, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                                >
                                    synclearn.pvt@gmail.com
                                </Box>
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        onClick={() => setSupportModalOpen(true)}
                        variant="outlined"
                        startIcon={<EmailIcon />}
                        sx={{
                            borderColor: "#2563eb",
                            color: "#2563eb",
                            "&:hover": { backgroundColor: "rgba(37, 99, 235, 0.06)", borderColor: "#1d4ed8" },
                            fontWeight: 700,
                            textTransform: "none",
                            borderRadius: "12px",
                            px: 4,
                            py: 1.4,
                            fontSize: "15px",
                            whiteSpace: "nowrap"
                        }}
                    >
                        Contact Support
                    </Button>
                </Paper>
            </Container>

            {/* 6. Structured Multi-Column Footer */}
            <Box component="footer" sx={{ backgroundColor: "#0f172a", color: "#94a3b8", pt: 10, pb: 5 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={5} sx={{ mb: 8 }}>
                        {/* Column 1: Brand & Mission */}
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                                <Box sx={{ width: 36, height: 36, borderRadius: "8px", backgroundColor: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                                    <VideoCallIcon />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: "#ffffff", fontSize: "20px" }}>
                                    SyncLearn
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: "#94a3b8", lineHeight: 1.7, fontSize: "14px", mb: 3, maxWidth: 320 }}>
                                Empowering modern education with low-latency video meetings, AI-proctored examinations, and interactive classroom technology.
                            </Typography>
                        </Grid>

                        {/* Column 2: Product */}
                        <Grid item xs={6} md={2.5}>
                            <Typography variant="subtitle2" sx={{ color: "#ffffff", fontWeight: 700, mb: 2.5, fontSize: "15px" }}>
                                Product
                            </Typography>
                            <Stack spacing={1.5}>
                                <Typography onClick={() => router('/auth')} sx={{ cursor: "pointer", fontSize: "14px", "&:hover": { color: "#ffffff" } }}>Video Meetings</Typography>
                                <Typography onClick={() => router('/auth')} sx={{ cursor: "pointer", fontSize: "14px", "&:hover": { color: "#ffffff" } }}>Examination Hub</Typography>
                                <Typography onClick={() => router('/auth')} sx={{ cursor: "pointer", fontSize: "14px", "&:hover": { color: "#ffffff" } }}>Student Portal</Typography>
                                <Typography onClick={() => router('/admin-login')} sx={{ cursor: "pointer", fontSize: "14px", "&:hover": { color: "#ffffff" } }}>Admin Panel</Typography>
                            </Stack>
                        </Grid>

                        {/* Column 3: Resources */}
                        <Grid item xs={6} md={2.5}>
                            <Typography variant="subtitle2" sx={{ color: "#ffffff", fontWeight: 700, mb: 2.5, fontSize: "15px" }}>
                                Resources
                            </Typography>
                            <Stack spacing={1.5}>
                                <Typography component={Link} to="/about" sx={{ color: "#94a3b8", textDecoration: "none", fontSize: "14px", "&:hover": { color: "#ffffff" } }}>Documentation</Typography>
                                <Typography onClick={() => setSupportModalOpen(true)} sx={{ cursor: "pointer", fontSize: "14px", "&:hover": { color: "#ffffff" } }}>Contact Support</Typography>
                                <Typography component={Link} to="/terms" sx={{ color: "#94a3b8", textDecoration: "none", fontSize: "14px", "&:hover": { color: "#ffffff" } }}>Terms & Conditions</Typography>
                            </Stack>
                        </Grid>

                        {/* Column 4: Legal & Socials */}
                        <Grid item xs={12} md={3}>
                            <Typography variant="subtitle2" sx={{ color: "#ffffff", fontWeight: 700, mb: 2.5, fontSize: "15px" }}>
                                Legal & Contact
                            </Typography>
                            <Typography component={Link} to="/terms" sx={{ color: "#94a3b8", display: "block", mb: 1, textDecoration: "none", fontSize: "14px", "&:hover": { color: "#ffffff" } }}>
                                Privacy Policy & Terms
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "14px", mt: 2, mb: 0.5 }}>
                                Official Support Email:
                            </Typography>
                            <Typography
                                onClick={() => setSupportModalOpen(true)}
                                sx={{ color: "#38bdf8", fontWeight: 600, fontSize: "14px", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                            >
                                synclearn.pvt@gmail.com
                            </Typography>
                        </Grid>
                    </Grid>

                    <Divider sx={{ borderColor: "#1e293b", mb: 4 }} />

                    {/* Bottom Bar */}
                    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                        <Typography variant="body2" sx={{ color: "#64748b", fontSize: "14px" }}>
                            © 2026 SyncLearn. All rights reserved.
                        </Typography>
                        <Box sx={{ display: "flex", gap: 3 }}>
                            <Typography component={Link} to="/terms" sx={{ color: "#64748b", fontSize: "14px", textDecoration: "none", "&:hover": { color: "#ffffff" } }}>Terms</Typography>
                            <Typography component={Link} to="/about" sx={{ color: "#64748b", fontSize: "14px", textDecoration: "none", "&:hover": { color: "#ffffff" } }}>Privacy</Typography>
                            <Typography onClick={() => setSupportModalOpen(true)} sx={{ color: "#64748b", fontSize: "14px", cursor: "pointer", "&:hover": { color: "#ffffff" } }}>Support</Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* In-App Nodemailer Support Ticket Modal */}
            <ContactSupportModal open={supportModalOpen} onClose={() => setSupportModalOpen(false)} />
        </Box>
    );
}