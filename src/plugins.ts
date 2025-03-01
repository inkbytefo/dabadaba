import React from 'react';

export interface Plugin {
  id: string;
  name: string;
  description?: string;
  component: React.ComponentType<any>;
  location: 'chat-view-top' | 'chat-view-bottom';
}

import { ChatView } from './components/MessengerLayout/ChatView';
import TranslatePlugin from './components/plugins/TranslatePlugin';

export const plugins: Plugin[] = [
  {
    id: 'translate-plugin',
    name: 'Translate Plugin',
    description: 'Adds translate button to chat view',
    component: TranslatePlugin,
    location: 'chat-view-top',
  },
];