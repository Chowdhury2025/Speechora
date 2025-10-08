import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, uploadService } from '../config';

const ageGroups = [
  '3-5 years',
  '6-8 years',
  '9-11 years',
  '12-14 years',
  '15+ years'
];

const subjectOptions = [
  { name: 'When Questions', slug: 'When_Questions' },
  { name: 'Choice Questions', slug: 'Choice_Questions' },

];

const Presentation3EditModal = ({ open, onClose, itemId, itemData, onSaved }) => {
  const [formData, setFormData] = useState({
    subject: '',
    imageUrl1: '',
    imageUrl2: '',
    imageName1: '',
    imageName2: '',
    description: 'Default presentation description',
    ageGroup: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading1, setUploading1] = useState(false);
  const [uploading2, setUploading2] = useState(false);

  useEffect(() => {
    if (open && itemData) {
      setFormData({
        ...itemData,
        description: itemData.description || 'Default presentation description',
      });
      setLoading(false);
    } else if (open && itemId) {
      setLoading(true);
      axios.get(`${API_URL}/api/presentation3/${itemId}`)
        .then(res => {
          setFormData({
            ...res.data,
            description: res.data.description || 'Default presentation description',
          });
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to load item:', error);
          alert('Failed to load item: ' + (error.response?.data?.error || error.message));
          setLoading(false);
          onClose(); // Close modal on error
        });
    }
  }, [open, itemId, itemData, onClose]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e, imageNumber) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const setUploading = imageNumber === 1 ? setUploading1 : setUploading2;
    setUploading(true);
    
    try {
      // Validate and upload
      uploadService.validateFile(file);
      const newUrl = await uploadService.uploadFile(file);
      
      // Delete old image if exists and is from cloud storage
      const oldImageUrl = imageNumber === 1 ? formData.imageUrl1 : formData.imageUrl2;
      if (oldImageUrl && (oldImageUrl.includes('r2.dev') || oldImageUrl.includes('cloudflare'))) {
        try {
          await uploadService.deleteFile(oldImageUrl);
        } catch (deleteErr) {
          console.warn('Failed to delete old image:', deleteErr);
          // Don't block the upload process if delete fails
        }
      }
      
      // Update form data based on image number
      const updateData = {};
      if (imageNumber === 1) {
        updateData.imageUrl1 = newUrl;
        updateData.imageName1 = file.name;
      } else {
        updateData.imageUrl2 = newUrl;
        updateData.imageName2 = file.name;
      }
      
      setFormData({ ...formData, ...updateData });
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Image upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/presentation3/${itemId}`, formData);
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to update item:', err);
      alert('Failed to update item: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl relative max-h-[90vh] overflow-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
        <h2 className="text-2xl font-bold text-[#3c9202] mb-6">Edit Presentation Item</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select id="subject" name="subject" value={formData.subject} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58cc02] focus:border-transparent">
              <option value="">Select subject</option>
              {subjectOptions.map(option => (
                <option key={option.slug} value={option.slug}>{option.name}</option>
              ))}
            </select>
          </div>
        
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Image</label>
            {formData.imageUrl1 && (
              <img src={formData.imageUrl1} alt="First Image" className="h-24 mb-2 rounded" />
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleImageUpload(e, 1)} 
              disabled={uploading1} 
              className="mb-2" 
            />
            {uploading1 && <div className="text-xs text-gray-500">Uploading first image...</div>}
          </div>
          
          <div>
            <label htmlFor="imageName1" className="block text-sm font-medium text-gray-700 mb-1">First Image Name</label>
            <input 
              type="text" 
              id="imageName1" 
              name="imageName1" 
              value={formData.imageName1} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58cc02] focus:border-transparent" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Second Image</label>
            {formData.imageUrl2 && (
              <img src={formData.imageUrl2} alt="Second Image" className="h-24 mb-2 rounded" />
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleImageUpload(e, 2)} 
              disabled={uploading2} 
              className="mb-2" 
            />
            {uploading2 && <div className="text-xs text-gray-500">Uploading second image...</div>}
          </div>
          
          <div>
            <label htmlFor="imageName2" className="block text-sm font-medium text-gray-700 mb-1">Second Image Name</label>
            <input 
              type="text" 
              id="imageName2" 
              name="imageName2" 
              value={formData.imageName2} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58cc02] focus:border-transparent" 
            />
          </div>
          {/* Description field removed, value is set in formData by default and not shown to user */}
          <div>
            <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
            <select id="ageGroup" name="ageGroup" value={formData.ageGroup} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58cc02] focus:border-transparent">
              <option value="">Select age group</option>
              {ageGroups.map(age => (
                <option key={age} value={age}>{age}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={saving || uploading1 || uploading2} className={`flex-1 ${saving || uploading1 || uploading2 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#58cc02] hover:bg-[#47b102] border-[#3c9202] hover:border-[#2e7502]'} text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 border-b-2 focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2`}>
              {saving ? 'Saving...' : uploading1 || uploading2 ? 'Uploading...' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-xl transition-colors duration-200 border-b-2 border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2">
              Cancel
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default Presentation3EditModal;
