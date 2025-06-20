import React, { useState } from 'react';

export default function LessonReviewModal({ isOpen, onClose, lesson }) {
  if (!isOpen || !lesson) return null;

  const [imageLoadError, setImageLoadError] = useState({});

  // Helper function to determine if a string is a URL
  const isUrl = (str) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  // Helper function to determine content type
  const getContentType = (content, specifiedType) => {
    if (specifiedType) return specifiedType;
    if (isUrl(content) && /\.(jpg|jpeg|png|gif|webp)$/i.test(content)) return 'image_url';
    return 'text';
  };

  // Handle image loading errors
  const handleImageError = (key, e) => {
    console.error(`Failed to load image for ${key}`, e);
    setImageLoadError(prev => ({ ...prev, [key]: true }));
    e.target.src = '/placeholder-image.png';
  };

  // Render content based on type
  const renderContent = (content, type, label = '') => {
    const contentType = getContentType(content, type);
    
    if (contentType === 'image_url' && !imageLoadError[label]) {
      return (
        <div className="relative">
          <img
            src={content}
            alt={`${label || 'Content'}`}
            className="max-w-full rounded-lg shadow-sm"
            onError={(e) => handleImageError(label, e)}
            loading="lazy"
          />
          {content && (
            <a 
              href={content} 
              target="_blank" 
              rel="noopener noreferrer"
              className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs hover:bg-opacity-75"
            >
              View Full Size
            </a>
          )}
        </div>
      );
    }
    
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600 whitespace-pre-wrap break-words">{content}</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-3xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-semibold leading-6 text-gray-900" id="modal-title">
                  {lesson.title}
                </h3>
                <div className="mt-2 flex gap-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {lesson.subject}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {lesson.ageGroup}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="mt-6 space-y-6">
              {lesson.description && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-700">Description</p>
                  <p className="mt-1 text-gray-600">{lesson.description}</p>
                </div>
              )}

              {/* Lesson Content */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Lesson Content</h4>
                {renderContent(lesson.statement, lesson.contentType, 'main-content')}
              </div>

              {/* Options */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Options</h4>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  {lesson.options.map((option, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg overflow-hidden">
                      <div className="p-3 bg-gray-100 border-b border-gray-200">
                        <p className="font-medium text-gray-600">Option {index + 1}</p>
                      </div>
                      <div className="p-4">
                        {renderContent(option, lesson.optionType, `option-${index}`)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
