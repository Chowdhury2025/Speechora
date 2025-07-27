import React, { useState } from 'react';
// import axios from 'axios'; // Import this in your actual project
import { useRecoilValue } from 'recoil';
import { userStates } from '../../atoms';
import { API_URL } from '../../config';
import { TabNavigator } from '../components/common/TabNavigator';
import { getThumbnailUrl } from '../utils/youtube';
import { r2Service } from '../../config';

const VideoUploadPage = () => {
  const userState = useRecoilValue(userStates);
  
  const [uploadType, setUploadType] = useState('youtube'); // 'youtube' or 'r2'
  const [videoData, setVideoData] = useState({
    title: '',
    linkyoutube_link: '',
    video_url: '',
    thumbnail: '',
    category: '',
    customCategory: '',
    position: 0,
    description: '',
    ageGroup: '',
    name: userState.username || ''
  });
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

  const validateYoutubeUrl = (url) => {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
    return pattern.test(url);
  };

  const handleYoutubeUrlChange = (e) => {
    const url = e.target.value;
    setVideoData(prev => ({
      ...prev,
      linkyoutube_link: url,
      thumbnail: getThumbnailUrl(url),
      video_url: '' // Clear R2 video URL when using YouTube
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Basic validation
      const validTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid video file (MP4, MPEG, MOV, WebM)');
        return;
      }
      
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        setError('File size must be less than 100MB');
        return;
      }

      setSelectedFile(file);
      setError(null);
      setVideoData(prev => ({
        ...prev,
        linkyoutube_link: '', // Clear YouTube URL when using file upload
        thumbnail: '' // Will be set after upload
      }));
    }
  };

  const uploadToR2 = async (file) => {
    try {
      setUploadProgress(0);
      
      // Validate file with R2 service
      r2Service.validateFile(file, {
        maxSize: 100 * 1024 * 1024, // 100MB
        allowedTypes: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm']
      });

      // Upload to R2
      const result = await r2Service.uploadFile(file, 'videos', userState.id);
      
      setUploadProgress(100);
      return result.url;
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      let finalVideoData = { ...videoData };

      if (uploadType === 'youtube') {
        // Validate YouTube URL
        if (!validateYoutubeUrl(videoData.linkyoutube_link)) {
          throw new Error('Please enter a valid YouTube video URL');
        }
      } else {
        // Handle R2 upload
        if (!selectedFile) {
          throw new Error('Please select a video file to upload');
        }

        // Upload video to R2
        const videoUrl = await uploadToR2(selectedFile);
        finalVideoData.video_url = videoUrl;
        
        // Generate a simple thumbnail placeholder or extract from video
        finalVideoData.thumbnail = '/placeholder-video-thumbnail.jpg';
      }

      // Submit to your API
  await axios.post(`${API_URL}/api/videos`, finalVideoData);
      
      setSuccess(true);
      
      // Reset form
      setVideoData(prev => ({
        title: '',
        linkyoutube_link: '',
        video_url: '',
        thumbnail: '',
        category: '',
        customCategory: '',
        position: 0,
        description: '',
        ageGroup: '',
        name: prev.name
      }));
      setSelectedFile(null);
      setUploadProgress(0);
      
    } catch (err) {
      setError(err.message || 'Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVideoData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const categoryOptions = [
    { name: 'Daily routine', slug: 'my_world_daily_life' },
    { name: 'Home', slug: 'home' },
    { name: 'School', slug: 'school' },
    { name: 'Therapy', slug: 'therapy' },
    { name: 'Activities', slug: 'activities' },
    { name: 'Family & Friends', slug: 'family_friends' },
    { name: 'Toys & Games', slug: 'toys_games' },
    { name: 'Food & Drink', slug: 'food_drink' },
    { name: 'Places', slug: 'places' },
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
    <div className="container mx-auto p-4">
      <TabNavigator />
      
      <h1 className="text-2xl font-bold mb-6 text-[#3c9202]">Upload Educational Video</h1>
      
      <div className="bg-[#e5f5d5] border-l-4 border-[#58cc02] p-4 mb-6 rounded-xl">
        <h2 className="text-lg font-bold text-[#3c9202] mb-2">How to Upload a Video</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-[#3c9202]">Option 1: YouTube Link</h3>
            <ol className="list-decimal list-inside space-y-1 text-[#2e7502] ml-4">
              <li>Find an educational video on YouTube</li>
              <li>Copy the YouTube video URL</li>
              <li>Paste it in the YouTube Link field</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold text-[#3c9202]">Option 2: Upload Video File</h3>
            <ol className="list-decimal list-inside space-y-1 text-[#2e7502] ml-4">
              <li>Select a video file from your computer (MP4, MOV, WebM)</li>
              <li>File size must be under 100MB</li>
              <li>Video will be uploaded to secure cloud storage</li>
            </ol>
          </div>
        </div>
        <p className="mt-3 text-[#3c9202] text-sm">Then fill in the required fields and click "Upload Video"</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-[#e5f5d5] border-l-4 border-[#58cc02] text-[#3c9202] p-4 rounded-xl">
              <p>Video successfully uploaded by {videoData.name}!</p>
              <p className="text-sm mt-1">You can upload another video or return to the dashboard.</p>
            </div>
          )}

          {/* Upload Type Selection */}
          <div>
            <label className="block text-[#3c9202] text-sm font-bold mb-3">
              Choose Upload Method *
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="youtube"
                  checked={uploadType === 'youtube'}
                  onChange={(e) => {
                    setUploadType(e.target.value);
                    setSelectedFile(null);
                    setError(null);
                  }}
                  className="mr-2"
                />
                <span className="text-[#3c9202] font-medium">YouTube Link</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="r2"
                  checked={uploadType === 'r2'}
                  onChange={(e) => {
                    setUploadType(e.target.value);
                    setVideoData(prev => ({ ...prev, linkyoutube_link: '', thumbnail: '' }));
                    setError(null);
                  }}
                  className="mr-2"
                />
                <span className="text-[#3c9202] font-medium">Upload Video File</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[#3c9202] text-sm font-bold mb-2">
              Video Title *
            </label>
            <input
              type="text"
              name="title"
              value={videoData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-[#e5f5d5] rounded-xl focus:outline-none focus:border-[#58cc02] text-gray-700 transition-colors"
              placeholder="Enter video title"
            />
          </div>

          {/* YouTube Link Field */}
          {uploadType === 'youtube' && (
            <div>
              <label className="block text-[#3c9202] text-sm font-bold mb-2">
                YouTube Link *
              </label>
              <input
                type="url"
                name="linkyoutube_link"
                value={videoData.linkyoutube_link}
                onChange={handleYoutubeUrlChange}
                required
                className="w-full px-4 py-3 border-2 border-[#e5f5d5] rounded-xl focus:outline-none focus:border-[#58cc02] text-gray-700 transition-colors"
                placeholder="https://youtube.com/watch?v=xxxxx"
              />
            </div>
          )}

          {/* File Upload Field */}
          {uploadType === 'r2' && (
            <div>
              <label className="block text-[#3c9202] text-sm font-bold mb-2">
                Video File *
              </label>
              <input
                type="file"
                accept="video/mp4,video/mpeg,video/quicktime,video/webm"
                onChange={handleFileSelect}
                required
                className="w-full px-4 py-3 border-2 border-[#e5f5d5] rounded-xl focus:outline-none focus:border-[#58cc02] text-gray-700 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#58cc02] file:text-white hover:file:bg-[#47b102]"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-[#3c9202]">
                  Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#58cc02] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-[#3c9202] mt-1">Uploading: {uploadProgress}%</p>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-[#3c9202] text-sm font-bold mb-2">
              Position in List
            </label>
            <input
              type="number"
              name="position"
              value={videoData.position}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-3 border-2 border-[#e5f5d5] rounded-xl focus:outline-none focus:border-[#58cc02] text-gray-700 transition-colors"
            />
            <p className="mt-1 text-sm text-[#3c9202]">
              Position determines the order in which videos appear (0 = first)
            </p>
          </div>

          <div>
            <label className="block text-[#3c9202] text-sm font-bold mb-2">
              Category *
            </label>
            <div className="space-y-3">
              <select
                name="category"
                value={videoData.category}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomCategory(true);
                    setVideoData(prev => ({ ...prev, category: '' }));
                  } else {
                    setIsCustomCategory(false);
                    setVideoData(prev => ({ ...prev, category: e.target.value, customCategory: '' }));
                  }
                }}
                className="w-full px-4 py-3 border-2 border-[#e5f5d5] rounded-xl focus:outline-none focus:border-[#58cc02] text-gray-700 transition-colors"
                required={!isCustomCategory}
              >
                <option value="">Select a category</option>
                {categoryOptions.map(category => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
                <option value="custom">+ Add Custom Category</option>
              </select>

              {isCustomCategory && (
                <div className="mt-2">
                  <input
                    type="text"
                    name="customCategory"
                    value={videoData.customCategory}
                    onChange={(e) => {
                      const value = e.target.value;
                      setVideoData(prev => ({
                        ...prev,
                        customCategory: value,
                        category: value.toLowerCase().replace(/\s+/g, '_')
                      }));
                    }}
                    placeholder="Enter custom category"
                    className="w-full px-4 py-3 border-2 border-[#e5f5d5] rounded-xl focus:outline-none focus:border-[#58cc02] text-gray-700 transition-colors"
                    required={isCustomCategory}
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[#3c9202] text-sm font-bold mb-2">
              Age Group *
            </label>
            <select
              name="ageGroup"
              value={videoData.ageGroup}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-[#e5f5d5] rounded-xl focus:outline-none focus:border-[#58cc02] text-gray-700 transition-colors"
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
              Description
            </label>
            <textarea
              name="description"
              value={videoData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border-2 border-[#e5f5d5] rounded-xl focus:outline-none focus:border-[#58cc02] text-gray-700 transition-colors"
              placeholder="Provide a description of the video content"
            ></textarea>
          </div>

          {videoData.thumbnail && (
            <div>
              <label className="block text-[#3c9202] text-sm font-bold mb-2">
                Thumbnail Preview
              </label>
              <img 
                src={videoData.thumbnail} 
                alt="Video thumbnail" 
                className="w-full max-w-md rounded-xl border-2 border-[#e5f5d5]" 
              />
            </div>
          )}

          <div>
            <label className="block text-[#3c9202] text-sm font-bold mb-2">
              Teacher's Name
            </label>
            <input
              type="text"
              name="name"
              value={videoData.name}
              onChange={handleChange}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#58cc02] hover:bg-[#47b102] active:bg-[#3c9202] text-white py-3 px-4 rounded-xl font-bold transition-colors border-b-2 border-[#3c9202] hover:border-[#2e7502] ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VideoUploadPage;