import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PlusCircle, ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';

interface Topic {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

interface Disciplina {
  id: string;
  title: string;
}

export default function DisciplinaTopics() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [disciplina, setDisciplina] = useState<Disciplina | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchDisciplinaAndTopics();
    }
  }, [id]);

  async function fetchDisciplinaAndTopics() {
    try {
      const { data: disciplinaData, error: disciplinaError } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .single();

      if (disciplinaError) throw disciplinaError;
      setDisciplina(disciplinaData);

      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .eq('subject_id', id)
        .order('created_at', { ascending: true });

      if (topicsError) throw topicsError;
      setTopics(topicsData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Falha ao carregar dados');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!newTopic.trim()) return;

    try {
      setSubmitting(true);
      setError('');

      const { data, error } = await supabase
        .from('topics')
        .insert([{
          subject_id: id,
          title: newTopic.trim(),
        }])
        .select()
        .single();

      if (error) {
        if (error.message.includes('topics_limit')) {
          throw new Error('Você pode criar até 20 assuntos por disciplina');
        }
        throw error;
      }

      setNewTopic('');
      setTopics([...topics, data]);
    } catch (err: any) {
      console.error('Error adding topic:', err);
      setError(err.message || 'Falha ao adicionar assunto');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleComplete(topicId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('topics')
        .update({ completed: !currentStatus })
        .eq('id', topicId);

      if (error) throw error;
      
      setTopics(topics.map(topic => 
        topic.id === topicId 
          ? { ...topic, completed: !currentStatus }
          : topic
      ));
    } catch (err) {
      console.error('Error updating topic:', err);
      setError('Falha ao atualizar status do assunto');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-950">
        <Navigation onSignOut={handleSignOut} />
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!disciplina) {
    return (
      <div className="min-h-screen bg-primary-950">
        <Navigation onSignOut={handleSignOut} />
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-primary-400">
              Disciplina não encontrada
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-950">
      <Navigation onSignOut={handleSignOut} />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/disciplinas')}
              className="mr-4 text-primary-200 hover:text-primary-100"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-3xl font-bold text-white">{disciplina.title}</h1>
          </div>

          {error && (
            <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleAddTopic} className="mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Nome do assunto"
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
                Adicionar Assunto
              </button>
            </div>
          </form>

          {topics.length === 0 ? (
            <div className="text-center text-primary-400">
              Nenhum assunto ainda. Adicione seu primeiro assunto acima!
            </div>
          ) : (
            <div className="bg-primary-900 shadow overflow-hidden sm:rounded-lg">
              <ul className="divide-y divide-primary-800">
                {topics.map((topic) => (
                  <li key={topic.id}>
                    <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleToggleComplete(topic.id, topic.completed)}
                          className={`mr-3 ${topic.completed ? 'text-green-500' : 'text-primary-400'}`}
                        >
                          {topic.completed ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <XCircle className="h-5 w-5" />
                          )}
                        </button>
                        <span className={`text-sm ${topic.completed ? 'text-primary-400 line-through' : 'text-white'}`}>
                          {topic.title}
                        </span>
                      </div>
                      <div className="text-sm text-primary-400">
                        {new Date(topic.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}