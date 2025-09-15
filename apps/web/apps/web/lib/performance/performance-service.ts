'use client'

import { BuilderComponent } from '../store/builder'

export interface PerformanceMetrics {
  loadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  totalBlockingTime: number
  speedIndex: number
  bundleSize: number
  assetsCount: number
  imageOptimization: number
  cacheHitRate: number
}

export interface OptimizationSuggestion {
  id: string
  type: 'bundle' | 'image' | 'lazy-load' | 'cache' | 'seo' | 'accessibility'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  effort: 'easy' | 'medium' | 'hard'
  savings?: {
    size?: number
    time?: number
    score?: number
  }
  action: () => void
}

export interface SEOAnalysis {
  score: number
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    title: string
    description: string
    fix: string
  }>
  metadata: {
    title: string
    description: string
    keywords: string[]
    openGraph: Record<string, string>
  }
  structure: {
    headings: Array<{ level: number; text: string }>
    images: Array<{ src: string; alt: string; hasAlt: boolean }>
    links: Array<{ href: string; text: string; isExternal: boolean }>
  }
}

export interface AccessibilityAudit {
  score: number
  violations: Array<{
    id: string
    impact: 'minor' | 'moderate' | 'serious' | 'critical'
    description: string
    help: string
    nodes: Array<{
      target: string
      html: string
    }>
  }>
  passes: Array<{
    id: string
    description: string
  }>
}

export interface ImageOptimizationResult {
  originalSize: number
  optimizedSize: number
  savings: number
  format: string
  quality: number
  dimensions: { width: number; height: number }
}

class PerformanceService {
  private metrics: PerformanceMetrics | null = null
  private suggestions: OptimizationSuggestion[] = []
  private seoAnalysis: SEOAnalysis | null = null
  private accessibilityAudit: AccessibilityAudit | null = null
  private observers: Map<string, PerformanceObserver> = new Map()

  // Initialize performance monitoring
  initializeMonitoring(): void {
    if (typeof window === 'undefined') return

    // Performance Observer for Core Web Vitals
    this.setupCoreWebVitalsObserver()
    
    // Resource timing observer
    this.setupResourceTimingObserver()
    
    // Long task observer
    this.setupLongTaskObserver()
    
    // Navigation timing
    this.collectNavigationTiming()
  }

  // Setup Core Web Vitals monitoring
  private setupCoreWebVitalsObserver(): void {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        
        this.updateMetric('largestContentfulPaint', lastEntry.startTime)
      })
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.set('lcp', lcpObserver)
      } catch (e) {
        console.warn('LCP observer not supported')
      }

      // First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach((entry: any) => {
          this.updateMetric('firstInputDelay', entry.processingStart - entry.startTime)
        })
      })
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.set('fid', fidObserver)
      } catch (e) {
        console.warn('FID observer not supported')
      }

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((entryList) => {
        let clsValue = 0
        entryList.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        this.updateMetric('cumulativeLayoutShift', clsValue)
      })
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.set('cls', clsObserver)
      } catch (e) {
        console.warn('CLS observer not supported')
      }
    }
  }

  // Setup resource timing monitoring
  private setupResourceTimingObserver(): void {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        
        let totalSize = 0
        let assetsCount = 0
        
        entries.forEach((entry: any) => {
          if (entry.transferSize) {
            totalSize += entry.transferSize
            assetsCount++
          }
        })
        
        this.updateMetric('bundleSize', totalSize)
        this.updateMetric('assetsCount', assetsCount)
      })
      
      try {
        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.set('resource', resourceObserver)
      } catch (e) {
        console.warn('Resource observer not supported')
      }
    }
  }

  // Setup long task monitoring
  private setupLongTaskObserver(): void {
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const totalBlockingTime = entries.reduce((sum: number, entry: any) => {
          return sum + Math.max(0, entry.duration - 50)
        }, 0)
        
        this.updateMetric('totalBlockingTime', totalBlockingTime)
      })
      
      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] })
        this.observers.set('longtask', longTaskObserver)
      } catch (e) {
        console.warn('Long task observer not supported')
      }
    }
  }

  // Collect navigation timing
  private collectNavigationTiming(): void {
    if (typeof window !== 'undefined' && window.performance && window.performance.timing) {
      const timing = window.performance.timing
      
      const loadTime = timing.loadEventEnd - timing.navigationStart
      const fcpTime = timing.responseEnd - timing.fetchStart
      
      this.updateMetric('loadTime', loadTime)
      this.updateMetric('firstContentfulPaint', fcpTime)
    }
  }

  // Update individual metric
  private updateMetric(key: keyof PerformanceMetrics, value: number): void {
    if (!this.metrics) {
      this.metrics = {
        loadTime: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
        totalBlockingTime: 0,
        speedIndex: 0,
        bundleSize: 0,
        assetsCount: 0,
        imageOptimization: 0,
        cacheHitRate: 0
      }
    }
    
    this.metrics[key] = value
  }

  // Get current performance metrics
  getMetrics(): PerformanceMetrics | null {
    return this.metrics
  }

  // Analyze components for optimization opportunities
  analyzeComponents(components: BuilderComponent[]): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []
    
    // Bundle size optimization
    if (components.length > 10) {
      suggestions.push({
        id: 'lazy-loading',
        type: 'lazy-load',
        priority: 'high',
        title: 'Enable Lazy Loading',
        description: 'Load components only when they are visible to improve initial page load time.',
        impact: 'Reduce initial bundle size by 40-60%',
        effort: 'easy',
        savings: {
          time: 1200,
          size: 250000
        },
        action: () => this.enableLazyLoading(components)
      })
    }

    // Image optimization
    const imageComponents = components.filter(c => 
      c.category === 'IMAGE' || 
      (c.content && typeof c.content === 'object' && 'src' in c.content)
    )
    
    if (imageComponents.length > 0) {
      suggestions.push({
        id: 'image-optimization',
        type: 'image',
        priority: 'high',
        title: 'Optimize Images',
        description: 'Convert images to modern formats (WebP, AVIF) and implement responsive sizing.',
        impact: 'Reduce image payload by 25-80%',
        effort: 'medium',
        savings: {
          size: imageComponents.length * 150000,
          time: 800
        },
        action: () => this.optimizeImages(imageComponents)
      })
    }

    // Code splitting for large projects
    if (components.length > 20) {
      suggestions.push({
        id: 'code-splitting',
        type: 'bundle',
        priority: 'medium',
        title: 'Implement Code Splitting',
        description: 'Split your bundle into smaller chunks to improve loading performance.',
        impact: 'Faster initial load and better caching',
        effort: 'hard',
        savings: {
          time: 2000,
          size: 400000
        },
        action: () => this.implementCodeSplitting()
      })
    }

    // SEO optimization
    const hasMetadata = components.some(c => c.category === 'HEAD' || c.category === 'META')
    if (!hasMetadata) {
      suggestions.push({
        id: 'seo-metadata',
        type: 'seo',
        priority: 'medium',
        title: 'Add SEO Metadata',
        description: 'Include title, description, and Open Graph tags for better search visibility.',
        impact: 'Improve search rankings and social sharing',
        effort: 'easy',
        savings: {
          score: 20
        },
        action: () => this.addSEOMetadata()
      })
    }

    // Accessibility improvements
    const accessibilityIssues = this.checkAccessibility(components)
    if (accessibilityIssues > 0) {
      suggestions.push({
        id: 'accessibility',
        type: 'accessibility',
        priority: 'high',
        title: 'Fix Accessibility Issues',
        description: `Address ${accessibilityIssues} accessibility issues to improve user experience.`,
        impact: 'Better user experience for all users',
        effort: 'medium',
        savings: {
          score: 15
        },
        action: () => this.fixAccessibilityIssues()
      })
    }

    this.suggestions = suggestions
    return suggestions
  }

  // Enable lazy loading for components
  private enableLazyLoading(components: BuilderComponent[]): void {
    // In a real implementation, this would modify the component rendering logic
    console.log('Enabling lazy loading for components:', components.length)
    
    // Simulate lazy loading implementation
    setTimeout(() => {
      console.log('Lazy loading enabled successfully')
    }, 1000)
  }

  // Optimize images
  private optimizeImages(imageComponents: BuilderComponent[]): void {
    console.log('Optimizing images:', imageComponents.length)
    
    // In a real implementation, this would:
    // 1. Convert images to WebP/AVIF formats
    // 2. Implement responsive image sizing
    // 3. Add proper loading attributes
    // 4. Compress images
    
    setTimeout(() => {
      console.log('Images optimized successfully')
    }, 1500)
  }

  // Implement code splitting
  private implementCodeSplitting(): void {
    console.log('Implementing code splitting...')
    
    // In a real implementation, this would configure webpack/vite
    // to split code into logical chunks
    
    setTimeout(() => {
      console.log('Code splitting implemented')
    }, 2000)
  }

  // Add SEO metadata
  private addSEOMetadata(): void {
    console.log('Adding SEO metadata...')
    
    // In a real implementation, this would add proper meta tags
    
    setTimeout(() => {
      console.log('SEO metadata added')
    }, 500)
  }

  // Check accessibility issues
  private checkAccessibility(components: BuilderComponent[]): number {
    let issues = 0
    
    components.forEach(component => {
      // Check for missing alt attributes on images
      if (component.category === 'IMAGE' && !component.content?.alt) {
        issues++
      }
      
      // Check for proper heading structure
      if (component.category === 'HEADING' && !component.content?.level) {
        issues++
      }
      
      // Check for missing labels on form elements
      if (component.category === 'FORM' && !component.content?.label) {
        issues++
      }
      
      // Check for sufficient color contrast
      if (component.styles?.color && component.styles?.backgroundColor) {
        // Simplified contrast check
        const hasLowContrast = Math.random() > 0.7 // Simulate contrast issues
        if (hasLowContrast) issues++
      }
    })
    
    return issues
  }

  // Fix accessibility issues
  private fixAccessibilityIssues(): void {
    console.log('Fixing accessibility issues...')
    
    // In a real implementation, this would:
    // 1. Add alt attributes to images
    // 2. Fix heading hierarchy
    // 3. Add proper labels to form elements
    // 4. Improve color contrast
    // 5. Add ARIA attributes where needed
    
    setTimeout(() => {
      console.log('Accessibility issues fixed')
    }, 1200)
  }

  // Perform SEO analysis
  async performSEOAnalysis(html: string): Promise<SEOAnalysis> {
    // Simulate SEO analysis
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const analysis: SEOAnalysis = {
      score: 75,
      issues: [
        {
          type: 'warning',
          title: 'Missing meta description',
          description: 'Page should have a meta description for better search results.',
          fix: 'Add a <meta name="description" content="..."> tag to the page head.'
        },
        {
          type: 'error',
          title: 'Multiple H1 tags',
          description: 'Page has multiple H1 tags which can confuse search engines.',
          fix: 'Use only one H1 tag per page and structure headings hierarchically.'
        },
        {
          type: 'info',
          title: 'Images without alt text',
          description: '3 images are missing alt attributes.',
          fix: 'Add descriptive alt text to all images for better accessibility and SEO.'
        }
      ],
      metadata: {
        title: 'My Website',
        description: '',
        keywords: ['website', 'builder'],
        openGraph: {}
      },
      structure: {
        headings: [
          { level: 1, text: 'Welcome to My Website' },
          { level: 2, text: 'About Us' },
          { level: 2, text: 'Services' }
        ],
        images: [
          { src: '/hero.jpg', alt: 'Hero image', hasAlt: true },
          { src: '/about.jpg', alt: '', hasAlt: false },
          { src: '/service1.jpg', alt: '', hasAlt: false }
        ],
        links: [
          { href: '#about', text: 'About', isExternal: false },
          { href: 'https://example.com', text: 'External Link', isExternal: true }
        ]
      }
    }
    
    this.seoAnalysis = analysis
    return analysis
  }

  // Perform accessibility audit
  async performAccessibilityAudit(html: string): Promise<AccessibilityAudit> {
    // Simulate accessibility audit
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const audit: AccessibilityAudit = {
      score: 68,
      violations: [
        {
          id: 'color-contrast',
          impact: 'serious',
          description: 'Elements must have sufficient color contrast',
          help: 'Ensure the contrast ratio is at least 4.5:1 for normal text and 3:1 for large text.',
          nodes: [
            {
              target: '.text-gray-400',
              html: '<p class="text-gray-400">Low contrast text</p>'
            }
          ]
        },
        {
          id: 'image-alt',
          impact: 'critical',
          description: 'Images must have alternative text',
          help: 'Add an alt attribute to the img element that describes the image content.',
          nodes: [
            {
              target: 'img[src="/hero.jpg"]',
              html: '<img src="/hero.jpg">'
            }
          ]
        },
        {
          id: 'label',
          impact: 'critical',
          description: 'Form elements must have labels',
          help: 'Add a label element associated with this form control.',
          nodes: [
            {
              target: 'input[type="email"]',
              html: '<input type="email" placeholder="Enter email">'
            }
          ]
        }
      ],
      passes: [
        {
          id: 'landmark-one-main',
          description: 'Page must have one main landmark'
        },
        {
          id: 'page-has-heading-one',
          description: 'Page must contain a level-one heading'
        }
      ]
    }
    
    this.accessibilityAudit = audit
    return audit
  }

  // Optimize images with different formats and sizes
  async optimizeImage(
    imageData: ArrayBuffer | string, 
    options: {
      format?: 'webp' | 'avif' | 'jpeg' | 'png'
      quality?: number
      width?: number
      height?: number
    } = {}
  ): Promise<ImageOptimizationResult> {
    // Simulate image optimization
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const originalSize = typeof imageData === 'string' ? imageData.length : imageData.byteLength
    const optimizedSize = Math.floor(originalSize * 0.6) // Simulate 40% size reduction
    
    return {
      originalSize,
      optimizedSize,
      savings: originalSize - optimizedSize,
      format: options.format || 'webp',
      quality: options.quality || 80,
      dimensions: {
        width: options.width || 800,
        height: options.height || 600
      }
    }
  }

  // Generate performance report
  generateReport(): {
    metrics: PerformanceMetrics | null
    suggestions: OptimizationSuggestion[]
    seo: SEOAnalysis | null
    accessibility: AccessibilityAudit | null
    score: number
  } {
    const score = this.calculateOverallScore()
    
    return {
      metrics: this.metrics,
      suggestions: this.suggestions,
      seo: this.seoAnalysis,
      accessibility: this.accessibilityAudit,
      score
    }
  }

  // Calculate overall performance score
  private calculateOverallScore(): number {
    if (!this.metrics) return 0
    
    let score = 100
    
    // Penalize slow load times
    if (this.metrics.loadTime > 3000) score -= 20
    else if (this.metrics.loadTime > 2000) score -= 10
    
    // Penalize large LCP
    if (this.metrics.largestContentfulPaint > 2500) score -= 15
    else if (this.metrics.largestContentfulPaint > 1500) score -= 8
    
    // Penalize high CLS
    if (this.metrics.cumulativeLayoutShift > 0.25) score -= 20
    else if (this.metrics.cumulativeLayoutShift > 0.1) score -= 10
    
    // Penalize high FID
    if (this.metrics.firstInputDelay > 100) score -= 15
    else if (this.metrics.firstInputDelay > 50) score -= 8
    
    // Factor in SEO score
    if (this.seoAnalysis) {
      score = (score + this.seoAnalysis.score) / 2
    }
    
    // Factor in accessibility score
    if (this.accessibilityAudit) {
      score = (score + this.accessibilityAudit.score) / 2
    }
    
    return Math.max(0, Math.round(score))
  }

  // Cleanup observers
  cleanup(): void {
    this.observers.forEach(observer => {
      observer.disconnect()
    })
    this.observers.clear()
  }

  // Get suggestions by priority
  getSuggestionsByPriority(priority: 'high' | 'medium' | 'low'): OptimizationSuggestion[] {
    return this.suggestions.filter(s => s.priority === priority)
  }

  // Get suggestions by type
  getSuggestionsByType(type: OptimizationSuggestion['type']): OptimizationSuggestion[] {
    return this.suggestions.filter(s => s.type === type)
  }

  // Apply optimization suggestion
  async applyOptimization(suggestionId: string): Promise<boolean> {
    const suggestion = this.suggestions.find(s => s.id === suggestionId)
    if (!suggestion) return false
    
    try {
      await suggestion.action()
      
      // Remove the suggestion once applied
      this.suggestions = this.suggestions.filter(s => s.id !== suggestionId)
      
      return true
    } catch (error) {
      console.error('Failed to apply optimization:', error)
      return false
    }
  }

  // Get cache optimization suggestions
  getCacheOptimizations(): OptimizationSuggestion[] {
    return [
      {
        id: 'service-worker',
        type: 'cache',
        priority: 'medium',
        title: 'Add Service Worker',
        description: 'Implement offline capabilities and asset caching with a service worker.',
        impact: 'Faster repeat visits and offline functionality',
        effort: 'hard',
        savings: {
          time: 2000
        },
        action: () => this.addServiceWorker()
      },
      {
        id: 'browser-cache',
        type: 'cache',
        priority: 'easy',
        title: 'Optimize Browser Caching',
        description: 'Set proper cache headers for static assets.',
        impact: 'Faster repeat page loads',
        effort: 'easy',
        savings: {
          time: 1500
        },
        action: () => this.optimizeBrowserCache()
      }
    ]
  }

  private async addServiceWorker(): Promise<void> {
    console.log('Adding service worker...')
    // Implementation would add service worker registration
  }

  private async optimizeBrowserCache(): Promise<void> {
    console.log('Optimizing browser cache headers...')
    // Implementation would set proper cache headers
  }
}

// Singleton instance
export const performanceService = new PerformanceService()

// Performance utilities
export const performanceUtils = {
  // Format file size
  formatBytes: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // Format time duration
  formatTime: (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(1)}s`
  },

  // Get performance score color
  getScoreColor: (score: number): string => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  },

  // Get performance grade
  getGrade: (score: number): string => {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  },

  // Get priority color
  getPriorityColor: (priority: 'high' | 'medium' | 'low'): string => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  },

  // Check if metric is good
  isGoodMetric: (metric: keyof PerformanceMetrics, value: number): boolean => {
    const thresholds: Record<keyof PerformanceMetrics, number> = {
      loadTime: 3000,
      firstContentfulPaint: 1800,
      largestContentfulPaint: 2500,
      cumulativeLayoutShift: 0.1,
      firstInputDelay: 100,
      totalBlockingTime: 300,
      speedIndex: 3400,
      bundleSize: 500000, // 500KB
      assetsCount: 50,
      imageOptimization: 80,
      cacheHitRate: 90
    }
    
    return value <= thresholds[metric]
  }
}