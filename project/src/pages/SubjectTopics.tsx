import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PlusCircle, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

interface Topic {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

interface Subject {
  id: string;
  title: string;
}

export default function SubjectTopics() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchSubjectAndTopics();
    }
  }, [id]);

  async function fetchSubjectAndTopics() {
    try {
      // Fetch subject
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .single();

      if (subjectError) throw subjectError;
      setSubject(subjectData);

      // Fetch topics
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .eq('subject_id', id)
        .order('created_at', { ascending: true });

      if (topicsError) throw topicsError;
      setTopics(topicsData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!newTopic.trim()) return;

    try {
      const { error } = await supabase
        .from('topics')
        .insert([{
          subject_id: id,
          title: newTopic.trim(),
        }]);

      if (error) throw error;
      setNewTopic('');
      fetchSubjectAndTopics();
    } catch (err) {
      console.error('Error adding topic:', err);
      setError('Failed to add topic');
    }
  }

  async function handleToggleComplete(topicId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('topics')
        .update({ completed: !currentStatus })
        .eq('id', topicId);

      if (error) throw error;
      fetchSubjectAndTopics();
    } catch (err) {
      console.error('Error updating topic:', err);
      setError('Failed to update topic');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">Subject not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/subjects')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{subject.title}</h1>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleAddTopic} className="mt-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Enter topic name"
              className="flex-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Topic
            </button>
          </div>
        </form>

        {topics.length === 0 ? (
          <div className="mt-6 text-center text-gray-500">
            No topics yet. Add your first topic above!
          </div>
        ) : (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {topics.map((topic) => (
                <li key={topic.id}>
                  <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                    <div className="flex items-center">
                      <button
                        onClick={() => handleToggleComplete(topic.id, topic.completed)}
                        className={`mr-3 ${topic.completed ? 'text-green-500' : 'text-gray-400'}`}
                      >
                        {topic.completed ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </button>
                      <span className={`text-sm ${topic.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {topic.title}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
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
  );
}