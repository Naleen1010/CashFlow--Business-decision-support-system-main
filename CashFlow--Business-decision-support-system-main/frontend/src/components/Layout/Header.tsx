import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  InputBase,
  Badge,
  ButtonGroup,
  Button,
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Tooltip,
  Popover,
  Paper,
  MenuList,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Brightness4,
  Brightness7,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  InfoOutlined as InfoOutlinedIcon,
  ShoppingCart,
  Inventory,
  People,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { useSettings } from '../../contexts/SettingsContext';

interface HeaderProps {
  isCollapsed: boolean;
  drawerWidth: number;
}

const Header: React.FC<HeaderProps> = ({ isCollapsed, drawerWidth }) => {
  const { theme, toggleTheme, language, setLanguage, t } = useTheme();
  const { toggleFullscreen, isFullscreen } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchAnchorEl, setSearchAnchorEl] = useState<null | HTMLElement>(null);

  // Get current page title from path
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return t.nav.dashboard;
    return t.nav[path.toLowerCase() as keyof typeof t.nav] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  // Mock notifications
  const notifications = [
    {
      id: 1,
      title: 'New Order #1234',
      message: 'A new order has been placed for $156.00',
      time: '5 minutes ago',
      unread: true,
      type: 'success' as const,
      action: () => navigate('/orders/1234'),
    },
    {
      id: 2,
      title: 'Low Stock Alert',
      message: 'Product "Widget X" has only 5 units left',
      time: '1 hour ago',
      unread: true,
      type: 'warning' as const,
      action: () => navigate('/inventory'),
    },
    {
      id: 3,
      title: 'New Customer Registration',
      message: 'John Doe has created a new account',
      time: '2 hours ago',
      unread: false,
      type: 'info' as const,
      action: () => navigate('/customers'),
    },
  ];

  // Mock search suggestions
  const searchSuggestions = [
    { type: 'order', id: '1234', title: 'Order #1234', details: '$156.00 - Pending' },
    { type: 'product', id: 'p123', title: 'Widget X', details: '15 in stock' },
    { type: 'customer', id: 'c123', title: 'John Doe', details: 'Last order 2 days ago' },
  ];

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    setSearchAnchorEl(event.currentTarget);
  };

  const handleSearchClose = () => {
    setSearchAnchorEl(null);
  };

  const handleSearchItemClick = (item: any) => {
    switch (item.type) {
      case 'order':
        navigate(`/orders/${item.id}`);
        break;
      case 'product':
        navigate(`/inventory/${item.id}`);
        break;
      case 'customer':
        navigate(`/customers/${item.id}`);
        break;
    }
    handleSearchClose();
    setSearchValue('');
  };

  const getSearchIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart fontSize="small" />;
      case 'product':
        return <Inventory fontSize="small" />;
      case 'customer':
        return <People fontSize="small" />;
      default:
        return <SearchIcon fontSize="small" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon sx={{ color: '#10B981' }} />;
      case 'warning':
        return <ErrorOutlineIcon sx={{ color: '#F59E0B' }} />;
      case 'info':
        return <InfoOutlinedIcon sx={{ color: '#3B82F6' }} />;
      default:
        return <NotificationsIcon sx={{ color: '#a855f7' }} />;
    }
  };

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        bgcolor: theme === 'light' ? '#fff' : '#1E2022',
        borderBottom: '1px solid',
        borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
        transition: 'margin-left 0.3s ease',
      }}
    >
      <Box
        sx={{
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
        }}
      >
        {/* Page Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: theme === 'light' ? '#2D3748' : '#fff',
          }}
        >
          {getPageTitle()}
        </Typography>

        {/* Right Side Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Search */}
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
                borderRadius: '8px',
                px: 2,
                py: 1,
                width: '300px',
                transition: 'all 0.2s ease',
                border: '1px solid',
                borderColor: searchFocused
                  ? '#a855f7'
                  : theme === 'light'
                  ? 'rgba(0, 0, 0, 0.1)'
                  : 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <SearchIcon
                sx={{
                  color: searchFocused
                    ? '#a855f7'
                    : theme === 'light'
                    ? '#718096'
                    : '#919EAB',
                  mr: 1,
                }}
              />
              <InputBase
                placeholder={t.common.search}
                value={searchValue}
                onChange={handleSearchChange}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                sx={{
                  flex: 1,
                  color: theme === 'light' ? '#2D3748' : '#fff',
                  '& input::placeholder': {
                    color: theme === 'light' ? '#718096' : '#919EAB',
                    opacity: 1,
                  },
                }}
              />
            </Box>

            {/* Search Suggestions */}
            <Popover
              open={Boolean(searchAnchorEl) && searchValue.length > 0}
              anchorEl={searchAnchorEl}
              onClose={handleSearchClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              sx={{
                '& .MuiPopover-paper': {
                  width: '300px',
                  mt: 1,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                },
              }}
            >
              <MenuList>
                {searchSuggestions.map((item) => (
                  <MenuItem
                    key={item.id}
                    onClick={() => handleSearchItemClick(item)}
                    sx={{
                      py: 1,
                      px: 2,
                      '&:hover': {
                        bgcolor: theme === 'light' 
                          ? 'rgba(0, 0, 0, 0.04)' 
                          : 'rgba(255, 255, 255, 0.04)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: theme === 'light' ? '#718096' : '#919EAB' }}>
                      {getSearchIcon(item.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      secondary={item.details}
                      sx={{
                        '& .MuiTypography-root': {
                          color: theme === 'light' ? '#2D3748' : '#fff',
                        },
                        '& .MuiTypography-body2': {
                          color: theme === 'light' ? '#718096' : '#919EAB',
                        },
                      }}
                    />
                  </MenuItem>
                ))}
              </MenuList>
            </Popover>
          </Box>

          {/* Fullscreen Toggle Button - NEW */}
          <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
            <IconButton
              onClick={toggleFullscreen}
              sx={{
                bgcolor: theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
                '&:hover': {
                  bgcolor: theme === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
                },
              }}
            >
              {isFullscreen ? (
                <FullscreenExitIcon sx={{ color: theme === 'light' ? '#718096' : '#919EAB' }} />
              ) : (
                <FullscreenIcon sx={{ color: theme === 'light' ? '#718096' : '#919EAB' }} />
              )}
            </IconButton>
          </Tooltip>

          {/* Theme Toggle */}
          <Tooltip title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}>
            <IconButton
              onClick={toggleTheme}
              sx={{
                bgcolor: theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
                '&:hover': {
                  bgcolor: theme === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
                },
              }}
            >
              {theme === 'dark' ? (
                <Brightness7 sx={{ color: '#919EAB' }} />
              ) : (
                <Brightness4 sx={{ color: '#718096' }} />
              )}
            </IconButton>
          </Tooltip>

          {/* Language Selector */}
          <ButtonGroup
            variant="outlined"
            size="small"
            sx={{
              '& .MuiButton-root': {
                bgcolor: 'transparent',
                color: theme === 'light' ? '#718096' : '#919EAB',
                borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  bgcolor: theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
                },
                '&.active': {
                  bgcolor: '#a855f7',
                  color: '#fff',
                  borderColor: '#a855f7',
                },
              },
            }}
          >
            <Button
              onClick={() => setLanguage('en')}
              className={language === 'en' ? 'active' : ''}
            >
              EN
            </Button>
            <Button
              onClick={() => setLanguage('si')}
              className={language === 'si' ? 'active' : ''}
            >
              සිං
            </Button>
            <Button
              onClick={() => setLanguage('ta')}
              className={language === 'ta' ? 'active' : ''}
            >
              த
            </Button>
          </ButtonGroup>

          {/* Notifications */}
          <Tooltip title={t.common.notifications}>
            <IconButton
              onClick={() => setNotificationsOpen(true)}
              sx={{
                bgcolor: theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
                '&:hover': {
                  bgcolor: theme === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
                },
              }}
            >
              <Badge
                badgeContent={notifications.filter(n => n.unread).length}
                color="error"
              >
                <NotificationsIcon 
                  sx={{ color: theme === 'light' ? '#718096' : '#919EAB' }} 
                />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Notifications Drawer */}
      <Drawer
        anchor="right"
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: '380px' },
            bgcolor: theme === 'light' ? '#fff' : '#1E2022',
          },
        }}
      >
        {/* Drawer content (unchanged) */}
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ color: theme === 'light' ? '#2D3748' : '#fff', fontWeight: 600 }}>
                {t.common.notifications}
              </Typography>
              <IconButton onClick={() => setNotificationsOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <List sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                onClick={() => {
                  notification.action();
                  setNotificationsOpen(false);
                }}
                sx={{
                  bgcolor: notification.unread 
                    ? theme === 'light' ? 'rgba(168, 85, 247, 0.05)' : 'rgba(168, 85, 247, 0.1)'
                    : 'transparent',
                  borderRadius: '8px',
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: theme === 'light' 
                      ? 'rgba(168, 85, 247, 0.08)' 
                      : 'rgba(168, 85, 247, 0.15)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    sx={{ 
                      bgcolor: notification.unread
                        ? theme === 'light' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.2)'
                        : theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        color: theme === 'light' ? '#2D3748' : '#fff',
                        fontWeight: notification.unread ? 600 : 400,
                        mb: 0.5,
                      }}
                    >
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme === 'light' ? '#4A5568' : '#A0AEC0',
                          mb: 0.5,
                          lineHeight: 1.4,
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme === 'light' ? '#718096' : '#919EAB',
                          display: 'block',
                        }}
                      >
                        {notification.time}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>

          <Box 
            sx={{ 
              p: 2, 
              borderTop: '1px solid', 
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <Button
              fullWidth
              sx={{
                color: '#a855f7',
                '&:hover': {
                  bgcolor: theme === 'light' ? 'rgba(168, 85, 247, 0.08)' : 'rgba(168, 85, 247, 0.15)',
                },
              }}
            >
              Mark all as read
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Header;