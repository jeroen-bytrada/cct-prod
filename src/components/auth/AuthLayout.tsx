
import React from 'react';
import Logo from '@/components/Logo';

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const AuthLayout = ({ title, children, footer }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-8">
          <Logo className="w-32 h-auto" />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6">
          {title}
        </h1>
        
        {children}
        
        {footer && (
          <div className="text-center mt-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthLayout;
