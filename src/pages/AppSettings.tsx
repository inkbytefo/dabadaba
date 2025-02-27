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

const AppSettings: React.FC<AppSettingsProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1e1e1e]/95 backdrop-blur-lg rounded-lg border border-white/10 shadow-xl sm:max-w-[500px]">
        <DialogHeader className="border-b border-white/10 pb-4">
          <DialogTitle className="text-xl font-semibold text-white/90 tracking-wide">Application Settings</DialogTitle>
        </DialogHeader>
        <div className="py-6 px-4 space-y-6">
          {/* Appearance Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Appearance</h3>
            <div className="space-y-4 pl-2">
              <label className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-all duration-200">
                <span className="text-white/90">Dark Mode</span>
                <input type="checkbox" className="w-4 h-4 accent-blue-500" defaultChecked />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-all duration-200">
                <span className="text-white/90">Compact View</span>
                <input type="checkbox" className="w-4 h-4 accent-blue-500" />
              </label>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Notifications</h3>
            <div className="space-y-4 pl-2">
              <label className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-all duration-200">
                <span className="text-white/90">Message Notifications</span>
                <input type="checkbox" className="w-4 h-4 accent-blue-500" defaultChecked />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-all duration-200">
                <span className="text-white/90">Friend Requests</span>
                <input type="checkbox" className="w-4 h-4 accent-blue-500" defaultChecked />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-all duration-200">
                <span className="text-white/90">Group Activity</span>
                <input type="checkbox" className="w-4 h-4 accent-blue-500" defaultChecked />
              </label>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Privacy</h3>
            <div className="space-y-4 pl-2">
              <label className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-all duration-200">
                <span className="text-white/90">Show Online Status</span>
                <input type="checkbox" className="w-4 h-4 accent-blue-500" defaultChecked />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-all duration-200">
                <span className="text-white/90">Read Receipts</span>
                <input type="checkbox" className="w-4 h-4 accent-blue-500" defaultChecked />
              </label>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppSettings;
