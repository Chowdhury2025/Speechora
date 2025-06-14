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
      
      <h1 className="text-2xl font-bold mb-6 text-[#3c9202]">Upload Educational Video</h1>
        <div className="bg-[#e5f5d5] border-l-4 border-[#58cc02] p-4 mb-6 rounded-xl">
        <h2 className="text-lg font-bold text-[#3c9202] mb-2">How to Upload a Video</h2>
        <ol className="list-decimal list-inside space-y-2 text-[#2e7502]">
          <li>Find or create an educational video on YouTube that you want to share</li>
          <li>Copy the YouTube video URL (e.g., https://youtube.com/watch?v=xxxxx)</li>
          <li>Fill in the required fields marked with an asterisk (*):
            <ul className="list-disc list-inside ml-6 mt-1 text-[#3c9202]">
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
        <p className="mt-3 text-[#3c9202] text-sm">Note: The system will automatically generate a thumbnail from your YouTube video.</p>
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
            <select
              name="category"
              value={videoData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-[#e5f5d5] rounded-xl focus:outline-none focus:border-[#58cc02] text-gray-700 transition-colors"
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
              type="text"              name="name"
              value={videoData.name}
              onChange={handleChange}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
            />
          </div>          <button
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
