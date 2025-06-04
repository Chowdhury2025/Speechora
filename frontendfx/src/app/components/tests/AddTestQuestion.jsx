import React, { useState } from 'react';
import api from '../../../utils/api';

const AddTestQuestion = ({ testId, onQuestionAdded }) => {
  const [question, setQuestion] = useState({
    text: '',
    type: 'multiple_choice',
    difficulty: 'easy',
    subject: '',
    ageGroup: '',
    choices: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    explanation: ''
  });

  const handleChoiceChange = (index, field, value) => {
    const newChoices = [...question.choices];
    if (field === 'isCorrect') {
      // If making this choice correct, make all others incorrect
      newChoices.forEach(choice => choice.isCorrect = false);
    }
    newChoices[index] = { ...newChoices[index], [field]: value };
    setQuestion({ ...question, choices: newChoices });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/api/tests/${testId}/questions`, question);
      setQuestion({
        text: '',
        type: 'multiple_choice',
        difficulty: 'easy',
        subject: '',
        ageGroup: '',
        choices: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ],
        explanation: ''
      });
      onQuestionAdded(response.data);
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Add New Question</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Text
          </label>
          <textarea
            value={question.text}
            onChange={(e) => setQuestion({ ...question, text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            required
          />
        </div>

        {/* Subject and Age Group */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={question.subject}
              onChange={(e) => setQuestion({ ...question, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age Group
            </label>
            <input
              type="text"
              value={question.ageGroup}
              onChange={(e) => setQuestion({ ...question, ageGroup: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty
          </label>
          <select
            value={question.difficulty}
            onChange={(e) => setQuestion({ ...question, difficulty: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Multiple Choice Options */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Answer Choices
          </label>
          {question.choices.map((choice, index) => (
            <div key={index} className="flex items-center space-x-4">
              <input
                type="text"
                value={choice.text}
                onChange={(e) => handleChoiceChange(index, 'text', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Choice ${index + 1}`}
                required
              />
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={choice.isCorrect}
                  onChange={(e) => handleChoiceChange(index, 'isCorrect', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  required
                />
                <span className="text-sm text-gray-600">Correct</span>
              </label>
            </div>
          ))}
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanation (Optional)
          </label>
          <textarea
            value={question.explanation}
            onChange={(e) => setQuestion({ ...question, explanation: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            rows="2"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Question
        </button>
      </form>
    </div>
  );
};

export default AddTestQuestion;
