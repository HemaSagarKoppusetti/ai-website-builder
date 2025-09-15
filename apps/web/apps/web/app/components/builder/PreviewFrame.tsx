'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  RotateCw, 
  RefreshCw, 
  ExternalLink,
  Eye,
  EyeOff,
  Zap,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useBuilderStore } from '../../../lib/store/builder'
import { ComponentRenderer } from './ComponentRenderer'
import { Button } from '@/components/ui/button'

type DeviceType = 'mobile' | 'tablet' | 'desktop'
type Orientation = 'portrait' | 'landscape'

interface DevicePreset {
  name: string
  width: number
  height: number
  icon: React.ComponentType<{ className?: string }>
  userAgent: string
}

const devicePresets: Record<DeviceType, DevicePreset> = {
  mobile: {
    name: 'iPhone 14',
    width: 390,
    height: 844,
    icon: Smartphone,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  tablet: {
    name: 'iPad',
    width: 768,
    height: 1024,
    icon: Tablet,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  desktop: {
    name: 'Desktop',
    width: 1920,
    height: 1080,
    icon: Monitor,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
}

interface PreviewFrameProps {
  className?: string
}

export function PreviewFrame({ className }: PreviewFrameProps) {
  const { components, selectedComponentId, hoveredComponentId } = useBuilderStore()
  const [device, setDevice] = useState<DeviceType>('desktop')
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [isInteractive, setIsInteractive] = useState(true)
  const [isConnected, setIsConnected] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [scale, setScale] = useState(1)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Calculate preview dimensions
  const preset = devicePresets[device]
  const actualWidth = orientation === 'portrait' ? preset.width : preset.height
  const actualHeight = orientation === 'portrait' ? preset.height : preset.width

  // Auto-scale to fit container
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return
      
      const containerRect = containerRef.current.getBoundingClientRect()
      const padding = 40 // Account for controls and padding
      
      const availableWidth = containerRect.width - padding
      const availableHeight = containerRect.height - padding - 60 // Account for toolbar
      
      const scaleX = availableWidth / actualWidth
      const scaleY = availableHeight / actualHeight
      
      setScale(Math.min(scaleX, scaleY, 1))
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [actualWidth, actualHeight])

  // WebSocket connection for hot reload
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket('ws://localhost:3001/preview')
        wsRef.current = ws

        ws.onopen = () => {
          setIsConnected(true)
          console.log('Preview WebSocket connected')
        }

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data)
          if (data.type === 'component_update') {
            // Component was updated, trigger re-render
            forceUpdate()
          }
        }

        ws.onclose = () => {
          setIsConnected(false)
          console.log('Preview WebSocket disconnected')
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000)
        }

        ws.onerror = (error) => {
          console.error('Preview WebSocket error:', error)
          setIsConnected(false)
        }
      } catch (error) {
        console.error('Failed to connect WebSocket:', error)
        setIsConnected(false)
      }
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  // Force re-render function
  const [updateKey, setUpdateKey] = useState(0)
  const forceUpdate = useCallback(() => {
    setUpdateKey(prev => prev + 1)
  }, [])

  // Listen for component changes
  useEffect(() => {
    forceUpdate()
  }, [components, forceUpdate])

  const toggleOrientation = () => {
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait')
  }

  const refreshPreview = () => {
    setIsLoading(true)
    forceUpdate()
    setTimeout(() => setIsLoading(false), 500)
  }

  const openInNewTab = () => {
    const previewUrl = `/preview?timestamp=${Date.now()}`
    window.open(previewUrl, '_blank')
  }

  const getDeviceClass = () => {
    switch (device) {
      case 'mobile':
        return 'rounded-[2.5rem] bg-gray-900 p-2 shadow-2xl'
      case 'tablet':
        return 'rounded-xl bg-gray-800 p-3 shadow-xl'
      case 'desktop':
        return 'rounded-lg bg-gray-700 p-1 shadow-lg'
      default:
        return 'rounded-lg bg-gray-100 shadow-md'
    }
  }

  return (
    <div ref={containerRef} className={`h-full flex flex-col ${className}`}>
      {/* Preview Toolbar */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          {/* Device Selection */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md p-1">
            {Object.entries(devicePresets).map(([key, preset]) => {
              const Icon = preset.icon
              return (
                <Button
                  key={key}
                  variant={device === key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDevice(key as DeviceType)}
                  className="px-3 py-1.5"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              )
            })}
          </div>

          {/* Orientation Toggle */}
          {device !== 'desktop' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleOrientation}
              title={`Switch to ${orientation === 'portrait' ? 'landscape' : 'portrait'}`}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          )}

          {/* Interactive Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsInteractive(!isInteractive)}
            title={isInteractive ? 'Disable interactions' : 'Enable interactions'}
            className={!isInteractive ? 'bg-yellow-100 dark:bg-yellow-900' : ''}
          >
            {isInteractive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Connection Status */}
          <div className="flex items-center space-x-2 text-sm">
            {isConnected ? (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <Wifi className="h-4 w-4 mr-1" />
                <span>Live</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600 dark:text-red-400">
                <WifiOff className="h-4 w-4 mr-1" />
                <span>Offline</span>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshPreview}
            disabled={isLoading}
            title="Refresh preview"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          {/* Open in New Tab */}
          <Button
            variant="ghost"
            size="sm"
            onClick={openInNewTab}
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>

          {/* Device Info */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {actualWidth}×{actualHeight} ({Math.round(scale * 100)}%)
          </div>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <motion.div
          key={`${device}-${orientation}-${updateKey}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale }}
          transition={{ duration: 0.3 }}
          className={getDeviceClass()}
          style={{
            width: actualWidth,
            height: actualHeight,
          }}
        >
          {/* Device Screen */}
          <div
            ref={frameRef}
            className="w-full h-full bg-white dark:bg-gray-100 overflow-hidden relative"
            style={{
              borderRadius: device === 'mobile' ? '2rem' : device === 'tablet' ? '0.75rem' : '0.5rem',
              pointerEvents: isInteractive ? 'auto' : 'none'
            }}
          >
            {/* Loading Overlay */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-50"
                >
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Zap className="h-5 w-5 animate-pulse" />
                    <span className="text-sm font-medium">Updating preview...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Preview Content */}
            <div className="h-full overflow-auto">
              {components.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎨</div>
                    <h3 className="text-lg font-medium mb-2">Preview Your Website</h3>
                    <p className="text-sm max-w-xs">
                      Add components to see your website come to life in real-time
                    </p>
                  </div>
                </div>
              ) : (
                <div className="min-h-full">
                  {components.map((component, index) => (
                    <div
                      key={component.id}
                      className={`
                        ${selectedComponentId === component.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                        ${hoveredComponentId === component.id ? 'ring-1 ring-gray-300 ring-opacity-50' : ''}
                      `}
                    >
                      <ComponentRenderer 
                        component={component} 
                        isPreview={true}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Device-specific UI elements */}
            {device === 'mobile' && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-300 rounded-full" />
            )}
          </div>
        </motion.div>
      </div>

      {/* Status Bar */}
      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span>{preset.name}</span>
            <span>•</span>
            <span>{components.length} components</span>
            {!isInteractive && (
              <>
                <span>•</span>
                <span className="text-yellow-600">Interactions disabled</span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {isConnected && (
              <div className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
                <span>Live reload active</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for WebSocket-based hot reload
export function usePreviewHotReload() {
  const { components } = useBuilderStore()
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!wsRef.current) return

    // Send component updates to preview
    const message = {
      type: 'component_update',
      components: components,
      timestamp: Date.now()
    }

    if (wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [components])

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN
  }
}