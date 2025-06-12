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
            <h2 className="text-2xl font-bold text-[#58cc02]">{userState.username || 'Welcome!'}</h2>
            <p className="text-[#4b4b4b]">{userState.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#f7ffec] p-4 rounded-xl border border-[#e5e5e5] hover:border-[#58cc02] transition-colors duration-200">
            <p className="text-sm font-bold text-[#58cc02] mb-1">Email</p>
            <p className="text-[#4b4b4b]">{userState.email}</p>
          </div>
          
          <div className="bg-[#f7ffec] p-4 rounded-xl border border-[#e5e5e5] hover:border-[#58cc02] transition-colors duration-200">
            <p className="text-sm font-bold text-[#58cc02] mb-1">Phone</p>
            <p className="text-[#4b4b4b]">{userState.phoneNumber || 'Not specified'}</p>
          </div>
          
          <div className="bg-[#f7ffec] p-4 rounded-xl border border-[#e5e5e5] hover:border-[#58cc02] transition-colors duration-200">
            <p className="text-sm font-bold text-[#58cc02] mb-1">Blood Group</p>
            <p className="text-[#4b4b4b]">{userState.bloodGroup || 'Not specified'}</p>
          </div>
          
          <div className="bg-[#f7ffec] p-4 rounded-xl border border-[#e5e5e5] hover:border-[#58cc02] transition-colors duration-200">
            <p className="text-sm font-bold text-[#58cc02] mb-1">Date of Birth</p>
            <p className="text-[#4b4b4b]">{formattedDate}</p>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#58cc02] hover:bg-[#47b102] text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 border-b-2 border-[#3c9202] hover:border-[#2e7502] focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2"
          >
            Edit Profile
          </button>
        </div>
      </SettingSection>
      
      <ProfileUpdateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default Profile;
