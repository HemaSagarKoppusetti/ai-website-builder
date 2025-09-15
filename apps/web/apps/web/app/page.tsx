import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  ArrowRight,
  Sparkles,
  Zap,
  Cloud,
  GitBranch,
  Gauge,
  Eye,
  MessageCircle,
  Layout,
  Code,
  Smartphone,
  Palette,
  Users,
  Star,
  CheckCircle,
  TrendingUp,
  Shield,
  Download,
  Globe
} from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered Design Assistant",
      description: "Get intelligent suggestions and automated design recommendations powered by advanced AI.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Layout className="w-6 h-6" />,
      title: "Advanced Drag & Drop Builder",
      description: "Intuitive visual builder with sophisticated component tree and real-time editing.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Real-Time Preview System",
      description: "See your changes instantly across multiple devices with live WebSocket updates.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Rich Template Library",
      description: "Professional templates with smart marketplace and personalized recommendations.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "One-Click Deployment",
      description: "Deploy instantly to Vercel, Netlify, or GitHub Pages with automated optimization.",
      color: "from-teal-500 to-blue-500"
    },
    {
      icon: <GitBranch className="w-6 h-6" />,
      title: "Version Control System",
      description: "Git-like branching, commits, and collaboration with team management features.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: <Gauge className="w-6 h-6" />,
      title: "Performance Optimization",
      description: "Advanced performance monitoring, SEO analysis, and accessibility auditing.",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Advanced Components",
      description: "Interactive forms, carousels, product cards, and sophisticated UI elements.",
      color: "from-gray-600 to-gray-800"
    }
  ]

  const stats = [
    { label: "Templates", value: "50+", icon: <Palette className="w-5 h-5" /> },
    { label: "Components", value: "100+", icon: <Layout className="w-5 h-5" /> },
    { label: "Integrations", value: "25+", icon: <Zap className="w-5 h-5" /> },
    { label: "Users", value: "10K+", icon: <Users className="w-5 h-5" /> }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Designer",
      avatar: "SC",
      content: "This AI builder completely transformed my workflow. I can create professional websites in minutes instead of hours."
    },
    {
      name: "Mike Johnson",
      role: "Startup Founder",
      content: "The template marketplace is incredible. Found the perfect design for our SaaS landing page and deployed it instantly."
    },
    {
      name: "Lisa Rodriguez",
      role: "Freelance Developer",
      content: "The performance optimization features are game-changing. My sites load 3x faster with the automated suggestions."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Website Builder
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/builder/complete">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Demo
                </Button>
              </Link>
              <Link href="/builder/complete">
                <Button size="sm">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              <span>Powered by Advanced AI Technology</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Build Stunning Websites
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                with AI Assistance
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              The most advanced no-code website builder with AI-powered design assistance, 
              professional templates, real-time collaboration, and one-click deployment.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/builder/complete">
                <Button size="lg" className="text-lg px-8 py-3">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Building Now
                </Button>
              </Link>
              
              <Link href="/builder/complete">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-lg mb-3">
                  <div className="text-blue-600">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Build Amazing Websites
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed for creators, developers, and businesses of all sizes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-6 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Builder Preview */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              See the Builder in Action
            </h2>
            <p className="text-xl text-gray-600">
              Experience the most intuitive website building interface ever created.
            </p>
          </div>
          
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex-1 bg-white rounded-lg px-3 py-1 text-sm text-gray-500">
                    ai-website-builder.com
                  </div>
                </div>
              </div>
              
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Interactive Builder Demo</h3>
                  <p className="text-gray-600 mb-6">Click to explore all features</p>
                  <Link href="/builder/complete">
                    <Button size="lg">
                      <Eye className="w-5 h-5 mr-2" />
                      Launch Builder
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Creators Worldwide
            </h2>
            <div className="flex items-center justify-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
              <span className="ml-2 text-xl font-semibold text-gray-900">4.9/5</span>
            </div>
            <p className="text-gray-600">Based on 500+ reviews</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-2xl">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                    {testimonial.avatar || testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Build Your Dream Website?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of creators using AI to build stunning websites in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/builder/complete">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Building for Free
              </Button>
            </Link>
            
            <div className="flex items-center space-x-2 text-blue-100">
              <CheckCircle className="w-5 h-5" />
              <span>No credit card required</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-8 mt-12 text-blue-200">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Global CDN</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">AI Website Builder</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The most advanced no-code website builder powered by AI. Create stunning websites with intelligent design assistance.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-sm text-gray-400">4.9/5 rating</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>AI Design Assistant</li>
                <li>Drag & Drop Builder</li>
                <li>Template Marketplace</li>
                <li>Real-time Preview</li>
                <li>One-click Deploy</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Tutorials</li>
                <li>Community</li>
                <li>Support</li>
                <li>API Reference</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 text-sm">
              © 2024 AI Website Builder. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/builder/complete" className="text-gray-400 hover:text-white transition-colors">
                Try Builder
              </Link>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">Made with ❤️ for creators</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Play({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polygon points="5,3 19,12 5,21" fill="currentColor" />
    </svg>
  )
}