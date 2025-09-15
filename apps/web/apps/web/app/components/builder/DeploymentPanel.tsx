'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Rocket, 
  Globe, 
  Settings, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ExternalLink,
  Copy,
  History,
  Cloud,
  Zap,
  GitBranch
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useBuilderStore } from '../../../lib/store/builder'
import { 
  deploymentService, 
  DeploymentProvider, 
  DeploymentConfig, 
  DeploymentResult,
  DeploymentHistory,
  DeploymentStatus
} from '../../../lib/deployment/deployment-service'
import { toast } from 'sonner'

interface DeploymentPanelProps {
  onClose?: () => void
}

export function DeploymentPanel({ onClose }: DeploymentPanelProps) {
  const { components, projectName } = useBuilderStore()
  const [activeTab, setActiveTab] = useState('deploy')
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentHistory, setDeploymentHistory] = useState<DeploymentHistory[]>([])
  const [currentDeployment, setCurrentDeployment] = useState<DeploymentResult | null>(null)
  
  // Deployment configuration
  const [config, setConfig] = useState<DeploymentConfig>({
    provider: 'vercel',
    projectName: projectName || 'my-website',
    domain: '',
    environmentVariables: {},
    buildCommand: '',
    outputDirectory: ''
  })
  
  // API tokens (in a real app, these should be encrypted)
  const [apiTokens, setApiTokens] = useState({
    vercel: '',
    netlify: '',
    github: ''
  })

  useEffect(() => {
    // Load deployment history
    const history = deploymentService.getDeploymentHistory()
    setDeploymentHistory(history)
  }, [])

  const handleDeploy = async () => {
    if (!apiTokens[config.provider]) {
      toast.error(`Please enter your ${config.provider} API token first`)
      return
    }

    if (components.length === 0) {
      toast.error('Cannot deploy empty website. Add some components first.')
      return
    }

    setIsDeploying(true)
    setCurrentDeployment(null)

    try {
      let deployment: DeploymentResult

      switch (config.provider) {
        case 'vercel':
          deployment = await deploymentService.deployToVercel(
            components,
            config,
            apiTokens.vercel
          )
          break
        case 'netlify':
          deployment = await deploymentService.deployToNetlify(
            components,
            config,
            apiTokens.netlify
          )
          break
        default:
          throw new Error(`Deployment provider ${config.provider} not implemented`)
      }

      setCurrentDeployment(deployment)
      
      // Update history
      const updatedHistory = deploymentService.getDeploymentHistory()
      setDeploymentHistory(updatedHistory)

      toast.success(`Successfully deployed to ${config.provider}!`, {
        action: deployment.url ? {
          label: 'View Site',
          onClick: () => window.open(deployment.url, '_blank')
        } : undefined
      })

    } catch (error) {
      toast.error(`Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Deployment error:', error)
    } finally {
      setIsDeploying(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const getStatusIcon = (status: DeploymentStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'building':
      case 'deploying':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: DeploymentStatus) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'building':
      case 'deploying':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const providerIcons = {
    vercel: '▲',
    netlify: '◇',
    'github-pages': '🐙',
    custom: '🌐'
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Rocket className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Deploy Website
            </h2>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Deploy your website to the cloud with one click
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="border-b border-gray-200 dark:border-gray-700 px-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="deploy" className="text-xs">
                <Rocket className="h-4 w-4 mr-1" />
                Deploy
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs">
                <History className="h-4 w-4 mr-1" />
                History
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4">
            <TabsContent value="deploy" className="space-y-4 mt-0">
              {/* Provider Selection */}
              <div className="space-y-2">
                <Label>Deployment Provider</Label>
                <Select 
                  value={config.provider} 
                  onValueChange={(value) => setConfig(prev => ({ ...prev, provider: value as DeploymentProvider }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vercel">
                      <div className="flex items-center space-x-2">
                        <span>{providerIcons.vercel}</span>
                        <span>Vercel</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="netlify">
                      <div className="flex items-center space-x-2">
                        <span>{providerIcons.netlify}</span>
                        <span>Netlify</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="github-pages">
                      <div className="flex items-center space-x-2">
                        <span>{providerIcons['github-pages']}</span>
                        <span>GitHub Pages</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Project Configuration */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={config.projectName}
                    onChange={(e) => setConfig(prev => ({ ...prev, projectName: e.target.value }))}
                    placeholder="my-awesome-website"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Custom Domain (optional)</Label>
                  <Input
                    id="domain"
                    value={config.domain}
                    onChange={(e) => setConfig(prev => ({ ...prev, domain: e.target.value }))}
                    placeholder="mywebsite.com"
                  />
                </div>
              </div>

              {/* API Token */}
              <div className="space-y-2">
                <Label htmlFor="apiToken">
                  {config.provider} API Token
                  <span className="text-xs text-gray-500 ml-1">(required)</span>
                </Label>
                <Input
                  id="apiToken"
                  type="password"
                  value={apiTokens[config.provider]}
                  onChange={(e) => setApiTokens(prev => ({ 
                    ...prev, 
                    [config.provider]: e.target.value 
                  }))}
                  placeholder={`Enter your ${config.provider} API token`}
                />
                <p className="text-xs text-gray-500">
                  Get your API token from your {config.provider} dashboard
                </p>
              </div>

              {/* Current Deployment Status */}
              {currentDeployment && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(currentDeployment.status)}
                      <span className="font-medium">Current Deployment</span>
                    </div>
                    <Badge className={getStatusColor(currentDeployment.status)}>
                      {currentDeployment.status}
                    </Badge>
                  </div>

                  {currentDeployment.status === 'building' || currentDeployment.status === 'deploying' ? (
                    <div className="space-y-2">
                      <Progress value={65} className="w-full" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {currentDeployment.status === 'building' ? 'Building your website...' : 'Deploying to servers...'}
                      </p>
                    </div>
                  ) : currentDeployment.url ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-green-500" />
                        <a 
                          href={currentDeployment.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          {currentDeployment.url}
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(currentDeployment.url!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      {currentDeployment.buildTime && (
                        <p className="text-xs text-gray-500">
                          Build completed in {Math.round(currentDeployment.buildTime / 1000)}s
                        </p>
                      )}
                    </div>
                  ) : currentDeployment.error && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {currentDeployment.error}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Deploy Button */}
              <Button
                onClick={handleDeploy}
                disabled={isDeploying || !apiTokens[config.provider]}
                className="w-full"
                size="lg"
              >
                {isDeploying ? (
                  <>
                    <Cloud className="h-4 w-4 mr-2 animate-pulse" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Deploy to {config.provider}
                  </>
                )}
              </Button>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{components.length}</div>
                  <div className="text-xs text-gray-500">Components</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{deploymentHistory.length}</div>
                  <div className="text-xs text-gray-500">Deployments</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-0">
              {deploymentHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No deployments yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Deploy your first website to see history here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deploymentHistory.map((deployment) => (
                    <motion.div
                      key={deployment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{providerIcons[deployment.provider]}</span>
                          <span className="font-medium">{deployment.version}</span>
                          {getStatusIcon(deployment.status)}
                        </div>
                        <Badge className={getStatusColor(deployment.status)}>
                          {deployment.status}
                        </Badge>
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {deployment.createdAt.toLocaleDateString()} at{' '}
                        {deployment.createdAt.toLocaleTimeString()}
                      </div>

                      {deployment.url && (
                        <div className="flex items-center space-x-2">
                          <a
                            href={deployment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm flex items-center space-x-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>View Site</span>
                          </a>
                          {deployment.buildTime && (
                            <span className="text-xs text-gray-500">
                              • {Math.round(deployment.buildTime / 1000)}s build
                            </span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-3">Build Settings</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="buildCommand">Build Command (optional)</Label>
                      <Input
                        id="buildCommand"
                        value={config.buildCommand}
                        onChange={(e) => setConfig(prev => ({ ...prev, buildCommand: e.target.value }))}
                        placeholder="npm run build"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="outputDirectory">Output Directory (optional)</Label>
                      <Input
                        id="outputDirectory"
                        value={config.outputDirectory}
                        onChange={(e) => setConfig(prev => ({ ...prev, outputDirectory: e.target.value }))}
                        placeholder="dist"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">API Tokens</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Vercel Token</Label>
                      <Input
                        type="password"
                        value={apiTokens.vercel}
                        onChange={(e) => setApiTokens(prev => ({ ...prev, vercel: e.target.value }))}
                        placeholder="Enter Vercel API token"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Netlify Token</Label>
                      <Input
                        type="password"
                        value={apiTokens.netlify}
                        onChange={(e) => setApiTokens(prev => ({ ...prev, netlify: e.target.value }))}
                        placeholder="Enter Netlify API token"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <strong>Note:</strong> API tokens are stored locally in your browser and never sent to our servers.
                  </p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}