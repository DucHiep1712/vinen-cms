import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Auth from './pages/Auth';
import EventsTable from './features/events/EventsTable';
import EventForm from './features/events/EventForm';
import './App.css'
import Navbar from './components/ui/Navbar';
import NewsIndexPage from './pages/news/index';
import EventEditPage from './pages/events/[id]/edit';
import NewsCreatePage from './pages/news/new';
import NewsEditPage from './pages/news/[id]/edit';
import ProductsIndexPage from './pages/products/index';
import ProductsCreatePage from './pages/products/new';
import ProductsEditPage from './pages/products/[id]/edit';
import NewsTags from './pages/NewsTags';
import ProductTags from './pages/ProductTags';
import MembersIndexPage from './pages/members/index';
import ProductRequestsIndexPage from './pages/product-requests/index';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useEffect } from 'react';

// Navigation guard component
function NavigationGuard() {
  const { isAuthenticated, sessionTimeRemaining, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check session validity on every navigation
    if (isAuthenticated) {
      // Import and check actual session validity from localStorage
      import('./services/authApi').then(({ isLoggedIn }) => {
        if (!isLoggedIn()) {
          console.log('Session invalid during navigation, logging out...');
          logout();
          navigate('/auth', { replace: true });
        }
      });
    }
  }, [location.pathname, isAuthenticated, logout, navigate]);

  return null;
}

function AppRoutes() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/auth');

  // Protected Route Component (moved inside AppRoutes to access AuthProvider)
  function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, sessionTimeRemaining, logout } = useAuth();
    const navigate = useNavigate();
    
    // Check actual session validity on every render
    useEffect(() => {
      if (!isLoading && isAuthenticated) {
        import('./services/authApi').then(({ isLoggedIn }) => {
          if (!isLoggedIn()) {
            console.log('Session invalid in ProtectedRoute, logging out...');
            logout();
            navigate('/auth', { replace: true });
          }
        });
      }
    }, [isLoading, isAuthenticated, logout, navigate]);
    
    if (isLoading) {
      return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>;
    }
    
    // Check if session has expired or is invalid
    // Note: sessionTimeRemaining can be null initially when user first logs in
    if (sessionTimeRemaining !== null && sessionTimeRemaining <= 0) {
      // Session expired, redirect to login
      return <Navigate to="/auth" replace />;
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/auth" replace />;
    }
    
    return <>{children}</>;
  }
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation guard to check session on every route change */}
      <NavigationGuard />
      
      {!hideNavbar && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/events" element={
            <ProtectedRoute>
              <EventsTable />
            </ProtectedRoute>
          } />
          <Route path="/events/new" element={
            <ProtectedRoute>
              <EventForm />
            </ProtectedRoute>
          } />
          <Route path="/events/:id/edit" element={
            <ProtectedRoute>
              <EventForm />
            </ProtectedRoute>
          } />
          <Route path="/news" element={
            <ProtectedRoute>
              <NewsIndexPage />
            </ProtectedRoute>
          } />
          <Route path="/news/new" element={
            <ProtectedRoute>
              <NewsCreatePage />
            </ProtectedRoute>
          } />
          <Route path="/news/:id/edit" element={
            <ProtectedRoute>
              <NewsEditPage />
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute>
              <ProductsIndexPage />
            </ProtectedRoute>
          } />
          <Route path="/products/new" element={
            <ProtectedRoute>
              <ProductsCreatePage />
            </ProtectedRoute>
          } />
          <Route path="/products/:id/edit" element={
            <ProtectedRoute>
              <ProductsEditPage />
            </ProtectedRoute>
          } />
          <Route path="/news/tags" element={
            <ProtectedRoute>
              <NewsTags />
            </ProtectedRoute>
          } />
          <Route path="/products/tags" element={
            <ProtectedRoute>
              <ProductTags />
            </ProtectedRoute>
          } />
          <Route path="/members" element={
            <ProtectedRoute>
              <MembersIndexPage />
            </ProtectedRoute>
          } />
          <Route path="/product-requests" element={
            <ProtectedRoute>
              <ProductRequestsIndexPage />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/events" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
