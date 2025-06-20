import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../config';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../../atoms';
import { r2Service } from '../../../config/cloudflare';

const steps = ['Basic Information', 'Content', 'Options', 'Review'];

const ageGroups = [
  '3-5 years',
  '6-8 years',
  '9-11 years',
  '12-14 years',
  '15-17 years',
  '18+ years'
];

export default function CreateLesson() {  const navigate = useNavigate();
  const user = useRecoilValue(userStates);
  
  // Log user state when component mounts and when it changes
  useEffect(() => {
    console.log('Current user state:', user);
    console.log('User ID from atom:', user?.userId);
  }, [user]);

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    subject: '',
    ageGroup: '',
    contentType: 'text', // 'text' or 'image_url'
    statement: '',
    contentFile: null, // For image upload
    optionType: 'text', // 'text' or 'image_url'
    options: ['', ''], // Initialize with two empty options
    optionFiles: [null, null], // For image uploads
  });

  const [tempImagePreviews, setTempImagePreviews] = useState({
    content: null,
    options: {}
  });

  const handleInputChange = (field) => (event) => {
    setLessonData({ ...lessonData, [field]: event.target.value });
  };

  const handleOptionChange = (index) => (event) => {
    const newOptions = [...lessonData.options];
    newOptions[index] = event.target.value;
    setLessonData({ ...lessonData, options: newOptions });
  };

  const addOption = () => {
    setLessonData({
      ...lessonData,
      options: [...lessonData.options, ''],
    });
  };

  const removeOption = (index) => {
    const newOptions = lessonData.options.filter((_, i) => i !== index);
    setLessonData({ ...lessonData, options: newOptions });
  };

  const validateStep = async () => {
    setError('');
    setLoading(true);
    try {
      // Basic form validation
      switch (activeStep) {
        case 0:
          if (!lessonData.title.trim()) throw new Error('Title is required');
          if (!lessonData.subject) throw new Error('Subject is required');
          if (!lessonData.ageGroup) throw new Error('Age group is required');
          break;
        case 1:
          if (!lessonData.statement.trim()) throw new Error('Lesson content is required');
          break;
        case 2:
          if (lessonData.options.some(option => !option.trim())) {
            throw new Error('All options must be filled out');
          }
          break;
      }      // Map step names to backend expected values
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
      setError(error.response?.data?.details || error.message || 'Validation failed');
      return false;
    } finally {
      setLoading(false);
    }
  };
  const handleNext = async () => {
    // Don't validate on review step, just submit
    if (activeStep === steps.length - 1) {
      await handleSubmit();
    } else if (await validateStep()) {
      // Step validation succeeded, move to next step
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    if (!user?.userId) {
      setError('Please log in to create a lesson');
      setLoading(false);
      return;
    }

    try {
      let finalLessonData = { ...lessonData };

      // Upload content image if needed
      if (lessonData.contentType === 'image_url' && lessonData.contentFile) {
        try {
          const imageUrl = await uploadToR2(lessonData.contentFile);
          finalLessonData.statement = imageUrl;
        } catch (error) {
          throw new Error('Failed to upload content image: ' + error.message);
        }
      }

      // Upload option images if needed
      if (lessonData.optionType === 'image_url') {
        const uploadedOptions = await Promise.all(
          lessonData.optionFiles.map(async (file, index) => {
            if (!file) return lessonData.options[index];
            try {
              return await uploadToR2(file);
            } catch (error) {
              throw new Error(`Failed to upload option ${index + 1} image: ${error.message}`);
            }
          })
        );
        finalLessonData.options = uploadedOptions;
      }

      console.log('Creating lesson with user:', user);
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
      console.error('Error creating lesson:', error.response?.data || error);
      setError(error.response?.data?.details || error.response?.data?.error || error.message || 'Failed to create lesson');
    } finally {
      setLoading(false);
    }
  };
  const handleContentFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      r2Service.validateFile(file, ['image/jpeg', 'image/png', 'image/gif'], 5 * 1024 * 1024);
      
      const preview = URL.createObjectURL(file);
      setTempImagePreviews(prev => ({
        ...prev,
        content: preview
      }));

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
      r2Service.validateFile(file, ['image/jpeg', 'image/png', 'image/gif'], 5 * 1024 * 1024);
      
      const preview = URL.createObjectURL(file);
      setTempImagePreviews(prev => ({
        ...prev,
        options: {
          ...prev.options,
          [index]: preview
        }
      }));

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

  const renderStepContent = (step) => {
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
                <option value="wants_and_needs_expression">Wants and Needs Expression</option>
                <option value="action_words_and_verbs">Action Words and Verbs</option>
                <option value="what_questions">What Questions</option>
                <option value="where_questions">Where Questions</option>
                <option value="who_questions">Who Questions</option>
                <option value="when_questions">When Questions</option>
                <option value="why_questions">Why Questions</option>
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
                {ageGroups.map(age => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
            </div>
          </div>
        );      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content Type
              </label>
              <select
                value={lessonData.contentType}
                onChange={handleInputChange('contentType')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 mb-4"
                required
              >
                <option value="text">Text</option>
                <option value="image_url">Image URL</option>
              </select>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lesson Content
              </label>              {lessonData.contentType === 'text' ? (
                <textarea
                  value={lessonData.statement}
                  onChange={handleInputChange('statement')}
                  rows={6}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  placeholder="Enter the main content of your lesson"
                />
              ) : (                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleContentFileChange}
                      disabled={uploading}
                      className={`mt-1 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    {uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
                        <div className="flex items-center space-x-2">
                          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm text-blue-600 font-medium">Uploading...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {lessonData.statement && !uploading && (
                    <img
                      src={lessonData.statement}
                      alt="Content preview"
                      className="mt-2 max-w-md rounded border border-gray-200"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        );      case 2:
        return (
          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options Type
              </label>
              <select
                value={lessonData.optionType}
                onChange={handleInputChange('optionType')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="text">Text</option>
                <option value="image_url">Image URL</option>
              </select>
            </div>

            {lessonData.options.map((option, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Option {index + 1}
                  </label>                  {lessonData.optionType === 'text' ? (
                    <input
                      type="text"
                      value={option}
                      onChange={handleOptionChange(index)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                      placeholder="Enter text option"
                    />
                  ) : (                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleOptionFileChange(index, e)}
                          disabled={uploading}
                          className={`mt-1 block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100
                            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                        {uploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
                            <div className="flex items-center space-x-2">
                              <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span className="text-sm text-blue-600 font-medium">Uploading...</span>
                            </div>
                          </div>
                        )}
                      </div>
                      {option && !uploading && (
                        <img
                          src={option}
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
                    onClick={() => removeOption(index)}
                    className="mt-7 px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="mt-2 px-4 py-2 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
            >
              Add Option
            </button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Review Lesson Details</h2>
            <div className="space-y-2">
              <p><span className="font-semibold">Title:</span> {lessonData.title}</p>
              <p><span className="font-semibold">Subject:</span> {lessonData.subject}</p>
              <p><span className="font-semibold">Age Group:</span> {lessonData.ageGroup}</p>
              <p><span className="font-semibold">Description:</span> {lessonData.description}</p>              <div className="mt-4">
                <p className="font-semibold">Content Type: {lessonData.contentType === 'text' ? 'Text' : 'Image'}</p>
                {lessonData.contentType === 'text' ? (
                  <p className="ml-4 mt-1">{lessonData.statement}</p>
                ) : (
                  <div className="ml-4 mt-1">
                    <img
                      src={lessonData.statement}
                      alt="Lesson content"
                      className="max-w-md rounded border border-gray-200"
                    />
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="font-semibold">Options Type: {lessonData.optionType === 'text' ? 'Text' : 'Image'}</p>
                <div className="ml-4 mt-1 space-y-2">
                  {lessonData.options.map((option, index) => (
                    <div key={index}>
                      <p className="font-medium">Option {index + 1}:</p>
                      {lessonData.optionType === 'text' ? (
                        <p className="ml-4">{option}</p>
                      ) : (
                        <img
                          src={option}
                          alt={`Option ${index + 1}`}
                          className="ml-4 max-w-md h-24 object-contain rounded border border-gray-200"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold mb-6">
        Create New Lesson s
      </h1>

      <div className="mb-8">
        <nav aria-label="Progress">
          <ol role="list" className="flex items-center">
            {steps.map((label, index) => (
              <li key={label} className={`relative ${index !== steps.length - 1 ? 'pr-20 sm:pr-24' : ''}`}>
                <div className="flex items-center">
                  <div
                    className={`transition-colors duration-200 ease-in-out rounded-full h-8 w-8 flex items-center justify-center border-2 
                      ${index <= activeStep 
                        ? 'border-blue-600 bg-blue-600 text-white' 
                        : 'border-gray-300 text-gray-500'}`}
                    aria-current={activeStep === index ? "step" : undefined}
                  >
                    <span className="text-sm">{index + 1}</span>
                  </div>
                  <span className={`ml-2 text-sm font-medium transition-colors duration-200 ease-in-out
                    ${index <= activeStep ? 'text-blue-600' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-4 w-full h-0.5 transition-colors duration-200 ease-in-out
                      ${index < activeStep ? 'bg-blue-600' : 'bg-gray-300'}`}
                    aria-hidden="true"
                  />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6" noValidate>
        {error && (
          <div 
            className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        <div className="transition-all duration-200 ease-in-out">
          {renderStepContent(activeStep)}
        </div>

        <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
          <button
            type="button"
            disabled={activeStep === 0}
            onClick={handleBack}
            className={`inline-flex items-center px-4 py-2 rounded transition-colors duration-200 ease-in-out
              ${activeStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'}`}
          >
            <svg 
              className="-ml-1 mr-2 h-5 w-5" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className={`inline-flex items-center px-4 py-2 rounded transition-all duration-200 ease-in-out
              bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg 
                className="-ml-1 mr-2 h-5 w-5" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {activeStep === steps.length - 1 ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                )}
              </svg>
            )}
            {activeStep === steps.length - 1 ? 'Create Lesson' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
}
