import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import CreateTest from '../components/tests/CreateTest';

const TestsPage = () => {
  const [tests, setTests] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await api.get('/api/quiz/questions');
      setTests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tests:', error);
      setLoading(false);
    }
  };

  const handleTestCreated = () => {
    setShowCreateForm(false);
    fetchTests();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (showCreateForm) {
    return <CreateTest onCancel={() => setShowCreateForm(false)} onSuccess={handleTestCreated} />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-duo-gray-700">Tests</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-[#58cc02] hover:bg-[#47b102] text-white font-bold py-2 px-6 rounded-xl 
            transition-colors duration-200 border-b-2 border-[#3c9202] hover:border-[#2e7502] 
            focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2"
        >
          Create New Test
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Test Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Age Group
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Questions
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {tests.map((test) => (
                <tr key={test.id} className="hover:bg-slate-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-slate-700">
                      {test.questionText}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{test.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{test.ageGroup}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-sm font-semibold bg-[#e5f6ff] text-[#1cb0f6] rounded-full">
                      {test.choices?.length || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">
                      {test.createdBy?.username || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {/* TODO: Add edit functionality */}}
                      className="mr-4 text-sm font-bold text-[#1cb0f6] hover:text-[#0095d9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1cb0f6] focus:ring-offset-2 rounded-lg px-3 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {/* TODO: Add preview functionality */}}
                      className="text-sm font-bold text-[#58cc02] hover:text-[#47b102] transition-colors focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2 rounded-lg px-3 py-1"
                    >
                      Preview
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TestsPage;
