import React from "react";
import mobileImg from "../assets/img.png";
import { Link, useNavigate } from "react-router-dom";
import VideoCallIcon from '@mui/icons-material/VideoCall';
import { Box, Typography, Button, Container } from '@mui/material';

export default function LandingPage() {
    const router = useNavigate();

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f8f9fa", display: "flex", flexDirection: "column" }}>
            {/* Navigation Header Bar */}
            <Box
                component="nav"
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }} onClick={() => router("/")}>
                    <VideoCallIcon sx={{ fontSize: 32, color: "#0e71eb" }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#101828", fontSize: "20px", letterSpacing: "-0.4px" }}>
                        SyncLearn
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Typography
                        onClick={() => router("/guest-call")}
                        sx={{ color: "#344054", fontWeight: 500, fontSize: "14px", cursor: "pointer", "&:hover": { color: "#0e71eb" } }}
                    >
                        Join as Guest
                    </Typography>
                    <Typography
                        onClick={() => router("/auth")}
                        sx={{ color: "#344054", fontWeight: 500, fontSize: "14px", cursor: "pointer", "&:hover": { color: "#0e71eb" } }}
                    >
                        Register
                    </Typography>
                    <Button
                        onClick={() => router("/auth")}
                        variant="contained"
                        sx={{
                            backgroundColor: "#0e71eb",
                            color: "#ffffff",
                            "&:hover": { backgroundColor: "#0b5ed7" },
                            fontWeight: 600,
                            textTransform: "none",
                            borderRadius: "8px",
                            px: 3,
                            py: 0.9,
                            fontSize: "14px"
                        }}
                    >
                        Login
                    </Button>
                </Box>
            </Box>

            {/* Main Hero Container */}
            <Container maxWidth="lg" sx={{ flex: 1, display: "flex", alignItems: "center", py: 8 }}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        width: "100%"
                    }}
                >
                    {/* Left Copy */}
                    <Box sx={{ flex: 1, maxWidth: 580 }}>
                        <Typography
                            variant="h1"
                            sx={{
                                fontWeight: 800,
                                fontSize: { xs: "32px", md: "42px" },
                                color: "#101828",
                                lineHeight: 1.2,
                                mb: 2.5,
                                letterSpacing: "-0.5px"
                            }}
                        >
                            <Box component="span" sx={{ color: "#0e71eb" }}>Connect </Box>
                            with your team & classroom
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: "#475569",
                                fontSize: "18px",
                                mb: 4,
                                lineHeight: 1.6
                            }}
                        >
                            High quality video calls and interactive examinations anywhere, anytime with SyncLearn.
                        </Typography>

                        <Button
                            component={Link}
                            to="/auth"
                            variant="contained"
                            size="large"
                            sx={{
                                backgroundColor: "#0e71eb",
                                color: "#ffffff",
                                "&:hover": { backgroundColor: "#0b5ed7" },
                                fontWeight: 600,
                                fontSize: "15px",
                                textTransform: "none",
                                borderRadius: "8px",
                                px: 3.5,
                                py: 1.5,
                                boxShadow: "0 4px 14px rgba(14, 113, 235, 0.25)"
                            }}
                        >
                            Get Started Now
                        </Button>
                    </Box>

                    {/* Right Media Banner Card Frame */}
                    <Box
                        sx={{
                            flex: 1,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                    >
                        <Box
                            sx={{
                                backgroundColor: "#ffffff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "16px",
                                padding: "16px",
                                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                width: "100%",
                                maxWidth: 480
                            }}
                        >
                            <Box
                                component="img"
                                src={mobileImg}
                                alt="SyncLearn Media View"
                                sx={{
                                    maxWidth: "100%",
                                    maxHeight: 380,
                                    height: "auto",
                                    objectFit: "contain",
                                    borderRadius: "12px"
                                }}
                            />
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}