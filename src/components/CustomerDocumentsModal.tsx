
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  CustomerDocument, 
  getCustomerDocuments, 
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

// Document types available for filtering
const DOCUMENT_TYPES = ['invoice', 'receipt', 'contract', 'report', 'other'];

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
  
  // Date filter states
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  
  // Document type filter state
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<string[]>([]);
  
  const { toast } = useToast();

  // Fetch documents whenever the modal opens, customerId changes, filters change, or the page changes
  useEffect(() => {
    if (isOpen && customerId) {
      fetchDocuments();
    }
  }, [isOpen, customerId, currentPage, dateFrom, dateTo, selectedDocumentTypes]);

  // Apply search filter when search text changes
  useEffect(() => {
    applySearchFilter();
  }, [searchText, documents]);

  const fetchDocuments = async () => {
    if (!customerId) return;
    
    try {
      setLoading(true);
      
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

  const toggleDocumentType = (type: string) => {
    setSelectedDocumentTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are few
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
      // Show first page
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

      // Add ellipsis if current page is not near the beginning
      if (currentPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Add pages around current page
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

      // Add ellipsis if current page is not near the end
      if (currentPage < totalPages - 3) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show last page
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
          <DialogTitle>Klant Documenten</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 flex-1 overflow-hidden flex flex-col">
          {/* Filters section */}
          <div className="mb-6 space-y-4">
            {/* Date filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">Filter op Toegevoegd:</span>
                
                {/* From date */}
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
                      {dateFrom ? format(dateFrom, 'dd-MM-yyyy') : "Van datum"}
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
                
                {/* To date */}
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
                      {dateTo ? format(dateTo, 'dd-MM-yyyy') : "Tot datum"}
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
              
              {/* Document type filter */}
              <div className="flex items-center flex-wrap">
                <span className="text-sm font-medium mr-2">Document type:</span>
                <div className="flex flex-wrap gap-2">
                  {DOCUMENT_TYPES.map((type) => (
                    <Badge 
                      key={type}
                      variant={selectedDocumentTypes.includes(type) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer hover:bg-opacity-90 px-3 py-1",
                        selectedDocumentTypes.includes(type) ? "bg-primary" : "bg-transparent"
                      )}
                      onClick={() => toggleDocumentType(type)}
                    >
                      {type === 'invoice' ? 'Factuur' : 
                       type === 'receipt' ? 'Kwitantie' :
                       type === 'contract' ? 'Contract' :
                       type === 'report' ? 'Rapport' : 'Overig'}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Reset filters button */}
              {(dateFrom || dateTo || selectedDocumentTypes.length > 0) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetFilter}
                  className="ml-auto"
                >
                  <X className="h-4 w-4 mr-1" />
                  Reset filters
                </Button>
              )}
            </div>
            
            {/* Search bar */}
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
          
          {/* Documents table */}
          <div className="flex-1 overflow-auto">
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
                          {doc.document_type}
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
