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
    try {
      // First create questions
      const createdQuestions = await Promise.all(
        questions.map(question =>
          api.post('/api/quiz/questions', {
            ...question,
            category: testDetails.subject,
            ageGroup: testDetails.ageGroup
          })
        )
      );

      // Now create the test with created questions
      const testData = {
        questions: createdQuestions.map(q => q.data.id),
        title: testDetails.title,
        description: testDetails.description,
        subject: testDetails.subject,
        ageGroup: testDetails.ageGroup
      };

      await api.post('/api/quiz/create-test', testData);

      // Reset form
      setQuestions([]);
      setTestDetails({
        title: '',
        description: '',
        subject: '',
        ageGroup: ''
      });
      setCurrentStep(1);

    } catch (error) {
      console.error('Error creating test:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Test</h1>

      <div className="mb-8">
        <div className="flex justify-between mb-4">
          {[1, 2].map((step) => (
            <button
              key={step}
              onClick={() => setCurrentStep(step)}
              className={`flex-1 mx-2 py-2 px-4 rounded-lg ${
                currentStep === step ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {step === 1 ? 'Test Details' : 'Add Questions'}
            </button>
          ))}
        </div>

        {currentStep === 1 ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={testDetails.title}
                  onChange={handleTestDetailsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={testDetails.description}
                  onChange={handleTestDetailsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  name="subject"
                  value={testDetails.subject}
                  onChange={handleTestDetailsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Group
                </label>
                <select
                  name="ageGroup"
                  value={testDetails.ageGroup}
                  onChange={handleTestDetailsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
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
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Added Questions</h3>
                {questions.map((question, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-md mb-4 relative"
                  >
                    <button
                      onClick={() => handleRemoveQuestion(index)}
                      className="absolute top-2 right-2 text-red-500"
                    >
                      ×
                    </button>
                    <p className="font-medium">{question.questionText}</p>
                    <div className="mt-2 space-y-1">
                      {question.choices.map((choice, i) => (
                        <div
                          key={i}
                          className={`p-2 rounded ${
                            choice.isCorrect ? 'bg-green-100 text-green-800' : 'bg-gray-50'
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

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                disabled={questions.length === 0}
              >
                Create Test
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTest;
