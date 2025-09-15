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
  RotateCcw,
  Sparkles,
  Cloud,
  GitBranch,
  Gauge,
  Download,
  Menu,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { useBuilderStore } from '../../../lib/store/builder'
import { useKeyboardShortcuts } from '../../../hooks/use-keyboard-shortcuts'
import { EnhancedDragDrop, ComponentPalette } from '../../../app/components/builder/EnhancedDragDrop'
import { ComponentTreePanel } from '../../../app/components/builder/ComponentTree'
import { AIChatAssistant } from '../../../app/components/builder/AIChatAssistant'
import { DeploymentPanel } from '../../../app/components/builder/DeploymentPanel'
import { VersionControlPanel } from '../../../app/components/builder/VersionControlPanel'
import { TemplatePanel } from '../../../components/templates/TemplatePanel'
import { TemplateMarketplace } from '../../../components/templates/TemplateMarketplace'
import { PerformanceDashboard } from '../../../components/performance/PerformanceDashboard'
import { PreviewFrame } from '../../../app/components/builder/PreviewFrame'
import { ResponsivePreviewControls } from '../../../app/components/builder/ResponsivePreviewControls'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export default function CompleteBuilderPage() {
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

  // Panel states
  const [leftPanelTab, setLeftPanelTab] = useState('components')
  const [rightPanelTab, setRightPanelTab] = useState('tree')
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false)
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)
  
  // Feature panels
  const [showAIChat, setShowAIChat] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showDeployment, setShowDeployment] = useState(false)
  const [showVersionControl, setShowVersionControl] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showTemplateMarketplace, setShowTemplateMarketplace] = useState(false)
  const [showPerformance, setShowPerformance] = useState(false)
  
  // UI states
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Enable keyboard shortcuts
  useKeyboardShortcuts()

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 3))
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.1))
  const handleResetZoom = () => setZoom(1)

  const handleSave = async () => {
    try {
      // TODO: Implement actual save functionality with backend
      console.log('Saving project...', { projectName, components })
      
      // Simulate save with delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Project saved successfully!')
    } catch (error) {
      toast.error('Failed to save project')
    }
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.success('Export functionality will be implemented!')
  }

  const handlePreview = () => {
    window.open('/preview', '_blank')
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  const closeAllPanels = () => {
    setShowAIChat(false)
    setShowDeployment(false)
    setShowVersionControl(false)
    setShowTemplates(false)
    setShowTemplateMarketplace(false)
    setShowPerformance(false)
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-screen'} flex flex-col bg-gray-50 dark:bg-gray-900`}>
      {/* Header */}
      <header className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-4 relative z-40">
        <div className="flex items-center space-x-4">
          {/* Project Info */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {projectName}
              </h1>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{components.length} components</span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Auto-saved</span>
                </span>
              </div>
            </div>
          </div>

          {/* Panel toggles */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
              title="Toggle Left Panel"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
              title="Toggle Right Panel"
            >
              <Layers className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Center Controls */}
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'editor' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('editor')}
              className="rounded-none border-0"
            >
              <Mouse className="h-4 w-4 mr-1" />
              Editor
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
              className="rounded-none border-0"
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
          </div>

          {/* History Controls */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={!canUndo()}
              title="Undo (Ctrl+Z)"
              className="h-8 w-8 p-0"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={!canRedo()}
              title="Redo (Ctrl+Y)"
              className="h-8 w-8 p-0"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              title="Zoom Out"
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-12 text-center px-2">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              title="Zoom In"
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetZoom}
              title="Reset Zoom"
              className="h-8 w-8 p-0"
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
            className={`h-8 w-8 p-0 ${showGrid ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : ''}`}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          {/* Feature Panels */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                closeAllPanels()
                setShowTemplates(!showTemplates)
              }}
              title="Templates"
              className={`h-8 w-8 p-0 ${showTemplates ? 'bg-purple-100 dark:bg-purple-900 text-purple-600' : ''}`}
            >
              <Sparkles className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                closeAllPanels()
                setShowVersionControl(!showVersionControl)
              }}
              title="Version Control"
              className={`h-8 w-8 p-0 ${showVersionControl ? 'bg-orange-100 dark:bg-orange-900 text-orange-600' : ''}`}
            >
              <GitBranch className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                closeAllPanels()
                setShowDeployment(!showDeployment)
              }}
              title="Deployment"
              className={`h-8 w-8 p-0 ${showDeployment ? 'bg-green-100 dark:bg-green-900 text-green-600' : ''}`}
            >
              <Cloud className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                closeAllPanels()
                setShowPerformance(!showPerformance)
              }}
              title="Performance"
              className={`h-8 w-8 p-0 ${showPerformance ? 'bg-red-100 dark:bg-red-900 text-red-600' : ''}`}
            >
              <Gauge className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                closeAllPanels()
                setShowAIChat(!showAIChat)
              }}
              title="AI Assistant"
              className={`h-8 w-8 p-0 ${showAIChat ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600' : ''}`}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>

          {/* Preview Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            title="Live Preview"
            className={`${showPreview ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : ''}`}
          >
            <Eye className="h-4 w-4 mr-1" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              title="Save Project (Ctrl+S)"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={handlePreview}
              title="Preview in New Tab"
            >
              <Play className="h-4 w-4 mr-1" />
              Preview
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Sidebar */}
          {!isLeftPanelCollapsed && (
            <>
              <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
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
                      <div className="space-y-6">
                        {/* Canvas Settings */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                            Canvas Settings
                          </h3>
                          <div className="space-y-3">
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
                            
                            <div className="space-y-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Zoom Level</span>
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline" onClick={handleZoomOut}>-</Button>
                                <span className="text-sm min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
                                <Button size="sm" variant="outline" onClick={handleZoomIn}>+</Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Project Settings */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                            Project Settings
                          </h3>
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Name: <span className="text-gray-900 dark:text-gray-100">{projectName}</span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Components: <span className="text-gray-900 dark:text-gray-100">{components.length}</span>
                            </div>
                          </div>
                        </div>

                        {/* Project Actions */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                            Actions
                          </h3>
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleExport}
                              className="w-full justify-start"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export Project
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearCanvas}
                              className="w-full justify-start text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4 mr-2" />
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
            </>
          )}

          {/* Main Canvas */}
          <ResizablePanel 
            defaultSize={showPreview ? (isLeftPanelCollapsed && isRightPanelCollapsed ? 70 : 50) : (isLeftPanelCollapsed && isRightPanelCollapsed ? 100 : 60)} 
            minSize={30}
          >
            <div className="h-full relative bg-gray-50 dark:bg-gray-900">
              {/* Grid overlay */}
              {showGrid && viewMode === 'editor' && (
                <div
                  className="absolute inset-0 opacity-5 pointer-events-none z-10"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, currentColor 1px, transparent 1px),
                      linear-gradient(to bottom, currentColor 1px, transparent 1px)
                    `,
                    backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                    color: '#6b7280'
                  }}
                />
              )}

              {/* Canvas content */}
              <div 
                className="h-full overflow-auto bg-white dark:bg-gray-800 m-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 relative"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                  width: `${(100 - 32) / zoom}%`,
                  height: `${(100 - 32) / zoom}%`
                }}
              >
                <EnhancedDragDrop />
              </div>

              {/* Zoom indicator */}
              {zoom !== 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-6 right-6 bg-black/80 text-white text-sm px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm z-20"
                >
                  <div className="flex items-center space-x-2">
                    <ZoomIn className="h-4 w-4" />
                    <span>{Math.round(zoom * 100)}%</span>
                  </div>
                </motion.div>
              )}

              {/* Component count indicator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-6 left-6 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 text-sm px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-2">
                  <Layers className="h-4 w-4" />
                  <span>{components.length} components</span>
                </div>
              </motion.div>
            </div>
          </ResizablePanel>

          {/* Live Preview Panel */}
          {showPreview && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                <div className="h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Live Preview</span>
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPreview(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <ResponsivePreviewControls />
                    <div className="p-2">
                      <PreviewFrame />
                    </div>
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}

          {/* Right Sidebar */}
          {!isRightPanelCollapsed && (
            <>
              {!showPreview && <ResizableHandle />}
              <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
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
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {/* Feature Panels */}
      <AnimatePresence>
        {/* AI Chat Assistant */}
        {showAIChat && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed right-4 top-16 bottom-4 w-96 z-50"
          >
            <AIChatAssistant onClose={() => setShowAIChat(false)} />
          </motion.div>
        )}

        {/* Templates Panel */}
        {showTemplates && (
          <TemplatePanel
            isOpen={showTemplates}
            onClose={() => setShowTemplates(false)}
          />
        )}

        {/* Template Marketplace */}
        {showTemplateMarketplace && (
          <TemplateMarketplace
            isOpen={showTemplateMarketplace}
            onClose={() => setShowTemplateMarketplace(false)}
          />
        )}

        {/* Deployment Panel */}
        {showDeployment && (
          <DeploymentPanel
            isOpen={showDeployment}
            onClose={() => setShowDeployment(false)}
          />
        )}

        {/* Version Control Panel */}
        {showVersionControl && (
          <VersionControlPanel
            isOpen={showVersionControl}
            onClose={() => setShowVersionControl(false)}
          />
        )}

        {/* Performance Dashboard */}
        {showPerformance && (
          <PerformanceDashboard
            isOpen={showPerformance}
            onClose={() => setShowPerformance(false)}
          />
        )}
      </AnimatePresence>

      {/* Bottom Status Bar */}
      <div className="h-8 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Ready</span>
          </span>
          <span>{components.length} components</span>
          <span>Zoom: {Math.round(zoom * 100)}%</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>Press <kbd className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">?</kbd> for shortcuts</span>
          <span className="text-gray-400">|</span>
          <span>AI Website Builder v1.0</span>
        </div>
      </div>
    </div>
  )
}