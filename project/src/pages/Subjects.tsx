import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PlusCircle, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Subject {
  id: string;
  title: string;
  created_at: string;
}

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    fetchSubjects();
  }, []);

  async function fetchSubjects() {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubjects(data || []);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSubject(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubject.trim()) return;

    try {
      setSubmitting(true);
      setError('');
      
      const { data, error } = await supabase
        .from('subjects')
        .insert([{ 
          title: newSubject.trim(),
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) {
        if (error.message.includes('subjects_limit')) {
          throw new Error('You can only create up to 10 subjects');
        }
        throw error;
      }

      setNewSubject('');
      setSubjects([data, ...subjects]);
    } catch (err: any) {
      console.error('Error adding subject:', err);
      setError(err.message || 'Failed to add subject');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      setError('Failed to sign out');
    }
  }

  return (
    <div className="min-h-screen bg-primary-950 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">My Subjects</h1>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-200 bg-primary-800 hover:bg-primary-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleAddSubject} className="mt-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Enter subject name"
              className="flex-1 bg-primary-800 text-white placeholder-primary-400 border-primary-700 focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md sm:text-sm border-2"
            />
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-900 bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4 mr-2" />
              )}
              Add Subject
            </button>
          </div>
        </form>

        {loading ? (
          <div className="mt-6 flex justify-center">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          </div>
        ) : subjects.length === 0 ? (
          <div className="mt-6 text-center text-primary-400">
            No subjects yet. Add your first subject above!
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                onClick={() => navigate(`/subjects/${subject.id}`)}
                className="bg-primary-900 overflow-hidden shadow-lg rounded-lg cursor-pointer hover:bg-primary-800 transition-colors duration-200"
              >
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-white truncate">
                    {subject.title}
                  </h3>
                  <div className="mt-2 text-sm text-primary-400">
                    Created {new Date(subject.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}