import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { HomePage, CoursesPage, LoginPage, SignupPage, ProfilePage, CourseDetailsPage, CartPage, ContactPage } from './views';
import CheckoutSuccess from './views/CheckoutPage/CheckoutSuccess';
import CheckoutCancel from './views/CheckoutPage/CheckoutCancel';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSkeleton from './components/LoadingSkeleton/LoadingSkeleton';
import { useGetCurrentUserQuery } from './store/api/apiSlice';
import { setCredentials, logout } from './store/slices/authSlice';
import './App.css';

// Component to initialize auth state
const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const accessToken = localStorage.getItem('access_token');

  const { data: userData, isLoading, error } = useGetCurrentUserQuery(undefined, {
    skip: !accessToken,
  });

  useEffect(() => {
    if (userData && accessToken) {
      const refreshToken = localStorage.getItem('refresh_token');
      dispatch(setCredentials({
        user: userData,
        access_token: accessToken,
        refresh_token: refreshToken
      }));
    }
  }, [userData, accessToken, dispatch]);

  // Handle error - if getCurrentUser fails after refresh attempts, clear tokens and state
  useEffect(() => {
    if (error && accessToken) {
      console.error('Failed to get current user:', error);
      dispatch(logout());
    }
  }, [error, accessToken, dispatch]);

  if (isLoading) {
    return <LoadingSkeleton variant="screen" />;
  }

  return children;
};

// Global scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthInitializer>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/contact-us" element={<ContactPage />} />
          <Route path="/courses/:id" element={<CourseDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/success"
            element={
              <ProtectedRoute>
                <CheckoutSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/cancel"
            element={
              <ProtectedRoute>
                <CheckoutCancel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthInitializer>
    </BrowserRouter>
  );
}

export default App;
