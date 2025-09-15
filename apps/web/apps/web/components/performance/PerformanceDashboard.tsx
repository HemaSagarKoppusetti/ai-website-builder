'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Image,
  Search,
  Eye,
  Shield,
  Gauge,
  BarChart3,
  RefreshCw,
  Play,
  X,
  ArrowRight,
  Info,
  ExternalLink,
  Target,
  Lightbulb,
  Award
} from 'lucide-react'
import { toast } from 'sonner'
import { useBuilderStore } from '../../lib/store/builder'
import {
  performanceService,
  performanceUtils,
  PerformanceMetrics,
  OptimizationSuggestion,
  SEOAnalysis,
  AccessibilityAudit
} from '../../lib/performance/performance-service'

interface PerformanceDashboardProps {
  isOpen: boolean
  onClose: () => void
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  isOpen,
  onClose
}) => {
  const { components } = useBuilderStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'suggestions' | 'seo' | 'accessibility'>('overview')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([])
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis | null>(null)
  const [accessibilityAudit, setAccessibilityAudit] = useState<AccessibilityAudit | null>(null)
  const [overallScore, setOverallScore] = useState(0)

  // Initialize performance monitoring
  useEffect(() => {
    if (isOpen) {
      performanceService.initializeMonitoring()
      runAnalysis()
    }

    return () => {
      performanceService.cleanup()
    }
  }, [isOpen, components])

  // Run comprehensive analysis
  const runAnalysis = async () => {
    setIsAnalyzing(true)
    
    try {
      // Analyze components for optimization opportunities
      const componentSuggestions = performanceService.analyzeComponents(components)
      setSuggestions(componentSuggestions)

      // Get current performance metrics
      const currentMetrics = performanceService.getMetrics()
      setMetrics(currentMetrics)

      // Perform SEO analysis (simulated)
      const seoResults = await performanceService.performSEOAnalysis('<html>...</html>')
      setSeoAnalysis(seoResults)

      // Perform accessibility audit (simulated)
      const a11yResults = await performanceService.performAccessibilityAudit('<html>...</html>')
      setAccessibilityAudit(a11yResults)

      // Generate overall report
      const report = performanceService.generateReport()
      setOverallScore(report.score)

      toast.success('Performance analysis completed!')
    } catch (error) {
      console.error('Analysis failed:', error)
      toast.error('Failed to analyze performance')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Apply optimization suggestion
  const handleApplyOptimization = async (suggestionId: string) => {
    const success = await performanceService.applyOptimization(suggestionId)
    
    if (success) {
      toast.success('Optimization applied successfully!')
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
    } else {
      toast.error('Failed to apply optimization')
    }
  }

  // Performance score component
  const PerformanceScore: React.FC<{ score: number }> = ({ score }) => (
    <div className="relative">
      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={`${score * 2.51} 251`}
          className={performanceUtils.getScoreColor(score)}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className={`text-2xl font-bold ${performanceUtils.getScoreColor(score)}`}>
            {score}
          </div>
          <div className="text-xs text-gray-500">
            {performanceUtils.getGrade(score)}
          </div>
        </div>
      </div>
    </div>
  )

  // Metric card component
  const MetricCard: React.FC<{
    title: string
    value: number
    unit: string
    isGood: boolean
    icon: React.ReactNode
  }> = ({ title, value, unit, isGood, icon }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{title}</span>
        {icon}
      </div>
      <div className="flex items-baseline">
        <span className={`text-2xl font-bold ${isGood ? 'text-green-600' : 'text-red-600'}`}>
          {typeof value === 'number' ? (
            unit === 'ms' ? performanceUtils.formatTime(value) :
            unit === 'bytes' ? performanceUtils.formatBytes(value) :
            value.toLocaleString()
          ) : value}
        </span>
        {unit !== 'ms' && unit !== 'bytes' && (
          <span className="ml-1 text-sm text-gray-500">{unit}</span>
        )}
      </div>
    </div>
  )

  // Suggestion card component
  const SuggestionCard: React.FC<{ suggestion: OptimizationSuggestion }> = ({ suggestion }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${performanceUtils.getPriorityColor(suggestion.priority)}`}>
            {suggestion.priority}
          </div>
          <span className="text-xs text-gray-500 capitalize">{suggestion.type}</span>
        </div>
        <div className="text-xs text-gray-500 capitalize">{suggestion.effort}</div>
      </div>

      <h4 className="font-semibold text-gray-900 mb-2">{suggestion.title}</h4>
      <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-green-600">{suggestion.impact}</span>
        {suggestion.savings && (
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {suggestion.savings.time && (
              <span>⚡ -{performanceUtils.formatTime(suggestion.savings.time)}</span>
            )}
            {suggestion.savings.size && (
              <span>💾 -{performanceUtils.formatBytes(suggestion.savings.size)}</span>
            )}
            {suggestion.savings.score && (
              <span>📈 +{suggestion.savings.score} pts</span>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => handleApplyOptimization(suggestion.id)}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
      >
        <Play size={16} />
        <span>Apply Optimization</span>
      </button>
    </motion.div>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-green-600 rounded-lg">
                <Gauge className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
                <p className="text-gray-600">Optimize your website's performance and user experience</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw size={16} className={isAnalyzing ? 'animate-spin' : ''} />
                <span>{isAnalyzing ? 'Analyzing...' : 'Refresh'}</span>
              </button>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex mt-4 bg-white rounded-lg p-1">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'suggestions', label: 'Suggestions', icon: Lightbulb },
              { key: 'seo', label: 'SEO', icon: Search },
              { key: 'accessibility', label: 'Accessibility', icon: Shield }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                  activeTab === tab.key
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Overall Score */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Performance Score</h3>
                      <p className="text-gray-600">Based on Core Web Vitals, SEO, and Accessibility</p>
                    </div>
                    <PerformanceScore score={overallScore} />
                  </div>
                </div>

                {/* Core Web Vitals */}
                {metrics && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Web Vitals</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <MetricCard
                        title="Largest Contentful Paint"
                        value={metrics.largestContentfulPaint}
                        unit="ms"
                        isGood={performanceUtils.isGoodMetric('largestContentfulPaint', metrics.largestContentfulPaint)}
                        icon={<Eye size={20} className="text-blue-500" />}
                      />
                      <MetricCard
                        title="First Input Delay"
                        value={metrics.firstInputDelay}
                        unit="ms"
                        isGood={performanceUtils.isGoodMetric('firstInputDelay', metrics.firstInputDelay)}
                        icon={<Target size={20} className="text-green-500" />}
                      />
                      <MetricCard
                        title="Cumulative Layout Shift"
                        value={Math.round(metrics.cumulativeLayoutShift * 1000) / 1000}
                        unit=""
                        isGood={performanceUtils.isGoodMetric('cumulativeLayoutShift', metrics.cumulativeLayoutShift)}
                        icon={<TrendingUp size={20} className="text-purple-500" />}
                      />
                    </div>
                  </div>
                )}

                {/* Additional Metrics */}
                {metrics && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <MetricCard
                        title="Load Time"
                        value={metrics.loadTime}
                        unit="ms"
                        isGood={performanceUtils.isGoodMetric('loadTime', metrics.loadTime)}
                        icon={<Clock size={16} className="text-orange-500" />}
                      />
                      <MetricCard
                        title="Bundle Size"
                        value={metrics.bundleSize}
                        unit="bytes"
                        isGood={performanceUtils.isGoodMetric('bundleSize', metrics.bundleSize)}
                        icon={<Download size={16} className="text-red-500" />}
                      />
                      <MetricCard
                        title="Assets Count"
                        value={metrics.assetsCount}
                        unit=""
                        isGood={performanceUtils.isGoodMetric('assetsCount', metrics.assetsCount)}
                        icon={<Image size={16} className="text-indigo-500" />}
                      />
                      <MetricCard
                        title="Total Blocking Time"
                        value={metrics.totalBlockingTime}
                        unit="ms"
                        isGood={performanceUtils.isGoodMetric('totalBlockingTime', metrics.totalBlockingTime)}
                        icon={<AlertTriangle size={16} className="text-yellow-500" />}
                      />
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <Zap size={32} className="text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-900">{suggestions.length}</div>
                    <div className="text-sm text-blue-700">Optimization Opportunities</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <Search size={32} className="text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-900">{seoAnalysis?.score || 0}</div>
                    <div className="text-sm text-green-700">SEO Score</div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <Shield size={32} className="text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-900">{accessibilityAudit?.score || 0}</div>
                    <div className="text-sm text-purple-700">Accessibility Score</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Suggestions Tab */}
            {activeTab === 'suggestions' && (
              <motion.div
                key="suggestions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Optimization Suggestions</h3>
                  <div className="text-sm text-gray-600">
                    {suggestions.length} suggestions found
                  </div>
                </div>

                {suggestions.length === 0 ? (
                  <div className="text-center py-12">
                    <Award size={48} className="text-green-500 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Great job!</h4>
                    <p className="text-gray-600">No optimization suggestions at this time.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {suggestions.map(suggestion => (
                      <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <motion.div
                key="seo"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">SEO Analysis</h3>
                  {seoAnalysis && (
                    <div className={`text-2xl font-bold ${performanceUtils.getScoreColor(seoAnalysis.score)}`}>
                      {seoAnalysis.score}/100
                    </div>
                  )}
                </div>

                {seoAnalysis ? (
                  <>
                    {/* SEO Issues */}
                    <div className="bg-white rounded-lg border border-gray-200">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <h4 className="font-medium text-gray-900">Issues Found</h4>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {seoAnalysis.issues.map((issue, index) => (
                          <div key={index} className="px-4 py-3 flex items-start space-x-3">
                            <div className={`p-1 rounded-full ${
                              issue.type === 'error' ? 'bg-red-100' :
                              issue.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                            }`}>
                              <AlertTriangle size={12} className={
                                issue.type === 'error' ? 'text-red-600' :
                                issue.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                              } />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{issue.title}</h5>
                              <p className="text-sm text-gray-600 mb-1">{issue.description}</p>
                              <p className="text-xs text-green-600">{issue.fix}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Page Structure */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Headings</h4>
                        <div className="space-y-2">
                          {seoAnalysis.structure.headings.map((heading, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <span className="text-gray-500">H{heading.level}</span>
                              <span className="text-gray-900">{heading.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Images</h4>
                        <div className="space-y-2">
                          {seoAnalysis.structure.images.map((image, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              {image.hasAlt ? (
                                <CheckCircle size={16} className="text-green-500" />
                              ) : (
                                <AlertTriangle size={16} className="text-red-500" />
                              )}
                              <span className="text-gray-600 truncate">{image.src}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Links</h4>
                        <div className="space-y-2">
                          {seoAnalysis.structure.links.map((link, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              {link.isExternal ? (
                                <ExternalLink size={16} className="text-blue-500" />
                              ) : (
                                <ArrowRight size={16} className="text-green-500" />
                              )}
                              <span className="text-gray-900 truncate">{link.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Search size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Run analysis to see SEO insights</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Accessibility Tab */}
            {activeTab === 'accessibility' && (
              <motion.div
                key="accessibility"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Accessibility Audit</h3>
                  {accessibilityAudit && (
                    <div className={`text-2xl font-bold ${performanceUtils.getScoreColor(accessibilityAudit.score)}`}>
                      {accessibilityAudit.score}/100
                    </div>
                  )}
                </div>

                {accessibilityAudit ? (
                  <>
                    {/* Violations */}
                    <div className="bg-white rounded-lg border border-gray-200">
                      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Violations</h4>
                        <span className="text-sm text-red-600">
                          {accessibilityAudit.violations.length} issues
                        </span>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {accessibilityAudit.violations.map((violation, index) => (
                          <div key={index} className="px-4 py-4">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{violation.description}</h5>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                violation.impact === 'critical' ? 'bg-red-100 text-red-800' :
                                violation.impact === 'serious' ? 'bg-orange-100 text-orange-800' :
                                violation.impact === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {violation.impact}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{violation.help}</p>
                            <div className="text-xs text-gray-500">
                              Affects {violation.nodes.length} element{violation.nodes.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Passes */}
                    <div className="bg-white rounded-lg border border-gray-200">
                      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Passed Checks</h4>
                        <span className="text-sm text-green-600">
                          {accessibilityAudit.passes.length} passed
                        </span>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {accessibilityAudit.passes.map((pass, index) => (
                          <div key={index} className="px-4 py-3 flex items-center space-x-3">
                            <CheckCircle size={16} className="text-green-500" />
                            <span className="text-sm text-gray-900">{pass.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Shield size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Run analysis to see accessibility insights</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}