'use client'

import React, { useState } from 'react'
import { 
  Undo, 
  Redo, 
  Eye, 
  EyeOff, 
  Monitor, 
  Tablet, 
  Smartphone,
  Grid3x3,
  Save,
  Play,
  Settings,
  Zap,
  RotateCcw,
  Download,
  Share2,
  Layers
} from 'lucide-react'
import { useBuilderStore, useCanUndo, useCanRedo } from '../../../lib/store/builder'
import { demoTemplates } from '../../../lib/demo/templates'

export function BuilderToolbar() {
  const {
    projectName,
    viewport,
    showGrid,
    isPreviewMode,
    components,
    aiGenerating,
    undo,
    redo,
    setViewport,
    toggleGrid,
    togglePreviewMode,
    toggleLeftPanel,
    toggleRightPanel,
    loadProject,
    clearProject
  } = useBuilderStore()

  const canUndo = useCanUndo()
  const canRedo = useCanRedo()
  const [showTemplates, setShowTemplates] = useState(false)
  const [performanceScore, setPerformanceScore] = useState(98)

  // Calculate performance metrics
  const getPerformanceMetrics = () => {
    const componentCount = components.length
    const hasLargeImages = components.some(c => c.props.backgroundImage || c.props.src)
    let score = 100
    
    if (componentCount > 20) score -= 10
    if (hasLargeImages) score -= 5
    if (componentCount > 50) score -= 20
    
    return Math.max(score, 0)
  }

  const handleLoadTemplate = (templateId: string) => {
    const template = demoTemplates.find(t => t.id === templateId)
    if (template) {
      loadProject(template.components, templateId, template.name)
      setShowTemplates(false)
    }
  }

  return (
    <div className="builder-toolbar h-14 px-4 flex items-center justify-between">
      {/* Left Section - Project Info */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="font-semibold text-sm">{projectName}</div>
          <div className="text-xs text-muted-foreground">({components.length} components)</div>
        </div>
        
        {/* Performance Indicator */}
        <div className="flex items-center space-x-1 px-2 py-1 bg-muted rounded text-xs">
          <Zap className={`h-3 w-3 ${
            getPerformanceMetrics() >= 80 ? 'text-green-500' :
            getPerformanceMetrics() >= 60 ? 'text-yellow-500' : 'text-red-500'
          }`} />
          <span className="text-muted-foreground">{getPerformanceMetrics()}</span>
        </div>
        
        {/* AI Status */}
        {aiGenerating && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
            <div className="animate-spin h-3 w-3 border border-purple-600 border-t-transparent rounded-full" />
            <span>AI Generating...</span>
          </div>
        )}
        
        <div className="flex items-center space-x-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-2 rounded hover:bg-accent disabled:opacity-50"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-2 rounded hover:bg-accent disabled:opacity-50"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Center Section - Viewport Controls */}
      <div className="flex items-center space-x-2 bg-muted rounded-lg p-1">
        <button
          onClick={() => setViewport('desktop')}
          className={`p-2 rounded ${viewport === 'desktop' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
          title="Desktop View"
        >
          <Monitor className="h-4 w-4" />
        </button>
        <button
          onClick={() => setViewport('tablet')}
          className={`p-2 rounded ${viewport === 'tablet' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
          title="Tablet View"
        >
          <Tablet className="h-4 w-4" />
        </button>
        <button
          onClick={() => setViewport('mobile')}
          className={`p-2 rounded ${viewport === 'mobile' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
          title="Mobile View"
        >
          <Smartphone className="h-4 w-4" />
        </button>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center space-x-2">
        {/* Templates Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="p-2 rounded hover:bg-accent"
            title="Load Template"
          >
            <Layers className="h-4 w-4" />
          </button>
          
          {showTemplates && (
            <div className="absolute top-full right-0 mt-1 w-64 bg-background border rounded-lg shadow-lg z-50">
              <div className="p-2 border-b">
                <h3 className="text-sm font-semibold">Templates</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {demoTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleLoadTemplate(template.id)}
                    className="w-full text-left p-3 hover:bg-accent transition-colors"
                  >
                    <div className="text-sm font-medium">{template.name}</div>
                    <div className="text-xs text-muted-foreground">{template.description}</div>
                    <div className="flex space-x-1 mt-1">
                      {template.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-1 py-0.5 bg-muted rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-2 border-t">
                <button
                  onClick={clearProject}
                  className="w-full text-left p-2 hover:bg-accent transition-colors text-sm text-red-600"
                >
                  <RotateCcw className="h-3 w-3 inline mr-1" />
                  Clear Canvas
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={toggleGrid}
          className={`p-2 rounded hover:bg-accent ${showGrid ? 'bg-accent' : ''}`}
          title="Toggle Grid"
        >
          <Grid3x3 className="h-4 w-4" />
        </button>
        
        <button
          onClick={togglePreviewMode}
          className={`p-2 rounded hover:bg-accent ${isPreviewMode ? 'bg-accent' : ''}`}
          title="Preview Mode"
        >
          {isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>

        <div className="w-px h-6 bg-border" />

        <button
          onClick={() => {}}
          className="p-2 rounded hover:bg-accent"
          title="Download Project"
        >
          <Download className="h-4 w-4" />
        </button>

        <button
          onClick={() => {}}
          className="p-2 rounded hover:bg-accent"
          title="Share"
        >
          <Share2 className="h-4 w-4" />
        </button>

        <button
          onClick={() => {}}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center space-x-2"
          title="Publish"
        >
          <Play className="h-4 w-4" />
          <span>Publish</span>
        </button>

        <button
          onClick={() => {}}
          className="p-2 rounded hover:bg-accent"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
      
      {/* Click outside handler for templates */}
      {showTemplates && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowTemplates(false)}
        />
      )}
    </div>
  )
}