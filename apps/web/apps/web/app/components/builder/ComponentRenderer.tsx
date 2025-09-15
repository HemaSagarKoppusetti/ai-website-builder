'use client'

import React from 'react'
import { BuilderComponent } from '../../../lib/store/builder'
import { motion } from 'framer-motion'

interface ComponentRendererProps {
  component: BuilderComponent
  isPreview?: boolean
}

export function ComponentRenderer({ component, isPreview = false }: ComponentRendererProps) {
  // Base styles combining default and custom styles
  const combinedStyles = {
    ...component.styles,
    opacity: component.isHidden && !isPreview ? 0.3 : 1,
    pointerEvents: component.isLocked && !isPreview ? 'none' : 'auto'
  }

  // Render based on component category
  switch (component.category) {
    case 'HERO':
      return (
        <div 
          className="relative overflow-hidden"
          style={combinedStyles}
        >
          {component.content.backgroundImage && (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${component.content.backgroundImage})`,
                filter: 'brightness(0.7)'
              }}
            />
          )}
          <div className="relative z-10 max-w-4xl mx-auto text-center py-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              {component.content.title || 'Hero Title'}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl mb-8 text-gray-200"
            >
              {component.content.subtitle || 'Hero subtitle goes here'}
            </motion.p>

            {component.content.ctaText && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                {component.content.ctaText}
              </motion.button>
            )}
          </div>
        </div>
      )

    case 'TEXT':
      const TextTag = component.content.type === 'heading' ? 'h2' : 'p'
      return (
        <div style={combinedStyles}>
          <TextTag
            className={`
              ${component.content.type === 'heading' ? 'text-2xl font-bold' : 'text-base'}
              leading-relaxed
            `}
            style={{
              fontSize: component.styles.fontSize,
              lineHeight: component.styles.lineHeight,
              color: component.styles.color,
              textAlign: component.styles.textAlign
            }}
          >
            {component.content.text || 'Your text content goes here'}
          </TextTag>
        </div>
      )

    case 'BUTTON':
      return (
        <div style={{ display: 'inline-block' }}>
          <button
            className={`
              inline-flex items-center justify-center font-medium transition-all duration-200
              ${component.content.variant === 'primary' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                component.content.variant === 'secondary' ? 'bg-gray-200 hover:bg-gray-300 text-gray-900' :
                'border border-gray-300 hover:border-gray-400 text-gray-700'}
            `}
            style={combinedStyles}
          >
            {component.content.text || 'Button Text'}
          </button>
        </div>
      )

    case 'IMAGE':
      return (
        <div style={combinedStyles} className="overflow-hidden">
          <img
            src={component.content.src || '/placeholder-image.jpg'}
            alt={component.content.alt || 'Image'}
            className="w-full h-auto object-cover"
            style={{
              borderRadius: component.styles.borderRadius,
              width: component.content.width || '100%',
              height: component.content.height || 'auto',
              objectFit: component.styles.objectFit || 'cover'
            }}
          />
        </div>
      )

    case 'CARD':
      return (
        <div
          className="bg-white rounded-lg overflow-hidden transition-shadow hover:shadow-lg"
          style={combinedStyles}
        >
          {component.content.image && (
            <div className="aspect-video bg-gray-200">
              <img
                src={component.content.image}
                alt={component.content.title || 'Card image'}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {component.content.title || 'Card Title'}
            </h3>
            
            <p className="text-gray-600">
              {component.content.description || 'Card description goes here.'}
            </p>
            
            {component.content.ctaText && (
              <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium">
                {component.content.ctaText}
              </button>
            )}
          </div>
        </div>
      )

    case 'GRID':
      return (
        <div
          className={`
            grid gap-6
            ${component.content.columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
              component.content.columns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
              component.content.columns === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
              'grid-cols-1 md:grid-cols-2'}
          `}
          style={combinedStyles}
        >
          {component.children?.map((child, index) => (
            <ComponentRenderer key={child.id} component={child} isPreview={isPreview} />
          ))}
        </div>
      )

    case 'NAVBAR':
      return (
        <nav 
          className="flex items-center justify-between py-4 px-6"
          style={combinedStyles}
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
            <span className="text-xl font-bold">
              {component.content.brand || 'Brand'}
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {component.content.links?.map((link: any, index: number) => (
              <a
                key={index}
                href={link.href || '#'}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {link.text}
              </a>
            )) || (
              <>
                <a href="#" className="text-gray-700 hover:text-blue-600">Home</a>
                <a href="#" className="text-gray-700 hover:text-blue-600">About</a>
                <a href="#" className="text-gray-700 hover:text-blue-600">Services</a>
                <a href="#" className="text-gray-700 hover:text-blue-600">Contact</a>
              </>
            )}
          </div>
          
          <button className="md:hidden p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>
      )

    case 'FOOTER':
      return (
        <footer 
          className="bg-gray-900 text-white py-12 px-6"
          style={combinedStyles}
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">
                  {component.content.brand || 'Brand'}
                </h4>
                <p className="text-gray-400">
                  {component.content.description || 'Company description goes here.'}
                </p>
              </div>
              
              {component.content.sections?.map((section: any, index: number) => (
                <div key={index}>
                  <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
                  <ul className="space-y-2">
                    {section.links?.map((link: any, linkIndex: number) => (
                      <li key={linkIndex}>
                        <a href={link.href || '#'} className="text-gray-400 hover:text-white">
                          {link.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )) || (
                <>
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Company</h4>
                    <ul className="space-y-2 text-gray-400">
                      <li><a href="#">About</a></li>
                      <li><a href="#">Careers</a></li>
                      <li><a href="#">Blog</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Support</h4>
                    <ul className="space-y-2 text-gray-400">
                      <li><a href="#">Help Center</a></li>
                      <li><a href="#">Contact</a></li>
                      <li><a href="#">Privacy</a></li>
                    </ul>
                  </div>
                </>
              )}
            </div>
            
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
              <p>&copy; 2024 {component.content.brand || 'Brand'}. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )

    case 'TESTIMONIAL':
      return (
        <div 
          className="bg-white p-6 rounded-lg shadow-md"
          style={combinedStyles}
        >
          <div className="flex items-center mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${i < (component.content.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          
          <blockquote className="text-gray-700 mb-4">
            "{component.content.quote || 'This is a testimonial quote. It should be inspiring and build trust.'}"
          </blockquote>
          
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
            <div>
              <div className="font-semibold">{component.content.author || 'John Doe'}</div>
              <div className="text-gray-500 text-sm">{component.content.title || 'CEO, Company'}</div>
            </div>
          </div>
        </div>
      )

    case 'PRICING':
      return (
        <div 
          className="bg-white border rounded-lg p-6 text-center"
          style={combinedStyles}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {component.content.title || 'Plan Name'}
          </h3>
          
          <div className="text-4xl font-bold text-blue-600 mb-6">
            ${component.content.price || '29'}
            <span className="text-base font-normal text-gray-500">/month</span>
          </div>
          
          <ul className="space-y-3 mb-8">
            {component.content.features?.map((feature: string, index: number) => (
              <li key={index} className="flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            )) || (
              <>
                <li className="flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Feature 1
                </li>
                <li className="flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Feature 2
                </li>
              </>
            )}
          </ul>
          
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
            {component.content.ctaText || 'Get Started'}
          </button>
        </div>
      )

    case 'CONTACT_FORM':
      return (
        <div 
          className="bg-white p-6 rounded-lg shadow-md"
          style={combinedStyles}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            {component.content.title || 'Contact Us'}
          </h3>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea 
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Your message..."
              ></textarea>
            </div>
            
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {component.content.submitText || 'Send Message'}
            </button>
          </form>
        </div>
      )

    default:
      return (
        <div 
          className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500"
          style={combinedStyles}
        >
          <div className="text-2xl mb-2">📦</div>
          <div className="font-medium">{component.category}</div>
          <div className="text-sm">{component.name}</div>
        </div>
      )
  }
}