import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';
import LessonReviewModal from '../modals/LessonReviewModal';

export default function LessonsListPage() {
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
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/lessons`);
      setLessons(response.data);
    } catch (err) {
      setError('Failed to load lessons');
      console.error('Error fetching lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewLesson = (lesson) => {
    setSelectedLesson(lesson);
    setIsReviewModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lessons</h1>
        <Link
          to="/app/lessons/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Lesson
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <div
            key={lesson._id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {lesson.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Subject: {lesson.subject}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Age Group: {lesson.ageGroup}
              </p>
              
              {lesson.contentType === 'image_url' && lesson.statement && (
                <div className="mb-4 h-40 overflow-hidden">
                  <img
                    src={lesson.statement}
                    alt="Lesson content"
                    className="w-full h-full object-cover rounded-md"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.png';
                      e.target.classList.add('error-image');
                    }}
                  />
                </div>
              )}

              <button
                onClick={() => handleReviewLesson(lesson)}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
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
