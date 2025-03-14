
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users } from 'lucide-react';
import { cn } from "@/lib/utils";
import Logo from './Logo';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-[190px] h-screen bg-white border-r border-gray-200 fixed left-0 top-0 overflow-y-auto animate-slide-down">
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
    </aside>
  );
};

export default Sidebar;
