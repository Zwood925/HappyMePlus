import Link from 'next/link'
import { ReactNode } from 'react'
import { useRouter } from 'next/router'
import LogoutButton from './LogoutButton'

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter()

  const linkStyle = (path: string) => ({
    display: 'block',
    padding: '0.75rem 1rem',
    fontWeight: router.pathname === path ? 'bold' : 'normal',
    backgroundColor: router.pathname === path ? '#f3f4f6' : 'transparent',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    color: '#333'
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: '220px', padding: '1.5rem', backgroundColor: '#f9f9f9' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', cursor: 'pointer' }}>
            HappyMe Plus
          </h2>
        </Link>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/journal" style={linkStyle('/journal')}>Journal</Link>
          
          <Link href="/groups" style={linkStyle('/groups')}>Groups</Link>
          <Link href="/settings" style={linkStyle('/settings')}>Settings</Link>
          <div style={{ marginTop: '1rem' }}>
            <LogoutButton />
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main style={{ flexGrow: 1, padding: '2rem' }}>
        {children}
      </main>
    </div>
  )
}
