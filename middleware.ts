// Phase 2: Google OAuth protection enabled
export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/', '/history', '/stats', '/profile', '/camera', '/result'],
}
