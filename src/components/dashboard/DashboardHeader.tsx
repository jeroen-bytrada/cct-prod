
import React from 'react';

interface DashboardHeaderProps {
  username?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ username = 'Jeroen' }) => {
  return (
    <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <h1 className="text-2xl font-bold text-gray-900">Welkom, {username} 👋</h1>
      <p className="text-sm text-gray-600">Openstaande documenten in Snelstart en Dropbox</p>
    </div>
  );
};

export default DashboardHeader;
