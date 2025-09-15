'use client'

import React from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useBuilderStore } from '../../lib/store/builder'
import { BuilderToolbar } from '../components/builder/BuilderToolbar'
import { ComponentPalette } from '../components/builder/ComponentPalette'
import { BuilderCanvas } from '../components/builder/BuilderCanvas'
import { PropertiesPanel } from '../components/builder/PropertiesPanel'
import { AIChatAssistant } from '../components/builder/AIChatAssistant'
import { DndProvider } from '../components/builder/DndProvider'
import { useState } from 'react'
import { BuilderComponent } from '../../lib/store/builder'

export default function BuilderPage() {
  const {
    components,
    selectedComponentId,
    leftPanelOpen,
    rightPanelOpen,
    addComponent,
    moveComponent,
    selectComponent,
    setHoveredComponent,
  } = useBuilderStore()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggedComponent, setDraggedComponent] = useState<BuilderComponent | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    
    // Check if dragging from palette or canvas
    if (active.data.current?.type === 'palette-item') {
      setDraggedComponent(active.data.current.component)
    } else {
      const component = components.find(c => c.id === active.id)
      setDraggedComponent(component || null)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setDraggedComponent(null)

    if (!over) return

    if (active.data.current?.type === 'palette-item') {
      // Adding new component from palette
      const component = active.data.current.component
      addComponent(component, over.id as string)
    } else {
      // Moving existing component
      if (active.id !== over.id) {
        moveComponent(active.id as string, over.id as string)
      }
    }
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Top Toolbar */}
      <BuilderToolbar />
      
      <div className="flex-1 flex overflow-hidden">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* Left Panel - Component Palette */}
          {leftPanelOpen && (
            <div className="w-80 builder-sidebar flex-shrink-0">
              <ComponentPalette />
            </div>
          )}

          {/* Main Canvas Area */}
          <div className="flex-1 builder-canvas overflow-auto">
            <BuilderCanvas />
          </div>

          {/* Right Panel - Properties */}
          {rightPanelOpen && (
            <div className="w-80 builder-sidebar flex-shrink-0">
              <PropertiesPanel />
            </div>
          )}

          {/* Drag Overlay */}
          <DragOverlay>
            {draggedComponent ? (
              <div className="drag-overlay bg-card border rounded-lg p-4 shadow-lg">
                <div className="text-sm font-medium">{draggedComponent.name}</div>
                <div className="text-xs text-muted-foreground">{draggedComponent.category}</div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
      
      {/* AI Chat Assistant */}
      <AIChatAssistant />
    </div>
  )
}