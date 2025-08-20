import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { userStates } from '../atoms';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL, r2Service } from '../config';

const subjectOptions = [
  { name: 'When Questions', slug: 'When_Questions' },
  { name: 'Choice Questions', slug: 'Choice_Questions' },

];

const Presentation3Form = () => {
  const navigate = useNavigate();
  const user = useRecoilValue(userStates);
  const [formData, setFormData] = useState({
    subject: '',
    imageUrl: '',
    imageName: '',
    description: '',
    ageGroup: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      let imageUrl = formData.imageUrl;
      
      if (selectedFile) {
        // Validate file
        r2Service.validateFile(selectedFile, ['image/jpeg', 'image/png', 'image/gif'], 5 * 1024 * 1024);
        // Upload file to R2
        imageUrl = await r2Service.uploadFile(selectedFile, 'presentation3');
      }

      const response = await axios.post(`${API_URL}/api/presentation3`, {
        ...formData,
        imageUrl,
        imageName: formData.imageName || selectedFile?.name || '',
        userId: user?.userId
      });

      if (response.status === 201) {
        navigate('/app/presentation3');
      }
    } catch (error) {
      console.error('Error creating item:', error);
      alert(error.message || 'Error creating item');
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-[#3c9202] mb-6">
          Add New Presentation Item
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58cc02] focus:border-transparent"
            >
              <option value="">Select a subject</option>
              {subjectOptions.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <input
              type="file"
              id="image"
              accept="image/jpeg,image/png,image/gif"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58cc02] focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Upload an image (JPEG, PNG, or GIF, max 5MB)
            </p>
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Or Image URL (optional)
            </label>
            <input
              type="text"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58cc02] focus:border-transparent"
              placeholder="Enter image URL if not uploading a file"
            />
          </div>

          <div>
            <label htmlFor="imageName" className="block text-sm font-medium text-gray-700 mb-1">
              Image Name (optional)
            </label>
            <input
              type="text"
              id="imageName"
              name="imageName"
              value={formData.imageName}
              onChange={handleChange}
              placeholder="Will use file name if not provided"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58cc02] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58cc02] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 mb-1">
              Age Group
            </label>
            <select
              id="ageGroup"
              name="ageGroup"
              value={formData.ageGroup}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58cc02] focus:border-transparent"
            >
              <option value="">Select age group</option>
              <option value="3-5 years">3-5 years</option>
              <option value="6-8 years">6-8 years</option>
              <option value="9-11 years">9-11 years</option>
              <option value="12-14 years">12-14 years</option>
              <option value="15+ years">15+ years</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isUploading || (!selectedFile && !formData.imageUrl)}
              className={`flex-1 ${
                isUploading || (!selectedFile && !formData.imageUrl)
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#58cc02] hover:bg-[#47b102] border-[#3c9202] hover:border-[#2e7502]'
              } text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 border-b-2 focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2`}
            >
              {isUploading ? 'Uploading...' : 'Create Item'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/presentation3')}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-xl transition-colors duration-200 border-b-2 border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Presentation3Form;
