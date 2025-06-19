import React, { useState } from 'react';
import { QuestionForm } from './QuestionForm';
import api from '../../../utils/api';

const CreateTest = () => {
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
      // Validate test details
      if (!testDetails.subject || !testDetails.ageGroup) {
        setSubmissionStatus({
          loading: false,
          success: false,
          error: 'Please select both subject and age group'
        });
        return;
      }

      const questionData = questions.map(question => ({
        ...question,
        category: testDetails.subject,
        ageGroup: testDetails.ageGroup
      }));

      // Log the request data for debugging
      console.log('Creating questions with data:', questionData);

      // Create questions sequentially to better handle errors
      const createdQuestions = [];
      for (let i = 0; i < questionData.length; i++) {
        try {
          const response = await api.post('/api/quiz/questions', questionData[i]);
          console.log(`Question ${i + 1} created:`, response.data);
          createdQuestions.push(response.data);
        } catch (error) {
          console.error(`Error creating question ${i + 1}:`, error);
          
          // Extract the error message
          const errorMessage = error.details || error.error || error.message || 'Unknown error';
          
          setSubmissionStatus({
            loading: false,
            success: false,
            error: `Error creating question ${i + 1}: ${errorMessage}`
          });
          return;
        }
      }

      // Now create the test with created questions
      const testData = {
        questions: createdQuestions.map(q => q.id),
        title: testDetails.title,
        description: testDetails.description,
        subject: testDetails.subject,
        ageGroup: testDetails.ageGroup
      };

      const response = await api.post('/api/quiz/create-test', testData);

      // Reset form
      setQuestions([]);
      setTestDetails({
        title: '',
        description: '',
        subject: '',
        ageGroup: ''
      });
      setCurrentStep(1);
      setSubmissionStatus({
        loading: false,
        success: true,
        error: null
      });

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSubmissionStatus(prev => ({ ...prev, success: false }));
      }, 3000);

    } catch (error) {
      console.error('Error creating test:', error);
      const errorMessage = error.details || error.error || error.message || 'Failed to create test';
      setSubmissionStatus({
        loading: false,
        success: false,
        error: errorMessage
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-duo-gray-700 mb-6">Create New Test</h1>

      {/* Status Messages */}
      {submissionStatus.error && (
        <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p className="font-bold">Error</p>
          <p>{submissionStatus.error}</p>
        </div>
      )}

      {submissionStatus.success && (
        <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
          <p className="font-bold">Success!</p>
          <p>Test has been created successfully.</p>
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
                onClick={handleSubmit}
                className={`bg-[#58cc02] hover:bg-[#47b102] text-white font-bold py-3 px-8 
                  rounded-xl transition-colors duration-200 border-b-2 border-[#3c9202] 
                  hover:border-[#2e7502] focus:outline-none focus:ring-2 focus:ring-[#58cc02] 
                  focus:ring-offset-2 disabled:opacity-50 ${submissionStatus.loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={questions.length === 0 || submissionStatus.loading}
              >
                {submissionStatus.loading ? 'Creating Test...' : 'Create Test'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTest;
