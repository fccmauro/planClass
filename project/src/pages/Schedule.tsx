import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';

export default function Schedule() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Failed to sign out');
    }
  }

  return (
    <div className="min-h-screen bg-primary-950">
      <Navigation onSignOut={handleSignOut} />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-6">Agenda</h1>

          <div className="bg-primary-900 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center text-primary-400">
                Funcionalidade de agenda em breve!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}