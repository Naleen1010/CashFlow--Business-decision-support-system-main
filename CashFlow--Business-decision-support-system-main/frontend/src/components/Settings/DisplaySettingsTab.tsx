import React from 'react';
import {
  Box,
  Typography,
  Button
} from '@mui/material';
import { Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon } from '@mui/icons-material';
import { useSettings } from '../../contexts/SettingsContext';

interface DisplaySettingsTabProps {
  isEditing: boolean;
}

const DisplaySettingsTab: React.FC<DisplaySettingsTabProps> = ({ isEditing }) => {
  const { toggleFullscreen, isFullscreen } = useSettings();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Display Settings</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Adjust how content is displayed in the application
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
          Fullscreen Mode
        </Typography>
        
        <Button
          variant="outlined"
          startIcon={isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          onClick={toggleFullscreen}
          sx={{ mt: 1 }}
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        </Button>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Toggle fullscreen mode to maximize your workspace.
        </Typography>
      </Box>
    </Box>
  );
};

export default DisplaySettingsTab;