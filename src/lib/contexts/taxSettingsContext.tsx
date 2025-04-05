"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Define the shape of tax settings
export interface TaxSettings {
  costBasisMethod: 'fifo' | 'lifo' | 'hifo'
  shortTermRate: number
  longTermRate: number
  includeFees: boolean
}

// Define the tax settings context interface
interface TaxSettingsContextType {
  settings: TaxSettings
  updateSettings: (newSettings: Partial<TaxSettings>) => void
  saveSettings: () => void
}

// Default values for tax settings
const defaultSettings: TaxSettings = {
  costBasisMethod: 'fifo',
  shortTermRate: 25,
  longTermRate: 15,
  includeFees: true,
}

// Create the context
const TaxSettingsContext = createContext<TaxSettingsContextType | undefined>(undefined)

// Custom hook to use the tax settings context
export function useTaxSettings() {
  const context = useContext(TaxSettingsContext)
  if (context === undefined) {
    throw new Error('useTaxSettings must be used within a TaxSettingsProvider')
  }
  return context
}

// Provider component
export function TaxSettingsProvider({ children }: { children: ReactNode }) {
  // State to store the current tax settings
  const [settings, setSettings] = useState<TaxSettings>(defaultSettings)
  
  // Load settings from localStorage on mount
  useEffect(() => {
    const storedSettings = localStorage.getItem('taxSettings')
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings)
        setSettings(parsedSettings)
      } catch (error) {
        console.error('Error parsing stored tax settings:', error)
        // If there's an error parsing, use the default settings
        setSettings(defaultSettings)
      }
    }
  }, [])
  
  // Update settings (without saving to localStorage)
  const updateSettings = (newSettings: Partial<TaxSettings>) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      ...newSettings,
    }))
  }
  
  // Save settings to localStorage
  const saveSettings = () => {
    try {
      localStorage.setItem('taxSettings', JSON.stringify(settings))
      // Dispatch a custom event so other components can react to settings changes
      window.dispatchEvent(new CustomEvent('tax-settings-updated'))
    } catch (error) {
      console.error('Error saving tax settings:', error)
    }
  }
  
  return (
    <TaxSettingsContext.Provider value={{ settings, updateSettings, saveSettings }}>
      {children}
    </TaxSettingsContext.Provider>
  )
} 