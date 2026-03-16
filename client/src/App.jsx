import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import DatasetPage from './pages/DatasetPage';
import DatasetExplorer from './pages/DatasetExplorer';
import DatasetClean from './pages/DatasetClean';
import ModelBuilder from './pages/ModelBuilder';
import TrainingResults from './pages/TrainingResults';
import PredictionPage from './pages/PredictionPage';
import ExperimentHistory from './pages/ExperimentHistory';
import ModelsPage from './pages/ModelsPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

const AppContent = () => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/login" element={<AuthPage type="login" />} />
      <Route path="/register" element={<AuthPage type="register" />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/datasets" element={<PrivateRoute><DatasetPage /></PrivateRoute>} />
      <Route path="/datasets/:id" element={<PrivateRoute><DatasetExplorer /></PrivateRoute>} />
      <Route path="/datasets/:id/clean" element={<PrivateRoute><DatasetClean /></PrivateRoute>} />
      <Route path="/models" element={<PrivateRoute><ModelsPage /></PrivateRoute>} />
      <Route path="/models/build" element={<PrivateRoute><ModelBuilder /></PrivateRoute>} />
      <Route path="/models/results/:id" element={<PrivateRoute><TrainingResults /></PrivateRoute>} />
      <Route path="/predictions" element={<PrivateRoute><PredictionPage /></PrivateRoute>} />
      <Route path="/experiments" element={<PrivateRoute><ExperimentHistory /></PrivateRoute>} />
      
      {/* Settings Placeholder */}
      <Route path="/settings" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
