import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// Types for builder components and state
export interface ComponentStyle {
  [key: string]: string | number
}

export interface ComponentProps {
  [key: string]: any
}

export interface BuilderComponent {
  id: string
  name: string
  type: ComponentType
  category: ComponentCategory
  props: ComponentProps
  styles: ComponentStyle
  children?: BuilderComponent[]
  parentId?: string
  isLocked?: boolean
  isHidden?: boolean
  // Layout properties
  position?: {
    x?: number
    y?: number
  }
  size?: {
    width?: string
    height?: string
  }
}

export type ComponentType = 
  | 'LAYOUT'
  | 'UI' 
  | 'NAVIGATION'
  | 'FORM'
  | 'DATA_DISPLAY'
  | 'MEDIA'
  | 'CONTENT'
  | 'CUSTOM'

export type ComponentCategory = 
  | 'HERO'
  | 'HEADER'
  | 'FOOTER'
  | 'SIDEBAR'
  | 'NAVBAR'
  | 'BUTTON'
  | 'CARD'
  | 'MODAL'
  | 'FORM'
  | 'TABLE'
  | 'CHART'
  | 'IMAGE'
  | 'VIDEO'
  | 'TEXT'
  | 'LIST'
  | 'GRID'
  | 'CONTAINER'
  | 'TESTIMONIAL'
  | 'PRICING'
  | 'FEATURE_LIST'
  | 'FAQ'
  | 'CONTACT_FORM'
  | 'NEWSLETTER'
  | 'SOCIAL_MEDIA'
  | 'BREADCRUMB'
  | 'PAGINATION'
  | 'SEARCH_BAR'

export type ViewportSize = 'desktop' | 'tablet' | 'mobile'

export interface BuilderState {
  // Project info
  projectId?: string
  projectName: string
  
  // Components
  components: BuilderComponent[]
  selectedComponentId: string | null
  hoveredComponentId: string | null
  
  // Clipboard
  clipboardComponent: BuilderComponent | null
  
  // UI State
  viewport: ViewportSize
  showGrid: boolean
  showGuides: boolean
  snapToGrid: boolean
  gridSize: number
  
  // Panels
  leftPanelOpen: boolean
  rightPanelOpen: boolean
  bottomPanelOpen: boolean
  
  // History for undo/redo
  history: {
    past: BuilderComponent[][]
    present: BuilderComponent[]
    future: BuilderComponent[][]
  }
  
  // Preview mode
  isPreviewMode: boolean
  
  // AI Generation
  aiGenerating: boolean
  aiPrompt: string
}

export interface BuilderActions {
  // Component actions
  addComponent: (component: Omit<BuilderComponent, 'id'>, parentId?: string, index?: number) => string
  updateComponent: (id: string, updates: Partial<BuilderComponent>) => void
  deleteComponent: (id: string) => void
  duplicateComponent: (id: string) => string
  moveComponent: (id: string, newParentId?: string, newIndex?: number) => void
  
  // Selection
  selectComponent: (id: string | null) => void
  setHoveredComponent: (id: string | null) => void
  
  // Clipboard
  copyComponent: (id: string) => void
  pasteComponent: (parentId?: string) => void
  
  // UI Actions
  setViewport: (viewport: ViewportSize) => void
  toggleGrid: () => void
  toggleGuides: () => void
  toggleSnapToGrid: () => void
  setGridSize: (size: number) => void
  
  // Panels
  toggleLeftPanel: () => void
  toggleRightPanel: () => void
  toggleBottomPanel: () => void
  
  // History
  undo: () => void
  redo: () => void
  pushToHistory: () => void
  
  // Preview
  togglePreviewMode: () => void
  
  // AI
  setAiGenerating: (generating: boolean) => void
  setAiPrompt: (prompt: string) => void
  
  // Project
  loadProject: (components: BuilderComponent[], projectId?: string, projectName?: string) => void
  clearProject: () => void
  
  // Utility functions
  getComponent: (id: string) => BuilderComponent | undefined
  getComponentTree: () => BuilderComponent[]
  getSelectedComponent: () => BuilderComponent | null
}

type BuilderStore = BuilderState & BuilderActions

// Helper function to generate unique IDs
const generateId = (): string => {
  return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Helper function to find component by ID
const findComponent = (components: BuilderComponent[], id: string): BuilderComponent | undefined => {
  for (const component of components) {
    if (component.id === id) return component
    if (component.children) {
      const found = findComponent(component.children, id)
      if (found) return found
    }
  }
  return undefined
}

// Helper function to remove component from tree
const removeComponent = (components: BuilderComponent[], id: string): BuilderComponent[] => {
  return components.filter(component => {
    if (component.id === id) return false
    if (component.children) {
      component.children = removeComponent(component.children, id)
    }
    return true
  })
}

// Helper function to add component to tree
const addComponentToTree = (
  components: BuilderComponent[],
  newComponent: BuilderComponent,
  parentId?: string,
  index?: number
): BuilderComponent[] => {
  if (!parentId) {
    // Add to root level
    if (index !== undefined) {
      const newComponents = [...components]
      newComponents.splice(index, 0, newComponent)
      return newComponents
    }
    return [...components, newComponent]
  }

  return components.map(component => {
    if (component.id === parentId) {
      if (!component.children) component.children = []
      
      if (index !== undefined) {
        const newChildren = [...component.children]
        newChildren.splice(index, 0, newComponent)
        return { ...component, children: newChildren }
      }
      
      return {
        ...component,
        children: [...component.children, newComponent]
      }
    }
    
    if (component.children) {
      return {
        ...component,
        children: addComponentToTree(component.children, newComponent, parentId, index)
      }
    }
    
    return component
  })
}

export const useBuilderStore = create<BuilderStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        projectName: 'Untitled Project',
        components: [],
        selectedComponentId: null,
        hoveredComponentId: null,
        clipboardComponent: null,
        
        viewport: 'desktop',
        showGrid: false,
        showGuides: true,
        snapToGrid: false,
        gridSize: 8,
        
        leftPanelOpen: true,
        rightPanelOpen: true,
        bottomPanelOpen: false,
        
        history: {
          past: [],
          present: [],
          future: []
        },
        
        isPreviewMode: false,
        aiGenerating: false,
        aiPrompt: '',

        // Actions
        addComponent: (component, parentId, index) => {
          const id = generateId()
          const newComponent: BuilderComponent = {
            ...component,
            id,
            parentId
          }
          
          set((state) => {
            state.components = addComponentToTree(state.components, newComponent, parentId, index)
            state.selectedComponentId = id
          })
          
          get().pushToHistory()
          return id
        },

        updateComponent: (id, updates) => {
          set((state) => {
            const updateComponentInTree = (components: BuilderComponent[]): BuilderComponent[] => {
              return components.map(component => {
                if (component.id === id) {
                  return { ...component, ...updates }
                }
                if (component.children) {
                  return {
                    ...component,
                    children: updateComponentInTree(component.children)
                  }
                }
                return component
              })
            }
            
            state.components = updateComponentInTree(state.components)
          })
          
          get().pushToHistory()
        },

        deleteComponent: (id) => {
          set((state) => {
            state.components = removeComponent(state.components, id)
            if (state.selectedComponentId === id) {
              state.selectedComponentId = null
            }
            if (state.hoveredComponentId === id) {
              state.hoveredComponentId = null
            }
          })
          
          get().pushToHistory()
        },

        duplicateComponent: (id) => {
          const component = get().getComponent(id)
          if (!component) return ''
          
          const duplicateComponentRecursive = (comp: BuilderComponent): BuilderComponent => {
            const newId = generateId()
            return {
              ...comp,
              id: newId,
              name: `${comp.name} Copy`,
              children: comp.children?.map(duplicateComponentRecursive)
            }
          }
          
          const duplicated = duplicateComponentRecursive(component)
          
          set((state) => {
            state.components = addComponentToTree(
              state.components,
              duplicated,
              component.parentId,
              undefined
            )
            state.selectedComponentId = duplicated.id
          })
          
          get().pushToHistory()
          return duplicated.id
        },

        moveComponent: (id, newParentId, newIndex) => {
          const component = get().getComponent(id)
          if (!component) return
          
          set((state) => {
            // Remove from current position
            state.components = removeComponent(state.components, id)
            
            // Add to new position
            const updatedComponent = { ...component, parentId: newParentId }
            state.components = addComponentToTree(
              state.components,
              updatedComponent,
              newParentId,
              newIndex
            )
          })
          
          get().pushToHistory()
        },

        selectComponent: (id) => {
          set((state) => {
            state.selectedComponentId = id
          })
        },

        setHoveredComponent: (id) => {
          set((state) => {
            state.hoveredComponentId = id
          })
        },

        copyComponent: (id) => {
          const component = get().getComponent(id)
          if (component) {
            set((state) => {
              state.clipboardComponent = component
            })
          }
        },

        pasteComponent: (parentId) => {
          const { clipboardComponent } = get()
          if (clipboardComponent) {
            const duplicateComponentRecursive = (comp: BuilderComponent): BuilderComponent => {
              const newId = generateId()
              return {
                ...comp,
                id: newId,
                parentId,
                children: comp.children?.map(duplicateComponentRecursive)
              }
            }
            
            const pastedComponent = duplicateComponentRecursive(clipboardComponent)
            
            set((state) => {
              state.components = addComponentToTree(
                state.components,
                pastedComponent,
                parentId
              )
              state.selectedComponentId = pastedComponent.id
            })
            
            get().pushToHistory()
          }
        },

        setViewport: (viewport) => {
          set((state) => {
            state.viewport = viewport
          })
        },

        toggleGrid: () => {
          set((state) => {
            state.showGrid = !state.showGrid
          })
        },

        toggleGuides: () => {
          set((state) => {
            state.showGuides = !state.showGuides
          })
        },

        toggleSnapToGrid: () => {
          set((state) => {
            state.snapToGrid = !state.snapToGrid
          })
        },

        setGridSize: (size) => {
          set((state) => {
            state.gridSize = size
          })
        },

        toggleLeftPanel: () => {
          set((state) => {
            state.leftPanelOpen = !state.leftPanelOpen
          })
        },

        toggleRightPanel: () => {
          set((state) => {
            state.rightPanelOpen = !state.rightPanelOpen
          })
        },

        toggleBottomPanel: () => {
          set((state) => {
            state.bottomPanelOpen = !state.bottomPanelOpen
          })
        },

        undo: () => {
          set((state) => {
            const { past, present, future } = state.history
            
            if (past.length === 0) return
            
            const previous = past[past.length - 1]
            const newPast = past.slice(0, past.length - 1)
            
            state.history = {
              past: newPast,
              present: previous,
              future: [present, ...future]
            }
            
            state.components = previous
          })
        },

        redo: () => {
          set((state) => {
            const { past, present, future } = state.history
            
            if (future.length === 0) return
            
            const next = future[0]
            const newFuture = future.slice(1)
            
            state.history = {
              past: [...past, present],
              present: next,
              future: newFuture
            }
            
            state.components = next
          })
        },

        pushToHistory: () => {
          set((state) => {
            const { past, present } = state.history
            const newPast = [...past, present]
            
            // Limit history size
            if (newPast.length > 50) {
              newPast.splice(0, newPast.length - 50)
            }
            
            state.history = {
              past: newPast,
              present: [...state.components],
              future: []
            }
          })
        },

        togglePreviewMode: () => {
          set((state) => {
            state.isPreviewMode = !state.isPreviewMode
          })
        },

        setAiGenerating: (generating) => {
          set((state) => {
            state.aiGenerating = generating
          })
        },

        setAiPrompt: (prompt) => {
          set((state) => {
            state.aiPrompt = prompt
          })
        },

        loadProject: (components, projectId, projectName) => {
          set((state) => {
            state.components = components
            state.projectId = projectId
            state.projectName = projectName || 'Untitled Project'
            state.selectedComponentId = null
            state.hoveredComponentId = null
            state.history = {
              past: [],
              present: [...components],
              future: []
            }
          })
        },

        clearProject: () => {
          set((state) => {
            state.components = []
            state.selectedComponentId = null
            state.hoveredComponentId = null
            state.projectId = undefined
            state.projectName = 'Untitled Project'
            state.history = {
              past: [],
              present: [],
              future: []
            }
          })
        },

        // Utility functions
        getComponent: (id) => {
          return findComponent(get().components, id)
        },

        getComponentTree: () => {
          return get().components
        },

        getSelectedComponent: () => {
          const { selectedComponentId } = get()
          if (!selectedComponentId) return null
          return get().getComponent(selectedComponentId) || null
        }
      })),
      {
        name: 'builder-store'
      }
    )
  )
)

// Selectors for commonly used derived state
export const useSelectedComponent = () => useBuilderStore(state => state.getSelectedComponent())
export const useCanUndo = () => useBuilderStore(state => state.history.past.length > 0)
export const useCanRedo = () => useBuilderStore(state => state.history.future.length > 0)