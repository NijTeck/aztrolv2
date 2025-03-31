import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import MsalProvider from './auth/MsalProvider';
import ProtectedRoute from './auth/ProtectedRoute';
import Navigation from './components/Navigation';
import LoginPage from './pages/LoginPage';
import NetworkPage from './pages/NetworkPage';
import PermissionsPage from './pages/PermissionsPage';
import CostPage from './pages/CostPage';
import PolicyPage from './pages/PolicyPage';

function App() {
  return (
    <MsalProvider>
      <Router>
        <div className="app-container">
          <AuthenticatedTemplate>
            <Navigation />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Navigate to="/network" replace />} />
                <Route path="/login" element={<Navigate to="/network" replace />} />
                <Route 
                  path="/network" 
                  element={
                    <ProtectedRoute>
                      <NetworkPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/permissions" 
                  element={
                    <ProtectedRoute>
                      <PermissionsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/cost" 
                  element={
                    <ProtectedRoute>
                      <CostPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/policy" 
                  element={
                    <ProtectedRoute>
                      <PolicyPage />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
          </AuthenticatedTemplate>
          
          <UnauthenticatedTemplate>
            <Routes>
              <Route path="*" element={<LoginPage />} />
            </Routes>
          </UnauthenticatedTemplate>
        </div>
      </Router>
    </MsalProvider>
  );
}

export default App;
