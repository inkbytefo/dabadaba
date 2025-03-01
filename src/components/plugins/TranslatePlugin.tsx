import React from 'react';
import { Plugin } from '@/plugins';
import { Button } from '@/components/ui/button'; // Import Button component
import { Globe as TranslateIcon } from 'lucide-react'; // Import TranslateIcon

interface TranslatePluginProps {
  conversation: any; // Konuşma bilgisi (gerekirse)
}

const TranslatePlugin: React.FC<TranslatePluginProps> = ({ conversation }) => {
  return (
    <Button variant="ghost" size="icon">
      <TranslateIcon className="h-4 w-4" />
    </Button>
  );
};

export default TranslatePlugin;