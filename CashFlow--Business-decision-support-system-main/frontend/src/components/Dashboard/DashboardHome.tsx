// src/components/Dashboard/DashboardHome.tsx
import React from 'react';
import { Box, Grid, Typography, Paper } from '@mui/material';
import PredictionsPanel from './PredictionsPanel';
import PredictionDiagnostics from './PredictionDiagnostics';

const DashboardHome: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Business Intelligence Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View sales predictions and system metrics to make data-driven decisions for your business.
        </Typography>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Top Selling Products Prediction Panel */}
        <Grid item xs={12} md={8}>
          <PredictionsPanel />
        </Grid>
        
        {/* Prediction System Diagnostics */}
        <Grid item xs={12} md={4}>
          <PredictionDiagnostics />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;