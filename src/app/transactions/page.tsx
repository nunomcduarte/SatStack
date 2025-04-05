"use client"

import React, { useState, useEffect } from 'react'
import { useTransactionsStore, Transaction } from '@/lib/stores/transactionsStore'
import { differenceInDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { 
  ArrowUpDown, 
  Download, 
  FileUp, 
  FileDown, 
  RefreshCw, 
  Plus,
  ChevronDown,
  Trash,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input'
import { formatDate, formatBitcoin, formatCurrency } from '@/lib/utils/helpers'
import AddTransactionModal from '@/components/transactions/AddTransactionModal'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

export default function TransactionsPage() {
  const { toast } = useToast()
  const { transactions, clearTransactions, removeTransaction } = useTransactionsStore()
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [transactionType, setTransactionType] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectAll, setSelectAll] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Reset selection when transactions change
  useEffect(() => {
    setSelectedTransactions([])
    setSelectAll(false)
  }, [transactions])

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTransactions([])
    } else {
      setSelectedTransactions(filteredTransactions.map(t => t.id))
    }
    setSelectAll(!selectAll)
  }

  // Toggle selection of a transaction
  const toggleTransactionSelection = (id: string) => {
    if (selectedTransactions.includes(id)) {
      setSelectedTransactions(selectedTransactions.filter(txId => txId !== id))
      setSelectAll(false)
    } else {
      setSelectedTransactions([...selectedTransactions, id])
      if (selectedTransactions.length + 1 === filteredTransactions.length) {
        setSelectAll(true)
      }
    }
  }

  // Filter transactions based on search query and type
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by type
    if (transactionType !== 'all' && transaction.type !== transactionType) {
      return false
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        transaction.description?.toLowerCase().includes(query) ||
        transaction.date.toLowerCase().includes(query)
      )
    }
    
    return true
  })

  // Sort filtered transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        break
      case 'amount':
        comparison = a.bitcoinAmount - b.bitcoinAmount
        break
      case 'price':
        comparison = a.pricePerBitcoin - b.pricePerBitcoin
        break
      case 'total':
        comparison = a.fiatAmount - b.fiatAmount
        break
      default:
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })

  // Handle sort changes
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  // Function to calculate holding days, same as in RecentTransactions
  const calculateHoldingDays = (transaction: Transaction): number | null => {
    // For buy or receive transactions, calculate days from purchase until now
    if (transaction.type === 'buy' || transaction.type === 'receive') {
      const purchaseDate = new Date(transaction.date);
      const today = new Date();
      return differenceInDays(today, purchaseDate);
    }
    
    // For sell, send, or spend transactions, holding days doesn't apply
    return null;
  };

  // Update the transaction type style to match RecentTransactions
  const getTransactionTypeStyle = (type: string) => {
    switch (type) {
      case 'buy':
        return 'bg-green-900 text-green-300';
      case 'sell':
        return 'bg-red-900 text-red-300';
      case 'send':
        return 'bg-yellow-900 text-yellow-300';
      case 'receive':
        return 'bg-blue-900 text-blue-300';
      case 'spend':
        return 'bg-purple-900 text-purple-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  // Update the delete function to use toast notifications
  const handleDeleteSelected = async () => {
    try {
      setIsDeleting(true);
      // Store the count before clearing the selection
      const deletedCount = selectedTransactions.length;
      
      // Delete each selected transaction
      for (const id of selectedTransactions) {
        removeTransaction(id);
        // Add a small delay to avoid UI freezing with many items
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Clear the selection
      setSelectedTransactions([]);
      setShowDeleteDialog(false);
      
      // Show success message using toast
      toast({
        title: "Transactions deleted",
        description: `Successfully deleted ${deletedCount} transaction${deletedCount === 1 ? '' : 's'}.`,
        variant: "success",
      });
    } catch (error) {
      console.error('Error deleting transactions:', error);
      
      // Show error message using toast
      toast({
        title: "Error",
        description: "An error occurred while deleting transactions.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => {}}
            >
              <FileUp className="h-4 w-4" />
              Import
            </Button>
            
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              disabled={selectedTransactions.length === 0}
              onClick={() => {}}
            >
              <FileDown className="h-4 w-4" />
              Export Selected
            </Button>
            
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => {}}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            
            <Button 
              variant="default"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={transactionType === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTransactionType('all')}
            >
              All Transactions
            </Button>
            <Button 
              variant={transactionType === 'buy' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTransactionType('buy')}
            >
              Buys
            </Button>
            <Button 
              variant={transactionType === 'sell' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTransactionType('sell')}
            >
              Sells
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Input 
              placeholder="Search transactions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <ArrowUpDown className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTransactionType('all')}>All Types</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTransactionType('buy')}>Buy</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTransactionType('sell')}>Sell</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTransactionType('send')}>Send</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTransactionType('receive')}>Receive</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTransactionType('spend')}>Spend</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-md border border-gray-700 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="mr-2 h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Date
                      <ChevronDown className={`ml-1 h-4 w-4 ${sortBy === 'date' ? 'opacity-100' : 'opacity-40'} ${sortBy === 'date' && sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center">
                      Amount
                      <ChevronDown className={`ml-1 h-4 w-4 ${sortBy === 'amount' ? 'opacity-100' : 'opacity-40'} ${sortBy === 'amount' && sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center">
                      Price
                      <ChevronDown className={`ml-1 h-4 w-4 ${sortBy === 'price' ? 'opacity-100' : 'opacity-40'} ${sortBy === 'price' && sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Fees
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('total')}
                  >
                    <div className="flex items-center">
                      Total
                      <ChevronDown className={`ml-1 h-4 w-4 ${sortBy === 'total' ? 'opacity-100' : 'opacity-40'} ${sortBy === 'total' && sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Holding Days
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-700">
                {sortedTransactions.length > 0 ? (
                  sortedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-800 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                          checked={selectedTransactions.includes(transaction.id)}
                          onChange={() => toggleTransactionSelection(transaction.id)}
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTransactionTypeStyle(transaction.type)}`}>
                          {transaction.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatBitcoin(transaction.bitcoinAmount)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatCurrency(transaction.pricePerBitcoin)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatCurrency(transaction.fees || 0)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatCurrency(transaction.fiatAmount)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        {calculateHoldingDays(transaction) !== null 
                          ? `${calculateHoldingDays(transaction)} days` 
                          : '—'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        {transaction.description || '—'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      {searchQuery || transactionType !== 'all' ? (
                        <p>No transactions match your filters</p>
                      ) : (
                        <div className="flex flex-col items-center">
                          <p className="mb-4">No transactions found</p>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => setShowAddModal(true)}
                          >
                            Add your first transaction
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {selectedTransactions.length > 0 && (
          <div className="flex justify-between items-center p-4 bg-gray-800 rounded-md">
            <span className="text-sm text-gray-300">
              {selectedTransactions.length} {selectedTransactions.length === 1 ? 'transaction' : 'transactions'} selected
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedTransactions([])}
              >
                Deselect All
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash className="h-4 w-4" />
                Delete Selected
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <AddTransactionModal 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)} 
        />
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedTransactions.length} {selectedTransactions.length === 1 ? 'transaction' : 'transactions'}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <span className="animate-spin mr-1">⏳</span>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 