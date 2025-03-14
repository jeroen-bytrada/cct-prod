
import React from 'react';
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img 
        src="/lovable-uploads/449f1fa6-512a-451f-a273-6bee8e975fd7.png" 
        alt="Buzzaroo Logo" 
        className="h-8 w-auto animate-fade-in" 
        style={{ animationDelay: '0.1s' }} 
      />
      <span className="font-bold text-xl text-gray-800 animate-fade-in" style={{ animationDelay: '0.3s' }}>Buzzaroo</span>
    </div>
  );
};

export default Logo;
