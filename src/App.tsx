import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, RequireAuth, useAuth } from "@/components/AuthProvider"; // Import useAuth hook
import Auth from "@/pages/auth/Auth";
import { ThemeProvider } from "./components/ThemeProvider";
import { Register } from "@/pages/auth/Register";
import { MessengerLayout } from "@/components/MessengerLayout";
import { ChatView } from "@/components/MessengerLayout/ChatView";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";
import Dashboard from "@/components/Dashboard";
import { AppLayout } from "@/components/AppLayout";
import { Settings } from "@/pages/Settings";
import { ErrorBoundary } from "@/components/ErrorBoundary"; // Import ErrorBoundary

function App() {
  const { isLoading: authIsLoading } = useAuth(); // Get isLoading from AuthProvider

  return (
    <div className="app-root">
      <ErrorBoundary> {/* Wrap Router with ErrorBoundary */}
        <Router>
          <ThemeProvider>
            <AuthProvider>
              <Toaster position="top-center" richColors closeButton />
              <Routes>
                {/* Public Routes */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />

                {/* Protected Routes - AppLayout ile sarmalanmış */}
                <Route element={<RequireAuth />}>
                  <Route element={<AppLayout isLoading={authIsLoading} />}> {/* Pass isLoading to AppLayout */}
                    {/* Ana Sayfa */}
                    <Route index element={<Dashboard />} />

                    {/* Mesajlaşma Routes */}
                    <Route path="messages" element={<MessengerLayout />}>
                      <Route index element={<ChatView />} />
                      <Route path="groups" element={<ChatView viewType="groups" />} />
                    </Route>

                    {/* Ayarlar */}
                    <Route path="settings" element={<Settings />} />

                    {/* Diğer Sayfalar */}
                    <Route path="notifications" element={
                      <div className="container max-w-7xl mx-auto p-6">
                        <h1 className="text-2xl font-semibold mb-4">Bildirimler</h1>
                        <p className="text-muted-foreground">Bu özellik yakında kullanıma açılacak...</p>
                      </div>
                    } />
                    
                    <Route path="calls" element={
                      <div className="container max-w-7xl mx-auto p-6">
                        <h1 className="text-2xl font-semibold mb-4">Aramalar</h1>
                        <p className="text-muted-foreground">Bu özellik yakında kullanıma açılacak...</p>
                      </div>
                    } />
                  </Route>
                </Route>

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AuthProvider>
          </ThemeProvider>
        </Router>
      </ErrorBoundary>
    </div>
  );
}

export default App;
