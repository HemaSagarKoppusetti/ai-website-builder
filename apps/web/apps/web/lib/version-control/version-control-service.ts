'use client'

import { BuilderComponent } from '../store/builder'

export type ChangeType = 'create' | 'update' | 'delete' | 'reorder' | 'style' | 'content'
export type MergeConflictType = 'component' | 'style' | 'content' | 'structure'

export interface ProjectCommit {
  id: string
  message: string
  author: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  timestamp: Date
  parentIds: string[]
  components: BuilderComponent[]
  changes: ProjectChange[]
  branch: string
}

export interface ProjectChange {
  id: string
  type: ChangeType
  componentId?: string
  before?: any
  after?: any
  path?: string[]
  description: string
}

export interface ProjectBranch {
  id: string
  name: string
  description?: string
  headCommitId: string
  createdAt: Date
  createdBy: string
  isProtected: boolean
  isDefault: boolean
}

export interface MergeConflict {
  id: string
  type: MergeConflictType
  componentId?: string
  path?: string[]
  baseValue: any
  incomingValue: any
  currentValue: any
  resolution?: 'accept-incoming' | 'accept-current' | 'manual'
  resolvedValue?: any
}

export interface MergeResult {
  success: boolean
  commitId?: string
  conflicts: MergeConflict[]
  message?: string
}

export interface CollaborationSession {
  id: string
  projectId: string
  participants: ProjectCollaborator[]
  activeBranch: string
  lastActivity: Date
  cursor?: {
    participantId: string
    componentId: string
    position: { x: number; y: number }
  }[]
}

export interface ProjectCollaborator {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  lastSeen: Date
  currentBranch?: string
  isOnline: boolean
}

class VersionControlService {
  private commits: Map<string, ProjectCommit> = new Map()
  private branches: Map<string, ProjectBranch> = new Map()
  private collaborators: Map<string, ProjectCollaborator> = new Map()
  private sessions: Map<string, CollaborationSession> = new Map()
  private currentBranch: string = 'main'
  private currentUser: ProjectCollaborator | null = null

  constructor() {
    // Initialize default branch
    const mainBranch: ProjectBranch = {
      id: 'main',
      name: 'main',
      description: 'Main branch',
      headCommitId: '',
      createdAt: new Date(),
      createdBy: 'system',
      isProtected: true,
      isDefault: true
    }
    this.branches.set('main', mainBranch)
  }

  // User management
  setCurrentUser(user: ProjectCollaborator): void {
    this.currentUser = user
    this.collaborators.set(user.id, { ...user, isOnline: true, lastSeen: new Date() })
  }

  getCurrentUser(): ProjectCollaborator | null {
    return this.currentUser
  }

  // Branch management
  createBranch(name: string, description?: string, fromBranch?: string): ProjectBranch {
    if (this.branches.has(name)) {
      throw new Error(`Branch '${name}' already exists`)
    }

    const sourceBranch = fromBranch ? this.branches.get(fromBranch) : this.branches.get(this.currentBranch)
    if (!sourceBranch) {
      throw new Error(`Source branch not found`)
    }

    const branch: ProjectBranch = {
      id: name,
      name,
      description,
      headCommitId: sourceBranch.headCommitId,
      createdAt: new Date(),
      createdBy: this.currentUser?.id || 'unknown',
      isProtected: false,
      isDefault: false
    }

    this.branches.set(name, branch)
    return branch
  }

  switchBranch(branchName: string): void {
    const branch = this.branches.get(branchName)
    if (!branch) {
      throw new Error(`Branch '${branchName}' not found`)
    }
    
    this.currentBranch = branchName
    
    // Update user's current branch
    if (this.currentUser) {
      const user = this.collaborators.get(this.currentUser.id)
      if (user) {
        user.currentBranch = branchName
        this.collaborators.set(user.id, user)
      }
    }
  }

  getBranches(): ProjectBranch[] {
    return Array.from(this.branches.values())
  }

  getCurrentBranch(): ProjectBranch | undefined {
    return this.branches.get(this.currentBranch)
  }

  deleteBranch(branchName: string): boolean {
    const branch = this.branches.get(branchName)
    if (!branch) {
      throw new Error(`Branch '${branchName}' not found`)
    }

    if (branch.isDefault) {
      throw new Error('Cannot delete default branch')
    }

    if (branch.isProtected) {
      throw new Error('Cannot delete protected branch')
    }

    this.branches.delete(branchName)
    return true
  }

  // Commit management
  createCommit(
    components: BuilderComponent[], 
    message: string, 
    changes: ProjectChange[] = []
  ): ProjectCommit {
    if (!this.currentUser) {
      throw new Error('No user set')
    }

    const commitId = this.generateCommitId()
    const parentIds: string[] = []
    
    const currentBranch = this.getCurrentBranch()
    if (currentBranch?.headCommitId) {
      parentIds.push(currentBranch.headCommitId)
    }

    const commit: ProjectCommit = {
      id: commitId,
      message,
      author: {
        id: this.currentUser.id,
        name: this.currentUser.name,
        email: this.currentUser.email,
        avatar: this.currentUser.avatar
      },
      timestamp: new Date(),
      parentIds,
      components: JSON.parse(JSON.stringify(components)),
      changes,
      branch: this.currentBranch
    }

    this.commits.set(commitId, commit)

    // Update branch head
    if (currentBranch) {
      currentBranch.headCommitId = commitId
      this.branches.set(this.currentBranch, currentBranch)
    }

    return commit
  }

  getCommit(commitId: string): ProjectCommit | undefined {
    return this.commits.get(commitId)
  }

  getCommitHistory(branchName?: string, limit: number = 50): ProjectCommit[] {
    const branch = branchName ? this.branches.get(branchName) : this.getCurrentBranch()
    if (!branch || !branch.headCommitId) {
      return []
    }

    const history: ProjectCommit[] = []
    let currentCommitId: string | null = branch.headCommitId
    
    while (currentCommitId && history.length < limit) {
      const commit = this.commits.get(currentCommitId)
      if (!commit) break
      
      history.push(commit)
      currentCommitId = commit.parentIds[0] || null
    }

    return history
  }

  // Change detection
  detectChanges(
    previousComponents: BuilderComponent[], 
    currentComponents: BuilderComponent[]
  ): ProjectChange[] {
    const changes: ProjectChange[] = []
    
    // Create maps for easier comparison
    const prevMap = new Map(previousComponents.map(c => [c.id, c]))
    const currMap = new Map(currentComponents.map(c => [c.id, c]))

    // Detect deletions
    for (const [id, component] of prevMap) {
      if (!currMap.has(id)) {
        changes.push({
          id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'delete',
          componentId: id,
          before: component,
          after: null,
          description: `Deleted ${component.category} "${component.name}"`
        })
      }
    }

    // Detect additions and modifications
    for (const [id, component] of currMap) {
      const prevComponent = prevMap.get(id)
      
      if (!prevComponent) {
        // New component
        changes.push({
          id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'create',
          componentId: id,
          before: null,
          after: component,
          description: `Added ${component.category} "${component.name}"`
        })
      } else {
        // Check for modifications
        const componentChanges = this.detectComponentChanges(prevComponent, component)
        changes.push(...componentChanges)
      }
    }

    // Detect reordering
    const prevOrder = previousComponents.map(c => c.id)
    const currOrder = currentComponents.map(c => c.id)
    
    if (JSON.stringify(prevOrder) !== JSON.stringify(currOrder)) {
      changes.push({
        id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'reorder',
        before: prevOrder,
        after: currOrder,
        description: 'Reordered components'
      })
    }

    return changes
  }

  private detectComponentChanges(prev: BuilderComponent, curr: BuilderComponent): ProjectChange[] {
    const changes: ProjectChange[] = []
    
    // Check content changes
    if (JSON.stringify(prev.content) !== JSON.stringify(curr.content)) {
      changes.push({
        id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'content',
        componentId: curr.id,
        before: prev.content,
        after: curr.content,
        path: ['content'],
        description: `Updated content of "${curr.name}"`
      })
    }

    // Check style changes
    if (JSON.stringify(prev.styles) !== JSON.stringify(curr.styles)) {
      changes.push({
        id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'style',
        componentId: curr.id,
        before: prev.styles,
        after: curr.styles,
        path: ['styles'],
        description: `Updated styles of "${curr.name}"`
      })
    }

    // Check other property changes
    const propertiesToCheck = ['name', 'position', 'size', 'isHidden', 'isLocked']
    for (const prop of propertiesToCheck) {
      const prevValue = (prev as any)[prop]
      const currValue = (curr as any)[prop]
      
      if (JSON.stringify(prevValue) !== JSON.stringify(currValue)) {
        changes.push({
          id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'update',
          componentId: curr.id,
          before: prevValue,
          after: currValue,
          path: [prop],
          description: `Updated ${prop} of "${curr.name}"`
        })
      }
    }

    return changes
  }

  // Merging
  async mergeBranches(
    sourceBranch: string, 
    targetBranch: string, 
    message: string = `Merge ${sourceBranch} into ${targetBranch}`
  ): Promise<MergeResult> {
    const source = this.branches.get(sourceBranch)
    const target = this.branches.get(targetBranch)
    
    if (!source || !target) {
      throw new Error('Source or target branch not found')
    }

    const sourceCommit = this.getCommit(source.headCommitId)
    const targetCommit = this.getCommit(target.headCommitId)
    
    if (!sourceCommit || !targetCommit) {
      throw new Error('Head commits not found')
    }

    // Find common ancestor
    const commonAncestor = this.findCommonAncestor(source.headCommitId, target.headCommitId)
    
    // Detect conflicts
    const conflicts = this.detectMergeConflicts(
      sourceCommit.components,
      targetCommit.components,
      commonAncestor ? this.getCommit(commonAncestor)?.components || [] : []
    )

    if (conflicts.length > 0) {
      return {
        success: false,
        conflicts,
        message: 'Merge conflicts detected'
      }
    }

    // Perform three-way merge
    const mergedComponents = this.performThreeWayMerge(
      sourceCommit.components,
      targetCommit.components,
      commonAncestor ? this.getCommit(commonAncestor)?.components || [] : []
    )

    // Create merge commit
    const mergeCommit: ProjectCommit = {
      id: this.generateCommitId(),
      message,
      author: this.currentUser ? {
        id: this.currentUser.id,
        name: this.currentUser.name,
        email: this.currentUser.email,
        avatar: this.currentUser.avatar
      } : {
        id: 'system',
        name: 'System',
        email: 'system@example.com'
      },
      timestamp: new Date(),
      parentIds: [target.headCommitId, source.headCommitId],
      components: mergedComponents,
      changes: this.detectChanges(targetCommit.components, mergedComponents),
      branch: targetBranch
    }

    this.commits.set(mergeCommit.id, mergeCommit)
    
    // Update target branch
    target.headCommitId = mergeCommit.id
    this.branches.set(targetBranch, target)

    return {
      success: true,
      commitId: mergeCommit.id,
      conflicts: []
    }
  }

  private findCommonAncestor(commitId1: string, commitId2: string): string | null {
    const ancestors1 = this.getAncestors(commitId1)
    const ancestors2 = this.getAncestors(commitId2)
    
    // Find first common ancestor
    for (const ancestor of ancestors1) {
      if (ancestors2.has(ancestor)) {
        return ancestor
      }
    }
    
    return null
  }

  private getAncestors(commitId: string): Set<string> {
    const ancestors = new Set<string>()
    const queue = [commitId]
    
    while (queue.length > 0) {
      const current = queue.shift()!
      if (ancestors.has(current)) continue
      
      ancestors.add(current)
      
      const commit = this.getCommit(current)
      if (commit) {
        queue.push(...commit.parentIds)
      }
    }
    
    return ancestors
  }

  private detectMergeConflicts(
    sourceComponents: BuilderComponent[],
    targetComponents: BuilderComponent[],
    baseComponents: BuilderComponent[]
  ): MergeConflict[] {
    const conflicts: MergeConflict[] = []
    
    const sourceMap = new Map(sourceComponents.map(c => [c.id, c]))
    const targetMap = new Map(targetComponents.map(c => [c.id, c]))
    const baseMap = new Map(baseComponents.map(c => [c.id, c]))

    // Check all components that exist in any version
    const allIds = new Set([
      ...sourceMap.keys(),
      ...targetMap.keys(),
      ...baseMap.keys()
    ])

    for (const id of allIds) {
      const source = sourceMap.get(id)
      const target = targetMap.get(id)
      const base = baseMap.get(id)

      // Component conflicts
      if (source && target && base) {
        // All three versions exist - check for conflicts
        const sourceChanged = JSON.stringify(source) !== JSON.stringify(base)
        const targetChanged = JSON.stringify(target) !== JSON.stringify(base)
        
        if (sourceChanged && targetChanged && JSON.stringify(source) !== JSON.stringify(target)) {
          conflicts.push({
            id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'component',
            componentId: id,
            baseValue: base,
            incomingValue: source,
            currentValue: target
          })
        }
      } else if (source && target && !base) {
        // Component added in both branches
        if (JSON.stringify(source) !== JSON.stringify(target)) {
          conflicts.push({
            id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'component',
            componentId: id,
            baseValue: null,
            incomingValue: source,
            currentValue: target
          })
        }
      } else if (base && ((source && !target) || (!source && target))) {
        // Component deleted in one branch but modified in another
        conflicts.push({
          id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'component',
          componentId: id,
          baseValue: base,
          incomingValue: source || null,
          currentValue: target || null
        })
      }
    }

    return conflicts
  }

  private performThreeWayMerge(
    sourceComponents: BuilderComponent[],
    targetComponents: BuilderComponent[],
    baseComponents: BuilderComponent[]
  ): BuilderComponent[] {
    const sourceMap = new Map(sourceComponents.map(c => [c.id, c]))
    const targetMap = new Map(targetComponents.map(c => [c.id, c]))
    const baseMap = new Map(baseComponents.map(c => [c.id, c]))

    const merged: BuilderComponent[] = []
    const processedIds = new Set<string>()

    // Process all components
    const allIds = new Set([
      ...sourceMap.keys(),
      ...targetMap.keys(),
      ...baseMap.keys()
    ])

    for (const id of allIds) {
      if (processedIds.has(id)) continue
      
      const source = sourceMap.get(id)
      const target = targetMap.get(id)
      const base = baseMap.get(id)

      let mergedComponent: BuilderComponent | null = null

      if (source && target && base) {
        // All three versions exist
        const sourceChanged = JSON.stringify(source) !== JSON.stringify(base)
        const targetChanged = JSON.stringify(target) !== JSON.stringify(base)
        
        if (!sourceChanged && !targetChanged) {
          mergedComponent = base
        } else if (sourceChanged && !targetChanged) {
          mergedComponent = source
        } else if (!sourceChanged && targetChanged) {
          mergedComponent = target
        } else {
          // Both changed - prefer target (current branch)
          mergedComponent = target
        }
      } else if (source && !target && base) {
        // Modified in source, deleted in target
        // Keep deletion (don't include)
      } else if (!source && target && base) {
        // Deleted in source, modified in target
        mergedComponent = target
      } else if (source && target && !base) {
        // Added in both branches - prefer target
        mergedComponent = target
      } else if (source && !target && !base) {
        // Added only in source
        mergedComponent = source
      } else if (!source && target && !base) {
        // Added only in target
        mergedComponent = target
      }

      if (mergedComponent) {
        merged.push({ ...mergedComponent })
        processedIds.add(id)
      }
    }

    return merged
  }

  // Collaboration
  startCollaborationSession(projectId: string): CollaborationSession {
    const session: CollaborationSession = {
      id: `session_${Date.now()}`,
      projectId,
      participants: this.currentUser ? [this.currentUser] : [],
      activeBranch: this.currentBranch,
      lastActivity: new Date()
    }

    this.sessions.set(session.id, session)
    return session
  }

  joinCollaborationSession(sessionId: string, user: ProjectCollaborator): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false

    const existingIndex = session.participants.findIndex(p => p.id === user.id)
    if (existingIndex >= 0) {
      session.participants[existingIndex] = { ...user, isOnline: true, lastSeen: new Date() }
    } else {
      session.participants.push({ ...user, isOnline: true, lastSeen: new Date() })
    }

    session.lastActivity = new Date()
    this.sessions.set(sessionId, session)
    return true
  }

  leaveCollaborationSession(sessionId: string, userId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false

    const userIndex = session.participants.findIndex(p => p.id === userId)
    if (userIndex >= 0) {
      session.participants[userIndex].isOnline = false
      session.participants[userIndex].lastSeen = new Date()
    }

    session.lastActivity = new Date()
    this.sessions.set(sessionId, session)
    return true
  }

  getCollaborationSessions(): CollaborationSession[] {
    return Array.from(this.sessions.values())
  }

  // Utility methods
  private generateCommitId(): string {
    return `commit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Export/Import
  exportProject(): {
    commits: ProjectCommit[]
    branches: ProjectBranch[]
    currentBranch: string
  } {
    return {
      commits: Array.from(this.commits.values()),
      branches: Array.from(this.branches.values()),
      currentBranch: this.currentBranch
    }
  }

  importProject(data: {
    commits: ProjectCommit[]
    branches: ProjectBranch[]
    currentBranch: string
  }): void {
    this.commits.clear()
    this.branches.clear()

    data.commits.forEach(commit => {
      this.commits.set(commit.id, commit)
    })

    data.branches.forEach(branch => {
      this.branches.set(branch.id, branch)
    })

    this.currentBranch = data.currentBranch
  }

  // Public getters
  getCommits(): ProjectCommit[] {
    return Array.from(this.commits.values())
  }

  getCollaborators(): ProjectCollaborator[] {
    return Array.from(this.collaborators.values())
  }
}

// Singleton instance
export const versionControlService = new VersionControlService()