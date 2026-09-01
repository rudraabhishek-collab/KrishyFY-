const React = require('react')

const NAV_STYLES = {
  nav: { background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  inner: { maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' },
  logo: { textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
  logoText: { fontSize: '20px', fontWeight: '900', color: '#166534', letterSpacing: '-0.5px' },
  logoSub: { fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '-2px' },
  links: { display: 'flex', alignItems: 'center', gap: '2px' },
  link: { color: '#64748b', textDecoration: 'none', fontWeight: '600', fontSize: '14px', padding: '6px 12px', borderRadius: '8px', transition: 'all 0.15s', whiteSpace: 'nowrap' },
  linkActive: { color: '#166534', background: '#f0fdf4' },
  divider: { width: '1px', height: '20px', background: '#e2e8f0', margin: '0 8px' },
  userChip: { display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px 6px 6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '999px' },
  avatar: { width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #166534, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: '800', flexShrink: 0 },
  userName: { fontSize: '13px', fontWeight: '700', color: '#0f172a', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  logoutBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: '600', padding: '6px 10px', borderRadius: '6px', transition: 'all 0.15s' },
  mobileMenu: { position: 'absolute', top: '64px', left: 0, right: 0, background: '#fff', borderTop: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50 },
  mobileLink: { display: 'block', padding: '14px 24px', color: '#334155', fontWeight: '600', fontSize: '15px', borderBottom: '1px solid #f1f5f9', textDecoration: 'none', transition: 'background 0.1s' },
  mobileLogout: { display: 'block', width: '100%', textAlign: 'left', padding: '14px 24px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '15px', borderTop: '1px solid #f1f5f9' },
  burgerBtn: { background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '4px' },
  burgerLine: { width: '18px', height: '2px', background: '#64748b', borderRadius: '1px', transition: 'all 0.2s' },
}

function Navbar() {
  const [user, setUser] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.authenticated && d.user) setUser(d.user); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function logout() {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      .finally(() => { window.location.href = '/login' })
  }

  const path = typeof window !== 'undefined' ? window.location.pathname : ''
  function isActive(href) {
    if (href === '/') return path === '/'
    return path.startsWith(href)
  }
  function linkStyle(href) {
    return { ...NAV_STYLES.link, ...(isActive(href) ? NAV_STYLES.linkActive : {}) }
  }

  function NavLink({ href, children }) {
    return React.createElement('a', { href, style: linkStyle(href) }, children)
  }

  function renderAuth() {
    if (loading) return null
    if (!user) return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
      React.createElement('a', { href: '/login', style: { ...NAV_STYLES.link, color: '#64748b' } }, 'Sign In'),
      React.createElement('a', { href: '/register', style: { background: '#166534', color: '#fff', textDecoration: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', boxShadow: '0 1px 2px rgba(22,101,52,0.2)' } }, 'Get Started')
    )
    const initials = user.name ? user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : 'U'
    return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
      React.createElement('div', { style: NAV_STYLES.userChip },
        React.createElement('div', { style: NAV_STYLES.avatar }, initials),
        React.createElement('span', { style: NAV_STYLES.userName }, user.name.split(' ')[0])
      ),
      React.createElement('button', { onClick: logout, style: NAV_STYLES.logoutBtn, onMouseEnter: e => e.target.style.color = '#dc2626', onMouseLeave: e => e.target.style.color = '#94a3b8' }, 'Sign out')
    )
  }

  function renderDesktopLinks() {
    if (loading) return null
    if (!user) return React.createElement('div', { style: NAV_STYLES.links },
      React.createElement(NavLink, { href: '/' }, 'Home'),
      React.createElement(NavLink, { href: '/marketplace' }, '🌾 Mandi'),
      React.createElement(NavLink, { href: '/auctions' }, '🏷️ Auctions'),
    )
    if (user.role === 'buyer') return React.createElement('div', { style: NAV_STYLES.links },
      React.createElement(NavLink, { href: '/' }, 'Home'),
      React.createElement(NavLink, { href: '/marketplace' }, '🌾 Mandi'),
      React.createElement(NavLink, { href: '/auctions' }, '🏷️ Auctions'),
      React.createElement(NavLink, { href: '/orders' }, 'Orders'),
      React.createElement(NavLink, { href: '/notifications' }, '🔔'),
    )
    if (user.role === 'farmer') return React.createElement('div', { style: NAV_STYLES.links },
      React.createElement(NavLink, { href: '/farmer' }, 'Dashboard'),
      React.createElement(NavLink, { href: '/farmer/crops' }, 'My Lots'),
      React.createElement(NavLink, { href: '/farmer/crops/new' }, '+ New Lot'),
      React.createElement(NavLink, { href: '/farmer/bids' }, 'Auctions'),
      React.createElement(NavLink, { href: '/farmer/orders' }, 'Orders'),
      React.createElement(NavLink, { href: '/notifications' }, '🔔'),
    )
    if (user.role === 'inspector') return React.createElement('div', { style: NAV_STYLES.links },
      React.createElement(NavLink, { href: '/inspector' }, '🔍 Inspection Queue'),
      React.createElement(NavLink, { href: '/notifications' }, '🔔'),
    )
    if (user.role === 'admin') return React.createElement('div', { style: NAV_STYLES.links },
      React.createElement(NavLink, { href: '/admin' }, 'Dashboard'),
      React.createElement(NavLink, { href: '/admin/users' }, 'Users'),
      React.createElement(NavLink, { href: '/admin/crops' }, 'Lots'),
      React.createElement(NavLink, { href: '/admin/auctions' }, 'Auctions'),
      React.createElement(NavLink, { href: '/admin/orders' }, 'Orders'),
      React.createElement(NavLink, { href: '/admin/payments' }, 'Payments'),
    )
    return null
  }

  function renderMobileMenu() {
    if (!open) return null
    const links = []
    const add = (href, label) => links.push(React.createElement('a', { key: href, href, style: NAV_STYLES.mobileLink, onClick: () => setOpen(false) }, label))

    if (!user) {
      add('/', 'Home'); add('/marketplace', '🌾 Mandi'); add('/auctions', '🏷️ Auctions')
      add('/login', 'Sign In'); add('/register', 'Get Started')
    } else if (user.role === 'buyer') {
      add('/', 'Home'); add('/marketplace', '🌾 Mandi'); add('/auctions', '🏷️ Auctions')
      add('/orders', 'My Orders'); add('/notifications', '🔔 Notifications')
      links.push(React.createElement('button', { key: 'lo', onClick: () => { setOpen(false); logout() }, style: NAV_STYLES.mobileLogout }, 'Sign Out'))
    } else if (user.role === 'farmer') {
      add('/farmer', 'Dashboard'); add('/farmer/crops', 'My Lots'); add('/farmer/crops/new', '+ New Lot')
      add('/farmer/bids', 'Auctions'); add('/farmer/orders', 'Orders'); add('/notifications', '🔔 Notifications')
      links.push(React.createElement('button', { key: 'lo', onClick: () => { setOpen(false); logout() }, style: NAV_STYLES.mobileLogout }, 'Sign Out'))
    } else if (user.role === 'inspector') {
      add('/inspector', '🔍 Inspection Queue'); add('/notifications', '🔔 Notifications')
      links.push(React.createElement('button', { key: 'lo', onClick: () => { setOpen(false); logout() }, style: NAV_STYLES.mobileLogout }, 'Sign Out'))
    } else if (user.role === 'admin') {
      add('/admin', 'Dashboard'); add('/admin/users', 'Users'); add('/admin/crops', 'Lots')
      add('/admin/auctions', 'Auctions'); add('/admin/orders', 'Orders'); add('/admin/payments', 'Payments')
      links.push(React.createElement('button', { key: 'lo', onClick: () => { setOpen(false); logout() }, style: NAV_STYLES.mobileLogout }, 'Sign Out'))
    } else {
      add('/', 'Home')
      links.push(React.createElement('button', { key: 'lo', onClick: () => { setOpen(false); logout() }, style: NAV_STYLES.mobileLogout }, 'Sign Out'))
    }
    return React.createElement('div', { style: NAV_STYLES.mobileMenu }, ...links)
  }

  return React.createElement('nav', { style: NAV_STYLES.nav },
    React.createElement('div', { style: NAV_STYLES.inner },
      // Logo
      React.createElement('a', { href: '/', style: NAV_STYLES.logo },
        React.createElement('div', null,
          React.createElement('div', { style: NAV_STYLES.logoText }, '🌾 Krishify'),
          React.createElement('div', { style: NAV_STYLES.logoSub }, 'Digital Mandi')
        )
      ),
      // Desktop nav links
      React.createElement('div', { className: 'hidden-mobile' }, renderDesktopLinks()),
      // Right side: auth + hamburger
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
        React.createElement('div', { className: 'hidden-mobile' }, renderAuth()),
        React.createElement('button', {
          onClick: () => setOpen(o => !o),
          className: 'mobile-hamburger',
          style: NAV_STYLES.burgerBtn,
          'aria-label': 'Menu'
        },
          React.createElement('span', { style: NAV_STYLES.burgerLine }),
          React.createElement('span', { style: NAV_STYLES.burgerLine }),
          React.createElement('span', { style: NAV_STYLES.burgerLine })
        )
      ),
      renderMobileMenu()
    )
  )
}

module.exports = Navbar
