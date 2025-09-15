import { WebSocketServer, WebSocket } from 'ws'
import { createServer } from 'http'

interface PreviewMessage {
  type: 'component_update' | 'sync_request' | 'sync_response'
  components?: any[]
  timestamp?: number
  clientId?: string
}

interface ConnectedClient {
  ws: WebSocket
  id: string
  type: 'builder' | 'preview'
  lastSeen: number
}

class PreviewWebSocketServer {
  private wss: WebSocketServer | null = null
  private server: any = null
  private clients: Map<string, ConnectedClient> = new Map()
  private latestComponents: any[] = []
  private port: number

  constructor(port: number = 3001) {
    this.port = port
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Create HTTP server for WebSocket upgrade
        this.server = createServer()
        
        // Create WebSocket server
        this.wss = new WebSocketServer({ 
          server: this.server,
          path: '/preview'
        })

        this.wss.on('connection', (ws: WebSocket, request) => {
          const clientId = this.generateClientId()
          const clientType = this.getClientType(request.url)
          
          const client: ConnectedClient = {
            ws,
            id: clientId,
            type: clientType,
            lastSeen: Date.now()
          }

          this.clients.set(clientId, client)
          console.log(`Preview WebSocket client connected: ${clientId} (${clientType})`)

          // Send current state to new client
          if (this.latestComponents.length > 0) {
            this.sendToClient(client, {
              type: 'component_update',
              components: this.latestComponents,
              timestamp: Date.now()
            })
          }

          ws.on('message', (data: string) => {
            try {
              const message: PreviewMessage = JSON.parse(data.toString())
              this.handleMessage(clientId, message)
            } catch (error) {
              console.error('Failed to parse WebSocket message:', error)
            }
          })

          ws.on('close', () => {
            this.clients.delete(clientId)
            console.log(`Preview WebSocket client disconnected: ${clientId}`)
          })

          ws.on('error', (error) => {
            console.error(`Preview WebSocket error for client ${clientId}:`, error)
            this.clients.delete(clientId)
          })

          // Set up ping/pong for connection health
          const pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.ping()
            } else {
              clearInterval(pingInterval)
            }
          }, 30000)

          ws.on('pong', () => {
            const client = this.clients.get(clientId)
            if (client) {
              client.lastSeen = Date.now()
            }
          })
        })

        this.server.listen(this.port, () => {
          console.log(`Preview WebSocket server started on port ${this.port}`)
          resolve()
        })

        // Cleanup stale connections periodically
        setInterval(() => {
          this.cleanupStaleConnections()
        }, 60000) // Every minute

      } catch (error) {
        reject(error)
      }
    })
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.wss) {
        this.wss.close(() => {
          if (this.server) {
            this.server.close(() => {
              console.log('Preview WebSocket server stopped')
              resolve()
            })
          } else {
            resolve()
          }
        })
      } else {
        resolve()
      }
    })
  }

  private handleMessage(clientId: string, message: PreviewMessage): void {
    const client = this.clients.get(clientId)
    if (!client) return

    switch (message.type) {
      case 'component_update':
        if (message.components) {
          this.latestComponents = message.components
          // Broadcast to all preview clients
          this.broadcastToPreviewClients({
            type: 'component_update',
            components: message.components,
            timestamp: Date.now()
          })
        }
        break

      case 'sync_request':
        // Send current components to requesting client
        this.sendToClient(client, {
          type: 'sync_response',
          components: this.latestComponents,
          timestamp: Date.now()
        })
        break
    }
  }

  private sendToClient(client: ConnectedClient, message: PreviewMessage): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message))
      } catch (error) {
        console.error(`Failed to send message to client ${client.id}:`, error)
      }
    }
  }

  private broadcastToPreviewClients(message: PreviewMessage): void {
    this.clients.forEach((client) => {
      if (client.type === 'preview') {
        this.sendToClient(client, message)
      }
    })
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getClientType(url?: string): 'builder' | 'preview' {
    // Determine client type based on URL or other criteria
    if (url?.includes('builder')) {
      return 'builder'
    }
    return 'preview'
  }

  private cleanupStaleConnections(): void {
    const now = Date.now()
    const staleThreshold = 5 * 60 * 1000 // 5 minutes

    this.clients.forEach((client, clientId) => {
      if (now - client.lastSeen > staleThreshold) {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.close()
        }
        this.clients.delete(clientId)
        console.log(`Cleaned up stale connection: ${clientId}`)
      }
    })
  }

  // Public methods for external use
  public broadcastUpdate(components: any[]): void {
    this.latestComponents = components
    this.broadcastToPreviewClients({
      type: 'component_update',
      components,
      timestamp: Date.now()
    })
  }

  public getConnectedClients(): { id: string; type: string; lastSeen: number }[] {
    return Array.from(this.clients.values()).map(client => ({
      id: client.id,
      type: client.type,
      lastSeen: client.lastSeen
    }))
  }
}

// Singleton instance
let previewServer: PreviewWebSocketServer | null = null

export function startPreviewServer(port: number = 3001): Promise<PreviewWebSocketServer> {
  if (previewServer) {
    return Promise.resolve(previewServer)
  }

  previewServer = new PreviewWebSocketServer(port)
  return previewServer.start().then(() => previewServer!)
}

export function stopPreviewServer(): Promise<void> {
  if (!previewServer) {
    return Promise.resolve()
  }

  const server = previewServer
  previewServer = null
  return server.stop()
}

export function getPreviewServer(): PreviewWebSocketServer | null {
  return previewServer
}

// Hot reload hook for development
export function setupHotReload(): void {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Auto-start preview server in development
    startPreviewServer().catch(error => {
      console.warn('Failed to start preview server:', error)
    })
  }
}