import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from '../contents/AuthContents';
import { useNavigate } from "react-router-dom";
import { 
  Card, CardContent, Typography, Button, Container, Box, Chip, Grid, Paper,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import toast from 'react-hot-toast';

const server_url = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function History() {
    const { getHistoryOfUser, clearUserHistoryApi, deleteMeetingHistoryApi } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [activeRooms, setActiveRooms] = useState([]);
    const routeTo = useNavigate();

    // Modal States
    const [clearDialogOpen, setClearDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                if (Array.isArray(history)) {
                    setMeetings(history);
                }

                const response = await fetch(`${server_url}/api/v1/users/active-rooms`);
                if (response.ok) {
                    const data = await response.json();
                    setActiveRooms(data.activeRooms || []);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchHistory();
    }, []);

    const handleClearAllHistory = async () => {
        setDeleting(true);
        try {
            await clearUserHistoryApi();
            setMeetings([]);
            toast.success("Meeting history cleared!");
            setClearDialogOpen(false);
        } catch (err) {
            toast.error("Failed to clear meeting history.");
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteSingleMeeting = async () => {
        if (!itemToDelete) return;
        const meetingId = itemToDelete.id || itemToDelete.meeting_id || itemToDelete.meetingCode;
        setDeleting(true);
        try {
            await deleteMeetingHistoryApi(meetingId);
            setMeetings((prev) => prev.filter((m) => (m.id || m.meeting_id || m.meetingCode) !== meetingId));
            toast.success("Meeting removed from history.");
            setItemToDelete(null);
        } catch (err) {
            toast.error("Failed to remove meeting.");
        } finally {
            setDeleting(false);
        }
    };

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
                px: { xs: 2, sm: 3, md: 6 }, 
                py: 1.8, 
                backgroundColor: '#ffffff', 
                borderBottom: '1px solid #eaecf0',
                mb: 4,
                position: 'sticky',
                top: 0,
                zIndex: 1100,
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => routeTo('/home')}>
                    <VideoCallIcon sx={{ fontSize: 32, color: '#0e71eb' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#101828', fontSize: '20px', letterSpacing: '-0.4px' }}>
                        SyncLearn
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Button 
                        onClick={() => routeTo("/student/dashboard")}
                        sx={{ color: '#344054', fontWeight: 500, fontSize: '13px', textTransform: 'none', display: { xs: 'none', sm: 'inline-flex' } }}
                    >
                        Student Portal
                    </Button>
                    <Button 
                        onClick={() => routeTo("/tests")}
                        sx={{ color: '#0e71eb', fontWeight: 600, fontSize: '13px', textTransform: 'none', display: { xs: 'none', sm: 'inline-flex' } }}
                    >
                        Test Hub
                    </Button>
                    <Button 
                        variant="outlined" 
                        startIcon={<HomeIcon />} 
                        onClick={() => routeTo("/home")}
                        sx={{ color: '#344054', borderColor: '#d1d5db', '&:hover': { borderColor: '#0e71eb', backgroundColor: '#f9fafb' }, textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: '13px' }}
                    >
                        Dashboard
                    </Button>
                </Box>
            </Box>

            <Container maxWidth="md">
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#101828', mb: 1, letterSpacing: '-0.3px' }}>
                            Meeting History
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#475569' }}>
                            View your previously created or joined video calls.
                        </Typography>
                    </Box>
                    {meetings.length > 0 && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteSweepIcon />}
                            onClick={() => setClearDialogOpen(true)}
                            sx={{
                                color: '#ef4444',
                                borderColor: 'rgba(239,68,68,0.4)',
                                backgroundColor: 'rgba(239,68,68,0.04)',
                                '&:hover': {
                                    borderColor: '#ef4444',
                                    backgroundColor: 'rgba(239,68,68,0.1)',
                                },
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: '8px',
                                px: 2,
                                py: 1
                            }}
                        >
                            Clear All History
                        </Button>
                    )}
                </Box>

                {meetings.length > 0 ? (
                    <Grid container spacing={3}>
                        {meetings.map((e, i) => {
                            const code = e.meeting_id || e.meetingCode || e.mettingCode || "Unknown";
                            const isActive = activeRooms.includes(code);
                            
                            return (
                                <Grid item xs={12} sm={6} key={e.id || e._id || i}>
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
                                                        backgroundColor: isActive ? '#ecfdf5' : '#f3f4f6',
                                                        color: isActive ? '#047857' : '#6b7280',
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        fontSize: '12px',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    {isActive ? "Active" : "Completed"}
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#667085', fontSize: '0.85rem' }}>
                                                        <CalendarTodayIcon sx={{ fontSize: 16 }} />
                                                        {formatDate(e.date || e.Date || e.created_at)}
                                                    </Box>
                                                    <Tooltip title="Delete Entry">
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={() => setItemToDelete(e)}
                                                            sx={{ color: '#9ca3af', '&:hover': { color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)' } }}
                                                        >
                                                            <DeleteIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>
                                            
                                            {isActive ? (
                                                <>
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
                                                </>
                                            ) : (
                                                <Box sx={{ textAlign: 'center', py: 2 }}>
                                                    <Typography variant="subtitle2" sx={{ color: '#667085', mb: 0.5 }}>
                                                        Meeting Code:
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#64748b', mb: 1, fontFamily: 'monospace' }}>
                                                        {code}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '12px' }}>
                                                        Meeting ended
                                                    </Typography>
                                                </Box>
                                            )}
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

            {/* Clear All History Dialog */}
            <Dialog
                open={clearDialogOpen}
                onClose={() => !deleting && setClearDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: '14px', p: 1, maxWidth: 440 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: '18px' }}>Clear Meeting History?</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: '#475569', fontSize: '14px' }}>
                        Are you sure you want to permanently clear all your meeting history records? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setClearDialogOpen(false)} disabled={deleting} sx={{ color: '#64748b' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleClearAllHistory}
                        disabled={deleting}
                        variant="contained"
                        color="error"
                        startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteSweepIcon />}
                        sx={{ backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' }, fontWeight: 600, borderRadius: '8px' }}
                    >
                        {deleting ? "Clearing..." : "Clear History"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Single Item Dialog */}
            <Dialog
                open={!!itemToDelete}
                onClose={() => !deleting && setItemToDelete(null)}
                PaperProps={{ sx: { borderRadius: '14px', p: 1, maxWidth: 400 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: '18px' }}>Delete Meeting Record?</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: '#475569', fontSize: '14px' }}>
                        Are you sure you want to remove meeting <strong style={{ fontFamily: 'monospace' }}>{itemToDelete?.meeting_id || itemToDelete?.meetingCode}</strong> from your history?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setItemToDelete(null)} disabled={deleting} sx={{ color: '#64748b' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteSingleMeeting}
                        disabled={deleting}
                        variant="contained"
                        color="error"
                        startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
                        sx={{ backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' }, fontWeight: 600, borderRadius: '8px' }}
                    >
                        {deleting ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}