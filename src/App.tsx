import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import BottomNav from "./components/BottomNav";
import HomeScreen from "./screens/HomeScreen";
import ClubDetailScreen from "./screens/ClubDetailScreen";
import FeedScreen from "./screens/FeedScreen";
import EventsScreen from "./screens/EventsScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import SearchScreen from "./screens/SearchScreen";
import ProfileScreen from "./screens/ProfileScreen";
import UserProfileScreen from "./screens/UserProfileScreen";
import SettingsScreen from "./screens/SettingsScreen";
import AboutScreen from "./screens/AboutScreen";
import ChatListScreen from "./screens/ChatListScreen";
import ChatRoomScreen from "./screens/ChatRoomScreen";
import DirectMessagesScreen from "./screens/DirectMessagesScreen";
import DirectChatScreen from "./screens/DirectChatScreen";
import AuthScreen from "./screens/AuthScreen";
import AdminScreen from "./screens/AdminScreen";
import CompetitionsScreen from "./screens/CompetitionsScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import DevLoginScreen from "./screens/DevLoginScreen";
import DevSetupScreen from "./screens/DevSetupScreen";
import DevPanelScreen from "./screens/DevPanelScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoutes = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  const location = useLocation();
  const hideBottomNav = location.pathname.startsWith('/chat/') || location.pathname.startsWith('/dm') || location.pathname === '/settings' || location.pathname === '/admin';

  return (
    <>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/feed" element={<FeedScreen />} />
        <Route path="/search" element={<SearchScreen />} />
        <Route path="/events" element={<EventsScreen />} />
        <Route path="/notifications" element={<NotificationsScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/chat" element={<ChatListScreen />} />
        <Route path="/chat/:roomId" element={<ChatRoomScreen />} />
        <Route path="/dm" element={<DirectMessagesScreen />} />
        <Route path="/dm/:otherId" element={<DirectChatScreen />} />
        <Route path="/user/:id" element={<UserProfileScreen />} />
        <Route path="/club/:id" element={<ClubDetailScreen />} />
        <Route path="/admin" element={<AdminScreen />} />
        <Route path="/competitions" element={<CompetitionsScreen />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideBottomNav && <BottomNav />}
    </>
  );
};

const AppRoutes = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/auth"
        element={session ? <Navigate to="/" replace /> : <AuthScreen />}
      />
      <Route path="/reset-password" element={<ResetPasswordScreen />} />
      <Route path="/dev-login" element={<DevLoginScreen />} />
      <Route path="/dev-setup" element={<DevSetupScreen />} />
      <Route path="/dev-panel" element={<DevPanelScreen />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
