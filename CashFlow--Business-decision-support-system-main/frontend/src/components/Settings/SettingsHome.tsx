import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs,
  Tab,
  Button,
  CircularProgress,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { useSettings } from '../../contexts/SettingsContext';
import { useTheme } from '../../contexts/ThemeContext';
import DisplaySettingsTab from './DisplaySettingsTab';

// Interface for tab panel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// TabPanel component for displaying tab content
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <div>{children}</div>
      )}
    </div>
  );
}

const SettingsHome: React.FC = () => {
  const { settings, loading, error, updateSettings } = useSettings();
  const { theme } = useTheme();

  // State
  const [currentTab, setCurrentTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      await updateSettings(formData);
      setSnackbar({
        open: true,
        message: 'Settings saved successfully',
        severity: 'success'
      });
      setFormData({});
      setIsEditing(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save settings',
        severity: 'error'
      });
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Show empty state if no settings
  if (!settings) {
    return (
      <Box p={3}>
        <Alert severity="info">No settings found</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: theme === 'dark' ? '#1E2022' : '#fff',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 3,
          borderBottom: '1px solid',
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }}
      >
        <Box>
          <Typography variant="h5">Business Settings</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your business configuration
          </Typography>
        </Box>
        <IconButton
          color="primary"
          onClick={() => isEditing ? handleSubmit() : setIsEditing(true)}
        >
          {isEditing ? <SaveIcon /> : <EditIcon />}
        </IconButton>
      </Box>

      {/* Tabs */}
      <Box>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="settings tabs"
          sx={{
            borderBottom: '1px solid',
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            '& .MuiTab-root': {
              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              fontWeight: 500,
              px: 3,
              '&.Mui-selected': {
                color: '#a855f7',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#a855f7',
            },
          }}
        >
          <Tab label="Business Details" />
          <Tab label="Invoice & Tax" />
          <Tab label="Notifications" />
          <Tab label="Display Settings" />
          <Tab label="Other Settings" />
        </Tabs>

        {/* Business Details Tab */}
        <TabPanel value={currentTab} index={0}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                label="Business Name"
                value={formData.business_name ?? settings.business_name}
                onChange={(e) => handleInputChange('business_name', e.target.value)}
                disabled={!isEditing}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Business Address"
                value={formData.business_address ?? settings.business_address ?? ''}
                onChange={(e) => handleInputChange('business_address', e.target.value)}
                disabled={!isEditing}
                multiline
                rows={3}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Contact Number"
                value={formData.contact_number ?? settings.contact_number ?? ''}
                onChange={(e) => handleInputChange('contact_number', e.target.value)}
                disabled={!isEditing}
              />
            </Box>
          </Box>
        </TabPanel>

        {/* Invoice & Tax Tab */}
        <TabPanel value={currentTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                label="Invoice Prefix"
                value={formData.invoice_prefix ?? settings.invoice_prefix ?? ''}
                onChange={(e) => handleInputChange('invoice_prefix', e.target.value)}
                disabled={!isEditing}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Default Tax Rate (%)"
                type="number"
                value={formData.default_tax_rate ?? settings.default_tax_rate}
                onChange={(e) => handleInputChange('default_tax_rate', parseFloat(e.target.value))}
                disabled={!isEditing}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                sx={{ mb: 3 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.include_company_logo ?? settings.include_company_logo}
                    onChange={(e) => handleInputChange('include_company_logo', e.target.checked)}
                    disabled={!isEditing}
                  />
                }
                label="Include Company Logo on Invoices"
              />
            </Box>
          </Box>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={currentTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Notification Preferences
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.low_stock_alerts ?? settings.low_stock_alerts}
                    onChange={(e) => handleInputChange('low_stock_alerts', e.target.checked)}
                    disabled={!isEditing}
                  />
                }
                label="Low Stock Alerts"
                sx={{ display: 'block', mb: 1 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.order_notifications ?? settings.order_notifications}
                    onChange={(e) => handleInputChange('order_notifications', e.target.checked)}
                    disabled={!isEditing}
                  />
                }
                label="Order Notifications"
                sx={{ display: 'block', mb: 1 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.email_notifications ?? settings.email_notifications}
                    onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
                    disabled={!isEditing}
                  />
                }
                label="Email Notifications"
                sx={{ display: 'block', mb: 1 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.sms_notifications ?? settings.sms_notifications}
                    onChange={(e) => handleInputChange('sms_notifications', e.target.checked)}
                    disabled={!isEditing}
                  />
                }
                label="SMS Notifications"
                sx={{ display: 'block', mb: 3 }}
              />

              <TextField
                fullWidth
                label="Low Stock Threshold"
                type="number"
                value={formData.low_stock_threshold ?? settings.low_stock_threshold}
                onChange={(e) => handleInputChange('low_stock_threshold', parseInt(e.target.value))}
                disabled={!isEditing}
                inputProps={{ min: 0 }}
                helperText="Set the quantity at which low stock alerts will trigger"
              />
            </Box>
          </Box>
        </TabPanel>

        {/* Display Settings Tab */}
        <TabPanel value={currentTab} index={3}>
          <DisplaySettingsTab isEditing={isEditing} />
        </TabPanel>

        {/* Other Settings Tab */}
        <TabPanel value={currentTab} index={4}>
          <Box sx={{ p: 3 }}>
            <TextField
              fullWidth
              label="Terms and Conditions"
              value={formData.terms_and_conditions ?? settings.terms_and_conditions ?? ''}
              onChange={(e) => handleInputChange('terms_and_conditions', e.target.value)}
              disabled={!isEditing}
              multiline
              rows={4}
              helperText="These terms will be displayed on relevant documents"
            />
          </Box>
        </TabPanel>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsHome;