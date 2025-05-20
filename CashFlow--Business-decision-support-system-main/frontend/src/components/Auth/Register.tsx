// src/components/Auth/Register.tsx
import React, { useState, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import AuthLayout from './AuthLayout';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  address?: string;
  phone?: string;
}

const Register: React.FC = () => {
  const { t, theme } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    try {
      // Register the business
      const { confirmPassword, ...registrationData } = formData;
      await api.register(registrationData);
      
      // After successful registration, login with the same credentials
      const loginResponse = await api.login({
        username: formData.email,
        password: formData.password
      });
      
      // Set the auth token and redirect
      login(loginResponse.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
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
          {t.register}
        </Typography>
        <Typography
          sx={{
            color: theme === 'light' ? '#4A5568' : '#919EAB',
            mb: 4,
          }}
        >
          Create your business account to get started
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
            label="Business Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            sx={textFieldStyle}
          />

          <TextField
            required
            fullWidth
            label={t.email}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            sx={textFieldStyle}
          />

          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            sx={textFieldStyle}
          />

          <TextField
            fullWidth
            label="Business Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            multiline
            rows={2}
            sx={textFieldStyle}
          />

          <TextField
            required
            fullWidth
            name="password"
            label={t.password}
            type={showPassword ? 'text' : 'password'}
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

          <TextField
            required
            fullWidth
            name="confirmPassword"
            label={t.confirmPassword}
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    sx={{ color: theme === 'light' ? '#4A5568' : '#919EAB' }}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={textFieldStyle}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              bgcolor: '#a855f7',
              color: '#fff',
              py: 1.5,
              mb: 2,
              mt: 1,
              fontSize: '1rem',
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#9333ea',
              },
            }}
          >
            {t.registerButton}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: theme === 'light' ? '#4A5568' : '#919EAB', mb: 1 }}>
              Already have an account?
            </Typography>
            <Link
              to="/login"
              style={{
                color: '#a855f7',
                textDecoration: 'none',
              }}
            >
              {t.loginNow}
            </Link>
          </Box>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default Register;