import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HomePage, CoursesPage, LoginPage, SignupPage, ProfilePage } from './views';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSkeleton from './components/LoadingSkeleton/LoadingSkeleton';
import { useGetCurrentUserQuery } from './store/api/apiSlice';
import { setCredentials, selectAuthToken } from './store/slices/authSlice';
import './App.css';

// Component to initialize auth state
const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const token = useSelector(selectAuthToken);

  const { data: user, isLoading } = useGetCurrentUserQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (user && token) {
      dispatch(setCredentials({ user, token }));
    }
  }, [user, token, dispatch]);

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
