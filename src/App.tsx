import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, RequireAuth } from "@/components/AuthProvider";
import Index from "@/pages/Index";
import Auth from "@/pages/auth/Auth";
import { ThemeProvider } from "./components/ThemeProvider";
import { Register } from "@/pages/auth/Register";
import { ProfileSettings } from "@/components/ProfileSettings";
import { MessengerLayout } from "@/components/MessengerLayout";
import { useState } from 'react';
import { ForgotPassword } from "@/pages/auth/ForgotPassword";
import AppSettings from "@/pages/AppSettings"; // Import AppSettings

function App() {
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [isAppSettingsOpen, setIsAppSettingsOpen] = useState(false);

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route element={<RequireAuth><MessengerLayout /></RequireAuth>}>
              <Route path="/" element={<Index />} />
              <Route path="/settings" element={
                <div className="flex items-center justify-center w-full h-full p-6">
                  <ProfileSettings
                    open={isProfileSettingsOpen}
                    onOpenChange={setIsProfileSettingsOpen}
                  />
                </div>
              } />
              {/* New route for AppSettings */}
              <Route path="/settings/app" element={
                <div className="flex items-center justify-center w-full h-full p-6">
                  <AppSettings
              open={isAppSettingsOpen}
              onOpenChange={setIsAppSettingsOpen}
            />
                </div>
              } />
            </Route>
          </Routes>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
