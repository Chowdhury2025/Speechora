import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, uploadService } from '../../../config';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../../atoms';

const ageGroups = [
  '3-5 years',
  '6-8 years',
  '9-11 years',
  '12-14 years',
  '15-17 years',
  '18+ years'
];

export default function CreateLesson() {
  const navigate = useNavigate();
  const user = useRecoilValue(userStates);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [lessonData, setLessonData] = useState({
    title: '',
    description: 'Default lesson description',
    subject: '',
    ageGroup: '',
    contentType: 'text',
    statement: '',
    contentDescription: '',
    optionType: 'text',
    options: ['', ''],
    optionDescriptions: ['', ''],
  });

  const handleInputChange = (field) => (event) => {
    setLessonData({ ...lessonData, [field]: event.target.value });
  };

  const handleOptionChange = (index) => (event) => {
    const newOptions = [...lessonData.options];
    newOptions[index] = event.target.value;
    setLessonData({ ...lessonData, options: newOptions });
  };

  const handleOptionDescriptionChange = (index) => (event) => {
    const newDescriptions = [...lessonData.optionDescriptions];
    newDescriptions[index] = event.target.value;
    setLessonData({ ...lessonData, optionDescriptions: newDescriptions });
  };

  const addOption = () => {
    setLessonData({
      ...lessonData,
      options: [...lessonData.options, ''],
      optionDescriptions: [...lessonData.optionDescriptions, ''],
    });
  };

  const removeOption = (index) => {
    const newOptions = lessonData.options.filter((_, i) => i !== index);
    const newDescriptions = lessonData.optionDescriptions.filter((_, i) => i !== index);
    setLessonData({ 
      ...lessonData, 
      options: newOptions,
      optionDescriptions: newDescriptions 
    });
  };

  const handleContentFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      uploadService.validateFile(file);
      const imageUrl = await uploadService.uploadFile(file, 'lessons');
      setLessonData(prev => ({
        ...prev,
        statement: imageUrl
      }));
    } catch (error) {
      console.error('Error uploading content image:', error);
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleOptionFileChange = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      uploadService.validateFile(file);
      const imageUrl = await uploadService.uploadFile(file, 'options');
      const newOptions = [...lessonData.options];
      newOptions[index] = imageUrl;
      setLessonData(prev => ({
        ...prev,
        options: newOptions
      }));
    } catch (error) {
      console.error('Error uploading option image:', error);
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!user?.userId) {
      setError('Please log in to create a lesson');
      setLoading(false);
      return;
    }

    try {
      // Basic validation
      if (!lessonData.title.trim()) throw new Error('Title is required');
      if (!lessonData.subject) throw new Error('Subject is required');
      if (!lessonData.ageGroup) throw new Error('Age group is required');
      if (!lessonData.statement.trim()) throw new Error('Lesson content is required');
      if (lessonData.options.some(option => !option.trim())) {
        throw new Error('All options must be filled out');
      }

      let finalLessonData = { ...lessonData };

      // Structure content
      if (lessonData.contentType === 'image_url' && lessonData.statement) {
        finalLessonData.statement = {
          type: 'image_url',
          content: lessonData.statement,
          description: lessonData.contentDescription || ''
        };
      } else {
        finalLessonData.statement = {
          type: 'text',
          content: lessonData.statement
        };
      }

      // Structure options
      if (lessonData.optionType === 'image_url') {
        finalLessonData.options = lessonData.options.map((option, index) => ({
          type: 'image_url',
          content: option,
          description: lessonData.optionDescriptions[index] || ''
        }));
      } else {
        finalLessonData.options = lessonData.options.map(option => ({
          type: 'text',
          content: option
        }));
      }

      const response = await axios.post(
        `${API_URL}/api/lessons`,
        {
          ...finalLessonData,
          userId: user.userId,
        }
      );

      console.log('Lesson created successfully:', response.data);
      navigate('/app/lessons');
    } catch (error) {
      console.error('Error creating lesson:', error);
      setError(error.response?.data?.details || error.response?.data?.error || error.message || 'Failed to create lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl border-2 border-slate-200 p-6">
      <h1 className="text-3xl font-bold mb-6 text-slate-700">
        Create New Lesson
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div 
            className="p-4 mb-6 bg-red-50 border-2 border-red-200 text-red-600 rounded-xl font-medium"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-700">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={lessonData.title}
                onChange={handleInputChange('title')}
                className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-green-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">
                Subject *
              </label>
              <select
                value={lessonData.subject}
                onChange={handleInputChange('subject')}
                className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-green-500 focus:outline-none"
                required
              >
                <option value="">Select a subject</option>
                <option value="wants_and_needs_expression">Wants and Needs Expression</option>
                <option value="action_words_and_verbs">Action Words and Verbs</option>
                <option value="what_questions">What Questions</option>
                <option value="where_questions">Where Questions</option>
                <option value="who_questions">Who Questions</option>
                {/* <option value="when_questions">When Questions</option> */}
                <option value="why_questions">Why Questions</option>
                {/* <option value="Choice_Questions">Choice Questions</option> */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">
                Age Group *
              </label>
              <select
                value={lessonData.ageGroup}
                onChange={handleInputChange('ageGroup')}
                className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-green-500 focus:outline-none"
                required
              >
                <option value="">Select an age group</option>
                {ageGroups.map(age => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description field removed from UI, default value is set in state */}
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-700">Lesson Content</h2>

          <div className="mb-4">
            <label className="block text-sm font-bold text-slate-600 mb-1">
              Content Type
            </label>
            <select
              value={lessonData.contentType}
              onChange={handleInputChange('contentType')}
              className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-green-500 focus:outline-none"
            >
              <option value="text">Text</option>
              <option value="image_url">Image</option>
            </select>
          </div>

          {lessonData.contentType === 'text' ? (
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">
                Lesson Content *
              </label>
              <textarea
                value={lessonData.statement}
                onChange={handleInputChange('statement')}
                rows={6}
                className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-green-500 focus:outline-none"
                required
                placeholder="Enter the main content of your lesson"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">
                  Upload Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleContentFileChange}
                  disabled={uploading}
                  className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-green-500 focus:outline-none"
                />
                {uploading && <p className="text-blue-600 text-sm mt-1">Uploading...</p>}
              </div>

              {lessonData.statement && (
                <div>
                  <img
                    src={lessonData.statement}
                    alt="Content preview"
                    className="max-w-md rounded border border-gray-200 mb-2"
                  />
                  <label className="block text-sm font-bold text-slate-600 mb-1">
                    Image Description
                  </label>
                  <textarea
                    value={lessonData.contentDescription}
                    onChange={handleInputChange('contentDescription')}
                    className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-green-500 focus:outline-none"
                    rows="3"
                    placeholder="Describe what's in this image"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Options Section */}
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-700">Answer Options</h2>

          <div className="mb-4">
            <label className="block text-sm font-bold text-slate-600 mb-1">
              Options Type
            </label>
            <select
              value={lessonData.optionType}
              onChange={handleInputChange('optionType')}
              className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-green-500 focus:outline-none"
            >
              <option value="text">Text</option>
              <option value="image_url">Image</option>
            </select>
          </div>

          <div className="space-y-4">
            {lessonData.options.map((option, index) => (
              <div key={index} className="border-2 border-slate-100 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-slate-600">
                    Option {index + 1} *
                  </label>
                  {lessonData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {lessonData.optionType === 'text' ? (
                  <input
                    type="text"
                    value={option}
                    onChange={handleOptionChange(index)}
                    className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-green-500 focus:outline-none"
                    required
                    placeholder="Enter text option"
                  />
                ) : (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleOptionFileChange(index, e)}
                      disabled={uploading}
                      className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-green-500 focus:outline-none"
                    />
                    {option && (
                      <div>
                        <img
                          src={option}
                          alt={`Option ${index + 1} preview`}
                          className="max-w-md h-24 object-contain rounded border border-gray-200 mb-2"
                        />
                        <textarea
                          value={lessonData.optionDescriptions[index]}
                          onChange={handleOptionDescriptionChange(index)}
                          className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-green-500 focus:outline-none"
                          rows="2"
                          placeholder="Describe what's in this image"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addOption}
            className="mt-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200"
          >
            Add Option
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-8 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Lesson...' : 'Create Lesson'}
          </button>
        </div>
      </form>
    </div>
  );
}
