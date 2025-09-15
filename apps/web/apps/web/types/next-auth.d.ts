import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: string
      plan: string
      onboardingStep: number
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role?: string
    plan?: string
    onboardingStep?: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string
    role: string
    plan: string
    onboardingStep: number
  }
}