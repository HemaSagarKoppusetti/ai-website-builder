'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Star,
  Download,
  Crown,
  Heart,
  Grid3x3,
  List,
  Sparkles,
  Layout,
  ShoppingBag,
  Briefcase,
  Camera,
  Coffee,
  GraduationCap
} from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  isPremium: boolean
  price?: number
  rating: number
  downloads: number
  tags: string[]
}

const templates: Template[] = [
  {
    id: 'corporate-pro',
    name: 'Corporate Pro',
    description: 'Professional corporate website with clean design and modern layout',
    category: 'Business',
    thumbnail: 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Corporate+Pro',
    isPremium: false,
    rating: 4.8,
    downloads: 1247,
    tags: ['professional', 'corporate', 'clean']
  },
  {
    id: 'creative-portfolio',
    name: 'Creative Portfolio',
    description: 'Stunning portfolio template for designers and creative professionals',
    category: 'Portfolio',
    thumbnail: 'https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Creative+Portfolio',
    isPremium: true,
    price: 29,
    rating: 4.9,
    downloads: 892,
    tags: ['creative', 'portfolio', 'modern']
  },
  {
    id: 'modern-store',
    name: 'Modern Store',
    description: 'Complete e-commerce template with shopping cart and checkout',
    category: 'E-commerce',
    thumbnail: 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=Modern+Store',
    isPremium: true,
    price: 49,
    rating: 4.7,
    downloads: 2156,
    tags: ['ecommerce', 'shop', 'modern']
  },
  {
    id: 'saas-landing',
    name: 'SaaS Landing Pro',
    description: 'High-converting SaaS landing page with pricing tables',
    category: 'Landing Page',
    thumbnail: 'https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=SaaS+Landing',
    isPremium: true,
    price: 39,
    rating: 4.9,
    downloads: 3421,
    tags: ['saas', 'landing', 'conversion']
  },
  {
    id: 'restaurant-elegant',
    name: 'Restaurant Elegant',
    description: 'Elegant restaurant template with menu and reservation system',
    category: 'Restaurant',
    thumbnail: 'https://via.placeholder.com/400x300/EF4444/FFFFFF?text=Restaurant+Elegant',
    isPremium: false,
    rating: 4.6,
    downloads: 756,
    tags: ['restaurant', 'elegant', 'food']
  },
  {
    id: 'agency-creative',
    name: 'Agency Creative',
    description: 'Creative agency template with portfolio showcase',
    category: 'Agency',
    thumbnail: 'https://via.placeholder.com/400x300/6366F1/FFFFFF?text=Agency+Creative',
    isPremium: true,
    price: 35,
    rating: 4.8,
    downloads: 1534,
    tags: ['agency', 'creative', 'showcase']
  },
  {
    id: 'blog-minimal',
    name: 'Minimal Blog',
    description: 'Clean and minimal blog template with reading focus',
    category: 'Blog',
    thumbnail: 'https://via.placeholder.com/400x300/6B7280/FFFFFF?text=Minimal+Blog',
    isPremium: false,
    rating: 4.5,
    downloads: 982,
    tags: ['blog', 'minimal', 'clean']
  },
  {
    id: 'startup-modern',
    name: 'Startup Modern',
    description: 'Modern startup template with team and feature sections',
    category: 'Startup',
    thumbnail: 'https://via.placeholder.com/400x300/EC4899/FFFFFF?text=Startup+Modern',
    isPremium: true,
    price: 42,
    rating: 4.7,
    downloads: 1823,
    tags: ['startup', 'modern', 'team']
  }
]

const categories = [
  { name: 'All', icon: Layout, count: templates.length },
  { name: 'Business', icon: Briefcase, count: templates.filter(t => t.category === 'Business').length },
  { name: 'Portfolio', icon: Camera, count: templates.filter(t => t.category === 'Portfolio').length },
  { name: 'E-commerce', icon: ShoppingBag, count: templates.filter(t => t.category === 'E-commerce').length },
  { name: 'Restaurant', icon: Coffee, count: templates.filter(t => t.category === 'Restaurant').length },
  { name: 'Landing Page', icon: Sparkles, count: templates.filter(t => t.category === 'Landing Page').length },
  { name: 'Agency', icon: GraduationCap, count: templates.filter(t => t.category === 'Agency').length }
]

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory
    const matchesPremium = !showPremiumOnly || template.isPremium
    
    return matchesSearch && matchesCategory && matchesPremium
  })

  const toggleFavorite = (templateId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId)
    } else {
      newFavorites.add(templateId)
    }
    setFavorites(newFavorites)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
              
              <div className="h-6 w-px bg-gray-300" />
              
              <h1 className="text-xl font-semibold text-gray-900">Template Gallery</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

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
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedCategory === category.name
                          ? 'bg-blue-100 text-blue-700'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon size={16} />
                        <span>{category.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{category.count}</span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Filters</h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showPremiumOnly}
                    onChange={(e) => setShowPremiumOnly(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Premium only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedCategory === 'All' ? 'All Templates' : `${selectedCategory} Templates`}
              </h2>
              <p className="text-gray-600">
                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Templates Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredTemplates.map((template) => (
                <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group">
                  {/* Template Image */}
                  <div className="relative aspect-[4/3] bg-gray-100">
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <Link 
                          href="/preview"
                          className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <Eye size={16} />
                          <span>Preview</span>
                        </Link>
                        <Link
                          href="/builder/complete"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                        >
                          <Sparkles size={16} />
                          <span>Use</span>
                        </Link>
                      </div>
                    </div>

                    {/* Premium Badge */}
                    {template.isPremium && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        <Crown size={10} />
                        <span>Premium</span>
                      </div>
                    )}

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(template.id)}
                      className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                        favorites.has(template.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart size={16} fill={favorites.has(template.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Template Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <span className="text-sm font-medium text-green-600">
                        {template.isPremium ? `$${template.price}` : 'Free'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Star size={12} className="text-yellow-500" />
                          <span>{template.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Download size={12} />
                          <span>{template.downloads.toLocaleString()}</span>
                        </div>
                      </div>
                      <span className="text-blue-600 text-xs px-2 py-1 bg-blue-100 rounded-full">
                        {template.category}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <Search size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}