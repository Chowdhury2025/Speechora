import React, { useState, useEffect } from 'react';
import { QuestionForm } from './QuestionForm';
import api from '../../../utils/api';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../../atoms';

// Animation styles
const fadeIn = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const LoadingSpinner = () => (
  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent align-[-0.125em]" />
);

const CreateTest = () => {
  const user = useRecoilValue(userStates);
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [testDetails, setTestDetails] = useState({
    title: '',
    description: '',
    subject: '',
    ageGroup: '',
  });
  const [submissionStatus, setSubmissionStatus] = useState({
    loading: false,
    success: false,
    error: null
  });

  const ageGroups = [
    '3-5 years',
    '6-8 years',
    '9-11 years',
    '12-14 years',
    '15+ years'
  ];

  const subjects = [
    { name: 'Mathematics', slug: 'math' },
    { name: 'English', slug: 'english' },
    { name: 'Science', slug: 'science' },
    { name: 'Social Studies', slug: 'social_studies' },
    { name: 'Arts', slug: 'arts' },
    { name: 'General Knowledge', slug: 'general_knowledge' }
  ];

  const handleTestDetailsChange = (e) => {
    const { name, value } = e.target;
    setTestDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionAdd = (question) => {
    setQuestions(prev => [...prev, question]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionStatus({ loading: true, success: false, error: null });

    try {
      // Validate user state
      if (!user.userId) {
        setSubmissionStatus({
          loading: false,
          success: false,
          error: 'User not authenticated. Please log in.'
        });
        return;
      }

      // Validate test details
      if (!testDetails.title || !testDetails.subject || !testDetails.ageGroup) {
        setSubmissionStatus({
          loading: false,
          success: false,
          error: 'Please fill in all required test details: title, subject, and age group'
        });
        return;
      }

      // Validate questions
      if (questions.length === 0) {
        setSubmissionStatus({
          loading: false,
          success: false,
          error: 'Please add at least one question'
        });
        return;
      }

      // First create the test
      const testData = {
        title: testDetails.title.trim(),
        description: testDetails.description.trim(),
        subject: testDetails.subject.trim(),
        ageGroup: testDetails.ageGroup.trim(),
        userId: user.userId
      };

      console.log('Creating test with data:', testData);

      const testResponse = await api.post('/api/tests/tests', testData);

      if (!testResponse.data?.id) {
        throw new Error('Failed to create test: No test ID returned');
      }

      const testId = testResponse.data.id;
      
      // Then create all questions for this test
      const questionPromises = questions.map(question =>
        api.post('/api/tests/questions', {
          ...question,
          testId
        })
      );

      await Promise.all(questionPromises);

      setSubmissionStatus({
        loading: false,
        success: true,
        error: null
      });

      // Reset form
      setTestDetails({
        title: '',
        description: '',
        subject: '',
        ageGroup: ''
      });
      setQuestions([]);
      setCurrentStep(1);

    } catch (error) {
      console.error('Error creating test:', error);
      setSubmissionStatus({
        loading: false,
        success: false,
        error: error.response?.data?.details || error.response?.data?.error || error.message || 'Failed to create test'
      });
    }
  };
  return (
    <div className="max-w-4xl mx-auto p-6">
      <style>{fadeIn}</style>
      <h1 className="text-2xl font-bold text-duo-gray-700 mb-6">Create New Test</h1>

      {/* Loading Overlay */}
      {submissionStatus.loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#58cc02] border-r-transparent" />
            <p className="mt-4 text-lg font-semibold text-gray-700">Creating test...</p>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {submissionStatus.error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm" 
             style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="font-semibold text-red-700">Error</p>
          </div>
          <p className="mt-2 text-red-600">{submissionStatus.error}</p>
        </div>
      )}

      {submissionStatus.success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg shadow-sm"
             style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="font-semibold text-green-700">Success!</p>
          </div>
          <p className="mt-2 text-green-600">Test has been created successfully.</p>
        </div>
      )}

      <div className="mb-8">
        {/* Progress Steps */}
        <div className="flex justify-between mb-6">
          {[1, 2].map((step) => (
            <button
              key={step}
              onClick={() => setCurrentStep(step)}
              className={`flex-1 mx-2 py-3 px-4 rounded-xl font-bold transition-all duration-200 ${
                currentStep === step 
                ? 'bg-[#58cc02] text-white border-b-2 border-[#3c9202]' 
                : 'bg-[#e5f6ff] text-[#1cb0f6] hover:bg-[#d1f2ff]'
              }`}
            >
              {step === 1 ? 'Test Details' : 'Add Questions'}
            </button>
          ))}
        </div>

        {currentStep === 1 ? (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-duo-gray-600 mb-2">
                  Test Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={testDetails.title}
                  onChange={handleTestDetailsChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-duo-gray-600 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={testDetails.description}
                  onChange={handleTestDetailsChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-duo-gray-600 mb-2">
                  Subject
                </label>
                <select
                  name="subject"
                  value={testDetails.subject}
                  onChange={handleTestDetailsChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.slug} value={subject.slug}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-duo-gray-600 mb-2">
                  Age Group
                </label>
                <select
                  name="ageGroup"
                  value={testDetails.ageGroup}
                  onChange={handleTestDetailsChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
                  required
                >
                  <option value="">Select Age Group</option>
                  {ageGroups.map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="bg-[#58cc02] hover:bg-[#47b102] text-white font-bold py-3 px-8 
                    rounded-xl transition-colors duration-200 border-b-2 border-[#3c9202] 
                    hover:border-[#2e7502] focus:outline-none focus:ring-2 focus:ring-[#58cc02] 
                    focus:ring-offset-2 disabled:opacity-50"
                  disabled={!testDetails.title || !testDetails.subject || !testDetails.ageGroup}
                >
                  Next: Add Questions
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <QuestionForm onSubmit={handleQuestionAdd} />

            {questions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
                <h3 className="text-lg font-bold text-duo-gray-700 mb-4">Added Questions</h3>
                {questions.map((question, index) => (
                  <div
                    key={index}
                    className="p-4 border-2 border-slate-200 rounded-xl mb-4 relative hover:border-[#58cc02] transition-colors duration-200"
                  >
                    <button
                      onClick={() => handleRemoveQuestion(index)}
                      className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center 
                        text-duo-gray-500 hover:text-[#ff4b4b] rounded-full hover:bg-[#ffd4d4] 
                        transition-colors duration-200"
                    >
                      ×
                    </button>
                    <p className="font-bold text-duo-gray-700">{question.questionText}</p>
                    <div className="mt-3 space-y-2">
                      {question.choices.map((choice, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-xl ${
                            choice.isCorrect 
                            ? 'bg-[#d7ffb8] text-[#58cc02] font-bold' 
                            : 'bg-slate-50 text-duo-gray-600'
                          }`}
                        >
                          {choice.choiceText}
                          {choice.isCorrect && ' ✓'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 
                  px-8 rounded-xl transition-colors duration-200 focus:outline-none 
                  focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submissionStatus.loading}
                onClick={handleSubmit}
                className={`
                  flex items-center justify-center
                  min-w-[150px] py-3 px-6
                  rounded-2xl font-bold
                  transition-all duration-200
                  ${submissionStatus.loading 
                    ? 'bg-gray-300 border-b-2 border-gray-400 cursor-not-allowed text-gray-600'
                    : 'bg-[#58cc02] hover:bg-[#4caf02] text-white border-b-2 border-[#3c9202] hover:shadow-lg'
                  }
                `}
              >
                {submissionStatus.loading ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">Creating...</span>
                  </>
                ) : (
                  'Create Test'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTest;
