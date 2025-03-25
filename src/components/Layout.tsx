
import React from 'react';
import Sidebar from './Sidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <main className="flex-1 p-4 transition-all duration-300 ml-[60px] md:ml-[190px] sidebar-adjusted">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};
