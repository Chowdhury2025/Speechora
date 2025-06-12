import React, { useState } from 'react';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../atoms';
import { API_URL } from '../../config';
import { TabNavigator } from '../components/common/TabNavigator';
import { getThumbnailUrl } from '../utils/youtube';
const VideoUploadPage = () => {
  const userState = useRecoilValue(userStates);
  const [videoData, setVideoData] = useState({
    title: '',
    linkyoutube_link: '',
    thumbnail: '',
    category: '',
    position: 0,
    description: '',
    ageGroup: '',
    name: userState.username || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);  const validateYoutubeUrl = (url) => {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
    return pattern.test(url);
  };

  const handleYoutubeUrlChange = (e) => {
    const url = e.target.value;
    setVideoData(prev => ({
      ...prev,
      linkyoutube_link: url,
      thumbnail: getThumbnailUrl(url)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    // Validate YouTube URL
    if (!validateYoutubeUrl(videoData.linkyoutube_link)) {
      setError('Please enter a valid YouTube video URL');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/videos`, videoData);      setSuccess(true);    
      setVideoData(prev => ({
        title: '',
        linkyoutube_link: '',
        thumbnail: '',
        category: '',
        position: 0,
        description: '',
        ageGroup: '',
        name: prev.name // Preserve the name when resetting
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload video');
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
    { name: 'My World & Daily Life', slug: 'my_world_daily_life' },
    { name: 'Home', slug: 'home' },
    { name: 'School', slug: 'school' },
    { name: 'Therapy', slug: 'therapy' },
    { name: 'Activities', slug: 'activities' },
    { name: 'Family & Friends', slug: 'family_friends' },
    { name: 'Toys & Games', slug: 'toys_games' },
    { name: 'Food & Drink', slug: 'food_drink' },
    { name: 'Places', slug: 'places' },
    { name: 'I Want / Needs', slug: 'i_want_needs' },
    { name: 'Actions / Verbs', slug: 'actions_verbs' },
    { name: 'What Questions', slug: 'what_questions' },
    { name: 'Where Questions', slug: 'where_questions' },
    { name: 'Who Questions', slug: 'who_questions' },
    { name: 'When Questions', slug: 'when_questions' },
    { name: 'Why Questions', slug: 'why_questions' },
    { name: 'How Questions', slug: 'how_questions' },
    { name: 'Choice Questions', slug: 'choice_questions' },
    { name: 'Question Starters', slug: 'question_starters' },
    { name: 'Others', slug: 'others' }
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
      
      <h1 className="text-2xl font-bold mb-6">Upload Educational Video</h1>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">How to Upload a Video</h2>
        <ol className="list-decimal list-inside space-y-2 text-blue-900">
          <li>Find or create an educational video on YouTube that you want to share</li>
          <li>Copy the YouTube video URL (e.g., https://youtube.com/watch?v=xxxxx)</li>
          <li>Fill in the required fields marked with an asterisk (*):
            <ul className="list-disc list-inside ml-6 mt-1 text-blue-800">
              <li>Video Title - A clear, descriptive title</li>
              <li>YouTube Link - Paste your copied YouTube URL</li>
              <li>Category - Select the most relevant category</li>
              <li>Age Group - Choose the appropriate age range</li>
            </ul>
          </li>
          <li>Add an optional description to provide more context about the video</li>
          <li>Set the position number to control where the video appears in lists (0 = first)</li>
          <li>Click "Upload Video" to submit</li>
        </ol>
        <p className="mt-3 text-blue-800 text-sm">Note: The system will automatically generate a thumbnail from your YouTube video.</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
            {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <p>Video successfully uploaded by {videoData.name}!</p>
              <p className="text-sm mt-1">You can upload another video or return to the dashboard.</p>
            </div>
          )}

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Video Title *
            </label>
            <input
              type="text"
              name="title"
              value={videoData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              YouTube Link *
            </label>
            <input
              type="url"
              name="linkyoutube_link"
              value={videoData.linkyoutube_link}              onChange={handleYoutubeUrlChange}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Thumbnail Preview
            </label>
            <div className="relative">
              <input
                type="url"
                name="thumbnail"
                value={videoData.thumbnail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />              {videoData.thumbnail && (
                <div className="mt-2 relative w-[640px] h-[360px] mx-auto">
                  <img
                    src={videoData.thumbnail}
                    alt="Video thumbnail"
                    className="w-full h-full object-contain bg-gray-100 rounded-lg shadow-md"
                    style={{ maxWidth: '640px', maxHeight: '360px' }}
                    onError={(e) => {
                      // If maxresdefault fails, try hqdefault
                      if (e.target.src.includes('maxresdefault')) {
                        const videoId = extractVideoId(videoData.linkyoutube_link);
                        e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Position in List
            </label>
            <input
              type="number"
              name="position"
              value={videoData.position}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Position determines the order in which videos appear (0 = first)
            </p>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Category *
            </label>
            <select
              name="category"
              value={videoData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a category</option>
              {categoryOptions.map(category => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Age Group *
            </label>
            <select
              name="ageGroup"
              value={videoData.ageGroup}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select age group</option>
              {ageGroups.map(age => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={videoData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Enter video description..."
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Teacher's Name
            </label>
            <input
              type="text"              name="name"
              value={videoData.name}
              onChange={handleChange}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200 ${
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
