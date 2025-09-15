'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ComponentRenderer } from '../components/builder/ComponentRenderer'
import { BuilderComponent } from '../../lib/store/builder'

interface PreviewPageProps {
  searchParams?: {
    timestamp?: string
    device?: string
    components?: string
  }
}

export default function PreviewPage() {
  const [components, setComponents] = useState<BuilderComponent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const loadComponents = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Try to load from URL params first (for direct links)
        const componentsParam = searchParams?.get('components')
        if (componentsParam) {
          try {
            const decodedComponents = JSON.parse(decodeURIComponent(componentsParam))
            setComponents(decodedComponents)
            setIsLoading(false)
            return
          } catch (e) {
            console.warn('Failed to parse components from URL:', e)
          }
        }

        // Try to load from localStorage (builder state)
        const builderState = localStorage.getItem('builder-store')
        if (builderState) {
          try {
            const parsed = JSON.parse(builderState)
            const stateComponents = parsed?.state?.components || []
            setComponents(stateComponents)
            setIsLoading(false)
            return
          } catch (e) {
            console.warn('Failed to parse builder state:', e)
          }
        }

        // Try to load from session storage as fallback
        const sessionComponents = sessionStorage.getItem('preview-components')
        if (sessionComponents) {
          try {
            const parsed = JSON.parse(sessionComponents)
            setComponents(parsed)
            setIsLoading(false)
            return
          } catch (e) {
            console.warn('Failed to parse session components:', e)
          }
        }

        // If no components found, set empty state
        setComponents([])
        setIsLoading(false)

      } catch (error) {
        console.error('Error loading preview components:', error)
        setError('Failed to load website components')
        setIsLoading(false)
      }
    }

    loadComponents()

    // Listen for storage changes (when builder updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'builder-store' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          const newComponents = parsed?.state?.components || []
          setComponents(newComponents)
        } catch (error) {
          console.warn('Failed to parse updated builder state:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom events from the builder
    const handleBuilderUpdate = (event: CustomEvent) => {
      if (event.detail?.components) {
        setComponents(event.detail.components)
      }
    }

    window.addEventListener('builderUpdate', handleBuilderUpdate as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('builderUpdate', handleBuilderUpdate as EventListener)
    }
  }, [searchParams])

  // WebSocket connection for real-time updates
  useEffect(() => {
    let ws: WebSocket | null = null

    const connectWebSocket = () => {
      try {
        ws = new WebSocket('ws://localhost:3001/preview')
        
        ws.onopen = () => {
          console.log('Preview page WebSocket connected')
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === 'component_update' && data.components) {
              setComponents(data.components)
            }
          } catch (error) {
            console.warn('Failed to parse WebSocket message:', error)
          }
        }

        ws.onclose = () => {
          console.log('Preview page WebSocket disconnected')
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000)
        }

        ws.onerror = (error) => {
          console.error('Preview page WebSocket error:', error)
        }
      } catch (error) {
        console.error('Failed to connect preview WebSocket:', error)
      }
    }

    connectWebSocket()

    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg text-gray-600">Loading preview...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Preview Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (components.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🎨</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Content Yet</h1>
          <p className="text-gray-600 mb-6">
            This website is currently being built. Components will appear here as they're added to the builder.
          </p>
          <a
            href="/builder"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Builder
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Render all components */}
      {components.map((component, index) => (
        <div key={`${component.id}-${index}`}>
          <ComponentRenderer 
            component={component} 
            isPreview={true}
          />
        </div>
      ))}
      
      {/* Development indicator - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full opacity-75 z-50">
          Preview Mode • {components.length} components
        </div>
      )}
    </div>
  )
}

// Utility function to generate shareable preview URL
export function generatePreviewURL(components: BuilderComponent[], baseUrl: string = ''): string {
  try {
    const encodedComponents = encodeURIComponent(JSON.stringify(components))
    return `${baseUrl}/preview?components=${encodedComponents}&timestamp=${Date.now()}`
  } catch (error) {
    console.error('Failed to generate preview URL:', error)
    return `${baseUrl}/preview`
  }
}

// Utility function to save components to session storage for preview
export function saveComponentsForPreview(components: BuilderComponent[]): void {
  try {
    sessionStorage.setItem('preview-components', JSON.stringify(components))
    
    // Also dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('builderUpdate', {
      detail: { components }
    }))
  } catch (error) {
    console.error('Failed to save components for preview:', error)
  }
}