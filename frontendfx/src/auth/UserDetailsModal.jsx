/* eslint-disable react/prop-types */
import axios from 'axios';
import { API_URL } from '../config';
import { useEffect, useState } from 'react';

export default function UserDetailsModal({ userId, isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId]);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/user/details/${userId}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch user details', err);
      setError('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-6 overflow-auto max-h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">User Details</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>

        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {data && (
          <div className="space-y-4 text-sm text-gray-800">
            <div className="grid grid-cols-2 gap-4">
              <div><strong>Username:</strong> {data.username}</div>
              <div><strong>Email:</strong> {data.email}</div>
              <div><strong>Role:</strong> {data.role}</div>
              <div><strong>Verified:</strong> {data.isEmailVerified ? 'Yes' : 'No'}</div>
              <div><strong>Created:</strong> {new Date(data.createdAt).toLocaleString()}</div>
              <div><strong>Group:</strong> {data.group ?? '-'}</div>

              <div><strong>Trial Start:</strong> {data.trialStartDate ? new Date(data.trialStartDate).toLocaleString() : '-'}</div>
              <div><strong>Trial Expiry:</strong> {data.trialExpiry ? new Date(data.trialExpiry).toLocaleString() : '-'}</div>
              <div><strong>Trial Used:</strong> {data.isTrialUsed ? 'Yes' : 'No'}</div>

              <div><strong>Premium Active:</strong> {data.premiumActive ? 'Yes' : 'No'}</div>
              <div><strong>Premium Balance:</strong> {data.premiumBalance ?? 0}</div>
              <div><strong>Premium Deduction:</strong> {data.premiumDeduction ?? 0}</div>
              <div><strong>Premium Expiry:</strong> {data.premiumExpiry ? new Date(data.premiumExpiry).toLocaleString() : '-'}</div>
            </div>

            <div>
              <h4 className="font-semibold">Related Records</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium">Videos ({data.videos.length})</h5>
                  <ul className="list-disc list-inside text-xs text-gray-700 max-h-40 overflow-auto">
                    {data.videos.map(v => (
                      <li key={v.id}>{v.title} - {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : ''}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium">Images ({data.images.length})</h5>
                  <ul className="list-disc list-inside text-xs text-gray-700 max-h-40 overflow-auto">
                    {data.images.map(i => (
                      <li key={i.id}>{i.title} - {i.createdAt ? new Date(i.createdAt).toLocaleDateString() : ''}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium">Tests ({data.tests.length})</h5>
                  <ul className="list-disc list-inside text-xs text-gray-700 max-h-40 overflow-auto">
                    {data.tests.map(t => (
                      <li key={t.id}>{t.title} - {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ''}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium">Quiz Images ({data.quizImages.length})</h5>
                  <ul className="list-disc list-inside text-xs text-gray-700 max-h-40 overflow-auto">
                    {data.quizImages.map(q => (
                      <li key={q.id}>{q.name} ({q.category})</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium">Presentations ({data.presentations.length})</h5>
                  <ul className="list-disc list-inside text-xs text-gray-700 max-h-40 overflow-auto">
                    {data.presentations.map(p => (
                      <li key={p.id}>{p.subject} - {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium">Lessons ({data.lessons.length})</h5>
                  <ul className="list-disc list-inside text-xs text-gray-700 max-h-40 overflow-auto">
                    {data.lessons.map(l => (
                      <li key={l.id}>{l.title}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium">Promo Codes Used ({data.usedPromoCodes.length})</h5>
                  <ul className="list-disc list-inside text-xs text-gray-700 max-h-40 overflow-auto">
                    {data.usedPromoCodes.map(p => (
                      <li key={p.id}>{p.promoCodeId} - ₦{p.amountSaved}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
