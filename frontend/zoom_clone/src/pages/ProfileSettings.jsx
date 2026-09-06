import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Avatar,
  Chip,
  Grid,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  LinearProgress,
  Divider
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import SettingsIcon from "@mui/icons-material/Settings";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contents/AuthContents";

const labelSx = {
  display: "block",
  color: "#374151",
  fontSize: "13px",
  fontWeight: 500,
  mb: "6px"
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    color: "#111827",
    fontSize: "14px",
    "& fieldset": {
      borderColor: "#d1d5db"
    },
    "&:hover fieldset": {
      borderColor: "#9ca3af"
    },
    "&.Mui-focused fieldset": {
      borderColor: "#0e71eb",
      borderWidth: "1px",
      boxShadow: "0 0 0 2px rgba(14, 113, 235, 0.2)"
    },
    "& input, & textarea": {
      color: "#111827",
      "&::placeholder": {
        color: "#9ca3af",
        opacity: 1
      }
    }
  }
};

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { currentUser, userRole } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState(0); // 0: Profile, 1: Security, 2: Preferences
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  // General Profile State
  const [fullName, setFullName] = useState(currentUser?.name || "Alex Morgan");
  const [username, setUsername] = useState(currentUser?.username || "alex_morgan");
  const [email, setEmail] = useState(currentUser?.email || "alex.morgan@synclearn.edu");
  const [bio, setBio] = useState("Lead Trainer & Computer Science Educator");
  const [organization, setOrganization] = useState("SyncLearn Learning Institute");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Account Metrics
  const [joinedDate] = useState("September 2026");
  const [totalTestsCreated, setTotalTestsCreated] = useState(0);
  const [totalTestsTaken, setTotalTestsTaken] = useState(0);

  // Security & Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailVerified] = useState(true);

  // System Preferences State
  const [notifySubmissions, setNotifySubmissions] = useState(true);
  const [notifyGrades, setNotifyGrades] = useState(true);
  const [notifySystemUpdates, setNotifySystemUpdates] = useState(false);

  // Trainer Default Test Settings
  const [defaultTimeLimit, setDefaultTimeLimit] = useState(15);
  const [defaultPassingScore, setDefaultPassingScore] = useState(60);
  const [defaultAntiCheating, setDefaultAntiCheating] = useState(true);

  // Danger Zone Dialog State
  const [dangerModalOpen, setDangerModalOpen] = useState(false);
  const [dangerActionType, setDangerActionType] = useState(""); // 'reset' or 'delete'

  // Load from localStorage
  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem("viora_user_profile_db") || "null");
    const savedPrefs = JSON.parse(localStorage.getItem("viora_user_settings_db") || "null");
    const savedTests = JSON.parse(localStorage.getItem("viora_tests_db") || "[]");
    const savedSubmissions = JSON.parse(localStorage.getItem("viora_test_submissions_db") || "[]");

    if (savedProfile) {
      setFullName(savedProfile.fullName || fullName);
      setUsername(savedProfile.username || username);
      setEmail(savedProfile.email || email);
      setBio(savedProfile.bio || bio);
      setOrganization(savedProfile.organization || organization);
      setAvatarUrl(savedProfile.avatarUrl || "");
    }

    if (savedPrefs) {
      setNotifySubmissions(savedPrefs.notifySubmissions ?? true);
      setNotifyGrades(savedPrefs.notifyGrades ?? true);
      setNotifySystemUpdates(savedPrefs.notifySystemUpdates ?? false);
      setDefaultTimeLimit(savedPrefs.defaultTimeLimit || 15);
      setDefaultPassingScore(savedPrefs.defaultPassingScore || 60);
      setDefaultAntiCheating(savedPrefs.defaultAntiCheating ?? true);
    }

    setTotalTestsCreated(savedTests.length);
    setTotalTestsTaken(savedSubmissions.length);
  }, []);

  // Save General Profile
  const handleSaveProfile = () => {
    if (!fullName.trim() || !email.trim()) {
      setSnackbar({ open: true, message: "Name and Email fields cannot be empty.", severity: "warning" });
      return;
    }

    const profileData = {
      fullName,
      username,
      email,
      bio,
      organization,
      avatarUrl
    };

    localStorage.setItem("viora_user_profile_db", JSON.stringify(profileData));
    setSnackbar({ open: true, message: "Profile details saved successfully!", severity: "success" });
  };

  // Avatar Upload Handler
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
        setSnackbar({ open: true, message: "Avatar picture updated!", severity: "info" });
      };
      reader.readAsDataURL(file);
    }
  };

  // Password Strength Calculation
  const getPasswordStrength = () => {
    if (!newPassword) return { score: 0, label: "None", color: "#9ca3af" };
    let score = 0;
    if (newPassword.length >= 8) score += 25;
    if (/[A-Z]/.test(newPassword)) score += 25;
    if (/[0-9]/.test(newPassword)) score += 25;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 25;

    if (score <= 25) return { score, label: "Weak", color: "#ef4444" };
    if (score <= 66) return { score, label: "Medium", color: "#f59e0b" };
    return { score, label: "Strong", color: "#10b981" };
  };

  // Update Password
  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setSnackbar({ open: true, message: "Please fill in all password fields.", severity: "warning" });
      return;
    }
    if (newPassword.length < 8) {
      setSnackbar({ open: true, message: "New password must be at least 8 characters long.", severity: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSnackbar({ open: true, message: "New password and confirmation do not match.", severity: "error" });
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSnackbar({ open: true, message: "Password updated successfully!", severity: "success" });
  };

  // Save System Preferences
  const handleSavePreferences = () => {
    const prefsData = {
      notifySubmissions,
      notifyGrades,
      notifySystemUpdates,
      defaultTimeLimit: Number(defaultTimeLimit),
      defaultPassingScore: Number(defaultPassingScore),
      defaultAntiCheating
    };

    localStorage.setItem("viora_user_settings_db", JSON.stringify(prefsData));
    setSnackbar({ open: true, message: "System preferences saved successfully!", severity: "success" });
  };

  // Danger Zone Action Execution
  const handleExecuteDangerAction = () => {
    if (dangerActionType === "reset") {
      localStorage.removeItem("viora_user_profile_db");
      localStorage.removeItem("viora_user_settings_db");
      localStorage.removeItem("viora_test_submissions_db");
      setSnackbar({ open: true, message: "Account data and test history reset.", severity: "info" });
    } else if (dangerActionType === "delete") {
      localStorage.clear();
      setSnackbar({ open: true, message: "Account deleted. Logging out...", severity: "error" });
      setTimeout(() => navigate("/auth"), 1500);
    }
    setDangerModalOpen(false);
  };

  const passwordStrength = getPasswordStrength();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", color: "#101828", py: 4 }}>
      <Container maxWidth="lg">
        {/* Navigation & Header Bar */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4, pb: 2, borderBottom: "1px solid #eaecf0" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }} onClick={() => navigate("/home")}>
            <VideoCallIcon sx={{ fontSize: 32, color: "#0e71eb" }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#101828", fontSize: "20px", letterSpacing: "-0.4px" }}>
              SyncLearn
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={() => navigate("/home")}
              sx={{ color: "#344054", borderColor: "#d1d5db", bgcolor: "#ffffff", "&:hover": { borderColor: "#0e71eb", bgcolor: "#f9fafb" }, textTransform: "none", fontWeight: 600, borderRadius: "8px" }}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/auth");
              }}
              sx={{ textTransform: "none", fontWeight: 600, borderRadius: "8px" }}
            >
              Logout
            </Button>
          </Box>
        </Box>

        {/* Page Title Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <SettingsIcon sx={{ fontSize: 36, color: "#0e71eb" }} />
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ color: "#101828" }}>
              Profile & Settings
            </Typography>
            <Typography variant="body2" sx={{ color: "#475569" }}>
              Manage account preferences, authentication, and system defaults
            </Typography>
          </Box>
        </Box>

        {/* Header Tabs */}
        <Box sx={{ borderBottom: "1px solid #eaecf0", mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            sx={{
              "& .MuiTab-root": {
                color: "#344054",
                fontWeight: 500,
                textTransform: "none",
                fontSize: "14px",
                pb: 1.5,
                minHeight: 48,
                transition: "color 0.2s"
              },
              "& .Mui-selected": {
                color: "#0e71eb !important",
                fontWeight: 600
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#0e71eb",
                height: 2
              }
            }}
          >
            <Tab icon={<PersonIcon />} iconPosition="start" label="General Profile" />
            <Tab icon={<SecurityIcon />} iconPosition="start" label="Security & Password" />
            <Tab icon={<SettingsIcon />} iconPosition="start" label="System Preferences" />
          </Tabs>
        </Box>

        {/* TAB 0: GENERAL PROFILE */}
        {activeTab === 0 && (
          <Grid container spacing={4}>
            {/* Left: Profile Form */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ bgcolor: "#ffffff", p: 4, borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)", mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: "#101828", mb: 3 }}>
                  Personal Information
                </Typography>

                {/* Avatar Section */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 4 }}>
                  <Avatar
                    src={avatarUrl}
                    sx={{ width: 76, height: 76, bgcolor: "#0e71eb", fontSize: "1.8rem", fontWeight: "bold", boxShadow: "0 4px 12px rgba(14,113,235,0.25)" }}
                  >
                    {!avatarUrl && fullName ? fullName.split(" ").map(n => n[0]).join("") : "U"}
                  </Avatar>
                  <Box>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<PhotoCameraIcon />}
                      sx={{ color: "#0e71eb", borderColor: "#0e71eb", textTransform: "none", fontWeight: 600, borderRadius: "8px", mb: 1, px: 2, py: 0.8 }}
                    >
                      Upload New Avatar
                      <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                    </Button>
                    <Typography variant="caption" display="block" sx={{ color: "#667085", fontSize: "12px", mt: 0.5 }}>
                      PNG, JPG or GIF (Max 2MB). High-resolution square image recommended.
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography component="label" sx={labelSx}>Full Name</Typography>
                    <TextField
                      hiddenLabel
                      fullWidth
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography component="label" sx={labelSx}>Username</Typography>
                    <TextField
                      hiddenLabel
                      fullWidth
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography component="label" sx={labelSx}>Email Address</Typography>
                    <TextField
                      hiddenLabel
                      fullWidth
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography component="label" sx={labelSx}>Organization / Institution</Typography>
                    <TextField
                      hiddenLabel
                      fullWidth
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography component="label" sx={labelSx}>Bio / Title Description</Typography>
                    <TextField
                      hiddenLabel
                      multiline
                      rows={3}
                      fullWidth
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell students or colleagues about your specialization..."
                      sx={inputSx}
                    />
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  onClick={handleSaveProfile}
                  sx={{ bgcolor: "#0e71eb", "&:hover": { bgcolor: "#0b5ed7" }, fontWeight: 600, borderRadius: "8px", mt: 3, px: 4, py: 1.2, textTransform: "none" }}
                >
                  Save Profile Changes
                </Button>
              </Paper>
            </Grid>

            {/* Right: Account Metrics Overview Card */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ bgcolor: "#ffffff", p: 3, borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)", mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: "#101828", mb: 2 }}>
                  Account Overview
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" sx={{ color: "#667085" }}>Primary Account Role</Typography>
                    <Chip
                      label={(userRole || "student").toUpperCase()}
                      color={userRole === "trainer" || userRole === "admin" ? "secondary" : "primary"}
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                  </Box>
                  <Divider sx={{ borderColor: "#eaecf0" }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" sx={{ color: "#667085" }}>Member Since</Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: "#101828" }}>{joinedDate}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: "#eaecf0" }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" sx={{ color: "#667085" }}>Total Tests Created</Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: "#0e71eb" }}>{totalTestsCreated}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: "#eaecf0" }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" sx={{ color: "#667085" }}>Total Tests Taken</Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: "#10b981" }}>{totalTestsTaken}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* TAB 1: SECURITY & PASSWORD */}
        {activeTab === 1 && (
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              {/* Password Update Form */}
              <Paper sx={{ bgcolor: "#ffffff", p: 4, borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)", mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: "#101828", mb: 3 }}>
                  Update Account Password
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography component="label" sx={labelSx}>Current Password</Typography>
                    <TextField
                      hiddenLabel
                      type="password"
                      fullWidth
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography component="label" sx={labelSx}>New Password</Typography>
                    <TextField
                      hiddenLabel
                      type="password"
                      fullWidth
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      sx={inputSx}
                    />
                    {newPassword && (
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: "#667085" }}>Strength</Typography>
                          <Typography variant="caption" fontWeight="bold" sx={{ color: passwordStrength.color }}>
                            {passwordStrength.label}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={passwordStrength.score}
                          sx={{ height: 6, borderRadius: 3, bgcolor: "#eaecf0", "& .MuiLinearProgress-bar": { bgcolor: passwordStrength.color } }}
                        />
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography component="label" sx={labelSx}>Confirm New Password</Typography>
                    <TextField
                      hiddenLabel
                      type="password"
                      fullWidth
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      sx={inputSx}
                    />
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  onClick={handleUpdatePassword}
                  sx={{ bgcolor: "#0e71eb", "&:hover": { bgcolor: "#0b5ed7" }, fontWeight: 600, borderRadius: "8px", mt: 3, px: 4, py: 1.2, textTransform: "none" }}
                >
                  Update Password
                </Button>
              </Paper>

              {/* Email Verification & Active Sessions */}
              <Paper sx={{ bgcolor: "#ffffff", p: 4, borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)", mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: "#101828", mb: 3 }}>
                  Authentication & Active Sessions
                </Typography>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#101828" }}>
                      Email Verification Status
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#667085" }}>
                      {email}
                    </Typography>
                  </Box>
                  <Chip
                    icon={<CheckCircleIcon />}
                    label={emailVerified ? "Verified Email" : "Pending Confirmation"}
                    color={emailVerified ? "success" : "warning"}
                    sx={{ fontWeight: "bold" }}
                  />
                </Box>

                <Divider sx={{ borderColor: "#eaecf0", mb: 3 }} />

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#101828" }}>
                      Active WebRTC Login Sessions
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#667085" }}>
                      Currently logged in on 1 active browser device (Windows / Chrome).
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      setSnackbar({ open: true, message: "Logged out of all other device sessions.", severity: "info" });
                    }}
                    sx={{ textTransform: "none", fontWeight: 600, borderRadius: "8px" }}
                  >
                    Log Out All Devices
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* TAB 2: SYSTEM PREFERENCES */}
        {activeTab === 2 && (
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              {/* Notification Toggles */}
              <Paper sx={{ bgcolor: "#ffffff", p: 4, borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)", mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: "#101828", mb: 3 }}>
                  Notification Preferences
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <FormControlLabel
                    control={<Switch checked={notifySubmissions} onChange={(e) => setNotifySubmissions(e.target.checked)} color="primary" />}
                    label={
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "#101828" }}>
                          Test Submission Alerts
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#667085" }}>
                          Receive immediate email notifications when a student completes an assessment.
                        </Typography>
                      </Box>
                    }
                  />
                  <Divider sx={{ borderColor: "#eaecf0" }} />
                  <FormControlLabel
                    control={<Switch checked={notifyGrades} onChange={(e) => setNotifyGrades(e.target.checked)} color="primary" />}
                    label={
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "#101828" }}>
                          Grade Release Notifications
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#667085" }}>
                          Receive notifications when automated test scores or gradebook reports are generated.
                        </Typography>
                      </Box>
                    }
                  />
                  <Divider sx={{ borderColor: "#eaecf0" }} />
                  <FormControlLabel
                    control={<Switch checked={notifySystemUpdates} onChange={(e) => setNotifySystemUpdates(e.target.checked)} color="primary" />}
                    label={
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "#101828" }}>
                          System Announcements & Updates
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#667085" }}>
                          Receive periodic announcements regarding WebRTC platform features and upgrades.
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </Paper>

              {/* Trainer Default Test Settings */}
              {userRole === "trainer" && (
                <Paper sx={{ bgcolor: "#ffffff", p: 4, borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)", mb: 4 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: "#101828", mb: 3 }}>
                    Trainer Default Examination Parameters
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography component="label" sx={labelSx}>Default Test Time Limit (Mins)</Typography>
                      <TextField
                        hiddenLabel
                        type="number"
                        fullWidth
                        value={defaultTimeLimit}
                        onChange={(e) => setDefaultTimeLimit(e.target.value)}
                        sx={inputSx}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography component="label" sx={labelSx}>Default Passing Score (%)</Typography>
                      <TextField
                        hiddenLabel
                        type="number"
                        fullWidth
                        value={defaultPassingScore}
                        onChange={(e) => setDefaultPassingScore(e.target.value)}
                        sx={inputSx}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch checked={defaultAntiCheating} onChange={(e) => setDefaultAntiCheating(e.target.checked)} color="primary" />}
                        label={
                          <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "#101828" }}>
                            Enable Anti-Cheating Tab Switch Guard by Default on New Tests
                          </Typography>
                        }
                      />
                    </Grid>
                  </Grid>
                </Paper>
              )}

              <Button
                variant="contained"
                onClick={handleSavePreferences}
                sx={{ bgcolor: "#0e71eb", "&:hover": { bgcolor: "#0b5ed7" }, fontWeight: 600, borderRadius: "8px", px: 4, py: 1.2, mb: 4, textTransform: "none" }}
              >
                Save System Preferences
              </Button>
            </Grid>
          </Grid>
        )}

        {/* DANGER ZONE PANEL */}
        <Paper sx={{ bgcolor: "#ffffff", p: 4, borderRadius: "12px", border: "1px solid #fecaca", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.05)", mt: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <WarningIcon sx={{ color: "#ef4444", fontSize: 28 }} />
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#ef4444" }}>
              Danger Zone
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#667085", mb: 3 }}>
            Irreversible account management operations. Resetting data will purge local test logs.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setDangerActionType("reset");
                setDangerModalOpen(true);
              }}
              sx={{ fontWeight: 600, borderRadius: "8px", textTransform: "none" }}
            >
              Reset Account Data & Clear Logs
            </Button>

            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                setDangerActionType("delete");
                setDangerModalOpen(true);
              }}
              sx={{ fontWeight: 600, borderRadius: "8px", textTransform: "none" }}
            >
              Permanently Delete Account
            </Button>
          </Box>
        </Paper>

        {/* Danger Zone Confirmation Dialog */}
        <Dialog open={dangerModalOpen} onClose={() => setDangerModalOpen(false)}>
          <DialogTitle sx={{ bgcolor: "#ffffff", color: "#ef4444", fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
            <WarningIcon /> Confirm Dangerous Action
          </DialogTitle>
          <DialogContent sx={{ bgcolor: "#ffffff", color: "#101828", pt: 2 }}>
            <Typography variant="body1" sx={{ color: "#475569" }}>
              {dangerActionType === "reset"
                ? "Are you sure you want to reset your profile data and clear all local test history? This action cannot be undone."
                : "Are you sure you want to PERMANENTLY delete your account and all associated test data?"}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ bgcolor: "#ffffff", px: 3, pb: 2 }}>
            <Button onClick={() => setDangerModalOpen(false)} sx={{ color: "#667085" }}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={handleExecuteDangerAction} sx={{ fontWeight: "bold", borderRadius: "8px", textTransform: "none" }}>
              Confirm {dangerActionType === "reset" ? "Reset" : "Deletion"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
