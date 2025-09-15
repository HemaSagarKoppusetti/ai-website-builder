'use client'

import { useEffect, useCallback } from 'react'
import { useBuilderStore } from '../lib/store/builder'
import { toast } from 'sonner'

export function useKeyboardShortcuts() {
  const {
    selectedComponentId,
    undo,
    redo,
    canUndo,
    canRedo,
    deleteComponent,
    duplicateComponent,
    toggleGrid,
    setViewMode,
    viewMode,
    clearCanvas,
    addComponent,
    setZoom,
    zoom
  } = useBuilderStore()

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, ctrlKey, metaKey, shiftKey, altKey } = event
    const modifier = ctrlKey || metaKey
    
    // Prevent default behavior for our shortcuts
    const shouldPreventDefault = () => {
      if (modifier) {
        switch (key.toLowerCase()) {
          case 'z':
          case 'y':
          case 'c':
          case 'v':
          case 'd':
          case 'n':
          case 'g':
          case 'p':
          case '=':
          case '+':
          case '-':
          case '0':
            return true
        }
      }
      
      if (key === 'Delete' || key === 'Backspace') {
        return selectedComponentId !== null
      }
      
      return false
    }

    if (shouldPreventDefault()) {
      event.preventDefault()
    }

    // Don't trigger shortcuts when typing in inputs
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target as HTMLElement)?.contentEditable === 'true'
    ) {
      return
    }

    try {
      // Undo/Redo
      if (modifier && key.toLowerCase() === 'z' && !shiftKey) {
        if (canUndo()) {
          undo()
          toast.success('Undid last action')
        } else {
          toast.info('Nothing to undo')
        }
        return
      }

      if (modifier && (key.toLowerCase() === 'y' || (key.toLowerCase() === 'z' && shiftKey))) {
        if (canRedo()) {
          redo()
          toast.success('Redid last action')
        } else {
          toast.info('Nothing to redo')
        }
        return
      }

      // Copy/Duplicate
      if (modifier && key.toLowerCase() === 'd' && selectedComponentId) {
        duplicateComponent(selectedComponentId)
        toast.success('Component duplicated')
        return
      }

      // Delete
      if ((key === 'Delete' || key === 'Backspace') && selectedComponentId) {
        deleteComponent(selectedComponentId)
        toast.success('Component deleted')
        return
      }

      // Toggle Grid
      if (modifier && key.toLowerCase() === 'g') {
        toggleGrid()
        toast.success('Grid toggled')
        return
      }

      // Toggle Preview
      if (modifier && key.toLowerCase() === 'p') {
        const newMode = viewMode === 'editor' ? 'preview' : 'editor'
        setViewMode(newMode)
        toast.success(`Switched to ${newMode} mode`)
        return
      }

      // New Project (Clear Canvas)
      if (modifier && key.toLowerCase() === 'n') {
        if (confirm('Are you sure you want to clear the canvas? This will delete all components.')) {
          clearCanvas()
          toast.success('Canvas cleared')
        }
        return
      }

      // Zoom controls
      if (modifier && (key === '=' || key === '+')) {
        const newZoom = Math.min(zoom + 0.1, 3)
        setZoom(newZoom)
        toast.success(`Zoom: ${Math.round(newZoom * 100)}%`)
        return
      }

      if (modifier && key === '-') {
        const newZoom = Math.max(zoom - 0.1, 0.1)
        setZoom(newZoom)
        toast.success(`Zoom: ${Math.round(newZoom * 100)}%`)
        return
      }

      if (modifier && key === '0') {
        setZoom(1)
        toast.success('Zoom reset to 100%')
        return
      }

      // Quick component addition with Alt key
      if (altKey) {
        switch (key.toLowerCase()) {
          case 'h':
            addComponent({
              id: `hero-${Date.now()}`,
              category: 'HERO',
              name: 'Hero Section',
              position: { x: 0, y: 0 },
              size: { width: '100%', height: 'auto' },
              content: {
                title: 'Welcome to Your Website',
                subtitle: 'Build amazing experiences with our drag-and-drop builder',
                ctaText: 'Get Started'
              },
              styles: {
                backgroundColor: '#1f2937',
                color: '#ffffff',
                padding: '4rem 2rem',
                textAlign: 'center'
              },
              children: [],
              isHidden: false,
              isLocked: false
            })
            toast.success('Hero section added')
            return

          case 't':
            addComponent({
              id: `text-${Date.now()}`,
              category: 'TEXT',
              name: 'Text Block',
              position: { x: 0, y: 0 },
              size: { width: '100%', height: 'auto' },
              content: {
                text: 'Your text content goes here. Click to edit.',
                type: 'paragraph'
              },
              styles: {
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#374151'
              },
              children: [],
              isHidden: false,
              isLocked: false
            })
            toast.success('Text block added')
            return

          case 'b':
            addComponent({
              id: `button-${Date.now()}`,
              category: 'BUTTON',
              name: 'Button',
              position: { x: 0, y: 0 },
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
              },
              children: [],
              isHidden: false,
              isLocked: false
            })
            toast.success('Button added')
            return

          case 'i':
            addComponent({
              id: `image-${Date.now()}`,
              category: 'IMAGE',
              name: 'Image',
              position: { x: 0, y: 0 },
              size: { width: '100%', height: 'auto' },
              content: {
                src: '/placeholder-image.jpg',
                alt: 'Placeholder image',
                width: 400,
                height: 300
              },
              styles: {
                borderRadius: '8px',
                objectFit: 'cover'
              },
              children: [],
              isHidden: false,
              isLocked: false
            })
            toast.success('Image added')
            return

          case 'c':
            addComponent({
              id: `card-${Date.now()}`,
              category: 'CARD',
              name: 'Card',
              position: { x: 0, y: 0 },
              size: { width: '100%', height: 'auto' },
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
              },
              children: [],
              isHidden: false,
              isLocked: false
            })
            toast.success('Card added')
            return
        }
      }

      // Show shortcuts help
      if (key === '?' || (shiftKey && key === '/')) {
        showShortcutsHelp()
        return
      }

    } catch (error) {
      console.error('Error handling keyboard shortcut:', error)
      toast.error('Error executing shortcut')
    }
  }, [
    selectedComponentId,
    undo,
    redo,
    canUndo,
    canRedo,
    deleteComponent,
    duplicateComponent,
    toggleGrid,
    setViewMode,
    viewMode,
    clearCanvas,
    addComponent,
    setZoom,
    zoom
  ])

  const showShortcutsHelp = () => {
    const shortcuts = [
      { key: 'Ctrl+Z', action: 'Undo' },
      { key: 'Ctrl+Y', action: 'Redo' },
      { key: 'Ctrl+D', action: 'Duplicate selected component' },
      { key: 'Delete', action: 'Delete selected component' },
      { key: 'Ctrl+G', action: 'Toggle grid' },
      { key: 'Ctrl+P', action: 'Toggle preview mode' },
      { key: 'Ctrl+N', action: 'New project (clear canvas)' },
      { key: 'Ctrl++', action: 'Zoom in' },
      { key: 'Ctrl+-', action: 'Zoom out' },
      { key: 'Ctrl+0', action: 'Reset zoom' },
      { key: 'Alt+H', action: 'Add hero section' },
      { key: 'Alt+T', action: 'Add text block' },
      { key: 'Alt+B', action: 'Add button' },
      { key: 'Alt+I', action: 'Add image' },
      { key: 'Alt+C', action: 'Add card' },
      { key: '?', action: 'Show this help' }
    ]

    const helpText = shortcuts
      .map(s => `${s.key}: ${s.action}`)
      .join('\n')

    toast.info('Keyboard Shortcuts', {
      description: helpText,
      duration: 10000
    })
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Return shortcuts info for external use
  return {
    shortcuts: [
      { key: 'Ctrl+Z', action: 'Undo', enabled: canUndo() },
      { key: 'Ctrl+Y', action: 'Redo', enabled: canRedo() },
      { key: 'Ctrl+D', action: 'Duplicate', enabled: !!selectedComponentId },
      { key: 'Delete', action: 'Delete', enabled: !!selectedComponentId },
      { key: 'Ctrl+G', action: 'Toggle Grid', enabled: true },
      { key: 'Ctrl+P', action: 'Toggle Preview', enabled: true },
      { key: 'Ctrl++/-', action: 'Zoom', enabled: true },
      { key: 'Alt+H/T/B/I/C', action: 'Quick Add', enabled: true }
    ],
    showHelp: showShortcutsHelp
  }
}