import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Paper,
  Alert,
  CircularProgress,
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Person,
  Add as AddIcon,
  Delete as DeleteIcon,
  PersonAdd,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Lock as LockIcon,
  Password as PasswordIcon
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  business_id: string;
}

interface UserFormData {
  username: string;
  email: string;
  password?: string;
  role: string;
}

interface PasswordChangeData {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const { theme, t } = useTheme();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // User dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userDialogMode, setUserDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    role: 'regular'
  });

  // Password dialog states
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordChangeMode, setPasswordChangeMode] = useState<'self' | 'other'>('self');
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // Menu for actions
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  
  // Profile form data
  const [profileFormData, setProfileFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });

  // Fetch users if admin
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    if (user?.role !== 'admin') return;
    
    setLoadingUsers(true);
    try {
      const response = await api.get<User[]>('/api/users');
      setUsers(response);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (!name) return;
    
    setUserFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log("Updating profile with:", profileFormData);
      await api.updateProfile(profileFormData);
      setSuccessMessage('Profile updated successfully');
      setSuccess(true);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Profile update error:", err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Password management functions
  const openPasswordDialog = (mode: 'self' | 'other', user?: User) => {
    setPasswordChangeMode(mode);
    setSelectedUser(user || null);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordDialogOpen(true);
  };

  const handlePasswordSubmit = async () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
  
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
  
    setLoading(true);
    setError('');
    
    try {
      if (passwordChangeMode === 'self') {
        // Current user changing their own password
        if (!passwordData.currentPassword) {
          throw new Error('Current password is required');
        }
        
        await api.changePassword(
          passwordData.currentPassword,
          passwordData.newPassword
        );
        setSuccessMessage('Password updated successfully');
      } else if (passwordChangeMode === 'other' && selectedUser) {
        // Admin changing another user's password
        await api.resetUserPassword(
          selectedUser.id,
          passwordData.newPassword
        );
        setSuccessMessage(`Password for ${selectedUser.username} updated successfully`);
      }
      
      setSuccess(true);
      setPasswordDialogOpen(false);
    } catch (err: any) {
      console.error("Password update error:", err);
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  // User management functions
  const openUserDialog = (mode: 'add' | 'edit', user?: User) => {
    setUserDialogMode(mode);
    
    if (mode === 'edit' && user) {
      setSelectedUser(user);
      setUserFormData({
        username: user.username,
        email: user.email,
        role: user.role
      });
    } else {
      setSelectedUser(null);
      setUserFormData({
        username: '',
        email: '',
        password: '',
        role: 'regular'
      });
    }
    
    setUserDialogOpen(true);
  };

  const handleUserDialogSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (userDialogMode === 'add') {
        // Validate required fields
        if (!userFormData.username || !userFormData.email || !userFormData.password) {
          throw new Error('Username, email, and password are required');
        }
        
        await api.post('/api/users', userFormData);
        setSuccessMessage('User added successfully');
      } else if (userDialogMode === 'edit' && selectedUser) {
        // When editing, don't send password if it's empty
        const updateData = { ...userFormData };
        if (!updateData.password) {
          delete updateData.password;
        }
        
        await api.put(`/api/users/${selectedUser.id}`, updateData);
        setSuccessMessage('User updated successfully');
      }
      
      setSuccess(true);
      setUserDialogOpen(false);
      fetchUsers(); // Refresh user list
    } catch (err: any) {
      console.error("User operation error:", err);
      setError(err.message || `Failed to ${userDialogMode} user`);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setLoading(true);
    try {
      await api.delete(`/api/users/${userToDelete.id}`);
      setSuccessMessage('User deleted successfully');
      setSuccess(true);
      setDeleteDialogOpen(false);
      fetchUsers(); // Refresh user list
    } catch (err: any) {
      console.error("Delete user error:", err);
      setError(err.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  // User action menu functions
  const openActionMenu = (event: React.MouseEvent<HTMLButtonElement>, userId: string) => {
    setActionMenuAnchorEl(event.currentTarget);
    setActiveUserId(userId);
  };

  const closeActionMenu = () => {
    setActionMenuAnchorEl(null);
    setActiveUserId(null);
  };

  const handleUserAction = (action: 'edit' | 'delete' | 'password') => {
    closeActionMenu();
    
    if (!activeUserId) return;
    
    const selectedUser = users.find(user => user.id === activeUserId);
    if (!selectedUser) return;
    
    if (action === 'edit') {
      openUserDialog('edit', selectedUser);
    } else if (action === 'delete') {
      openDeleteDialog(selectedUser);
    } else if (action === 'password') {
      openPasswordDialog('other', selectedUser);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        {t?.nav?.profile || 'My Profile'}
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Summary Card */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              height: '100%',
              boxShadow: theme === 'light' 
                ? '0 4px 12px rgba(0, 0, 0, 0.05)' 
                : '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  bgcolor: '#a855f7',
                  fontSize: '2.5rem',
                  mb: 2
                }}
              >
                {user?.username?.[0]?.toUpperCase() || <Person fontSize="large" />}
              </Avatar>
              
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {user?.username}
              </Typography>
              
              <Typography variant="body1" sx={{ color: theme === 'light' ? '#718096' : '#A0AEC0', mb: 3 }}>
                {user?.email}
              </Typography>
              
              <Typography variant="body2" sx={{ 
                color: theme === 'light' ? '#4A5568' : '#CBD5E0',
                bgcolor: theme === 'light' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.2)',
                px: 2,
                py: 0.5,
                borderRadius: 1,
                textTransform: 'capitalize',
                mb: 3
              }}>
                {user?.role || 'User'}
              </Typography>
              
              <Button
                variant="contained"
                startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                onClick={() => !isEditing && setIsEditing(true)}
                type={isEditing ? 'submit' : 'button'}
                form={isEditing ? 'profile-form' : undefined}
                sx={{
                  bgcolor: '#a855f7',
                  '&:hover': {
                    bgcolor: '#9333ea',
                  },
                  mb: 2
                }}
                disabled={loading}
                fullWidth
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : isEditing ? (
                  'Save Changes'
                ) : (
                  'Edit Profile'
                )}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<LockIcon />}
                onClick={() => openPasswordDialog('self')}
                sx={{
                  color: '#a855f7',
                  borderColor: '#a855f7',
                  '&:hover': {
                    borderColor: '#9333ea',
                  },
                }}
                fullWidth
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details Card */}
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 3,
              boxShadow: theme === 'light' 
                ? '0 4px 12px rgba(0, 0, 0, 0.05)' 
                : '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Account Information
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <form id="profile-form" onSubmit={handleProfileSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={profileFormData.username}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={profileFormData.email}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Business ID"
                    value={user?.business_id || ''}
                    disabled={true}
                    variant="filled"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Role"
                    value={user?.role || ''}
                    disabled={true}
                    variant="filled"
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>

      {/* Admin User Management Section */}
      {user?.role === 'admin' && (
        <Paper 
          sx={{ 
            p: 3, 
            mt: 3,
            boxShadow: theme === 'light' 
              ? '0 4px 12px rgba(0, 0, 0, 0.05)' 
              : '0 4px 12px rgba(0, 0, 0, 0.2)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              User Management
            </Typography>
            
            <Box>
              <Tooltip title="Refresh Users">
                <IconButton 
                  onClick={fetchUsers} 
                  sx={{ mr: 1 }}
                  disabled={loadingUsers}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => openUserDialog('add')}
                sx={{
                  bgcolor: '#a855f7',
                  '&:hover': {
                    bgcolor: '#9333ea',
                  },
                }}
              >
                Add User
              </Button>
            </Box>
          </Box>
          
          {loadingUsers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#a855f7' }} />
            </Box>
          ) : users.length === 0 ? (
            <Alert severity="info">No users found</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{user.role}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={(e) => openActionMenu(e, user.id)}
                          disabled={user.role === 'admin' && user.id !== user?.id} // Prevent actions on other admin users
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* User Action Menu */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={closeActionMenu}
      >
        <MenuItem onClick={() => handleUserAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleUserAction('password')}>
          <ListItemIcon>
            <PasswordIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Change Password</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleUserAction('delete')}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete User</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add/Edit User Dialog */}
      <Dialog 
        open={userDialogOpen} 
        onClose={() => setUserDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {userDialogMode === 'add' ? 'Add New User' : 'Edit User'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="username"
            label="Username"
            type="text"
            fullWidth
            variant="outlined"
            value={userFormData.username}
            onChange={handleUserFormChange}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={userFormData.email}
            onChange={handleUserFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="password"
            label={userDialogMode === 'add' ? "Password" : "Password (leave blank to keep unchanged)"}
            type="password"
            fullWidth
            variant="outlined"
            value={userFormData.password || ''}
            onChange={handleUserFormChange}
            sx={{ mb: 2 }}
            required={userDialogMode === 'add'}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="user-role-label">Role</InputLabel>
            <Select
              labelId="user-role-label"
              name="role"
              value={userFormData.role}
              label="Role"
              onChange={handleUserFormChange}
            >
              <MenuItem value="regular">Regular</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUserDialogSubmit} 
            variant="contained"
            disabled={loading}
            sx={{ 
              bgcolor: '#a855f7',
              '&:hover': {
                bgcolor: '#9333ea',
              }
            }}
          >
            {loading ? <CircularProgress size={24} /> : userDialogMode === 'add' ? 'Add User' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {passwordChangeMode === 'self' 
            ? 'Change Your Password' 
            : `Change Password for ${selectedUser?.username}`}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3, mt: 2 }}>
              {error}
            </Alert>
          )}
          
          {passwordChangeMode === 'self' && (
            <TextField
              margin="dense"
              name="currentPassword"
              label="Current Password"
              type="password"
              fullWidth
              variant="outlined"
              value={passwordData.currentPassword || ''}
              onChange={handlePasswordChange}
              sx={{ mb: 2, mt: 1 }}
              required
            />
          )}
          
          <TextField
            margin="dense"
            name="newPassword"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            sx={{ mb: 2 }}
            required
            helperText="Password must be at least 6 characters long"
          />
          
          <TextField
            margin="dense"
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            sx={{ mb: 2 }}
            required
            error={passwordData.newPassword !== passwordData.confirmPassword && !!passwordData.confirmPassword}
            helperText={
              passwordData.newPassword !== passwordData.confirmPassword && !!passwordData.confirmPassword
                ? "Passwords don't match"
                : ""
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handlePasswordSubmit} 
            variant="contained"
            disabled={loading || passwordData.newPassword !== passwordData.confirmPassword}
            sx={{ 
              bgcolor: '#a855f7',
              '&:hover': {
                bgcolor: '#9333ea',
              }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Update Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user {userToDelete?.username}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteUser} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        message={successMessage}
      />
    </Box>
  );
};

export default ProfilePage;