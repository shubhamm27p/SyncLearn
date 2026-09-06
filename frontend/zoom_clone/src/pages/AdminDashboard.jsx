import React, { useEffect, useState, useContext } from "react";
import {
  Box, Container, Typography, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Select, MenuItem, Switch, Button, Chip, Grid,
  Card, CardContent, IconButton, Avatar, TextField,
  InputAdornment, Tooltip, Divider, LinearProgress,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import ShieldIcon from "@mui/icons-material/Shield";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import GroupIcon from "@mui/icons-material/Group";
import BarChartIcon from "@mui/icons-material/BarChart";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contents/AuthContents";
import toast from "react-hot-toast";

// ─── AUTH GUARD: redirect if not logged in via admin login page ──────────────
function useAdminGuard() {
  const navigate = useNavigate();
  useEffect(() => {
    const authed = sessionStorage.getItem("admin_authenticated");
    if (authed !== "true") {
      navigate("/admin-login");
    }
  }, [navigate]);
}
// ─────────────────────────────────────────────────────────────────────────────

const SIDEBAR_ITEMS = [
  { id: "overview", label: "Overview", icon: <BarChartIcon fontSize="small" /> },
  { id: "users", label: "User Management", icon: <GroupIcon fontSize="small" /> },
  { id: "activity", label: "Activity Log", icon: <TrendingUpIcon fontSize="small" /> },
];

const MOCK_ACTIVITY = [
  { action: "New user registered", user: "alice@example.com", time: "2 mins ago", type: "register" },
  { action: "Role changed to Trainer", user: "bob@school.edu", time: "15 mins ago", type: "role" },
  { action: "Account disabled", user: "spammer99@mail.com", time: "1 hour ago", type: "disable" },
  { action: "New user registered", user: "charlie.k@org.com", time: "3 hours ago", type: "register" },
  { action: "Admin login", user: "synclearn_admin", time: "Just now", type: "admin" },
];

export default function AdminDashboard() {
  useAdminGuard();
  const navigate = useNavigate();
  const { getAllUsersApi, updateUserRoleStatusApi } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsersApi();
      setUsers(data || []);
    } catch (err) {
      toast.error("Failed to load users from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRoleStatusApi(userId, { role: newRole });
      toast.success("Role updated successfully!");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update role.");
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await updateUserRoleStatusApi(userId, { is_active: !currentStatus });
      toast.success(`Account ${!currentStatus ? "activated" : "disabled"}.`);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update account status.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated");
    sessionStorage.removeItem("admin_login_time");
    toast.success("Admin session ended.");
    navigate("/admin-login");
  };

  const studentCount = users.filter((u) => u.role === "student").length;
  const trainerCount = users.filter((u) => u.role === "trainer").length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const activeCount = users.filter((u) => u.is_active !== false).length;

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.username || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q)
    );
  });

  const statCards = [
    { label: "Total Users", value: users.length, icon: <PeopleIcon />, color: "#0e71eb", bg: "rgba(14,113,235,0.1)" },
    { label: "Students", value: studentCount, icon: <SchoolIcon />, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    { label: "Trainers", value: trainerCount, icon: <PersonAddIcon />, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
    { label: "Admins", value: adminCount, icon: <SupervisorAccountIcon />, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { label: "Active Accounts", value: activeCount, icon: <CheckCircleIcon />, color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
    { label: "Disabled Accounts", value: users.length - activeCount, icon: <BlockIcon />, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  ];

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", background: "#0f1117" }}>
      {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          width: 260, minHeight: "100vh", flexShrink: 0,
          background: "linear-gradient(180deg, #0d1117 0%, #0a0f1c 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Logo */}
        <Box sx={{ p: 3, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: "10px",
              background: "linear-gradient(135deg, #0e71eb, #7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ShieldIcon sx={{ fontSize: 20, color: "#fff" }} />
            </Box>
            <Box>
              <Typography sx={{ color: "#f1f5f9", fontWeight: 700, fontSize: "15px", lineHeight: 1.2 }}>SyncLearn</Typography>
              <Typography sx={{ color: "#475569", fontSize: "11px" }}>Admin Panel</Typography>
            </Box>
          </Box>
        </Box>

        {/* Nav Items */}
        <Box sx={{ p: 2, flex: 1 }}>
          <Typography sx={{ color: "#334155", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", mb: 1.5, px: 1 }}>
            Navigation
          </Typography>
          {SIDEBAR_ITEMS.map((item) => (
            <Box
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              sx={{
                display: "flex", alignItems: "center", gap: 1.5,
                px: 2, py: 1.3, borderRadius: "10px", cursor: "pointer", mb: 0.5,
                background: activeSection === item.id ? "rgba(14,113,235,0.12)" : "transparent",
                border: activeSection === item.id ? "1px solid rgba(14,113,235,0.2)" : "1px solid transparent",
                color: activeSection === item.id ? "#60a5fa" : "#64748b",
                transition: "all 0.15s ease",
                "&:hover": { background: "rgba(255,255,255,0.04)", color: "#94a3b8" },
              }}
            >
              {item.icon}
              <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>{item.label}</Typography>
            </Box>
          ))}

          <Divider sx={{ borderColor: "rgba(255,255,255,0.05)", my: 2 }} />

          <Typography sx={{ color: "#334155", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", mb: 1.5, px: 1 }}>
            Quick Links
          </Typography>
          <Box
            onClick={() => { sessionStorage.removeItem("admin_authenticated"); navigate("/home"); }}
            sx={{
              display: "flex", alignItems: "center", gap: 1.5,
              px: 2, py: 1.3, borderRadius: "10px", cursor: "pointer", mb: 0.5,
              color: "#64748b", transition: "all 0.15s ease",
              "&:hover": { background: "rgba(255,255,255,0.04)", color: "#94a3b8" },
            }}
          >
            <VideoCallIcon fontSize="small" />
            <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>Go to Main Site</Typography>
          </Box>
        </Box>

        {/* Logout */}
        <Box sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <Box
            onClick={handleLogout}
            sx={{
              display: "flex", alignItems: "center", gap: 1.5,
              px: 2, py: 1.3, borderRadius: "10px", cursor: "pointer",
              color: "#ef4444", border: "1px solid rgba(239,68,68,0.15)",
              background: "rgba(239,68,68,0.06)",
              "&:hover": { background: "rgba(239,68,68,0.12)" },
            }}
          >
            <LogoutIcon fontSize="small" />
            <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>Logout Admin</Typography>
          </Box>
        </Box>
      </Box>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top Bar */}
        <Box sx={{ px: 4, py: 2.5, borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.01)" }}>
          <Box>
            <Typography sx={{ color: "#f1f5f9", fontWeight: 700, fontSize: "20px" }}>
              {SIDEBAR_ITEMS.find(i => i.id === activeSection)?.label || "Overview"}
            </Typography>
            <Typography sx={{ color: "#475569", fontSize: "13px" }}>
              SyncLearn Master Control Panel · {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              icon={<AdminPanelSettingsIcon sx={{ fontSize: "16px !important" }} />}
              label="Administrator"
              sx={{ bgcolor: "rgba(14,113,235,0.15)", color: "#60a5fa", border: "1px solid rgba(14,113,235,0.25)", fontWeight: 600 }}
            />
            <Tooltip title="Refresh Data">
              <IconButton onClick={fetchUsers} disabled={loading} sx={{ color: "#64748b", "&:hover": { color: "#94a3b8", bgcolor: "rgba(255,255,255,0.05)" } }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ height: 2, bgcolor: "transparent", "& .MuiLinearProgress-bar": { bgcolor: "#0e71eb" } }} />}

        {/* Content Area */}
        <Box sx={{ flex: 1, overflow: "auto", p: 4 }}>

          {/* ── OVERVIEW SECTION ── */}
          {activeSection === "overview" && (
            <>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {statCards.map((card) => (
                  <Grid item xs={12} sm={6} lg={4} key={card.label}>
                    <Paper sx={{ p: 3, borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", "&:hover": { border: `1px solid ${card.color}33`, boxShadow: `0 0 20px ${card.color}18` }, transition: "all 0.2s" }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box>
                          <Typography sx={{ color: "#64748b", fontSize: "13px", fontWeight: 500, mb: 1 }}>{card.label}</Typography>
                          <Typography sx={{ color: "#f1f5f9", fontSize: "32px", fontWeight: 800, lineHeight: 1 }}>{card.value}</Typography>
                        </Box>
                        <Box sx={{ width: 52, height: 52, borderRadius: "14px", bgcolor: card.bg, display: "flex", alignItems: "center", justifyContent: "center", color: card.color }}>
                          {card.icon}
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* User Distribution */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <Paper sx={{ p: 3, borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <Typography sx={{ color: "#f1f5f9", fontWeight: 700, fontSize: "16px", mb: 3 }}>Role Distribution</Typography>
                    {[
                      { label: "Students", count: studentCount, color: "#10b981", total: users.length },
                      { label: "Trainers", count: trainerCount, color: "#8b5cf6", total: users.length },
                      { label: "Admins", count: adminCount, color: "#f59e0b", total: users.length },
                    ].map((item) => (
                      <Box key={item.label} sx={{ mb: 2.5 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}>
                          <Typography sx={{ color: "#94a3b8", fontSize: "13px", fontWeight: 500 }}>{item.label}</Typography>
                          <Typography sx={{ color: "#f1f5f9", fontSize: "13px", fontWeight: 700 }}>{item.count} / {item.total}</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={item.total > 0 ? (item.count / item.total) * 100 : 0}
                          sx={{ height: 8, borderRadius: 4, bgcolor: "rgba(255,255,255,0.05)", "& .MuiLinearProgress-bar": { bgcolor: item.color, borderRadius: 4 } }}
                        />
                      </Box>
                    ))}
                  </Paper>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Paper sx={{ p: 3, borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", height: "100%" }}>
                    <Typography sx={{ color: "#f1f5f9", fontWeight: 700, fontSize: "16px", mb: 3 }}>System Status</Typography>
                    {[
                      { label: "Backend API", status: "Online", color: "#10b981" },
                      { label: "Database", status: "Connected", color: "#10b981" },
                      { label: "Authentication", status: "Active", color: "#10b981" },
                      { label: "Rate Limiting", status: "Enforced", color: "#10b981" },
                    ].map((item) => (
                      <Box key={item.label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography sx={{ color: "#94a3b8", fontSize: "13px" }}>{item.label}</Typography>
                        <Chip label={item.status} size="small" sx={{ bgcolor: "rgba(16,185,129,0.1)", color: item.color, border: "1px solid rgba(16,185,129,0.2)", fontWeight: 600, fontSize: "11px" }} />
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}

          {/* ── USER MANAGEMENT SECTION ── */}
          {activeSection === "users" && (
            <Paper sx={{ borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <Box sx={{ p: 3, borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                <Box>
                  <Typography sx={{ color: "#f1f5f9", fontWeight: 700, fontSize: "16px" }}>All Registered Users</Typography>
                  <Typography sx={{ color: "#475569", fontSize: "13px" }}>Manage roles and account status</Typography>
                </Box>
                <TextField
                  size="small"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#475569", fontSize: 18 }} /></InputAdornment> } }}
                  sx={{
                    width: 260,
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "rgba(255,255,255,0.05)", borderRadius: "10px", color: "#f1f5f9", fontSize: "13px",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                      "&.Mui-focused fieldset": { borderColor: "#0e71eb" },
                      "& input::placeholder": { color: "#475569" },
                    },
                  }}
                />
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ "& th": { bgcolor: "rgba(255,255,255,0.02)", color: "#475569", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid rgba(255,255,255,0.06)" } }}>
                      <TableCell>User</TableCell>
                      <TableCell>Username</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Change Role</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow
                        key={u._id}
                        sx={{ "& td": { borderBottom: "1px solid rgba(255,255,255,0.04)", color: "#cbd5e1", fontSize: "13px" }, "&:hover": { bgcolor: "rgba(255,255,255,0.02)" } }}
                      >
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: "#0e71eb", fontSize: "13px", fontWeight: 700 }}>
                              {(u.name || u.username || "U").charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0" }}>{u.name || "N/A"}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontFamily: "monospace" }}>{u.username}</TableCell>
                        <TableCell>
                          <Chip
                            label={u.role || "student"}
                            size="small"
                            sx={{
                              fontWeight: 700, fontSize: "11px", textTransform: "capitalize",
                              bgcolor: u.role === "admin" ? "rgba(245,158,11,0.12)" : u.role === "trainer" ? "rgba(139,92,246,0.12)" : "rgba(16,185,129,0.12)",
                              color: u.role === "admin" ? "#f59e0b" : u.role === "trainer" ? "#a78bfa" : "#34d399",
                              border: `1px solid ${u.role === "admin" ? "rgba(245,158,11,0.25)" : u.role === "trainer" ? "rgba(139,92,246,0.25)" : "rgba(16,185,129,0.25)"}`,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            size="small"
                            value={u.role || "student"}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            sx={{
                              minWidth: 120, fontSize: "13px", borderRadius: "8px",
                              color: "#cbd5e1", bgcolor: "rgba(255,255,255,0.05)",
                              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.1)" },
                              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.2)" },
                              "& .MuiSelect-icon": { color: "#475569" },
                            }}
                            MenuProps={{ PaperProps: { sx: { bgcolor: "#1e293b", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.08)" } } }}
                          >
                            <MenuItem value="student">Student</MenuItem>
                            <MenuItem value="trainer">Trainer</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Switch
                              checked={u.is_active !== false}
                              onChange={() => handleStatusToggle(u._id, u.is_active !== false)}
                              size="small"
                              sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": { color: "#10b981" },
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#10b981" },
                              }}
                            />
                            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: u.is_active !== false ? "#10b981" : "#ef4444" }}>
                              {u.is_active !== false ? "Active" : "Disabled"}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6, color: "#475569", borderBottom: "none" }}>
                          {search ? `No users matching "${search}"` : "No users found."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* ── ACTIVITY LOG SECTION ── */}
          {activeSection === "activity" && (
            <Paper sx={{ borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <Box sx={{ p: 3, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <Typography sx={{ color: "#f1f5f9", fontWeight: 700, fontSize: "16px" }}>Recent Activity Log</Typography>
                <Typography sx={{ color: "#475569", fontSize: "13px" }}>Latest system events and user actions</Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                {MOCK_ACTIVITY.map((item, i) => {
                  const colors = { register: "#10b981", role: "#8b5cf6", disable: "#ef4444", admin: "#0e71eb" };
                  const color = colors[item.type] || "#64748b";
                  return (
                    <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2, py: 2, borderBottom: i < MOCK_ACTIVITY.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color, flexShrink: 0, boxShadow: `0 0 6px ${color}` }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: "#e2e8f0", fontSize: "13px", fontWeight: 600 }}>{item.action}</Typography>
                        <Typography sx={{ color: "#475569", fontSize: "12px", fontFamily: "monospace" }}>{item.user}</Typography>
                      </Box>
                      <Typography sx={{ color: "#334155", fontSize: "12px", whiteSpace: "nowrap" }}>{item.time}</Typography>
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
}
