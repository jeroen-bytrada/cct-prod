
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import Logo from './Logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const Sidebar: React.FC = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <Collapsible
      open={!isCollapsed}
      onOpenChange={(open) => setIsCollapsed(!open)}
      className={cn(
        "h-screen bg-white border-r border-gray-200 fixed left-0 top-0 overflow-y-auto animate-slide-down flex flex-col transition-all duration-300",
        isCollapsed ? "w-[60px]" : "w-[190px]"
      )}
    >
      <div className="flex justify-end p-2">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="flex-1 flex flex-col" forceMount>
        <div className={cn("p-6", isCollapsed ? "items-center" : "")}>
          <Logo className={cn("mb-8 mt-2", isCollapsed ? "scale-75" : "")} />
          <nav className="space-y-1">
            <NavLink
              to="/"
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-md py-2 px-3 transition-all duration-200 group",
                isActive 
                  ? "bg-buzzaroo-lightgreen text-buzzaroo-green font-medium" 
                  : "text-gray-700 hover:bg-gray-100",
                isCollapsed ? "justify-center" : ""
              )}
            >
              <Home size={20} className="transition-transform duration-200 group-hover:scale-110" />
              {!isCollapsed && <span>Dashboard</span>}
            </NavLink>
            <NavLink
              to="/clients"
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-md py-2 px-3 transition-all duration-200 group",
                isActive 
                  ? "bg-buzzaroo-lightgreen text-buzzaroo-green font-medium" 
                  : "text-gray-700 hover:bg-gray-100",
                isCollapsed ? "justify-center" : ""
              )}
            >
              <Users size={20} className="transition-transform duration-200 group-hover:scale-110" />
              {!isCollapsed && <span>Klanten</span>}
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-md py-2 px-3 transition-all duration-200 group",
                isActive 
                  ? "bg-buzzaroo-lightgreen text-buzzaroo-green font-medium" 
                  : "text-gray-700 hover:bg-gray-100",
                isCollapsed ? "justify-center" : ""
              )}
            >
              <Settings size={20} className="transition-transform duration-200 group-hover:scale-110" />
              {!isCollapsed && (
                <>
                  <span>Instellingen</span>
                  {!isAdmin && <span className="ml-1 text-xs bg-gray-200 text-gray-700 px-1 rounded">Admin</span>}
                </>
              )}
            </NavLink>
          </nav>
        </div>
      </CollapsibleContent>
      
      {/* Profile and Settings at the bottom */}
      <div className={cn(
        "mt-auto p-4 border-t border-gray-200",
        isCollapsed ? "flex justify-center" : ""
      )}>
        {!isCollapsed ? (
          <div className="flex flex-col gap-3">
            {user ? (
              <>
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-3 rounded-md py-2 px-3 text-gray-700 hover:bg-gray-100 transition-all duration-200 w-full text-left"
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
                  className="flex items-center justify-center gap-2 mt-2" 
                  onClick={handleSignOut}
                >
                  <LogOut size={16} />
                  <span>Uitloggen</span>
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={() => navigate('/auth')}
              >
                Inloggen
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {user ? (
              <>
                <Avatar 
                  className="h-7 w-7 cursor-pointer transition duration-300" 
                  onClick={() => navigate('/profile')}
                >
                  <AvatarImage src={user.user_metadata.avatar_url} />
                  <AvatarFallback>{getInitials(user.user_metadata.full_name || user.email)}</AvatarFallback>
                </Avatar>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={handleSignOut}
                >
                  <LogOut size={16} />
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => navigate('/auth')}
              >
                <LogOut size={16} />
              </Button>
            )}
          </div>
        )}
      </div>
    </Collapsible>
  );
};

export default Sidebar;
