import React from 'react';
import { Plugin, plugins } from '@/plugins'; // Import plugins array

export const loadPlugins = async (): Promise<Plugin[]> => {
  // For now, return static plugins
  return plugins;
};