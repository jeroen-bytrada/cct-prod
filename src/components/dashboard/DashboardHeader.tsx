
import React from 'react';

interface DashboardHeaderProps {
  username?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ username = 'Jeroen' }) => {
  return (
    <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Welkom, {username} 👋</h1>
      <p className="text-gray-600">Openstaande documenten in Snelstart en Dropbox</p>
    </div>
  );
};

export default DashboardHeader;
