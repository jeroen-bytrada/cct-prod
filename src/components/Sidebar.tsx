
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import Logo from './Logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/contexts/SidebarContext';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';

const Sidebar: React.FC = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { collapsed, toggleSidebar } = useSidebar();

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
    <aside 
      className={cn(
        "h-screen bg-white border-r border-gray-200 fixed left-0 top-0 overflow-y-auto animate-slide-down flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-[60px]" : "w-[190px]"
      )}
    >
      <div className={cn("p-6", collapsed && "p-3")}>
        <div className="flex justify-between items-center mb-8 mt-2">
          {!collapsed && <Logo />}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="rounded-full hover:bg-gray-100"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>
        <nav className="space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-md py-2 px-3 transition-all duration-200 group",
              isActive 
                ? "bg-buzzaroo-lightgreen text-buzzaroo-green font-medium" 
                : "text-gray-700 hover:bg-gray-100",
              collapsed && "justify-center px-2"
            )}
            title="Dashboard"
          >
            <Home size={20} className="transition-transform duration-200 group-hover:scale-110" />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
          <NavLink
            to="/clients"
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-md py-2 px-3 transition-all duration-200 group",
              isActive 
                ? "bg-buzzaroo-lightgreen text-buzzaroo-green font-medium" 
                : "text-gray-700 hover:bg-gray-100",
              collapsed && "justify-center px-2"
            )}
            title="Klanten"
          >
            <Users size={20} className="transition-transform duration-200 group-hover:scale-110" />
            {!collapsed && <span>Klanten</span>}
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
                  : "text-gray-700 hover:bg-gray-100",
                collapsed && "justify-center px-2"
              )}
              title="Instellingen"
            >
              <Settings size={20} className="transition-transform duration-200 group-hover:scale-110" />
              {!collapsed && <span>Instellingen</span>}
            </NavLink>
          )}
          
          {user ? (
            <Collapsible
              open={!collapsed}
              className="w-full"
            >
              <CollapsibleContent>
                {/* Only show the profile button when expanded */}
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-3 rounded-md py-2 px-3 text-gray-700 hover:bg-gray-100 transition-all duration-200 w-full text-left"
                  title={user.user_metadata.full_name || user.email}
                >
                  <Avatar className="h-7 w-7 transition duration-300">
                    <AvatarImage src={user.user_metadata.avatar_url} />
                    <AvatarFallback>{getInitials(user.user_metadata.full_name || user.email)}</AvatarFallback>
                  </Avatar>
                  <span className="truncate">{user.user_metadata.full_name || user.email}</span>
                </button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center justify-center gap-2 mt-2 w-full" 
                  onClick={handleSignOut}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </Button>
              </CollapsibleContent>
              
              {/* When collapsed, only show the avatar button */}
              {collapsed && (
                <button
                  onClick={() => navigate('/profile')}
                  className="flex justify-center items-center rounded-md py-2 text-gray-700 hover:bg-gray-100 transition-all duration-200 w-full"
                  title={user.user_metadata.full_name || user.email}
                >
                  <Avatar className="h-7 w-7 transition duration-300">
                    <AvatarImage src={user.user_metadata.avatar_url} />
                    <AvatarFallback>{getInitials(user.user_metadata.full_name || user.email)}</AvatarFallback>
                  </Avatar>
                </button>
              )}
            </Collapsible>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className={cn("w-full", collapsed && "p-2")}
              onClick={() => navigate('/auth')}
              title="Sign In"
            >
              {collapsed ? <LogOut size={16} /> : "Sign In"}
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
