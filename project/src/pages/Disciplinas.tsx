import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';

interface Disciplina {
  id: string;
  title: string;
  created_at: string;
}

export default function Disciplinas() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [newDisciplina, setNewDisciplina] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    fetchDisciplinas();
  }, []);

  async function fetchDisciplinas() {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDisciplinas(data || []);
    } catch (err) {
      console.error('Error fetching disciplinas:', err);
      setError('Falha ao carregar disciplinas');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddDisciplina(e: React.FormEvent) {
    e.preventDefault();
    if (!newDisciplina.trim()) return;

    if (disciplinas.length >= 6) {
      setError('Você pode criar até 6 disciplinas');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const { data, error } = await supabase
        .from('subjects')
        .insert([{ 
          title: newDisciplina.trim(),
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setNewDisciplina('');
      setDisciplinas([data, ...disciplinas]);
    } catch (err: any) {
      console.error('Error adding disciplina:', err);
      setError(err.message || 'Falha ao adicionar disciplina');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      setError('Falha ao sair');
    }
  }

  return (
    <div className="min-h-screen bg-primary-950">
      <Navigation onSignOut={handleSignOut} />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-6">Minhas Disciplinas</h1>

          {error && (
            <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleAddDisciplina} className="mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                value={newDisciplina}
                onChange={(e) => setNewDisciplina(e.target.value)}
                placeholder="Nome da disciplina"
                className="flex-1 bg-primary-800 text-white placeholder-primary-400 border-primary-700 focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md sm:text-sm border-2"
              />
              <button
                type="submit"
                disabled={submitting || disciplinas.length >= 6}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-900 bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <PlusCircle className="h-4 w-4 mr-2" />
                )}
                Adicionar Disciplina
              </button>
            </div>
          </form>

          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
            </div>
          ) : disciplinas.length === 0 ? (
            <div className="text-center text-primary-400">
              Nenhuma disciplina ainda. Adicione sua primeira disciplina acima!
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {disciplinas.map((disciplina) => (
                <div
                  key={disciplina.id}
                  onClick={() => navigate(`/disciplinas/${disciplina.id}`)}
                  className="bg-primary-900 overflow-hidden shadow-lg rounded-lg cursor-pointer hover:bg-primary-800 transition-colors duration-200"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-white truncate">
                      {disciplina.title}
                    </h3>
                    <div className="mt-2 text-sm text-primary-400">
                      Criada em {new Date(disciplina.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}