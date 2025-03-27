
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Settings, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";
import Logo from './Logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';

const Sidebar: React.FC = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { state: sidebarState } = useSidebar();
  const isCollapsed = sidebarState === 'collapsed';

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

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <Home size={20} />,
      path: '/'
    },
    {
      title: 'Klanten',
      icon: <Users size={20} />,
      path: '/clients'
    },
    {
      title: 'Instellingen',
      icon: <Settings size={20} />,
      path: '/settings',
      adminBadge: !isAdmin
    }
  ];

  return (
    <>
      <ShadcnSidebar className="border-r border-gray-200">
        <SidebarHeader className="py-4">
          <Logo className={cn("px-2", isCollapsed ? "justify-center" : "")} />
          <div className="px-2 pt-2">
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  tooltip={isCollapsed ? item.title : undefined}
                >
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 text-sm",
                      isActive 
                        ? "bg-buzzaroo-lightgreen text-buzzaroo-green font-medium" 
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {item.icon}
                    {!isCollapsed && (
                      <>
                        <span>{item.title}</span>
                        {item.adminBadge && <span className="ml-1 text-xs bg-gray-200 text-gray-700 px-1 rounded">Admin</span>}
                      </>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        
        <SidebarFooter className="mt-auto border-t border-gray-200 p-4">
          {user ? (
            <div className="flex flex-col gap-3">
              {!isCollapsed && (
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
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(
                  "flex items-center justify-center gap-2",
                  isCollapsed ? "w-10 p-0 h-10" : "mt-2"
                )}
                onClick={handleSignOut}
              >
                <LogOut size={16} />
                {!isCollapsed && <span>Uitloggen</span>}
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(isCollapsed ? "w-10 p-0 h-10" : "w-full")}
              onClick={() => navigate('/auth')}
            >
              {isCollapsed ? <LogOut size={16} /> : "Inloggen"}
            </Button>
          )}
        </SidebarFooter>
      </ShadcnSidebar>
    </>
  );
};

export default Sidebar;
