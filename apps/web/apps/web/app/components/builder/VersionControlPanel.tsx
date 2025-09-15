'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GitBranch, 
  GitCommit, 
  GitMerge, 
  History, 
  Users, 
  Plus,
  Check,
  X,
  Clock,
  User,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Copy,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useBuilderStore } from '../../../lib/store/builder'
import { 
  versionControlService,
  ProjectCommit,
  ProjectBranch,
  ProjectCollaborator,
  ProjectChange,
  MergeConflict,
  ChangeType
} from '../../../lib/version-control/version-control-service'
import { toast } from 'sonner'

interface VersionControlPanelProps {
  onClose?: () => void
}

export function VersionControlPanel({ onClose }: VersionControlPanelProps) {
  const { components } = useBuilderStore()
  const [activeTab, setActiveTab] = useState('branches')
  
  // State
  const [branches, setBranches] = useState<ProjectBranch[]>([])
  const [currentBranch, setCurrentBranch] = useState<ProjectBranch | null>(null)
  const [commits, setCommits] = useState<ProjectCommit[]>([])
  const [collaborators, setCollaborators] = useState<ProjectCollaborator[]>([])
  const [changes, setChanges] = useState<ProjectChange[]>([])
  
  // UI state
  const [commitMessage, setCommitMessage] = useState('')
  const [newBranchName, setNewBranchName] = useState('')
  const [showNewBranch, setShowNewBranch] = useState(false)
  const [selectedCommit, setSelectedCommit] = useState<ProjectCommit | null>(null)
  const [mergeConflicts, setMergeConflicts] = useState<MergeConflict[]>([])

  // Load initial data
  useEffect(() => {
    refreshData()
    
    // Set up a demo user if none exists
    const currentUser = versionControlService.getCurrentUser()
    if (!currentUser) {
      versionControlService.setCurrentUser({
        id: 'user_1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: '',
        role: 'owner',
        lastSeen: new Date(),
        isOnline: true
      })
    }
  }, [])

  const refreshData = () => {
    setBranches(versionControlService.getBranches())
    setCurrentBranch(versionControlService.getCurrentBranch() || null)
    setCommits(versionControlService.getCommitHistory())
    setCollaborators(versionControlService.getCollaborators())
    
    // Detect changes in current components
    const history = versionControlService.getCommitHistory()
    if (history.length > 0) {
      const lastCommit = history[0]
      const detectedChanges = versionControlService.detectChanges(lastCommit.components, components)
      setChanges(detectedChanges)
    } else {
      // If no commits, treat all components as new
      const newChanges: ProjectChange[] = components.map(component => ({
        id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'create' as ChangeType,
        componentId: component.id,
        before: null,
        after: component,
        description: `Added ${component.category} "${component.name}"`
      }))
      setChanges(newChanges)
    }
  }

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) {
      toast.error('Branch name is required')
      return
    }

    try {
      versionControlService.createBranch(newBranchName.trim())
      setNewBranchName('')
      setShowNewBranch(false)
      refreshData()
      toast.success(`Branch "${newBranchName}" created successfully`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create branch')
    }
  }

  const handleSwitchBranch = async (branchName: string) => {
    try {
      versionControlService.switchBranch(branchName)
      refreshData()
      toast.success(`Switched to branch "${branchName}"`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to switch branch')
    }
  }

  const handleCommit = async () => {
    if (!commitMessage.trim()) {
      toast.error('Commit message is required')
      return
    }

    if (changes.length === 0) {
      toast.error('No changes to commit')
      return
    }

    try {
      versionControlService.createCommit(components, commitMessage.trim(), changes)
      setCommitMessage('')
      refreshData()
      toast.success('Changes committed successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create commit')
    }
  }

  const handleMergeBranch = async (sourceBranch: string) => {
    if (!currentBranch) return

    try {
      const result = await versionControlService.mergeBranches(
        sourceBranch,
        currentBranch.name,
        `Merge ${sourceBranch} into ${currentBranch.name}`
      )

      if (result.success) {
        refreshData()
        toast.success(`Successfully merged ${sourceBranch} into ${currentBranch.name}`)
      } else {
        setMergeConflicts(result.conflicts)
        toast.error(`Merge conflicts detected. Please resolve them first.`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to merge branches')
    }
  }

  const getChangeTypeIcon = (type: ChangeType) => {
    switch (type) {
      case 'create':
        return <Plus className="h-3 w-3 text-green-600" />
      case 'delete':
        return <X className="h-3 w-3 text-red-600" />
      case 'update':
      case 'content':
      case 'style':
        return <RefreshCw className="h-3 w-3 text-blue-600" />
      case 'reorder':
        return <GitBranch className="h-3 w-3 text-purple-600" />
      default:
        return <Clock className="h-3 w-3 text-gray-600" />
    }
  }

  const getChangeTypeColor = (type: ChangeType) => {
    switch (type) {
      case 'create':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'update':
      case 'content':
      case 'style':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'reorder':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GitBranch className="h-5 w-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Version Control
            </h2>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage branches, commits, and collaboration
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="border-b border-gray-200 dark:border-gray-700 px-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="branches" className="text-xs">
                <GitBranch className="h-4 w-4 mr-1" />
                Branches
              </TabsTrigger>
              <TabsTrigger value="changes" className="text-xs">
                <GitCommit className="h-4 w-4 mr-1" />
                Changes
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs">
                <History className="h-4 w-4 mr-1" />
                History
              </TabsTrigger>
              <TabsTrigger value="collaborate" className="text-xs">
                <Users className="h-4 w-4 mr-1" />
                Team
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4">
            <TabsContent value="branches" className="space-y-4 mt-0">
              {/* Current Branch */}
              {currentBranch && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <GitBranch className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        {currentBranch.name}
                      </span>
                      {currentBranch.isDefault && (
                        <Badge variant="secondary">default</Badge>
                      )}
                      {currentBranch.isProtected && (
                        <Badge variant="outline">protected</Badge>
                      )}
                    </div>
                  </div>
                  {currentBranch.description && (
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      {currentBranch.description}
                    </p>
                  )}
                </div>
              )}

              {/* New Branch */}
              <div className="space-y-2">
                {!showNewBranch ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowNewBranch(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Branch
                  </Button>
                ) : (
                  <div className="space-y-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <Label htmlFor="branchName">Branch Name</Label>
                    <Input
                      id="branchName"
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                      placeholder="feature/new-component"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateBranch()
                        if (e.key === 'Escape') {
                          setShowNewBranch(false)
                          setNewBranchName('')
                        }
                      }}
                    />
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleCreateBranch}>
                        Create
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowNewBranch(false)
                          setNewBranchName('')
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Branch List */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  All Branches
                </h3>
                <div className="space-y-1">
                  {branches.map((branch) => (
                    <motion.div
                      key={branch.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                        branch.name === currentBranch?.name
                          ? 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => handleSwitchBranch(branch.name)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <GitBranch className="h-4 w-4" />
                          <span className="font-medium">{branch.name}</span>
                          {branch.isDefault && (
                            <Badge variant="secondary">default</Badge>
                          )}
                        </div>
                        {branch.name !== currentBranch?.name && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMergeBranch(branch.name)
                            }}
                          >
                            <GitMerge className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Created {formatTimeAgo(branch.createdAt)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="changes" className="space-y-4 mt-0">
              {/* Commit Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pending Changes
                  </h3>
                  <Badge variant="outline">
                    {changes.length} changes
                  </Badge>
                </div>

                {changes.length > 0 ? (
                  <>
                    {/* Changes List */}
                    <ScrollArea className="h-48 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="p-3 space-y-2">
                        {changes.map((change) => (
                          <div
                            key={change.id}
                            className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                          >
                            {getChangeTypeIcon(change.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium truncate">
                                  {change.description}
                                </span>
                                <Badge className={getChangeTypeColor(change.type)}>
                                  {change.type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Commit Message */}
                    <div className="space-y-2">
                      <Label htmlFor="commitMessage">Commit Message</Label>
                      <Textarea
                        id="commitMessage"
                        value={commitMessage}
                        onChange={(e) => setCommitMessage(e.target.value)}
                        placeholder="Describe your changes..."
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={handleCommit}
                      disabled={!commitMessage.trim()}
                      className="w-full"
                    >
                      <GitCommit className="h-4 w-4 mr-2" />
                      Commit Changes
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <GitCommit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending changes</p>
                    <p className="text-sm">All changes are committed</p>
                  </div>
                )}
              </div>

              {/* Merge Conflicts */}
              {mergeConflicts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <h3 className="text-sm font-medium text-red-700 dark:text-red-300">
                      Merge Conflicts
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {mergeConflicts.map((conflict) => (
                      <div
                        key={conflict.id}
                        className="p-3 border border-red-200 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-900/20"
                      >
                        <div className="text-sm font-medium text-red-900 dark:text-red-100">
                          Conflict in {conflict.componentId || 'component'}
                        </div>
                        <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                          {conflict.type} conflict - manual resolution required
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-0">
              {commits.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No commit history</p>
                  <p className="text-sm">Make your first commit to see history</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {commits.map((commit) => (
                    <motion.div
                      key={commit.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => setSelectedCommit(selectedCommit?.id === commit.id ? null : commit)}
                    >
                      <div className="flex items-start space-x-3">
                        <GitCommit className="h-4 w-4 mt-0.5 text-gray-600" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{commit.message}</span>
                            <Badge variant="outline">{commit.branch}</Badge>
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{commit.author.name}</span>
                            </div>
                            <span>{formatTimeAgo(commit.timestamp)}</span>
                            <span>{commit.changes.length} changes</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {selectedCommit?.id === commit.id ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </div>

                      {/* Expanded commit details */}
                      <AnimatePresence>
                        {selectedCommit?.id === commit.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                          >
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Changes:</h4>
                              {commit.changes.map((change) => (
                                <div
                                  key={change.id}
                                  className="flex items-center space-x-3 text-sm"
                                >
                                  {getChangeTypeIcon(change.type)}
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {change.description}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="collaborate" className="space-y-4 mt-0">
              {/* Collaborators */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Team Members
                </h3>
                
                {collaborators.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No team members yet</p>
                    <p className="text-sm">Invite collaborators to work together</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {collaborators.map((collaborator) => (
                      <div
                        key={collaborator.id}
                        className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={collaborator.avatar} />
                          <AvatarFallback>
                            {collaborator.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium truncate">
                              {collaborator.name}
                            </span>
                            <Badge
                              className={
                                collaborator.isOnline
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                              }
                            >
                              {collaborator.isOnline ? 'online' : 'offline'}
                            </Badge>
                            <Badge variant="outline">
                              {collaborator.role}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {collaborator.currentBranch && (
                              <span>On {collaborator.currentBranch} • </span>
                            )}
                            Last seen {formatTimeAgo(collaborator.lastSeen)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Project Actions */}
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}