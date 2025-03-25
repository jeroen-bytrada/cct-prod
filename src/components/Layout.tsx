
import React from 'react';
import Sidebar from './Sidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 transition-all duration-300 ml-[260px] sidebar-adjusted">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};
