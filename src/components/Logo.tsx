
import React from 'react';
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  collapsed?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className, collapsed = false }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img 
        src="/lovable-uploads/2fab8879-4fd5-40f5-9771-6bdcf8671e7d.png" 
        alt="Buzzaroo Logo" 
        className={cn(
          "h-8 w-auto animate-fade-in", 
          collapsed && "mx-auto"
        )}
        style={{ animationDelay: '0.1s' }} 
      />
      {!collapsed && (
        <span className="font-bold text-xl text-gray-800 animate-fade-in" style={{ animationDelay: '0.3s' }}>Buzzaroo</span>
      )}
    </div>
  );
};

export default Logo;
