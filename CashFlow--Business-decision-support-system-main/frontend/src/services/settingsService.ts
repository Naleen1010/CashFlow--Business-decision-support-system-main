// src/services/settingsService.ts

import api from '../utils/api';
import { Settings, SettingsUpdateDTO } from '../types/settings.types';

export const settingsService = {
  async getSettings(): Promise<Settings> {
    try {
      console.log('Settings Service: Fetching settings');
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('No authenticated user found');
      }

      const user = JSON.parse(userStr);
      if (!user.business_id) {
        throw new Error('No business ID found');
      }

      console.log('Settings Service: Using business ID', user.business_id);
      const settings = await api.get<Settings>(`/api/settings/${user.business_id}`);
      
      // Ensure display settings are initialized
      if (!settings.display) {
        settings.display = {
          displaySize: '100'
        };
      }
      
      console.log('Settings Service: Settings fetched', settings);
      return settings;
    } catch (error) {
      console.error('Settings Service: Error fetching settings', error);
      throw error;
    }
  },

  async updateSettings(settings: SettingsUpdateDTO): Promise<Settings> {
    try {
      console.log('Settings Service: Updating settings', settings);
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('No authenticated user found');
      }

      const user = JSON.parse(userStr);
      if (!user.business_id) {
        throw new Error('No business ID found');
      }

      const updatedSettings = await api.put<Settings>(
        `/api/settings/${user.business_id}`,
        settings
      );
      console.log('Settings Service: Settings updated', updatedSettings);
      return updatedSettings;
    } catch (error) {
      console.error('Settings Service: Error updating settings', error);
      throw error;
    }
  }
};