import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../config';
import { CameraIcon } from '@heroicons/react/24/outline';

export default function CreateLessonPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('basic-info');  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    ageGroup: '',
    statement: {
      type: 'text',
      content: '',
      description: '',
      imageFile: null,
      imagePreview: null
    },
    options: []
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleStatementTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      statement: {
        type,
        content: '',
        description: '',
        imageFile: null,
        imagePreview: null
      }
    }));
  };

  const handleStatementImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          statement: {
            ...prev.statement,
            imageFile: file,
            imagePreview: reader.result,
            type: 'image_url'
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStatementDescriptionChange = (description) => {
    setFormData(prev => ({
      ...prev,
      statement: {
        ...prev.statement,
        description
      }
    }));
  };
  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [
        ...prev.options,
        {
          type: 'text',
          content: '',
          description: '',
          imageFile: null,
          imagePreview: null
        }
      ]
    }));
  };

  const handleOptionImageChange = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          options: prev.options.map((option, i) => 
            i === index ? {
              ...option,
              imageFile: file,
              imagePreview: reader.result,
              type: 'image_url'
            } : option
          )
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Only validate basic required fields
      if (!formData.title || !formData.subject || !formData.ageGroup) {
        throw new Error('Please fill in the title, subject, and age group');
      }

      // Create FormData for submission
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('subject', formData.subject);
      submitData.append('ageGroup', formData.ageGroup);
      submitData.append('userId', '1'); // Replace with actual user ID

      // Handle statement image
      if (formData.statement.imageFile) {
        submitData.append('statementImage', formData.statement.imageFile);
      }
      submitData.append('statement', JSON.stringify({
        type: formData.statement.type,
        content: formData.statement.type === 'text' ? formData.statement.content : '',
        description: formData.statement.description
      }));

      // Handle option images and data
      const optionsData = await Promise.all(formData.options.map(async (option, index) => {
        if (option.imageFile) {
          submitData.append(`optionImage${index}`, option.imageFile);
        }
        return {
          type: option.type,
          content: option.type === 'text' ? option.content : '',
          description: option.description
        };
      }));
      submitData.append('options', JSON.stringify(optionsData));

      // Send data to API
      await axios.post(`${API_URL}/api/lessons`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Redirect to lessons page on success
      navigate('/app/lessons');
    } catch (err) {
      setError(err.message || 'Failed to create lesson');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Lesson</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title*</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Subject*</label>
              <select
                value={formData.subject}
                onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700">Age Group*</label>
              <input
                type="text"
                value={formData.ageGroup}
                onChange={e => setFormData(prev => ({ ...prev, ageGroup: e.target.value }))}
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Statement Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Statement</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type*</label>
              <select
                value={formData.statement.type}
                onChange={e => handleStatementTypeChange(e.target.value)}
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="text">Text</option>
                <option value="image_url">Image</option>
              </select>
            </div>            {formData.statement.type === 'image_url' ? (
              <>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Upload Image</label>
                  <div className="mt-1 flex items-center space-x-4">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                      <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:border-blue-500">
                        <CameraIcon className="h-5 w-5" />
                        <span>Choose Image</span>
                      </div>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleStatementImageChange}
                      />
                    </label>
                    {formData.statement.imagePreview && (
                      <img
                        src={formData.statement.imagePreview}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded"
                      />
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Image Description*</label>
                  <textarea
                    value={formData.statement.description}
                    onChange={e => handleStatementDescriptionChange(e.target.value)}
                    className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows="3"
                    placeholder="Describe what's in the image to help students understand the content"
                    required={formData.statement.imagePreview !== null}
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">Text Content*</label>
                <textarea
                  value={formData.statement.content}
                  onChange={e => handleStatementDescriptionChange(e.target.value)}
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows="3"
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Options Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Options</h2>
            <button
              type="button"
              onClick={handleAddOption}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Option
            </button>
          </div>

          <div className="space-y-6">
            {formData.options.map((option, index) => (
              <div key={index} className="p-4 border rounded">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type*</label>
                    <select
                      value={option.type}
                      onChange={e => handleOptionChange(index, 'type', e.target.value)}
                      className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="text">Text</option>
                      <option value="image_url">Image</option>
                    </select>
                  </div>                  {option.type === 'image_url' ? (
                    <>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Upload Image</label>
                        <div className="mt-1 flex items-center space-x-4">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                            <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:border-blue-500">
                              <CameraIcon className="h-5 w-5" />
                              <span>Choose Image</span>
                            </div>
                            <input
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={(e) => handleOptionImageChange(index, e)}
                            />
                          </label>
                          {option.imagePreview && (
                            <img
                              src={option.imagePreview}
                              alt="Preview"
                              className="h-20 w-20 object-cover rounded"
                            />
                          )}
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Image Description*</label>
                        <textarea
                          value={option.description}
                          onChange={e => handleOptionChange(index, 'description', e.target.value)}
                          className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          rows="3"
                          placeholder="Describe what's in the image to help students understand this option"
                          required={option.imagePreview !== null}
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Text Content*</label>
                      <textarea
                        value={option.content}
                        onChange={e => handleOptionChange(index, 'content', e.target.value)}
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows="3"
                        required
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        options: prev.options.filter((_, i) => i !== index)
                      }));
                    }}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove Option
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/app/lessons')}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Lesson'}
          </button>
        </div>
      </form>
    </div>
  );
}
