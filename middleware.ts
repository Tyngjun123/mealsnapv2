// Phase 1: No auth middleware — localStorage handles auth
// Phase 2: swap back to:
//   export { default } from 'next-auth/middleware'
//   export const config = { matcher: ['/', '/history', '/stats', '/profile', '/camera', '/result'] }

export function middleware() {}
export const config = { matcher: [] }
