import React, { useState, useEffect } from 'react';
import { Table } from '../../components/lessons/Table';
import axios from 'axios';
import { API_URL } from '../../../config';
import { useNavigate } from 'react-router-dom';
import LessonReviewModal from '../../modals/LessonReviewModal';
import { r2Service } from '../../../config/cloudflare';

export default function LessonsPage() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    subject: '',
    ageGroup: '',
  });

  const fetchLessons = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.ageGroup) params.append('ageGroup', filters.ageGroup);      const response = await axios.get(`${API_URL}/api/lessons?${params.toString()}`);
      setLessons(response.data.lessons);
    } catch (error) {
      setError('Failed to fetch lessons');
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [filters]);

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleReviewClick = (lesson) => {
    setSelectedLesson(lesson);
    setIsReviewModalOpen(true);
  };

  const handleEdit = (lesson) => {
    navigate(`/app/lessons/edit/${lesson.id}`);
  };

  const handleDelete = async () => {
    if (!selectedLesson) return;
    
    try {
      // First, delete any R2 files associated with the lesson
      if (selectedLesson.imageUrl) {
        try {
          await r2Service.deleteFile(selectedLesson.imageUrl);
        } catch (error) {
          console.error('Error deleting image from R2:', error);
          setError('Failed to delete image from storage. Please try again.');
          return; // Stop the deletion process if R2 deletion fails
        }
      }

      // Then delete the lesson from the backend
      await axios.delete(`${API_URL}/api/lessons/${selectedLesson.id}`);
      setDeleteDialogOpen(false);
      setSelectedLesson(null);
      await fetchLessons();
      setError('');
    } catch (error) {
      console.error('Error deleting lesson:', error);
      setError(error.response?.data?.message || 'Failed to delete lesson');
      if (error.response?.status === 404) {
        await fetchLessons();
        setDeleteDialogOpen(false);
        setSelectedLesson(null);
      }
    }
  };

  const openDeleteDialog = (lesson) => {
    setSelectedLesson(lesson);
    setDeleteDialogOpen(true);
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lessons</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => navigate('/app/lessons/create')}
        >
          Create New Lesson
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex gap-4">
          <div className="w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              value={filters.subject}
              onChange={handleFilterChange('subject')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="math">Mathematics</option>
              <option value="science">Science</option>
              <option value="english">English</option>
            </select>
          </div>

          <div className="w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age Group
            </label>
            <select
              value={filters.ageGroup}
              onChange={handleFilterChange('ageGroup')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="5-7">5-7 years</option>
              <option value="8-10">8-10 years</option>
              <option value="11-13">11-13 years</option>
              <option value="14-16">14-16 years</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-600 mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow">
        <Table
          rows={lessons || []}
          columns={[
            { field: 'title', headerName: 'Title', flex: 1 },
            { field: 'subject', headerName: 'Subject', flex: 1 },
            { field: 'ageGroup', headerName: 'Age Group', flex: 1 },
            { 
              field: 'createdBy',
              headerName: 'Created By',
              flex: 1,
              valueGetter: (params) => params.row.createdBy?.username || 'Unknown'
            },
            {
              field: 'createdAt',
              headerName: 'Created At',
              flex: 1,
              valueFormatter: (params) => new Date(params.value).toLocaleDateString()
            },
            {
              field: 'actions',
              headerName: 'Actions',
              flex: 1,
              sortable: false,
              renderCell: (params) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReviewClick(params.row)}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
                  >
                    Review
                  </button>
                  <button
                    onClick={() => handleEdit(params.row)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteDialog(params.row)}
                    className="px-3 py-1 text-sm border border-red-600 text-red-600 rounded hover:bg-red-50 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              )
            }
          ]}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          loading={loading}
        />
      </div>

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setDeleteDialogOpen(false)}></div>

            <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Delete Lesson
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete the lesson "{selectedLesson?.title}"?
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteDialogOpen(false)}
                  className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <LessonReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        lesson={selectedLesson}
      />
      </div>
  );
}
