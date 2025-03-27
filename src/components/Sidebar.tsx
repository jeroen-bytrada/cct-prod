
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Settings, LogOut, BarChart2, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import Logo from './Logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Sidebar as ShadcnSidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from '@/components/ui/sidebar';

const Sidebar: React.FC = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(true);

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
    { to: "/", icon: <Home />, text: "Dashboard" },
    { to: "/clients", icon: <Users />, text: "Klanten" },
    { to: "/deals", icon: <BarChart2 />, text: "Deals" },
    { to: "/contacts", icon: <Phone />, text: "Contacts" },
    { to: "/settings", icon: <Settings />, text: "Instellingen", adminBadge: !isAdmin }
  ];

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <ShadcnSidebar className="border-r border-gray-200 bg-white">
        <div className="flex h-[60px] items-center justify-between px-4">
          <Logo collapsed={!open} />
          <SidebarTrigger className="ml-auto">
            {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </SidebarTrigger>
        </div>
        
        <SidebarContent className="px-3 py-2">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => cn(
                    "w-full",
                    open ? "" : "flex justify-center"
                  )}
                >
                  {({ isActive }) => (
                    <SidebarMenuButton 
                      className={cn(
                        "w-full", 
                        isActive 
                          ? "bg-buzzaroo-lightgreen text-buzzaroo-green" 
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                      tooltip={open ? undefined : item.text}
                    >
                      <span className="transition-transform duration-200 group-hover:scale-110">
                        {item.icon}
                      </span>
                      {open && (
                        <>
                          <span>{item.text}</span>
                          {item.adminBadge && (
                            <span className="ml-1 text-xs bg-gray-200 text-gray-700 px-1 rounded">Admin</span>
                          )}
                        </>
                      )}
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        
        {user && (
          <SidebarFooter className="border-t border-gray-200 p-4">
            {open ? (
              <div className="flex flex-col gap-3">
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
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-all duration-200"
                  title={user.user_metadata.full_name || user.email}
                >
                  <Avatar className="h-7 w-7 transition duration-300">
                    <AvatarImage src={user.user_metadata.avatar_url} />
                    <AvatarFallback>{getInitials(user.user_metadata.full_name || user.email)}</AvatarFallback>
                  </Avatar>
                </button>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="mt-2" 
                  onClick={handleSignOut}
                  title="Uitloggen"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            )}
          </SidebarFooter>
        )}
      </ShadcnSidebar>
    </SidebarProvider>
  );
};

export default Sidebar;
