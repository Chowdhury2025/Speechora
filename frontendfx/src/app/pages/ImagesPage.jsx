import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

const ImagesPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/images`);
        setImages(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching images:', error);
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const response = await axios.post(`${API_URL}/api/images/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setImages([response.data, ...images]);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Learning Images</h1>
        <div>
          <input
            type="file"
            id="imageUpload"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploadingImage}
          />
          <label
            htmlFor="imageUpload"
            className={`inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer ${
              uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploadingImage ? 'Uploading...' : 'Upload Image'}
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image) => (
          <div
            key={image.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={image.url}
                alt={image.name}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-1">{image.name}</h3>
              <p className="text-sm text-gray-500 mb-2">
                {new Date(image.createdAt).toLocaleDateString()}
              </p>
              <div className="flex space-x-2">
                <button className="text-sm text-blue-600 hover:text-blue-900">
                  Edit
                </button>
                <button className="text-sm text-red-600 hover:text-red-900">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No images uploaded yet.</p>
        </div>
      )}
    </div>
  );
};

export default ImagesPage;
