import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import this in your actual project
import { useRecoilValue } from 'recoil';
import { userStates } from '../../atoms';
import { API_URL, uploadService } from '../../config';
import { TabNavigator } from '../components/common/TabNavigator';


const VideoUploadPage = () => {
  const userState = useRecoilValue(userStates);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState(null);
  
  const [videoData, setVideoData] = useState({
    title: '',
    video_url: '',
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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId) {
      setIsEditMode(true);
      setEditingVideoId(editId);
      loadVideoForEdit(editId);
    }
  }, []);

  const loadVideoForEdit = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/videos`);
      const video = response.data.find(v => v.id == id);
      if (video) {
        setVideoData({
          title: video.title || '',
          video_url: video.video_url || '',
          category: video.category || '',
          customCategory: '',
          position: video.position || 0,
          description: video.description || '',
          ageGroup: video.ageGroup || '',
          name: video.name || userState.username || ''
        });
        setIsCustomCategory(!categoryOptions.some(c => c.slug === video.category));
        if (!categoryOptions.some(c => c.slug === video.category)) {
          setVideoData(prev => ({ ...prev, customCategory: video.category }));
        }
      }
    } catch (err) {
      setError('Failed to load video for editing');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        uploadService.validateFile(file);
        setSelectedFile(file);
        setError(null);
      } catch (error) {
        setError(error.message);
        setSelectedFile(null);
      }
    }
  };

  const uploadToR2 = async (file) => {
    try {
      setUploadProgress(0);
      uploadService.validateFile(file);
      
      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 200);
      
      const result = await uploadService.uploadFile(file, 'videos');
      clearInterval(progressInterval);
      
      if (!result) {
        throw new Error('Upload successful but no URL returned');
      }

      setUploadProgress(100);
      console.log('Upload successful, URL:', result);
      return result;
    } catch (err) {
      console.error('Upload Error:', err);
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
      let payload;
      if (isEditMode) {
        // For edit, no file upload needed
        payload = {
          ...videoData
        };
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
            ...videoData,
            video_url: videoUrl
          };
          
          console.log('Final payload after setting URL:', payload);
        } catch (uploadError) {
          console.error('Upload Error Details:', uploadError);
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
        if (isEditMode) {
          await axios.put(`${API_URL}/api/videos/${editingVideoId}`, payload);
        } else {
          await axios.post(`${API_URL}/api/videos`, payload);
        }
        setSuccess(true);
        if (!isEditMode) {
          setVideoData(prev => ({
            ...prev, 
            title: '',
            video_url: '',
            category: '',
            customCategory: '',
            position: 0,
            description: '',
            ageGroup: ''
          }));
          setSelectedFile(null);
          setUploadProgress(0);
        }
      } catch (apiError) {
        console.error('API Error Details:', apiError.response?.data || apiError);
        throw new Error(apiError.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'save'} video information`);
      }
    } catch (err) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'upload'} video`);
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
      <h1 className="text-2xl font-bold mb-6 text-[#3c9202]">{isEditMode ? 'Edit Educational Video' : 'Upload Educational Video'}</h1>

      <div className="bg-[#e5f5d5] border-l-4 border-[#58cc02] p-4 mb-6 rounded-xl">
        <h2 className="text-lg font-bold text-[#3c9202] mb-2">How to {isEditMode ? 'Edit' : 'Upload'} a Video</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-[#3c9202]">{isEditMode ? 'Edit Video Information' : 'Upload Video File'}</h3>
            <ol className="list-decimal list-inside text-[#2e7502] ml-4">
              {isEditMode ? (
                <>
                  <li>Modify the video information as needed</li>
                  <li>Update title, category, age group, description</li>
                  <li>Changes will be saved to the database</li>
                </>
              ) : (
                <>
                  <li>Select a video file (MP4, MOV, WebM) - file size below 100MB</li>
                  <li>Fill in the required fields (title, category, age group)</li>
                  <li>Video will be uploaded to secure cloud storage</li>
                </>
              )}
            </ol>
          </div>
        </div>
        <p className="mt-3 text-sm text-[#3c9202]">Fill in required fields then click "{isEditMode ? 'Update' : 'Upload'} Video".</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl">{error}</div>}
          {success && <div className="bg-[#e5f5d5] border-l-4 border-[#58cc02] text-[#3c9202] p-4 rounded-xl">Video successfully {isEditMode ? 'updated' : 'uploaded'}!</div>}

          {/* Title */}
          <div>
            <label className="block font-bold mb-2 text-[#3c9202]">Title *</label>
            <input type="text" name="title" value={videoData.title} onChange={handleChange} required className="w-full border px-4 py-2 rounded focus:border-[#58cc02]" placeholder="Video title"/>
          </div>

          {/* File Upload - only show in upload mode */}
          {!isEditMode && (
            <div>
              <label className="block font-bold mb-2 text-[#3c9202]">Select Video File *</label>
              <input 
                type="file" 
                accept="video/mp4,video/mpeg,video/quicktime,video/webm" 
                onChange={handleFileSelect} 
                required={!isEditMode}
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

          {/* Teacher Name */}
          <div>
            <label className="block font-bold mb-2 text-[#3c9202]">Teacher</label>
            <input type="text" name="name" value={videoData.name} disabled className="w-full border px-4 py-2 rounded bg-gray-100 cursor-not-allowed" />
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="w-full bg-[#58cc02] py-2 rounded text-white font-bold hover:bg-[#47b102] disabled:opacity-50">
            {loading ? (isEditMode ? 'Updating...' : 'Uploading...') : (isEditMode ? 'Update Video' : 'Upload Video')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VideoUploadPage;
