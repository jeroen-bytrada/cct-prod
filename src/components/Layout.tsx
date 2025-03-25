
import React from 'react';
import Sidebar from './Sidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 transition-all duration-300 p-4 ml-[60px] md:ml-[190px] sidebar-adjusted">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};
