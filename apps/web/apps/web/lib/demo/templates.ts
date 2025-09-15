import { BuilderComponent } from '../store/builder'

export interface DemoTemplate {
  id: string
  name: string
  description: string
  category: 'landing' | 'business' | 'portfolio' | 'ecommerce' | 'blog' | 'saas'
  preview: string
  components: BuilderComponent[]
  tags: string[]
}

// Generate unique IDs for demo components
const generateDemoId = (prefix: string, index: number) => `demo_${prefix}_${index}_${Date.now()}`

// Landing Page Template
export const landingPageTemplate: DemoTemplate = {
  id: 'landing-page-01',
  name: 'Modern Landing Page',
  description: 'A conversion-focused landing page with hero, features, testimonials, and CTA sections',
  category: 'landing',
  preview: '/templates/landing-preview.jpg',
  tags: ['modern', 'conversion', 'startup', 'saas'],
  components: [
    {
      id: generateDemoId('hero', 1),
      name: 'Hero Section',
      type: 'CONTENT',
      category: 'HERO',
      props: {
        title: 'Build Stunning Websites with AI',
        subtitle: 'Create professional websites in minutes using our AI-powered drag-and-drop builder. No coding required.',
        buttonText: 'Start Building Free',
        backgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop'
      },
      styles: {
        backgroundColor: '#1e293b',
        color: '#ffffff',
        padding: '6rem 2rem',
        textAlign: 'center',
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }
    },
    {
      id: generateDemoId('features', 1),
      name: 'Features Grid',
      type: 'LAYOUT',
      category: 'GRID',
      props: {
        columns: 3,
        gap: '2rem'
      },
      styles: {
        padding: '4rem 2rem',
        backgroundColor: '#f8fafc'
      },
      children: [
        {
          id: generateDemoId('feature', 1),
          name: 'AI-Powered Design',
          type: 'CONTENT',
          category: 'CARD',
          props: {
            title: '🤖 AI-Powered Design',
            content: 'Let AI generate beautiful designs, content, and layouts tailored to your needs.',
            showImage: true
          },
          styles: {
            padding: '2rem',
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }
        },
        {
          id: generateDemoId('feature', 2),
          name: 'Drag & Drop Builder',
          type: 'CONTENT',
          category: 'CARD',
          props: {
            title: '🎨 Drag & Drop Builder',
            content: 'Intuitive visual editor that makes website building as easy as dragging and dropping.',
            showImage: true
          },
          styles: {
            padding: '2rem',
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }
        },
        {
          id: generateDemoId('feature', 3),
          name: 'One-Click Deploy',
          type: 'CONTENT',
          category: 'CARD',
          props: {
            title: '🚀 One-Click Deploy',
            content: 'Deploy your website instantly to Vercel, Netlify, or download the code.',
            showImage: true
          },
          styles: {
            padding: '2rem',
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }
        }
      ]
    },
    {
      id: generateDemoId('testimonial', 1),
      name: 'Customer Testimonial',
      type: 'CONTENT',
      category: 'TESTIMONIAL',
      props: {
        quote: 'This AI website builder is incredible! I built a professional website for my business in under an hour. The AI suggestions were spot-on and saved me so much time.',
        authorName: 'Sarah Chen',
        authorTitle: 'Founder, TechStart Inc.',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1a5?w=80&h=80&fit=crop&crop=face',
        rating: 5
      },
      styles: {
        padding: '4rem 2rem',
        backgroundColor: '#f1f5f9',
        textAlign: 'center'
      }
    },
    {
      id: generateDemoId('cta', 1),
      name: 'Call to Action',
      type: 'CONTENT',
      category: 'HERO',
      props: {
        title: 'Ready to Build Your Dream Website?',
        subtitle: 'Join thousands of users who have already created amazing websites with our AI-powered builder.',
        buttonText: 'Get Started Now'
      },
      styles: {
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        padding: '4rem 2rem',
        textAlign: 'center'
      }
    }
  ]
}

// Business Website Template
export const businessTemplate: DemoTemplate = {
  id: 'business-01',
  name: 'Professional Business',
  description: 'Complete business website with services, about, and contact sections',
  category: 'business',
  preview: '/templates/business-preview.jpg',
  tags: ['professional', 'corporate', 'services'],
  components: [
    {
      id: generateDemoId('navbar', 1),
      name: 'Navigation Bar',
      type: 'NAVIGATION',
      category: 'NAVBAR',
      props: {
        brandText: 'YourBusiness',
        brandLogo: '',
        showSearch: false,
        sticky: true
      },
      styles: {
        backgroundColor: '#ffffff',
        padding: '1rem 2rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
      }
    },
    {
      id: generateDemoId('hero', 2),
      name: 'Business Hero',
      type: 'CONTENT',
      category: 'HERO',
      props: {
        title: 'Grow Your Business with Professional Solutions',
        subtitle: 'We provide comprehensive business solutions to help you achieve your goals and scale your operations.',
        buttonText: 'Learn More'
      },
      styles: {
        backgroundColor: '#f8fafc',
        padding: '6rem 2rem',
        textAlign: 'center'
      }
    },
    {
      id: generateDemoId('contact', 1),
      name: 'Contact Form',
      type: 'FORM',
      category: 'CONTACT_FORM',
      props: {
        title: 'Get In Touch',
        fields: 'name\nemail\nphone\ncompany\nmessage',
        submitText: 'Send Message'
      },
      styles: {
        padding: '4rem 2rem',
        backgroundColor: '#ffffff'
      }
    }
  ]
}

// Portfolio Template
export const portfolioTemplate: DemoTemplate = {
  id: 'portfolio-01',
  name: 'Creative Portfolio',
  description: 'Showcase your work with a stunning portfolio layout',
  category: 'portfolio',
  preview: '/templates/portfolio-preview.jpg',
  tags: ['creative', 'portfolio', 'showcase', 'artist'],
  components: [
    {
      id: generateDemoId('hero', 3),
      name: 'Portfolio Hero',
      type: 'CONTENT',
      category: 'HERO',
      props: {
        title: 'John Designer',
        subtitle: 'Creative Designer & Art Director specialized in brand identity, web design, and digital experiences.',
        buttonText: 'View My Work'
      },
      styles: {
        backgroundColor: '#1f2937',
        color: '#ffffff',
        padding: '8rem 2rem',
        textAlign: 'center'
      }
    },
    {
      id: generateDemoId('gallery', 1),
      name: 'Project Gallery',
      type: 'LAYOUT',
      category: 'GRID',
      props: {
        columns: 3,
        gap: '1.5rem'
      },
      styles: {
        padding: '4rem 2rem'
      }
    }
  ]
}

// SaaS Template
export const saasTemplate: DemoTemplate = {
  id: 'saas-01',
  name: 'SaaS Product',
  description: 'Modern SaaS landing page with pricing tiers and feature highlights',
  category: 'saas',
  preview: '/templates/saas-preview.jpg',
  tags: ['saas', 'software', 'pricing', 'modern'],
  components: [
    {
      id: generateDemoId('hero', 4),
      name: 'SaaS Hero',
      type: 'CONTENT',
      category: 'HERO',
      props: {
        title: 'The Future of Project Management',
        subtitle: 'Streamline your workflow, collaborate with your team, and deliver projects faster with our AI-powered platform.',
        buttonText: 'Start Free Trial'
      },
      styles: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        padding: '6rem 2rem',
        textAlign: 'center'
      }
    },
    {
      id: generateDemoId('pricing', 1),
      name: 'Pricing Table',
      type: 'LAYOUT',
      category: 'GRID',
      props: {
        columns: 3,
        gap: '2rem'
      },
      styles: {
        padding: '4rem 2rem',
        backgroundColor: '#f8fafc'
      },
      children: [
        {
          id: generateDemoId('plan', 1),
          name: 'Starter Plan',
          type: 'CONTENT',
          category: 'PRICING',
          props: {
            planName: 'Starter',
            price: '$9/month',
            description: 'Perfect for small teams getting started',
            features: 'Up to 5 projects\nBasic collaboration\nEmail support\n5GB storage',
            popular: false,
            buttonText: 'Get Started'
          },
          styles: {
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb'
          }
        },
        {
          id: generateDemoId('plan', 2),
          name: 'Pro Plan',
          type: 'CONTENT',
          category: 'PRICING',
          props: {
            planName: 'Professional',
            price: '$29/month',
            description: 'For growing teams that need more power',
            features: 'Unlimited projects\nAdvanced collaboration\nPriority support\n100GB storage\nAdvanced analytics\nCustom integrations',
            popular: true,
            buttonText: 'Get Started'
          },
          styles: {
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '0.75rem',
            border: '2px solid #3b82f6',
            transform: 'scale(1.05)'
          }
        },
        {
          id: generateDemoId('plan', 3),
          name: 'Enterprise Plan',
          type: 'CONTENT',
          category: 'PRICING',
          props: {
            planName: 'Enterprise',
            price: '$99/month',
            description: 'For large organizations with advanced needs',
            features: 'Everything in Pro\nSSO & Advanced security\nDedicated support\nUnlimited storage\nCustom branding\nAPI access',
            popular: false,
            buttonText: 'Contact Sales'
          },
          styles: {
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb'
          }
        }
      ]
    }
  ]
}

// Export all templates
export const demoTemplates: DemoTemplate[] = [
  landingPageTemplate,
  businessTemplate,
  portfolioTemplate,
  saasTemplate
]

// Tutorial steps
export interface TutorialStep {
  id: string
  title: string
  description: string
  action: string
  target?: string
  content: string
}

export const tutorialSteps: TutorialStep[] = [
  {
    id: 'step-1',
    title: 'Welcome to AI Website Builder',
    description: 'Let\'s build your first website together!',
    action: 'start',
    content: 'This tutorial will guide you through creating a beautiful website using our AI-powered drag-and-drop builder. You\'ll learn how to add components, customize them, and deploy your site.'
  },
  {
    id: 'step-2',
    title: 'Add Your First Component',
    description: 'Drag a Hero section from the component palette',
    action: 'drag',
    target: 'component-palette',
    content: 'Look at the left panel - this is your component palette. Click and drag the "Hero" component to the canvas in the center. This will be the main banner of your website.'
  },
  {
    id: 'step-3',
    title: 'Customize with AI',
    description: 'Use AI to generate content for your hero section',
    action: 'ai-generate',
    target: 'properties-panel',
    content: 'Select your hero component and look at the right panel. Click the sparkle (✨) button next to any field to generate AI content. Try generating a title, subtitle, and button text!'
  },
  {
    id: 'step-4',
    title: 'Style Your Component',
    description: 'Switch to the Styles tab to customize appearance',
    action: 'style',
    target: 'styles-tab',
    content: 'Click the "Styles" tab in the properties panel. Here you can change colors, spacing, and layout. Try the "Generate AI Styles" button for instant professional styling!'
  },
  {
    id: 'step-5',
    title: 'Add More Components',
    description: 'Build out your page with additional sections',
    action: 'add-components',
    target: 'canvas',
    content: 'Add a few more components like Cards, Testimonials, or a Contact Form. Drag them below your hero section to build a complete page.'
  },
  {
    id: 'step-6',
    title: 'Preview Your Site',
    description: 'See how your website looks in preview mode',
    action: 'preview',
    target: 'preview-button',
    content: 'Click the "Preview" button in the top toolbar to see your website as visitors will see it. You can also test different device sizes!'
  },
  {
    id: 'step-7',
    title: 'Export or Deploy',
    description: 'Download your code or deploy instantly',
    action: 'export',
    target: 'code-tab',
    content: 'Go to the "Code" tab in the properties panel. Here you can export your website as React code or deploy it instantly to Vercel or Netlify with one click!'
  },
  {
    id: 'step-8',
    title: 'Congratulations! 🎉',
    description: 'You\'ve built your first AI-powered website',
    action: 'complete',
    content: 'You now know the basics of our AI website builder! Explore more components, try different templates, and create amazing websites in minutes.'
  }
]

// Quick tips for users
export const quickTips = [
  {
    id: 'tip-1',
    title: 'Use AI for Everything',
    description: 'Don\'t write content manually - let AI generate professional copy, choose colors, and suggest layouts.',
    icon: '🤖'
  },
  {
    id: 'tip-2',
    title: 'Start with Templates',
    description: 'Use our pre-built templates as a starting point and customize them to match your brand.',
    icon: '📋'
  },
  {
    id: 'tip-3',
    title: 'Mobile-First Design',
    description: 'Always check how your website looks on mobile devices using the responsive preview.',
    icon: '📱'
  },
  {
    id: 'tip-4',
    title: 'Copy Components',
    description: 'Use Ctrl+C and Ctrl+V to quickly duplicate components and speed up your workflow.',
    icon: '⚡'
  },
  {
    id: 'tip-5',
    title: 'Undo/Redo',
    description: 'Made a mistake? Use Ctrl+Z to undo or Ctrl+Y to redo any changes.',
    icon: '↩️'
  }
]

// Sample content for different industries
export const industryContent = {
  technology: {
    heroTitles: [
      'Transform Your Business with Cutting-Edge Technology',
      'Innovation Meets Excellence',
      'The Future of Technology is Here'
    ],
    features: [
      'AI-Powered Solutions',
      'Cloud Infrastructure',
      'Data Analytics',
      'Cybersecurity',
      'Mobile Development',
      'IoT Integration'
    ]
  },
  healthcare: {
    heroTitles: [
      'Advancing Healthcare Through Innovation',
      'Your Health, Our Priority',
      'Excellence in Patient Care'
    ],
    features: [
      'Telemedicine',
      'Electronic Health Records',
      'Patient Portal',
      'Medical Imaging',
      'Healthcare Analytics',
      'Appointment Scheduling'
    ]
  },
  education: {
    heroTitles: [
      'Empowering Education for Tomorrow',
      'Learn. Grow. Succeed.',
      'Education That Inspires'
    ],
    features: [
      'Online Learning',
      'Student Management',
      'Course Creation',
      'Progress Tracking',
      'Virtual Classrooms',
      'Assessment Tools'
    ]
  },
  ecommerce: {
    heroTitles: [
      'Shop the Future Today',
      'Your One-Stop Shopping Destination',
      'Quality Products, Unbeatable Prices'
    ],
    features: [
      'Product Catalog',
      'Shopping Cart',
      'Payment Processing',
      'Order Management',
      'Customer Reviews',
      'Inventory Tracking'
    ]
  }
}