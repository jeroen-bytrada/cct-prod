
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Settings, LogOut, UserCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import Logo from './Logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Sidebar: React.FC = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

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
          <NavLink
            to="/profile"
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-md py-2 px-3 transition-all duration-200 group",
              isActive 
                ? "bg-buzzaroo-lightgreen text-buzzaroo-green font-medium" 
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <UserCircle size={20} className="transition-transform duration-200 group-hover:scale-110" />
            <span>Profile</span>
          </NavLink>
        </nav>
      </div>
      
      {/* Profile and Settings at the bottom */}
      <div className="mt-auto p-4 border-t border-gray-200">
        <div className="flex flex-col gap-3">
          {isAdmin && (
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
          )}
          
          {user ? (
            <>
              <div className="flex items-center gap-3 rounded-md py-2 px-3 text-gray-700">
                <Avatar className="h-7 w-7 transition duration-300">
                  <AvatarImage src={user.user_metadata.avatar_url} />
                  <AvatarFallback>{getInitials(user.user_metadata.full_name || user.email)}</AvatarFallback>
                </Avatar>
                <span className="truncate">{user.user_metadata.full_name || user.email}</span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center justify-center gap-2 mt-2" 
                onClick={handleSignOut}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
