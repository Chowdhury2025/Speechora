import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import { r2Service } from '../../../config';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../../atoms';

const ImageEditModal = ({ 
  isOpen, 
  onClose, 
  image, 
  onImageUpdated, 
  categories = [] 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    ageGroup: '',
    name: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  
  const user = useRecoilValue(userStates);

  // Add CSS animations
  const fadeInStyle = {
    animation: 'fadeIn 0.3s ease-in-out'
  };

  // Add keyframes to document head if not already added
  React.useEffect(() => {
    const styleId = 'image-edit-modal-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Age group options
  const ageGroups = [
    'All ages',
    '0-2 years',
    '3-5 years',
    '6-8 years',
    '9-12 years',
    '13-17 years',
    '18+ years'
  ];

  useEffect(() => {
    if (isOpen && image) {
      // Populate form with existing image data
      setFormData({
        title: image.title || '',
        description: image.description || '',
        category: image.category || '',
        ageGroup: image.ageGroup || 'All ages',
        name: image.name || ''
      });
      setPreviewUrl(image.imageUrl || '');
      setSelectedFile(null);
      setError('');
      setSuccess('');
      setNewCategory('');
      setShowNewCategoryInput(false);
    }
  }, [isOpen, image]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Validate file using your r2Service
        r2Service.validateFile(
          file, 
          ['image/jpeg', 'image/png', 'image/gif', 'image/webp'], 
          5 * 1024 * 1024 // 5MB max size
        );
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError('');
      } catch (error) {
        console.error('File validation error:', error);
        setError(error.message);
        setSelectedFile(null);
      }
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === 'add_new') {
      setShowNewCategoryInput(true);
      setFormData(prev => ({ ...prev, category: '' }));
    } else {
      setShowNewCategoryInput(false);
      setFormData(prev => ({ ...prev, category: value }));
    }
  };

  const handleNewCategorySubmit = () => {
    if (newCategory.trim()) {
      setFormData(prev => ({ ...prev, category: newCategory.trim() }));
      setShowNewCategoryInput(false);
      setNewCategory('');
    }
  };

  const uploadToR2 = async (file) => {
    try {
      // Upload to R2 using the images folder
      const uploadUrl = await r2Service.uploadFile(file, 'images');
      return uploadUrl;
    } catch (error) {
      console.error('R2 upload error:', error);
      throw new Error('Failed to upload image to storage: ' + (error.message || 'Unknown error'));
    }
  };

  const deleteOldImageFromR2 = async (imageUrl) => {
    if (imageUrl && (imageUrl.includes('r2.dev') || imageUrl.includes('r2.cloudflarestorage.com'))) {
      try {
        await r2Service.deleteFile(imageUrl);
        console.log('Successfully deleted old image from R2:', imageUrl);
      } catch (error) {
        console.warn('Failed to delete old image from R2:', error);
        // Don't throw error here as the main update should still proceed
        // But we should inform the user
        throw new Error('Failed to delete old image from storage. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please login to edit images');
      return;
    }

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let imageUrl = image.imageUrl; // Keep existing URL by default
      let uploadStep = false;
      
      // If a new file is selected, upload it
      if (selectedFile) {
        uploadStep = true;
        setSuccess('Uploading new image...');
        
        // Delete old image from R2 if it exists
        await deleteOldImageFromR2(image.imageUrl);
        
        // Upload new image
        imageUrl = await uploadToR2(selectedFile);
        setSuccess('Image uploaded successfully. Updating database...');
      } else {
        setSuccess('Updating image information...');
      }

      // Prepare update data
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category.trim() || null,
        ageGroup: formData.ageGroup || null,
        name: formData.name.trim() || null,
        imageUrl: imageUrl
      };

      // Update image in backend
      const response = await axios.put(
        `${API_URL}/api/images/${image.id}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Handle response based on controller format
      if (response.data.success) {
        setSuccess(response.data.message || 'Image updated successfully!');
        
        // Call parent callback with updated image data
        if (onImageUpdated && response.data.data) {
          onImageUpdated(response.data.data);
        }

        // Close modal after a short delay to show success message
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Update failed');
      }

    } catch (err) {
      console.error('Update error:', err);
      
      // Handle different types of errors
      let errorMessage = 'Failed to update image';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        errorMessage = errorData.message || errorData.error || errorMessage;
        
        // Handle specific HTTP status codes
        switch (err.response.status) {
          case 400:
            errorMessage = errorData.message || 'Invalid data provided';
            break;
          case 401:
            errorMessage = 'Please login again to continue';
            break;
          case 403:
            errorMessage = 'You do not have permission to edit this image';
            break;
          case 404:
            errorMessage = 'Image not found or may have been deleted';
            break;
          case 409:
            errorMessage = errorData.message || 'Conflict with existing data';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later';
            break;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setSuccess(''); // Clear any success message
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Clean up preview URL if it was created
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-2xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#58cc02] mx-auto mb-4"></div>
              <p className="text-lg font-medium text-[#3C3C3C]">
                {success || 'Processing...'}
              </p>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-[#3C3C3C]">Edit Image</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-[#4b4b4b] hover:text-[#3C3C3C] text-2xl font-bold disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Message with Animation */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 animate-fade-in">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message with Animation */}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-4 animate-fade-in">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium">{success}</p>
                </div>
                {loading && (
                  <div className="ml-auto">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preview Image */}
          {previewUrl && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-[#3C3C3C] mb-2">
                Current/Preview Image
              </label>
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-xl border-2 border-slate-200"
                />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-bold text-[#3C3C3C] mb-2">
                Replace Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] disabled:opacity-50 disabled:bg-slate-100"
              />
              <p className="text-xs text-[#4b4b4b] mt-1">
                Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-[#3C3C3C] mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] disabled:opacity-50 disabled:bg-slate-100"
                placeholder="Enter image title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-[#3C3C3C] mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={loading}
                rows="3"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] resize-none disabled:opacity-50 disabled:bg-slate-100"
                placeholder="Enter image description"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-[#3C3C3C] mb-2">
                Category
              </label>
              {!showNewCategoryInput ? (
                <select
                  value={formData.category}
                  onChange={handleCategoryChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] disabled:opacity-50 disabled:bg-slate-100"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                  <option value="add_new">+ Add New Category</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    disabled={loading}
                    className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] disabled:opacity-50 disabled:bg-slate-100"
                    placeholder="Enter new category name"
                  />
                  <button
                    type="button"
                    onClick={handleNewCategorySubmit}
                    disabled={loading || !newCategory.trim()}
                    className="bg-[#58cc02] hover:bg-[#47b102] text-white font-bold px-4 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategoryInput(false);
                      setNewCategory('');
                    }}
                    disabled={loading}
                    className="bg-slate-400 hover:bg-slate-500 text-white font-bold px-4 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Age Group */}
            <div>
              <label className="block text-sm font-bold text-[#3C3C3C] mb-2">
                Age Group
              </label>
              <select
                name="ageGroup"
                value={formData.ageGroup}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] disabled:opacity-50 disabled:bg-slate-100"
              >
                {ageGroups.map(ageGroup => (
                  <option key={ageGroup} value={ageGroup}>
                    {ageGroup}
                  </option>
                ))}
              </select>
            </div>

            {/* Author Name */}
            <div>
              <label className="block text-sm font-bold text-[#3C3C3C] mb-2">
               Teacher's Name
              </label>
              <input
                type="text"
                name="name"
                disabled="true"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] disabled:opacity-50 disabled:bg-slate-100"
                placeholder="Enter author name"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 bg-slate-400 hover:bg-slate-500 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title.trim()}
                className="flex-1 bg-[#58cc02] hover:bg-[#47b102] text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 border-b-2 border-[#3c9202] hover:border-[#2e7502] disabled:opacity-50 disabled:cursor-not-allowed disabled:border-slate-400"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Image'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ImageEditModal;