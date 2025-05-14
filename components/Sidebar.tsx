import Link from 'next/link'
import { useRouter } from 'next/router'

const Sidebar = () => {
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
    <aside style={{ width: '220px', padding: '1rem', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>HappyMe Plus</h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Link href="/" style={linkStyle('/')}>Journal</Link>
                <Link href="/groups" style={linkStyle('/groups')}>Groups</Link>
        <Link href="/settings" style={linkStyle('/settings')}>Settings</Link>
      </nav>
    </aside>
  )
}

export default Sidebar
