// src/contexts/SettingsContext.tsx - Simplified version

import React, { createContext, useState, useContext, useEffect } from 'react';
import { Settings, SettingsUpdateDTO } from '../types/settings.types';
import { settingsService } from '../services/settingsService';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (settings: SettingsUpdateDTO) => Promise<void>;
  refreshSettings: () => Promise<void>;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(!!document.fullscreenElement);
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Handle fullscreen changes
  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Add fullscreen event listener
  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const fetchSettings = async () => {
    // Don't fetch if not authenticated or still loading auth
    if (!isAuthenticated || authLoading) {
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting to fetch settings');
      
      setLoading(true);
      setError(null);
      const fetchedSettings = await settingsService.getSettings();
      
      // Ensure display settings exist with defaults if needed
      if (!fetchedSettings.display) {
        fetchedSettings.display = {
          displaySize: '100'
        };
      }
      
      setSettings(fetchedSettings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch settings';
      console.error('Settings Fetch Error:', err);
      setError(errorMessage);
      setSettings(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Auth status changed - Authenticated:', isAuthenticated, 'Loading:', authLoading);
    if (!authLoading) {
      fetchSettings();
    }
  }, [isAuthenticated, authLoading]);

  const updateSettings = async (updatedSettings: SettingsUpdateDTO) => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      setLoading(true);
      setError(null);
      const newSettings = await settingsService.updateSettings(updatedSettings);
      setSettings(newSettings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  return (
    <SettingsContext.Provider 
      value={{ 
        settings, 
        loading, 
        error, 
        updateSettings,
        refreshSettings,
        toggleFullscreen,
        isFullscreen
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};