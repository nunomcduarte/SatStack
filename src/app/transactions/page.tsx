"use client"

import React, { useState, useEffect } from 'react'
import { useTransactionsStore } from '@/lib/stores/transactionsStore'
import { Button } from '@/components/ui/button'
import { 
  ArrowUpDown, 
  Download, 
  FileUp, 
  FileDown, 
  RefreshCw, 
  Plus,
  ChevronDown,
  Trash
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

export default function TransactionsPage() {
  const { transactions, clearTransactions } = useTransactionsStore()
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [transactionType, setTransactionType] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectAll, setSelectAll] = useState(false)

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

  // Transaction type style
  const getTransactionTypeStyle = (type: string) => {
    switch (type) {
      case 'buy':
        return 'text-green-500'
      case 'sell':
        return 'text-red-500'
      case 'send':
        return 'text-yellow-500'
      case 'receive':
        return 'text-blue-500'
      case 'spend':
        return 'text-purple-500'
      default:
        return 'text-gray-500'
    }
  }

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
                      Amount (BTC)
                      <ChevronDown className={`ml-1 h-4 w-4 ${sortBy === 'amount' ? 'opacity-100' : 'opacity-40'} ${sortBy === 'amount' && sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center">
                      Price (USD)
                      <ChevronDown className={`ml-1 h-4 w-4 ${sortBy === 'price' ? 'opacity-100' : 'opacity-40'} ${sortBy === 'price' && sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('total')}
                  >
                    <div className="flex items-center">
                      Total (USD)
                      <ChevronDown className={`ml-1 h-4 w-4 ${sortBy === 'total' ? 'opacity-100' : 'opacity-40'} ${sortBy === 'total' && sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Fee (USD)
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
                        <div className={`flex items-center ${getTransactionTypeStyle(transaction.type)}`}>
                          {transaction.type === 'buy' || transaction.type === 'receive' ? (
                            <ArrowUpDown className="h-4 w-4 mr-1 rotate-180" />
                          ) : (
                            <ArrowUpDown className="h-4 w-4 mr-1" />
                          )}
                          <span className="capitalize">{transaction.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        ₿ {transaction.bitcoinAmount.toFixed(8)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        ${transaction.pricePerBitcoin.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        ${transaction.fiatAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        ${(transaction.fees || 0).toLocaleString()}
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
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
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
                onClick={() => {
                  // Implement delete functionality
                  alert(`Delete ${selectedTransactions.length} transactions?`)
                }}
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
    </div>
  )
} 