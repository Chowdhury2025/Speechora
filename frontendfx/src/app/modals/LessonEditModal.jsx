import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, uploadService } from '../../config';

// Fixed: Updated to use uploadService instead of r2Service
export default function LessonEditModal({ isOpen, onClose, lesson, onUpdate }) {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    ageGroup: '',
    description: '',
    statement: '',
    contentType: 'text',
    options: [],
    optionType: 'text',
    correctOption: 0
  });
  
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (lesson) {
      const initialFormData = {
        title: lesson.title || '',
        subject: lesson.subject || '',
        ageGroup: lesson.ageGroup || '',
        description: lesson.description || '',
        statement: lesson.statement || '',
        contentType: lesson.contentType || 'text',
        options: lesson.options || [],
        optionType: lesson.optionType || 'text',
        correctOption: lesson.correctOption || 0
      };
      
      setFormData(initialFormData);
      setInitialData(initialFormData);
      
      if (lesson.imageUrl) {
        setImagePreview(lesson.imageUrl);
      }
    }
  }, [lesson]);

  if (!isOpen || !lesson) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const fileReader = new FileReader();
      fileReader.onload = (e) => setImagePreview(e.target.result);
      fileReader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get only the fields that have changed
      const changedFields = {};
      let hasChanges = false;
      
      // Helper function for deep comparison
      const isEqual = (val1, val2) => {
        if (Array.isArray(val1) && Array.isArray(val2)) {
          if (val1.length !== val2.length) return false;
          return val1.every((item, index) => isEqual(item, val2[index]));
        }
        if (typeof val1 === 'object' && val1 !== null && typeof val2 === 'object' && val2 !== null) {
          const keys1 = Object.keys(val1);
          const keys2 = Object.keys(val2);
          if (keys1.length !== keys2.length) return false;
          return keys1.every(key => isEqual(val1[key], val2[key]));
        }
        return val1 === val2;
      };
      
      // Compare each field with the initial data
      Object.keys(formData).forEach(key => {
        if (!isEqual(formData[key], initialData[key])) {
          changedFields[key] = formData[key];
          hasChanges = true;
        }
      });
      
      // If no changes detected and no image file, close the modal
      if (!hasChanges && !imageFile) {
        onClose();
        return;
      }

      let imageUrl = lesson.imageUrl;
      
      // Handle image upload if a new image was selected
      if (imageFile) {
        try {
          // Upload the new image
          const imageUrl = await uploadService.uploadFile(imageFile, 'lessons');
          changedFields.imageUrl = imageUrl;
          
          // Only delete the old image after successful upload
          if (lesson.imageUrl && lesson.imageUrl !== imageUrl) {
            try {
              await uploadService.deleteFile(lesson.imageUrl);
            } catch (deleteError) {
              console.error('Error deleting old image:', deleteError);
              // Don't block the update if delete fails
            }
          }
        } catch (error) {
          console.error('Error handling image:', error);
          setError('Failed to upload image. Please try again.');
          setLoading(false);
          return;
        }
      }
      
      // Only make the API call if there are changes
      if (Object.keys(changedFields).length > 0) {
        await axios.put(`${API_URL}/api/lessons/${lesson.id}`, changedFields);
        
        // Call onUpdate with the complete updated lesson data
        onUpdate({
          ...lesson,
          ...changedFields,
          imageUrl: imageUrl
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error updating lesson:', error);
      setError(error.response?.data?.message || 'Failed to update lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <div className="relative bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-3xl sm:w-full mx-4 border-2 border-slate-200">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-6 pt-6 pb-5">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-slate-700" id="modal-title">
                  Edit Lesson
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-400 hover:text-primary p-2 rounded-full hover:bg-slate-100"
                  aria-label="Close"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="bg-[#ffd4d4] border-2 border-[#ff4b4b] text-[#ff4b4b] p-4 rounded-xl mb-4 font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-600 mb-1" htmlFor="title">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-xl border-2 border-slate-200 shadow-sm p-2 focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] transition-colors duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1" htmlFor="subject">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-xl border-2 border-slate-200 shadow-sm p-2 focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] transition-colors duration-200"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="wants_and_needs_expression">Wants and Needs Expression</option>
                    <option value="action_words_and_verbs">Action Words and Verbs</option>
                    <option value="what_questions">What Questions</option>
                    <option value="where_questions">Where Questions</option>
                    <option value="who_questions">Who Questions</option>
                    <option value="when_questions">When Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1" htmlFor="ageGroup">
                    Age Group
                  </label>
                  <select
                    id="ageGroup"
                    name="ageGroup"
                    value={formData.ageGroup}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-xl border-2 border-slate-200 shadow-sm p-2 focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] transition-colors duration-200"
                    required
                  >
                    <option value="">Select Age Group</option>
                    <option value="5-7">5-7 years</option>
                    <option value="8-10">8-10 years</option>
                    <option value="11-13">11-13 years</option>
                    <option value="14-16">14-16 years</option>
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-600 mb-1" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full rounded-xl border-2 border-slate-200 shadow-sm p-2 focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] transition-colors duration-200"
                  ></textarea>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-600 mb-1" htmlFor="statement">
                    Lesson Statement
                  </label>
                  <textarea
                    id="statement"
                    name="statement"
                    value={formData.statement}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full rounded-xl border-2 border-slate-200 shadow-sm p-2 focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] transition-colors duration-200"
                    required
                  ></textarea>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-600 mb-1" htmlFor="contentType">
                    Content Type
                  </label>
                  <select
                    id="contentType"
                    name="contentType"
                    value={formData.contentType}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-xl border-2 border-slate-200 shadow-sm p-2 focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] transition-colors duration-200"
                  >
                    <option value="text">Text</option>
                    <option value="image_url">Image URL</option>
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-600 mb-1" htmlFor="imageUpload">
                    Lesson Image
                  </label>
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1 block w-full"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="Preview" className="h-40 rounded-lg object-cover" />
                    </div>
                  )}
                </div>

                {/* Options section */}
                <div className="col-span-1 md:col-span-2">
                  <h4 className="font-bold text-slate-600 mb-2">Options</h4>
                  {formData.options.map((option, index) => (
                    <div key={index} className="mb-3 border-2 border-slate-100 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-bold text-slate-600">
                          Option {index + 1}
                        </label>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id={`correctOption-${index}`}
                            name="correctOption"
                            value={index}
                            checked={formData.correctOption === index}
                            onChange={() => setFormData(prev => ({ ...prev, correctOption: index }))}
                            className="mr-1 focus:ring-[#58cc02]"
                          />
                          <label htmlFor={`correctOption-${index}`} className="text-sm text-slate-600">
                            Correct
                          </label>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="block w-full rounded-xl border-2 border-slate-200 shadow-sm p-2 focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] transition-colors duration-200"
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-600 mb-1" htmlFor="optionType">
                    Option Type
                  </label>
                  <select
                    id="optionType"
                    name="optionType"
                    value={formData.optionType}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-xl border-2 border-slate-200 shadow-sm p-2 focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] transition-colors duration-200"
                  >
                    <option value="text">Text</option>
                    <option value="image_url">Image URL</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 sm:flex sm:flex-row-reverse gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 bg-[#58cc02] text-white font-bold rounded-xl hover:bg-[#47b102] transition-colors duration-200 border-b-2 border-[#3c9202] hover:border-[#2e7502] focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2"
              >
                {loading ? (
                  <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span> Saving...</>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 bg-white text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors duration-200 border-2 border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
