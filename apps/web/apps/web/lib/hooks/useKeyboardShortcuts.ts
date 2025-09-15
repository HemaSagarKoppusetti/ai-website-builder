import { useHotkeys } from 'react-hotkeys-hook'
import { useBuilderStore } from '../store/builder'
import { toast } from 'sonner'

export function useKeyboardShortcuts() {
  const {
    selectedComponentId,
    undo,
    redo,
    deleteComponent,
    duplicateComponent,
    copyComponent,
    pasteComponent,
    toggleGrid,
    togglePreviewMode,
    clearProject,
    getSelectedComponent
  } = useBuilderStore()

  // Undo/Redo
  useHotkeys('ctrl+z, cmd+z', (e) => {
    e.preventDefault()
    undo()
    toast.success('Undone')
  }, { enableOnFormTags: true })

  useHotkeys('ctrl+y, cmd+y, ctrl+shift+z, cmd+shift+z', (e) => {
    e.preventDefault()
    redo()
    toast.success('Redone')
  }, { enableOnFormTags: true })

  // Copy/Paste/Cut
  useHotkeys('ctrl+c, cmd+c', (e) => {
    if (selectedComponentId && !isFormElement(e.target as Element)) {
      e.preventDefault()
      copyComponent(selectedComponentId)
      const component = getSelectedComponent()
      toast.success(`Copied ${component?.name || 'component'}`)
    }
  })

  useHotkeys('ctrl+v, cmd+v', (e) => {
    if (!isFormElement(e.target as Element)) {
      e.preventDefault()
      pasteComponent()
      toast.success('Pasted component')
    }
  })

  useHotkeys('ctrl+d, cmd+d', (e) => {
    if (selectedComponentId && !isFormElement(e.target as Element)) {
      e.preventDefault()
      duplicateComponent(selectedComponentId)
      const component = getSelectedComponent()
      toast.success(`Duplicated ${component?.name || 'component'}`)
    }
  })

  // Delete
  useHotkeys('delete, backspace', (e) => {
    if (selectedComponentId && !isFormElement(e.target as Element)) {
      e.preventDefault()
      const component = getSelectedComponent()
      deleteComponent(selectedComponentId)
      toast.success(`Deleted ${component?.name || 'component'}`)
    }
  })

  // Select All (future implementation)
  useHotkeys('ctrl+a, cmd+a', (e) => {
    if (!isFormElement(e.target as Element)) {
      e.preventDefault()
      // TODO: Implement select all components
      toast.info('Select all (coming soon)')
    }
  })

  // Toggle Grid
  useHotkeys('ctrl+g, cmd+g', (e) => {
    e.preventDefault()
    toggleGrid()
    toast.info('Grid toggled')
  })

  // Toggle Preview Mode
  useHotkeys('ctrl+p, cmd+p', (e) => {
    e.preventDefault()
    togglePreviewMode()
    toast.info('Preview mode toggled')
  })

  // Save (future implementation)
  useHotkeys('ctrl+s, cmd+s', (e) => {
    e.preventDefault()
    // TODO: Implement auto-save
    toast.info('Auto-save (coming soon)')
  })

  // New Project
  useHotkeys('ctrl+n, cmd+n', (e) => {
    e.preventDefault()
    if (confirm('Create new project? This will clear the current canvas.')) {
      clearProject()
      toast.success('New project created')
    }
  })

  // Zoom shortcuts (future implementation)
  useHotkeys('ctrl+plus, cmd+plus', (e) => {
    e.preventDefault()
    toast.info('Zoom in (coming soon)')
  })

  useHotkeys('ctrl+minus, cmd+minus', (e) => {
    e.preventDefault()
    toast.info('Zoom out (coming soon)')
  })

  useHotkeys('ctrl+0, cmd+0', (e) => {
    e.preventDefault()
    toast.info('Reset zoom (coming soon)')
  })

  // Component navigation
  useHotkeys('tab', (e) => {
    if (!isFormElement(e.target as Element)) {
      e.preventDefault()
      // TODO: Navigate to next component
      toast.info('Navigate components (coming soon)')
    }
  })

  useHotkeys('shift+tab', (e) => {
    if (!isFormElement(e.target as Element)) {
      e.preventDefault()
      // TODO: Navigate to previous component
      toast.info('Navigate components (coming soon)')
    }
  })

  // Help
  useHotkeys('ctrl+/, cmd+/', (e) => {
    e.preventDefault()
    showKeyboardShortcuts()
  })

  // Escape key to deselect
  useHotkeys('escape', (e) => {
    e.preventDefault()
    useBuilderStore.getState().selectComponent(null)
    toast.info('Selection cleared')
  })
}

// Helper function to check if target is a form element
function isFormElement(element: Element): boolean {
  const formTags = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON']
  return formTags.includes(element.tagName) || 
         element.getAttribute('contenteditable') === 'true' ||
         element.classList.contains('ProseMirror') // For rich text editors
}

// Show keyboard shortcuts help
function showKeyboardShortcuts() {
  toast.info(
    <div className="space-y-2">
      <div className="font-semibold mb-2">Keyboard Shortcuts</div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>Ctrl+Z - Undo</div>
        <div>Ctrl+Y - Redo</div>
        <div>Ctrl+C - Copy</div>
        <div>Ctrl+V - Paste</div>
        <div>Ctrl+D - Duplicate</div>
        <div>Delete - Remove</div>
        <div>Ctrl+G - Toggle Grid</div>
        <div>Ctrl+P - Preview</div>
        <div>Ctrl+N - New Project</div>
        <div>Esc - Deselect</div>
      </div>
    </div>,
    { duration: 8000 }
  )
}