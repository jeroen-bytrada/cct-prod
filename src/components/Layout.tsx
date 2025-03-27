
import React from 'react';
import Sidebar from './Sidebar';
import { useSidebar } from '@/components/ui/sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { open } = useSidebar();
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        open ? "ml-64" : "ml-16" 
      )}>
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

function cn(...inputs: (string | boolean | undefined)[]) {
  return inputs.filter(Boolean).join(" ");
}
