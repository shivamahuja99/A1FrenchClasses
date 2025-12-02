import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { HomePage, CoursesPage, LoginPage, SignupPage, ProfilePage } from './views';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSkeleton from './components/LoadingSkeleton/LoadingSkeleton';
import { useGetCurrentUserQuery } from './store/api/apiSlice';
import { setCredentials } from './store/slices/authSlice';
import './App.css';

// Component to initialize auth state
const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const accessToken = sessionStorage.getItem('access_token');

  const { data: userData, isLoading, error } = useGetCurrentUserQuery(undefined, {
    skip: !accessToken,
  });

  useEffect(() => {
    if (userData && accessToken) {
      const refreshToken = sessionStorage.getItem('refresh_token');
      dispatch(setCredentials({
        user: userData,
        access_token: accessToken,
        refresh_token: refreshToken
      }));
    }
  }, [userData, accessToken, dispatch]);

  // Handle error - if getCurrentUser fails after refresh attempts, clear tokens
  useEffect(() => {
    if (error && accessToken) {
      console.error('Failed to get current user:', error);
      // Clear invalid tokens
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('user');
    }
  }, [error, accessToken]);

  if (isLoading) {
    return <LoadingSkeleton variant="screen" />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
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
        </Routes>
      </AuthInitializer>
    </BrowserRouter>
  );
}

export default App;
