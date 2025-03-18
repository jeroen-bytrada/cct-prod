
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Settings } from 'lucide-react';
import { cn } from "@/lib/utils";
import Logo from './Logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-[190px] h-screen bg-white border-r border-gray-200 fixed left-0 top-0 overflow-y-auto animate-slide-down flex flex-col">
      <div className="p-6">
        <Logo className="mb-8 mt-2" />
        <nav className="space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-md py-2 px-3 transition-all duration-200 group",
              isActive 
                ? "bg-buzzaroo-lightgreen text-buzzaroo-green font-medium" 
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <Home size={20} className="transition-transform duration-200 group-hover:scale-110" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/clients"
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-md py-2 px-3 transition-all duration-200 group",
              isActive 
                ? "bg-buzzaroo-lightgreen text-buzzaroo-green font-medium" 
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <Users size={20} className="transition-transform duration-200 group-hover:scale-110" />
            <span>Klanten</span>
          </NavLink>
        </nav>
      </div>
      
      {/* Profile and Settings at the bottom */}
      <div className="mt-auto p-4 border-t border-gray-200">
        <div className="flex flex-col gap-3">
          <NavLink
            to="/settings"
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-md py-2 px-3 transition-all duration-200 group",
              isActive 
                ? "bg-buzzaroo-lightgreen text-buzzaroo-green font-medium" 
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <Settings size={20} className="transition-transform duration-200 group-hover:scale-110" />
            <span>Instellingen</span>
          </NavLink>
          
          <div className="flex items-center gap-3 rounded-md py-2 px-3 text-gray-700 hover:bg-gray-100 cursor-pointer transition-all duration-200">
            <Avatar className="h-7 w-7 transition duration-300">
              <AvatarImage src="https://randomuser.me/api/portraits/women/32.jpg" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span>Profiel</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
