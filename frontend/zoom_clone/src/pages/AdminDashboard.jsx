import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Switch,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
  IconButton
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contents/AuthContents";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { getAllUsersApi, updateUserRoleStatusApi, userRole, currentUser } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsersApi();
      setUsers(data || []);
    } catch (err) {
      console.error("Fetch users error:", err);
      setSnackbar({ open: true, message: "Failed to load users", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRoleStatusApi(userId, { role: newRole });
      setSnackbar({ open: true, message: "Role updated successfully!", severity: "success" });
      fetchUsers();
    } catch (err) {
      console.error("Update role error:", err);
      setSnackbar({ open: true, message: "Failed to update role", severity: "error" });
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await updateUserRoleStatusApi(userId, { is_active: !currentStatus });
      setSnackbar({ open: true, message: "Status updated successfully!", severity: "success" });
      fetchUsers();
    } catch (err) {
      console.error("Update status error:", err);
      setSnackbar({ open: true, message: "Failed to update status", severity: "error" });
    }
  };

  const studentCount = users.filter(u => u.role === "student").length;
  const trainerCount = users.filter(u => u.role === "trainer").length;
  const adminCount = users.filter(u => u.role === "admin").length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6f8", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={() => navigate("/home")} color="primary">
              <ArrowBackIcon />
            </IconButton>
            <SecurityIcon color="primary" sx={{ fontSize: 36 }} />
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Admin Master Control Console
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchUsers} disabled={loading}>
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Analytics Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Students</Typography>
                  <Typography variant="h4" fontWeight="bold">{studentCount}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <SchoolIcon color="secondary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Trainers</Typography>
                  <Typography variant="h4" fontWeight="bold">{trainerCount}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <SupervisorAccountIcon color="error" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Admins</Typography>
                  <Typography variant="h4" fontWeight="bold">{adminCount}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* User Management Table */}
        <Paper sx={{ borderRadius: 3, boxShadow: 3, overflow: "hidden" }}>
          <Box sx={{ p: 3, borderBottom: "1px solid #e0e0e0" }}>
            <Typography variant="h6" fontWeight="bold">
              User Access & Role Management (RBAC)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage user roles, activate/deactivate accounts, and control system privileges.
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#fafafa" }}>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Username</strong></TableCell>
                  <TableCell><strong>Current Role</strong></TableCell>
                  <TableCell><strong>Change Role</strong></TableCell>
                  <TableCell><strong>Account Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u._id} hover>
                    <TableCell>{u.name || "N/A"}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.role || "student"}
                        color={
                          u.role === "admin" ? "error" : u.role === "trainer" ? "secondary" : "default"
                        }
                        size="small"
                        sx={{ textTransform: "capitalize", fontWeight: "bold" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={u.role || "student"}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        sx={{ minWidth: 120 }}
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
                          color="success"
                        />
                        <Typography variant="body2" color={u.is_active !== false ? "success.main" : "text.secondary"}>
                          {u.is_active !== false ? "Active" : "Disabled"}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

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
