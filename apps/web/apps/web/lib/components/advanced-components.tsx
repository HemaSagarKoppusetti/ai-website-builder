'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart, 
  Star, 
  Heart, 
  Play, 
  Pause,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  User,
  CreditCard,
  Shield,
  Truck,
  Award
} from 'lucide-react'

// Advanced Form Component with Validation
export interface AdvancedFormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file' | 'date'
  label: string
  placeholder?: string
  required?: boolean
  validation?: RegExp
  options?: { value: string; label: string }[]
}

export interface AdvancedFormProps {
  title?: string
  description?: string
  fields: AdvancedFormField[]
  submitText?: string
  onSubmit?: (data: Record<string, any>) => void
  theme?: 'light' | 'dark' | 'gradient'
}

export function AdvancedForm({ 
  title = 'Contact Form',
  description,
  fields,
  submitText = 'Submit',
  onSubmit,
  theme = 'light'
}: AdvancedFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateField = (field: AdvancedFormField, value: any) => {
    if (field.required && (!value || value.toString().trim() === '')) {
      return `${field.label} is required`
    }
    
    if (field.validation && value && !field.validation.test(value.toString())) {
      return `${field.label} format is invalid`
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    fields.forEach(field => {
      const error = validateField(field, formData[field.id])
      if (error) {
        newErrors[field.id] = error
      }
    })
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true)
      try {
        await onSubmit?.(formData)
      } catch (error) {
        console.error('Form submission error:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const themeClasses = {
    light: 'bg-white border-gray-200',
    dark: 'bg-gray-800 border-gray-700 text-white',
    gradient: 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-8 border rounded-xl shadow-lg ${themeClasses[theme]}`}
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        {description && (
          <p className="text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            
            {field.type === 'textarea' ? (
              <textarea
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors[field.id] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={field.placeholder}
                value={formData[field.id] || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                rows={4}
              />
            ) : field.type === 'select' ? (
              <select
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors[field.id] ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData[field.id] || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
              >
                <option value="">Select {field.label}</option>
                {field.options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'checkbox' ? (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={field.id}
                  checked={formData[field.id] || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={field.id} className="ml-2 text-sm">
                  {field.placeholder || field.label}
                </label>
              </div>
            ) : (
              <input
                type={field.type}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors[field.id] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={field.placeholder}
                value={formData[field.id] || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
              />
            )}
            
            {errors[field.id] && (
              <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {isSubmitting ? 'Submitting...' : submitText}
        </button>
      </form>
    </motion.div>
  )
}

// E-commerce Product Card
export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  badge?: string
  inStock: boolean
}

export interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
  onToggleFavorite?: (productId: string) => void
  isFavorite?: boolean
}

export function ProductCard({ product, onAddToCart, onToggleFavorite, isFavorite }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div className="aspect-square bg-gray-100 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3">
          {product.badge && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-1">
              -{discount}%
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite?.(product.id)
          }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
            isFavorite 
              ? 'bg-red-500 text-white' 
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Actions */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-x-3 bottom-3"
            >
              <button
                onClick={() => onAddToCart?.(product)}
                disabled={!product.inStock}
                className={`w-full font-semibold py-2 px-4 rounded-lg transition-colors ${
                  product.inStock
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-400 cursor-not-allowed text-white'
                }`}
              >
                <ShoppingCart className="h-4 w-4 inline mr-2" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
        
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            ({product.reviews})
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              ${product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
          
          {!product.inStock && (
            <span className="text-sm text-red-600 font-medium">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Interactive Carousel
export interface CarouselItem {
  id: string
  image: string
  title?: string
  description?: string
  link?: string
}

export interface CarouselProps {
  items: CarouselItem[]
  autoPlay?: boolean
  interval?: number
  showDots?: boolean
  showArrows?: boolean
}

export function InteractiveCarousel({ 
  items, 
  autoPlay = true, 
  interval = 5000,
  showDots = true,
  showArrows = true 
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % items.length)
  }

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(nextSlide, interval)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, interval])

  return (
    <div className="relative w-full bg-gray-900 rounded-xl overflow-hidden">
      <div className="relative h-64 md:h-96">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img
              src={items[currentIndex].image}
              alt={items[currentIndex].title}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay Content */}
            {(items[currentIndex].title || items[currentIndex].description) && (
              <div className="absolute inset-0 bg-black/40 flex items-end">
                <div className="p-6 text-white">
                  {items[currentIndex].title && (
                    <h3 className="text-2xl font-bold mb-2">
                      {items[currentIndex].title}
                    </h3>
                  )}
                  {items[currentIndex].description && (
                    <p className="text-gray-200">
                      {items[currentIndex].description}
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {showArrows && items.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Play/Pause Button */}
        {autoPlay && (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Dots Indicator */}
      {showDots && items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Animated Counter
export interface CounterProps {
  end: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
}

export function AnimatedCounter({ end, duration = 2000, prefix = '', suffix = '', decimals = 0 }: CounterProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    let animationId: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const currentCount = easeOutCubic * end
      
      setCount(currentCount)

      if (progress < 1) {
        animationId = requestAnimationFrame(animate)
      }
    }

    animationId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationId)
  }, [isVisible, end, duration])

  return (
    <div ref={elementRef} className="text-4xl font-bold">
      {prefix}{count.toFixed(decimals)}{suffix}
    </div>
  )
}

// Progress Steps
export interface Step {
  id: string
  title: string
  description?: string
  completed?: boolean
  active?: boolean
}

export interface ProgressStepsProps {
  steps: Step[]
  currentStep?: number
  orientation?: 'horizontal' | 'vertical'
}

export function ProgressSteps({ steps, currentStep = 0, orientation = 'horizontal' }: ProgressStepsProps) {
  return (
    <div className={`flex ${orientation === 'vertical' ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
      {steps.map((step, index) => {
        const isCompleted = step.completed || index < currentStep
        const isActive = step.active || index === currentStep
        const isLast = index === steps.length - 1

        return (
          <div key={step.id} className={`flex ${orientation === 'vertical' ? 'items-start' : 'flex-col items-center'} ${orientation === 'horizontal' ? 'flex-1' : ''}`}>
            <div className={`flex items-center ${orientation === 'vertical' ? '' : 'flex-col'}`}>
              {/* Step Circle */}
              <div className={`
                relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                ${isCompleted 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : isActive 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }
              `}>
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              {/* Step Content */}
              <div className={`${orientation === 'vertical' ? 'ml-4' : 'mt-3 text-center'} flex-1`}>
                <h4 className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-700'}`}>
                  {step.title}
                </h4>
                {step.description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div className={`
                ${orientation === 'vertical' 
                  ? 'ml-5 mt-2 w-px h-8 bg-gray-300' 
                  : 'flex-1 h-px bg-gray-300 mx-4'
                }
                ${isCompleted ? 'bg-green-500' : ''}
              `} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Testimonial Slider
export interface Testimonial {
  id: string
  name: string
  role: string
  company?: string
  avatar: string
  content: string
  rating: number
}

export interface TestimonialSliderProps {
  testimonials: Testimonial[]
  autoPlay?: boolean
}

export function TestimonialSlider({ testimonials, autoPlay = true }: TestimonialSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!autoPlay) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoPlay, testimonials.length])

  return (
    <div className="bg-gray-50 rounded-xl p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="text-center"
        >
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < testimonials[currentIndex].rating 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <blockquote className="text-lg italic text-gray-700 mb-6">
              "{testimonials[currentIndex].content}"
            </blockquote>
          </div>

          <div className="flex items-center justify-center">
            <img
              src={testimonials[currentIndex].avatar}
              alt={testimonials[currentIndex].name}
              className="w-12 h-12 rounded-full mr-4"
            />
            <div className="text-left">
              <div className="font-semibold">{testimonials[currentIndex].name}</div>
              <div className="text-sm text-gray-600">
                {testimonials[currentIndex].role}
                {testimonials[currentIndex].company && ` at ${testimonials[currentIndex].company}`}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="flex justify-center mt-6 space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}