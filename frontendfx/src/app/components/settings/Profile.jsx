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
      <SettingSection icon={User} title="Profile Information">
        <div className='flex flex-col sm:flex-row items-center mb-6'>
          {renderProfileImage()}
          <div>
            <h3 className='text-lg font-semibold text-gray-800'>
              {userState.username || 'Username'}
            </h3>
            <p className='text-gray-600'>
              {userState.email || 'email@example.com'}
            </p>
            {!userState.isEmailVerified && (
              <span className='text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium'>
                Email not verified
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
            <p className="text-sm font-medium text-gray-600 mb-1">Full Name</p>
            <p className="text-gray-900">{fullName}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
            <p className="text-sm font-medium text-gray-600 mb-1">Phone</p>
            <p className="text-gray-900">{userState.phoneNumber || 'Not specified'}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
            <p className="text-sm font-medium text-gray-600 mb-1">Blood Group</p>
            <p className="text-gray-900">{userState.bloodGroup || 'Not specified'}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
            <p className="text-sm font-medium text-gray-600 mb-1">Date of Birth</p>
            <p className="text-gray-900">{formattedDate}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
            <p className="text-sm font-medium text-gray-600 mb-1">Gender</p>
            <p className="text-gray-900">{userState.gender || 'Not specified'}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
            <p className="text-sm font-medium text-gray-600 mb-1">Address</p>
            <p className="text-gray-900">{userState.address || 'Not specified'}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
            <p className="text-sm font-medium text-gray-600 mb-1">Emergency Contact</p>
            <p className="text-gray-900">{userState.emergencyContact || 'Not specified'}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
            <p className="text-sm font-medium text-gray-600 mb-1">Bio</p>
            <p className="text-gray-900">{userState.bio || 'Not specified'}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
            <p className="text-sm font-medium text-gray-600 mb-1">Location</p>
            <p className="text-gray-900">{userState.location || 'Not specified'}</p>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className='bg-sky_blue-500 hover:bg-sky_blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 w-full sm:w-auto'
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
