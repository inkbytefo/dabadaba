import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, RequireAuth, useAuth } from "@/components/AuthProvider";
import Index from "@/pages/Index";
import { Auth } from "@/pages/auth/Auth";
import { Register } from "@/pages/auth/Register";

function LogoutButton() {
  const { logout, user } = useAuth();
  if (!user) return null;
  
  return (
    <button
      onClick={async () => {
        await logout();
      }}
      className="absolute top-4 right-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
    >
      Sign Out
    </button>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <LogoutButton />
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Index />
              </RequireAuth>
            }
          />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
