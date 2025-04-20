import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  onSignOut: () => void;
}

export default function Navigation({ onSignOut }: NavigationProps) {
  return (
    <nav className="bg-primary-900 border-b border-primary-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <NavLink
              to="/disciplinas"
              className={({ isActive }) =>
                `inline-flex items-center px-4 py-2 text-sm font-medium ${
                  isActive
                    ? 'text-yellow-500 border-b-2 border-yellow-500'
                    : 'text-primary-200 hover:text-white'
                }`
              }
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Disciplinas
            </NavLink>

            <NavLink
              to="/schedule"
              className={({ isActive }) =>
                `inline-flex items-center px-4 py-2 text-sm font-medium ${
                  isActive
                    ? 'text-yellow-500 border-b-2 border-yellow-500'
                    : 'text-primary-200 hover:text-white'
                }`
              }
            >
              <Calendar className="h-5 w-5 mr-2" />
              Agenda
            </NavLink>
          </div>

          <button
            onClick={onSignOut}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-200 hover:text-white"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}