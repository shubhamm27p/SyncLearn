import React, { useState } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  TextField,
  Stack,
  Divider,
  Chip,
  Tooltip,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EmailIcon from '@mui/icons-material/Email';
import LaunchIcon from '@mui/icons-material/Launch';
import SendIcon from '@mui/icons-material/Send';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import toast from 'react-hot-toast';
import {
  SUPPORT_EMAIL,
  openGmailCompose,
  openOutlookCompose,
  openMailto,
  copySupportEmailToClipboard
} from '../utils/supportEmail';

export default function ContactSupportModal({ open, onClose, defaultSubject = "", defaultMessage = "" }) {
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState(defaultMessage);
  const [senderEmail, setSenderEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleCopy = () => {
    copySupportEmailToClipboard();
  };

  const handleGmailCompose = () => {
    const finalBody = message ? `${message}\n\nFrom: ${senderEmail || "SyncLearn User"}` : "";
    openGmailCompose(subject || "SyncLearn Support Request", finalBody);
    toast.success("Opening Gmail compose window in a new tab...");
    onClose();
  };

  const handleOutlookCompose = () => {
    const finalBody = message ? `${message}\n\nFrom: ${senderEmail || "SyncLearn User"}` : "";
    openOutlookCompose(subject || "SyncLearn Support Request", finalBody);
    toast.success("Opening Outlook compose window in a new tab...");
    onClose();
  };

  const handleMailto = () => {
    const finalBody = message ? `${message}\n\nFrom: ${senderEmail || "SyncLearn User"}` : "";
    openMailto(subject || "SyncLearn Support Request", finalBody);
    onClose();
  };

  const handleSendTicket = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter a message before sending.");
      return;
    }
    setSending(true);
    try {
      const serverUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const res = await axios.post(`${serverUrl}/api/v1/users/support/submit`, {
        senderEmail: senderEmail.trim(),
        subject: subject.trim(),
        message: message.trim()
      });
      toast.success(res.data.message || "Support ticket submitted successfully!");
      setSubject("");
      setMessage("");
      setSenderEmail("");
      onClose();
    } catch (err) {
      console.error("Support submission error:", err);
      toast.error(err.response?.data?.message || "Failed to send support ticket. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth paperprops={{ sx: { borderRadius: "16px", p: 1 } }}>
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
              Contact Support & Admin
            </Typography>
            <Typography variant="body2" sx={{ color: "#667085", fontSize: "0.85rem" }}>
              We're here to help with any questions or technical issues
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#667085" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 3 }}>
        {/* Support Email Card */}
        <Box
          sx={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            p: 2,
            mb: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EmailIcon sx={{ color: "#0e71eb", fontSize: 20 }} />
            <Box>
              <Typography sx={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>
                Official Support Email
              </Typography>
              <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
                {SUPPORT_EMAIL}
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Copy Email Address">
            <Button
              variant="outlined"
              size="small"
              onClick={handleCopy}
              startIcon={<ContentCopyIcon sx={{ fontSize: "16px !important" }} />}
              sx={{
                textTransform: "none",
                borderRadius: "8px",
                borderColor: "#cbd5e1",
                color: "#334155",
                fontWeight: 600,
                fontSize: "0.82rem",
                "&:hover": { borderColor: "#0e71eb", color: "#0e71eb" }
              }}
            >
              Copy
            </Button>
          </Tooltip>
        </Box>

        {/* Option 1: Direct Webmail Redirection Buttons */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b", mb: 1.5 }}>
          Choose How to Contact:
        </Typography>

        <Stack spacing={1.5} sx={{ mb: 3 }}>
          <Button
            variant="contained"
            onClick={handleGmailCompose}
            startIcon={<LaunchIcon />}
            sx={{
              backgroundColor: "#ea4335",
              color: "#ffffff",
              "&:hover": { backgroundColor: "#d93025" },
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "10px",
              py: 1.2,
              justifyContent: "flex-start",
              px: 2.5
            }}
          >
            <Box sx={{ textAlign: "left", display: "flex", flexDirection: "column" }}>
              <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", lineHeight: 1.2 }}>
                Open in Gmail Web (Recommended)
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", opacity: 0.9 }}>
                Opens Gmail compose window directly in browser tab
              </Typography>
            </Box>
          </Button>

          <Button
            variant="outlined"
            onClick={handleOutlookCompose}
            startIcon={<LaunchIcon />}
            sx={{
              borderColor: "#0078d4",
              color: "#0078d4",
              "&:hover": { backgroundColor: "rgba(0, 120, 212, 0.05)", borderColor: "#005a9e" },
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "10px",
              py: 1.2,
              justifyContent: "flex-start",
              px: 2.5
            }}
          >
            <Box sx={{ textAlign: "left", display: "flex", flexDirection: "column" }}>
              <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", lineHeight: 1.2 }}>
                Open in Outlook Web
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                Opens Outlook 365 webmail in browser tab
              </Typography>
            </Box>
          </Button>

          <Button
            variant="outlined"
            onClick={handleMailto}
            startIcon={<EmailIcon />}
            sx={{
              borderColor: "#cbd5e1",
              color: "#475569",
              "&:hover": { borderColor: "#94a3b8", backgroundColor: "#f8fafc" },
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "10px",
              py: 1.2,
              justifyContent: "flex-start",
              px: 2.5
            }}
          >
            <Box sx={{ textAlign: "left", display: "flex", flexDirection: "column" }}>
              <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", lineHeight: 1.2 }}>
                Open System Desktop Mail App
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                Launches your installed desktop mail application (Outlook / Mail)
              </Typography>
            </Box>
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }}>
          <Chip label="OR PRE-FILL A MESSAGE" size="small" sx={{ fontSize: "0.7rem", color: "#64748b" }} />
        </Divider>

        {/* Quick Message Form */}
        <Box component="form" onSubmit={handleSendTicket} sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <TextField
            label="Your Email (Optional)"
            placeholder="you@example.com"
            size="small"
            fullWidth
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
          />
          <TextField
            label="Subject"
            placeholder="What do you need help with?"
            size="small"
            fullWidth
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <TextField
            label="Message"
            placeholder="Describe your question or issue in detail..."
            multiline
            rows={3}
            size="small"
            fullWidth
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
              py: 1,
              mt: 0.5
            }}
          >
            {sending ? "Sending Support Ticket..." : "Send Ticket Directly (In-App)"}
          </Button>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={onClose} sx={{ textTransform: "none", color: "#64748b", fontWeight: 600 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
