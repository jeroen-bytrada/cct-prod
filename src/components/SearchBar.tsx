
import React from 'react';
import { Settings, Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const SearchBar: React.FC = () => {
  return (
    <div className="flex items-center justify-end w-full py-2 px-4 animate-fade-in">
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100 transition duration-200">
          <Settings size={20} className="text-gray-600" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 transition duration-200 relative">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 bg-red-500 w-2 h-2 rounded-full"></span>
        </button>
        <Avatar className="h-9 w-9 transition duration-300 hover:ring-2 hover:ring-offset-2 hover:ring-buzzaroo-blue/30 cursor-pointer">
          <AvatarImage src="https://randomuser.me/api/portraits/women/32.jpg" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default SearchBar;
