import React from "react";
import { Link, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import { Box, Button, Container, Divider, Typography } from "@mui/material";

const sections = [
    ["1. Acceptance of these terms", "By creating an account or using SyncLearn, you agree to these Terms and Conditions. If you are using SyncLearn on behalf of an institution or team, you confirm that you are authorized to accept these terms for that organization."],
    ["2. Using SyncLearn", "You may use SyncLearn only for lawful educational, professional, and collaborative activities. Keep your login details private, provide accurate account information, and notify the support team promptly if you believe your account has been accessed without permission."],
    ["3. Meetings and assessments", "You are responsible for the content you share in meetings and assessments and for using the platform respectfully. Do not upload content that is unlawful, harmful, abusive, infringing, or intended to disrupt the service. Administrators are responsible for managing their workspace members, tests, questions, and results."],
    ["4. Results and educational content", "SyncLearn provides tools for conducting and reviewing assessments, but it does not guarantee a particular academic or professional outcome. Instructors and administrators remain responsible for assessment content, grading decisions, and communicating results to learners."],
    ["5. Service availability", "We work to keep SyncLearn available and reliable, but the service may occasionally be changed, interrupted, or unavailable for maintenance, security, or circumstances outside our control. Features may be updated as the application evolves."],
    ["6. Account suspension and termination", "We may restrict or terminate access when an account violates these terms, creates a security risk, or misuses the service. You may stop using SyncLearn at any time. Workspace administrators may also manage or remove users according to their organization's policies."],
    ["7. Contact", "Questions about these terms can be sent to synclearn.pvt@gmail.com. We may update these terms when the application or applicable requirements change. The latest version will be published on this page."]
];

export default function TermsAndConditions() {
    const navigate = useNavigate();

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f8f9fa", color: "#101828" }}>
            <Box component="header" sx={{ backgroundColor: "#ffffff", borderBottom: "1px solid #eaecf0" }}>
                <Container maxWidth="lg" sx={{ py: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box onClick={() => navigate("/")} sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }}>
                        <VideoCallIcon sx={{ fontSize: 32, color: "#0e71eb" }} />
                        <Typography sx={{ fontWeight: 700, fontSize: 20 }}>SyncLearn</Typography>
                    </Box>
                    <Button component={Link} to="/auth" variant="contained" sx={{ backgroundColor: "#0e71eb", textTransform: "none", borderRadius: "8px", fontWeight: 600 }}>Get started</Button>
                </Container>
            </Box>
            <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
                <Button component={Link} to="/" startIcon={<ArrowBackIcon />} sx={{ color: "#475467", textTransform: "none", mb: 4 }}>Back to home</Button>
                <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 48 }, fontWeight: 800, lineHeight: 1.15, mb: 2, color: "#101828" }}>Terms and Conditions</Typography>
                <Typography sx={{ color: "#667085", mb: 5 }}>Last updated: September 7, 2026</Typography>
                <Box sx={{ backgroundColor: "#ffffff", border: "1px solid #eaecf0", borderRadius: "12px", p: { xs: 3, md: 5 } }}>
                    {sections.map(([title, body], index) => (
                        <Box key={title} sx={{ mb: index === sections.length - 1 ? 0 : 4 }}>
                            <Typography variant="h2" sx={{ fontSize: 20, fontWeight: 700, mb: 1.2, color: "#101828" }}>{title}</Typography>
                            <Typography sx={{ color: "#475467", lineHeight: 1.75 }}>{body}</Typography>
                            {index < sections.length - 1 && <Divider sx={{ mt: 4 }} />}
                        </Box>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}