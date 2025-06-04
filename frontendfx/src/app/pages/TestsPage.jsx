import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import AddTestQuestion from '../components/tests/AddTestQuestion';

const TestsPage = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showNewTestForm, setShowNewTestForm] = useState(false);
  const [newTest, setNewTest] = useState({
    name: '',
    subject: '',
    ageGroup: '',
    description: ''
  });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await api.get('/api/tests');
      setTests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tests:', error);
      setLoading(false);
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/tests', newTest);
      setTests([...tests, response.data]);
      setShowNewTestForm(false);
      setNewTest({ name: '', subject: '', ageGroup: '', description: '' });
    } catch (error) {
      console.error('Error creating test:', error);
    }
  };

  const handleTestSelection = (test) => {
    setSelectedTest(test);
    setShowAddQuestion(true);
  };

  const handleQuestionAdded = () => {
    fetchTests(); // Refresh the test list
    setShowAddQuestion(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Learning Tests</h1>
        <button
          onClick={() => setShowNewTestForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Create New Test
        </button>
      </div>

      {/* New Test Form */}
      {showNewTestForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Test</h2>
          <form onSubmit={handleCreateTest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Name
              </label>
              <input
                type="text"
                value={newTest.name}
                onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={newTest.subject}
                onChange={(e) => setNewTest({ ...newTest, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Group
              </label>
              <input
                type="text"
                value={newTest.ageGroup}
                onChange={(e) => setNewTest({ ...newTest, ageGroup: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newTest.description}
                onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewTestForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Create Test
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Question Form */}
      {showAddQuestion && selectedTest && (
        <AddTestQuestion
          testId={selectedTest.id}
          onQuestionAdded={handleQuestionAdded}
        />
      )}

      {/* Tests Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Questions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tests.map((test) => (
                <tr key={test.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {test.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{test.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{test.ageGroup}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {test.questionCount || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      test.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {test.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleTestSelection(test)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Add Questions
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Delete
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
