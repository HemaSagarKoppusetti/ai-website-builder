'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Grid3x3,
  List,
  Star,
  Download,
  Eye,
  Tag,
  User,
  Crown,
  ChevronDown,
  X,
  Heart,
  ExternalLink,
  Zap,
  TrendingUp,
  Clock,
  DollarSign,
  Check,
  Plus,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import { useBuilderStore } from '../../lib/store/builder'
import { templateService, templateUtils, WebsiteTemplate, TemplateFilter, TemplateCategory } from '../../lib/templates/template-system'

interface TemplateMarketplaceProps {
  isOpen: boolean
  onClose: () => void
}

export const TemplateMarketplace: React.FC<TemplateMarketplaceProps> = ({
  isOpen,
  onClose
}) => {
  const { replaceComponents } = useBuilderStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<WebsiteTemplate | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [activePreview, setActivePreview] = useState<string | null>(null)

  // Filters state
  const [filters, setFilters] = useState<TemplateFilter>({
    sortBy: 'popular'
  })

  // Get templates and categories
  const templates = useMemo(() => {
    if (searchQuery) {
      return templateService.searchTemplates(searchQuery)
    }
    return templateService.getTemplates(filters)
  }, [searchQuery, filters])

  const categories = useMemo(() => templateService.getCategories(), [])
  const popularTags = useMemo(() => templateService.getPopularTags(12), [])

  // Handle template application
  const handleApplyTemplate = async (templateId: string) => {
    const components = templateService.applyTemplate(templateId)
    if (!components) {
      toast.error('Failed to apply template')
      return
    }

    // Update download count
    const template = templateService.getTemplate(templateId)
    if (template) {
      templateService.updateTemplateStats(templateId, {
        downloads: template.stats.downloads + 1
      })
    }

    // Replace all components in the builder
    replaceComponents(components)
    
    toast.success(`Template "${template?.name}" applied successfully!`)
    onClose()
  }

  // Handle favorite toggle
  const toggleFavorite = (templateId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId)
      toast.success('Removed from favorites')
    } else {
      newFavorites.add(templateId)
      toast.success('Added to favorites')
    }
    setFavorites(newFavorites)
  }

  // Filter handlers
  const updateFilter = (key: keyof TemplateFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ sortBy: 'popular' })
    setSearchQuery('')
  }

  // Template card component
  const TemplateCard: React.FC<{ template: WebsiteTemplate; isPreview?: boolean }> = ({ 
    template, 
    isPreview = false 
  }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 ${
        isPreview ? 'h-full' : 'h-auto'
      }`}
    >
      {/* Template thumbnail */}
      <div className="relative aspect-video bg-gray-100">
        <img
          src={template.thumbnail}
          alt={template.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = 'https://via.placeholder.com/400x225/f3f4f6/9ca3af?text=Template+Preview'
          }}
        />
        
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
          <div className="flex space-x-2">
            <button
              onClick={() => setActivePreview(template.id)}
              className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 flex items-center space-x-2 transition-colors"
            >
              <Eye size={16} />
              <span>Preview</span>
            </button>
            
            {!template.isPremium && (
              <button
                onClick={() => handleApplyTemplate(template.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
              >
                <Plus size={16} />
                <span>Use</span>
              </button>
            )}
          </div>
        </div>

        {/* Premium badge */}
        {template.isPremium && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <Crown size={12} />
            <span>Premium</span>
          </div>
        )}

        {/* Category badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${templateUtils.getCategoryColor(template.category)}`}>
          {template.category}
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleFavorite(template.id)
          }}
          className={`absolute bottom-2 right-2 p-2 rounded-full transition-colors ${
            favorites.has(template.id)
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-400 hover:text-red-500'
          }`}
        >
          <Heart size={16} fill={favorites.has(template.id) ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Template info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{template.name}</h3>
          <span className="text-sm font-medium text-green-600">
            {templateUtils.formatPrice(template.price)}
          </span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{template.description}</p>

        {/* Author info */}
        <div className="flex items-center space-x-2 mb-3">
          {template.author.avatar ? (
            <img
              src={template.author.avatar}
              alt={template.author.name}
              className="w-5 h-5 rounded-full"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
              <User size={12} className="text-gray-500" />
            </div>
          )}
          <span className="text-xs text-gray-500">{template.author.name}</span>
          {template.author.verified && (
            <Check size={12} className="text-blue-500" />
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Download size={12} />
              <span>{template.stats.downloads.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star size={12} className="text-yellow-500" />
              <span>{template.stats.rating.toFixed(1)}</span>
            </div>
          </div>
          <span className="text-gray-400">
            {new Date(template.updatedAt).toLocaleDateString()}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{template.tags.length - 3}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex space-x-2">
          {template.isPremium ? (
            <button
              disabled
              className="flex-1 px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg text-sm font-medium cursor-not-allowed opacity-60 flex items-center justify-center space-x-1"
            >
              <Crown size={14} />
              <span>Premium</span>
            </button>
          ) : (
            <button
              onClick={() => handleApplyTemplate(template.id)}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors flex items-center justify-center space-x-1"
            >
              <Plus size={14} />
              <span>Use Template</span>
            </button>
          )}
          
          <button
            onClick={() => setActivePreview(template.id)}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors flex items-center justify-center"
          >
            <Eye size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Template Marketplace</h2>
                <p className="text-gray-600">Choose from {templates.length} professional templates</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Search and controls */}
          <div className="mt-4 flex items-center space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* View mode toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
              >
                <List size={20} />
              </button>
            </div>

            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter size={20} />
              <span>Filters</span>
              <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filters panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-white rounded-lg border border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={filters.category || ''}
                      onChange={(e) => updateFilter('category', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map(({ category, label, count }) => (
                        <option key={category} value={category}>
                          {label} ({count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Premium filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={filters.isPremium === undefined ? '' : filters.isPremium.toString()}
                      onChange={(e) => updateFilter('isPremium', e.target.value === '' ? undefined : e.target.value === 'true')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Templates</option>
                      <option value="false">Free Only</option>
                      <option value="true">Premium Only</option>
                    </select>
                  </div>

                  {/* Sort filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={filters.sortBy || 'popular'}
                      onChange={(e) => updateFilter('sortBy', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="popular">Most Popular</option>
                      <option value="newest">Newest</option>
                      <option value="rating">Highest Rated</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>

                  {/* Clear filters */}
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                {/* Popular tags */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Popular Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map(({ tag, count }) => (
                      <button
                        key={tag}
                        onClick={() => {
                          const currentTags = filters.tags || []
                          const newTags = currentTags.includes(tag)
                            ? currentTags.filter(t => t !== tag)
                            : [...currentTags, tag]
                          updateFilter('tags', newTags.length > 0 ? newTags : undefined)
                        }}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          filters.tags?.includes(tag)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {tag} ({count})
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {templates.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Search size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : (
            <div className="p-6 h-full overflow-y-auto">
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                <AnimatePresence>
                  {templates.map(template => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Preview modal */}
      <AnimatePresence>
        {activePreview && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Preview header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Template Preview</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const template = templateService.getTemplate(activePreview)
                      if (template && !template.isPremium) {
                        handleApplyTemplate(activePreview)
                        setActivePreview(null)
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={templateService.getTemplate(activePreview)?.isPremium}
                  >
                    Use Template
                  </button>
                  <button
                    onClick={() => setActivePreview(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Preview content */}
              <div className="flex-1 bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Eye size={48} className="mx-auto mb-4" />
                  <p>Template preview would be rendered here</p>
                  <p className="text-sm">In a real app, this would show the actual template</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}