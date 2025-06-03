import { useState } from 'react';
import { User, Mars, Venus } from "lucide-react";
import { useRecoilValue } from 'recoil';
import { userStates } from '../../../atoms';
import SettingSection from "./SettingSection";
import ProfileUpdateModal from '../../modals/ProfileUpdateModal';

const Profile = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userState = useRecoilValue(userStates);

  // Format date of birth for display if it exists
  const formattedDate = userState.dateOfBirth 
    ? new Date(userState.dateOfBirth).toLocaleDateString() 
    : 'Not specified';

  // Build full name from firstName, middleName, lastName
  const fullName = [userState.firstName, userState.middleName, userState.lastName]
    .filter(Boolean)
    .join(' ') || 'Not specified';

  // Render profile image or conditional icon
  const renderProfileImage = () => {
    if (userState.profilePicture) {
      return (
        <img
          src={userState.profilePicture}
          alt='Profile'
          className='rounded-full w-20 h-20 object-cover mr-4'
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/80?text=User';
          }}
        />
      );
    } else {
      // Check gender for icon
      const gender = (userState.gender || '').toLowerCase();
      if (gender === 'male') {
        return <Mars className="w-20 h-20 text-gray-100 mr-4" />;
      } else if (gender === 'female') {
        return <Venus className="w-20 h-20 text-gray-100 mr-4" />;
      } else {
        return <span className="text-4xl mr-4" role="img" aria-label="cow">🐮</span>;
      }
    }
  };

  return (
    <>
      <SettingSection icon={User} title={"Profile"}>
        <div className='flex flex-col sm:flex-row items-center mb-6'>
          {renderProfileImage()}
          <div>
            <h3 className='text-lg font-semibold text-gray-100'>
              {userState.username || 'Username'}
            </h3>
            <p className='text-gray-400'>
              {userState.email || 'email@example.com'}
            </p>
            {!userState.isEmailVerified && (
              <span className='text-xs text-yellow-400'>Email not verified</span>
            )}
          </div>
        </div>

        {/* New section for additional fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700 p-3 rounded">
            <p className="text-sm text-gray-400">Full Name</p>
            <p className="text-gray-100">{fullName}</p>
          </div>
          
          <div className="bg-gray-700 p-3 rounded">
            <p className="text-sm text-gray-400">Phone</p>
            <p className="text-gray-100">{userState.phoneNumber || 'Not specified'}</p>
          </div>
          
          <div className="bg-gray-700 p-3 rounded">
            <p className="text-sm text-gray-400">Blood Group</p>
            <p className="text-gray-100">{userState.bloodGroup || 'Not specified'}</p>
          </div>
          
          <div className="bg-gray-700 p-3 rounded">
            <p className="text-sm text-gray-400">Date of Birth</p>
            <p className="text-gray-100">{formattedDate}</p>
          </div>
          
          <div className="bg-gray-700 p-3 rounded">
            <p className="text-sm text-gray-400">Gender</p>
            <p className="text-gray-100">{userState.gender || 'Not specified'}</p>
          </div>
          
          <div className="bg-gray-700 p-3 rounded">
            <p className="text-sm text-gray-400">Address</p>
            <p className="text-gray-100">{userState.address || 'Not specified'}</p>
          </div>
          
          <div className="bg-gray-700 p-3 rounded">
            <p className="text-sm text-gray-400">Emergency Contact</p>
            <p className="text-gray-100">{userState.emergencyContact || 'Not specified'}</p>
          </div>

          <div className="bg-gray-700 p-3 rounded">
            <p className="text-sm text-gray-400">Bio</p>
            <p className="text-gray-100">{userState.bio || 'Not specified'}</p>
          </div>
          
          <div className="bg-gray-700 p-3 rounded">
            <p className="text-sm text-gray-400">Location</p>
            <p className="text-gray-100">{userState.location || 'Not specified'}</p>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className='bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 w-full sm:w-auto'
        >
          Edit Profile
        </button>
      </SettingSection>
      
      <ProfileUpdateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default Profile;
