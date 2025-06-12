import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../atoms';
import { API_URL } from '../../config';

const ImageDetail = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);  const { id } = useParams();
  const user = useRecoilValue(userStates);
  const navigate = useNavigate();

  useEffect(() => {
    fetchImage();
  }, [id]);
  const fetchImage = async () => {
    try {
      const response = await fetch(`${API_URL}/api/images/${id}`);
      if (!response.ok) throw new Error('Failed to fetch image');
      const data = await response.json();
      setImage(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error loading image');
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!user) {
      alert('Please login to delete images');
      return;
    }

    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`${API_URL}/images/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete image');
      
      alert('Image deleted successfully');
      navigate('/images');
    } catch (error) {
      console.error('Error:', error);
      alert('Error deleting image');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-gray-600">Image not found</p>
        <button
          onClick={() => navigate('/images')}
          className="mt-4 text-blue-500 hover:text-blue-700"
        >
          Back to Images
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate('/images')}
            className="text-blue-500 hover:text-blue-700"
          >
            ← Back to Images
          </button>
          {user && (
            <div className="space-x-4">
              <button
                onClick={() => navigate(`/images/edit/${id}`)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Edit Image
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Delete Image
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <img
            src={image.imageUrl}
            alt={image.title}
            className="w-full h-auto max-h-[600px] object-contain"
          />
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{image.title}</h1>
            {image.description && (
              <p className="text-gray-600 mb-4">{image.description}</p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Age Group</p>
                <p className="font-medium">{image.ageGroup || 'All ages'}</p>
              </div>
              {image.category && (
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{image.category}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">
                  {new Date(image.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">
                  {new Date(image.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDetail;
