'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useBuilderStore, BuilderComponent } from '../../../lib/store/builder'
import { Copy, Trash2, Move } from 'lucide-react'

interface CanvasComponentProps {
  component: BuilderComponent
  isPreviewMode?: boolean
}

export function CanvasComponent({ component, isPreviewMode = false }: CanvasComponentProps) {
  const {
    selectedComponentId,
    hoveredComponentId,
    selectComponent,
    setHoveredComponent,
    deleteComponent,
    duplicateComponent
  } = useBuilderStore()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: component.id,
    disabled: isPreviewMode
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isSelected = selectedComponentId === component.id
  const isHovered = hoveredComponentId === component.id

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isPreviewMode) {
      selectComponent(component.id)
    }
  }

  const handleMouseEnter = () => {
    if (!isPreviewMode && !isDragging) {
      setHoveredComponent(component.id)
    }
  }

  const handleMouseLeave = () => {
    if (!isPreviewMode) {
      setHoveredComponent(null)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteComponent(component.id)
  }

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    duplicateComponent(component.id)
  }

  // Render component based on type
  const renderComponentContent = () => {
    const combinedStyles = {
      ...component.styles,
      position: 'relative' as const
    }

    switch (component.category) {
      case 'HERO':
        return (
          <section style={combinedStyles} className="hero-section">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {component.props.title || 'Hero Title'}
              </h1>
              <p className="text-xl mb-8 text-gray-600">
                {component.props.subtitle || 'Hero subtitle'}
              </p>
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700">
                {component.props.buttonText || 'Get Started'}
              </button>
            </div>
          </section>
        )

      case 'BUTTON':
        return (
          <button style={combinedStyles} className="inline-flex items-center">
            {component.props.text || 'Button'}
          </button>
        )

      case 'CARD':
        return (
          <div style={combinedStyles} className="card">
            {component.props.showImage && (
              <div className="w-full h-48 bg-gray-200 rounded-t-lg mb-4"></div>
            )}
            <h3 className="text-xl font-semibold mb-2">
              {component.props.title || 'Card Title'}
            </h3>
            <p className="text-gray-600">
              {component.props.content || 'Card content'}
            </p>
          </div>
        )

      case 'TEXT':
        const HeadingTag = component.props.heading || 'p'
        return (
          <div style={combinedStyles}>
            {React.createElement(HeadingTag, {
              style: { textAlign: component.props.alignment || 'left' },
              className: HeadingTag === 'p' ? 'text-base' : 'text-2xl font-bold mb-4'
            }, component.props.content || 'Text content')}
          </div>
        )

      case 'IMAGE':
        return (
          <div style={combinedStyles}>
            <img
              src={component.props.src || '/placeholder-image.jpg'}
              alt={component.props.alt || 'Image'}
              style={{
                width: component.props.width || '100%',
                height: component.props.height || 'auto',
                borderRadius: component.styles.borderRadius || '0.375rem'
              }}
            />
          </div>
        )

      case 'NAVBAR':
        return (
          <nav style={combinedStyles}>
            <div className="flex justify-between items-center">
              <div className="font-bold text-xl">
                {component.props.logo || 'Logo'}
              </div>
              <div className="flex space-x-6">
                {(component.props.links || ['Home', 'About', 'Contact']).map((link: string, index: number) => (
                  <a key={index} href="#" className="hover:text-blue-600">
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </nav>
        )

      case 'CONTAINER':
        return (
          <div style={combinedStyles}>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
              Container - Drop components here
            </div>
          </div>
        )

      case 'GRID':
        return (
          <div 
            style={{
              ...combinedStyles,
              display: 'grid',
              gridTemplateColumns: `repeat(${component.props.columns || 3}, 1fr)`,
              gap: component.props.gap || '1rem'
            }}
          >
            {Array.from({ length: component.props.columns || 3 }, (_, i) => (
              <div key={i} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                Grid Item {i + 1}
              </div>
            ))}
          </div>
        )

      default:
        return (
          <div style={combinedStyles} className="bg-gray-100 p-4 rounded border-2 border-dashed">
            <div className="text-sm text-gray-600">
              {component.name} ({component.category})
            </div>
          </div>
        )
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        relative group transition-all duration-150
        ${isDragging ? 'z-50 opacity-50' : ''}
        ${isSelected ? 'component-selected' : ''}
        ${isHovered && !isSelected ? 'component-hover' : ''}
        ${isPreviewMode ? '' : 'cursor-pointer'}
      `}
    >
      {/* Selection Outline */}
      {(isSelected || isHovered) && !isPreviewMode && (
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute inset-0 border-2 rounded ${
            isSelected ? 'border-blue-500' : 'border-blue-300'
          }`} />
          
          {/* Component Label */}
          <div className={`absolute -top-6 left-0 px-2 py-1 text-xs font-medium text-white rounded-t ${
            isSelected ? 'bg-blue-500' : 'bg-blue-300'
          }`}>
            {component.name}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isSelected && !isPreviewMode && (
        <div className="absolute -top-8 right-0 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            {...listeners}
            className="p-1 bg-gray-600 text-white rounded hover:bg-gray-700"
            title="Move"
          >
            <Move className="h-3 w-3" />
          </button>
          <button
            onClick={handleDuplicate}
            className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            title="Duplicate"
          >
            <Copy className="h-3 w-3" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Component Content */}
      <div className={isPreviewMode ? '' : 'pointer-events-none'}>
        {renderComponentContent()}
      </div>
    </div>
  )
}