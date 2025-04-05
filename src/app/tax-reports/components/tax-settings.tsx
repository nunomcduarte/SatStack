"use client"

import { useState, useEffect } from "react"
import { SaveIcon, InfoIcon } from "lucide-react"
import { toast } from "react-hot-toast"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useTaxSettings } from "@/lib/contexts/taxSettingsContext"

export default function TaxSettings() {
  const { settings, updateSettings, saveSettings } = useTaxSettings()
  
  // Local state to track form values
  const [costBasisMethod, setCostBasisMethod] = useState(settings.costBasisMethod)
  const [shortTermRate, setShortTermRate] = useState(settings.shortTermRate.toString())
  const [longTermRate, setLongTermRate] = useState(settings.longTermRate.toString())
  const [includeFees, setIncludeFees] = useState(settings.includeFees)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Update local state when context settings change
  useEffect(() => {
    setCostBasisMethod(settings.costBasisMethod)
    setShortTermRate(settings.shortTermRate.toString())
    setLongTermRate(settings.longTermRate.toString())
    setIncludeFees(settings.includeFees)
    setHasChanges(false)
  }, [settings])
  
  // Track changes to determine if save button should be enabled
  useEffect(() => {
    const isChanged = 
      costBasisMethod !== settings.costBasisMethod ||
      parseFloat(shortTermRate) !== settings.shortTermRate ||
      parseFloat(longTermRate) !== settings.longTermRate ||
      includeFees !== settings.includeFees
    
    setHasChanges(isChanged)
  }, [costBasisMethod, shortTermRate, longTermRate, includeFees, settings])
  
  const handleSave = () => {
    // Update context with current form values
    updateSettings({
      costBasisMethod: costBasisMethod as 'fifo' | 'lifo' | 'hifo',
      shortTermRate: parseFloat(shortTermRate),
      longTermRate: parseFloat(longTermRate),
      includeFees
    })
    
    // Save settings to localStorage
    saveSettings()
    
    // Show success message
    toast.success('Tax settings saved successfully')
    setHasChanges(false)
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Tax Settings</h2>
        <p className="text-sm text-muted-foreground">Customize your tax calculation preferences</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cost Basis Method</CardTitle>
            <CardDescription>Choose how to calculate cost basis for your Bitcoin</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={costBasisMethod} 
              onValueChange={(value) => {
                setCostBasisMethod(value as 'fifo' | 'lifo' | 'hifo')
              }}
              className="space-y-4"
            >
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="fifo" id="fifo" className="mt-1" />
                <div className="grid gap-0.5">
                  <Label htmlFor="fifo" className="font-medium">FIFO (First In, First Out)</Label>
                  <p className="text-sm text-muted-foreground">
                    Assumes your oldest Bitcoin is sold first. Most commonly used method.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="lifo" id="lifo" className="mt-1" />
                <div className="grid gap-0.5">
                  <Label htmlFor="lifo" className="font-medium">LIFO (Last In, First Out)</Label>
                  <p className="text-sm text-muted-foreground">
                    Assumes your newest Bitcoin is sold first. Can reduce taxes in a rising market.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="hifo" id="hifo" className="mt-1" />
                <div className="grid gap-0.5">
                  <Label htmlFor="hifo" className="font-medium">HIFO (Highest In, First Out)</Label>
                  <p className="text-sm text-muted-foreground">
                    Assumes your highest cost Bitcoin is sold first. Usually minimizes capital gains.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tax Rates</CardTitle>
            <CardDescription>Set your estimated tax rates for Bitcoin gains</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="short-term-rate">Short-term rate (%)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        For assets held less than one year. Usually taxed as ordinary income.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input 
                id="short-term-rate" 
                type="number" 
                min="0" 
                max="100" 
                value={shortTermRate} 
                onChange={(e) => setShortTermRate(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="long-term-rate">Long-term rate (%)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        For assets held more than one year. Usually lower than short-term rates.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input 
                id="long-term-rate" 
                type="number" 
                min="0" 
                max="100" 
                value={longTermRate} 
                onChange={(e) => setLongTermRate(e.target.value)} 
              />
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="space-y-0.5">
                <Label htmlFor="include-fees">Include transaction fees in cost basis</Label>
                <p className="text-sm text-muted-foreground">
                  Add transaction fees to your cost basis
                </p>
              </div>
              <Switch 
                id="include-fees" 
                checked={includeFees} 
                onCheckedChange={setIncludeFees} 
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges}
        >
          <SaveIcon className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  )
} 