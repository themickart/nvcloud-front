import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const protectedPaths = [
    '/dashboard',
    '/profile',
    '/container'
]

const guestPaths = [
    '/login',
    '/register'
]

const API_URL = process.env.API_URL || 'https://api.nv-server.online'

async function verifyToken(token: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/api/v1/auth/token/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        return response.ok
    } catch (error) {
        console.error('Token verification failed:', error)
        return false
    }
}

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    const token = request.cookies.get('authToken')?.value

    if (path.startsWith('/api')) {
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const isValid = await verifyToken(token)
        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            )
        }

        return NextResponse.next()
    }

    if (protectedPaths.some(p => path.startsWith(p))) {
        if (!token) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('from', path)
            return NextResponse.redirect(loginUrl)
        }

        const isValid = await verifyToken(token)
        if (!isValid) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('from', path)
            return NextResponse.redirect(loginUrl)
        }
    }
    if (guestPaths.some(p => path.startsWith(p))) {
        if (token) {
            const isValid = await verifyToken(token)
            if (isValid) {
                return NextResponse.redirect(new URL('/profile', request.url))
            }
        }
    }

    return NextResponse.next()
}