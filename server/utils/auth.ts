import { SignJWT, jwtVerify } from 'jose'
import type { H3Event } from 'h3'

// ============================================
// Types
// ============================================

export interface AuthUser {
  id: string
  username: string
  role: 'demo' | 'admin'
}

export interface TokenPayload {
  sub: string
  username: string
  role: 'demo' | 'admin'
  iat: number
  exp: number
}

// ============================================
// Configuration
// ============================================

const TOKEN_EXPIRY = '7d' // Token expires in 7 days
const COOKIE_NAME = 'tephra_session'

// Demo accounts (hardcoded for hackathon)
const DEMO_ACCOUNTS: Record<string, { password: string; role: 'demo' | 'admin' }> = {
  demo: { password: 'babylon2025', role: 'demo' },
  admin: { password: 'admin2025', role: 'admin' },
}

// ============================================
// JWT Utilities
// ============================================

function getSecretKey(): Uint8Array {
  const config = useRuntimeConfig()
  const secret = config.authSecret || 'tephra-dev-secret-key-change-in-production'
  return new TextEncoder().encode(secret)
}

export async function createToken(user: AuthUser): Promise<string> {
  const secret = getSecretKey()
  
  const token = await new SignJWT({
    sub: user.id,
    username: user.username,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(secret)
  
  return token
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = getSecretKey()
    const { payload } = await jwtVerify(token, secret)
    
    return {
      sub: payload.sub as string,
      username: payload.username as string,
      role: payload.role as 'demo' | 'admin',
      iat: payload.iat as number,
      exp: payload.exp as number,
    }
  } catch {
    return null
  }
}

// ============================================
// Authentication Functions
// ============================================

export async function authenticateUser(
  username: string,
  password: string
): Promise<AuthUser | null> {
  const account = DEMO_ACCOUNTS[username.toLowerCase()]
  
  if (!account || account.password !== password) {
    return null
  }
  
  return {
    id: `user_${username.toLowerCase()}`,
    username: username.toLowerCase(),
    role: account.role,
  }
}

// ============================================
// Cookie Management
// ============================================

export function setAuthCookie(event: H3Event, token: string): void {
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export function getAuthCookie(event: H3Event): string | undefined {
  return getCookie(event, COOKIE_NAME)
}

export function clearAuthCookie(event: H3Event): void {
  deleteCookie(event, COOKIE_NAME, {
    path: '/',
  })
}

// ============================================
// Session Helpers
// ============================================

export async function getSessionFromEvent(event: H3Event): Promise<AuthUser | null> {
  const token = getAuthCookie(event)
  
  if (!token) {
    return null
  }
  
  const payload = await verifyToken(token)
  
  if (!payload) {
    // Invalid token, clear the cookie
    clearAuthCookie(event)
    return null
  }
  
  return {
    id: payload.sub,
    username: payload.username,
    role: payload.role,
  }
}

export async function requireAuth(event: H3Event): Promise<AuthUser> {
  const user = await getSessionFromEvent(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Please log in to access this resource',
    })
  }
  
  return user
}

// ============================================
// Utility Functions
// ============================================

export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username)
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6
}

