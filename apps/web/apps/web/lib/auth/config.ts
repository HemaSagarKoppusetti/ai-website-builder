import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import EmailProvider from 'next-auth/providers/email'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '../db'
import { sendWelcomeEmail } from './email'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/onboarding',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { 
            profile: true,
            subscription: true 
          }
        })

        if (!user) {
          throw new Error('User not found')
        }

        // For demo purposes - in production, store hashed passwords
        // const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        // if (!isPasswordValid) {
        //   throw new Error('Invalid password')
        // }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          // Check if user exists
          const existingUser = await db.user.findUnique({
            where: { email: user.email! },
            include: { profile: true }
          })

          if (!existingUser) {
            // Create new user with profile
            await db.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                profile: {
                  create: {
                    preferences: {},
                    onboardingStep: 0
                  }
                },
                subscription: {
                  create: {
                    plan: 'FREE',
                    status: 'ACTIVE',
                    features: {
                      maxProjects: 3,
                      maxComponentsPerProject: 50,
                      aiRequestsPerMonth: 100
                    },
                    limits: {
                      storage: '100MB',
                      bandwidth: '1GB'
                    }
                  }
                }
              }
            })

            // Send welcome email
            await sendWelcomeEmail(user.email!, user.name || 'User')
          }

          return true
        } catch (error) {
          console.error('Error creating user:', error)
          return false
        }
      }

      return true
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        // First time JWT callback is run, user object is available
        const dbUser = await db.user.findUnique({
          where: { email: user.email! },
          include: {
            profile: true,
            subscription: true
          }
        })

        if (dbUser) {
          token.userId = dbUser.id
          token.role = dbUser.profile?.preferences?.role || 'user'
          token.plan = dbUser.subscription?.plan || 'FREE'
          token.onboardingStep = dbUser.profile?.onboardingStep || 0
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string
        session.user.role = token.role as string
        session.user.plan = token.plan as string
        session.user.onboardingStep = token.onboardingStep as number
      }

      return session
    },
  },
  events: {
    async createUser({ user }) {
      // Log user creation activity
      await db.userActivity.create({
        data: {
          userId: user.id,
          type: 'LOGIN',
          description: 'User account created',
          metadata: {
            provider: 'registration',
            timestamp: new Date().toISOString()
          }
        }
      })
    },
    async signIn({ user, account, isNewUser }) {
      // Log sign in activity
      if (user.id) {
        await db.userActivity.create({
          data: {
            userId: user.id,
            type: 'LOGIN',
            description: `User signed in via ${account?.provider || 'credentials'}`,
            metadata: {
              provider: account?.provider,
              isNewUser,
              timestamp: new Date().toISOString()
            }
          }
        })
      }
    },
    async signOut({ session }) {
      // Log sign out activity
      if (session?.user?.id) {
        await db.userActivity.create({
          data: {
            userId: session.user.id,
            type: 'LOGOUT',
            description: 'User signed out',
            metadata: {
              timestamp: new Date().toISOString()
            }
          }
        })
      }
    },
  },
}