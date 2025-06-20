import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import CreateTest from '../components/tests/CreateTest';
import TestQuestionsModal from '../components/tests/TestQuestionsModal';

const TestsPage = () => {
  const [tests, setTests] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/tests/tests');
      if (Array.isArray(response.data)) {
        setTests(response.data);
      } else if (response.data.tests) {
        setTests(response.data.tests);
      } else {
        setTests([]);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
      setError(error.response?.data?.error || 'Failed to load tests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestCreated = () => {
    setShowCreateForm(false);
    fetchTests();
  };

  const handleStartTest = (testId) => {
    setSelectedTestId(testId);
    setShowQuestionsModal(true);
  };

  const handleCloseModal = () => {
    setShowQuestionsModal(false);
    setSelectedTestId(null);
  };

  const handleEditQuestion = (question) => {
    // TODO: Implement question editing
    console.log('Editing question:', question);
  };

  const handleStartActualTest = (testId) => {
    // TODO: Implement actual test taking
    console.log('Starting actual test:', testId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-error-text mb-4">{error}</div>
        <button
          onClick={fetchTests}
          className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-xl
            transition-colors duration-200 border-b-4 border-primary-dark hover:border-primary-pressed
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (showCreateForm) {
    return <CreateTest onCancel={() => setShowCreateForm(false)} onSuccess={handleTestCreated} />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-700">Tests</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-6 rounded-xl 
            transition-colors duration-200 border-b-4 border-primary-dark hover:border-primary-pressed 
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Create New Test
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!Array.isArray(tests) || tests.length === 0 ? (
          <div className="col-span-full text-center text-slate-600 p-8 bg-white rounded-2xl shadow-md">
            No tests available. Create your first test!
          </div>
        ) : (
          tests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-2xl shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow duration-200"
            >
              <h3 className="text-xl font-bold text-slate-700 mb-2">{test.title}</h3>
              <p className="text-slate-600 mb-4">{test.description}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-primary font-medium">{test.subject}</span>
                <span className="text-slate-500">{test.ageGroup}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    {test.questions?.length || 0} Questions
                  </span>
                  <button
                    onClick={() => handleStartTest(test.id)}
                    className="text-secondary hover:text-secondary-hover font-bold"
                  >
                    Start Test
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showQuestionsModal && (
        <TestQuestionsModal
          testId={selectedTestId}
          isOpen={showQuestionsModal}
          onClose={handleCloseModal}
          onEditQuestion={handleEditQuestion}
          onStartTest={handleStartActualTest}
        />
      )}
    </div>
  );
};

export default TestsPage;
