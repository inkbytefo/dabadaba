import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Import dialog components

interface AppSettingsProps { // Define AppSettingsProps interface
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AppSettings: React.FC<AppSettingsProps> = ({ open, onOpenChange }) => { // Accept props
  return (
    <Dialog open={open} onOpenChange={onOpenChange}> // Wrap with Dialog
      <DialogContent className="glass-panel border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">Application Settings</DialogTitle>
        </DialogHeader>
        <div className="py-4">
    
      <p>This is the Application Settings page.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppSettings;