'use client'

import React, { useState } from 'react'
import { useSelectedComponent, useBuilderStore } from '../../../lib/store/builder'
import { generateReactComponent, generateProjectFiles, ExportOptions, deployToVercel, deployToNetlify, DeploymentConfig } from '../../../lib/export'
import { Settings, Palette, Code, Eye, EyeOff, Sparkles, Loader2, Download, Upload, ExternalLink } from 'lucide-react'

export function PropertiesPanel() {
  const selectedComponent = useSelectedComponent()
  const { updateComponent, aiGenerating, setAiGenerating, components } = useBuilderStore()
  const [activeTab, setActiveTab] = useState<'properties' | 'styles' | 'code'>('properties')
  const [aiPrompt, setAiPrompt] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentUrl, setDeploymentUrl] = useState('')
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'react',
    includeStyles: true,
    includeTailwind: true,
    typescript: true
  })

  if (!selectedComponent) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No component selected</p>
          <p className="text-sm">Select a component to edit its properties</p>
        </div>
      </div>
    )
  }

  const handlePropChange = (key: string, value: any) => {
    updateComponent(selectedComponent.id, {
      props: {
        ...selectedComponent.props,
        [key]: value
      }
    })
  }

  const handleStyleChange = (key: string, value: any) => {
    updateComponent(selectedComponent.id, {
      styles: {
        ...selectedComponent.styles,
        [key]: value
      }
    })
  }

  const handleNameChange = (name: string) => {
    updateComponent(selectedComponent.id, { name })
  }

  const handleVisibilityToggle = () => {
    updateComponent(selectedComponent.id, {
      isHidden: !selectedComponent.isHidden
    })
  }

  const handleLockToggle = () => {
    updateComponent(selectedComponent.id, {
      isLocked: !selectedComponent.isLocked
    })
  }

  const generateAIContent = async (field: string, prompt: string) => {
    if (!selectedComponent) return
    
    setAiGenerating(true)
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'content',
          componentType: selectedComponent.category,
          fieldType: field,
          context: {
            projectName: 'My Website',
            existing: selectedComponent.props[field] || ''
          }
        })
      })
      
      if (!response.ok) {
        throw new Error('AI generation failed')
      }
      
      const data = await response.json()
      if (data.success && data.content) {
        handlePropChange(field, data.content)
      } else {
        throw new Error(data.error || 'Failed to generate content')
      }
      
    } catch (error) {
      console.error('AI generation error:', error)
      // Fallback to simulated content on error
      let fallbackContent = ''
      switch (selectedComponent.category) {
        case 'HERO':
          if (field === 'title') fallbackContent = 'Transform Your Business with AI'
          else if (field === 'subtitle') fallbackContent = 'Create amazing websites with our powerful AI-driven platform'
          else if (field === 'buttonText') fallbackContent = 'Get Started'
          break
        case 'TESTIMONIAL':
          if (field === 'quote') fallbackContent = 'This platform has transformed our workflow completely!'
          else if (field === 'authorName') fallbackContent = 'Sarah Johnson'
          else if (field === 'authorTitle') fallbackContent = 'CEO, TechCorp'
          break
        default:
          fallbackContent = `Generated ${field} content`
      }
      if (fallbackContent) {
        handlePropChange(field, fallbackContent)
      }
    } finally {
      setAiGenerating(false)
    }
  }

  const generateAIStyles = async () => {
    if (!selectedComponent) return
    
    setAiGenerating(true)
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'styles',
          componentType: selectedComponent.category,
          currentStyles: selectedComponent.styles,
          context: {
            style: 'modern'
          }
        })
      })
      
      if (!response.ok) {
        throw new Error('AI style generation failed')
      }
      
      const data = await response.json()
      if (data.success && data.styles) {
        updateComponent(selectedComponent.id, {
          styles: {
            ...selectedComponent.styles,
            ...data.styles
          }
        })
      } else {
        throw new Error(data.error || 'Failed to generate styles')
      }
      
    } catch (error) {
      console.error('AI style generation error:', error)
      // Fallback to preset styles on error
      let fallbackStyles: any = {}
      
      switch (selectedComponent.category) {
        case 'HERO':
          fallbackStyles = {
            backgroundColor: '#1e40af',
            color: '#ffffff',
            padding: '4rem 2rem',
            borderRadius: '0.75rem'
          }
          break
        case 'BUTTON':
          fallbackStyles = {
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem'
          }
          break
        case 'CARD':
          fallbackStyles = {
            backgroundColor: '#f9fafb',
            padding: '2rem',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb'
          }
          break
        default:
          fallbackStyles = {
            padding: '1rem',
            borderRadius: '0.375rem'
          }
      }
      
      updateComponent(selectedComponent.id, {
        styles: {
          ...selectedComponent.styles,
          ...fallbackStyles
        }
      })
    } finally {
      setAiGenerating(false)
    }
  }

  const handleExportCode = async () => {
    if (!selectedComponent) return
    
    setIsExporting(true)
    try {
      const code = generateReactComponent(selectedComponent, exportOptions)
      
      // Create and download the file
      const blob = new Blob([code], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedComponent.name.replace(/\s+/g, '')}.${exportOptions.typescript ? 'tsx' : 'jsx'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportProject = async () => {
    setIsExporting(true)
    try {
      const files = generateProjectFiles(components, exportOptions, 'my-website')
      
      // Create a simple representation for download
      const content = Object.entries(files)
        .map(([path, fileContent]) => `=== ${path} ===\n${fileContent}\n\n`)
        .join('')
      
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'my-website-project.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Project export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeploy = async (platform: 'vercel' | 'netlify') => {
    setIsDeploying(true)
    try {
      const files = generateProjectFiles(components, exportOptions, 'my-website')
      const config: DeploymentConfig = {
        platform,
        projectName: 'my-website-' + Date.now()
      }
      
      const result = platform === 'vercel' 
        ? await deployToVercel(files, config)
        : await deployToNetlify(files, config)
      
      if (result.success) {
        setDeploymentUrl(result.url)
      } else {
        console.error('Deployment error:', result.error)
      }
    } catch (error) {
      console.error('Deployment error:', error)
    } finally {
      setIsDeploying(false)
    }
  }

  const AIButton = ({ field, label }: { field: string; label: string }) => (
    <button
      onClick={() => generateAIContent(field, `Generate ${label.toLowerCase()} for ${selectedComponent?.category}`)}
      disabled={aiGenerating}
      className="ml-2 p-1 rounded bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 transition-all"
      title={`Generate ${label} with AI`}
    >
      {aiGenerating ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Sparkles className="h-3 w-3" />
      )}
    </button>
  )

  const renderPropertiesTab = () => {
    const props = selectedComponent.props
    
    return (
      <div className="space-y-6">
        {/* Component Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Component Name</label>
          <input
            type="text"
            value={selectedComponent.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md text-sm"
          />
        </div>

        {/* Component-specific properties */}
        {selectedComponent.category === 'HERO' && (
          <>
            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium">Title</label>
                <AIButton field="title" label="Title" />
              </div>
              <input
                type="text"
                value={props.title || ''}
                onChange={(e) => handlePropChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>
            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium">Subtitle</label>
                <AIButton field="subtitle" label="Subtitle" />
              </div>
              <textarea
                value={props.subtitle || ''}
                onChange={(e) => handlePropChange('subtitle', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>
            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium">Button Text</label>
                <AIButton field="buttonText" label="Button Text" />
              </div>
              <input
                type="text"
                value={props.buttonText || ''}
                onChange={(e) => handlePropChange('buttonText', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Background Image URL</label>
              <input
                type="url"
                value={props.backgroundImage || ''}
                onChange={(e) => handlePropChange('backgroundImage', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </>
        )}

        {selectedComponent.category === 'BUTTON' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Button Text</label>
              <input
                type="text"
                value={props.text || ''}
                onChange={(e) => handlePropChange('text', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Variant</label>
              <select
                value={props.variant || 'primary'}
                onChange={(e) => handlePropChange('variant', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Size</label>
              <select
                value={props.size || 'medium'}
                onChange={(e) => handlePropChange('size', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </>
        )}

        {selectedComponent.category === 'TEXT' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <textarea
                value={props.content || ''}
                onChange={(e) => handlePropChange('content', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Heading Level</label>
              <select
                value={props.heading || 'p'}
                onChange={(e) => handlePropChange('heading', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="h1">H1</option>
                <option value="h2">H2</option>
                <option value="h3">H3</option>
                <option value="h4">H4</option>
                <option value="h5">H5</option>
                <option value="h6">H6</option>
                <option value="p">Paragraph</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Alignment</label>
              <select
                value={props.alignment || 'left'}
                onChange={(e) => handlePropChange('alignment', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </select>
            </div>
          </>
        )}

        {selectedComponent.category === 'IMAGE' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Image URL</label>
              <input
                type="url"
                value={props.src || ''}
                onChange={(e) => handlePropChange('src', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Alt Text</label>
              <input
                type="text"
                value={props.alt || ''}
                onChange={(e) => handlePropChange('alt', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>
          </>
        )}

        {selectedComponent.category === 'CARD' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={props.title || ''}
                onChange={(e) => handlePropChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <textarea
                value={props.content || ''}
                onChange={(e) => handlePropChange('content', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showImage"
                checked={props.showImage || false}
                onChange={(e) => handlePropChange('showImage', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showImage" className="text-sm">Show Image</label>
            </div>
          </>
        )}

        {selectedComponent.category === 'GRID' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Columns</label>
              <input
                type="number"
                min="1"
                max="12"
                value={props.columns || 3}
                onChange={(e) => handlePropChange('columns', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Gap</label>
              <input
                type="text"
                value={props.gap || '1rem'}
                onChange={(e) => handlePropChange('gap', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
                placeholder="1rem, 20px, etc."
              />
            </div>
          </>
        )}

        {selectedComponent.category === 'NAVBAR' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Brand Text</label>
              <input
                type="text"
                value={props.brandText || ''}
                onChange={(e) => handlePropChange('brandText', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Brand Logo URL</label>
              <input
                type="url"
                value={props.brandLogo || ''}
                onChange={(e) => handlePropChange('brandLogo', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showSearch"
                checked={props.showSearch || false}
                onChange={(e) => handlePropChange('showSearch', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showSearch" className="text-sm">Show Search</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sticky"
                checked={props.sticky || false}
                onChange={(e) => handlePropChange('sticky', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="sticky" className="text-sm">Sticky Navigation</label>
            </div>
          </>
        )}

        {selectedComponent.category === 'TESTIMONIAL' && (
          <>
            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium">Quote</label>
                <AIButton field="quote" label="Quote" />
              </div>
              <textarea
                value={props.quote || ''}
                onChange={(e) => handlePropChange('quote', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
                placeholder="Customer testimonial quote..."
              />
            </div>
            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium">Author Name</label>
                <AIButton field="authorName" label="Author Name" />
              </div>
              <input
                type="text"
                value={props.authorName || ''}
                onChange={(e) => handlePropChange('authorName', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>
            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium">Author Title</label>
                <AIButton field="authorTitle" label="Author Title" />
              </div>
              <input
                type="text"
                value={props.authorTitle || ''}
                onChange={(e) => handlePropChange('authorTitle', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
                placeholder="CEO, Company Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Author Avatar URL</label>
              <input
                type="url"
                value={props.authorAvatar || ''}
                onChange={(e) => handlePropChange('authorAvatar', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={props.rating || 5}
                onChange={(e) => handlePropChange('rating', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>
          </>
        )}

        {selectedComponent.category === 'PRICING' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Plan Name</label>
              <input
                type="text"
                value={props.planName || ''}
                onChange={(e) => handlePropChange('planName', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
                placeholder="Basic, Pro, Enterprise..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price</label>
              <input
                type="text"
                value={props.price || ''}
                onChange={(e) => handlePropChange('price', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
                placeholder="$29/month"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={props.description || ''}
                onChange={(e) => handlePropChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
                placeholder="Plan description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Features (one per line)</label>
              <textarea
                value={props.features || ''}
                onChange={(e) => handlePropChange('features', e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
                placeholder="Feature 1\nFeature 2\nFeature 3"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="popular"
                checked={props.popular || false}
                onChange={(e) => handlePropChange('popular', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="popular" className="text-sm">Popular Plan</label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Button Text</label>
              <input
                type="text"
                value={props.buttonText || 'Get Started'}
                onChange={(e) => handlePropChange('buttonText', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>
          </>
        )}

        {selectedComponent.category === 'CONTACT_FORM' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Form Title</label>
              <input
                type="text"
                value={props.title || 'Contact Us'}
                onChange={(e) => handlePropChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Form Fields</label>
              <textarea
                value={props.fields || 'name\nemail\nsubject\nmessage'}
                onChange={(e) => handlePropChange('fields', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
                placeholder="name\nemail\nphone\nsubject\nmessage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Submit Button Text</label>
              <input
                type="text"
                value={props.submitText || 'Send Message'}
                onChange={(e) => handlePropChange('submitText', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>
          </>
        )}

        {selectedComponent.category === 'FOOTER' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Copyright Text</label>
              <input
                type="text"
                value={props.copyrightText || ''}
                onChange={(e) => handlePropChange('copyrightText', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
                placeholder="© 2024 Your Company. All rights reserved."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Links (JSON format)</label>
              <textarea
                value={props.links || ''}
                onChange={(e) => handlePropChange('links', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
                placeholder='{"About": "/about", "Contact": "/contact"}'
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showSocial"
                checked={props.showSocial || false}
                onChange={(e) => handlePropChange('showSocial', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showSocial" className="text-sm">Show Social Links</label>
            </div>
          </>
        )}
      </div>
    )
  }

  const renderStylesTab = () => {
    const styles = selectedComponent.styles
    
    return (
      <div className="space-y-6">
        {/* AI Style Generator */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">AI Style Generator</h3>
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Generate optimized styles based on your component type and modern design principles.
          </p>
          <button
            onClick={generateAIStyles}
            disabled={aiGenerating}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
          >
            {aiGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating Styles...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate AI Styles</span>
              </>
            )}
          </button>
        </div>
        {/* Layout */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Layout</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Width</label>
                <input
                  type="text"
                  value={styles.width || ''}
                  onChange={(e) => handleStyleChange('width', e.target.value)}
                  className="w-full px-2 py-1 border border-input rounded text-sm"
                  placeholder="auto"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Height</label>
                <input
                  type="text"
                  value={styles.height || ''}
                  onChange={(e) => handleStyleChange('height', e.target.value)}
                  className="w-full px-2 py-1 border border-input rounded text-sm"
                  placeholder="auto"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Spacing */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Spacing</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Padding</label>
              <input
                type="text"
                value={styles.padding || ''}
                onChange={(e) => handleStyleChange('padding', e.target.value)}
                className="w-full px-2 py-1 border border-input rounded text-sm"
                placeholder="1rem"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Margin</label>
              <input
                type="text"
                value={styles.margin || ''}
                onChange={(e) => handleStyleChange('margin', e.target.value)}
                className="w-full px-2 py-1 border border-input rounded text-sm"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Appearance</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Background Color</label>
              <input
                type="color"
                value={styles.backgroundColor || '#ffffff'}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="w-full h-10 border border-input rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Text Color</label>
              <input
                type="color"
                value={styles.color || '#000000'}
                onChange={(e) => handleStyleChange('color', e.target.value)}
                className="w-full h-10 border border-input rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Border Radius</label>
              <input
                type="text"
                value={styles.borderRadius || ''}
                onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                className="w-full px-2 py-1 border border-input rounded text-sm"
                placeholder="0.375rem"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderCodeTab = () => {
    const componentCode = selectedComponent ? generateReactComponent(selectedComponent, exportOptions) : ''
    
    return (
      <div className="space-y-6">
        {/* Export Options */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="text-sm font-semibold mb-3 flex items-center">
            <Code className="h-4 w-4 mr-2" />
            Export Options
          </h3>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Format</label>
                <select
                  value={exportOptions.format}
                  onChange={(e) => setExportOptions({...exportOptions, format: e.target.value as any})}
                  className="w-full px-2 py-1 border border-input rounded text-sm"
                >
                  <option value="react">React</option>
                  <option value="next">Next.js</option>
                  <option value="html">HTML</option>
                  <option value="vue">Vue.js</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="typescript"
                    checked={exportOptions.typescript}
                    onChange={(e) => setExportOptions({...exportOptions, typescript: e.target.checked})}
                    className="rounded"
                  />
                  <label htmlFor="typescript" className="text-xs">TypeScript</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="tailwind"
                    checked={exportOptions.includeTailwind}
                    onChange={(e) => setExportOptions({...exportOptions, includeTailwind: e.target.checked})}
                    className="rounded"
                  />
                  <label htmlFor="tailwind" className="text-xs">Tailwind CSS</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Component Code Preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Generated Code</h3>
            <button
              onClick={handleExportCode}
              disabled={isExporting || !selectedComponent}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Download className="h-3 w-3" />
              )}
              <span>Export Component</span>
            </button>
          </div>
          <pre className="bg-gray-900 text-green-400 p-3 rounded-md text-xs overflow-auto max-h-64 font-mono">
            {componentCode || 'Select a component to view generated code'}
          </pre>
        </div>

        {/* Full Project Export */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
          <h3 className="text-sm font-semibold mb-3 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Full Project
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            Export all components as a complete {exportOptions.format} project with package.json and configuration files.
          </p>
          <button
            onClick={handleExportProject}
            disabled={isExporting}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Export Project</span>
              </>
            )}
          </button>
        </div>

        {/* Deployment */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border">
          <h3 className="text-sm font-semibold mb-3 flex items-center">
            <Upload className="h-4 w-4 mr-2" />
            One-Click Deployment
          </h3>
          <p className="text-xs text-gray-600 mb-4">
            Deploy your website instantly to popular hosting platforms.
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDeploy('vercel')}
              disabled={isDeploying}
              className="flex items-center justify-center space-x-2 bg-black text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-all"
            >
              {isDeploying ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ExternalLink className="h-3 w-3" />
              )}
              <span>Deploy to Vercel</span>
            </button>
            
            <button
              onClick={() => handleDeploy('netlify')}
              disabled={isDeploying}
              className="flex items-center justify-center space-x-2 bg-teal-500 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-teal-600 disabled:opacity-50 transition-all"
            >
              {isDeploying ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ExternalLink className="h-3 w-3" />
              )}
              <span>Deploy to Netlify</span>
            </button>
          </div>
          
          {deploymentUrl && (
            <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-md">
              <p className="text-sm text-green-800 mb-2">🎉 Deployment successful!</p>
              <a 
                href={deploymentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:text-green-800 underline break-all"
              >
                {deploymentUrl}
              </a>
            </div>
          )}
        </div>

        {/* Component Data (Debug) */}
        <details className="bg-gray-50 p-4 rounded-lg border">
          <summary className="text-sm font-semibold cursor-pointer mb-2">Component Data (Debug)</summary>
          <pre className="bg-white p-3 rounded-md text-xs overflow-auto max-h-48 border">
            {selectedComponent ? JSON.stringify({
              id: selectedComponent.id,
              name: selectedComponent.name,
              type: selectedComponent.type,
              category: selectedComponent.category,
              props: selectedComponent.props,
              styles: selectedComponent.styles
            }, null, 2) : 'No component selected'}
          </pre>
        </details>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Properties</h2>
          <div className="flex space-x-1">
            <button
              onClick={handleVisibilityToggle}
              className={`p-1 rounded ${selectedComponent.isHidden ? 'bg-muted' : 'hover:bg-muted'}`}
              title={selectedComponent.isHidden ? 'Show' : 'Hide'}
            >
              {selectedComponent.isHidden ? 
                <EyeOff className="h-4 w-4" /> : 
                <Eye className="h-4 w-4" />
              }
            </button>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground mb-3">
          {selectedComponent.name} • {selectedComponent.category}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted rounded-md p-1">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
              activeTab === 'properties' 
                ? 'bg-background shadow-sm' 
                : 'hover:bg-background/50'
            }`}
          >
            <Settings className="h-3 w-3 inline mr-1" />
            Properties
          </button>
          <button
            onClick={() => setActiveTab('styles')}
            className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
              activeTab === 'styles' 
                ? 'bg-background shadow-sm' 
                : 'hover:bg-background/50'
            }`}
          >
            <Palette className="h-3 w-3 inline mr-1" />
            Styles
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
              activeTab === 'code' 
                ? 'bg-background shadow-sm' 
                : 'hover:bg-background/50'
            }`}
          >
            <Code className="h-3 w-3 inline mr-1" />
            Code
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'properties' && renderPropertiesTab()}
        {activeTab === 'styles' && renderStylesTab()}
        {activeTab === 'code' && renderCodeTab()}
      </div>
    </div>
  )
}