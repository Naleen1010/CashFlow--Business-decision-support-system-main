// src/components/Dashboard/PredictionDiagnostics.tsx
import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Divider, 
  Grid, 
  Chip,
  Button,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import usePredictions from '../../hooks/usePredictions';

const PredictionDiagnostics: React.FC = () => {
  const { diagnostics, loading, error, hasFetched, fetchDiagnostics } = usePredictions();

  // Format date from ISO string
  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString();
    } catch (e) {
      return isoString;
    }
  };

  // Get status color based on prediction tier
  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'ml':
        return 'success';
      case 'basic':
        return 'info';
      default:
        return 'warning';
    }
  };

  // Get tier label
  const getTierLabel = (tier: string) => {
    switch(tier) {
      case 'ml':
        return 'ML-Powered';
      case 'basic':
        return 'Basic';
      default:
        return 'Not Available';
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchDiagnostics();
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Prediction System Status
          </Typography>
          <IconButton onClick={handleRefresh} disabled={loading.diagnostics} size="small">
            <RefreshIcon />
          </IconButton>
        </Box>

        {loading.diagnostics ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : !hasFetched.diagnostics ? (
          <Box 
            display="flex" 
            flexDirection="column" 
            justifyContent="center" 
            alignItems="center" 
            minHeight={200}
          >
            <Typography variant="body1" gutterBottom align="center">
              Click to check prediction system status
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />} 
              onClick={handleRefresh}
              sx={{ mt: 2 }}
            >
              Check Status
            </Button>
          </Box>
        ) : error.diagnostics ? (
          <Box sx={{ p: 2 }}>
            <Alert 
              severity="error" 
              action={
                <Button color="inherit" size="small" onClick={handleRefresh}>
                  Try Again
                </Button>
              }
            >
              Failed to load prediction diagnostics
            </Alert>
          </Box>
        ) : !diagnostics ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="info">
              No diagnostics information available
            </Alert>
          </Box>
        ) : (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Chip 
                label={diagnostics.status === 'success' ? 'System Ready' : 'Needs Attention'} 
                color={diagnostics.status === 'success' ? 'success' : 'warning'}
                size="small"
              />
              <Chip 
                label={getTierLabel(diagnostics.prediction_tier)} 
                color={getTierColor(diagnostics.prediction_tier)} 
                size="small"
              />
            </Box>
            
            <Alert severity={diagnostics.status === 'success' ? 'success' : 'info'} sx={{ mb: 3 }}>
              {diagnostics.message}
            </Alert>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Data Coverage
                </Typography>
                <Typography variant="body2" mt={1}>
                  {diagnostics.days_of_history} days of historical data
                  {diagnostics.earliest_date && diagnostics.latest_date && (
                    <> ({formatDate(diagnostics.earliest_date)} - {formatDate(diagnostics.latest_date)})</>
                  )}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Sales Records
                </Typography>
                <Typography variant="h6">
                  {diagnostics.sales_records.toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Products
                </Typography>
                <Typography variant="h6">
                  {diagnostics.unique_products.toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Categories
                </Typography>
                <Typography variant="h6">
                  {diagnostics.unique_categories.toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Items Sold
                </Typography>
                <Typography variant="h6">
                  {diagnostics.total_items_sold.toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictionDiagnostics;