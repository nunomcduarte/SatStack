"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

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
import { cn } from "@/lib/utils/cn"
import { useTransactionsStore } from "@/lib/stores/transactionsStore"
import { TransactionType } from "@/lib/types"

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddTransactionModal({ isOpen, onClose }: AddTransactionModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [transactionType, setTransactionType] = useState<TransactionType>("buy")
  const [amount, setAmount] = useState("")
  const [price, setPrice] = useState("")
  const [source, setSource] = useState("")
  const [description, setDescription] = useState("")
  
  const { addTransaction } = useTransactionsStore()

  const handleSubmit = () => {
    if (!date || !amount || !price) {
      alert("Please fill in all required fields")
      return
    }
    
    const bitcoinAmount = parseFloat(amount)
    const pricePerBitcoin = parseFloat(price)
    const fiatAmount = bitcoinAmount * pricePerBitcoin
    
    // Create a new transaction
    const newTransaction = {
      id: crypto.randomUUID(),
      type: transactionType as TransactionType,
      date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      bitcoinAmount,
      pricePerBitcoin,
      fiatAmount,
      description: description || (source ? `Transaction from ${source}` : ''),
    }
    
    // Add transaction to the store
    addTransaction(newTransaction)
    
    // Reset the form
    resetForm()
    
    // Close the modal
    onClose()
  }

  const resetForm = () => {
    setDate(new Date())
    setTransactionType("buy")
    setAmount("")
    setPrice("")
    setSource("")
    setDescription("")
  }

  const calculateTotal = () => {
    if (amount && price) {
      return (Number.parseFloat(amount) * Number.parseFloat(price)).toFixed(2)
    }
    return "0.00"
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>Enter the details of your Bitcoin transaction.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="transaction-type" className="text-right">
              Type
            </Label>
            <Select 
              value={transactionType} 
              onValueChange={(value) => setTransactionType(value as TransactionType)}
            >
              <SelectTrigger id="transaction-type" className="col-span-3">
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn("col-span-3 justify-start text-left font-normal", !date && "text-gray-500")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar 
                  mode="single" 
                  selected={date} 
                  onSelect={setDate} 
                  initialFocus 
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount (BTC)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.00000001"
              placeholder="0.00000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price (USD)
            </Label>
            <Input
              id="price"
              type="number"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="total" className="text-right">
              Total (USD)
            </Label>
            <Input id="total" value={`$${calculateTotal()}`} disabled className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="source" className="text-right">
              Source
            </Label>
            <Input
              id="source"
              placeholder="Exchange or wallet name"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Add Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 