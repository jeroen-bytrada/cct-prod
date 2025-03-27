
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarWidth, setSidebarWidth] = useState(190);
  
  // Use ResizeObserver to detect sidebar width changes
  useEffect(() => {
    const sidebar = document.querySelector('[class*="Collapsible_root"]');
    if (!sidebar) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        // Set a small delay to ensure smooth transition
        setTimeout(() => {
          setSidebarWidth(entry.contentRect.width);
        }, 50);
      }
    });

    resizeObserver.observe(sidebar);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main 
        className="flex-1 p-4 transition-all duration-300 ease-in-out"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        {children}
      </main>
    </div>
  );
};
