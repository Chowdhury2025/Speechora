import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';

const TestQuestionsModal = ({ testId, isOpen, onClose, onStartTest }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    if (isOpen && testId) {
      fetchQuestions();
    }
  }, [isOpen, testId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/tests/tests/${testId}`);
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError(error.response?.data?.error || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = async (question) => {
    setEditingQuestion(question);
    try {
      const updatedQuestion = {
        ...question,
        questionText: question.questionText,
        choices: question.choices.map((choice) => ({
          ...choice,
          choiceText: choice.choiceText,
          isCorrect: choice.isCorrect,
        })),
      };

      await api.put(`/api/tests/questions/${question.id}`, updatedQuestion);
      fetchQuestions(); // Refresh questions after edit
      setEditingQuestion(null);
    } catch (error) {
      console.error('Error updating question:', error);
      setError(error.response?.data?.error || 'Failed to update question');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-secondary-light">
          <h2 className="text-2xl font-bold text-secondary-dark">Test Questions</h2>
          <button
            onClick={onClose}
            className="text-secondary hover:text-secondary-hover transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
            </div>
          ) : error ? (
            <div className="bg-error-bg text-error-text p-4 rounded-xl text-center">
              {error}
            </div>
          ) : questions.length === 0 ? (
            <div className="text-slate-600 text-center p-4 bg-slate-50 rounded-xl">
              No questions available for this test.
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`bg-white rounded-xl p-6 shadow-md border-2 transition-all duration-200 ${
                    editingQuestion?.id === question.id
                      ? 'border-secondary'
                      : 'border-transparent hover:border-secondary-light'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-slate-700 flex items-center">
                      <span className="bg-secondary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                        {index + 1}
                      </span>
                      Question
                    </h3>
                    <button
                      onClick={() => handleEditQuestion(question)}
                      className="bg-secondary-light text-secondary hover:bg-secondary hover:text-white px-4 py-2 rounded-xl
                        transition-colors duration-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                    >
                      {editingQuestion?.id === question.id ? 'Save' : 'Edit'}
                    </button>
                  </div>

                  <p className="text-slate-700 mb-4 text-lg">{question.questionText}</p>

                  {question.choices && (
                    <div className="space-y-3">
                      {question.choices.map((choice) => (
                        <div
                          key={choice.id}
                          className={`p-4 rounded-xl font-medium transition-colors duration-200 ${
                            choice.isCorrect
                              ? 'bg-success-bg text-success-text border-2 border-success-border'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {choice.choiceText}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-white flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-3 text-slate-600 hover:text-slate-800 font-bold rounded-xl
              hover:bg-slate-100 transition-colors duration-200"
          >
            Close
          </button>
          {questions.length > 0 && (
            <button
              onClick={() => onStartTest?.(testId)}
              className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-xl 
                transition-colors duration-200 border-b-4 border-primary-dark hover:border-primary-pressed
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Start Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestQuestionsModal;
