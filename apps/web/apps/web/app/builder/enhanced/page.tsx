'use client'

import React, { useState } from 'react'
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Eye, 
  EyeOff, 
  Grid, 
  Mouse,
  Undo,
  Redo,
  Save,
  Settings,
  Play,
  Layers,
  Palette,
  MessageCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react'
import { useBuilderStore } from '../../../lib/store/builder'
import { useKeyboardShortcuts } from '../../../hooks/use-keyboard-shortcuts'
import { EnhancedDragDrop, ComponentPalette } from '../../../app/components/builder/EnhancedDragDrop'
import { ComponentTreePanel } from '../../../app/components/builder/ComponentTree'
import { AIChatAssistant } from '../../../app/components/builder/AIChatAssistant'
import { motion, AnimatePresence } from 'framer-motion'
import { PreviewFrame } from '../../../app/components/builder/PreviewFrame'

export default function EnhancedBuilderPage() {
  const {
    viewMode,
    showGrid,
    zoom,
    canUndo,
    canRedo,
    projectName,
    components,
    setViewMode,
    toggleGrid,
    setZoom,
    undo,
    redo,
    clearCanvas
  } = useBuilderStore()

  const [leftPanelTab, setLeftPanelTab] = useState('components')
  const [rightPanelTab, setRightPanelTab] = useState('tree')
  const [showAIChat, setShowAIChat] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Enable keyboard shortcuts
  useKeyboardShortcuts()

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 3))
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.1))
  const handleResetZoom = () => setZoom(1)

  const handleSave = async () => {
    // TODO: Implement save functionality
    console.log('Saving project...', { projectName, components })
  }

  const handlePreview = () => {
    // TODO: Open preview in new tab
    window.open('/preview', '_blank')
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {projectName}
          </h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{components.length} components</span>
            <span>•</span>
            <span>Auto-saved</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-md">
            <Button
              variant={viewMode === 'editor' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('editor')}
              className="rounded-r-none"
            >
              <Mouse className="h-4 w-4 mr-1" />
              Editor
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
              className="rounded-l-none"
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
          </div>

          {/* History Controls */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={!canUndo()}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={!canRedo()}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetZoom}
              title="Reset Zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Grid Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleGrid}
            title={showGrid ? 'Hide Grid' : 'Show Grid'}
            className={showGrid ? 'bg-blue-100 dark:bg-blue-900' : ''}
          >
            <Grid className="h-4 w-4" />
          </Button>

          {/* AI Chat Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAIChat(!showAIChat)}
            title="AI Assistant"
            className={showAIChat ? 'bg-purple-100 dark:bg-purple-900' : ''}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>

          {/* Preview Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            title="Live Preview"
            className={showPreview ? 'bg-green-100 dark:bg-green-900' : ''}
          >
            <Eye className="h-4 w-4" />
          </Button>

          {/* Save & Preview */}
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              title="Save Project"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handlePreview}
              title="Preview"
            >
              <Play className="h-4 w-4 mr-1" />
              Preview
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Sidebar */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <Tabs value={leftPanelTab} onValueChange={setLeftPanelTab} className="h-full">
                <div className="border-b border-gray-200 dark:border-gray-700 px-3 py-2">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="components" className="text-xs">
                      <Palette className="h-4 w-4 mr-1" />
                      Components
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="text-xs">
                      <Settings className="h-4 w-4 mr-1" />
                      Settings
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="components" className="h-full mt-0">
                  <ComponentPalette />
                </TabsContent>

                <TabsContent value="settings" className="h-full mt-0 p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Canvas Settings
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Grid</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleGrid}
                          >
                            {showGrid ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Project Actions
                      </h3>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearCanvas}
                          className="w-full"
                        >
                          Clear Canvas
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Main Canvas */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="h-full relative">
              {/* Grid overlay */}
              {showGrid && viewMode === 'editor' && (
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #000 1px, transparent 1px),
                      linear-gradient(to bottom, #000 1px, transparent 1px)
                    `,
                    backgroundSize: `20px 20px`,
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left'
                  }}
                />
              )}

              {/* Canvas content */}
              <div 
                className="h-full overflow-auto"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                  width: `${100 / zoom}%`,
                  height: `${100 / zoom}%`
                }}
              >
                <EnhancedDragDrop />
              </div>

              {/* Zoom indicator */}
              {zoom !== 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full"
                >
                  {Math.round(zoom * 100)}%
                </motion.div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Live Preview Panel */}
          {showPreview && (
            <>
              <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                <div className="h-full bg-white dark:bg-gray-800">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Live Preview
                    </h3>
                  </div>
                  <PreviewFrame />
                </div>
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}

          {/* Right Sidebar */}
          <ResizablePanel defaultSize={showPreview ? 20 : 20} minSize={15} maxSize={30}>
            <div className="h-full border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="h-full">
                <div className="border-b border-gray-200 dark:border-gray-700 px-3 py-2">
                  <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="tree" className="text-xs">
                      <Layers className="h-4 w-4 mr-1" />
                      Component Tree
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="tree" className="h-full mt-0">
                  <ComponentTreePanel />
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* AI Chat Assistant */}
      <AnimatePresence>
        {showAIChat && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-4 bottom-4 top-20 w-80 z-50"
          >
            <AIChatAssistant onClose={() => setShowAIChat(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 left-4 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded border">
        Press <kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">?</kbd> for shortcuts
      </div>
    </div>
  )
}