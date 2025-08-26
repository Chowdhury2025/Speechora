import React, { useState, useEffect } from 'react';
import { Table } from '../../components/lessons/Table';
import axios from 'axios';
import { API_URL, uploadService } from '../../../config';
import { useNavigate } from 'react-router-dom';
import LessonReviewModal from '../../modals/LessonReviewModal';
import LessonEditModal from '../../modals/LessonEditModal';

export default function LessonsPage() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
    setSelectedLesson(lesson);
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedLesson) return;
    
    try {
      // First, delete any R2 files associated with the lesson
      if (selectedLesson.imageUrl) {
        try {
          await uploadService.deleteFile(selectedLesson.imageUrl);
        } catch (error) {
          console.error('Error deleting image from storage:', error);
          setError('Failed to delete image from storage. Please try again.');
          return; // Stop the deletion process if deletion fails
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
    return (      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#58cc02]"></div>
        <span className="ml-2 text-slate-600 font-medium">Loading...</span>
      </div>
    );
  }
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lessons</h1>
        <button          className="bg-[#58cc02] hover:bg-[#47b102] text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 border-b-2 border-[#3c9202] hover:border-[#2e7502] focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2 flex items-center gap-2"
          onClick={() => navigate('/app/lessons/create')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Create New Lesson
        </button>
      </div>      <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 mb-6 p-4">
        <div className="flex gap-4">
          <div className="w-64">
            <label className="block text-sm font-bold text-slate-600 mb-1">
              Subject
            </label>
            <select
              value={filters.subject}
              onChange={handleFilterChange('subject')}
              className="mt-1 block w-full rounded-xl border-2 border-slate-200 shadow-sm p-2 focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] transition-colors duration-200"
            >
              <option value="">All</option>
              <option value="math">Mathematics</option>
              <option value="science">Science</option>
              <option value="english">English</option>
            </select>
          </div>

          <div className="w-64">            <label className="block text-sm font-bold text-slate-600 mb-1">
              Age Group
            </label>
            <select
              value={filters.ageGroup}
              onChange={handleFilterChange('ageGroup')}
              className="mt-1 block w-full rounded-xl border-2 border-slate-200 shadow-sm p-2 focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] transition-colors duration-200"
            >
              <option value="">All</option>
              <option value="5-7">5-7 years</option>
              <option value="8-10">8-10 years</option>
              <option value="11-13">11-13 years</option>
              <option value="14-16">14-16 years</option>
            </select>
          </div>
        </div>
      </div>      {error && (
        <div className="bg-[#ffd4d4] border-2 border-[#ff4b4b] text-[#ff4b4b] p-4 rounded-xl mb-4 font-medium">
          {error}
        </div>
      )}
        <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200">
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
                    onClick={() => handleReviewClick(params.row)}                    className="px-4 py-2 text-sm bg-[#58cc02] text-white rounded-xl hover:bg-[#47b102] transition-colors duration-200 border-b-2 border-[#3c9202] hover:border-[#2e7502] font-bold"
                  >
                    Review
                  </button>
                  <button
                    onClick={() => handleEdit(params.row)}
                    className="px-4 py-2 text-sm bg-[#1cb0f6] text-white rounded-xl hover:bg-[#0095d9] transition-colors duration-200 border-b-2 border-[#0080bc] hover:border-[#0076ad] font-bold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteDialog(params.row)}
                    className="px-4 py-2 text-sm border-2 border-[#ff4b4b] text-[#ff4b4b] rounded-xl hover:bg-[#ffd4d4] transition-colors duration-200 font-bold"
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
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">          <div className="flex items-center justify-center min-h-full p-4 text-center">
            <div className="fixed inset-0 bg-slate-900 bg-opacity-50 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setDeleteDialogOpen(false)}></div>
            <div className="relative bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg w-full mx-4 border-2 border-slate-200">
              <div className="bg-white px-6 pt-6 pb-5">
                <h3 className="text-2xl font-bold text-slate-700" id="modal-title">
                  Delete Lesson
                </h3>
                <div className="mt-4">
                  <p className="text-base text-slate-600">
                    Are you sure you want to delete the lesson "<span className="text-slate-700 font-semibold">{selectedLesson?.title}</span>"?
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-4 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 bg-[#ff4b4b] text-white font-bold rounded-xl hover:bg-[#f53e3e] transition-colors duration-200 border-b-2 border-[#dc3e3e] hover:border-[#d03636] focus:outline-none focus:ring-2 focus:ring-[#ff4b4b] focus:ring-offset-2"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteDialogOpen(false)}
                  className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 bg-white text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors duration-200 border-2 border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
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

      <LessonEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        lesson={selectedLesson}
        onUpdate={fetchLessons}
      />
      </div>
  );
}
