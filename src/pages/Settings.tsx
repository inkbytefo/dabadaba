import React from 'react';
import { useUIStore } from '@/store/ui';
import { ProfileSettings } from '@/components/ProfileSettings';
import AppSettings from '@/pages/AppSettings';

export const Settings: React.FC = () => {
  const { modals, setModalState } = useUIStore();

  return (
    <div className="container max-w-7xl mx-auto p-6">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Ayarlar</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profil Ayarları */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Profil Ayarları</h2>
            <ProfileSettings
              open={modals.profileSettings}
              onOpenChange={(open) => setModalState('profileSettings', open)}
            />
          </div>

          {/* Uygulama Ayarları */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Uygulama Ayarları</h2>
            <AppSettings
              open={modals.appSettings}
              onOpenChange={(open) => setModalState('appSettings', open)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};