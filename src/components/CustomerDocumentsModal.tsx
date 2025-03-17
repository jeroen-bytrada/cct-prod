import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Search, ExternalLink, X, Calendar, Filter } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  CustomerDocument, 
  getCustomerDocuments,
  getCustomerById,
  DOCUMENTS_PER_PAGE 
} from '@/lib/supabase';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CustomerDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
}

const DOCUMENT_TYPES = ['invoice', 'other'];
const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  'invoice': 'Factuur',
  'other': 'Overig'
};

const CustomerDocumentsModal: React.FC<CustomerDocumentsModalProps> = ({ 
  isOpen, 
  onClose,
  customerId
}) => {
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<CustomerDocument[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [customerName, setCustomerName] = useState<string>('');
  
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<string[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && customerId) {
      const fetchCustomerName = async () => {
        const customer = await getCustomerById(customerId);
        if (customer) {
          setCustomerName(customer.customer_name);
        }
      };
      
      fetchCustomerName();
    }
  }, [isOpen, customerId]);

  useEffect(() => {
    if (isOpen && customerId) {
      fetchDocuments();
    }
  }, [isOpen, customerId, currentPage, dateFrom, dateTo, selectedDocumentTypes]);

  useEffect(() => {
    applySearchFilter();
  }, [searchText, documents]);

  const fetchDocuments = async () => {
    if (!customerId) return;
    
    try {
      setLoading(true);
      
      console.log('Fetching with document types:', selectedDocumentTypes);
      
      const result = await getCustomerDocuments(
        customerId, 
        currentPage,
        DOCUMENTS_PER_PAGE,
        {
          dateFrom,
          dateTo,
          documentTypes: selectedDocumentTypes.length > 0 ? selectedDocumentTypes : undefined
        }
      );
      
      console.log('Fetched documents result:', result);
      setDocuments(result.documents);
      setTotalDocuments(result.total);
      setTotalPages(Math.ceil(result.total / DOCUMENTS_PER_PAGE));
      
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
    setDateFrom(null);
    setDateTo(null);
    setSelectedDocumentTypes([]);
    setCurrentPage(0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd-MM-yyyy HH:mm', { locale: nl });
    } catch (e) {
      return dateString;
    }
  };

  const getDocumentTypeColor = (type: string) => {
    const types: Record<string, string> = {
      'invoice': 'bg-blue-100 text-blue-800',
      'other': 'bg-gray-100 text-gray-800',
    };
    
    return types[type?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPE_LABELS[type] || type;
  };

  const toggleDocumentType = (type: string) => {
    setSelectedDocumentTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={currentPage === i}
              onClick={() => handlePageChange(i)}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={0}>
          <PaginationLink 
            isActive={currentPage === 0}
            onClick={() => handlePageChange(0)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      const startPage = Math.max(1, Math.min(currentPage - 1, totalPages - 4));
      const endPage = Math.min(startPage + 2, totalPages - 1);

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={currentPage === i}
              onClick={() => handlePageChange(i)}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - 3) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      items.push(
        <PaginationItem key={totalPages - 1}>
          <PaginationLink 
            isActive={currentPage === totalPages - 1}
            onClick={() => handlePageChange(totalPages - 1)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        
        <DialogHeader>
          <DialogTitle>Klant Documenten - {customerName}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 flex-1 overflow-hidden flex flex-col">
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">Filter op Toegevoegd:</span>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "w-[180px] justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, 'dd-MM-yyyy', { locale: nl }) : "Van datum"}
                      {dateFrom && (
                        <Button
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDateFrom(null);
                          }}
                          className="h-4 w-4 ml-auto p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "ml-2 w-[180px] justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, 'dd-MM-yyyy', { locale: nl }) : "Tot datum"}
                      {dateTo && (
                        <Button
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDateTo(null);
                          }}
                          className="h-4 w-4 ml-auto p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">Document type:</span>
                <div className="flex gap-2">
                  <Badge 
                    key="invoice"
                    variant={selectedDocumentTypes.includes('invoice') ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer hover:bg-opacity-90 px-3 py-1",
                      selectedDocumentTypes.includes('invoice') ? "bg-primary" : "bg-transparent"
                    )}
                    onClick={() => toggleDocumentType('invoice')}
                  >
                    Factuur
                  </Badge>
                  <Badge 
                    key="other"
                    variant={selectedDocumentTypes.includes('other') ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer hover:bg-opacity-90 px-3 py-1",
                      selectedDocumentTypes.includes('other') ? "bg-primary" : "bg-transparent"
                    )}
                    onClick={() => toggleDocumentType('other')}
                  >
                    Overig
                  </Badge>
                </div>
              </div>
            </div>
            
            {(dateFrom || dateTo || selectedDocumentTypes.length > 0) && (
              <div className="flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetFilter}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reset filters
                </Button>
              </div>
            )}
            
            <div className="w-full">
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
          </div>
          
          <div className="flex-1 overflow-auto" style={{ minHeight: "400px" }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Toegevoegd</TableHead>
                  <TableHead>Documentnaam</TableHead>
                  <TableHead className="w-[120px]">Type</TableHead>
                  <TableHead className="w-[80px]">Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Documenten laden...
                    </TableCell>
                  </TableRow>
                ) : filteredDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Geen documenten gevonden
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocuments.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-gray-50">
                      <TableCell className="whitespace-nowrap text-gray-500">
                        {formatDate(doc.created_at)}
                      </TableCell>
                      <TableCell>
                        {doc.document_name}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={cn(
                            "font-normal",
                            getDocumentTypeColor(doc.document_type)
                          )}
                          variant="outline"
                        >
                          {getDocumentTypeLabel(doc.document_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <div className="text-sm text-gray-500">
              {totalDocuments > 0 
                ? `Getoond ${currentPage * DOCUMENTS_PER_PAGE + 1}-${Math.min((currentPage + 1) * DOCUMENTS_PER_PAGE, totalDocuments)} van ${totalDocuments}`
                : '0 van 0'} documenten
            </div>
            
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  {currentPage > 0 && (
                    <PaginationItem>
                      <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                    </PaginationItem>
                  )}
                  
                  {renderPaginationItems()}
                  
                  {currentPage < totalPages - 1 && (
                    <PaginationItem>
                      <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDocumentsModal;
