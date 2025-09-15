# 🤖 AI Website Builder

> - AI-Powered Full-Stack Website Builder**

[![GitHub stars](https://img.shields.io/github/stars/HemaSagarKoppusetti/ai-website-builder?style=social)](https://github.com/HemaSagarKoppusetti/ai-website-builder)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white)](https://openai.com/)

**The most advanced no-code website builder with AI-powered design assistance, full code ownership, and one-click deployment.**

## 🎯 Problem Statement

Built for **HackWithHyderabad 2025**, addressing the challenge:
> "Develop a platform that enables non-technical users to create and deploy full-stack web applications using intuitive drag-and-drop tools integrated with AI-assisted code generation."

## ✨ Key Features

### 🎨 **Visual Builder**
- **Advanced Drag & Drop** - Professional-grade interface with `@dnd-kit`
- **Responsive Canvas** - Desktop, tablet, mobile viewport simulation
- **Component Palette** - Categorized templates (Hero, Cards, Forms, etc.)
- **Real-time Editing** - Live property editing with instant preview

### 🤖 **AI-Powered Generation**
- **Multi-AI Support** - OpenAI GPT-4 & Anthropic Claude integration
- **Smart Code Generation** - Production-ready React/TypeScript components
- **Content Creation** - AI-generated copy and styling suggestions
- **Cost Tracking** - Built-in usage analytics and optimization

### 💻 **Code Ownership**
- **Full Export** - Complete Next.js project with source code
- **Production Ready** - Formatted, validated, and optimized code
- **No Vendor Lock-in** - Export and modify anywhere
- **Version Control** - Built-in Git-like versioning system

### 🚀 **One-Click Deployment**
- **Multiple Platforms** - Vercel, Netlify, GitHub Pages
- **Automated CI/CD** - Build and deployment pipeline
- **Custom Domains** - SSL certificates and domain management
- **Performance Optimization** - Automatic code splitting and caching

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Radix UI** - Accessible component primitives

### AI & Backend
- **OpenAI GPT-4** - Advanced code generation
- **Anthropic Claude** - Fallback and specialized tasks
- **Prisma ORM** - Type-safe database operations
- **PostgreSQL** - Robust data storage
- **NextAuth.js** - Authentication system

### Developer Experience
- **Turborepo** - Monorepo build system
- **Zustand** - Lightweight state management
- **@dnd-kit** - Accessible drag and drop
- **Prettier** - Code formatting
- **ESLint** - Code linting

## 📦 Project Structure

```
ai-website-builder/
├── apps/
│   ├── web/                 # Main Next.js application
│   └── docs/                # Documentation site
├── packages/
│   ├── ai-engine/           # AI code generation engine
│   ├── database/            # Prisma schema & services
│   ├── ui/                  # Shared UI components
│   ├── eslint-config/       # Shared ESLint config
│   └── typescript-config/   # Shared TypeScript config
├── PROJECT_ANALYSIS.md     # Comprehensive analysis
├── WARP.md                 # Development guidance
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI API key
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/ai-website-builder.git
cd ai-website-builder
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your API keys and database URL
```

4. **Set up database**
```bash
cd packages/database
npm run generate
npm run db:push
cd ../..
```

5. **Start development servers**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application!

## 📊 Current Status

**🎯 Hackathon Ready: ~50% Complete**

### ✅ **Implemented (Strong Foundation)**
- [x] Advanced drag-and-drop builder system
- [x] Comprehensive AI engine with multi-provider support
- [x] Professional landing page and UI framework
- [x] Complete database schema with relationships
- [x] Component palette with categorized templates
- [x] State management with persistence
- [x] Responsive canvas with device simulation
- [x] Authentication system architecture
- [x] Monorepo structure with proper tooling

### 🚧 **In Development (Demo Critical)**
- [ ] AI Chat Assistant UI interface
- [ ] Code export functionality
- [ ] Live preview system
- [ ] Deployment integration APIs
- [ ] Component tree visualization
- [ ] Database schema visualizer

## 📚 Documentation

- **[PROJECT_ANALYSIS.md](./PROJECT_ANALYSIS.md)** - Comprehensive feature analysis and development roadmap
- **[WARP.md](./WARP.md)** - Development commands and architecture guide
- **[Complete_guide.txt](./Complete_guide.txt)** - Detailed implementation guide
- **[Problem_Statement_1.txt](./Problem_Statement_1.txt)** - Original hackathon requirements



## 🙏 Acknowledgments

- **HackWithHyderabad 2025** organizers for the inspiring challenge
- **OpenAI & Anthropic** for powerful AI APIs
- **Vercel** for Next.js and deployment platform
- **Open Source Community** for amazing tools and libraries

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

 

</div>
