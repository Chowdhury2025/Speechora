import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../config';
import LessonReviewModal from '../../modals/LessonReviewModal';
import { PlusIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function LessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    fetchLessons();
  }, []);
  const fetchLessons = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/lessons`);
      // Ensure we're using the lessons array from the response
      setLessons(response.data.lessons || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setError('Failed to load lessons');
      setLoading(false);
    }
  };

  const handleReviewClick = (lesson) => {
    setSelectedLesson(lesson);
    setIsReviewModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
        <button
          onClick={fetchLessons}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lessons</h1>
        <Link
          to="/app/lessons/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create New Lesson
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <div
            key={lesson._id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900 truncate">
                  {lesson.title}
                </h2>
                <span className="px-2 py-1 text-sm rounded-full bg-gray-100 text-gray-600">
                  {lesson.subject}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-500">Age Group: {lesson.ageGroup}</p>
                <p className="text-gray-600 line-clamp-2">{lesson.description}</p>
              </div>              {lesson.statement && (
                <div className="mb-4">
                  {lesson.statement.type === 'image_url' ? (
                    <div>
                      <img
                        src={lesson.statement.content}
                        alt={lesson.statement.description || "Lesson content"}
                        className="w-full h-32 object-cover rounded mb-2"
                        onError={(e) => {
                          e.target.src = '/placeholder-image.png';
                          e.target.classList.add('error-image');
                        }}
                      />
                      {lesson.statement.description && (
                        <p className="text-sm text-gray-600 italic">
                          {lesson.statement.description}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-800">{lesson.statement.content}</p>
                  )}
                </div>
              )}

              <button
                onClick={() => handleReviewClick(lesson)}
                className="w-full mt-2 inline-flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
              >
                <EyeIcon className="h-5 w-5 mr-2" />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      <LessonReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        lesson={selectedLesson}
      />
    </div>
  );
}
