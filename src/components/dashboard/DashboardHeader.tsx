
import React from 'react';
import SearchBar from '@/components/SearchBar';

interface DashboardHeaderProps {
  username?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ username = 'Jeroen' }) => {
  return (
    <div className="flex justify-between items-center w-full mb-6">
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h1 className="text-2xl font-bold text-gray-900">Welkom, {username} 👋</h1>
        <p className="text-sm text-gray-600">Openstaande documenten in Snelstart en Dropbox</p>
      </div>
      <SearchBar />
    </div>
  );
};

export default DashboardHeader;
