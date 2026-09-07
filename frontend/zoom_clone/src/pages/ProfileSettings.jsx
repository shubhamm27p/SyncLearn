import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
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
  Divider,
  CircularProgress,
  IconButton,
  InputAdornment
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
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { AuthContext } from "../contents/AuthContents";
import toast from "react-hot-toast";

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
  const { currentUser, userRole, setCurrentUser } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState(0); // 0: Profile, 1: Security, 2: Preferences
  
  // Loading & Validation States
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  const getDerivedEmail = (user) => {
    if (user?.email) return user.email;
    if (user?.username && user.username.includes("@")) return user.username;
    if (user?.username) return `${user.username}@synclearn.edu`;
    return "";
  };

  const activeUser = currentUser || JSON.parse(localStorage.getItem("currentUser") || "null");
  const isAdmin = sessionStorage.getItem("admin_authenticated") === "true" || activeUser?.role === "admin" || activeUser?.role === "trainer" || userRole === "trainer" || userRole === "admin";

  // General Profile State
  const [fullName, setFullName] = useState(activeUser?.name || "");
  const [username, setUsername] = useState(activeUser?.username || "");
  const [email, setEmail] = useState(getDerivedEmail(activeUser));
  const [bio, setBio] = useState("");
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

  // Password Visibility States
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    const user = currentUser || JSON.parse(localStorage.getItem("currentUser") || "null");
    if (user) {
      const userKey = user.username || user.email || "default";
      const savedProfile = JSON.parse(localStorage.getItem(`viora_user_profile_${userKey}`) || "null");
      const derivedEmail = getDerivedEmail(user);

      setFullName(savedProfile?.fullName || user.name || "");
      setUsername(savedProfile?.username || user.username || "");
      setEmail(savedProfile?.email || derivedEmail);
      setBio(savedProfile?.bio || "");
      setOrganization(savedProfile?.organization || "SyncLearn Learning Institute");
      setAvatarUrl(savedProfile?.avatarUrl || "");
    }

    const savedPrefs = JSON.parse(localStorage.getItem("viora_user_settings_db") || "null");
    const savedTests = JSON.parse(localStorage.getItem("viora_tests_db") || "[]");
    const savedSubmissions = JSON.parse(localStorage.getItem("viora_test_submissions_db") || "[]");

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
  }, [currentUser]);

  const handleSaveProfile = async () => {
    setProfileErrors({});
    let errors = {};
    if (!fullName.trim()) errors.fullName = "Full name is required";
    if (!email.trim()) errors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Invalid email format";
    if (!username.trim()) errors.username = "Username is required";

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      toast.error("Please fix the highlighted errors in your profile.");
      return;
    }

    setIsSavingProfile(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    const profileData = {
      fullName,
      username,
      email,
      bio,
      organization,
      avatarUrl
    };

    const user = currentUser || JSON.parse(localStorage.getItem("currentUser") || "null");
    const userKey = user?.username || user?.email || "default";
    localStorage.setItem(`viora_user_profile_${userKey}`, JSON.stringify(profileData));

    if (user) {
      const updatedUser = {
        ...user,
        name: fullName,
        username: username,
        email: email
      };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      if (setCurrentUser) {
        setCurrentUser(updatedUser);
      }
    }

    toast.success("Profile details saved successfully!");
    setIsSavingProfile(false);
  };

  // Avatar Upload Handler
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
        toast.success("Avatar picture updated!");
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

  const handleUpdatePassword = async () => {
    setPasswordErrors({});
    let errors = {};
    if (!currentPassword) errors.currentPassword = "Required";
    if (!newPassword) errors.newPassword = "Required";
    else if (newPassword.length < 8) errors.newPassword = "Must be at least 8 characters long";
    if (!confirmPassword) errors.confirmPassword = "Required";
    else if (newPassword !== confirmPassword) errors.confirmPassword = "Passwords do not match";

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      toast.error("Please fix the errors to update your password.");
      return;
    }

    setIsUpdatingPassword(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password updated successfully!");
    setIsUpdatingPassword(false);
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
    toast.success("System preferences saved successfully!");
  };

  const handleExecuteDangerAction = () => {
    if (dangerActionType === "reset") {
      localStorage.removeItem("viora_user_profile_db");
      localStorage.removeItem("viora_user_settings_db");
      localStorage.removeItem("viora_test_submissions_db");
      toast.success("Account data and test history reset.");
    } else if (dangerActionType === "delete") {
      localStorage.clear();
      toast.error("Account deleted. Logging out...");
      setTimeout(() => navigate("/auth"), 1500);
    }
    setDangerModalOpen(false);
  };

  const passwordStrength = getPasswordStrength();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", color: "#101828", py: 4 }}>
      <Container maxWidth="lg">
        {/* Navigation & Header Bar */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4, pb: 2, borderBottom: "1px solid #eaecf0", flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }} onClick={() => navigate("/home")}>
            <VideoCallIcon sx={{ fontSize: 32, color: "#0e71eb" }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#101828", fontSize: "20px", letterSpacing: "-0.4px" }}>
              SyncLearn
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
            {isAdmin ? (
              <Button
                onClick={() => navigate("/admin/tests")}
                sx={{ color: "#eab308", fontWeight: 600, fontSize: "14px", textTransform: "none", display: { xs: "none", sm: "inline-flex" } }}
              >
                Admin Panel
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/student/dashboard")}
                sx={{ color: "#0e71eb", fontWeight: 600, fontSize: "14px", textTransform: "none", display: { xs: "none", sm: "inline-flex" } }}
              >
                Student Portal
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={() => navigate("/home")}
              sx={{ color: "#344054", borderColor: "#d1d5db", bgcolor: "#ffffff", "&:hover": { borderColor: "#0e71eb", bgcolor: "#f9fafb" }, textTransform: "none", fontWeight: 600, borderRadius: "8px" }}
            >
              Dashboard
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={() => {
                localStorage.removeItem("token");
                sessionStorage.removeItem("admin_authenticated");
                navigate("/auth");
              }}
              sx={{ color: "#ef4444", borderColor: "#fca5a5", textTransform: "none", fontWeight: 600, borderRadius: "8px" }}
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
                      error={!!profileErrors.fullName}
                      helperText={profileErrors.fullName}
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
                      error={!!profileErrors.username}
                      helperText={profileErrors.username}
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
                      error={!!profileErrors.email}
                      helperText={profileErrors.email}
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
                  disabled={isSavingProfile}
                  sx={{ bgcolor: "#0e71eb", "&:hover": { bgcolor: "#0b5ed7" }, fontWeight: 600, borderRadius: "8px", mt: 3, px: 4, py: 1.2, textTransform: "none" }}
                >
                  {isSavingProfile ? <CircularProgress size={24} color="inherit" /> : "Save Profile Changes"}
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
                      type={showCurrentPassword ? "text" : "password"}
                      fullWidth
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      sx={inputSx}
                      error={!!passwordErrors.currentPassword}
                      helperText={passwordErrors.currentPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                              {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography component="label" sx={labelSx}>New Password</Typography>
                    <TextField
                      hiddenLabel
                      type={showNewPassword ? "text" : "password"}
                      fullWidth
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      sx={inputSx}
                      error={!!passwordErrors.newPassword}
                      helperText={passwordErrors.newPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                              {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
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
                      type={showConfirmPassword ? "text" : "password"}
                      fullWidth
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      sx={inputSx}
                      error={!!passwordErrors.confirmPassword}
                      helperText={passwordErrors.confirmPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                              {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  onClick={handleUpdatePassword}
                  disabled={isUpdatingPassword}
                  sx={{ bgcolor: "#0e71eb", "&:hover": { bgcolor: "#0b5ed7" }, fontWeight: 600, borderRadius: "8px", mt: 3, px: 4, py: 1.2, textTransform: "none" }}
                >
                  {isUpdatingPassword ? <CircularProgress size={24} color="inherit" /> : "Update Password"}
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
                      toast.success("Logged out of all other device sessions.");
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


      </Container>
    </Box>
  );
}
