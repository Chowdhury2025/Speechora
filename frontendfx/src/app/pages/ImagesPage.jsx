import React from 'react';

const ImagesPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Images Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Image upload section */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Upload New Image</h2>
          <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="imageUpload"
              onChange={(e) => {
                // TODO: Handle image upload
                console.log(e.target.files[0]);
              }}
            />
            <label
              htmlFor="imageUpload"
              className="cursor-pointer block p-4 text-gray-600 hover:text-gray-800"
            >
              <div className="flex flex-col items-center">
                <svg
                  className="w-12 h-12 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>Click to upload or drag and drop</span>
                <span className="text-sm text-gray-500">PNG, JPG up to 10MB</span>
              </div>
            </label>
          </div>
        </div>

        {/* Image gallery section */}
        <div className="bg-white p-4 rounded-lg shadow col-span-2">
          <h2 className="text-xl font-semibold mb-3">Image Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* TODO: Replace with actual image data */}
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-400">Image Placeholder</span>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <button className="text-white p-2 hover:text-red-500">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagesPage;
