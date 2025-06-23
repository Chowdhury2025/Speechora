import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../atoms';
import { API_URL } from '../../config';
import { r2Service } from '../../config/cloudflare';

const QuizImageUpload = () => {
  const user = useRecoilValue(userStates);
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);  const [imageData, setImageData] = useState({
    name: '',
    category: '',
    ageGroup: '',
    quizTypes: ['image_quiz'],
    imageUrl: ''
  });

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        r2Service.validateFile(file, ['image/jpeg', 'image/png', 'image/gif', 'image/webp'], 5 * 1024 * 1024);
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      } catch (error) {
        console.error('File validation error:', error);
        setError(error.message);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setImageData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      if (!selectedFile) {
        throw new Error('Please select an image to upload');
      }

      // Upload image to R2
      const imageUrl = await r2Service.uploadFile(selectedFile, 'quiz-images');
      
      // Create quiz image record
      const response = await axios.post(`${API_URL}/api/quiz-images`, {
        ...imageData,
        imageUrl,
        userId: user.userId
      });

      setSuccess(true);
      setImageData({
        name: '',
        category: '',
        ageGroup: '',
        quizTypes: ['image_quiz'],
        imageUrl: ''
      });
      setSelectedFile(null);
      setPreviewUrl('');
      
    } catch (err) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  // Clean up preview URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const categories = [
    'Animals',
    'Plants',
    'Food',
    'Transportation',
    'Objects',
    'Colors',
    'Shapes',
    'Numbers',
    'Letters',
    'Emotions',
    'Activities',
    'Weather',
    'Professions',
    'Sports'
  ];

 const ageGroups = [
    '3-5 years',
    '6-8 years',
    '9-11 years',
    '12-14 years',
    '15-17 years',
    '18+ years'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border-2 border-[#e5f5d5] p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-[#3c9202]">Upload New Quiz Image</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-[#e5f5d5] border-l-4 border-[#58cc02] text-[#3c9202] rounded-xl">
            <p>Image successfully uploaded!</p>
            <p className="text-sm mt-1">You can upload another image or return to the quiz images list.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-8 p-4 bg-[#e5f5d5] rounded-xl">
            <h3 className="text-lg font-bold text-[#3c9202] mb-2">How to Upload Quiz Images:</h3>
            <ol className="list-decimal list-inside space-y-2 text-[#58cc02]">
              <li>Select a clear, high-quality image</li>
              <li>Choose appropriate category and age group</li>
              <li>Provide a descriptive name for the image</li>
              <li>Click 'Upload Image' to submit</li>
            </ol>
          </div>

          <div>
            <label className="block text-[#3c9202] text-sm font-bold mb-2">
              Choose Image * <span className="text-sm font-normal text-[#58cc02]">(JPEG, PNG, GIF, or WebP)</span>
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="w-full px-4 py-3 border-2 border-[#e5f5d5] rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium text-[#3c9202]"
              required
            />
            {previewUrl && (
              <div className="mt-2">
                <p className="text-sm text-[#58cc02] mb-2">Image Preview:</p>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto max-h-[300px] object-contain border-2 border-[#e5f5d5] rounded-xl"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-[#3c9202] text-sm font-bold mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={imageData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-[#e5f5d5] rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-[#3c9202] text-sm font-bold mb-2">
              Category *
            </label>
            <select
              name="category"
              value={imageData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-[#e5f5d5] rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#3c9202] text-sm font-bold mb-2">
              Age Group *
            </label>
            <select
              name="ageGroup"
              value={imageData.ageGroup}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-[#e5f5d5] rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
              required
            >
              <option value="">Select an age group</option>
              {ageGroups.map(age => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#3c9202] text-sm font-bold mb-2">
              Quiz Types *
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="quizTypes"
                  value="image_quiz"
                  checked={imageData.quizTypes.includes('image_quiz')}
                  onChange={(e) => {
                    const value = e.target.value;
                    setImageData(prev => ({
                      ...prev,
                      quizTypes: e.target.checked 
                        ? [...prev.quizTypes, value]
                        : prev.quizTypes.filter(type => type !== value)
                    }));
                  }}
                  className="w-4 h-4 text-[#58cc02] border-[#e5f5d5] rounded focus:ring-[#58cc02]"
                />
                <span className="ml-2 text-[#3c9202]">Image Quiz</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="quizTypes"
                  value="true_false"
                  checked={imageData.quizTypes.includes('true_false')}
                  onChange={(e) => {
                    const value = e.target.value;
                    setImageData(prev => ({
                      ...prev,
                      quizTypes: e.target.checked 
                        ? [...prev.quizTypes, value]
                        : prev.quizTypes.filter(type => type !== value)
                    }));
                  }}
                  className="w-4 h-4 text-[#58cc02] border-[#e5f5d5] rounded focus:ring-[#58cc02]"
                />
                <span className="ml-2 text-[#3c9202]">True/False Quiz</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedFile}
            className={`w-full px-6 py-3 bg-[#58cc02] hover:bg-[#47b102] active:bg-[#3c9202] text-white rounded-xl font-bold transition-colors border-b-2 border-[#3c9202] hover:border-[#2e7502] ${
              (loading || !selectedFile) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuizImageUpload;
