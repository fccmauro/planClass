import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Disciplinas from './pages/Disciplinas';
import DisciplinaTopics from './pages/DisciplinaTopics';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-primary-950">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/disciplinas" element={
              <PrivateRoute>
                <Disciplinas />
              </PrivateRoute>
            } />
            <Route path="/disciplinas/:id" element={
              <PrivateRoute>
                <DisciplinaTopics />
              </PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/" element={<Navigate to="/disciplinas" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;