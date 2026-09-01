const React = require('react')

function Navbar() {
  const [user, setUser] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [menuOpen, setMenuOpen] = React.useState(false)

  React.useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.authenticated && d.user) setUser(d.user); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function handleLogout() {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      .finally(() => { window.location.href = '/login' })
  }

  const link = { color: '#166534', textDecoration: 'none', fontWeight: '600', fontSize: '14px', padding: '6px 10px', borderRadius: '6px' }
  const btn = { background: '#166534', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 16px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', textDecoration: 'none', display: 'inline-block' }
  const outline = { background: 'transparent', color: '#166534', border: '1.5px solid #166534', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }

  function L({ href, children }) {
    const active = typeof window !== 'undefined' && window.location.pathname.startsWith(href) && href !== '/' || (typeof window !== 'undefined' && window.location.pathname === href)
    return React.createElement('a', { href, style: { ...link, background: active ? '#dcfce7' : 'transparent' } }, children)
  }

  function DesktopNav() {
    if (loading) return null
    const name = user ? user.name.split(' ')[0] : ''

    if (!user) return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
      React.createElement(L, { href: '/' }, 'Home'),
      React.createElement(L, { href: '/marketplace' }, '🌾 Mandi'),
      React.createElement(L, { href: '/auctions' }, '🏷️ Auctions'),
      React.createElement('a', { href: '/login', style: { ...outline, marginLeft: '8px' } }, 'Login'),
      React.createElement('a', { href: '/register', style: { ...btn, marginLeft: '4px' } }, 'Register')
    )

    if (user.role === 'buyer') return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
      React.createElement(L, { href: '/' }, 'Home'),
      React.createElement(L, { href: '/marketplace' }, '🌾 Mandi'),
      React.createElement(L, { href: '/auctions' }, '🏷️ Auctions'),
      React.createElement(L, { href: '/orders' }, '📦 Orders'),
      React.createElement(L, { href: '/notifications' }, '🔔'),
      React.createElement('span', { style: { fontSize: '13px', color: '#555', marginLeft: '8px' } }, 'Hi, ' + name),
      React.createElement('button', { onClick: handleLogout, style: { ...outline, marginLeft: '6px' } }, 'Logout')
    )

    if (user.role === 'farmer') return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
      React.createElement(L, { href: '/' }, 'Home'),
      React.createElement(L, { href: '/farmer' }, '📊 Dashboard'),
      React.createElement(L, { href: '/farmer/crops' }, 'My Lots'),
      React.createElement(L, { href: '/farmer/crops/new' }, '+ New Lot'),
      React.createElement(L, { href: '/farmer/bids' }, '🏷️ Auctions'),
      React.createElement(L, { href: '/farmer/orders' }, '📦 Orders'),
      React.createElement(L, { href: '/notifications' }, '🔔'),
      React.createElement('span', { style: { fontSize: '13px', color: '#555', marginLeft: '8px' } }, 'Hi, ' + name),
      React.createElement('button', { onClick: handleLogout, style: { ...outline, marginLeft: '6px' } }, 'Logout')
    )

    if (user.role === 'inspector') return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
      React.createElement(L, { href: '/' }, 'Home'),
      React.createElement(L, { href: '/inspector' }, '🔍 Inspection Queue'),
      React.createElement(L, { href: '/notifications' }, '🔔'),
      React.createElement('span', { style: { fontSize: '13px', color: '#555', marginLeft: '8px' } }, 'Inspector: ' + name),
      React.createElement('button', { onClick: handleLogout, style: { ...outline, marginLeft: '6px' } }, 'Logout')
    )

    if (user.role === 'admin') return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
      React.createElement(L, { href: '/admin' }, '⚙️ Dashboard'),
      React.createElement(L, { href: '/admin/users' }, 'Users'),
      React.createElement(L, { href: '/admin/crops' }, 'Lots'),
      React.createElement(L, { href: '/admin/auctions' }, 'Auctions'),
      React.createElement(L, { href: '/admin/orders' }, 'Orders'),
      React.createElement(L, { href: '/admin/payments' }, 'Payments'),
      React.createElement(L, { href: '/admin/delivery' }, 'Delivery'),
      React.createElement(L, { href: '/admin/reviews' }, 'Reviews'),
      React.createElement('button', { onClick: handleLogout, style: { ...outline, marginLeft: '6px' } }, 'Logout')
    )

    return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
      React.createElement(L, { href: '/' }, 'Home'),
      React.createElement('span', { style: { fontSize: '13px', color: '#555', marginLeft: '8px' } }, 'Hi, ' + name),
      React.createElement('button', { onClick: handleLogout, style: { ...outline, marginLeft: '6px' } }, 'Logout')
    )
  }

  function MobileMenu() {
    if (!menuOpen) return null

    const links = []
    const add = (href, label) => links.push(
      React.createElement('a', { key: href, href, onClick: () => setMenuOpen(false),
        style: { display: 'block', padding: '12px 20px', color: '#166534', textDecoration: 'none', fontWeight: '600', fontSize: '15px', borderBottom: '1px solid #f0fdf4' }
      }, label)
    )
    const logoutBtn = React.createElement('button', { key: 'lo', onClick: () => { setMenuOpen(false); handleLogout() },
      style: { display: 'block', width: '100%', textAlign: 'left', padding: '12px 20px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '15px' }
    }, 'Logout')

    if (!user) {
      add('/', 'Home'); add('/marketplace', '🌾 Mandi'); add('/auctions', '🏷️ Auctions')
      add('/login', 'Login'); add('/register', 'Register')
    } else if (user.role === 'buyer') {
      add('/', 'Home'); add('/marketplace', '🌾 Mandi'); add('/auctions', '🏷️ Auctions')
      add('/orders', '📦 My Orders'); add('/notifications', '🔔 Notifications')
      links.push(logoutBtn)
    } else if (user.role === 'farmer') {
      add('/', 'Home'); add('/farmer', '📊 Dashboard'); add('/farmer/crops', 'My Lots')
      add('/farmer/crops/new', '+ New Lot'); add('/farmer/bids', '🏷️ Auctions')
      add('/farmer/orders', '📦 Orders'); add('/farmer/delivery', '🚚 Delivery')
      add('/notifications', '🔔 Notifications'); links.push(logoutBtn)
    } else if (user.role === 'inspector') {
      add('/', 'Home'); add('/inspector', '🔍 Inspection Queue')
      add('/notifications', '🔔 Notifications'); links.push(logoutBtn)
    } else if (user.role === 'admin') {
      add('/admin', '⚙️ Dashboard'); add('/admin/users', 'Users'); add('/admin/crops', 'Lots')
      add('/admin/auctions', 'Auctions'); add('/admin/orders', 'Orders')
      add('/admin/payments', 'Payments'); add('/admin/delivery', 'Delivery')
      add('/admin/reviews', 'Reviews'); links.push(logoutBtn)
    } else {
      add('/', 'Home'); links.push(logoutBtn)
    }

    return React.createElement('div', {
      style: { position: 'absolute', top: '64px', left: 0, right: 0, background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, borderTop: '2px solid #dcfce7' }
    }, ...links)
  }

  return React.createElement('nav', {
    style: { background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }
  },
    React.createElement('div', {
      style: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }
    },
      React.createElement('a', { href: '/', style: { textDecoration: 'none' } },
        React.createElement('span', { style: { fontSize: '22px', fontWeight: '900', color: '#166534', letterSpacing: '-0.5px' } }, '🌾 Krishify')
      ),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center' }, className: 'hidden-mobile' },
        React.createElement(DesktopNav)
      ),
      React.createElement('button', {
        onClick: () => setMenuOpen(!menuOpen), className: 'mobile-hamburger',
        style: { background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }, 'aria-label': 'Menu'
      },
        React.createElement('span', { style: { display: 'block', width: '22px', height: '2px', background: '#166534', marginBottom: '5px' } }),
        React.createElement('span', { style: { display: 'block', width: '22px', height: '2px', background: '#166534', marginBottom: '5px' } }),
        React.createElement('span', { style: { display: 'block', width: '22px', height: '2px', background: '#166534' } })
      ),
      React.createElement(MobileMenu)
    )
  )
}

module.exports = Navbar
