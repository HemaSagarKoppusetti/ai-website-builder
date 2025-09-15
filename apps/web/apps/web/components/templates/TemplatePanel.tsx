'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layout,
  Sparkles,
  Star,
  Download,
  Eye,
  Plus,
  Crown,
  Heart,
  Search,
  Filter,
  Zap,
  TrendingUp,
  Clock,
  Bookmark,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { useBuilderStore } from '../../lib/store/builder'
import { templateService, templateUtils, WebsiteTemplate } from '../../lib/templates/template-system'
import { TemplateMarketplace } from './TemplateMarketplace'

interface TemplatePanelProps {
  isOpen: boolean
  onClose: () => void
}

export const TemplatePanel: React.FC<TemplatePanelProps> = ({
  isOpen,
  onClose
}) => {
  const { components, replaceComponents } = useBuilderStore()
  const [showMarketplace, setShowMarketplace] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'featured' | 'categories' | 'favorites' | 'recommendations'>('featured')

  // Get templates data
  const featuredTemplates = useMemo(() => templateService.getFeaturedTemplates(6), [])
  const freeTemplates = useMemo(() => templateService.getFreeTemplates().slice(0, 4), [])
  const categories = useMemo(() => templateService.getCategories().slice(0, 8), [])
  const recommendations = useMemo(() => templateService.getRecommendations(components, 4), [components])
  const favoriteTemplates = useMemo(() => 
    Array.from(favorites).map(id => templateService.getTemplate(id)).filter(Boolean) as WebsiteTemplate[], 
    [favorites]
  )

  // Handle template application
  const handleApplyTemplate = async (templateId: string) => {
    const templateComponents = templateService.applyTemplate(templateId)
    if (!templateComponents) {
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
    replaceComponents(templateComponents)
    
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

  // Template card component (compact version)
  const CompactTemplateCard: React.FC<{ template: WebsiteTemplate }> = ({ template }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group"
    >
      {/* Template thumbnail */}
      <div className="relative aspect-video bg-gray-100">
        <img
          src={template.thumbnail}
          alt={template.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = 'https://via.placeholder.com/300x168/f3f4f6/9ca3af?text=Template'
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-1">
            <button
              onClick={() => handleApplyTemplate(template.id)}
              className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              disabled={template.isPremium}
            >
              {template.isPremium ? <Crown size={14} /> : <Plus size={14} />}
            </button>
            <button
              onClick={() => toggleFavorite(template.id)}
              className={`p-1.5 rounded transition-colors ${
                favorites.has(template.id)
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart size={14} fill={favorites.has(template.id) ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Premium badge */}
        {template.isPremium && (
          <div className="absolute top-1 left-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-1.5 py-0.5 rounded text-xs font-medium flex items-center space-x-1">
            <Crown size={10} />
            <span>Pro</span>
          </div>
        )}

        {/* Category badge */}
        <div className={`absolute top-1 right-1 px-1.5 py-0.5 rounded text-xs font-medium ${templateUtils.getCategoryColor(template.category)}`}>
          {template.category}
        </div>
      </div>

      {/* Template info */}
      <div className="p-3">
        <div className="flex items-start justify-between mb-1">
          <h4 className="font-medium text-sm text-gray-900 line-clamp-1">{template.name}</h4>
          <span className="text-xs font-medium text-green-600">
            {templateUtils.formatPrice(template.price)}
          </span>
        </div>

        <p className="text-xs text-gray-600 line-clamp-1 mb-2">{template.description}</p>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Download size={10} />
              <span>{template.stats.downloads > 1000 ? `${Math.round(template.stats.downloads / 1000)}k` : template.stats.downloads}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star size={10} className="text-yellow-500" />
              <span>{template.stats.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  // Category card component
  const CategoryCard: React.FC<{ category: any }> = ({ category }) => (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        setShowMarketplace(true)
        // You could also pass the category to filter by
      }}
      className="w-full p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 text-left group"
    >
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 ${templateUtils.getCategoryColor(category.category)}`}>
        <Layout size={20} />
      </div>
      
      <h4 className="font-medium text-gray-900 mb-1">{category.label}</h4>
      <p className="text-sm text-gray-600">{category.count} templates</p>
      
      <div className="flex items-center text-xs text-blue-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Browse</span>
        <ExternalLink size={12} className="ml-1" />
      </div>
    </motion.button>
  )

  if (!isOpen) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-40 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Templates</h2>
                <p className="text-sm text-gray-600">Start with a professional design</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Plus size={20} className="rotate-45" />
            </button>
          </div>

          {/* Quick actions */}
          <div className="flex space-x-2">
            <button
              onClick={() => setShowMarketplace(true)}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
            >
              <Search size={16} />
              <span>Browse All</span>
            </button>
            
            <button
              onClick={() => window.open('/templates/create', '_blank')}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mt-4 bg-white rounded-lg p-1">
            {[
              { key: 'featured', label: 'Featured', icon: TrendingUp },
              { key: 'categories', label: 'Browse', icon: Layout },
              { key: 'favorites', label: 'Saved', icon: Heart },
              { key: 'recommendations', label: 'For You', icon: Zap }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1 ${
                  activeTab === tab.key
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            {/* Featured Templates */}
            {activeTab === 'featured' && (
              <motion.div
                key="featured"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Popular Templates</h3>
                  <button
                    onClick={() => setShowMarketplace(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <span>View all</span>
                    <ExternalLink size={14} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {featuredTemplates.map(template => (
                    <CompactTemplateCard key={template.id} template={template} />
                  ))}
                </div>

                {/* Free templates section */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Free Templates</h3>
                    <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">Free</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {freeTemplates.map(template => (
                      <CompactTemplateCard key={template.id} template={template} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Categories */}
            {activeTab === 'categories' && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Browse by Category</h3>
                  <button
                    onClick={() => setShowMarketplace(true)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    View all
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {categories.map(category => (
                    <CategoryCard key={category.category} category={category} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Favorites */}
            {activeTab === 'favorites' && (
              <motion.div
                key="favorites"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Saved Templates</h3>
                  <span className="text-sm text-gray-500">{favorites.size} saved</span>
                </div>
                
                {favoriteTemplates.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart size={32} className="text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">No saved templates yet</p>
                    <p className="text-gray-500 text-xs">Save templates by clicking the heart icon</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {favoriteTemplates.map(template => (
                      <CompactTemplateCard key={template.id} template={template} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Recommendations */}
            {activeTab === 'recommendations' && (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Recommended for You</h3>
                  <button
                    onClick={() => {
                      // Refresh recommendations based on current components
                      toast.success('Recommendations updated!')
                    }}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <RefreshCw size={16} className="text-gray-500" />
                  </button>
                </div>
                
                {recommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <Zap size={32} className="text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">No recommendations available</p>
                    <p className="text-gray-500 text-xs">Add some components to get personalized suggestions</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {recommendations.map(template => (
                      <CompactTemplateCard key={template.id} template={template} />
                    ))}
                  </div>
                )}

                {/* Tips section */}
                <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Zap size={16} className="text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Pro Tip</p>
                      <p className="text-xs text-blue-700">Templates adapt to your current design. Add more components to see better recommendations!</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{featuredTemplates.length + freeTemplates.length}+ templates available</span>
            <button
              onClick={() => setShowMarketplace(true)}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
            >
              <span>Explore more</span>
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Template Marketplace Modal */}
      <TemplateMarketplace
        isOpen={showMarketplace}
        onClose={() => setShowMarketplace(false)}
      />
    </>
  )
}