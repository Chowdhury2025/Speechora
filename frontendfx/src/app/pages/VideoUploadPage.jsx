import React, { useState } from 'react';
import axios from 'axios'; // Import this in your actual project
import { useRecoilValue } from 'recoil';
import { userStates } from '../../atoms';
import { API_URL, r2Service } from '../../config';
import { TabNavigator } from '../components/common/TabNavigator';
import { getThumbnailUrl } from '../utils/youtube';


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
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})$/;
    return pattern.test(url);
  };

  const handleYoutubeUrlChange = (e) => {
    const url = e.target.value;
    setVideoData(prev => ({
      ...prev,
      linkyoutube_link: url,
      thumbnail: getThumbnailUrl(url),
      video_url: ''
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid video file (MP4, MPEG, MOV, WebM)');
        return;
      }
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
        return;
      }
      setSelectedFile(file);
      setError(null);
      setVideoData(prev => ({...prev, linkyoutube_link: '', thumbnail: ''}));
    }
  };

  const uploadToR2 = async (file) => {
    try {
      setUploadProgress(0);
      r2Service.validateFile(file, { maxSize: 100 * 1024 * 1024, allowedTypes: ['video/mp4','video/mpeg','video/quicktime','video/webm'] });
      
      // Create upload progress handler
      const onProgress = (progress) => {
        setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
      };
      
      const result = await r2Service.uploadFile(file, 'videos', userState.id, onProgress);
      console.log('R2 upload result:', result); // Debug full result

      if (!result || !result.url) {
        console.error('Invalid response from R2:', result);
        throw new Error('Upload successful but no URL in response');
      }

      setUploadProgress(100);
      console.log('R2 upload successful, URL:', result.url);
      return result.url;
    } catch (err) {
      console.error('R2 Upload Error:', err);
      setUploadProgress(0);
      throw new Error(err.message || 'Failed to upload video file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      let payload = {
        ...videoData,
        linkyoutube_link: '',
        video_url: '',
        thumbnail: ''
      };

      if (uploadType === 'youtube') {
        if (!validateYoutubeUrl(videoData.linkyoutube_link)) {
          throw new Error('Please enter a valid YouTube video URL');
        }
        payload.linkyoutube_link = videoData.linkyoutube_link;
        payload.thumbnail = getThumbnailUrl(videoData.linkyoutube_link);
      } else {
        if (!selectedFile) {
          throw new Error('Please select a video file to upload');
        }
        try {
          const videoUrl = await uploadToR2(selectedFile);
          if (!videoUrl) {
            throw new Error('No URL returned from storage service');
          }
          console.log('Setting video URL in payload:', videoUrl);
          
          payload = {
            ...payload,
            video_url: videoUrl, // The URL from R2 is already properly formatted
            thumbnail: '/placeholder-video-thumbnail.jpg'
          };
          
          console.log('Final payload after setting URL:', payload);
        } catch (uploadError) {
          console.error('R2 Upload Error Details:', uploadError);
          setError('Failed to upload video file: ' + (uploadError.message || 'Unknown error'));
          throw uploadError;
        }
      }

      // If using custom category, set it as the category
      if (isCustomCategory && videoData.customCategory) {
        payload.category = videoData.customCategory;
      }

      // Clean up payload
      delete payload.customCategory;
      
      console.log('Submitting payload:', payload); // Debug log

      try {
        await axios.post(`${API_URL}/api/videos`, payload);
        setSuccess(true);
        setVideoData(prev => ({
          ...prev, 
          title: '',
          linkyoutube_link: '',
          video_url: '',
          thumbnail: '',
          category: '',
          customCategory: '',
          position: 0,
          description: '',
          ageGroup: ''
        }));
        setSelectedFile(null);
        setUploadProgress(0);
      } catch (apiError) {
        console.error('API Error Details:', apiError.response?.data || apiError);
        throw new Error(apiError.response?.data?.message || 'Failed to save video information');
      }
    } catch (err) {
      setError(err.message || 'Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const {name,value} = e.target;
    setVideoData(prev => ({...prev, [name]:value}));
  };

  const categoryOptions = [
    {name:'Daily routine', slug:'my_world_daily_life'},
    {name:'Home', slug:'home'},
    {name:'School', slug:'school'},
    {name:'Therapy', slug:'therapy'},
    {name:'Activities', slug:'activities'},
    {name:'Family & Friends', slug:'family_friends'},
    {name:'Toys & Games', slug:'toys_games'},
    {name:'Food & Drink', slug:'food_drink'},
    {name:'Places', slug:'places'}
  ];

  const ageGroups = ['3-5 years','6-8 years','9-11 years','12-14 years','15-17 years','18+ years'];

  return (
    <div className="container mx-auto p-4">
      <TabNavigator />
      <h1 className="text-2xl font-bold mb-6 text-[#3c9202]">Upload Educational Video</h1>

      <div className="bg-[#e5f5d5] border-l-4 border-[#58cc02] p-4 mb-6 rounded-xl">
        <h2 className="text-lg font-bold text-[#3c9202] mb-2">How to Upload a Video</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-[#3c9202]">Option 1: YouTube Link</h3>
            <ol className="list-decimal list-inside text-[#2e7502] ml-4">
              <li>Find an educational video on YouTube</li>
              <li>Copy the YouTube video URL</li>
              <li>Paste it in the YouTube Link field</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold text-[#3c9202]">Option 2: Upload Video File</h3>
            <ol className="list-decimal list-inside text-[#2e7502] ml-4">
              <li>Select a video file (MP4, MOV, WebM)</li>
              <li>File size below 100MB</li>
              <li>Video uploaded to secure cloud storage</li>
            </ol>
          </div>
        </div>
        <p className="mt-3 text-sm text-[#3c9202]">Fill in required fields then click “Upload Video”</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl">{error}</div>}
          {success && <div className="bg-[#e5f5d5] border-l-4 border-[#58cc02] text-[#3c9202] p-4 rounded-xl">Video successfully uploaded!</div>}

          {/* Upload Type */}
          <div>
            <span className="block font-bold mb-2 text-[#3c9202]">Upload Method *</span>
            <div className="flex space-x-4">
              <label className="flex items-center"><input type="radio" value="youtube" checked={uploadType==='youtube'} onChange={e=>{setUploadType('youtube');setError(null);}} className="mr-2"/>YouTube</label>
              <label className="flex items-center"><input type="radio" value="r2" checked={uploadType==='r2'} onChange={e=>{setUploadType('r2');setError(null);}} className="mr-2"/>File Upload</label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-bold mb-2 text-[#3c9202]">Title *</label>
            <input type="text" name="title" value={videoData.title} onChange={handleChange} required className="w-full border px-4 py-2 rounded focus:border-[#58cc02]" placeholder="Video title"/>
          </div>

          {/* YouTube URL */}
          {uploadType==='youtube' && (
            <div>
              <label className="block font-bold mb-2 text-[#3c9202]">YouTube URL *</label>
              <input type="url" name="linkyoutube_link" value={videoData.linkyoutube_link} onChange={handleYoutubeUrlChange} required className="w-full border px-4 py-2 rounded focus:border-[#58cc02]" placeholder="https://youtu.be/..."/>
            </div>
          )}

          {/* File Upload */}
          {uploadType==='r2' && (
            <div>
              <label className="block font-bold mb-2 text-[#3c9202]">Select File *</label>
              <input 
                type="file" 
                accept="video/mp4,video/mpeg,video/quicktime,video/webm" 
                onChange={handleFileSelect} 
                required 
                className="block w-full text-sm text-gray-500 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-[#58cc02] file:text-white hover:file:bg-[#47b102]"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected file: {selectedFile.name} ({Math.round(selectedFile.size / 1024 / 1024)}MB)
                </p>
              )}
              {uploadProgress > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-[#58cc02] h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-sm text-[#3c9202]">Uploading... {uploadProgress}%</p>
                </div>
              )}
            </div>
          )}

          {/* Category & Custom */}
          <div>
            <label className="block font-bold mb-2 text-[#3c9202]">Category *</label>
            <select name="category" value={videoData.category} onChange={e=>{if(e.target.value==='custom'){setIsCustomCategory(true)}else{setIsCustomCategory(false);handleChange(e)}}} required className="w-full border px-4 py-2 rounded focus:border-[#58cc02]">
              <option value="">--Select Category--</option>
              {categoryOptions.map(c=> <option key={c.slug} value={c.slug}>{c.name}</option>)}
              <option value="custom">Custom</option>
            </select>
            {isCustomCategory && <input type="text" name="customCategory" value={videoData.customCategory} onChange={handleChange} placeholder="Custom category" className="mt-2 w-full border px-4 py-2 rounded focus:border-[#58cc02]" />}
          </div>

          {/* Age Group */}
          <div>
            <label className="block font-bold mb-2 text-[#3c9202]">Age Group *</label>
            <select name="ageGroup" value={videoData.ageGroup} onChange={handleChange} required className="w-full border px-4 py-2 rounded focus:border-[#58cc02]">
              <option value="">--Select Age Group--</option>
              {ageGroups.map(a=> <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold mb-2 text-[#3c9202]">Description</label>
            <textarea name="description" value={videoData.description} onChange={handleChange} rows={4} className="w-full border px-4 py-2 rounded focus:border-[#58cc02]" placeholder="Optional description" />
          </div>

          {/* Thumbnail Preview */}
          {videoData.thumbnail && <img src={videoData.thumbnail} alt="Thumbnail" className="w-full max-w-xs rounded mt-2" />}

          {/* Teacher Name */}
          <div>
            <label className="block font-bold mb-2 text-[#3c9202]">Teacher</label>
            <input type="text" name="name" value={videoData.name} disabled className="w-full border px-4 py-2 rounded bg-gray-100 cursor-not-allowed" />
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="w-full bg-[#58cc02] py-2 rounded text-white font-bold hover:bg-[#47b102] disabled:opacity-50">
            {loading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VideoUploadPage;
