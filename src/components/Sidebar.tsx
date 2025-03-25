
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  Users, 
  Phone, 
  Settings, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { cn } from "@/lib/utils";
import Logo from './Logo';
import { useSidebar } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';

const Sidebar: React.FC = () => {
  const { collapsed, toggleSidebar } = useSidebar();
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/deals', label: 'Deals', icon: BarChart3 },
    { path: '/clients', label: 'Customers', icon: Users },
    { path: '/contacts', label: 'Contacts', icon: Phone },
  ];

  const bottomMenuItems = [
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const renderMenuItem = (item: typeof menuItems[0], index: number) => {
    const isActive = location.pathname === item.path;
    
    return (
      <NavLink
        key={index}
        to={item.path}
        className={({ isActive }) => cn(
          "flex items-center gap-3 p-2 rounded-lg my-1 font-medium transition-all",
          isActive 
            ? "text-indigo-600 bg-indigo-50" 
            : "text-gray-600 hover:bg-gray-100",
          collapsed && "justify-center"
        )}
      >
        <item.icon size={20} />
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    );
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-white shadow-sm transition-all duration-300 z-10",
        collapsed ? "w-16" : "w-[260px]"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header with logo */}
        <div className="p-4 border-b flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/aec21c60-4695-45a4-8a8a-3caeb8e93392.png" 
                alt="Buzzaroo Logo" 
                className="h-7 w-auto" 
              />
              <span className="font-bold text-lg">Buzzaroo CRM</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className={cn("rounded-full", collapsed && "ml-auto mr-auto")}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
        
        {/* Main menu */}
        <div className="flex-1 overflow-y-auto p-3">
          <nav className="flex flex-col">
            {menuItems.map(renderMenuItem)}
          </nav>
        </div>
        
        {/* Bottom menu */}
        <div className="p-3 border-t">
          <nav className="flex flex-col">
            {bottomMenuItems.map(renderMenuItem)}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
