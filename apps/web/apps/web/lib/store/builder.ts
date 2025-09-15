'use client'

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { saveComponentsForPreview } from '../app/preview/page'

// Component categories
export type ComponentCategory = 
  | 'HERO' 
  | 'TEXT' 
  | 'BUTTON' 
  | 'IMAGE' 
  | 'CARD' 
  | 'GRID' 
  | 'NAVBAR' 
  | 'FOOTER'
  | 'TESTIMONIAL'
  | 'PRICING'
  | 'CONTACT_FORM'
  | 'FORM'
  | 'TABLE'
  | 'CHART'

// Component structure
export interface BuilderComponent {
  id: string
  category: ComponentCategory
  name: string
  position: {
    x: number
    y: number
  }
  size: {
    width: string | number
    height: string | number
  }
  content: Record<string, any>
  styles: Record<string, any>
  children?: BuilderComponent[]
  parentId?: string
  isHidden?: boolean
  isLocked?: boolean
  order?: number
}

// Builder state
export interface BuilderState {
  // Project info
  projectId?: string
  projectName: string
  
  // Components
  components: BuilderComponent[]
  selectedComponentId: string | null
  hoveredComponentId: string | null
  draggedComponent: BuilderComponent | null
  
  // UI state
  viewMode: 'editor' | 'preview'
  showGrid: boolean
  gridSize: number
  zoom: number
  
  // History for undo/redo
  history: BuilderComponent[][]
  historyIndex: number
  
  // Layout
  canvasSize: {
    width: number
    height: number
  }
  
  // Actions
  addComponent: (component: BuilderComponent) => void
  updateComponent: (id: string, updates: Partial<BuilderComponent>) => void
  deleteComponent: (id: string) => void
  duplicateComponent: (id: string) => void
  reorderComponents: (newOrder: BuilderComponent[]) => void
  moveComponent: (id: string, newPosition: { x: number; y: number }) => void
  resizeComponent: (id: string, newSize: { width: string | number; height: string | number }) => void
  
  selectComponent: (id: string | null) => void
  setHoveredComponent: (id: string | null) => void
  setDraggedComponent: (component: BuilderComponent | null) => void
  
  setViewMode: (mode: 'editor' | 'preview') => void
  toggleGrid: () => void
  setZoom: (zoom: number) => void
  
  // History management
  saveToHistory: () => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  
  // Project management
  setProject: (projectId: string, projectName: string) => void
  clearCanvas: () => void
  
  // Component tree operations
  nestComponent: (childId: string, parentId: string, index?: number) => void
  unnestComponent: (childId: string) => void
  
  // Bulk operations
  hideComponent: (id: string, hidden: boolean) => void
  lockComponent: (id: string, locked: boolean) => void
  
  // Search and filter
  searchComponents: (query: string) => BuilderComponent[]
  getComponentsByCategory: (category: ComponentCategory) => BuilderComponent[]
}

// Default component templates
export const createDefaultComponent = (
  category: ComponentCategory,
  name: string,
  position = { x: 0, y: 0 }
): BuilderComponent => {
  const baseComponent: BuilderComponent = {
    id: `${category.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    category,
    name,
    position,
    size: { width: '100%', height: 'auto' },
    content: {},
    styles: {},
    children: [],
    isHidden: false,
    isLocked: false
  }

  // Category-specific defaults
  switch (category) {
    case 'HERO':
      return {
        ...baseComponent,
        content: {
          title: 'Welcome to Your Website',
          subtitle: 'Build amazing experiences with our drag-and-drop builder',
          ctaText: 'Get Started',
          backgroundImage: ''
        },
        styles: {
          backgroundColor: '#1f2937',
          color: '#ffffff',
          padding: '4rem 2rem',
          textAlign: 'center'
        }
      }
    
    case 'TEXT':
      return {
        ...baseComponent,
        content: {
          text: 'Your text content goes here. Click to edit.',
          type: 'paragraph'
        },
        styles: {
          fontSize: '16px',
          lineHeight: '1.6',
          color: '#374151'
        }
      }
    
    case 'BUTTON':
      return {
        ...baseComponent,
        size: { width: 'auto', height: 'auto' },
        content: {
          text: 'Click me',
          href: '#',
          variant: 'primary'
        },
        styles: {
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer'
        }
      }
    
    case 'IMAGE':
      return {
        ...baseComponent,
        content: {
          src: '/placeholder-image.jpg',
          alt: 'Placeholder image',
          width: 400,
          height: 300
        },
        styles: {
          borderRadius: '8px',
          objectFit: 'cover'
        }
      }
    
    case 'CARD':
      return {
        ...baseComponent,
        content: {
          title: 'Card Title',
          description: 'This is a card description. Add your content here.',
          image: '/placeholder-image.jpg'
        },
        styles: {
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }
      }
    
    default:
      return baseComponent
  }
}

export const useBuilderStore = create<BuilderState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        projectName: 'Untitled Project',
        components: [],
        selectedComponentId: null,
        hoveredComponentId: null,
        draggedComponent: null,
        viewMode: 'editor',
        showGrid: true,
        gridSize: 20,
        zoom: 1,
        history: [[]],
        historyIndex: 0,
        canvasSize: {
          width: 1200,
          height: 800
        },

        // Component actions
        addComponent: (component) => set((state) => {
          state.components.push(component)
          state.selectedComponentId = component.id
          state.saveToHistory()
          
          // Trigger preview update
          if (typeof window !== 'undefined') {
            try {
              saveComponentsForPreview(state.components)
            } catch (error) {
              console.warn('Failed to update preview:', error)
            }
          }
        }),

        updateComponent: (id, updates) => set((state) => {
          const componentIndex = state.components.findIndex(c => c.id === id)
          if (componentIndex !== -1) {
            Object.assign(state.components[componentIndex], updates)
          }
          
          // Also check nested components
          const updateNestedComponent = (components: BuilderComponent[]): boolean => {
            for (const component of components) {
              if (component.id === id) {
                Object.assign(component, updates)
                return true
              }
              if (component.children && updateNestedComponent(component.children)) {
                return true
              }
            }
            return false
          }
          
          updateNestedComponent(state.components)
          
          // Trigger preview update
          if (typeof window !== 'undefined') {
            try {
              saveComponentsForPreview(state.components)
            } catch (error) {
              console.warn('Failed to update preview:', error)
            }
          }
        }),

        deleteComponent: (id) => set((state) => {
          // Remove from root level
          state.components = state.components.filter(c => c.id !== id)
          
          // Remove from nested components
          const removeNestedComponent = (components: BuilderComponent[]) => {
            for (let i = components.length - 1; i >= 0; i--) {
              if (components[i].id === id) {
                components.splice(i, 1)
              } else if (components[i].children) {
                removeNestedComponent(components[i].children!)
              }
            }
          }
          
          removeNestedComponent(state.components)
          
          if (state.selectedComponentId === id) {
            state.selectedComponentId = null
          }
          
          state.saveToHistory()
          
          // Trigger preview update
          if (typeof window !== 'undefined') {
            try {
              saveComponentsForPreview(state.components)
            } catch (error) {
              console.warn('Failed to update preview:', error)
            }
          }
        }),

        duplicateComponent: (id) => set((state) => {
          const findAndDuplicateComponent = (components: BuilderComponent[]): BuilderComponent | null => {
            for (const component of components) {
              if (component.id === id) {
                const duplicated: BuilderComponent = {
                  ...JSON.parse(JSON.stringify(component)),
                  id: `${component.category.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  name: `${component.name} Copy`,
                  position: {
                    x: component.position.x + 20,
                    y: component.position.y + 20
                  }
                }
                
                // Update IDs of nested components
                const updateNestedIds = (comps: BuilderComponent[]) => {
                  comps.forEach(comp => {
                    comp.id = `${comp.category.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                    if (comp.children) {
                      updateNestedIds(comp.children)
                    }
                  })
                }
                
                if (duplicated.children) {
                  updateNestedIds(duplicated.children)
                }
                
                return duplicated
              }
              
              if (component.children) {
                const duplicated = findAndDuplicateComponent(component.children)
                if (duplicated) return duplicated
              }
            }
            return null
          }
          
          const duplicated = findAndDuplicateComponent(state.components)
          if (duplicated) {
            state.components.push(duplicated)
            state.selectedComponentId = duplicated.id
            state.saveToHistory()
          }
        }),

        reorderComponents: (newOrder) => set((state) => {
          state.components = newOrder
          state.saveToHistory()
        }),

        moveComponent: (id, newPosition) => set((state) => {
          const component = state.components.find(c => c.id === id)
          if (component) {
            component.position = newPosition
          }
        }),

        resizeComponent: (id, newSize) => set((state) => {
          const component = state.components.find(c => c.id === id)
          if (component) {
            component.size = newSize
          }
        }),

        // Selection actions
        selectComponent: (id) => set((state) => {
          state.selectedComponentId = id
        }),

        setHoveredComponent: (id) => set((state) => {
          state.hoveredComponentId = id
        }),

        setDraggedComponent: (component) => set((state) => {
          state.draggedComponent = component
        }),

        // View actions
        setViewMode: (mode) => set((state) => {
          state.viewMode = mode
        }),

        toggleGrid: () => set((state) => {
          state.showGrid = !state.showGrid
        }),

        setZoom: (zoom) => set((state) => {
          state.zoom = Math.max(0.1, Math.min(3, zoom))
        }),

        // History management
        saveToHistory: () => set((state) => {
          const newHistory = state.history.slice(0, state.historyIndex + 1)
          newHistory.push(JSON.parse(JSON.stringify(state.components)))
          state.history = newHistory.slice(-50) // Keep last 50 states
          state.historyIndex = state.history.length - 1
        }),

        undo: () => set((state) => {
          if (state.historyIndex > 0) {
            state.historyIndex--
            state.components = JSON.parse(JSON.stringify(state.history[state.historyIndex]))
            state.selectedComponentId = null
          }
        }),

        redo: () => set((state) => {
          if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++
            state.components = JSON.parse(JSON.stringify(state.history[state.historyIndex]))
            state.selectedComponentId = null
          }
        }),

        canUndo: () => {
          const state = get()
          return state.historyIndex > 0
        },

        canRedo: () => {
          const state = get()
          return state.historyIndex < state.history.length - 1
        },

        // Project management
        setProject: (projectId, projectName) => set((state) => {
          state.projectId = projectId
          state.projectName = projectName
        }),

        clearCanvas: () => set((state) => {
          state.components = []
          state.selectedComponentId = null
          state.hoveredComponentId = null
          state.history = [[]]
          state.historyIndex = 0
        }),

        // Component tree operations
        nestComponent: (childId, parentId, index) => set((state) => {
          // Find and remove child from current location
          let childComponent: BuilderComponent | null = null
          
          // Remove from root level
          const rootIndex = state.components.findIndex(c => c.id === childId)
          if (rootIndex !== -1) {
            childComponent = state.components.splice(rootIndex, 1)[0]
          }
          
          // Remove from nested locations
          const removeFromNested = (components: BuilderComponent[]): boolean => {
            for (const component of components) {
              if (component.children) {
                const childIndex = component.children.findIndex(c => c.id === childId)
                if (childIndex !== -1) {
                  childComponent = component.children.splice(childIndex, 1)[0]
                  return true
                }
                if (removeFromNested(component.children)) return true
              }
            }
            return false
          }
          
          if (!childComponent) {
            removeFromNested(state.components)
          }
          
          // Add to new parent
          if (childComponent) {
            const addToParent = (components: BuilderComponent[]): boolean => {
              for (const component of components) {
                if (component.id === parentId) {
                  if (!component.children) component.children = []
                  if (index !== undefined) {
                    component.children.splice(index, 0, childComponent!)
                  } else {
                    component.children.push(childComponent!)
                  }
                  childComponent!.parentId = parentId
                  return true
                }
                if (component.children && addToParent(component.children)) {
                  return true
                }
              }
              return false
            }
            
            addToParent(state.components)
            state.saveToHistory()
          }
        }),

        unnestComponent: (childId) => set((state) => {
          let childComponent: BuilderComponent | null = null
          
          // Find and remove from nested location
          const removeFromNested = (components: BuilderComponent[]): boolean => {
            for (const component of components) {
              if (component.children) {
                const childIndex = component.children.findIndex(c => c.id === childId)
                if (childIndex !== -1) {
                  childComponent = component.children.splice(childIndex, 1)[0]
                  return true
                }
                if (removeFromNested(component.children)) return true
              }
            }
            return false
          }
          
          removeFromNested(state.components)
          
          // Add to root level
          if (childComponent) {
            delete childComponent.parentId
            state.components.push(childComponent)
            state.saveToHistory()
          }
        }),

        // Component state management
        hideComponent: (id, hidden) => set((state) => {
          state.updateComponent(id, { isHidden: hidden })
        }),

        lockComponent: (id, locked) => set((state) => {
          state.updateComponent(id, { isLocked: locked })
        }),

        // Search and filter
        searchComponents: (query) => {
          const state = get()
          const searchInComponents = (components: BuilderComponent[]): BuilderComponent[] => {
            const results: BuilderComponent[] = []
            
            for (const component of components) {
              if (
                component.name.toLowerCase().includes(query.toLowerCase()) ||
                component.category.toLowerCase().includes(query.toLowerCase())
              ) {
                results.push(component)
              }
              
              if (component.children) {
                results.push(...searchInComponents(component.children))
              }
            }
            
            return results
          }
          
          return searchInComponents(state.components)
        },

        getComponentsByCategory: (category) => {
          const state = get()
          const getByCategory = (components: BuilderComponent[]): BuilderComponent[] => {
            const results: BuilderComponent[] = []
            
            for (const component of components) {
              if (component.category === category) {
                results.push(component)
              }
              
              if (component.children) {
                results.push(...getByCategory(component.children))
              }
            }
            
            return results
          }
          
          return getByCategory(state.components)
        }
      })),
      {
        name: 'builder-store',
        partialize: (state) => ({
          projectId: state.projectId,
          projectName: state.projectName,
          components: state.components,
          viewMode: state.viewMode,
          showGrid: state.showGrid,
          gridSize: state.gridSize,
          zoom: state.zoom,
          canvasSize: state.canvasSize
        })
      }
    ),
    {
      name: 'builder-store'
    }
  )
)