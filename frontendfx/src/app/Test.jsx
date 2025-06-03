import { useRecoilValue } from 'recoil';
import { userStates } from '../atoms';

const Test = () => {
  const user = useRecoilValue(userStates);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">User Test</h1>
      <div className="bg-white shadow rounded p-6">
        <h2 className="text-2xl font-semibold mb-4">User Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p><strong>User ID:</strong> {user.userId || 'N/A'}</p>
            <p><strong>Username:</strong> {user.username || 'N/A'}</p>
            <p><strong>Last Name:</strong> {user.lastName || 'N/A'}</p>
            <p><strong>Middle Name:</strong> {user.middleName || 'N/A'}</p>
            <p><strong>Email:</strong> {user.email || 'N/A'}</p>
            <p><strong>Phone Number:</strong> {user.phoneNumber || 'N/A'}</p>
            <p><strong>Role:</strong> {user.role || 'N/A'}</p>
            <p><strong>Group:</strong> {user.group || 'N/A'}</p>
          </div>
          <div>
            <p><strong>Email Verified:</strong> {user.isEmailVerified ? 'Yes' : 'No'}</p>
            <p><strong>Blood Group:</strong> {user.bloodGroup || 'N/A'}</p>
            <p><strong>Address:</strong> {user.address || 'N/A'}</p>
            <p><strong>Date of Birth:</strong> {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Gender:</strong> {user.gender || 'N/A'}</p>
            <p><strong>Emergency Contact:</strong> {user.emergencyContact || 'N/A'}</p>
            <p><strong>NRC Card ID:</strong> {user.nrc_card_id || 'N/A'}</p>
          </div>
        </div>
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Warehouse & Store Information</h2>
          <div className="grid grid-cols-1 gap-4">
            <p><strong>Warehouse IDs:</strong> {Array.isArray(user.warehouseIds) ? user.warehouseIds.join(', ') : user.warehouseIds || 'N/A'}</p>
            <p><strong>Store IDs:</strong> {Array.isArray(user.storeIds) ? user.storeIds.join(', ') : user.storeIds || 'N/A'}</p>
            <p><strong>Store Names:</strong> {Array.isArray(user.storeNames) ? user.storeNames.join(', ') : user.storeNames || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;
