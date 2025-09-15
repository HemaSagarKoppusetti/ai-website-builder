'use client'

import React from 'react'

export function ResizablePanelGroup({ 
  children, 
  direction = 'horizontal',
  className = '' 
}: { 
  children: React.ReactNode
  direction?: 'horizontal' | 'vertical'
  className?: string
}) {
  return (
    <div className={`flex ${direction === 'horizontal' ? 'flex-row' : 'flex-col'} ${className}`}>
      {children}
    </div>
  )
}

export function ResizablePanel({ 
  children, 
  defaultSize = 50,
  minSize = 10,
  maxSize = 90,
  className = ''
}: { 
  children: React.ReactNode
  defaultSize?: number
  minSize?: number
  maxSize?: number
  className?: string
}) {
  return (
    <div className={`flex-1 ${className}`} style={{ flexBasis: `${defaultSize}%` }}>
      {children}
    </div>
  )
}

export function ResizableHandle() {
  return (
    <div className="w-1 bg-gray-300 hover:bg-gray-400 cursor-col-resize flex-shrink-0" />
  )
}