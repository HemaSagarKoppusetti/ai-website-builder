'use client'

import { BuilderComponent } from '../store/builder'

export type DeploymentProvider = 'vercel' | 'netlify' | 'github-pages' | 'custom'
export type DeploymentStatus = 'idle' | 'building' | 'deploying' | 'success' | 'error' | 'cancelled'

export interface DeploymentConfig {
  provider: DeploymentProvider
  projectName: string
  domain?: string
  environmentVariables?: Record<string, string>
  buildCommand?: string
  outputDirectory?: string
  nodeVersion?: string
}

export interface DeploymentResult {
  id: string
  status: DeploymentStatus
  url?: string
  previewUrl?: string
  buildTime?: number
  logs?: string[]
  error?: string
  createdAt: Date
  completedAt?: Date
}

export interface DeploymentHistory {
  id: string
  deploymentId: string
  provider: DeploymentProvider
  status: DeploymentStatus
  url?: string
  previewUrl?: string
  createdAt: Date
  completedAt?: Date
  buildTime?: number
  components: BuilderComponent[]
  version: string
}

class DeploymentService {
  private deployments: Map<string, DeploymentResult> = new Map()
  private history: DeploymentHistory[] = []
  
  // Generate static website files from components
  generateStaticSite(components: BuilderComponent[], config: DeploymentConfig): {
    html: string
    css: string
    js: string
    assets: Record<string, string>
  } {
    const html = this.generateHTML(components, config)
    const css = this.generateCSS(components)
    const js = this.generateJS(components)
    const assets = this.collectAssets(components)

    return { html, css, js, assets }
  }

  private generateHTML(components: BuilderComponent[], config: DeploymentConfig): string {
    const componentHtml = components.map(component => this.componentToHTML(component)).join('\n')
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.projectName}</title>
  <meta name="description" content="Website built with AI Website Builder">
  <meta name="generator" content="AI Website Builder">
  
  <!-- SEO Meta Tags -->
  <meta property="og:title" content="${config.projectName}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${config.domain || ''}">
  <meta name="twitter:card" content="summary_large_image">
  
  <!-- Styles -->
  <link rel="stylesheet" href="./styles.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet">
  
  <!-- Performance -->
  <link rel="preload" href="./script.js" as="script">
</head>
<body>
  <div id="app">
    ${componentHtml}
  </div>
  
  <!-- Scripts -->
  <script src="./script.js" defer></script>
  
  <!-- Analytics placeholder -->
  <!-- Google Analytics, etc. can be added here -->
</body>
</html>`
  }

  private generateCSS(components: BuilderComponent[]): string {
    const baseCSS = `
/* Reset and Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #fff;
}

img {
  max-width: 100%;
  height: auto;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  outline: none;
}

/* Utility Classes */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }

.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.gap-8 { gap: 2rem; }

.p-4 { padding: 1rem; }
.p-6 { padding: 1.5rem; }
.p-8 { padding: 2rem; }

.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }

.rounded { border-radius: 0.25rem; }
.rounded-md { border-radius: 0.375rem; }
.rounded-lg { border-radius: 0.5rem; }
.rounded-xl { border-radius: 0.75rem; }

.shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }

/* Responsive */
@media (min-width: 640px) {
  .sm\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .sm\\:text-lg { font-size: 1.125rem; }
}

@media (min-width: 768px) {
  .md\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .md\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  .md\\:text-xl { font-size: 1.25rem; }
  .md\\:text-2xl { font-size: 1.5rem; }
  .md\\:text-4xl { font-size: 2.25rem; }
  .md\\:text-6xl { font-size: 3.75rem; }
}

@media (min-width: 1024px) {
  .lg\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  .lg\\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
}

/* Animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}

/* Component Specific Styles */
${this.generateComponentCSS(components)}
`

    return baseCSS
  }

  private generateJS(components: BuilderComponent[]): string {
    return `
// AI Website Builder - Generated JavaScript
(function() {
  'use strict';
  
  // Initialize on DOM load
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Website loaded successfully');
    
    // Add smooth scrolling to anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
    
    // Add form handling
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        // Form handling logic would go here
        alert('Form submitted! (This is a demo)');
      });
    });
    
    // Add intersection observer for animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe all major sections
    document.querySelectorAll('section, .card, .hero').forEach(el => {
      observer.observe(el);
    });
    
    ${this.generateComponentJS(components)}
  });
})();
`
  }

  private componentToHTML(component: BuilderComponent): string {
    const styles = this.componentStylesToString(component.styles)
    const className = this.getComponentClassName(component.category)
    
    switch (component.category) {
      case 'HERO':
        return `
<section class="hero ${className}" style="${styles}">
  <div class="container">
    <div class="text-center">
      <h1 class="text-4xl md:text-6xl font-bold mb-6">${component.content.title || 'Hero Title'}</h1>
      <p class="text-lg md:text-xl mb-8 text-gray-200">${component.content.subtitle || 'Hero subtitle'}</p>
      ${component.content.ctaText ? `<button class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">${component.content.ctaText}</button>` : ''}
    </div>
  </div>
</section>`
      
      case 'TEXT':
        const tag = component.content.type === 'heading' ? 'h2' : 'p'
        return `<${tag} class="${className}" style="${styles}">${component.content.text || 'Text content'}</${tag}>`
      
      case 'BUTTON':
        return `<button class="btn ${className}" style="${styles}">${component.content.text || 'Button'}</button>`
      
      case 'IMAGE':
        return `<img class="${className}" src="${component.content.src || '/placeholder.jpg'}" alt="${component.content.alt || 'Image'}" style="${styles}">`
      
      case 'CARD':
        return `
<div class="card ${className}" style="${styles}">
  ${component.content.image ? `<img src="${component.content.image}" alt="${component.content.title || 'Card'}" class="card-image">` : ''}
  <div class="card-content">
    <h3 class="card-title">${component.content.title || 'Card Title'}</h3>
    <p class="card-description">${component.content.description || 'Card description'}</p>
    ${component.content.ctaText ? `<button class="card-cta">${component.content.ctaText}</button>` : ''}
  </div>
</div>`
      
      case 'NAVBAR':
        const links = component.content.links || [
          { text: 'Home', href: '#' },
          { text: 'About', href: '#' },
          { text: 'Services', href: '#' },
          { text: 'Contact', href: '#' }
        ]
        return `
<nav class="navbar ${className}" style="${styles}">
  <div class="container">
    <div class="flex items-center justify-between">
      <div class="brand">
        <span class="text-xl font-bold">${component.content.brand || 'Brand'}</span>
      </div>
      <div class="nav-links">
        ${links.map(link => `<a href="${link.href}" class="nav-link">${link.text}</a>`).join('')}
      </div>
    </div>
  </div>
</nav>`
      
      case 'FOOTER':
        return `
<footer class="footer ${className}" style="${styles}">
  <div class="container">
    <div class="text-center">
      <p>&copy; 2024 ${component.content.brand || 'Your Company'}. All rights reserved.</p>
    </div>
  </div>
</footer>`
      
      default:
        return `<div class="${className}" style="${styles}">Component: ${component.category}</div>`
    }
  }

  private componentStylesToString(styles: Record<string, any>): string {
    return Object.entries(styles)
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
        return `${cssKey}: ${value}`
      })
      .join('; ')
  }

  private getComponentClassName(category: string): string {
    return `component-${category.toLowerCase().replace('_', '-')}`
  }

  private generateComponentCSS(components: BuilderComponent[]): string {
    return `
/* Hero Styles */
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 2rem;
  min-height: 60vh;
  display: flex;
  align-items: center;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
  background-color: #3b82f6;
  color: white;
}

.btn:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}

/* Card Styles */
.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.card-image {
  width: 100%;
  height: 12rem;
  object-fit: cover;
}

.card-content {
  padding: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.card-description {
  color: #6b7280;
  margin-bottom: 1rem;
}

.card-cta {
  color: #3b82f6;
  font-weight: 600;
}

/* Navbar Styles */
.navbar {
  background: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #374151;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #3b82f6;
}

/* Footer Styles */
.footer {
  background: #1f2937;
  color: white;
  padding: 3rem 0;
  margin-top: 4rem;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
}
`
  }

  private generateComponentJS(components: BuilderComponent[]): string {
    return components.map(component => {
      switch (component.category) {
        case 'CONTACT_FORM':
          return `
    // Contact form handling for ${component.id}
    const form_${component.id.replace(/[^a-zA-Z0-9]/g, '_')} = document.querySelector('#${component.id}');
    if (form_${component.id.replace(/[^a-zA-Z0-9]/g, '_')}) {
      form_${component.id.replace(/[^a-zA-Z0-9]/g, '_')}.addEventListener('submit', function(e) {
        e.preventDefault();
        // Handle form submission
        console.log('Form submitted');
      });
    }
    `
        default:
          return ''
      }
    }).join('\n')
  }

  private collectAssets(components: BuilderComponent[]): Record<string, string> {
    const assets: Record<string, string> = {}
    
    components.forEach(component => {
      if (component.content.image || component.content.src) {
        const src = component.content.image || component.content.src
        if (src && !src.startsWith('http') && !src.startsWith('data:')) {
          assets[src] = src // In a real implementation, you'd fetch and convert to base64 or copy files
        }
      }
    })
    
    return assets
  }

  // Vercel deployment
  async deployToVercel(
    components: BuilderComponent[], 
    config: DeploymentConfig,
    apiToken: string
  ): Promise<DeploymentResult> {
    const deploymentId = this.generateDeploymentId()
    const deployment: DeploymentResult = {
      id: deploymentId,
      status: 'building',
      createdAt: new Date()
    }
    
    this.deployments.set(deploymentId, deployment)
    
    try {
      const { html, css, js, assets } = this.generateStaticSite(components, config)
      
      const files = {
        'index.html': html,
        'styles.css': css,
        'script.js': js,
        'package.json': JSON.stringify({
          name: config.projectName,
          version: '1.0.0',
          scripts: {
            build: 'echo "Static site - no build needed"'
          }
        }),
        ...assets
      }
      
      const vercelPayload = {
        name: config.projectName,
        files: Object.entries(files).map(([file, data]) => ({
          file,
          data: Buffer.from(data).toString('base64')
        })),
        projectSettings: {
          framework: null,
          buildCommand: config.buildCommand || null,
          outputDirectory: config.outputDirectory || null
        }
      }
      
      deployment.status = 'deploying'
      this.deployments.set(deploymentId, { ...deployment })
      
      const response = await fetch('https://api.vercel.com/v13/deployments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vercelPayload)
      })
      
      if (!response.ok) {
        throw new Error(`Vercel deployment failed: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      deployment.status = 'success'
      deployment.url = result.url
      deployment.previewUrl = result.url
      deployment.completedAt = new Date()
      deployment.buildTime = Date.now() - deployment.createdAt.getTime()
      
      this.deployments.set(deploymentId, { ...deployment })
      this.addToHistory(deploymentId, components, config)
      
      return deployment
      
    } catch (error) {
      deployment.status = 'error'
      deployment.error = error instanceof Error ? error.message : 'Deployment failed'
      deployment.completedAt = new Date()
      
      this.deployments.set(deploymentId, { ...deployment })
      
      throw error
    }
  }

  // Netlify deployment
  async deployToNetlify(
    components: BuilderComponent[], 
    config: DeploymentConfig,
    apiToken: string
  ): Promise<DeploymentResult> {
    const deploymentId = this.generateDeploymentId()
    const deployment: DeploymentResult = {
      id: deploymentId,
      status: 'building',
      createdAt: new Date()
    }
    
    this.deployments.set(deploymentId, deployment)
    
    try {
      const { html, css, js, assets } = this.generateStaticSite(components, config)
      
      const files = {
        'index.html': html,
        'styles.css': css,
        'script.js': js,
        '_headers': `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block`,
        ...assets
      }
      
      // Create site if it doesn't exist
      const siteResponse = await fetch('https://api.netlify.com/api/v1/sites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: config.projectName,
          custom_domain: config.domain
        })
      })
      
      const site = await siteResponse.json()
      
      deployment.status = 'deploying'
      this.deployments.set(deploymentId, { ...deployment })
      
      // Deploy files
      const deployResponse = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}/deploys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/zip'
        },
        body: await this.createZipFromFiles(files)
      })
      
      const deployResult = await deployResponse.json()
      
      deployment.status = 'success'
      deployment.url = deployResult.ssl_url || deployResult.url
      deployment.previewUrl = deployResult.deploy_ssl_url || deployResult.deploy_url
      deployment.completedAt = new Date()
      deployment.buildTime = Date.now() - deployment.createdAt.getTime()
      
      this.deployments.set(deploymentId, { ...deployment })
      this.addToHistory(deploymentId, components, config)
      
      return deployment
      
    } catch (error) {
      deployment.status = 'error'
      deployment.error = error instanceof Error ? error.message : 'Deployment failed'
      deployment.completedAt = new Date()
      
      this.deployments.set(deploymentId, { ...deployment })
      
      throw error
    }
  }

  private async createZipFromFiles(files: Record<string, string>): Promise<Blob> {
    // This would use a zip library like JSZip in a real implementation
    // For now, returning a placeholder blob
    return new Blob([JSON.stringify(files)], { type: 'application/zip' })
  }

  private generateDeploymentId(): string {
    return `deploy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private addToHistory(deploymentId: string, components: BuilderComponent[], config: DeploymentConfig): void {
    const deployment = this.deployments.get(deploymentId)
    if (!deployment) return
    
    const historyItem: DeploymentHistory = {
      id: `history_${Date.now()}`,
      deploymentId,
      provider: config.provider,
      status: deployment.status,
      url: deployment.url,
      previewUrl: deployment.previewUrl,
      createdAt: deployment.createdAt,
      completedAt: deployment.completedAt,
      buildTime: deployment.buildTime,
      components: JSON.parse(JSON.stringify(components)),
      version: `v${this.history.length + 1}`
    }
    
    this.history.unshift(historyItem)
    
    // Keep only last 50 deployments
    if (this.history.length > 50) {
      this.history = this.history.slice(0, 50)
    }
  }

  // Public methods
  getDeployment(id: string): DeploymentResult | undefined {
    return this.deployments.get(id)
  }

  getDeploymentHistory(): DeploymentHistory[] {
    return [...this.history]
  }

  cancelDeployment(id: string): boolean {
    const deployment = this.deployments.get(id)
    if (deployment && (deployment.status === 'building' || deployment.status === 'deploying')) {
      deployment.status = 'cancelled'
      deployment.completedAt = new Date()
      this.deployments.set(id, deployment)
      return true
    }
    return false
  }
}

// Singleton instance
export const deploymentService = new DeploymentService()