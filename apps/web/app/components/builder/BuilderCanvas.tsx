'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useBuilderStore } from '../../../lib/store/builder'
import { CanvasComponent } from './CanvasComponent'
import { Plus } from 'lucide-react'

export function BuilderCanvas() {
  const { 
    components, 
    viewport, 
    showGrid, 
    isPreviewMode 
  } = useBuilderStore()

  const { isOver, setNodeRef } = useDroppable({
    id: 'canvas-root'
  })

  const canvasStyles = {
    desktop: 'max-w-none',
    tablet: 'max-w-3xl',
    mobile: 'max-w-sm'
  }

  const getViewportStyles = () => {
    const baseStyles = 'mx-auto transition-all duration-500 ease-in-out'
    
    if (isPreviewMode) {
      switch (viewport) {
        case 'mobile':
          return `${baseStyles} w-[375px] bg-gray-900 p-2 rounded-[2.5rem] shadow-2xl`
        case 'tablet':
          return `${baseStyles} w-[768px] bg-gray-800 p-4 rounded-2xl shadow-2xl`
        case 'desktop':
        default:
          return `${baseStyles} w-full`
      }
    }
    
    switch (viewport) {
      case 'mobile':
        return `${baseStyles} max-w-sm`
      case 'tablet':
        return `${baseStyles} max-w-3xl`
      case 'desktop':
      default:
        return `${baseStyles} max-w-none`
    }
  }
  
  const getCanvasStyles = () => {
    let baseClasses = `
      min-h-screen bg-white relative transition-all duration-300
      ${isOver ? 'ring-2 ring-primary ring-opacity-50 bg-primary/5' : ''}
      ${showGrid ? 'bg-grid' : ''}
      ${isPreviewMode ? 'pointer-events-none' : ''}
    `
    
    if (isPreviewMode && (viewport === 'mobile' || viewport === 'tablet')) {
      baseClasses += ' rounded-lg overflow-hidden shadow-lg'
    } else if (!isPreviewMode) {
      baseClasses += ' rounded-lg shadow-lg'
    }
    
    return baseClasses
  }
  
  return (
    <div className="h-full p-8 bg-gray-50">
      {/* Responsive Viewport Container */}
      <div className={getViewportStyles()}>
        {/* Device Frame for Mobile/Tablet in Preview Mode */}
        {isPreviewMode && viewport === 'mobile' && (
          <>
            {/* Phone Frame Elements */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-700 rounded-full" />
            <div className="absolute top-7 left-1/2 transform -translate-x-1/2 w-3 h-3 border-2 border-gray-700 rounded-full" />
          </>
        )}
        
        {/* Canvas */}
        <div
          ref={setNodeRef}
          className={getCanvasStyles()}
        >
          {/* Grid Pattern */}
          {showGrid && (
            <div 
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />
          )}

          <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {components.length === 0 ? (
              <div className="h-96 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg m-8">
                <div className="text-center">
                  <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Start building your website</p>
                  <p className="text-sm">Drag components from the left panel to get started</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                {components.map((component) => (
                  <CanvasComponent 
                    key={component.id} 
                    component={component}
                    isPreviewMode={isPreviewMode}
                  />
                ))}
              </div>
            )}
          </SortableContext>

          {/* Preview Mode Overlay */}
          {isPreviewMode && (
            <div className="absolute inset-0 bg-transparent pointer-events-none" />
          )}
        </div>
      </div>

      {/* Canvas Info */}
      <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-muted-foreground">
        {isPreviewMode && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Preview Mode</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <span className="capitalize font-medium">{viewport}</span>
          <span>•</span>
          <span>
            {viewport === 'desktop' ? 'Full Width' : 
             viewport === 'tablet' ? '768px' : '375px'}
          </span>
          {components.length > 0 && (
            <>
              <span>•</span>
              <span>{components.length} component{components.length !== 1 ? 's' : ''}</span>
            </>
          )}
        </div>
        
        {showGrid && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded">
            <div className="w-3 h-3 border border-blue-400 opacity-60" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
            <span>Grid</span>
          </div>
        )}
      </div>
    </div>
  )
}