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
  Divider
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
                <Chip label="NEW" size="small" sx={{ backgroundColor: "rgba(255, 255, 255, 0.2)", color: "#fff", fontWeight: 700, height: 20, fontSize: "0.7rem" }} />
                <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                    SyncLearn 2.0 is Live — Integrated AI-Proctored Examinations & HD Live Meetings!
                </Typography>
                <Box
                    component="span"
                    onClick={() => router('/auth')}
                    sx={{ textDecoration: "underline", cursor: "pointer", fontWeight: 700, ml: 0.5, "&:hover": { opacity: 0.9 } }}
                >
                    Try It Now →
                </Box>
            </Box>

            {/* 1. Sticky, Translucent Header & Navigation */}
            <Box
                component="nav"
                sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1100,
                    backgroundColor: "rgba(255, 255, 255, 0.85)",
                    backdropFilter: "blur(12px)",
                    borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
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
                            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)"
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
                        onClick={() => scrollToSection('pricing')}
                        sx={{ color: "#475569", fontWeight: 600, fontSize: "14px", cursor: "pointer", "&:hover": { color: "#2563eb" }, transition: "color 0.2s" }}
                    >
                        Pricing
                    </Typography>
                    <Typography
                        component={Link}
                        to="/about"
                        sx={{ color: "#475569", fontWeight: 600, fontSize: "14px", textDecoration: "none", "&:hover": { color: "#2563eb" }, transition: "color 0.2s" }}
                    >
                        About
                    </Typography>
                    <Typography
                        onClick={() => setSupportModalOpen(true)}
                        sx={{ color: "#475569", fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 0.5, "&:hover": { color: "#2563eb" }, transition: "color 0.2s" }}
                    >
                        Support
                    </Typography>
                </Box>

                {/* Right Action CTAs (Desktop) */}
                <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 2 }}>
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
                            "&:hover": { backgroundColor: "#1d4ed8" },
                            fontWeight: 600,
                            textTransform: "none",
                            borderRadius: "10px",
                            px: 3,
                            py: 1,
                            fontSize: "14px",
                            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)"
                        }}
                    >
                        Log In
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
                        <ListItemButton onClick={() => { setMobileOpen(false); scrollToSection('pricing'); }}>
                            <ListItemText primary="Pricing" primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding sx={{ mb: 1.5 }}>
                        <ListItemButton onClick={() => { setMobileOpen(false); router('/about'); }}>
                            <ListItemText primary="About" primaryTypographyProps={{ fontWeight: 600 }} />
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
                        Log In
                    </Button>
                </List>
            </Drawer>

            {/* 2. Hero Section */}
            <Container maxWidth="xl" sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 8, md: 12 }, px: { xs: 3, md: 8 } }}>
                <Grid container spacing={{ xs: 6, lg: 8 }} alignItems="center">
                    
                    {/* Left Column: Headline, Subtext & Action Buttons */}
                    <Grid item xs={12} lg={6}>
                        <Box sx={{ maxWidth: 620 }}>
                            {/* Pill Badge */}
                            <Chip
                                icon={<VerifiedIcon sx={{ fontSize: "16px !important", color: "#2563eb" }} />}
                                label="The All-In-One Classroom & Meeting Platform"
                                sx={{
                                    backgroundColor: "rgba(37, 99, 235, 0.08)",
                                    color: "#2563eb",
                                    fontWeight: 700,
                                    fontSize: "0.82rem",
                                    py: 2,
                                    px: 1,
                                    borderRadius: "100px",
                                    border: "1px solid rgba(37, 99, 235, 0.15)",
                                    mb: 3
                                }}
                            />

                            {/* Main Headline */}
                            <Typography
                                variant="h1"
                                sx={{
                                    fontWeight: 800,
                                    fontSize: { xs: "36px", sm: "48px", md: "56px" },
                                    lineHeight: 1.12,
                                    letterSpacing: "-1.2px",
                                    color: "#0f172a",
                                    mb: 2.5
                                }}
                            >
                                <Box component="span" sx={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                    Connect
                                </Box>{" "}
                                with your team & classroom
                            </Typography>

                            {/* Subheadline */}
                            <Typography
                                variant="body1"
                                sx={{
                                    color: "#475569",
                                    fontSize: { xs: "16px", md: "19px" },
                                    lineHeight: 1.6,
                                    mb: 4,
                                    fontWeight: 400
                                }}
                            >
                                Experience high-fidelity HD video meetings, AI-proctored online examinations, and real-time interactive quizzes — all unified inside SyncLearn.
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
                                        "&:hover": { backgroundColor: "#1d4ed8", transform: "translateY(-1px)" },
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
                                    Get Started Now
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
                                    Book a Demo
                                </Button>
                            </Stack>

                            {/* Key Value Checklist */}
                            <Grid container spacing={2}>
                                <Grid item xs={6} sm={4}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <CheckCircleIcon sx={{ color: "#10b981", fontSize: 18 }} />
                                        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#334155" }}>
                                            No Download Req.
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <CheckCircleIcon sx={{ color: "#10b981", fontSize: 18 }} />
                                        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#334155" }}>
                                            E2E Encrypted
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <CheckCircleIcon sx={{ color: "#10b981", fontSize: 18 }} />
                                        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#334155" }}>
                                            AI Proctor Ready
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                        </Box>
                    </Grid>

                    {/* Right Column: High-Fidelity App Mockup Frame */}
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
                                <Chip label="● LIVE" size="small" sx={{ backgroundColor: "#ef4444", color: "#fff", fontWeight: 700, height: 20, fontSize: "0.68rem" }} />
                            </Box>

                            {/* Main Video Call & Quiz Interface Canvas */}
                            <Box
                                sx={{
                                    backgroundColor: "#1e293b",
                                    borderRadius: "0 0 16px 16px",
                                    p: 2.5,
                                    position: "relative",
                                    overflow: "hidden"
                                }}
                            >
                                {/* Video Tiles Grid Mockup */}
                                <Grid container spacing={2} sx={{ mb: 2.5 }}>
                                    {/* Main Instructor Video Tile */}
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
                                                <Chip label="Instructor (Host)" size="small" sx={{ backgroundColor: "#2563eb", color: "#fff", fontWeight: 700, fontSize: "0.7rem" }} />
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
                                                        Speaking... (Computer Science Dept)
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    {/* Student Participant Tiles */}
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

                                {/* Live Quiz Overlay Alert Floating Card */}
                                <Paper
                                    elevation={4}
                                    sx={{
                                        backgroundColor: "rgba(255, 255, 255, 0.98)",
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
                                                Live Quiz Question #3 Broadcasted
                                            </Typography>
                                            <Typography sx={{ fontSize: "11px", color: "#64748b" }}>
                                                42 Students Responded · 00:45 remaining
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Button size="small" variant="contained" sx={{ backgroundColor: "#10b981", textTransform: "none", fontWeight: 700, fontSize: "11px", borderRadius: "6px" }}>
                                        Submit Answer
                                    </Button>
                                </Paper>
                            </Box>
                        </Box>
                    </Grid>

                </Grid>
            </Container>

            {/* 3. Social Proof & Trust Metrics Section */}
            <Box sx={{ backgroundColor: "#ffffff", py: { xs: 6, md: 8 }, borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
                <Container maxWidth="lg">
                    <Typography variant="subtitle2" sx={{ textAlign: "center", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, fontSize: "12px", mb: 5 }}>
                        TRUSTED BY OVER 10,000+ STUDENTS, EDUCATORS, AND INSTITUTIONS WORLDWIDE
                    </Typography>

                    <Grid container spacing={4} justifyContent="center">
                        <Grid item xs={6} sm={3} sx={{ textAlign: "center" }}>
                            <Typography variant="h3" sx={{ fontWeight: 800, color: "#2563eb", mb: 0.5, fontSize: { xs: "28px", md: "38px" } }}>
                                50,000+
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#475569", fontWeight: 600 }}>
                                Daily Active Meetings
                            </Typography>
                        </Grid>

                        <Grid item xs={6} sm={3} sx={{ textAlign: "center" }}>
                            <Typography variant="h3" sx={{ fontWeight: 800, color: "#2563eb", mb: 0.5, fontSize: { xs: "28px", md: "38px" } }}>
                                10,000+
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#475569", fontWeight: 600 }}>
                                Examinations Conducted
                            </Typography>
                        </Grid>

                        <Grid item xs={6} sm={3} sx={{ textAlign: "center" }}>
                            <Typography variant="h3" sx={{ fontWeight: 800, color: "#2563eb", mb: 0.5, fontSize: { xs: "28px", md: "38px" } }}>
                                99.9%
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#475569", fontWeight: 600 }}>
                                Guaranteed Uptime
                            </Typography>
                        </Grid>

                        <Grid item xs={6} sm={3} sx={{ textAlign: "center" }}>
                            <Typography variant="h3" sx={{ fontWeight: 800, color: "#2563eb", mb: 0.5, fontSize: { xs: "28px", md: "38px" } }}>
                                4.9 / 5 ★
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#475569", fontWeight: 600 }}>
                                Educator Rating
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* 4. Features Section */}
            <Container id="features" maxWidth="lg" sx={{ py: { xs: 10, md: 14 } }}>
                <Box sx={{ textAlign: "center", maxWidth: 700, mx: "auto", mb: 8 }}>
                    <Chip label="CORE PLATFORM CAPABILITIES" size="small" sx={{ backgroundColor: "rgba(37, 99, 235, 0.1)", color: "#2563eb", fontWeight: 700, mb: 2, fontSize: "0.75rem" }} />
                    <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: "28px", md: "40px" }, color: "#0f172a", letterSpacing: "-0.8px", mb: 2 }}>
                        Everything You Need for Seamless Online Learning
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#475569", fontSize: "17px", lineHeight: 1.6 }}>
                        SyncLearn unifies low-latency video meetings with an AI-proctored examination engine designed specifically for modern education.
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {/* Feature 1 */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={0} sx={{ p: 4, height: "100%", borderRadius: "20px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", transition: "all 0.3s ease", "&:hover": { boxShadow: "0 12px 30px rgba(0,0,0,0.06)", borderColor: "#2563eb" } }}>
                            <Box sx={{ width: 52, height: 52, borderRadius: "14px", backgroundColor: "rgba(37, 99, 235, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", mb: 3 }}>
                                <VideocamIcon sx={{ fontSize: 28 }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a", mb: 1.5, fontSize: "20px" }}>
                                Low-Latency HD Video & Audio
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6, fontSize: "15px" }}>
                                WebRTC-powered crystal-clear video streaming with automated bandwidth optimization, dynamic mic/camera toggles, and screen sharing.
                            </Typography>
                        </Card>
                    </Grid>

                    {/* Feature 2 */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={0} sx={{ p: 4, height: "100%", borderRadius: "20px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", transition: "all 0.3s ease", "&:hover": { boxShadow: "0 12px 30px rgba(0,0,0,0.06)", borderColor: "#2563eb" } }}>
                            <Box sx={{ width: 52, height: 52, borderRadius: "14px", backgroundColor: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981", mb: 3 }}>
                                <AssessmentIcon sx={{ fontSize: 28 }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a", mb: 1.5, fontSize: "20px" }}>
                                AI-Proctored Examination Hub
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6, fontSize: "15px" }}>
                                Conduct secure online tests with automated grading, tab-switch detection, browser lockdown, and instant score breakdown export.
                            </Typography>
                        </Card>
                    </Grid>

                    {/* Feature 3 */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={0} sx={{ p: 4, height: "100%", borderRadius: "20px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", transition: "all 0.3s ease", "&:hover": { boxShadow: "0 12px 30px rgba(0,0,0,0.06)", borderColor: "#2563eb" } }}>
                            <Box sx={{ width: 52, height: 52, borderRadius: "14px", backgroundColor: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b", mb: 3 }}>
                                <QuizIcon sx={{ fontSize: 28 }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a", mb: 1.5, fontSize: "20px" }}>
                                In-Call Live Classroom Quizzes
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6, fontSize: "15px" }}>
                                Broadcast multiple-choice questions or coding challenges live inside video meetings with instant student leaderboard results.
                            </Typography>
                        </Card>
                    </Grid>

                    {/* Feature 4 */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={0} sx={{ p: 4, height: "100%", borderRadius: "20px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", transition: "all 0.3s ease", "&:hover": { boxShadow: "0 12px 30px rgba(0,0,0,0.06)", borderColor: "#2563eb" } }}>
                            <Box sx={{ width: 52, height: 52, borderRadius: "14px", backgroundColor: "rgba(139, 92, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b5cf6", mb: 3 }}>
                                <SecurityIcon sx={{ fontSize: 28 }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a", mb: 1.5, fontSize: "20px" }}>
                                Bank-Grade Role Security
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6, fontSize: "15px" }}>
                                Role-based access controls for Students, Trainers, and System Administrators with media permission toggles and detailed audit logs.
                            </Typography>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            {/* 5. Pricing Section */}
            <Box id="pricing" sx={{ backgroundColor: "#ffffff", py: { xs: 10, md: 14 }, borderTop: "1px solid #e2e8f0" }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: "center", maxWidth: 650, mx: "auto", mb: 8 }}>
                        <Chip label="TRANSPARENT PRICING" size="small" sx={{ backgroundColor: "rgba(37, 99, 235, 0.1)", color: "#2563eb", fontWeight: 700, mb: 2, fontSize: "0.75rem" }} />
                        <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: "28px", md: "40px" }, color: "#0f172a", letterSpacing: "-0.8px", mb: 2 }}>
                            Choose the Plan Built for Your Scale
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#475569", fontSize: "16px" }}>
                            Start free today or upgrade to unlock unlimited video meeting rooms and advanced proctoring.
                        </Typography>
                    </Box>

                    <Grid container spacing={4} alignItems="stretch">
                        {/* Free Tier */}
                        <Grid item xs={12} md={4}>
                            <Card elevation={0} sx={{ p: 4, height: "100%", borderRadius: "20px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}>Free Starter</Typography>
                                    <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>Perfect for small study groups and trial calls.</Typography>
                                    <Typography variant="h3" sx={{ fontWeight: 800, color: "#0f172a", mb: 3 }}>$0 <Typography component="span" sx={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>/ forever</Typography></Typography>
                                    <Divider sx={{ mb: 3 }} />
                                    <Stack spacing={1.5} sx={{ mb: 4 }}>
                                        <Typography sx={{ fontSize: "14px", color: "#334155", display: "flex", alignItems: "center", gap: 1 }}><CheckCircleIcon sx={{ fontSize: 18, color: "#10b981" }} /> Up to 50 Participants / Meeting</Typography>
                                        <Typography sx={{ fontSize: "14px", color: "#334155", display: "flex", alignItems: "center", gap: 1 }}><CheckCircleIcon sx={{ fontSize: 18, color: "#10b981" }} /> 45-Minute Meeting Limit</Typography>
                                        <Typography sx={{ fontSize: "14px", color: "#334155", display: "flex", alignItems: "center", gap: 1 }}><CheckCircleIcon sx={{ fontSize: 18, color: "#10b981" }} /> Basic Quiz Engine Access</Typography>
                                    </Stack>
                                </Box>
                                <Button fullWidth variant="outlined" onClick={() => router('/auth')} sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px", py: 1.2, borderColor: "#cbd5e1", color: "#0f172a" }}>
                                    Get Started Free
                                </Button>
                            </Card>
                        </Grid>

                        {/* Pro Classroom Tier (Highlighted) */}
                        <Grid item xs={12} md={4}>
                            <Card elevation={0} sx={{ p: 4, height: "100%", borderRadius: "20px", border: "2px solid #2563eb", backgroundColor: "#ffffff", boxShadow: "0 12px 36px rgba(37, 99, 235, 0.15)", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
                                <Chip label="MOST POPULAR" size="small" sx={{ position: "absolute", top: 16, right: 16, backgroundColor: "#2563eb", color: "#fff", fontWeight: 700, fontSize: "0.7rem" }} />
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}>Pro Classroom</Typography>
                                    <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>Ideal for schools, tutors, and course trainers.</Typography>
                                    <Typography variant="h3" sx={{ fontWeight: 800, color: "#2563eb", mb: 3 }}>$29 <Typography component="span" sx={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>/ month</Typography></Typography>
                                    <Divider sx={{ mb: 3 }} />
                                    <Stack spacing={1.5} sx={{ mb: 4 }}>
                                        <Typography sx={{ fontSize: "14px", color: "#334155", display: "flex", alignItems: "center", gap: 1 }}><CheckCircleIcon sx={{ fontSize: 18, color: "#2563eb" }} /> Unlimited Meeting Duration</Typography>
                                        <Typography sx={{ fontSize: "14px", color: "#334155", display: "flex", alignItems: "center", gap: 1 }}><CheckCircleIcon sx={{ fontSize: 18, color: "#2563eb" }} /> Up to 250 Participants / Room</Typography>
                                        <Typography sx={{ fontSize: "14px", color: "#334155", display: "flex", alignItems: "center", gap: 1 }}><CheckCircleIcon sx={{ fontSize: 18, color: "#2563eb" }} /> Full MCQ & Coding Test Engine</Typography>
                                        <Typography sx={{ fontSize: "14px", color: "#334155", display: "flex", alignItems: "center", gap: 1 }}><CheckCircleIcon sx={{ fontSize: 18, color: "#2563eb" }} /> AI Proctoring & Tab Monitor</Typography>
                                    </Stack>
                                </Box>
                                <Button fullWidth variant="contained" onClick={() => router('/auth')} sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px", py: 1.2, backgroundColor: "#2563eb" }}>
                                    Start 14-Day Free Trial
                                </Button>
                            </Card>
                        </Grid>

                        {/* Enterprise Tier */}
                        <Grid item xs={12} md={4}>
                            <Card elevation={0} sx={{ p: 4, height: "100%", borderRadius: "20px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}>Enterprise Academy</Typography>
                                    <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>Custom security & dedicated infrastructure for universities.</Typography>
                                    <Typography variant="h3" sx={{ fontWeight: 800, color: "#0f172a", mb: 3 }}>Custom</Typography>
                                    <Divider sx={{ mb: 3 }} />
                                    <Stack spacing={1.5} sx={{ mb: 4 }}>
                                        <Typography sx={{ fontSize: "14px", color: "#334155", display: "flex", alignItems: "center", gap: 1 }}><CheckCircleIcon sx={{ fontSize: 18, color: "#10b981" }} /> Dedicated WebRTC Server Node</Typography>
                                        <Typography sx={{ fontSize: "14px", color: "#334155", display: "flex", alignItems: "center", gap: 1 }}><CheckCircleIcon sx={{ fontSize: 18, color: "#10b981" }} /> Custom LMS Integration</Typography>
                                        <Typography sx={{ fontSize: "14px", color: "#334155", display: "flex", alignItems: "center", gap: 1 }}><CheckCircleIcon sx={{ fontSize: 18, color: "#10b981" }} /> 24/7 Priority Support SLA</Typography>
                                    </Stack>
                                </Box>
                                <Button fullWidth variant="outlined" onClick={() => setSupportModalOpen(true)} sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px", py: 1.2, borderColor: "#cbd5e1", color: "#0f172a" }}>
                                    Contact Sales
                                </Button>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* 6. Support & Trust Card Section */}
            <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
                <Paper
                    elevation={0}
                    sx={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "24px",
                        p: { xs: 4, md: 5 },
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
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
                                Our dedicated support team is available 24/7 to assist educators and students. Reach out directly at{" "}
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
                        variant="contained"
                        startIcon={<EmailIcon />}
                        sx={{
                            backgroundColor: "#2563eb",
                            color: "#ffffff",
                            "&:hover": { backgroundColor: "#1d4ed8" },
                            fontWeight: 700,
                            textTransform: "none",
                            borderRadius: "12px",
                            px: 4,
                            py: 1.5,
                            fontSize: "15px",
                            whiteSpace: "nowrap",
                            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)"
                        }}
                    >
                        Contact Support
                    </Button>
                </Paper>
            </Container>

            {/* 7. Multi-Column Structured Footer */}
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
                                Empowering modern education with HD video meetings, AI-proctored live examinations, and interactive classroom technology.
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

                        {/* Column 3: Resources & Support */}
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

                        {/* Column 4: Legal & Contact */}
                        <Grid item xs={12} md={3}>
                            <Typography variant="subtitle2" sx={{ color: "#ffffff", fontWeight: 700, mb: 2.5, fontSize: "15px" }}>
                                Contact Us
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "14px", mb: 1.5 }}>
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
                            © {new Date().getFullYear()} SyncLearn Inc. All rights reserved.
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