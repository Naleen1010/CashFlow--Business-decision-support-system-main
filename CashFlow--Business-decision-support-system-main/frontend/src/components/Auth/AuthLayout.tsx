// src/components/Auth/AuthLayout.tsx
import React from 'react';
import {
  Box,
  IconButton,
  ButtonGroup,
  Button,
  useMediaQuery,
  useTheme as useMuiTheme,
  Paper,
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

interface AuthLayoutProps {
  children: React.ReactNode;
  type?: 'login' | 'register';
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, type = 'login' }) => {
  const { theme, toggleTheme, language, setLanguage } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        background: theme === 'light' 
          ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' 
          : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      }}
    >
      {/* Left side - Form */}
      <Box
        sx={{
          flex: isMobile ? '1 1 100%' : '0 0 50%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          height: '100%',
        }}
      >
        {/* Theme and Language Controls */}
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            display: 'flex',
            gap: '0.75rem',
            zIndex: 1000,
          }}
        >
          <IconButton 
            onClick={toggleTheme} 
            sx={{ 
              color: theme === 'light' ? '#64748b' : '#94a3b8',
              bgcolor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              '&:hover': {
                bgcolor: theme === 'light' ? '#ffffff' : '#334155',
              },
            }}
          >
            {theme === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <ButtonGroup 
            variant="contained" 
            sx={{
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              '& .MuiButton-root': {
                minWidth: '40px',
                bgcolor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)',
                color: theme === 'light' ? '#64748b' : '#94a3b8',
                borderColor: theme === 'light' ? 'rgba(226, 232, 240, 0.8)' : 'rgba(51, 65, 85, 0.8)',
                '&:hover': {
                  bgcolor: theme === 'light' ? '#ffffff' : '#334155',
                },
                '&.active': {
                  bgcolor: '#a855f7',
                  color: '#fff',
                  borderColor: '#9333ea',
                },
              },
            }}
          >
            <Button onClick={() => setLanguage('en')} className={language === 'en' ? 'active' : ''}>
              EN
            </Button>
            <Button onClick={() => setLanguage('si')} className={language === 'si' ? 'active' : ''}>
              සිං
            </Button>
            <Button onClick={() => setLanguage('ta')} className={language === 'ta' ? 'active' : ''}>
              த
            </Button>
          </ButtonGroup>
        </Box>

        {/* Form Content */}
        <Box 
          sx={{ 
            width: '100%',
            maxWidth: '600px', // Increased from 480px
            mx: 'auto',
            height: '100%',
            display: 'flex',
            alignItems: type === 'login' ? 'center' : 'flex-start',
            pt: type === 'register' ? '80px' : 0,
            px: 4, // Increased horizontal padding
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              padding: '32px', // Increased padding
              borderRadius: '16px',
              background: theme === 'light' ? '#ffffff' : '#1E2022',
              boxShadow: theme === 'light'
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.12)',
              border: theme === 'light'
                ? '1px solid rgba(226, 232, 240, 0.8)'
                : '1px solid rgba(51, 65, 85, 0.8)',
              transform: 'scale(0.85)', // Slightly increased scale
              transformOrigin: type === 'login' ? 'center center' : 'top center',
              '& .MuiTextField-root': {
                mb: 2.5,
              },
              '& .MuiButton-root': {
                py: 1.5,
              },
            }}
          >
            {children}
          </Paper>
        </Box>
      </Box>

      {/* Right side - Logo */}
      {!isMobile && (
        <Box
          sx={{
            flex: '0 0 50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #000033 0%, #1a1a4d 100%)',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at center, rgba(130, 36, 245, 0.08) 0%, transparent 70%)',
            }
          }}
        >
          <Box
            component="img"
            src="/cashflow-logo.png"
            alt="CashFlow"
            sx={{
              width: '65%',
              maxWidth: '460px', // Increased from 420px
              height: 'auto',
              transform: 'scale(0.85)', // Matches form scale
              filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))',
              animation: 'float 6s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': {
                  transform: 'scale(0.85) translateY(0px)',
                  filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))',
                },
                '50%': {
                  transform: 'scale(0.85) translateY(-20px)',
                  filter: 'drop-shadow(0 20px 16px rgba(0, 0, 0, 0.2))',
                },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default AuthLayout;