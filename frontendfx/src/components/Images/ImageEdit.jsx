import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../atoms';
import { API_URL } from '../../config';
import axios from 'axios';

const ImageEdit = () => {
  const { id } = useParams();
  const user = useRecoilValue(userStates);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');

  const ageGroups = [
    '3-5 years',
    '6-8 years',
    '9-11 years',
    '12-14 years',
    '15-17 years',
    '18+ years',
  ];

  useEffect(() => {
    fetchImage();
  }, [id]);

  // Redirect if not logged in (required for editing)
  if (!user) {
    alert('Please login to edit images');
    navigate('/login');
    return null;
  }

  const fetchImage = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/images/${id}`);
      const data = response.data;
      
      setImageUrl(data.imageUrl);
      setTitle(data.title);
      setDescription(data.description || '');
      setAgeGroup(data.ageGroup || '');
      setCategory(data.category || '');
      setName(data.name || '');
    } catch (error) {
      console.error('Error:', error);
      alert('Error loading image');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!title || !imageUrl) {
      alert('Title and image URL are required');
      return;
    }
    
    setSaving(true);

    try {
      await axios.put(
        `${API_URL}/api/images/${id}`,
        {
          imageUrl,
          title,
          description,
          ageGroup,
          category,
          name,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      alert('Image updated successfully');
      navigate(`/images/${id}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating image');
    } finally {
      setSaving(false);
    }
  };

  if (loading || saving) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-2">{saving ? 'Saving changes...' : 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Edit Image</h1>
          <button
            onClick={() => navigate(`/images/${id}`)}
            className="text-blue-500 hover:text-blue-700"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#3C3C3C] text-sm font-bold mb-2">
              Image URL
            </label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[#3C3C3C] text-sm font-bold mb-2">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[#3C3C3C] text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-[#3C3C3C] text-sm font-bold mb-2">
              Age Group
            </label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium text-[#4b4b4b] bg-white"
            >
              <option value="">Select Age Group</option>
              {ageGroups.map((age) => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#3C3C3C] text-sm font-bold mb-2">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
            />
          </div>

          <div>
            <label className="block text-[#3C3C3C] text-sm font-bold mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
            />
          </div>

          {imageUrl && (
            <div className="mt-4">
              <label className="block text-[#3C3C3C] text-sm font-bold mb-2">
                Preview
              </label>
              <img
                src={imageUrl}
                alt="Preview"
                className="max-w-full h-auto max-h-[300px] object-contain border-2 border-slate-200 rounded-xl"
              />
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border-2 border-slate-200 text-[#4b4b4b] font-bold rounded-xl hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#58cc02] hover:bg-[#47b102] text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 border-b-2 border-[#3c9202] hover:border-[#2e7502] focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImageEdit;
