'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  Minimize2,
  RotateCw,
  Globe,
  Share2,
  Download,
  Eye
} from 'lucide-react'

export default function PreviewPage() {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  const deviceSizes = {
    mobile: { width: '375px', height: '667px' },
    tablet: { width: '768px', height: '1024px' },
    desktop: { width: '1200px', height: '800px' }
  }

  const getCurrentSize = () => {
    const size = deviceSizes[device]
    return orientation === 'landscape' && device !== 'desktop' 
      ? { width: size.height, height: size.width }
      : size
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/builder/complete" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Builder
            </Link>
            
            <div className="h-6 w-px bg-gray-300" />
            
            <h1 className="text-lg font-semibold text-gray-900">Website Preview</h1>
          </div>

          {/* Device Controls */}
          <div className="flex items-center space-x-4">
            {/* Device Selector */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setDevice('mobile')}
                className={`p-2 rounded ${device === 'mobile' ? 'bg-white shadow-sm' : ''}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevice('tablet')}
                className={`p-2 rounded ${device === 'tablet' ? 'bg-white shadow-sm' : ''}`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevice('desktop')}
                className={`p-2 rounded ${device === 'desktop' ? 'bg-white shadow-sm' : ''}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>

            {/* Orientation Toggle */}
            {device !== 'desktop' && (
              <button
                onClick={() => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Toggle Orientation"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded" title="Share">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded" title="Download">
                <Download className="w-4 h-4" />
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>Publish</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div 
          className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
          style={getCurrentSize()}
        >
          {/* Device Frame (for mobile/tablet) */}
          {device !== 'desktop' && (
            <div className="bg-gray-900 text-white px-4 py-2 text-sm flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                <span className="text-gray-300">demo-website.com</span>
                <Eye className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          )}

          {/* Website Content */}
          <div className="h-full overflow-y-auto">
            {/* Demo Website */}
            <DemoWebsite />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Device: {device} ({orientation})</span>
            <span>Size: {getCurrentSize().width} × {getCurrentSize().height}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Live Preview</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Demo Website Component
function DemoWebsite() {
  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to Our
            <span className="block text-yellow-300">Amazing Website</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Built with AI Website Builder - Professional, Fast, and Beautiful
          </p>
          <div className="space-x-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Get Started
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Amazing Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mobile First</h3>
              <p className="text-gray-600">Fully responsive design that works on all devices</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Reach</h3>
              <p className="text-gray-600">Fast loading worldwide with CDN integration</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Beautiful Design</h3>
              <p className="text-gray-600">Modern and professional appearance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-gray-600">Templates</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of satisfied customers today!</p>
          <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
            Start Your Journey
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Demo Website</h3>
              <p className="text-gray-400">Built with AI Website Builder</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Home</li>
                <li>About</li>
                <li>Services</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Community</li>
                <li>Status</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Press</li>
                <li>Blog</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Demo Website. Built with AI Website Builder.</p>
          </div>
        </div>
      </div>
    </div>
  )
}