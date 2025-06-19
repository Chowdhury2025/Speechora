import React, { useState } from 'react';

const isValidUrl = (urlString) => {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
};

export const QuestionForm = ({ onSubmit }) => {
  const [question, setQuestion] = useState({
    questionType: 'TEXT',
    questionText: '',
    questionMediaUrl: '',
    choices: [
      { choiceType: 'TEXT', choiceText: '', choiceMediaUrl: '', isCorrect: false },
      { choiceType: 'TEXT', choiceText: '', choiceMediaUrl: '', isCorrect: false },
      { choiceType: 'TEXT', choiceText: '', choiceMediaUrl: '', isCorrect: false },
      { choiceType: 'TEXT', choiceText: '', choiceMediaUrl: '', isCorrect: false }
    ]
  });

  const handleQuestionTypeChange = (e) => {
    const type = e.target.value;
    setQuestion(prev => ({
      ...prev,
      questionType: type,
      questionText: type === 'TEXT' ? prev.questionText : '',
      questionMediaUrl: type !== 'TEXT' ? prev.questionMediaUrl : ''
    }));
  };

  const handleChoiceChange = (index, field, value) => {
    const newChoices = [...question.choices];
    if (field === 'choiceType') {
      newChoices[index] = {
        ...newChoices[index],
        [field]: value,
        choiceText: value === 'TEXT' ? newChoices[index].choiceText : '',
        choiceMediaUrl: value !== 'TEXT' ? newChoices[index].choiceMediaUrl : ''
      };
    } else if (field === 'isCorrect') {
      // Only one correct answer allowed
      newChoices.forEach((choice, i) => {
        choice.isCorrect = i === index;
      });
    } else {
      newChoices[index] = {
        ...newChoices[index],
        [field]: value
      };
    }
    setQuestion(prev => ({ ...prev, choices: newChoices }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(question);
    // Reset form
    setQuestion({
      questionType: 'TEXT',
      questionText: '',
      questionMediaUrl: '',
      choices: [
        { choiceType: 'TEXT', choiceText: '', choiceMediaUrl: '', isCorrect: false },
        { choiceType: 'TEXT', choiceText: '', choiceMediaUrl: '', isCorrect: false },
        { choiceType: 'TEXT', choiceText: '', choiceMediaUrl: '', isCorrect: false },
        { choiceType: 'TEXT', choiceText: '', choiceMediaUrl: '', isCorrect: false }
      ]
    });
  };
  const isValid = () => {
    // Check if we have valid question content based on type
    const hasQuestionContent = question.questionType === 'TEXT' 
      ? question.questionText.trim() !== ''
      : question.questionMediaUrl?.trim() !== '';

    // Check if all choices are properly filled out based on their type
    const hasValidChoices = question.choices.every(choice => {
      if (choice.choiceType === 'TEXT') {
        return choice.choiceText?.trim() !== '';
      } else if (choice.choiceType === 'IMAGE') {
        return choice.choiceMediaUrl?.trim() !== '' && 
          (choice.choiceMediaUrl.endsWith('.jpg') || 
           choice.choiceMediaUrl.endsWith('.png') || 
           choice.choiceMediaUrl.endsWith('.gif') ||
           choice.choiceMediaUrl.endsWith('.jpeg'));
      } else if (choice.choiceType === 'VIDEO') {
        return choice.choiceMediaUrl?.trim() !== '' &&
          (choice.choiceMediaUrl.includes('youtube.com/') || 
           choice.choiceMediaUrl.includes('youtu.be/') ||
           choice.choiceMediaUrl.endsWith('.mp4'));
      }
      return false;
    });

    // Check if exactly one choice is marked as correct
    const correctAnswers = question.choices.filter(choice => choice.isCorrect);
    const hasOneCorrectAnswer = correctAnswers.length === 1;

    // Check if all URLs are valid when required
    const hasValidUrls = question.questionType !== 'TEXT' 
      ? isValidUrl(question.questionMediaUrl)
      : true;

    return hasQuestionContent && hasValidChoices && hasOneCorrectAnswer && hasValidUrls;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">Add New Question</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Type
          </label>
          <select
            value={question.questionType}
            onChange={handleQuestionTypeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="TEXT">Text</option>
            <option value="IMAGE">Image</option>
            <option value="VIDEO">Video</option>
          </select>
        </div>

        {question.questionType === 'TEXT' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text
            </label>
            <textarea
              value={question.questionText}
              onChange={(e) => setQuestion(prev => ({ ...prev, questionText: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
              required
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media URL ({question.questionType.toLowerCase()})
            </label>
            <input
              type="url"
              value={question.questionMediaUrl}
              onChange={(e) => setQuestion(prev => ({ ...prev, questionMediaUrl: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        )}

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Answer Choices
          </label>
          {question.choices.map((choice, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center space-x-4">
                <select
                  value={choice.choiceType}
                  onChange={(e) => handleChoiceChange(index, 'choiceType', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="TEXT">Text</option>
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                </select>
                {choice.choiceType === 'TEXT' ? (
                  <input
                    type="text"
                    value={choice.choiceText}
                    onChange={(e) => handleChoiceChange(index, 'choiceText', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder={`Choice ${index + 1}`}
                    required
                  />
                ) : (
                  <input
                    type="url"
                    value={choice.choiceMediaUrl}
                    onChange={(e) => handleChoiceChange(index, 'choiceMediaUrl', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder={`${choice.choiceType.toLowerCase()} URL`}
                    required
                  />
                )}
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
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isValid()}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            Add Question
          </button>
        </div>
      </form>
    </div>
  );
};
