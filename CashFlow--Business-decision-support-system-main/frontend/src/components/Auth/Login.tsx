// src/components/Auth/Login.tsx
import React, { useState, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LoginCredentials } from '../../types';
import AuthLayout from './AuthLayout';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login: React.FC = () => {
  const { t, theme } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string>('');
  const { login } = useAuth();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.login(formData);
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      login(response.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    }
  };

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      bgcolor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
      '& fieldset': { borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)' },
      '&:hover fieldset': { borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)' },
      '&.Mui-focused fieldset': { borderColor: '#a855f7' },
    },
    '& .MuiInputLabel-root': { 
      color: theme === 'light' ? '#4A5568' : '#919EAB',
      '&.Mui-focused': { color: '#a855f7' },
    },
    '& .MuiOutlinedInput-input': { 
      color: theme === 'light' ? '#2D3748' : '#fff',
      '&::placeholder': { color: theme === 'light' ? '#4A5568' : '#919EAB' },
    },
  };

  return (
    <AuthLayout>
      <Box>
        <Typography
          variant="h3"
          sx={{
            color: theme === 'light' ? '#2D3748' : 'white',
            fontWeight: 600,
            mb: 1,
          }}
        >
          {t.login}
        </Typography>
        <Typography
          sx={{
            color: theme === 'light' ? '#4A5568' : '#919EAB',
            mb: 4,
          }}
        >
          Please enter your credentials to continue
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              backgroundColor: 'rgba(255,82,82,0.1)',
              color: '#ff5252',
              border: '1px solid rgba(255,82,82,0.2)',
            }}
          >
            {error}
          </Alert>
        )}

        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          noValidate
          sx={{
            '& .MuiTextField-root': { mb: 2.5 },
          }}
        >
          <TextField
            required
            fullWidth
            label="Username or Email"
            name="username"
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
            sx={textFieldStyle}
          />

          <TextField
            required
            fullWidth
            name="password"
            label={t.password}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: theme === 'light' ? '#4A5568' : '#919EAB' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={textFieldStyle}
          />

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{ 
                    color: theme === 'light' ? '#4A5568' : '#919EAB',
                    '&.Mui-checked': { color: '#a855f7' },
                  }}
                />
              }
              label={
                <Typography sx={{ color: theme === 'light' ? '#4A5568' : '#919EAB' }}>
                  Remember me
                </Typography>
              }
            />
            <Link
              to="/forgot-password"
              style={{
                color: '#a855f7',
                textDecoration: 'none',
              }}
            >
              Forgot Password?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              bgcolor: '#a855f7',
              color: '#fff',
              py: 1.5,
              mb: 2,
              fontSize: '1rem',
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#9333ea',
              },
            }}
          >
            {t.signIn}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: theme === 'light' ? '#4A5568' : '#919EAB', mb: 1 }}>
              Don't have an account?
            </Typography>
            <Link
              to="/register"
              style={{
                color: '#a855f7',
                textDecoration: 'none',
              }}
            >
              {t.registerNow}
            </Link>
          </Box>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default Login;