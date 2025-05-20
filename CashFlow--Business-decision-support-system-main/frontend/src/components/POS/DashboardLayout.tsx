import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  useMediaQuery,
  Tooltip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Dashboard,
  ShoppingCart,
  Inventory,
  Receipt,
  People,
  Description,
  Settings,
  HelpOutline,
  Menu as MenuIcon,
  LogoutOutlined,
  ChevronLeft,
  ChevronRight,
  Person,
} from '@mui/icons-material';

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 80;
const HEADER_HEIGHT = '70px';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { theme, t } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useMediaQuery('(max-width:1024px)');

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(false);
    }
  }, [isMobile]);

  const menuItems = [
    { text: t.nav.pos, icon: <ShoppingCart />, path: '/pos' },
    { text: t.nav.dashboard, icon: <Dashboard />, path: '/dashboard' },
    { text: t.nav.inventory, icon: <Inventory />, path: '/inventory' },
    { text: t.nav.orders, icon: <Receipt />, path: '/orders' },
    { text: t.nav.customers, icon: <People />, path: '/customers' },
    { text: t.nav.invoices, icon: <Description />, path: '/invoices' },
    { text: t.nav.settings, icon: <Settings />, path: '/settings' },
    { text: t.nav.help, icon: <HelpOutline />, path: '/help' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const drawer = (
    <Box 
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme === 'light' ? '#fff' : '#1E2022',
        position: 'relative',
      }}
    >
      {/* Logo Section */}
      <Box 
        sx={{
          height: HEADER_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          borderBottom: '1px solid',
          borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
        }}
      >
        {!isCollapsed && (
          <Typography
            variant="h6"
            sx={{
              color: theme === 'light' ? '#2D3748' : '#fff',
              fontWeight: 600,
            }}
          >
            {t.app.name}
          </Typography>
        )}
        {!isMobile && (
          <IconButton 
            onClick={() => setIsCollapsed(!isCollapsed)}
            sx={{
              ml: isCollapsed ? 'auto' : 0,
              color: theme === 'light' ? '#718096' : '#919EAB',
            }}
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        )}
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeft />
          </IconButton>
        )}
      </Box>

      {/* Navigation Items */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2,
          py: 3,
        }}
      >
        <List>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Tooltip 
                key={item.path}
                title={isCollapsed ? item.text : ''}
                placement="right"
              >
                <ListItem
                  button
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: '8px',
                    mb: 1,
                    height: 44,
                    position: 'relative',
                    overflow: 'hidden',
                    pl: isCollapsed ? 2.5 : 3,
                    '&::before': isActive ? {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 4,
                      height: 20,
                      bgcolor: '#a855f7',
                      borderRadius: '0 4px 4px 0',
                    } : {},
                    bgcolor: isActive
                      ? theme === 'light' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.2)'
                      : 'transparent',
                    color: isActive
                      ? '#a855f7'
                      : theme === 'light' ? '#4A5568' : '#919EAB',
                    '&:hover': {
                      bgcolor: theme === 'light' ? 'rgba(168, 85, 247, 0.05)' : 'rgba(168, 85, 247, 0.15)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: isCollapsed ? 36 : 40,
                    color: isActive
                      ? '#a855f7'
                      : theme === 'light' ? '#4A5568' : '#919EAB',
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {!isCollapsed && <ListItemText primary={item.text} />}
                </ListItem>
              </Tooltip>
            );
          })}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Profile Link */}
        <Tooltip title={isCollapsed ? t.userMenu.profile : ""} placement="right">
          <ListItem
            button
            onClick={() => handleNavigation('/profile')}
            sx={{
              borderRadius: '8px',
              mb: 1,
              height: 44,
              position: 'relative',
              pl: isCollapsed ? 2.5 : 3,
              color: location.pathname === '/profile'
                ? '#a855f7'
                : theme === 'light' ? '#4A5568' : '#919EAB',
              '&:hover': {
                bgcolor: theme === 'light' ? 'rgba(168, 85, 247, 0.05)' : 'rgba(168, 85, 247, 0.15)',
              },
            }}
          >
            <ListItemIcon sx={{
              minWidth: isCollapsed ? 36 : 40,
              color: 'inherit',
            }}>
              <Person />
            </ListItemIcon>
            {!isCollapsed && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 26,
                    height: 26,
                    fontSize: '0.875rem',
                    bgcolor: '#a855f7',
                    mr: 1,
                  }}
                >
                  {user?.first_name?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                    {user?.first_name} {user?.last_name}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: theme === 'light' ? '#718096' : '#A0AEC0',
                      display: 'block',
                      lineHeight: 1,
                    }}
                  >
                    {t.userMenu.profile}
                  </Typography>
                </Box>
              </Box>
            )}
          </ListItem>
        </Tooltip>

        {/* Logout Button */}
        <Tooltip title={isCollapsed ? t.userMenu.logout : ""} placement="right">
          <ListItem
            button
            onClick={handleLogout}
            sx={{
              borderRadius: '8px',
              height: 44,
              pl: isCollapsed ? 2.5 : 3,
              color: theme === 'light' ? '#E53E3E' : '#FC8181',
              '&:hover': {
                bgcolor: theme === 'light' ? 'rgba(229, 62, 62, 0.08)' : 'rgba(252, 129, 129, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{
              minWidth: isCollapsed ? 36 : 40,
              color: 'inherit',
            }}>
              <LogoutOutlined />
            </ListItemIcon>
            {!isCollapsed && <ListItemText primary={t.userMenu.logout} />}
          </ListItem>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile hamburger */}
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            left: 16,
            top: 16,
            zIndex: 1199,
            bgcolor: theme === 'light' ? '#fff' : '#1E2022',
            color: theme === 'light' ? '#4A5568' : '#919EAB',
            '&:hover': {
              bgcolor: theme === 'light' ? '#f7fafc' : '#2D3748',
            },
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { lg: isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH },
          flexShrink: { lg: 0 },
        }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', lg: 'none' },
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                borderRight: 'none',
                boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                backgroundImage: 'none',
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', lg: 'block' },
              '& .MuiDrawer-paper': {
                width: isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
                borderRight: 'none',
                boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                transition: 'width 0.3s ease',
                overflowX: 'hidden',
                backgroundImage: 'none',
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          width: { xs: '100%', lg: `calc(100% - ${isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH}px)` },
          transition: 'all 0.3s ease',
        }}
      >
        {/* Header */}
        <Header 
          isCollapsed={isCollapsed} 
          drawerWidth={isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH} 
        />

        {/* Content Area */}
        <Box
          sx={{
            flex: 1,
            p: 3,
            bgcolor: theme === 'light' ? '#F7FAFC' : '#171923',
            overflowY: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;