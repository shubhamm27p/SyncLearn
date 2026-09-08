import React from "react";
import { Link, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import { Box, Button, Container, Divider, Typography } from "@mui/material";

const features = [
    {
        title: "Video collaboration",
        description: "Create or join focused video meetings for classes, teams, and study groups."
    },
    {
        title: "Interactive assessments",
        description: "Deliver MCQ and coding tests, manage questions, and review results in one place."
    },
    {
        title: "Progress and history",
        description: "Keep assessment results and meeting activity organized so learners and administrators can follow progress."
    },
    {
        title: "Role-based workspaces",
        description: "Students, instructors, and administrators get workflows designed for their responsibilities."
    }
];

export default function ApplicationDetails() {
    const navigate = useNavigate();

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f8f9fa", color: "#101828" }}>
            <Box component="header" sx={{ backgroundColor: "#ffffff", borderBottom: "1px solid #eaecf0" }}>
                <Container maxWidth="lg" sx={{ py: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box onClick={() => navigate("/")} sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }}>
                        <VideoCallIcon sx={{ fontSize: 32, color: "#0e71eb" }} />
                        <Typography sx={{ fontWeight: 700, fontSize: 20 }}>SyncLearn</Typography>
                    </Box>
                    <Button component={Link} to="/auth" variant="contained" sx={{ backgroundColor: "#0e71eb", textTransform: "none", borderRadius: "8px", fontWeight: 600 }}>
                        Get started
                    </Button>
                </Container>
            </Box>

            <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
                <Button component={Link} to="/" startIcon={<ArrowBackIcon />} sx={{ color: "#475467", textTransform: "none", mb: 4 }}>
                    Back to home
                </Button>
                <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 48 }, fontWeight: 800, lineHeight: 1.15, mb: 2, color: "#101828 !important" }}>
                    One workspace for learning and connection
                </Typography>
                <Typography sx={{ color: "#475467", fontSize: 18, lineHeight: 1.7, mb: 5 }}>
                    SyncLearn combines reliable video communication with practical assessment tools. It helps educators and teams meet, teach, test, and review progress without switching between disconnected tools.
                </Typography>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                    {features.map((feature) => (
                        <Box key={feature.title} sx={{ backgroundColor: "#ffffff", border: "1px solid #eaecf0", borderRadius: "12px", p: 3 }}>
                            <CheckCircleIcon sx={{ color: "#0e71eb", mb: 1 }} />
                            <Typography sx={{ fontWeight: 700, fontSize: 17, mb: 1, color: "#101828 !important" }}>{feature.title}</Typography>
                            <Typography sx={{ color: "#667085", lineHeight: 1.6 }}>{feature.description}</Typography>
                        </Box>
                    ))}
                </Box>

                <Divider sx={{ my: 5 }} />
                <Typography variant="h2" sx={{ fontSize: 26, fontWeight: 700, mb: 1.5, color: "#101828 !important" }}>Who is SyncLearn for?</Typography>
                <Typography sx={{ color: "#475467", lineHeight: 1.7 }}>
                    SyncLearn is designed for educational institutions, instructors, students, and teams that need a shared space for live communication and structured evaluations. Access to specific features depends on your account role and the workspace permissions assigned by an administrator.
                </Typography>
            </Container>
        </Box>
    );
}
