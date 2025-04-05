"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, RefreshCcwIcon } from "lucide-react"
import { format, setMonth, setYear, addMonths, getMonth, getYear, startOfMonth, endOfMonth, getDay, subDays, addDays } from "date-fns"
import { isSameDay } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils/cn"
import { useTransactionsStore, Transaction } from "@/lib/stores/transactionsStore"
import { TransactionType } from "@/lib/types"
import { getCurrentPrice, getHistoricalPrice } from "@/lib/services/priceService"
import { useToast } from "@/components/ui/use-toast"

interface EditTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction
}

export default function EditTransactionModal({ isOpen, onClose, transaction }: EditTransactionModalProps) {
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(new Date(transaction.date))
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [calendarView, setCalendarView] = useState<'day' | 'month' | 'year'>('day')
  const [currentViewDate, setCurrentViewDate] = useState<Date>(new Date(transaction.date))
  const [transactionType, setTransactionType] = useState<TransactionType>(transaction.type)
  const [amount, setAmount] = useState(transaction.bitcoinAmount.toString())
  const [priceOption, setPriceOption] = useState("manual")
  const [price, setPrice] = useState(transaction.pricePerBitcoin.toString())
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)
  const [fees, setFees] = useState(transaction.fees ? transaction.fees.toString() : "")
  const [source, setSource] = useState("")
  const [description, setDescription] = useState(transaction.description || "")
  const [error, setError] = useState<string | null>(null)
  const [priceError, setPriceError] = useState<string | null>(null)
  
  const { updateTransaction, transactions } = useTransactionsStore()

  // Set currentViewDate when date changes
  useEffect(() => {
    if (date) {
      setCurrentViewDate(date);
    }
  }, [date]);

  // Extract source from description if available (for backward compatibility)
  useEffect(() => {
    if (transaction.description && transaction.description.startsWith("Transaction from ")) {
      const sourcePart = transaction.description.replace("Transaction from ", "");
      setSource(sourcePart);
      setDescription("");
    }
  }, [transaction.description]);

  const fetchCurrentBitcoinPrice = async () => {
    setIsLoadingPrice(true);
    setPriceError(null);
    try {
      const currentPrice = await getCurrentPrice();
      if (currentPrice === 0) {
        setPriceError("Error fetching current price. Using estimated value.");
        setPrice("64500"); // Use a reasonable fallback
      } else {
        setPrice(currentPrice.toString());
      }
    } catch (error) {
      console.error("Error fetching current Bitcoin price:", error);
      setPriceError("Error fetching price. Using estimated value.");
      setPrice("64500"); // Use a reasonable fallback
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const fetchHistoricalBitcoinPrice = async (date: Date) => {
    setIsLoadingPrice(true);
    setPriceError(null);
    try {
      // Format date to YYYY-MM-DD for the API
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const historicalPrice = await getHistoricalPrice(formattedDate);
      if (historicalPrice === 0) {
        setPriceError("Error fetching historical price. Using estimated value.");
        // Use a fallback estimate based on current date
        const daysAgo = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 3600 * 24));
        const fallbackPrice = 64500 * Math.pow(0.999, daysAgo);
        setPrice(fallbackPrice.toFixed(2));
      } else {
        setPrice(historicalPrice.toString());
      }
    } catch (error) {
      console.error("Error fetching historical Bitcoin price:", error);
      setPriceError("Error fetching price. Using estimated value.");
      
      // Use a fallback estimate based on current date
      const daysAgo = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 3600 * 24));
      const fallbackPrice = 64500 * Math.pow(0.999, daysAgo);
      setPrice(fallbackPrice.toFixed(2));
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const handlePriceOptionChange = (value: string) => {
    setPriceOption(value);
    
    if (value === "current") {
      fetchCurrentBitcoinPrice();
    } else if (value === "historical" && date) {
      fetchHistoricalBitcoinPrice(date);
    } else if (value === "manual") {
      // Keep the current price but make it editable
    }
  };

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    
    // If using historical price, fetch the price for the selected date
    if (newDate && priceOption === "historical") {
      fetchHistoricalBitcoinPrice(newDate);
    }
  };

  const handleCalendarViewChange = (view: 'day' | 'month' | 'year') => {
    setCalendarView(view);
  };

  const handleMonthChange = (month: number) => {
    const newDate = setMonth(currentViewDate, month);
    setCurrentViewDate(newDate);
    
    if (calendarView === 'month') {
      setCalendarView('day');
    }
  };

  const handleYearChange = (year: number) => {
    const newDate = setYear(currentViewDate, year);
    setCurrentViewDate(newDate);
    
    if (calendarView === 'year') {
      setCalendarView('day');
    }
  };

  const handleNavigatePrevious = () => {
    if (calendarView === 'month') {
      // Navigate to previous year
      setCurrentViewDate(prevDate => setYear(prevDate, getYear(prevDate) - 1));
    } else if (calendarView === 'day') {
      // Navigate to previous month
      setCurrentViewDate(prevDate => addMonths(prevDate, -1));
    } else if (calendarView === 'year') {
      // Navigate to previous decade
      setCurrentViewDate(prevDate => setYear(prevDate, getYear(prevDate) - 10));
    }
  };

  const handleNavigateNext = () => {
    if (calendarView === 'month') {
      // Navigate to next year
      setCurrentViewDate(prevDate => setYear(prevDate, getYear(prevDate) + 1));
    } else if (calendarView === 'day') {
      // Navigate to next month
      setCurrentViewDate(prevDate => addMonths(prevDate, 1));
    } else if (calendarView === 'year') {
      // Navigate to next decade
      setCurrentViewDate(prevDate => setYear(prevDate, getYear(prevDate) + 10));
    }
  };

  // Calculate total Bitcoin holdings
  const calculateTotalHoldings = (): number => {
    if (!transactions || transactions.length === 0) {
      return 0;
    }
    
    let totalBitcoin = 0;
    
    for (const tx of transactions) {
      // Skip the current transaction being edited for accurate calculation
      if (tx.id === transaction.id) continue;
      
      if (tx.type === "buy" || tx.type === "receive") {
        totalBitcoin += tx.bitcoinAmount;
      } else if (tx.type === "sell" || tx.type === "send" || tx.type === "spend") {
        totalBitcoin -= tx.bitcoinAmount;
      }
    }
    
    // Add back the original amount for accurate calculations when changing transaction type
    if (transaction.type === "buy" || transaction.type === "receive") {
      totalBitcoin += transaction.bitcoinAmount;
    } else if (transaction.type === "sell" || transaction.type === "send" || transaction.type === "spend") {
      totalBitcoin -= transaction.bitcoinAmount;
    }
    
    return Math.max(0, totalBitcoin);
  };

  const handleSubmit = () => {
    // Reset any previous errors
    setError(null);
    
    if (!date || !amount || !price) {
      setError("Please fill in all required fields");
      return;
    }
    
    const bitcoinAmount = parseFloat(amount);
    const pricePerBitcoin = parseFloat(price);
    const feeAmount = fees ? parseFloat(fees) : 0;
    
    // Validate non-negative amounts
    if (bitcoinAmount <= 0) {
      setError("Bitcoin amount must be greater than zero");
      return;
    }
    
    if (pricePerBitcoin <= 0) {
      setError("Price must be greater than zero");
      return;
    }
    
    // For sell transactions, check if the user has enough Bitcoin
    if ((transactionType === "sell" || transactionType === "send" || transactionType === "spend") && 
        transaction.type !== transactionType) {
      const totalHoldings = calculateTotalHoldings();
      if (bitcoinAmount > totalHoldings) {
        setError(`You don't have enough Bitcoin. Current holdings: ${totalHoldings.toFixed(8)} BTC`);
        return;
      }
    }
    
    // Calculate total amount including or excluding fees based on transaction type
    let fiatAmount: number;
    
    if (transactionType === "buy") {
      // For buys, fees are added to the total cost
      fiatAmount = bitcoinAmount * pricePerBitcoin + feeAmount;
    } else if (transactionType === "sell") {
      // For sells, fees are subtracted from proceeds
      fiatAmount = bitcoinAmount * pricePerBitcoin - feeAmount;
    } else {
      // For other transaction types
      fiatAmount = bitcoinAmount * pricePerBitcoin;
    }
    
    // Create an updated transaction with all necessary fields
    const updatedTransaction: Partial<Transaction> = {
      type: transactionType,
      date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      bitcoinAmount,
      pricePerBitcoin,
      fiatAmount,
      fees: feeAmount,
      description: description || (source ? `Transaction from ${source}` : '')
    };
    
    // Update transaction in the store
    updateTransaction(transaction.id, updatedTransaction);
    
    // Force a UI update for the dashboard
    window.dispatchEvent(new Event('transaction-updated'));
    
    // Show success message
    toast({
      title: "Transaction updated",
      description: "Your transaction has been successfully updated.",
      variant: "success",
    });
    
    // Close the modal
    onClose();
  };

  const calculateTotal = () => {
    if (amount && price) {
      const subtotal = Number.parseFloat(amount) * Number.parseFloat(price);
      const feeAmount = fees ? Number.parseFloat(fees) : 0;
      
      if (transactionType === "buy") {
        // For buys, fees are added to the cost
        return (subtotal + feeAmount).toFixed(2);
      } else if (transactionType === "sell") {
        // For sells, fees are subtracted from proceeds
        return (subtotal - feeAmount).toFixed(2);
      } else {
        // For other types, just return the value
        return subtotal.toFixed(2);
      }
    }
    return "0.00";
  };

  // Generate year options for selector (current year +/- 10 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  // Generate month options for selector
  const monthOptions = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

  // Render the calendar view based on current selection
  const renderCalendarView = () => {
    if (calendarView === 'day') {
      return (
        <div className="min-h-[250px]">
          <div className="grid grid-cols-7 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="text-center text-muted-foreground text-sm font-medium">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentViewDate).map((day, i) => {
              const isCurrentMonth = getMonth(day) === getMonth(currentViewDate);
              const isSelected = date && isSameDay(day, date);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={i}
                  onClick={() => {
                    handleDateChange(day);
                    setIsCalendarOpen(false);
                  }}
                  className={cn(
                    "h-9 w-9 rounded-md text-center font-medium",
                    !isCurrentMonth && "text-muted-foreground opacity-50",
                    isSelected && "bg-primary text-primary-foreground",
                    isToday && !isSelected && "bg-accent text-accent-foreground",
                    !isSelected && "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </div>
      );
    } else if (calendarView === 'month') {
      return (
        <div className="min-h-[250px] p-3">
          <div className="grid grid-cols-4 gap-2">
            {monthOptions.map((month) => (
              <Button
                key={month.value}
                variant={getMonth(currentViewDate) === month.value ? "default" : "outline"}
                onClick={() => {
                  handleMonthChange(month.value);
                }}
                className="text-sm py-2"
              >
                {month.label.substring(0, 3)}
              </Button>
            ))}
          </div>
        </div>
      );
    } else if (calendarView === 'year') {
      // Show years from current year-5 to current year+5
      const currentYear = new Date().getFullYear();
      const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
      
      return (
        <div className="min-h-[250px] p-3">
          <div className="grid grid-cols-4 gap-2">
            {years.map((year) => (
              <Button
                key={year}
                variant={getYear(currentViewDate) === year ? "default" : "outline"}
                onClick={() => {
                  handleYearChange(year);
                }}
                className="text-sm py-2"
              >
                {year}
              </Button>
            ))}
          </div>
        </div>
      );
    }
  };

  // Helper function to get days in month grid with previous/next month days
  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    
    // Get the day of the week of the first day (0 = Sunday, 1 = Monday, etc.)
    const startDay = getDay(start);
    
    // Get the day of the week of the last day
    const endDay = getDay(end);
    
    // Create array for all days to display
    const daysToDisplay = [];
    
    // Add days from previous month
    for (let i = startDay - 1; i >= 0; i--) {
      daysToDisplay.push(subDays(start, i));
    }
    
    // Add all days in current month
    let currentDay = start;
    while (currentDay <= end) {
      daysToDisplay.push(currentDay);
      currentDay = addDays(currentDay, 1);
    }
    
    // Add days from next month to complete the grid
    for (let i = 1; i < 7 - endDay; i++) {
      daysToDisplay.push(addDays(end, i));
    }
    
    return daysToDisplay;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="sticky top-0 z-30 bg-background px-6 pt-6 pb-2">
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>Update the details of your Bitcoin transaction.</DialogDescription>
        </DialogHeader>

        {/* Display error message if there is one */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-6 mb-4">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-6 pt-2">
            {/* Transaction Type */}
            <div className="space-y-2">
              <Label htmlFor="transaction-type">Type</Label>
              <Select 
                value={transactionType} 
                onValueChange={(value) => setTransactionType(value as TransactionType)}
              >
                <SelectTrigger id="transaction-type" className="w-full">
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                  <SelectItem value="receive">Receive</SelectItem>
                  <SelectItem value="send">Send</SelectItem>
                  <SelectItem value="spend">Spend</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Date Field */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !date && "text-gray-500")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-0 pb-4" align="start">
                  <div className="border-b">
                    <div className="flex justify-between items-center p-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary h-9 w-9"
                        onClick={handleNavigatePrevious}
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-lg font-semibold"
                        onClick={() => setCalendarView('month')}
                      >
                        {calendarView === 'day' && format(currentViewDate, 'MMMM yyyy')}
                        {calendarView === 'month' && format(currentViewDate, 'yyyy')}
                        {calendarView === 'year' && 'Select Year'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary h-9 w-9"
                        onClick={handleNavigateNext}
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    {renderCalendarView()}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Amount Field */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (BTC)</Label>
              <Input
                id="amount"
                type="number"
                step="0.00000001"
                placeholder="0.00000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full"
              />
            </div>
            
            {/* Price Field */}
            <div className="space-y-2">
              <Label htmlFor="price">Price per Bitcoin (USD)</Label>
              <Tabs value={priceOption} onValueChange={handlePriceOptionChange} className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="current">Current</TabsTrigger>
                  <TabsTrigger value="historical">Historical</TabsTrigger>
                  <TabsTrigger value="manual">Manual</TabsTrigger>
                </TabsList>
                
                <TabsContent value="current" className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="price-current"
                        placeholder="Price in USD"
                        value={price}
                        disabled={true}
                        className={cn(priceError ? "border-red-500" : "")}
                      />
                      {isLoadingPrice && (
                        <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                          Loading...
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={fetchCurrentBitcoinPrice}
                      disabled={isLoadingPrice}
                      title="Refresh current price"
                    >
                      <RefreshCcwIcon className={`h-4 w-4 ${isLoadingPrice ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  {priceError && (
                    <p className="text-amber-500 text-xs mt-1">{priceError}</p>
                  )}
                </TabsContent>
                
                <TabsContent value="historical" className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="price-historical"
                        placeholder="Price in USD"
                        value={price}
                        disabled={true}
                        className={cn(priceError ? "border-red-500" : "")}
                      />
                      {isLoadingPrice && (
                        <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                          Loading...
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => date && fetchHistoricalBitcoinPrice(date)}
                      disabled={isLoadingPrice || !date}
                      title="Refresh historical price for selected date"
                    >
                      <RefreshCcwIcon className={`h-4 w-4 ${isLoadingPrice ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  {priceError && (
                    <p className="text-amber-500 text-xs mt-1">{priceError}</p>
                  )}
                </TabsContent>
                
                <TabsContent value="manual" className="mt-2">
                  <Input
                    id="price-manual"
                    placeholder="Enter price manually"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Fees Field */}
            <div className="space-y-2">
              <Label htmlFor="fees">Fees (USD)</Label>
              <Input
                id="fees"
                type="number"
                placeholder="0.00"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                className="w-full"
              />
            </div>
            
            {/* Total Field */}
            <div className="space-y-2">
              <Label htmlFor="total">Total (USD)</Label>
              <Input 
                id="total" 
                value={`$${calculateTotal()}`} 
                disabled 
                className="w-full" 
              />
            </div>
            
            {/* Source Field */}
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                placeholder="Exchange or wallet name"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full"
              />
            </div>
            
            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full"
              />
            </div>
            
            {/* Add additional padding at the bottom to ensure content doesn't get hidden behind footer */}
            <div className="h-4"></div>
          </div>
        </div>
        
        <DialogFooter className="sticky bottom-0 z-30 border-t border-gray-800 bg-background px-6 py-4">
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" onClick={handleSubmit} className="w-full sm:w-auto">
              Update Transaction
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 