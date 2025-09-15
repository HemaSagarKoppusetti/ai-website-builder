'use client'

import React, { useState } from 'react'
import { 
  ChevronRight, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  MoreHorizontal,
  Copy,
  Trash2,
  Edit,
  Move
} from 'lucide-react'
import { useBuilderStore, BuilderComponent } from '../../../lib/store/builder'
import { motion, AnimatePresence } from 'framer-motion'

interface ComponentTreeProps {
  components?: BuilderComponent[]
  level?: number
}

export function ComponentTree({ components, level = 0 }: ComponentTreeProps) {
  const {
    components: rootComponents,
    selectedComponentId,
    hoveredComponentId,
    selectComponent,
    setHoveredComponent,
    updateComponent,
    deleteComponent,
    duplicateComponent
  } = useBuilderStore()

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [contextMenu, setContextMenu] = useState<{ 
    componentId: string; 
    x: number; 
    y: number 
  } | null>(null)

  const componentsToRender = components || rootComponents

  const toggleExpanded = (componentId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (expandedNodes.has(componentId)) {
      newExpanded.delete(componentId)
    } else {
      newExpanded.add(componentId)
    }
    setExpandedNodes(newExpanded)
  }

  const handleContextMenu = (e: React.MouseEvent, componentId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      componentId,
      x: e.clientX,
      y: e.clientY
    })
  }

  const closeContextMenu = () => {
    setContextMenu(null)
  }

  const getComponentIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      HERO: '🏆',
      TEXT: '📝',
      BUTTON: '🔘',
      IMAGE: '🖼️',
      CARD: '📋',
      GRID: '⚏',
      NAVBAR: '📑',
      FOOTER: '⬇️',
      TESTIMONIAL: '💬',
      PRICING: '💰',
      CONTACT_FORM: '📨',
      FORM: '📋',
      TABLE: '📊',
      CHART: '📈'
    }
    return iconMap[category] || '📦'
  }

  const handleAction = (action: string, componentId: string) => {
    switch (action) {
      case 'duplicate':
        duplicateComponent(componentId)
        break
      case 'delete':
        if (confirm('Are you sure you want to delete this component?')) {
          deleteComponent(componentId)
        }
        break
      case 'toggleVisibility':
        const component = componentsToRender.find(c => c.id === componentId)
        if (component) {
          updateComponent(componentId, { isHidden: !component.isHidden })
        }
        break
      case 'toggleLock':
        const lockComponent = componentsToRender.find(c => c.id === componentId)
        if (lockComponent) {
          updateComponent(componentId, { isLocked: !lockComponent.isLocked })
        }
        break
    }
    closeContextMenu()
  }

  const renderComponent = (component: BuilderComponent, index: number) => {
    const hasChildren = component.children && component.children.length > 0
    const isExpanded = expandedNodes.has(component.id)
    const isSelected = selectedComponentId === component.id
    const isHovered = hoveredComponentId === component.id

    return (
      <div key={component.id} className="select-none">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.02 }}
          className={`
            flex items-center py-1 px-2 rounded-md cursor-pointer group transition-all
            ${isSelected ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700' : ''}
            ${isHovered ? 'bg-gray-100 dark:bg-gray-700/50' : ''}
            ${component.isHidden ? 'opacity-50' : ''}
            ${component.isLocked ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}
          `}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => selectComponent(component.id)}
          onMouseEnter={() => setHoveredComponent(component.id)}
          onMouseLeave={() => setHoveredComponent(null)}
          onContextMenu={(e) => handleContextMenu(e, component.id)}
        >
          {/* Expand/Collapse button */}
          <div className="w-4 h-4 flex items-center justify-center mr-1">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpanded(component.id)
                }}
                className="hover:bg-gray-200 dark:hover:bg-gray-600 rounded p-0.5 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            )}
          </div>

          {/* Component icon */}
          <span className="mr-2 text-sm">
            {getComponentIcon(component.category)}
          </span>

          {/* Component name */}
          <span className="flex-1 text-sm font-medium truncate">
            {component.name}
          </span>

          {/* Status indicators */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {component.isHidden && (
              <EyeOff className="h-3 w-3 text-gray-400" />
            )}
            {component.isLocked && (
              <Lock className="h-3 w-3 text-yellow-500" />
            )}
          </div>

          {/* Quick actions */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleAction('toggleVisibility', component.id)
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title={component.isHidden ? 'Show' : 'Hide'}
            >
              {component.isHidden ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                handleAction('toggleLock', component.id)
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title={component.isLocked ? 'Unlock' : 'Lock'}
            >
              {component.isLocked ? (
                <Lock className="h-3 w-3" />
              ) : (
                <Unlock className="h-3 w-3" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Children */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ComponentTree 
                components={component.children} 
                level={level + 1} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-0.5">
        {componentsToRender.map((component, index) => 
          renderComponent(component, index)
        )}
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div 
              className="fixed inset-0 z-50" 
              onClick={closeContextMenu}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 min-w-48"
              style={{
                left: contextMenu.x,
                top: contextMenu.y
              }}
            >
              <button
                onClick={() => {
                  selectComponent(contextMenu.componentId)
                  closeContextMenu()
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => handleAction('duplicate', contextMenu.componentId)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span>Duplicate</span>
              </button>

              <button
                onClick={() => handleAction('toggleVisibility', contextMenu.componentId)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Toggle Visibility</span>
              </button>

              <button
                onClick={() => handleAction('toggleLock', contextMenu.componentId)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Lock className="h-4 w-4" />
                <span>Toggle Lock</span>
              </button>

              <hr className="my-2 border-gray-200 dark:border-gray-600" />

              <button
                onClick={() => handleAction('delete', contextMenu.componentId)}
                className="w-full text-left px-3 py-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center space-x-2 text-red-600 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export function ComponentTreePanel() {
  const { components } = useBuilderStore()

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Component Tree
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {components.length} component{components.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {components.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-600 text-4xl mb-4">📦</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No components yet
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Drag components from the palette to get started
            </p>
          </div>
        ) : (
          <ComponentTree />
        )}
      </div>
    </div>
  )
}