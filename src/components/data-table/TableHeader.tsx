
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TableHeaderProps {
  searchText: string;
  setSearchText: (value: string) => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({ searchText, setSearchText }) => {
  return (
    <div className="p-4 border-b border-gray-100 w-full">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          type="text"
          placeholder="Zoek op klantnummer of klantnaam"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-200 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-buzzaroo-blue/20"
        />
      </div>
    </div>
  );
};

export default TableHeader;
