#!/usr/bin/env node

const { WebSocketServer } = require('ws')
const { createServer } = require('http')

console.log('🚀 Starting AI Website Builder Preview Server...')

// Create HTTP server
const server = createServer()

// Create WebSocket server
const wss = new WebSocketServer({ 
  server,
  path: '/preview'
})

const clients = new Map()
let latestComponents = []

wss.on('connection', (ws, request) => {
  const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const clientType = request.url?.includes('builder') ? 'builder' : 'preview'
  
  clients.set(clientId, {
    ws,
    id: clientId,
    type: clientType,
    lastSeen: Date.now()
  })

  console.log(`✅ Preview client connected: ${clientId} (${clientType})`)

  // Send current state to new client
  if (latestComponents.length > 0) {
    ws.send(JSON.stringify({
      type: 'component_update',
      components: latestComponents,
      timestamp: Date.now()
    }))
  }

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString())
      
      if (message.type === 'component_update' && message.components) {
        latestComponents = message.components
        
        // Broadcast to all preview clients
        clients.forEach((client) => {
          if (client.type === 'preview' && client.ws.readyState === 1) {
            try {
              client.ws.send(JSON.stringify({
                type: 'component_update',
                components: message.components,
                timestamp: Date.now()
              }))
            } catch (error) {
              console.warn(`Failed to send to client ${client.id}:`, error.message)
            }
          }
        })
        
        console.log(`🔄 Updated ${clients.size} preview clients with ${message.components.length} components`)
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error.message)
    }
  })

  ws.on('close', () => {
    clients.delete(clientId)
    console.log(`❌ Preview client disconnected: ${clientId}`)
  })

  ws.on('error', (error) => {
    console.error(`Preview WebSocket error for client ${clientId}:`, error.message)
    clients.delete(clientId)
  })

  // Health check
  const pingInterval = setInterval(() => {
    if (ws.readyState === 1) {
      ws.ping()
    } else {
      clearInterval(pingInterval)
    }
  }, 30000)
})

// Start server
const PORT = process.env.PREVIEW_WS_PORT || 3001

server.listen(PORT, () => {
  console.log(`🎯 Preview WebSocket server running on ws://localhost:${PORT}/preview`)
  console.log(`📡 Ready to sync builder changes with preview windows`)
  console.log(`💡 Tip: Open http://localhost:3000/builder/enhanced and http://localhost:3000/preview in separate tabs`)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down preview server...')
  
  clients.forEach((client) => {
    if (client.ws.readyState === 1) {
      client.ws.close()
    }
  })
  
  server.close(() => {
    console.log('✅ Preview server stopped gracefully')
    process.exit(0)
  })
})

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})