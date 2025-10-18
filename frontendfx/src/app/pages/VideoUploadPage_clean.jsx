import React, { useState } from 'react';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../atoms';
import { API_URL, uploadService } from '../../config';
import { TabNavigator } from '../components/common/TabNavigator';

const VideoUploadPage = () => {
  const userState = useRecoilValue(userStates);
  
  const [videoData, setVideoData] = useState({
    title: '',
    video_url: '',
    category: '',
    customCategory: '',
    position: 0,
    description: '',
    ageGroup: '',
    name: userState.username || '',
    textContent: '',
    language: 'en',
    voiceType: 'default',
    speechRate: 1.0
  });
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

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
      if (!selectedFile) {
        throw new Error('Please select a video file to upload');
      }
      
      let payload;
      try {
        const videoUrl = await uploadToR2(selectedFile);
        if (!videoUrl) {
          throw new Error('No URL returned from storage service');
        }
        
        payload = {
          ...videoData,
          video_url: videoUrl,
          textContent: videoData.textContent,
          language: videoData.language,
          voiceType: videoData.voiceType,
          speechRate: parseFloat(videoData.speechRate)
        };
      } catch (uploadError) {
        setError('Failed to upload video file: ' + (uploadError.message || 'Unknown error'));
        throw uploadError;
      }

      if (isCustomCategory && videoData.customCategory) {
        payload.category = videoData.customCategory;
      }

      delete payload.customCategory;

      try {
        await axios.post(`${API_URL}/api/videos`, payload);
        setSuccess(true);
        setVideoData(prev => ({
          ...prev, 
          title: '',
          video_url: '',
          category: '',
          customCategory: '',
          position: 0,
          description: '',
          ageGroup: '',
          textContent: '',
          language: 'en',
          voiceType: 'default',
          speechRate: 1.0
        }));
        setSelectedFile(null);
        setUploadProgress(0);
      } catch (apiError) {
        throw new Error(apiError.response?.data?.message || 'Failed to save video information');
      }
    } catch (err) {
      setError(err.message || 'Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const {name, value} = e.target;
    setVideoData(prev => ({...prev, [name]: value}));
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
            <h3 className="font-semibold text-[#3c9202]">Upload Video File with Audio Narration</h3>
            <ol className="list-decimal list-inside text-[#2e7502] ml-4">
              <li>Select a video file (MP4, MOV, WebM) - file size below 100MB</li>
              <li>Add text content for audio narration (TTS will read this aloud)</li>
              <li>Choose language and voice settings for narration</li>
              <li>Video will be uploaded to secure cloud storage</li>
            </ol>
          </div>
        </div>
        <p className="mt-3 text-sm text-[#3c9202]">Fill in required fields then click "Upload Video". The video will play silently with text-to-speech narration.</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl">{error}</div>}
          {success && <div className="bg-[#e5f5d5] border-l-4 border-[#58cc02] text-[#3c9202] p-4 rounded-xl">Video successfully uploaded!</div>}

          {/* Title */}
          <div>
            <label className="block font-bold mb-2 text-[#3c9202]">Title *</label>
            <input type="text" name="title" value={videoData.title} onChange={handleChange} required className="w-full border px-4 py-2 rounded focus:border-[#58cc02]" placeholder="Video title"/>
          </div>

          {/* File Upload */}
          <div>
            <label className="block font-bold mb-2 text-[#3c9202]">Select Video File *</label>
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

          {/* TTS Content */}
          <div>
            <label className="block font-bold mb-2 text-[#3c9202]">Audio Narration Text *</label>
            <textarea 
              name="textContent" 
              value={videoData.textContent} 
              onChange={handleChange} 
              required 
              rows={4} 
              className="w-full border px-4 py-2 rounded focus:border-[#58cc02]" 
              placeholder="Enter the text that will be read aloud as narration for this video..."
            />
            <p className="mt-1 text-sm text-gray-600">This text will be converted to speech and played as audio narration</p>
          </div>

          {/* TTS Language */}
          <div>
            <label className="block font-bold mb-2 text-[#3c9202]">Narration Language</label>
            <select name="language" value={videoData.language} onChange={handleChange} className="w-full border px-4 py-2 rounded focus:border-[#58cc02]">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="hi">Hindi</option>
              <option value="zh">Chinese</option>
              <option value="ar">Arabic</option>
            </select>
          </div>

          {/* Speech Rate */}
          <div>
            <label className="block font-bold mb-2 text-[#3c9202]">Speech Rate</label>
            <select name="speechRate" value={videoData.speechRate} onChange={handleChange} className="w-full border px-4 py-2 rounded focus:border-[#58cc02]">
              <option value="0.5">Slow (0.5x)</option>
              <option value="0.75">Slower (0.75x)</option>
              <option value="1.0">Normal (1.0x)</option>
              <option value="1.25">Faster (1.25x)</option>
              <option value="1.5">Fast (1.5x)</option>
            </select>
          </div>

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
            {loading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VideoUploadPage;