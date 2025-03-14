
import React, { useState } from 'react';
import { 
  Filter, 
  ChevronDown, 
  RotateCcw, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Client {
  id: number;
  name: string;
  total: number;
  faststart: number;
  overview: number;
  date: string;
}

const mockClients: Client[] = [
  { id: 1, name: "John Doe", total: 200, faststart: 200, overview: 100, date: "12.09.2019 - 12.53 PM" },
  { id: 2, name: "John Doe", total: 200, faststart: 200, overview: 100, date: "12.09.2019 - 12.53 PM" },
  { id: 3, name: "John Doe", total: 200, faststart: 200, overview: 100, date: "12.09.2019 - 12.53 PM" },
  { id: 4, name: "John Doe", total: 200, faststart: 200, overview: 100, date: "12.09.2019 - 12.53 PM" },
  { id: 5, name: "John Doe", total: 200, faststart: 200, overview: 100, date: "12.09.2019 - 12.53 PM" },
];

const DataTable: React.FC = () => {
  const [sortBy, setSortBy] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm animate-slide-up" 
         style={{ animationDelay: '0.3s' }}>
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Filter By</span>
            <div className="relative">
              <Button 
                variant="outline" 
                className="flex items-center h-8 text-sm bg-white border-gray-200 gap-1"
              >
                <span>Client number</span>
                <ChevronDown size={14} className="text-gray-500" />
              </Button>
            </div>
            <div className="relative">
              <Button 
                variant="outline" 
                className="flex items-center h-8 text-sm bg-white border-gray-200 gap-1"
              >
                <span>Client Name</span>
                <ChevronDown size={14} className="text-gray-500" />
              </Button>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center h-8 text-sm bg-white border-gray-200 gap-1 text-buzzaroo-red"
          >
            <RotateCcw size={14} className="text-buzzaroo-red" />
            <span>Reset Filter</span>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Klantnr
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Klantnaam
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Totaal
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Snelstart
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Overzicht
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bijgewerkt
              </th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockClients.map((client) => (
              <tr 
                key={client.id} 
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {client.id}
                </td>
                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900">
                  {client.name}
                </td>
                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900">
                  {client.total}
                </td>
                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900">
                  {client.faststart}
                </td>
                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900">
                  {client.overview}
                </td>
                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                  {client.date}
                </td>
                <td className="py-4 px-4 whitespace-nowrap text-sm text-right">
                  <button className="text-green-600 hover:text-green-800 transition-colors">
                    <FileText size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          Showing 1-09 of 78
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 bg-white border-gray-200"
          >
            <ChevronLeft size={16} className="text-gray-500" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 bg-white border-gray-200"
          >
            <ChevronRight size={16} className="text-gray-500" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
