'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  RotateCw,
  Ruler,
  Zap,
  Settings,
  Globe,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Volume2,
  SunMoon,
  Accessibility,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'custom'
type Orientation = 'portrait' | 'landscape'

interface DevicePreset {
  name: string
  width: number
  height: number
  pixelRatio: number
  userAgent: string
  category: 'phone' | 'tablet' | 'desktop'
}

const devicePresets: Record<string, DevicePreset> = {
  // Mobile Devices
  'iphone-14-pro': {
    name: 'iPhone 14 Pro',
    width: 393,
    height: 852,
    pixelRatio: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    category: 'phone'
  },
  'iphone-14': {
    name: 'iPhone 14',
    width: 390,
    height: 844,
    pixelRatio: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    category: 'phone'
  },
  'iphone-se': {
    name: 'iPhone SE',
    width: 375,
    height: 667,
    pixelRatio: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    category: 'phone'
  },
  'samsung-galaxy-s22': {
    name: 'Samsung Galaxy S22',
    width: 384,
    height: 854,
    pixelRatio: 3,
    userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36',
    category: 'phone'
  },
  'pixel-7': {
    name: 'Google Pixel 7',
    width: 412,
    height: 915,
    pixelRatio: 2.6,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36',
    category: 'phone'
  },

  // Tablets
  'ipad-pro-12': {
    name: 'iPad Pro 12.9"',
    width: 1024,
    height: 1366,
    pixelRatio: 2,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    category: 'tablet'
  },
  'ipad-air': {
    name: 'iPad Air',
    width: 820,
    height: 1180,
    pixelRatio: 2,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    category: 'tablet'
  },
  'ipad-mini': {
    name: 'iPad Mini',
    width: 768,
    height: 1024,
    pixelRatio: 2,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    category: 'tablet'
  },

  // Desktop
  'desktop-1080p': {
    name: 'Desktop 1080p',
    width: 1920,
    height: 1080,
    pixelRatio: 1,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    category: 'desktop'
  },
  'desktop-1440p': {
    name: 'Desktop 1440p',
    width: 2560,
    height: 1440,
    pixelRatio: 1,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    category: 'desktop'
  },
  'desktop-4k': {
    name: 'Desktop 4K',
    width: 3840,
    height: 2160,
    pixelRatio: 2,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    category: 'desktop'
  }
}

interface ResponsivePreviewControlsProps {
  onDeviceChange: (preset: DevicePreset) => void
  onOrientationChange: (orientation: Orientation) => void
  onScaleChange: (scale: number) => void
  onSimulationChange: (settings: SimulationSettings) => void
  className?: string
}

interface SimulationSettings {
  networkSpeed: 'fast' | 'slow' | 'offline'
  colorScheme: 'light' | 'dark' | 'auto'
  reducedMotion: boolean
  highContrast: boolean
  touchSimulation: boolean
  geolocation: boolean
}

export function ResponsivePreviewControls({
  onDeviceChange,
  onOrientationChange,
  onScaleChange,
  onSimulationChange,
  className
}: ResponsivePreviewControlsProps) {
  const [selectedPreset, setSelectedPreset] = useState('iphone-14')
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [scale, setScale] = useState(1)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [customDimensions, setCustomDimensions] = useState({ width: 375, height: 667 })
  const [simulation, setSimulation] = useState<SimulationSettings>({
    networkSpeed: 'fast',
    colorScheme: 'auto',
    reducedMotion: false,
    highContrast: false,
    touchSimulation: true,
    geolocation: false
  })

  const preset = devicePresets[selectedPreset]

  useEffect(() => {
    if (preset) {
      onDeviceChange(preset)
    }
  }, [preset, onDeviceChange])

  useEffect(() => {
    onOrientationChange(orientation)
  }, [orientation, onOrientationChange])

  useEffect(() => {
    onScaleChange(scale)
  }, [scale, onScaleChange])

  useEffect(() => {
    onSimulationChange(simulation)
  }, [simulation, onSimulationChange])

  const handlePresetChange = (presetKey: string) => {
    setSelectedPreset(presetKey)
  }

  const toggleOrientation = () => {
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait')
  }

  const handleSimulationChange = (key: keyof SimulationSettings, value: any) => {
    setSimulation(prev => ({ ...prev, [key]: value }))
  }

  const getDeviceIcon = (category: string) => {
    switch (category) {
      case 'phone': return Smartphone
      case 'tablet': return Tablet
      case 'desktop': return Monitor
      default: return Smartphone
    }
  }

  const actualWidth = orientation === 'portrait' ? preset?.width || customDimensions.width : preset?.height || customDimensions.height
  const actualHeight = orientation === 'portrait' ? preset?.height || customDimensions.height : preset?.width || customDimensions.width

  return (
    <div className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Device Selection */}
          <div className="flex items-center space-x-3">
            <Select value={selectedPreset} onValueChange={handlePresetChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(devicePresets)
                  .reduce((groups, [key, preset]) => {
                    if (!groups[preset.category]) {
                      groups[preset.category] = []
                    }
                    groups[preset.category].push([key, preset])
                    return groups
                  }, {} as Record<string, Array<[string, DevicePreset]>>)
                  .map = (category, devices) => (
                    <div key={category}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {category === 'phone' ? '📱 Mobile' : category === 'tablet' ? '📟 Tablet' : '🖥️ Desktop'}
                      </div>
                      {devices.map(([key, device]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center space-x-2">
                            <span>{device.name}</span>
                            <span className="text-xs text-gray-500">
                              {device.width}×{device.height}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  )}
              </SelectContent>
            </Select>

            {/* Orientation Toggle */}
            {preset?.category !== 'desktop' && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleOrientation}
                title={`Switch to ${orientation === 'portrait' ? 'landscape' : 'portrait'}`}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            )}

            {/* Dimensions Display */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Ruler className="h-4 w-4" />
              <span>{actualWidth}×{actualHeight}</span>
              {preset?.pixelRatio !== 1 && (
                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                  {preset.pixelRatio}x
                </span>
              )}
            </div>
          </div>

          {/* Scale Control */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Scale:</span>
              <div className="w-24">
                <Slider
                  value={[scale * 100]}
                  onValueChange={([value]) => setScale(value / 100)}
                  min={25}
                  max={200}
                  step={5}
                  className="w-full"
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 w-10">
                {Math.round(scale * 100)}%
              </span>
            </div>

            {/* Advanced Controls Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={showAdvanced ? 'bg-blue-50 dark:bg-blue-900' : ''}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Advanced Simulation Controls */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Network Speed */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                    {simulation.networkSpeed === 'offline' ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
                    <span>Network</span>
                  </label>
                  <Select
                    value={simulation.networkSpeed}
                    onValueChange={(value) => handleSimulationChange('networkSpeed', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fast">Fast 4G</SelectItem>
                      <SelectItem value="slow">Slow 3G</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Scheme */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                    <SunMoon className="h-4 w-4" />
                    <span>Theme</span>
                  </label>
                  <Select
                    value={simulation.colorScheme}
                    onValueChange={(value) => handleSimulationChange('colorScheme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Accessibility */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                    <Accessibility className="h-4 w-4" />
                    <span>Accessibility</span>
                  </label>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Reduced motion</span>
                    <Switch
                      checked={simulation.reducedMotion}
                      onCheckedChange={(checked) => handleSimulationChange('reducedMotion', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">High contrast</span>
                    <Switch
                      checked={simulation.highContrast}
                      onCheckedChange={(checked) => handleSimulationChange('highContrast', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Touch simulation</span>
                      <Switch
                        checked={simulation.touchSimulation}
                        onCheckedChange={(checked) => handleSimulationChange('touchSimulation', checked)}
                        size="sm"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Geolocation</span>
                      <Switch
                        checked={simulation.geolocation}
                        onCheckedChange={(checked) => handleSimulationChange('geolocation', checked)}
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Device Status Bar Simulation */}
                  {preset?.category === 'phone' && (
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Signal className="h-3 w-3" />
                        <span>••••</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Wifi className="h-3 w-3" />
                      </div>
                      <div className="flex items-center space-x-1">
                        <Battery className="h-3 w-3" />
                        <span>100%</span>
                      </div>
                      <span>9:41 AM</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span>{preset?.name || 'Custom Device'}</span>
            <span>•</span>
            <span className="capitalize">{orientation}</span>
            <span>•</span>
            <span>{Math.round(scale * 100)}% zoom</span>
            {simulation.networkSpeed === 'slow' && (
              <>
                <span>•</span>
                <span className="text-orange-500">Slow network</span>
              </>
            )}
            {simulation.networkSpeed === 'offline' && (
              <>
                <span>•</span>
                <span className="text-red-500">Offline</span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {simulation.reducedMotion && (
              <span className="text-blue-500">Reduced motion</span>
            )}
            {simulation.highContrast && (
              <span className="text-purple-500">High contrast</span>
            )}
            {simulation.colorScheme !== 'auto' && (
              <span className="capitalize">{simulation.colorScheme} mode</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}