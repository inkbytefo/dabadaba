import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNavigation } from './TopNavigation';
import { Skeleton } from './ui/skeleton'; // Import Skeleton
import { useTheme } from './ThemeProvider'; // Import useTheme hook
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  isLoading: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ isLoading }) => {
  const { theme } = useTheme(); // Use useTheme hook

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen relative", theme === 'dark' ? 'bg-[#1e1e1e] text-white' : 'bg-white text-black')}> {/* Apply theme styles */}
      {/* Dekoratif Arka Plan Efektleri */}
      <div className="fixed inset-0 z-0">
        {/* Sol üst köşe gradyanı */}
        <div className="absolute -left-[20%] -top-[20%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
        
        {/* Sağ alt köşe gradyanı */}
        <div className="absolute -right-[20%] -bottom-[20%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[120px]" />
        
        {/* Ortada gezinen gradyan */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-indigo-500/[0.03] blur-[120px] animate-pulse" />
      </div>

      {/* İçerik Katmanı */}
      <div className="relative z-10">
        <TopNavigation />
        
        {/* İçerik alanı - pt-16 ile TopNavigation'ın altından başlıyor */}
        <main className="pt-16 min-h-[calc(100vh-4rem)]">
          <div className="relative backdrop-blur-[2px] bg-black/5">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Alt Efekt Çizgileri */}
      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="fixed top-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
};