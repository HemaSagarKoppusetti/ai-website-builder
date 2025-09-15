'use client'

import React, { useState, useRef, useCallback } from 'react'
import { 
  DndContext, 
  DragOverlay, 
  useSensor, 
  useSensors, 
  MouseSensor, 
  TouchSensor,
  KeyboardSensor,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  rectIntersection,
  getFirstCollision
} from '@dnd-kit/core'
import { 
  SortableContext, 
  verticalListSortingStrategy,
  arrayMove 
} from '@dnd-kit/sortable'
import { 
  useSortable,
  SortableContext as SortableContextType
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Target, Zap } from 'lucide-react'
import { useBuilderStore, BuilderComponent } from '../../../lib/store/builder'
import { ComponentRenderer } from './ComponentRenderer'

interface DropZoneProps {
  id: string
  parentId?: string
  index?: number
  isActive?: boolean
  children?: React.ReactNode
}

function DropZone({ id, parentId, index, isActive, children }: DropZoneProps) {
  return (
    <div
      className={`
        relative min-h-16 transition-all duration-200
        ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 border-dashed rounded-lg' : ''}
      `}
    >
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-blue-100/50 dark:bg-blue-900/30 rounded-lg border-2 border-blue-400 border-dashed"
        >
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
            <Target className="h-5 w-5" />
            <span className="text-sm font-medium">Drop component here</span>
          </div>
        </motion.div>
      )}
      {children}
    </div>
  )
}

interface SortableComponentProps {
  component: BuilderComponent
  index: number
  isDragging?: boolean
}

function SortableComponent({ component, index, isDragging }: SortableComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ 
    id: component.id,
    data: {
      type: 'component',
      component
    }
  })

  const { 
    selectedComponentId, 
    hoveredComponentId,
    selectComponent,
    setHoveredComponent 
  } = useBuilderStore()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
    zIndex: isSortableDragging ? 1000 : 'auto'
  }

  const isSelected = selectedComponentId === component.id
  const isHovered = hoveredComponentId === component.id

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      layout
      className={`
        relative group transition-all duration-200
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${isHovered ? 'ring-1 ring-gray-300 ring-offset-1' : ''}
        ${component.isLocked ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
        ${component.isHidden ? 'opacity-50' : ''}
      `}
      onClick={(e) => {
        e.stopPropagation()
        if (!component.isLocked) {
          selectComponent(component.id)
        }
      }}
      onMouseEnter={() => setHoveredComponent(component.id)}
      onMouseLeave={() => setHoveredComponent(null)}
    >
      {/* Drag Handle - Only show when not locked */}
      {!component.isLocked && (
        <div 
          {...listeners}
          className="absolute -top-2 -left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="bg-blue-500 text-white p-1.5 rounded-full shadow-lg cursor-move">
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
              <circle cx="3" cy="3" r="1"/>
              <circle cx="9" cy="3" r="1"/>
              <circle cx="3" cy="9" r="1"/>
              <circle cx="9" cy="9" r="1"/>
            </svg>
          </div>
        </div>
      )}

      {/* Component Selection Indicator */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -inset-1 bg-blue-500/10 border border-blue-500 rounded pointer-events-none"
        >
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            {component.name}
          </div>
        </motion.div>
      )}

      {/* Hover Indicator */}
      {isHovered && !isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -inset-1 bg-gray-500/5 border border-gray-300 rounded pointer-events-none"
        />
      )}

      {/* Lock Indicator */}
      {component.isLocked && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-white p-1 rounded text-xs">
          🔒
        </div>
      )}

      {/* Component Content */}
      <ComponentRenderer component={component} />

      {/* Nested Drop Zone for components that can have children */}
      {component.children && component.children.length >= 0 && (
        <div className="min-h-8 border-t border-gray-200 dark:border-gray-700 mt-2">
          <SortableContext 
            items={component.children.map(child => child.id)}
            strategy={verticalListSortingStrategy}
          >
            {component.children.map((child, childIndex) => (
              <SortableComponent 
                key={child.id}
                component={child}
                index={childIndex}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </motion.div>
  )
}

interface EnhancedDragDropProps {
  children?: React.ReactNode
}

export function EnhancedDragDrop({ children }: EnhancedDragDropProps) {
  const { 
    components, 
    addComponent, 
    reorderComponents,
    draggedComponent,
    setDraggedComponent
  } = useBuilderStore()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [dropZoneId, setDropZoneId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    
    // Find the component being dragged
    const component = components.find(c => c.id === active.id)
    if (component) {
      setDraggedComponent(component)
    }
  }, [components, setDraggedComponent])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event
    setDropZoneId(over?.id as string || null)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveId(null)
    setDropZoneId(null)
    setDraggedComponent(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Handle reordering within the same container
    if (activeId !== overId) {
      const oldIndex = components.findIndex(c => c.id === activeId)
      const newIndex = components.findIndex(c => c.id === overId)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newComponents = arrayMove(components, oldIndex, newIndex)
        reorderComponents(newComponents)
      }
    }
  }, [components, reorderComponents, setDraggedComponent])

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
    setDropZoneId(null)
    setDraggedComponent(null)
  }, [setDraggedComponent])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Main Canvas Area */}
        <div className="p-6">
          {components.length === 0 ? (
            <DropZone id="canvas-empty" isActive={!!dropZoneId}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400"
              >
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-lg font-medium mb-2">Start Building Your Website</h3>
                <p className="text-sm text-center max-w-md">
                  Drag and drop components from the sidebar to begin creating your website.
                  Use the component tree to organize your layout.
                </p>
                <div className="flex items-center space-x-2 mt-4 text-blue-500">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">Pro tip: Use keyboard shortcuts for faster editing</span>
                </div>
              </motion.div>
            </DropZone>
          ) : (
            <SortableContext 
              items={components.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {components.map((component, index) => (
                  <SortableComponent
                    key={component.id}
                    component={component}
                    index={index}
                    isDragging={activeId === component.id}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && draggedComponent && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              style={{ 
                transform: 'rotate(5deg)',
                maxWidth: '300px'
              }}
            >
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">
                    {draggedComponent.category === 'HERO' ? '🏆' : 
                     draggedComponent.category === 'TEXT' ? '📝' : 
                     draggedComponent.category === 'BUTTON' ? '🔘' : '📦'}
                  </span>
                  <span className="text-sm font-medium">{draggedComponent.name}</span>
                </div>
              </div>
              <div className="p-3">
                <ComponentRenderer component={draggedComponent} />
              </div>
            </motion.div>
          )}
        </DragOverlay>

        {children}
      </div>
    </DndContext>
  )
}

// Enhanced Component Palette with better UX
export function ComponentPalette() {
  const { addComponent } = useBuilderStore()

  const componentTypes = [
    { category: 'HERO', name: 'Hero Section', icon: '🏆', description: 'Large banner with title and CTA' },
    { category: 'TEXT', name: 'Text Block', icon: '📝', description: 'Paragraph or heading text' },
    { category: 'BUTTON', name: 'Button', icon: '🔘', description: 'Call-to-action button' },
    { category: 'IMAGE', name: 'Image', icon: '🖼️', description: 'Photo or graphic' },
    { category: 'CARD', name: 'Card', icon: '📋', description: 'Content card with title and body' },
    { category: 'GRID', name: 'Grid Layout', icon: '⚏', description: 'Multi-column grid container' },
    { category: 'NAVBAR', name: 'Navigation', icon: '📑', description: 'Site navigation menu' },
    { category: 'FOOTER', name: 'Footer', icon: '⬇️', description: 'Site footer section' }
  ]

  const handleAddComponent = (category: string, name: string) => {
    const newComponent: BuilderComponent = {
      id: `${category.toLowerCase()}-${Date.now()}`,
      category: category as any,
      name,
      position: { x: 0, y: 0 },
      size: { width: '100%', height: 'auto' },
      content: {},
      styles: {},
      children: [],
      isHidden: false,
      isLocked: false
    }
    
    addComponent(newComponent)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Component Palette
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Drag to add components
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-1 gap-2">
          {componentTypes.map((type) => (
            <motion.button
              key={type.category}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAddComponent(type.category, type.name)}
              className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {type.icon}
              </span>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {type.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {type.description}
                </div>
              </div>
              <Plus className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}