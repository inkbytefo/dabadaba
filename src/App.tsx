import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, RequireAuth } from "@/components/AuthProvider";
import Auth from "@/pages/auth/Auth";
import { ThemeProvider } from "./components/ThemeProvider";
import { Register } from "@/pages/auth/Register";
import { MessengerLayout } from "@/components/MessengerLayout";
import { ChatView } from "@/components/MessengerLayout/ChatView";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";
import AppSettings from "@/pages/AppSettings";
import { ProfileSettings } from "@/components/ProfileSettings";
import { useUIStore } from "@/store/ui";

function App() {
  const { modals, setModalState } = useUIStore();

  return (
    <div className="app-root">
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <Toaster position="top-center" richColors closeButton />
            <div className="h-full flex flex-col">
              <Routes>
                {/* Public Routes */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />

                {/* Protected Routes */}
                <Route element={<RequireAuth><MessengerLayout /></RequireAuth>}>
                  <Route index element={<ChatView />} />
                  <Route path="groups" element={<ChatView viewType="groups" />} />
                  <Route path="settings" element={
                    <div className="flex items-center justify-center w-full h-full p-6">
                      <ProfileSettings
                        open={modals.profileSettings}
                        onOpenChange={(open) => setModalState('profileSettings', open)}
                      />
                    </div>
                  } />
                  <Route path="settings/app" element={
                    <div className="flex items-center justify-center w-full h-full p-6">
                      <AppSettings
                        open={modals.appSettings}
                        onOpenChange={(open) => setModalState('appSettings', open)}
                      />
                    </div>
                  } />
                </Route>

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </div>
  );
}

export default App;
