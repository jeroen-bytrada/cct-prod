
import React from 'react';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users } from 'lucide-react';

const Clients: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-[190px] p-8">
        <SearchBar />
        
        <div className="mt-8 flex justify-between items-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Clients</h1>
            <p className="text-gray-600">Manage and view all your clients</p>
          </div>
          <Button className="bg-buzzaroo-green hover:bg-buzzaroo-green/90 flex items-center gap-2">
            <PlusCircle size={18} />
            <span>Add Client</span>
          </Button>
        </div>
        
        <div className="mt-16 flex flex-col items-center justify-center text-center animate-fade-in">
          <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users size={32} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-medium text-gray-800 mb-2">Client Management Coming Soon</h2>
          <p className="text-gray-600 max-w-md mb-6">
            This section is under development. Soon you'll be able to manage all your clients from this page.
          </p>
          <Button variant="outline" className="border-buzzaroo-green text-buzzaroo-green hover:bg-buzzaroo-green/10">
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Clients;
