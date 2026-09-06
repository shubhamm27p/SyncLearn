import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from '../contents/AuthContents';
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Button, Container, Box, Chip, Grid, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HistoryIcon from '@mui/icons-material/History';

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                if (Array.isArray(history)) {
                    setMeetings(history);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchHistory();
    }, []);

    let formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', pb: 6 }}>
            {/* Header Navigation Bar */}
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                px: { xs: 3, md: 6 }, 
                py: 2, 
                backgroundColor: '#ffffff', 
                borderBottom: '1px solid #eaecf0',
                mb: 4 
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => routeTo('/home')}>
                    <VideoCallIcon sx={{ fontSize: 32, color: '#0e71eb' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#101828', fontSize: '20px', letterSpacing: '-0.4px' }}>
                        SyncLearn
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Button 
                        variant="outlined" 
                        startIcon={<HomeIcon />} 
                        onClick={() => routeTo("/home")}
                        sx={{ color: '#344054', borderColor: '#d1d5db', '&:hover': { borderColor: '#0e71eb', backgroundColor: '#f9fafb' }, textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                    >
                        Back to Home
                    </Button>
                </Box>
            </Box>

            <Container maxWidth="md">
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#101828', mb: 1, letterSpacing: '-0.3px' }}>
                        Meeting History
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#475569' }}>
                        View your previously created or joined video calls.
                    </Typography>
                </Box>

                {meetings.length > 0 ? (
                    <Grid container spacing={3}>
                        {meetings.map((e, i) => {
                            const code = e.meeting_id || e.meetingCode || e.mettingCode || "Unknown";
                            return (
                                <Grid item xs={12} sm={6} key={i}>
                                    <Card elevation={0} sx={{ 
                                        borderRadius: '12px',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)', 
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)'
                                        }
                                    }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Box
                                                    sx={{
                                                        backgroundColor: '#ecfdf5',
                                                        color: '#047857',
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        fontSize: '12px',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    Completed
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#667085', fontSize: '0.85rem' }}>
                                                    <CalendarTodayIcon sx={{ fontSize: 16 }} />
                                                    {formatDate(e.date || e.Date)}
                                                </Box>
                                            </Box>
                                            
                                            <Typography variant="subtitle2" sx={{ color: '#667085', mb: 0.5 }}>
                                                Meeting Code:
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2.5, fontFamily: 'monospace' }}>
                                                {code}
                                            </Typography>

                                            <Button 
                                                variant="contained" 
                                                size="medium" 
                                                fullWidth
                                                startIcon={<PlayArrowIcon />}
                                                onClick={() => routeTo(`/${code}`)}
                                                sx={{
                                                    backgroundColor: '#0e71eb',
                                                    '&:hover': { backgroundColor: '#0b5ed7' },
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    borderRadius: '8px',
                                                    py: 1
                                                }}
                                            >
                                                Rejoin Meeting
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                ) : (
                    <Paper elevation={0} sx={{ textAlign: 'center', py: 10, px: 3, backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <HistoryIcon sx={{ fontSize: 64, color: '#9ca3af' }} />
                        </Box>
                        <Typography variant="h6" sx={{ color: '#475569', mb: 1, fontWeight: 'bold' }}>
                            No meeting history found yet
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
                            When you join or create a meeting, it will appear here.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => routeTo("/home")}
                            sx={{ backgroundColor: '#0e71eb', '&:hover': { backgroundColor: '#0b5ed7' }, textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 4, py: 1.2 }}
                        >
                            Start a Meeting
                        </Button>
                    </Paper>
                )}
            </Container>
        </Box>
    );
}