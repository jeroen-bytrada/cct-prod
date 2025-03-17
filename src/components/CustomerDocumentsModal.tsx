
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, Calendar, Tag, ExternalLink } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type CustomerDocument = {
  id: number;
  customer_id: number;
  document_name: string;
  document_path: string;
  document_type: string;
  created_at: string;
};

interface CustomerDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
}

const CustomerDocumentsModal: React.FC<CustomerDocumentsModalProps> = ({ 
  isOpen, 
  onClose,
  customerId
}) => {
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<CustomerDocument[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  // Fetch documents whenever the modal opens or customerId changes
  useEffect(() => {
    if (isOpen && customerId) {
      fetchDocuments();
    }
  }, [isOpen, customerId]);

  // Apply filters when any filter value changes
  useEffect(() => {
    applyFilters();
  }, [searchText, selectedType, dateFrom, dateTo, documents]);

  const fetchDocuments = async () => {
    if (!customerId) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('customer_documents')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setDocuments(data || []);
      
      // Extract unique document types
      const types = [...new Set(data?.map(doc => doc.document_type).filter(Boolean))];
      setDocumentTypes(types as string[]);
      
    } catch (error) {
      console.error('Error fetching customer documents:', error);
      toast({
        title: "Error",
        description: "Failed to load customer documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...documents];
    
    // Apply search filter
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.document_name?.toLowerCase().includes(search)
      );
    }
    
    // Apply type filter
    if (selectedType) {
      filtered = filtered.filter(doc => doc.document_type === selectedType);
    }
    
    // Apply date range filter
    if (dateFrom) {
      filtered = filtered.filter(doc => 
        new Date(doc.created_at) >= new Date(dateFrom.setHours(0, 0, 0, 0))
      );
    }
    
    if (dateTo) {
      filtered = filtered.filter(doc => 
        new Date(doc.created_at) <= new Date(dateTo.setHours(23, 59, 59, 999))
      );
    }
    
    setFilteredDocuments(filtered);
  };

  const resetFilters = () => {
    setSearchText('');
    setSelectedType('');
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd-MM-yyyy HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  const getDocumentTypeColor = (type: string) => {
    const types: Record<string, string> = {
      'invoice': 'bg-blue-100 text-blue-800',
      'receipt': 'bg-green-100 text-green-800',
      'contract': 'bg-purple-100 text-purple-800',
      'report': 'bg-amber-100 text-amber-800',
    };
    
    return types[type?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Klant Documenten</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search and filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Zoek op document naam"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            
            {/* Date From-To */}
            <div className="flex space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, 'dd-MM-yyyy') : 'Van datum'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, 'dd-MM-yyyy') : 'Tot datum'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Type filter */}
            <div className="flex space-x-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <Tag className="mr-2 h-4 w-4" />
                    {selectedType || 'Filter op type'}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle types</SelectItem>
                  {documentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </div>
          
          {/* Documents table */}
          <div className="border rounded-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toegevoegd
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documentnaam
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-4 px-4 text-center text-gray-500">
                      Documenten laden...
                    </td>
                  </tr>
                ) : filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 px-4 text-center text-gray-500">
                      Geen documenten gevonden
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(doc.created_at)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {doc.document_name}
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          className={cn(
                            "font-normal",
                            getDocumentTypeColor(doc.document_type)
                          )}
                          variant="outline"
                        >
                          {doc.document_type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {doc.document_path ? (
                          <a 
                            href={doc.document_path} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                          >
                            <ExternalLink size={16} className="mr-1" />
                            Bekijk
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="text-sm text-gray-500">
            Getoond {filteredDocuments.length > 0 ? `1-${filteredDocuments.length} van ${filteredDocuments.length}` : '0 van 0'} documenten
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDocumentsModal;
