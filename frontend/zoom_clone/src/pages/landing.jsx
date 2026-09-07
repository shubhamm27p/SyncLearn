import React, { useState } from "react";
import mobileImg from "../assets/img.png";
import { Link, useNavigate } from "react-router-dom";
import VideoCallIcon from '@mui/icons-material/VideoCall';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import EmailIcon from '@mui/icons-material/Email';
import { Box, Typography, Button, Container } from '@mui/material';
import ContactSupportModal from "../components/ContactSupportModal";

export default function LandingPage() {
    const router = useNavigate();
    const [supportModalOpen, setSupportModalOpen] = useState(false);

    return (
        <Box sx={{ height: "100vh", maxHeight: "100vh", backgroundColor: "#f8f9fa", display: "flex", flexDirection: "column", overflow: { xs: "auto", md: "hidden" } }}>
            {/* Navigation Header Bar */}
            <Box
                component="nav"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: { xs: 3, md: 6 },
                    py: 1.5,
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

                <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                    <Typography
                        onClick={() => setSupportModalOpen(true)}
                        sx={{
                            color: "#344054",
                            fontWeight: 500,
                            fontSize: "14px",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: 0.6,
                            cursor: "pointer",
                            "&:hover": { color: "#0e71eb" }
                        }}
                    >
                        <SupportAgentIcon sx={{ fontSize: 18, color: "#0e71eb" }} /> Contact Support
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
                            py: 0.8,
                            fontSize: "14px"
                        }}
                    >
                        Login
                    </Button>
                </Box>
            </Box>

            {/* Main Hero Container */}
            <Container maxWidth="lg" sx={{ flex: 1, display: "flex", alignItems: "center", py: { xs: 2, md: 1.5 } }}>
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
                    {/* Left Copy */}
                    <Box sx={{ flex: 1, maxWidth: 580 }}>
                        <Typography
                            variant="h1"
                            sx={{
                                fontWeight: 800,
                                fontSize: { xs: "28px", md: "36px" },
                                color: "#101828",
                                lineHeight: 1.2,
                                mb: 1.5,
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
                                fontSize: "16px",
                                mb: 3,
                                lineHeight: 1.5
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
                                fontSize: "14px",
                                textTransform: "none",
                                borderRadius: "8px",
                                px: 3.5,
                                py: 1.2,
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
                                padding: "12px",
                                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                width: "100%",
                                maxWidth: 440
                            }}
                        >
                            <Box
                                component="img"
                                src={mobileImg}
                                alt="SyncLearn Media View"
                                sx={{
                                    maxWidth: "100%",
                                    maxHeight: { xs: 200, md: 240 },
                                    height: "auto",
                                    objectFit: "contain",
                                    borderRadius: "12px"
                                }}
                            />
                        </Box>
                    </Box>
                </Box>
            </Container>

            {/* Contact Support Banner Card */}
            <Container maxWidth="lg" sx={{ pb: { xs: 2, md: 1.5 } }}>
                <Box
                    sx={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #eaecf0",
                        borderRadius: "16px",
                        p: { xs: 2, md: 2.5 },
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)"
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: "12px",
                                backgroundColor: "rgba(14, 113, 235, 0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#0e71eb",
                                flexShrink: 0
                            }}
                        >
                            <SupportAgentIcon sx={{ fontSize: 26 }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: "#101828", fontSize: "16px", mb: 0.2 }}>
                                Need Assistance or Have Questions?
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#667085", fontSize: "13px" }}>
                                Our dedicated support team is available to help. Reach out to us at{" "}
                                <Box component="span" onClick={() => setSupportModalOpen(true)} sx={{ color: "#0e71eb", fontWeight: 600, cursor: "pointer", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
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
                            borderColor: "#0e71eb",
                            color: "#0e71eb",
                            "&:hover": {
                                borderColor: "#0b5ed7",
                                backgroundColor: "rgba(14, 113, 235, 0.06)"
                            },
                            fontWeight: 600,
                            textTransform: "none",
                            borderRadius: "8px",
                            px: 2.5,
                            py: 1,
                            fontSize: "13px",
                            whiteSpace: "nowrap"
                        }}
                    >
                        Contact Support
                    </Button>
                </Box>
            </Container>

            {/* Footer Bar */}
            <Box
                component="footer"
                sx={{
                    backgroundColor: "#ffffff",
                    borderTop: "1px solid #eaecf0",
                    py: 1.8,
                    px: { xs: 3, md: 6 },
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                    mt: "auto"
                }}
            >
                <Typography variant="body2" sx={{ color: "#667085", fontSize: "13px" }}>
                    © {new Date().getFullYear()} SyncLearn. All rights reserved.
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 2.5 }, flexWrap: "wrap" }}>
                    <Typography component={Link} to="/about" sx={{ color: "#667085", fontSize: "13px", textDecoration: "none", "&:hover": { color: "#0e71eb", textDecoration: "underline" } }}>
                        About SyncLearn
                    </Typography>
                    <Typography component={Link} to="/terms" sx={{ color: "#667085", fontSize: "13px", textDecoration: "none", "&:hover": { color: "#0e71eb", textDecoration: "underline" } }}>
                        Terms & Conditions
                    </Typography>
                    <Typography onClick={() => setSupportModalOpen(true)} sx={{ color: "#667085", fontSize: "13px", cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center", gap: 0.5, "&:hover": { color: "#0e71eb", textDecoration: "underline" } }}>
                        <EmailIcon sx={{ fontSize: 15 }} /> Support
                    </Typography>
                </Box>
            </Box>

            <ContactSupportModal open={supportModalOpen} onClose={() => setSupportModalOpen(false)} />
        </Box>
    );
}