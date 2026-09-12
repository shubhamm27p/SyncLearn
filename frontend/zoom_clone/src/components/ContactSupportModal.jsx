import React, { useState } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Box,
  IconButton,
  TextField,
  Divider,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import toast from 'react-hot-toast';

export default function ContactSupportModal({ open, onClose }) {
  const [name, setName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendTicket = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!senderEmail.trim()) {
      toast.error("Please enter your email.");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject.");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter a message.");
      return;
    }
    
    setSending(true);
    try {
      const serverUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      await axios.post(`${serverUrl}/api/v1/users/support/submit`, {
        name: name.trim(),
        senderEmail: senderEmail.trim(),
        subject: subject.trim(),
        message: message.trim()
      });
      
      toast.success("Support request sent successfully! We'll get back to you soon.");
      setName("");
      setSubject("");
      setMessage("");
      setSenderEmail("");
      onClose();
    } catch (err) {
      console.error("Support submission error:", err);
      toast.error(err.response?.data?.message || "Failed to send support request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              backgroundColor: "rgba(14, 113, 235, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0e71eb"
            }}
          >
            <SupportAgentIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#101828", lineHeight: 1.2 }}>
              Contact Support
            </Typography>
            <Typography variant="body2" sx={{ color: "#667085", fontSize: "0.85rem" }}>
              Submit a support request to our team
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#667085" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 3 }}>
        <Box component="form" onSubmit={handleSendTicket} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Name"
            placeholder="Enter your name"
            size="small"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Email Address"
            placeholder="you@example.com"
            type="email"
            size="small"
            fullWidth
            required
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
          />
          <TextField
            label="Subject"
            placeholder="What do you need help with?"
            size="small"
            fullWidth
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <TextField
            label="Message"
            placeholder="Describe your question or issue in detail..."
            multiline
            rows={4}
            size="small"
            fullWidth
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={sending}
            startIcon={sending ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
            sx={{
              backgroundColor: "#0e71eb",
              color: "#ffffff",
              "&:hover": { backgroundColor: "#0b5ed7" },
              fontWeight: 600,
              textTransform: "none",
              borderRadius: "8px",
              py: 1.2,
              mt: 1
            }}
          >
            {sending ? "Sending..." : "Submit Request"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
