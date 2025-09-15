import { BuilderComponent } from '../store/builder'

export interface ExportOptions {
  format: 'react' | 'vue' | 'html' | 'next' | 'nuxt'
  includeStyles: boolean
  includeTailwind: boolean
  typescript: boolean
  componentLibrary?: 'mui' | 'antd' | 'chakra' | 'mantine'
}

export interface DeploymentConfig {
  platform: 'vercel' | 'netlify' | 'github-pages' | 'aws' | 'firebase'
  projectName: string
  domain?: string
  environmentVariables?: Record<string, string>
}

// Convert component to React code
export function generateReactComponent(component: BuilderComponent, options: ExportOptions): string {
  const { typescript, includeStyles, includeTailwind } = options
  const ext = typescript ? 'tsx' : 'jsx'
  
  let code = ''
  
  // Add imports
  if (typescript) {
    code += `import React from 'react'\n`
    if (includeStyles && !includeTailwind) {
      code += `import './styles.css'\n`
    }
  } else {
    code += `import React from 'react'\n`
  }
  
  code += `\n`
  
  // Generate component function
  const componentName = component.name.replace(/\s+/g, '') || 'Component'
  
  if (typescript) {
    code += `interface ${componentName}Props {\n`
    // Add prop types based on component properties
    Object.keys(component.props).forEach(key => {
      const value = component.props[key]
      const type = typeof value === 'string' ? 'string' : 
                   typeof value === 'number' ? 'number' : 
                   typeof value === 'boolean' ? 'boolean' : 'any'
      code += `  ${key}?: ${type}\n`
    })
    code += `}\n\n`
    
    code += `export const ${componentName}: React.FC<${componentName}Props> = (props) => {\n`
  } else {
    code += `export const ${componentName} = (props) => {\n`
  }
  
  // Generate component JSX
  code += `  return (\n`
  code += generateJSX(component, options, 2)
  code += `  )\n`
  code += `}\n\n`
  
  // Add default export
  code += `export default ${componentName}\n`
  
  return code
}

// Generate JSX for a component
function generateJSX(component: BuilderComponent, options: ExportOptions, indent: number = 0): string {
  const spaces = ' '.repeat(indent)
  let jsx = ''
  
  // Determine the HTML tag
  let tag = 'div'
  let content = ''
  let attributes: string[] = []
  
  switch (component.category) {
    case 'HERO':
      tag = 'section'
      content = `
${spaces}  <div className="hero-content">
${spaces}    <h1>${component.props.title || 'Hero Title'}</h1>
${spaces}    <p>${component.props.subtitle || 'Hero subtitle'}</p>
${spaces}    <button>${component.props.buttonText || 'Get Started'}</button>
${spaces}  </div>`
      break
      
    case 'BUTTON':
      tag = 'button'
      content = component.props.text || 'Button'
      if (component.props.variant) {
        attributes.push(`data-variant="${component.props.variant}"`)
      }
      break
      
    case 'TEXT':
      const heading = component.props.heading || 'p'
      tag = heading
      content = component.props.content || 'Text content'
      if (component.props.alignment) {
        attributes.push(`style={{textAlign: '${component.props.alignment}'}}`)
      }
      break
      
    case 'IMAGE':
      tag = 'img'
      attributes.push(`src="${component.props.src || '/placeholder.jpg'}"`)
      attributes.push(`alt="${component.props.alt || 'Image'}"`)
      break
      
    case 'CARD':
      tag = 'div'
      content = `
${spaces}  <div className="card-content">
${spaces}    <h3>${component.props.title || 'Card Title'}</h3>
${spaces}    <p>${component.props.content || 'Card content'}</p>
${spaces}  </div>`
      break
      
    case 'TESTIMONIAL':
      tag = 'div'
      content = `
${spaces}  <blockquote>${component.props.quote || 'Testimonial quote'}</blockquote>
${spaces}  <div className="author">
${spaces}    <img src="${component.props.authorAvatar || '/avatar.jpg'}" alt="${component.props.authorName}" />
${spaces}    <div>
${spaces}      <div className="name">${component.props.authorName || 'Author Name'}</div>
${spaces}      <div className="title">${component.props.authorTitle || 'Author Title'}</div>
${spaces}    </div>
${spaces}  </div>`
      break
      
    case 'PRICING':
      tag = 'div'
      const features = (component.props.features || '').split('\n').filter(f => f.trim())
      content = `
${spaces}  <h3>${component.props.planName || 'Plan Name'}</h3>
${spaces}  <div className="price">${component.props.price || '$0/month'}</div>
${spaces}  <p>${component.props.description || 'Plan description'}</p>
${spaces}  <ul>
${features.map(feature => `${spaces}    <li>${feature.trim()}</li>`).join('\n')}
${spaces}  </ul>
${spaces}  <button>${component.props.buttonText || 'Get Started'}</button>`
      break
      
    default:
      content = `<!-- ${component.category} component -->`
  }
  
  // Add className for styling
  if (options.includeTailwind || options.includeStyles) {
    const classNames = generateClassNames(component, options)
    if (classNames) {
      attributes.push(`className="${classNames}"`)
    }
  }
  
  // Add style attribute if needed
  const inlineStyles = generateInlineStyles(component, options)
  if (inlineStyles) {
    attributes.push(`style={${inlineStyles}}`)
  }
  
  // Build the JSX
  const attrString = attributes.length > 0 ? ' ' + attributes.join(' ') : ''
  
  if (tag === 'img' || tag === 'br' || tag === 'hr') {
    jsx = `${spaces}<${tag}${attrString} />`
  } else {
    jsx = `${spaces}<${tag}${attrString}>${content}</${tag}>`
  }
  
  return jsx
}

// Generate CSS class names
function generateClassNames(component: BuilderComponent, options: ExportOptions): string {
  if (!options.includeTailwind && !options.includeStyles) return ''
  
  const classes: string[] = []
  
  // Add component-specific classes
  classes.push(component.category.toLowerCase().replace('_', '-'))
  
  if (options.includeTailwind) {
    // Add Tailwind classes based on styles
    const styles = component.styles
    
    if (styles.padding) {
      classes.push('p-4') // Convert to appropriate Tailwind class
    }
    if (styles.margin) {
      classes.push('m-4')
    }
    if (styles.backgroundColor) {
      classes.push('bg-blue-500') // Convert color to Tailwind
    }
    if (styles.borderRadius) {
      classes.push('rounded-lg')
    }
  }
  
  return classes.join(' ')
}

// Generate inline styles
function generateInlineStyles(component: BuilderComponent, options: ExportOptions): string {
  if (options.includeTailwind) return '' // Don't use inline styles with Tailwind
  
  const styles = component.styles
  if (!styles || Object.keys(styles).length === 0) return ''
  
  const styleEntries = Object.entries(styles)
    .map(([key, value]) => `${key}: '${value}'`)
    .join(', ')
  
  return `{${styleEntries}}`
}

// Generate complete project structure
export function generateProjectFiles(
  components: BuilderComponent[],
  options: ExportOptions,
  projectName: string = 'my-app'
): Record<string, string> {
  const files: Record<string, string> = {}
  
  // Generate package.json
  files['package.json'] = generatePackageJson(projectName, options)
  
  // Generate main App component
  files[`src/App.${options.typescript ? 'tsx' : 'jsx'}`] = generateAppComponent(components, options)
  
  // Generate individual components
  components.forEach(component => {
    const componentName = component.name.replace(/\s+/g, '') || 'Component'
    const fileName = `src/components/${componentName}.${options.typescript ? 'tsx' : 'jsx'}`
    files[fileName] = generateReactComponent(component, options)
  })
  
  // Generate styles
  if (options.includeStyles && !options.includeTailwind) {
    files['src/styles.css'] = generateGlobalStyles(components)
  }
  
  // Generate Tailwind config if using Tailwind
  if (options.includeTailwind) {
    files['tailwind.config.js'] = generateTailwindConfig()
    files['src/index.css'] = generateTailwindStyles()
  }
  
  // Generate Next.js specific files
  if (options.format === 'next') {
    files['next.config.js'] = generateNextConfig()
    files['pages/_app.js'] = generateNextApp(options)
  }
  
  return files
}

function generatePackageJson(projectName: string, options: ExportOptions): string {
  const dependencies: Record<string, string> = {
    'react': '^18.0.0',
    'react-dom': '^18.0.0'
  }
  
  const devDependencies: Record<string, string> = {}
  
  if (options.typescript) {
    devDependencies['typescript'] = '^5.0.0'
    devDependencies['@types/react'] = '^18.0.0'
    devDependencies['@types/react-dom'] = '^18.0.0'
  }
  
  if (options.includeTailwind) {
    devDependencies['tailwindcss'] = '^3.4.0'
    devDependencies['autoprefixer'] = '^10.4.0'
    devDependencies['postcss'] = '^8.4.0'
  }
  
  if (options.format === 'next') {
    dependencies['next'] = '^14.0.0'
  }
  
  return JSON.stringify({
    name: projectName,
    version: '1.0.0',
    private: true,
    scripts: {
      dev: options.format === 'next' ? 'next dev' : 'react-scripts start',
      build: options.format === 'next' ? 'next build' : 'react-scripts build',
      start: options.format === 'next' ? 'next start' : 'react-scripts start'
    },
    dependencies,
    devDependencies
  }, null, 2)
}

function generateAppComponent(components: BuilderComponent[], options: ExportOptions): string {
  const ext = options.typescript ? 'tsx' : 'jsx'
  
  let code = `import React from 'react'\n`
  
  if (options.includeStyles && !options.includeTailwind) {
    code += `import './styles.css'\n`
  }
  
  if (options.includeTailwind) {
    code += `import './index.css'\n`
  }
  
  // Import all components
  components.forEach(component => {
    const componentName = component.name.replace(/\s+/g, '') || 'Component'
    code += `import ${componentName} from './components/${componentName}'\n`
  })
  
  code += `\n`
  
  if (options.typescript) {
    code += `const App: React.FC = () => {\n`
  } else {
    code += `const App = () => {\n`
  }
  
  code += `  return (\n`
  code += `    <div className="app">\n`
  
  // Render all components
  components.forEach(component => {
    const componentName = component.name.replace(/\s+/g, '') || 'Component'
    code += `      <${componentName} />\n`
  })
  
  code += `    </div>\n`
  code += `  )\n`
  code += `}\n\n`
  code += `export default App\n`
  
  return code
}

function generateGlobalStyles(components: BuilderComponent[]): string {
  let css = `/* Global Styles */\n\n`
  css += `body {\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;\n  margin: 0;\n  padding: 0;\n}\n\n`
  css += `.app {\n  min-height: 100vh;\n}\n\n`
  
  // Add component-specific styles
  components.forEach(component => {
    const className = component.category.toLowerCase().replace('_', '-')
    css += `.${className} {\n`
    
    Object.entries(component.styles).forEach(([property, value]) => {
      const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase()
      css += `  ${cssProperty}: ${value};\n`
    })
    
    css += `}\n\n`
  })
  
  return css
}

function generateTailwindConfig(): string {
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`
}

function generateTailwindStyles(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;`
}

function generateNextConfig(): string {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig`
}

function generateNextApp(options: ExportOptions): string {
  return `import type { AppProps } from 'next/app'
${options.includeTailwind ? "import '../styles/globals.css'" : ''}

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}`
}

// Deployment functions
export async function deployToVercel(
  files: Record<string, string>,
  config: DeploymentConfig
): Promise<{ url: string; success: boolean; error?: string }> {
  try {
    // This would integrate with Vercel API
    // For now, simulate deployment
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    return {
      url: `https://${config.projectName}.vercel.app`,
      success: true
    }
  } catch (error) {
    return {
      url: '',
      success: false,
      error: error instanceof Error ? error.message : 'Deployment failed'
    }
  }
}

export async function deployToNetlify(
  files: Record<string, string>,
  config: DeploymentConfig
): Promise<{ url: string; success: boolean; error?: string }> {
  try {
    // This would integrate with Netlify API
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    return {
      url: `https://${config.projectName}.netlify.app`,
      success: true
    }
  } catch (error) {
    return {
      url: '',
      success: false,
      error: error instanceof Error ? error.message : 'Deployment failed'
    }
  }
}

// Create downloadable ZIP file
export function createProjectZip(files: Record<string, string>): Blob {
  // This would use JSZip or similar library
  // For now, create a simple text representation
  const content = Object.entries(files)
    .map(([path, content]) => `=== ${path} ===\n${content}\n\n`)
    .join('')
  
  return new Blob([content], { type: 'text/plain' })
}