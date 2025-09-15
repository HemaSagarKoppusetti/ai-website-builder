'use client'

import React, { createContext, useContext } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextType | null>(null)

export function Tabs({ 
  value, 
  onValueChange, 
  children,
  className = ''
}: {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ 
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('inline-flex items-center justify-center rounded-lg bg-gray-100 p-1', className)}>
      {children}
    </div>
  )
}

export function TabsTrigger({ 
  value,
  children,
  className = ''
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')
  
  const isActive = context.value === value
  
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-all',
        isActive 
          ? 'bg-white text-gray-900 shadow-sm' 
          : 'text-gray-500 hover:text-gray-900',
        className
      )}
      onClick={() => context.onValueChange(value)}
    >
      {children}
    </button>
  )
}

export function TabsContent({ 
  value,
  children,
  className = ''
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')
  
  if (context.value !== value) return null
  
  return (
    <div className={className}>
      {children}
    </div>
  )
}