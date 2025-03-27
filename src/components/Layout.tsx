
import React from 'react';
import Sidebar from './Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <Sidebar />
        <main className="flex-1 transition-all duration-300 ease-in-out">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};
