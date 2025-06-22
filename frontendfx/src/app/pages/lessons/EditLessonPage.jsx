import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../config';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../../atoms';
import { r2Service } from '../../../config/cloudflare';

const steps = ['Basic Information', 'Content', 'Options', 'Review'];

export default function EditLesson() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useRecoilValue(userStates);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tempImagePreviews, setTempImagePreviews] = useState({
    content: null,
    options: []
  });

  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    subject: '',
    ageGroup: '',
    statement: '',
    contentType: 'text', // 'text' or 'image_url'
    options: [],
    optionTypes: [] // array of 'text' or 'image_url' for each option
  });

  const handleInputChange = (name) => (e) => {
    const { value } = e.target;
    setLessonData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (e, index) => {
    const newOptions = [...lessonData.options];
    newOptions[index] = e.target.value;
    setLessonData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleAddOption = () => {
    setLessonData(prev => ({
      ...prev,
      options: [...prev.options, ''],
      optionTypes: [...prev.optionTypes, 'text']
    }));
  };

  const handleRemoveOption = (index) => {
    setLessonData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
      optionTypes: prev.optionTypes.filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    const fetchLesson = async () => {      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/lessons/${id}`);
        const lesson = response.data;
        
        setLessonData({
          ...lesson,
          contentType: lesson.contentType || 'text',
          optionTypes: lesson.optionTypes || lesson.options.map(() => 'text')
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching lesson:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    if (id) {
      fetchLesson();
    }
  }, [id]);

  const validateStep = async () => {
    try {      // Map step names to backend expected values
      const stepToScreen = {
        'Basic Information': 'basic-info',
        'Content': 'content',
        'Options': 'options',
        'Review': 'review'
      };
      
      const response = await axios.post(`${API_URL}/api/lessons/validate`, {
        state: { currentScreen: stepToScreen[steps[activeStep]] },
        data: lessonData,
      });      // Always advance to the next step when validation succeeds
      setActiveStep((prevStep) => prevStep + 1);
      return true;
    } catch (error) {
      setError(error.response?.data?.details || 'Validation failed');
      return false;
    }
  };

  const handleNext = async () => {
    if (await validateStep()) {
      if (activeStep === steps.length - 1) {
        await handleSubmit();
      } else {
        setActiveStep((prevStep) => prevStep + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };
  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!user?.userId) {
      setError('User ID is required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const lessonPayload = {
        ...lessonData,
        userId: user.userId
      };

      await axios.put(`${API_URL}/api/lessons/${id}`, lessonPayload);
      navigate('/app/lessons');
    } catch (error) {
      console.error('Error updating lesson:', error);
      setError(error.response?.data?.message || 'Failed to save lesson changes');
      setIsSaving(false);
    }
  };  const renderStepContent = (step) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading lesson...</span>
        </div>
      );
    }
    
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={lessonData.title}
                onChange={handleInputChange('title')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={lessonData.description}
                onChange={handleInputChange('description')}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                value={lessonData.subject}
                onChange={handleInputChange('subject')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select a subject</option>
                <option value="math">Mathematics</option>
                <option value="science">Science</option>
                <option value="english">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age Group
              </label>
              <select
                value={lessonData.ageGroup}
                onChange={handleInputChange('ageGroup')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select an age group</option>
                <option value="5-7">5-7 years</option>
                <option value="8-10">8-10 years</option>
                <option value="11-13">11-13 years</option>
                <option value="14-16">14-16 years</option>
              </select>
            </div>
          </div>
        );

      case 1:
        return renderContentSection();

      case 2:
        return renderOptionSection();

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Review Lesson Details</h2>
            <div className="space-y-2">
              <p><span className="font-semibold">Title:</span> {lessonData.title}</p>
              <p><span className="font-semibold">Subject:</span> {lessonData.subject}</p>
              <p><span className="font-semibold">Age Group:</span> {lessonData.ageGroup}</p>
              <p><span className="font-semibold">Description:</span> {lessonData.description}</p>
              <div className="mt-4">
                <p className="font-semibold">Content:</p>
                <p className="ml-4 mt-1">{lessonData.statement}</p>
              </div>
              <div className="mt-4">
                <p className="font-semibold">Options:</p>
                {lessonData.options.map((option, index) => (
                  <p key={index} className="ml-4 mt-1">
                    {index + 1}. {option}
                  </p>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderContentSection = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content Type
          </label>
          <select
            value={lessonData.contentType}
            onChange={(e) => handleInputChange({ target: { name: 'contentType', value: e.target.value } })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 mb-4"
            required
          >
            <option value="text">Text</option>
            <option value="image_url">Image</option>
          </select>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lesson Content
          </label>
          {lessonData.contentType === 'text' ? (
            <textarea
              name="statement"
              value={lessonData.statement}
              onChange={handleInputChange}
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              placeholder="Enter the main content of your lesson"
            />
          ) : (
            <div className="space-y-2">              <input
                type="file"
                accept="image/*"
                onChange={handleContentFileChange}
                className="mt-1 block w-full text-sm text-slate-600
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-xl file:border-2 file:border-[#1cb0f6]
                  file:text-sm file:font-bold
                  file:text-[#1cb0f6] file:bg-white
                  hover:file:bg-[#e5f6ff] transition-colors duration-200"
              />
              {(tempImagePreviews.content || lessonData.statement) && (
                <img
                  src={tempImagePreviews.content || lessonData.statement}
                  alt="Content preview"
                  className="mt-2 max-w-md rounded border border-gray-200"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderOptionSection = () => {
    return (
      <div className="space-y-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Options Type
          </label>
          <select
            value={lessonData.optionType}
            onChange={(e) => handleInputChange({ target: { name: 'optionType', value: e.target.value } })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="text">Text</option>
            <option value="image_url">Image</option>
          </select>
        </div>

        {lessonData.options.map((option, index) => (
          <div key={index} className="flex gap-4 items-start">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Option {index + 1}
              </label>
              {lessonData.optionType === 'text' ? (
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(e, index)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  placeholder="Enter text option"
                />
              ) : (
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleOptionFileChange(index, e)}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  {(tempImagePreviews.options[index] || option) && (
                    <img
                      src={tempImagePreviews.options[index] || option}
                      alt={`Option ${index + 1} preview`}
                      className="mt-2 max-w-md h-24 object-contain rounded border border-gray-200"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                </div>
              )}
            </div>
            {lessonData.options.length > 2 && (
              <button
                type="button"
                onClick={() => handleRemoveOption(index)}
                className="mt-7 px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddOption}
          className="mt-2 px-4 py-2 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
        >
          Add Option
        </button>
      </div>
    );
  };

  const handleContentFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Validate file
      r2Service.validateFile(file, ['image/jpeg', 'image/png', 'image/gif'], 5 * 1024 * 1024);

      // Show preview
      const preview = URL.createObjectURL(file);
      setTempImagePreviews(prev => ({
        ...prev,
        content: preview
      }));

      // Upload to R2
      const imageUrl = await r2Service.uploadFile(file, 'lessons');
      setLessonData(prev => ({
        ...prev,
        statement: imageUrl
      }));
    } catch (error) {
      console.error('Error uploading content image:', error);
      setError(error.message);
    }
  };

  const handleOptionFileChange = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Validate file
      r2Service.validateFile(file, ['image/jpeg', 'image/png', 'image/gif'], 5 * 1024 * 1024);

      // Show preview
      const preview = URL.createObjectURL(file);
      setTempImagePreviews(prev => ({
        ...prev,
        options: {
          ...prev.options,
          [index]: preview
        }
      }));

      // Upload to R2
      const imageUrl = await r2Service.uploadFile(file, 'options');
      const newOptions = [...lessonData.options];
      newOptions[index] = imageUrl;
      setLessonData(prev => ({
        ...prev,
        options: newOptions
      }));
    } catch (error) {
      console.error('Error uploading option image:', error);
      setError(error.message);
    }
  };

  if (loading) {    return <div className="flex items-center justify-center p-6">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#58cc02]"></div>
      <span className="ml-2 text-slate-600 font-medium">Loading lesson...</span>
    </div>;
  }

  return (    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-slate-700">Edit Lesson</h1>
      {error && (
        <div className="mb-6 p-4 bg-[#ffd4d4] border-2 border-[#ff4b4b] text-[#ff4b4b] rounded-xl font-medium">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl border-2 border-slate-200 p-6">
        <div>          <label className="block text-sm font-bold text-slate-600 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={lessonData.title}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-xl border-2 border-slate-200 shadow-sm p-2 focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] transition-colors duration-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={lessonData.description}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <input
            type="text"
            name="subject"
            value={lessonData.subject}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Age Group</label>
          <input
            type="text"
            name="ageGroup"
            value={lessonData.ageGroup}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Content Type</label>
          <select
            name="contentType"
            value={lessonData.contentType}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
          >
            <option value="text">Text</option>
            <option value="image_url">Image URL</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Statement</label>
          {lessonData.contentType === 'text' ? (
            <textarea
              name="statement"
              value={lessonData.statement}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
              required
            />
          ) : (
            <input
              type="url"
              name="statement"
              value={lessonData.statement}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
              placeholder="Enter image URL"
              required
            />
          )}
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Options</label>
          {lessonData.options.map((option, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1">
                <select
                  value={lessonData.optionTypes[index] || 'text'}
                  onChange={(e) => {
                    const newOptionTypes = [...lessonData.optionTypes];
                    newOptionTypes[index] = e.target.value;
                    setLessonData(prev => ({
                      ...prev,
                      optionTypes: newOptionTypes
                    }));
                  }}
                  className="mb-2 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                >
                  <option value="text">Text</option>
                  <option value="image_url">Image URL</option>
                </select>
                {lessonData.optionTypes[index] === 'image_url' ? (
                  <input
                    type="url"
                    value={option}
                    onChange={(e) => handleOptionChange(e, index)}
                    className="block w-full rounded-md border border-gray-300 shadow-sm p-2"
                    placeholder="Enter image URL"
                    required
                  />
                ) : (
                  <textarea
                    value={option}
                    onChange={(e) => handleOptionChange(e, index)}
                    className="block w-full rounded-md border border-gray-300 shadow-sm p-2"
                    required
                  />
                )}
              </div>              <button
                type="button"
                onClick={() => handleRemoveOption(index)}
                className="mt-7 px-4 py-2 text-sm border-2 border-[#ff4b4b] text-[#ff4b4b] rounded-xl hover:bg-[#ffd4d4] transition-colors duration-200 font-bold"
              >
                Remove
              </button>
            </div>
          ))}          <button
            type="button"
            onClick={handleAddOption}
            className="px-6 py-3 bg-[#1cb0f6] text-white font-bold rounded-xl hover:bg-[#0095d9] transition-colors duration-200 border-b-2 border-[#0080bc] hover:border-[#0076ad] focus:outline-none focus:ring-2 focus:ring-[#1cb0f6] focus:ring-offset-2"
          >
            Add Option
          </button>
        </div>        <div className="flex justify-end gap-4 pt-4">
          <Link
            to="/app/lessons"
            className="px-6 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors duration-200"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-6 py-3 bg-[#58cc02] text-white font-bold rounded-xl hover:bg-[#47b102] transition-colors duration-200 border-b-2 border-[#3c9202] hover:border-[#2e7502] focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
