
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Check,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { updateCustomer, getAllCustomers } from '@/lib/supabase';
import { Customer } from '@/lib/supabase/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';

type SortDirection = 'asc' | 'desc';

type SortConfig = {
  key: keyof Customer | null;
  direction: SortDirection;
};

const emptyCustomer: Customer = {
  id: '',
  customer_name: '',
  administration_name: null,
  administration_mail: null,
  source: null,
  source_root: null,
  is_active: true,
  cct_processed: false,
  created_at: null,
  cs_documents_in_process: null,
  cs_documents_other: null,
  cs_last_update: null
};

const Clients: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer>(emptyCustomer);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [originalId, setOriginalId] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    key: 'id', 
    direction: 'asc' 
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);
  
  useEffect(() => {
    if (searchText.trim() === '') {
      const sortedCustomers = sortData(customers, sortConfig);
      setFilteredCustomers(sortedCustomers);
      return;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = customers.filter(
      customer => 
        customer.id.toLowerCase().includes(searchLower) || 
        customer.customer_name.toLowerCase().includes(searchLower) ||
        (customer.source_root && customer.source_root.toLowerCase().includes(searchLower)) ||
        (customer.administration_mail && customer.administration_mail.toLowerCase().includes(searchLower))
    );
    
    const sortedFiltered = sortData(filtered, sortConfig);
    setFilteredCustomers(sortedFiltered);
  }, [searchText, customers, sortConfig]);

  const sortData = (data: Customer[], config: SortConfig): Customer[] => {
    if (!config.key) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[config.key as keyof Customer];
      const bValue = b[config.key as keyof Customer];

      if (aValue === null || aValue === undefined) return config.direction === 'asc' ? 1 : -1;
      if (bValue === null || bValue === undefined) return config.direction === 'asc' ? -1 : 1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return config.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } 
      
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return config.direction === 'asc' 
          ? (aValue === bValue ? 0 : aValue ? 1 : -1)
          : (aValue === bValue ? 0 : aValue ? -1 : 1);
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          return config.direction === 'asc' 
            ? aDate.getTime() - bDate.getTime() 
            : bDate.getTime() - aDate.getTime();
        }
      }
      
      const aString = String(aValue);
      const bString = String(bValue);
      return config.direction === 'asc' 
        ? aString.localeCompare(bString) 
        : bString.localeCompare(aString);
    });
  };

  const handleSort = (key: keyof Customer) => {
    let direction: SortDirection = 'asc';
    
    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      direction = 'asc';
    }
    
    const newConfig: SortConfig = { key, direction };
    setSortConfig(newConfig);
  };

  const getSortIcon = (columnKey: keyof Customer) => {
    if (sortConfig.key !== columnKey) {
      return null;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="ml-1 inline-block" /> 
      : <ArrowDown size={14} className="ml-1 inline-block" />;
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getAllCustomers();
      
      setCustomers(data || []);
      const sortedData = sortData(data || [], sortConfig);
      setFilteredCustomers(sortedData);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Failed to load customer data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = () => {
    setEditingCustomer(emptyCustomer);
    setIsNewCustomer(true);
    setOriginalId('');
    setIsDialogOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsNewCustomer(false);
    setOriginalId(customer.id);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerToDelete.id);
      
      if (error) throw error;
      
      setCustomers(customers.filter(c => c.id !== customerToDelete.id));
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Error",
        description: "Failed to delete customer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleSaveCustomer = async () => {
    if (!editingCustomer.id.trim() || !editingCustomer.customer_name.trim()) {
      toast({
        title: "Error",
        description: "Customer ID and Name are required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isNewCustomer) {
        const now = new Date().toISOString();
        
        const { error } = await supabase
          .from('customers')
          .insert([{
            ...editingCustomer,
            created_at: now,
            cs_documents_in_process: null,
            cs_documents_other: null,
            cs_last_update: null
          }]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "New customer added successfully",
        });
      } else {
        if (originalId !== editingCustomer.id) {
          // If ID changed, we need to delete old record and create new one
          const { data: originalCustomer, error: fetchError } = await supabase
            .from('customers')
            .select('created_at, cs_documents_in_process, cs_documents_other, cs_last_update')
            .eq('id', originalId)
            .single();
          
          if (fetchError) throw fetchError;
          
          const { error: deleteError } = await supabase
            .from('customers')
            .delete()
            .eq('id', originalId);
          
          if (deleteError) throw deleteError;
          
          const { error: insertError } = await supabase
            .from('customers')
            .insert([{
              ...editingCustomer,
              created_at: originalCustomer?.created_at,
              cs_documents_in_process: originalCustomer?.cs_documents_in_process,
              cs_documents_other: originalCustomer?.cs_documents_other,
              cs_last_update: originalCustomer?.cs_last_update
            }]);
          
          if (insertError) throw insertError;
        } else {
          // Use the new updateCustomer function when ID hasn't changed
          const success = await updateCustomer(originalId, {
            customer_name: editingCustomer.customer_name,
            administration_name: editingCustomer.administration_name,
            administration_mail: editingCustomer.administration_mail,
            source: editingCustomer.source,
            source_root: editingCustomer.source_root,
            is_active: editingCustomer.is_active,
            cct_processed: editingCustomer.cct_processed
          });
          
          if (!success) {
            throw new Error("Failed to update customer");
          }
        }
        
        toast({
          title: "Success",
          description: "Customer updated successfully",
        });
      }
      
      fetchCustomers();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        title: "Error",
        description: isNewCustomer 
          ? "Failed to add new customer. Please try again." 
          : "Failed to update customer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateField = (field: keyof Customer, value: any) => {
    setEditingCustomer(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-[190px] p-8">
        <SearchBar />
        
        <div className="mt-8 flex justify-between items-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Klanten</h1>
            <p className="text-gray-600">Beheer en bekijk alle klanten</p>
          </div>
          <Button 
            className="bg-buzzaroo-green hover:bg-buzzaroo-green/90 flex items-center gap-2"
            onClick={handleAddCustomer}
          >
            <PlusCircle size={18} />
            <span>Nieuwe Klant</span>
          </Button>
        </div>
        
        <div className="mt-8 bg-white rounded-lg border border-gray-100 shadow-sm animate-slide-up" style={{ animationDelay: '0.3s' }}>
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

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading customer data...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('id')}
                    >
                      Klantnr {getSortIcon('id')}
                    </TableHead>
                    <TableHead 
                      className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('customer_name')}
                    >
                      Klantnaam {getSortIcon('customer_name')}
                    </TableHead>
                    <TableHead 
                      className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('source_root')}
                    >
                      Hoofdmap {getSortIcon('source_root')}
                    </TableHead>
                    <TableHead 
                      className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('administration_mail')}
                    >
                      Email {getSortIcon('administration_mail')}
                    </TableHead>
                    <TableHead 
                      className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('is_active')}
                    >
                      Actief {getSortIcon('is_active')}
                    </TableHead>
                    <TableHead 
                      className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('cct_processed')}
                    >
                      Verwerking CCT {getSortIcon('cct_processed')}
                    </TableHead>
                    <TableHead className="py-2 px-4"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100">
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-2 px-4 text-center text-gray-500">
                        {customers.length === 0 ? "No customer data available" : "No matching customers found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow 
                        key={customer.id} 
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <TableCell className="py-2 px-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {customer.id}
                        </TableCell>
                        <TableCell className="py-2 px-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.customer_name}
                        </TableCell>
                        <TableCell className="py-2 px-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.source_root || '-'}
                        </TableCell>
                        <TableCell className="py-2 px-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.administration_mail || '-'}
                        </TableCell>
                        <TableCell className="py-2 px-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.is_active ? 
                            <Check size={16} className="text-green-500" /> :
                            <X size={16} className="text-red-500" />
                          }
                        </TableCell>
                        <TableCell className="py-2 px-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.cct_processed ? 
                            <Check size={16} className="text-green-500" /> :
                            <X size={16} className="text-red-500" />
                          }
                        </TableCell>
                        <TableCell className="py-2 px-4 whitespace-nowrap text-sm text-right flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-blue-600 hover:text-blue-800 transition-colors"
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-red-600 hover:text-red-800 transition-colors"
                            onClick={() => handleDeleteClick(customer)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Getoond {filteredCustomers.length > 0 ? `1-${Math.min(filteredCustomers.length, 10)} van ${filteredCustomers.length}` : '0 van 0'}
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
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>{isNewCustomer ? 'Nieuwe Klant' : 'Klant Bewerken'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-6 items-center gap-4">
              <label htmlFor="id" className="text-right font-medium col-span-1">
                Klantnr
              </label>
              <Input
                id="id"
                value={editingCustomer.id}
                onChange={(e) => updateField('id', e.target.value)}
                className="col-span-5"
              />
            </div>
            <div className="grid grid-cols-6 items-center gap-4">
              <label htmlFor="customer_name" className="text-right font-medium col-span-1">
                Klantnaam
              </label>
              <Input
                id="customer_name"
                value={editingCustomer.customer_name}
                onChange={(e) => updateField('customer_name', e.target.value)}
                className="col-span-5"
              />
            </div>
            <div className="grid grid-cols-6 items-center gap-4">
              <label htmlFor="source_root" className="text-right font-medium col-span-1">
                Hoofdmap
              </label>
              <Input
                id="source_root"
                value={editingCustomer.source_root || ''}
                onChange={(e) => updateField('source_root', e.target.value)}
                className="col-span-5"
              />
            </div>
            <div className="grid grid-cols-6 items-center gap-4">
              <label htmlFor="administration_mail" className="text-right font-medium col-span-1">
                Email
              </label>
              <Input
                id="administration_mail"
                value={editingCustomer.administration_mail || ''}
                onChange={(e) => updateField('administration_mail', e.target.value)}
                className="col-span-5"
              />
            </div>
            <div className="grid grid-cols-6 items-center gap-4">
              <label htmlFor="source" className="text-right font-medium col-span-1">
                Bron
              </label>
              <Input
                id="source"
                value={editingCustomer.source || ''}
                onChange={(e) => updateField('source', e.target.value)}
                className="col-span-5"
              />
            </div>
            <div className="grid grid-cols-6 items-center gap-4 hidden">
              <label htmlFor="administration_name" className="text-right font-medium col-span-1">
                Administratie
              </label>
              <Input
                id="administration_name"
                value={editingCustomer.administration_name || ''}
                onChange={(e) => updateField('administration_name', e.target.value)}
                className="col-span-5"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <label htmlFor="is_active" className="font-medium">
                  Actief
                </label>
                <input
                  type="checkbox"
                  id="is_active"
                  checked={!!editingCustomer.is_active}
                  onChange={(e) => updateField('is_active', e.target.checked)}
                  className="h-4 w-4 text-buzzaroo-green focus:ring-buzzaroo-green border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center gap-3">
                <label htmlFor="cct_processed" className="font-medium">
                  Verwerking CCT
                </label>
                <input
                  type="checkbox"
                  id="cct_processed"
                  checked={!!editingCustomer.cct_processed}
                  onChange={(e) => updateField('cct_processed', e.target.checked)}
                  className="h-4 w-4 text-buzzaroo-green focus:ring-buzzaroo-green border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuleren
            </Button>
            <Button type="button" onClick={handleSaveCustomer} className="bg-buzzaroo-green hover:bg-buzzaroo-green/90">
              Opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bevestig Verwijderen</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Weet u zeker dat u klant <strong>{customerToDelete?.customer_name}</strong> wilt verwijderen?</p>
            <p className="text-sm text-gray-500 mt-2">Deze actie kan niet ongedaan worden gemaakt.</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Annuleren
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteCustomer}>
              Verwijderen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
