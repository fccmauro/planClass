import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import type { Subject, Topic } from '../types/database';
import { Loader2 } from 'lucide-react';

interface SubjectWithTopics extends Subject {
  topics: Topic[];
}

export default function Dashboard() {
  const [subjects, setSubjects] = useState<SubjectWithTopics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signOut } = useAuth();

  useEffect(() => {
    fetchSubjectsWithTopics();
  }, []);

  async function fetchSubjectsWithTopics() {
    try {
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select(`
          *,
          topics (*)
        `)
        .order('created_at', { ascending: false });

      if (subjectsError) throw subjectsError;
      setSubjects(subjectsData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Falha ao carregar dados');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleComplete(topicId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('topics')
        .update({ completed: !currentStatus })
        .eq('id', topicId);

      if (error) throw error;
      await fetchSubjectsWithTopics();
    } catch (err) {
      console.error('Error updating topic:', err);
      setError('Falha ao atualizar status do tópico');
    }
  }

  async function handleUpdateEvaluation(
    subjectId: string,
    evaluationId: string,
    updates: Partial<{ date: string; score: number; completed: boolean }>
  ) {
    try {
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) return;

      const evaluations = [...(subject.evaluations || [])];
      const evalIndex = evaluations.findIndex(e => e.id === evaluationId);
      
      if (evalIndex === -1) return;
      
      evaluations[evalIndex] = { ...evaluations[evalIndex], ...updates };

      const { error } = await supabase
        .from('subjects')
        .update({ evaluations })
        .eq('id', subjectId);

      if (error) throw error;
      await fetchSubjectsWithTopics();
    } catch (err) {
      console.error('Error updating evaluation:', err);
      setError('Falha ao atualizar avaliação');
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

  return (
    <div className="min-h-screen bg-primary-950">
      <Navigation onSignOut={handleSignOut} />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>

          {error && (
            <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {subjects.length === 0 ? (
            <div className="text-center text-primary-400">
              Nenhuma disciplina cadastrada. Vá para a página de{' '}
              <button
                onClick={() => navigate('/disciplinas')}
                className="text-yellow-500 hover:text-yellow-400 underline"
              >
                Disciplinas
              </button>{' '}
              para começar!
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="bg-primary-900 overflow-hidden shadow-lg rounded-lg"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-white mb-4">
                      {subject.title}
                    </h3>

                    <div className="space-y-3">
                      {subject.topics.map((topic) => (
                        <div
                          key={topic.id}
                          className="flex items-center justify-between"
                        >
                          <span className={`text-sm ${topic.completed ? 'text-primary-400 line-through' : 'text-white'}`}>
                            {topic.title}
                          </span>
                          <button
                            onClick={() => handleToggleComplete(topic.id, topic.completed)}
                            className={`p-1 rounded-full ${
                              topic.completed
                                ? 'bg-green-500/20 text-green-500'
                                : 'bg-primary-800 text-primary-400'
                            }`}
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-primary-200 mb-2">
                        Avaliações
                      </h4>
                      {subject.evaluations && subject.evaluations.length > 0 && subject.evaluations.map((evaluation) => (
                        <div
                          key={evaluation.id}
                          className="flex items-center space-x-4 mb-2"
                        >
                          <input
                            type="date"
                            value={evaluation.date}
                            onChange={(e) =>
                              handleUpdateEvaluation(subject.id, evaluation.id, {
                                date: e.target.value,
                              })
                            }
                            className="bg-primary-800 border-primary-700 text-white text-sm rounded"
                          />
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={evaluation.score}
                            onChange={(e) =>
                              handleUpdateEvaluation(subject.id, evaluation.id, {
                                score: parseFloat(e.target.value),
                              })
                            }
                            className="w-20 bg-primary-800 border-primary-700 text-white text-sm rounded"
                          />
                          <button
                            onClick={() =>
                              handleUpdateEvaluation(subject.id, evaluation.id, {
                                completed: !evaluation.completed,
                              })
                            }
                            className={`p-1 rounded-full ${
                              evaluation.completed
                                ? 'bg-green-500/20 text-green-500'
                                : 'bg-primary-800 text-primary-400'
                            }`}
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      {subject.evaluations && subject.evaluations.length > 0 && (
                        <div className="mt-2 text-sm text-primary-200">
                          Média:{' '}
                          {(
                            subject.evaluations.reduce(
                              (acc, curr) => acc + curr.score,
                              0
                            ) / subject.evaluations.length
                          ).toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center text-sm text-primary-400">
            Produzido por{' '}
            <a
              href="https://saintsolution.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-500 hover:text-yellow-400"
            >
              saintsolution.com.br
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}