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
    imageUrl: '',
    imageName: '',
    description: '',
    ageGroup: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open && itemData) {
      setFormData(itemData);
      setLoading(false);
    } else if (open && itemId) {
      setLoading(true);
      axios.get(`${API_URL}/api/presentation3/${itemId}`)
        .then(res => {
          setFormData(res.data);
          setLoading(false);
        })
        .catch((error) => {
          alert('Failed to load item');
          setLoading(false);
        });
    }
  }, [open, itemId, itemData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      // Validate and upload
      uploadService.validateFile(file);
      const newUrl = await uploadService.uploadFile(file);
      // Delete old image if exists and is from cloud storage
      if (formData.imageUrl && formData.imageUrl.includes('r2.dev')) {
        await uploadService.deleteFile(formData.imageUrl);
      }
      setFormData({ ...formData, imageUrl: newUrl, imageName: file.name });
    } catch (err) {
      alert('Image upload failed: ' + err.message);
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
      alert('Failed to update item');
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
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="text" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58cc02] focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image Preview</label>
            {formData.imageUrl && (
              <img src={formData.imageUrl} alt="Current" className="h-24 mb-2 rounded" />
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="mb-2" />
            {uploading && <div className="text-xs text-gray-500">Uploading...</div>}
          </div>
          <div>
            <label htmlFor="imageName" className="block text-sm font-medium text-gray-700 mb-1">Image Name</label>
            <input type="text" id="imageName" name="imageName" value={formData.imageName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58cc02] focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58cc02] focus:border-transparent" />
          </div>
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
            <button type="submit" disabled={saving} className={`flex-1 ${saving ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#58cc02] hover:bg-[#47b102] border-[#3c9202] hover:border-[#2e7502]'} text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 border-b-2 focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2`}>
              {saving ? 'Saving...' : 'Save Changes'}
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
