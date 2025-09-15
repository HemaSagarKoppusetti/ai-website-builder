import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@aibuilder.com' },
      update: {},
      create: {
        email: 'admin@aibuilder.com',
        name: 'Admin User',
        firstName: 'Admin',
        lastName: 'User',
        password: await hash('password123', 10),
        subscriptionTier: 'ENTERPRISE',
        isVerified: true,
      }
    }),
    prisma.user.upsert({
      where: { email: 'john@example.com' },
      update: {},
      create: {
        email: 'john@example.com',
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Tech Startup Inc.',
        jobTitle: 'Founder',
        password: await hash('password123', 10),
        subscriptionTier: 'PRO',
        isVerified: true,
      }
    }),
    prisma.user.upsert({
      where: { email: 'sarah@example.com' },
      update: {},
      create: {
        email: 'sarah@example.com',
        name: 'Sarah Wilson',
        firstName: 'Sarah',
        lastName: 'Wilson',
        company: 'Design Studio',
        jobTitle: 'Designer',
        password: await hash('password123', 10),
        subscriptionTier: 'FREE',
        isVerified: true,
      }
    })
  ])

  console.log('✅ Created users:', users.map(u => u.email))

  // Create sample templates
  const templates = await Promise.all([
    prisma.template.create({
      data: {
        name: 'Modern SaaS Landing Page',
        description: 'A sleek and modern landing page template perfect for SaaS products',
        category: 'LANDING_PAGE',
        tags: ['saas', 'modern', 'conversion'],
        price: 0,
        isPublished: true,
        isApproved: true,
        isFeatured: true,
        downloadCount: 1247,
        rating: 4.8,
        reviewCount: 89,
        content: {
          theme: {
            primaryColor: '#3B82F6',
            secondaryColor: '#1E40AF',
            accentColor: '#F59E0B'
          },
          layout: 'modern'
        },
        pages: [
          {
            title: 'Home',
            slug: 'home',
            path: '/',
            isHomePage: true,
            components: ['hero', 'features', 'pricing', 'cta']
          }
        ],
        creatorId: users[0].id
      }
    }),
    prisma.template.create({
      data: {
        name: 'Portfolio Showcase',
        description: 'A creative portfolio template to showcase your work',
        category: 'PORTFOLIO',
        tags: ['portfolio', 'creative', 'minimal'],
        price: 29.99,
        currency: 'USD',
        isPublished: true,
        isApproved: true,
        downloadCount: 523,
        rating: 4.6,
        reviewCount: 34,
        content: {
          theme: {
            primaryColor: '#1F2937',
            secondaryColor: '#374151',
            accentColor: '#F59E0B'
          },
          layout: 'grid'
        },
        pages: [
          {
            title: 'Portfolio',
            slug: 'portfolio',
            path: '/',
            isHomePage: true,
            components: ['header', 'portfolio-grid', 'about', 'contact']
          }
        ],
        creatorId: users[1].id
      }
    }),
    prisma.template.create({
      data: {
        name: 'E-commerce Store',
        description: 'Complete e-commerce template with product listings and checkout',
        category: 'ECOMMERCE',
        tags: ['ecommerce', 'store', 'products'],
        price: 49.99,
        currency: 'USD',
        isPublished: true,
        isApproved: true,
        isFeatured: true,
        downloadCount: 892,
        rating: 4.9,
        reviewCount: 67,
        content: {
          theme: {
            primaryColor: '#059669',
            secondaryColor: '#047857',
            accentColor: '#F59E0B'
          },
          layout: 'ecommerce'
        },
        pages: [
          {
            title: 'Home',
            slug: 'home',
            path: '/',
            isHomePage: true,
            components: ['hero-banner', 'featured-products', 'categories']
          }
        ],
        creatorId: users[2].id
      }
    })
  ])

  console.log('✅ Created templates:', templates.map(t => t.name))

  // Create sample projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'My Startup Website',
        description: 'A modern website for my tech startup',
        slug: 'my-startup-website',
        type: 'WEBSITE',
        status: 'DRAFT',
        settings: {
          theme: 'modern',
          primaryColor: '#3B82F6'
        },
        seoTitle: 'My Startup - Innovative Tech Solutions',
        seoDescription: 'We build innovative tech solutions for modern businesses',
        userId: users[1].id
      }
    }),
    prisma.project.create({
      data: {
        name: 'Design Portfolio',
        description: 'My creative design portfolio',
        slug: 'design-portfolio',
        type: 'PORTFOLIO',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        settings: {
          theme: 'creative',
          primaryColor: '#8B5CF6'
        },
        customDomain: 'sarahdesign.com',
        userId: users[2].id
      }
    })
  ])

  console.log('✅ Created projects:', projects.map(p => p.name))

  // Create sample pages for projects
  const pages = await Promise.all([
    prisma.page.create({
      data: {
        title: 'Home',
        slug: 'home',
        path: '/',
        isHomePage: true,
        isPublished: true,
        content: [
          {
            id: 'hero-1',
            type: 'HERO',
            props: {
              title: 'Welcome to My Startup',
              subtitle: 'We build amazing things',
              buttonText: 'Get Started',
              backgroundImage: '/images/hero-bg.jpg'
            }
          }
        ],
        seoTitle: 'Home - My Startup',
        seoDescription: 'Welcome to my startup website',
        projectId: projects[0].id
      }
    }),
    prisma.page.create({
      data: {
        title: 'About',
        slug: 'about',
        path: '/about',
        isPublished: true,
        content: [
          {
            id: 'about-1',
            type: 'TEXT',
            props: {
              content: 'Learn more about our mission and team'
            }
          }
        ],
        projectId: projects[0].id
      }
    })
  ])

  console.log('✅ Created pages:', pages.map(p => p.title))

  // Create sample components
  const components = await Promise.all([
    prisma.component.create({
      data: {
        name: 'Hero Section',
        type: 'LAYOUT',
        category: 'HERO',
        description: 'A responsive hero section with title, subtitle and CTA button',
        tags: ['hero', 'landing', 'cta'],
        isPublic: true,
        isTemplate: true,
        props: {
          title: { type: 'string', default: 'Welcome to our platform' },
          subtitle: { type: 'string', default: 'Build amazing websites with ease' },
          buttonText: { type: 'string', default: 'Get Started' },
          backgroundImage: { type: 'image', default: null }
        },
        styles: {
          padding: '80px 0',
          textAlign: 'center',
          backgroundColor: '#f8fafc'
        },
        reactCode: `
export const HeroSection = ({ title, subtitle, buttonText, backgroundImage }) => {
  return (
    <section className="hero-section" style={{ backgroundImage: backgroundImage ? \`url(\${backgroundImage})\` : 'none' }}>
      <div className="container">
        <h1 className="hero-title">{title}</h1>
        <p className="hero-subtitle">{subtitle}</p>
        <button className="hero-button">{buttonText}</button>
      </div>
    </section>
  )
}`,
        htmlCode: `
<section class="hero-section">
  <div class="container">
    <h1 class="hero-title">{{title}}</h1>
    <p class="hero-subtitle">{{subtitle}}</p>
    <button class="hero-button">{{buttonText}}</button>
  </div>
</section>`,
        cssCode: `
.hero-section {
  padding: 80px 0;
  text-align: center;
  background-color: #f8fafc;
  background-size: cover;
  background-position: center;
}
.hero-title { font-size: 3rem; margin-bottom: 1rem; }
.hero-subtitle { font-size: 1.25rem; margin-bottom: 2rem; }
.hero-button { 
  background: #3B82F6; 
  color: white; 
  padding: 12px 24px; 
  border: none; 
  border-radius: 8px; 
  font-size: 1rem;
  cursor: pointer;
}`,
        usageCount: 145,
        createdById: users[0].id
      }
    }),
    prisma.component.create({
      data: {
        name: 'Contact Form',
        type: 'FORM',
        category: 'FORM',
        description: 'A responsive contact form with validation',
        tags: ['form', 'contact', 'validation'],
        isPublic: true,
        isTemplate: true,
        props: {
          title: { type: 'string', default: 'Get in Touch' },
          fields: { 
            type: 'array', 
            default: [
              { name: 'name', label: 'Name', type: 'text', required: true },
              { name: 'email', label: 'Email', type: 'email', required: true },
              { name: 'message', label: 'Message', type: 'textarea', required: true }
            ]
          }
        },
        styles: {
          maxWidth: '600px',
          margin: '0 auto',
          padding: '2rem'
        },
        reactCode: `
export const ContactForm = ({ title, fields }) => {
  const [formData, setFormData] = useState({})
  
  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
  }
  
  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <h2>{title}</h2>
      {fields.map(field => (
        <div key={field.name} className="form-group">
          <label>{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea name={field.name} required={field.required} />
          ) : (
            <input type={field.type} name={field.name} required={field.required} />
          )}
        </div>
      ))}
      <button type="submit">Send Message</button>
    </form>
  )
}`,
        usageCount: 89,
        createdById: users[1].id
      }
    })
  ])

  console.log('✅ Created components:', components.map(c => c.name))

  // Create sample deployments
  const deployments = await Promise.all([
    prisma.deployment.create({
      data: {
        platform: 'VERCEL',
        status: 'DEPLOYED',
        url: 'https://my-startup-website.vercel.app',
        domain: 'my-startup-website.vercel.app',
        buildTime: 45,
        deployTime: 12,
        deployedAt: new Date(),
        platformData: {
          projectId: 'prj_123456',
          deploymentId: 'dpl_789012'
        },
        projectId: projects[0].id,
        deployedById: users[1].id
      }
    }),
    prisma.deployment.create({
      data: {
        platform: 'NETLIFY',
        status: 'DEPLOYED',
        url: 'https://design-portfolio.netlify.app',
        domain: 'sarahdesign.com',
        buildTime: 32,
        deployTime: 8,
        deployedAt: new Date(),
        platformData: {
          siteId: 'site_abcdef',
          deployId: 'deploy_ghijkl'
        },
        projectId: projects[1].id,
        deployedById: users[2].id
      }
    })
  ])

  console.log('✅ Created deployments:', deployments.map(d => d.url))

  // Create sample analytics events
  const analyticsEvents = await Promise.all([
    prisma.analytics.create({
      data: {
        event: 'project_created',
        properties: { projectType: 'WEBSITE' },
        userId: users[1].id,
        projectId: projects[0].id
      }
    }),
    prisma.analytics.create({
      data: {
        event: 'component_used',
        properties: { componentType: 'HERO', componentName: 'Hero Section' },
        userId: users[1].id,
        projectId: projects[0].id
      }
    }),
    prisma.analytics.create({
      data: {
        event: 'project_deployed',
        properties: { platform: 'VERCEL' },
        userId: users[1].id,
        projectId: projects[0].id
      }
    })
  ])

  console.log('✅ Created analytics events:', analyticsEvents.length)

  console.log('🎉 Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })