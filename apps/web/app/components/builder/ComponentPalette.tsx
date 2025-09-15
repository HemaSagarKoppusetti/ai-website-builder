'use client'

import React, { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { 
  Layout, 
  Square, 
  Menu, 
  FileText, 
  Image, 
  Video, 
  MousePointer,
  Table,
  BarChart3,
  Search,
  Plus
} from 'lucide-react'
import { BuilderComponent, ComponentType, ComponentCategory } from '../../../lib/store/builder'

interface ComponentTemplate {
  id: string
  name: string
  category: ComponentCategory
  type: ComponentType
  icon: React.ComponentType<any>
  description: string
  defaultProps: Record<string, any>
  defaultStyles: Record<string, any>
}

const componentTemplates: ComponentTemplate[] = [
  // Layout Components
  {
    id: 'container',
    name: 'Container',
    category: 'CONTAINER',
    type: 'LAYOUT',
    icon: Square,
    description: 'A flexible container for other components',
    defaultProps: {
      maxWidth: '1200px',
      padding: '1rem'
    },
    defaultStyles: {
      display: 'block',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1rem'
    }
  },
  {
    id: 'grid',
    name: 'Grid',
    category: 'GRID',
    type: 'LAYOUT',
    icon: Layout,
    description: 'A responsive grid layout',
    defaultProps: {
      columns: 3,
      gap: '1rem'
    },
    defaultStyles: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1rem'
    }
  },
  
  // UI Components
  {
    id: 'button',
    name: 'Button',
    category: 'BUTTON',
    type: 'UI',
    icon: MousePointer,
    description: 'A clickable button element',
    defaultProps: {
      text: 'Click me',
      variant: 'primary',
      size: 'medium'
    },
    defaultStyles: {
      backgroundColor: '#3B82F6',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer'
    }
  },
  {
    id: 'card',
    name: 'Card',
    category: 'CARD',
    type: 'UI',
    icon: Square,
    description: 'A card container for content',
    defaultProps: {
      title: 'Card Title',
      content: 'Card content goes here',
      showImage: false
    },
    defaultStyles: {
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }
  },

  // Navigation
  {
    id: 'navbar',
    name: 'Navigation Bar',
    category: 'NAVBAR',
    type: 'NAVIGATION',
    icon: Menu,
    description: 'A horizontal navigation bar',
    defaultProps: {
      logo: 'Logo',
      links: ['Home', 'About', 'Services', 'Contact'],
      sticky: true
    },
    defaultStyles: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: 'white',
      borderBottom: '1px solid #E5E7EB'
    }
  },

  // Content
  {
    id: 'hero',
    name: 'Hero Section',
    category: 'HERO',
    type: 'CONTENT',
    icon: Layout,
    description: 'A large hero section with title and CTA',
    defaultProps: {
      title: 'Welcome to our platform',
      subtitle: 'Build amazing websites with ease',
      buttonText: 'Get Started',
      backgroundImage: ''
    },
    defaultStyles: {
      textAlign: 'center',
      padding: '5rem 2rem',
      backgroundColor: '#F8FAFC'
    }
  },
  {
    id: 'text',
    name: 'Text Block',
    category: 'TEXT',
    type: 'CONTENT',
    icon: FileText,
    description: 'A rich text content block',
    defaultProps: {
      content: 'Your text content goes here',
      heading: 'h2',
      alignment: 'left'
    },
    defaultStyles: {
      lineHeight: '1.6',
      marginBottom: '1rem'
    }
  },

  // Media
  {
    id: 'image',
    name: 'Image',
    category: 'IMAGE',
    type: 'MEDIA',
    icon: Image,
    description: 'An image component',
    defaultProps: {
      src: '/placeholder-image.jpg',
      alt: 'Placeholder image',
      width: '100%',
      height: 'auto'
    },
    defaultStyles: {
      width: '100%',
      height: 'auto',
      borderRadius: '0.375rem'
    }
  },

  // Data Display
  {
    id: 'table',
    name: 'Table',
    category: 'TABLE',
    type: 'DATA_DISPLAY',
    icon: Table,
    description: 'A data table component',
    defaultProps: {
      headers: ['Name', 'Email', 'Role'],
      rows: [],
      sortable: true,
      pagination: false
    },
    defaultStyles: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }
]

interface DraggableComponentProps {
  template: ComponentTemplate
}

function DraggableComponent({ template }: DraggableComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `palette-${template.id}`,
    data: {
      type: 'palette-item',
      component: {
        name: template.name,
        type: template.type,
        category: template.category,
        props: template.defaultProps,
        styles: template.defaultStyles,
      }
    }
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const IconComponent = template.icon

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        group cursor-grab active:cursor-grabbing p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-muted rounded-md group-hover:bg-background transition-colors">
          <IconComponent className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-medium">{template.name}</div>
          <div className="text-xs text-muted-foreground">{template.description}</div>
        </div>
      </div>
    </div>
  )
}

const categories = [
  { id: 'all', name: 'All', icon: Layout },
  { id: 'layout', name: 'Layout', icon: Layout },
  { id: 'ui', name: 'UI Elements', icon: Square },
  { id: 'navigation', name: 'Navigation', icon: Menu },
  { id: 'content', name: 'Content', icon: FileText },
  { id: 'media', name: 'Media', icon: Image },
  { id: 'data', name: 'Data', icon: Table },
]

export function ComponentPalette() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTemplates = componentTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || 
      template.type.toLowerCase() === selectedCategory || 
      selectedCategory === 'layout' && template.type === 'LAYOUT' ||
      selectedCategory === 'ui' && template.type === 'UI' ||
      selectedCategory === 'navigation' && template.type === 'NAVIGATION' ||
      selectedCategory === 'content' && template.type === 'CONTENT' ||
      selectedCategory === 'media' && template.type === 'MEDIA' ||
      selectedCategory === 'data' && template.type === 'DATA_DISPLAY'

    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">Components</h2>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-md text-sm"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors
                  ${selectedCategory === category.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                  }
                `}
              >
                <IconComponent className="h-3 w-3" />
                <span>{category.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {filteredTemplates.map((template) => (
            <DraggableComponent key={template.id} template={template} />
          ))}
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No components found</p>
              {searchQuery && (
                <p className="text-xs">Try adjusting your search terms</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}