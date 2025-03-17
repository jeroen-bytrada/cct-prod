
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, ExternalLink, X } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CustomerDocument, getCustomerDocuments } from '@/lib/supabase';

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
  const { toast } = useToast();

  // Fetch documents whenever the modal opens or customerId changes
  useEffect(() => {
    if (isOpen && customerId) {
      fetchDocuments();
    }
  }, [isOpen, customerId]);

  // Apply search filter when search text changes
  useEffect(() => {
    applySearchFilter();
  }, [searchText, documents]);

  const fetchDocuments = async () => {
    if (!customerId) return;
    
    try {
      setLoading(true);
      
      const data = await getCustomerDocuments(customerId);
      setDocuments(data);
      
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

  const applySearchFilter = () => {
    if (!searchText.trim()) {
      setFilteredDocuments(documents);
      return;
    }
    
    const search = searchText.toLowerCase();
    const filtered = documents.filter(doc => 
      doc.document_name?.toLowerCase().includes(search)
    );
    
    setFilteredDocuments(filtered);
  };

  const resetFilter = () => {
    setSearchText('');
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
      <DialogContent className="sm:max-w-4xl w-full">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        
        <DialogHeader>
          <DialogTitle>Klant Documenten</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {/* Search bar styled like the Klanten screen */}
          <div className="w-full mb-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Zoek op document"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-200 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-buzzaroo-blue/20"
              />
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
          
          <div className="text-sm text-gray-500 mt-4">
            Getoond {filteredDocuments.length > 0 ? `1-${filteredDocuments.length} van ${filteredDocuments.length}` : '0 van 0'} documenten
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDocumentsModal;
