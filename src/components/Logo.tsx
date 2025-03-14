
import React from 'react';
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex">
        <div className="h-4 w-4 rounded-full bg-buzzaroo-blue animate-fade-in" style={{ animationDelay: '0.1s' }} />
        <div className="h-4 w-4 rounded-full bg-buzzaroo-green animate-fade-in" style={{ animationDelay: '0.2s' }} />
        <div className="h-4 w-4 rounded-full bg-buzzaroo-purple animate-fade-in" style={{ animationDelay: '0.3s' }} />
        <div className="h-4 w-4 rounded-full bg-buzzaroo-yellow animate-fade-in" style={{ animationDelay: '0.4s' }} />
      </div>
      <span className="font-bold text-xl text-gray-800 animate-fade-in" style={{ animationDelay: '0.5s' }}>Buzzaroo</span>
    </div>
  );
};

export default Logo;
