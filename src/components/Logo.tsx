
import React from 'react';
import { cn } from "@/lib/utils";
import { useSidebar } from '@/components/ui/sidebar';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <div className={cn("flex items-center gap-2", isCollapsed ? "justify-center" : "", className)}>
      <img 
        src="/lovable-uploads/2fab8879-4fd5-40f5-9771-6bdcf8671e7d.png" 
        alt="Buzzaroo Logo" 
        className="h-8 w-auto animate-fade-in" 
        style={{ animationDelay: '0.1s' }} 
      />
      {!isCollapsed && (
        <span className="font-bold text-xl text-gray-800 animate-fade-in" style={{ animationDelay: '0.3s' }}>Buzzaroo</span>
      )}
    </div>
  );
};

export default Logo;
