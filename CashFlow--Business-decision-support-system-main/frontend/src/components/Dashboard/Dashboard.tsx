// src/components/Dashboard/Dashboard.tsx
import React from 'react';
import { Grid, Box, Typography, Paper } from '@mui/material';
import PredictionsPanel from './PredictionsPanel';
import PredictionDiagnostics from './PredictionDiagnostics';

const Dashboard: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Top Selling Products Prediction Panel */}
        <Grid item xs={12} lg={8}>
          <PredictionsPanel />
        </Grid>
        
        {/* Prediction System Diagnostics */}
        <Grid item xs={12} lg={4}>
          <PredictionDiagnostics />
        </Grid>
        
        {/* Add other dashboard widgets as needed */}
      </Grid>
    </Box>
  );
};

export default Dashboard;