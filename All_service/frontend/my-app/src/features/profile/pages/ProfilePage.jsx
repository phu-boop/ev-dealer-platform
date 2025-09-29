import React, { useState } from 'react';
import ProfileSidebar from '../components/ProfileSidebar';
import ProfileForm from '../components/ProfileForm';
import SecuritySettings from '../components/SecuritySettings';
 import BillingInfo from '../components/BillingInfo';
// import Notifications from '../components/Notifications';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileForm />;
      case 'security':
        return <SecuritySettings />;
      case 'billing':
        return <BillingInfo />;
      case 'notifications':
        return <Notifications />;
      case 'settings':
        return <div>Cài đặt chung (Coming Soon)</div>;
      default:
        return <ProfileForm />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80">
            <ProfileSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;