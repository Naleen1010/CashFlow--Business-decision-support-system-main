// src/components/Dashboard/PredictionsPanel.tsx
import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Tabs, 
  Tab, 
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Paper,
  Tooltip,
  Chip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import usePredictions from '../../hooks/usePredictions';

const PredictionsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { 
    topProducts, 
    loading, 
    error, 
    hasFetched,
    fetchTopProducts 
  } = usePredictions();

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle load or refresh button click
  const handleLoad = () => {
    // Don't force refresh on initial load
    fetchTopProducts(10, null, false);
  };

  // Handle force refresh button click (bypass cache)
  const handleForceRefresh = () => {
    // Force refresh to bypass cache
    fetchTopProducts(10, null, true);
  };

  // Get current prediction data based on active tab
  const getCurrentPredictions = () => {
    if (!topProducts?.predictions) return [];
    
    switch(activeTab) {
      case 0:
        return topProducts.predictions.daily || [];
      case 1:
        return topProducts.predictions.weekly || [];
      case 2:
        return topProducts.predictions.monthly || [];
      default:
        return [];
    }
  };

  // Get tab labels with item count
  const getTabLabel = (period) => {
    if (!topProducts?.predictions) return period;
    
    const count = topProducts.predictions[period.toLowerCase()]?.length || 0;
    return `${period} (${count})`;
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Top Selling Products
          </Typography>
          <Box>
            {hasFetched.topProducts && !loading.topProducts && (
              <Tooltip title="Force refresh (bypass cache)">
                <IconButton 
                  onClick={handleForceRefresh} 
                  size="small" 
                  sx={{ mr: 1 }}
                  color="primary"
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
            {!hasFetched.topProducts && (
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />} 
                onClick={handleLoad}
                size="small"
                disabled={loading.topProducts}
              >
                Load Data
              </Button>
            )}
          </Box>
        </Box>

        {loading.topProducts ? (
          <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1} p={3}>
            <CircularProgress />
          </Box>
        ) : !hasFetched.topProducts ? (
          <Box 
            display="flex" 
            flexDirection="column" 
            justifyContent="center" 
            alignItems="center" 
            flexGrow={1} 
            p={3}
          >
            <Typography variant="body1" gutterBottom align="center">
              Click "Load Data" to view sales predictions
            </Typography>
          </Box>
        ) : error.topProducts ? (
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" flexGrow={1} p={3}>
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              Unable to load predictions
            </Alert>
            <Button 
              variant="outlined" 
              onClick={handleLoad} 
              startIcon={<RefreshIcon />}
            >
              Try Again
            </Button>
          </Box>
        ) : topProducts && !topProducts.success ? (
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" flexGrow={1} p={3}>
            <Alert severity="warning" sx={{ mb: 2, width: '100%' }}>
              {topProducts.error || "No prediction data available"}
            </Alert>
            <Button 
              variant="outlined" 
              onClick={handleForceRefresh}
              startIcon={<RefreshIcon />}
            >
              Force Refresh
            </Button>
          </Box>
        ) : (
          <>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
              <Tab label={getTabLabel("Daily")} />
              <Tab label={getTabLabel("Weekly")} />
              <Tab label={getTabLabel("Monthly")} />
            </Tabs>
            
            {getCurrentPredictions().length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1} p={3}>
                <Typography variant="body2" color="text.secondary">
                  No prediction data available for this time period
                </Typography>
              </Box>
            ) : (
              <Box sx={{ mt: 2, flexGrow: 1, overflowY: 'auto' }}>
                {/* Display prediction data */}
                {getCurrentPredictions().map((item) => (
                  <Paper key={item.product_id} sx={{ p: 2, mb: 2, borderRadius: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1">{item.product_name}</Typography>
                      {item.current_stock === 0 && (
                        <Chip 
                          size="small" 
                          color="error" 
                          label="Out of Stock" 
                          icon={<WarningIcon />} 
                        />
                      )}
                    </Box>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography variant="body2" color="text.secondary">
                        Category: {item.category}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Price: ${item.price.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mt={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Predicted Sales</Typography>
                        <Typography variant="h6">{item.prediction}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Current Stock</Typography>
                        <Typography 
                          variant="h6" 
                          color={item.current_stock < item.prediction ? "error.main" : "success.main"}
                        >
                          {item.current_stock}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
            
            {topProducts?.timestamp && (
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                <Typography variant="caption" color="text.secondary">
                  {activeTab === 0 ? 'Daily' : activeTab === 1 ? 'Weekly' : 'Monthly'} forecast
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last updated: {new Date(topProducts.timestamp).toLocaleString()}
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictionsPanel;