const React = require('react')

function Navbar() {
  const [user, setUser] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [menuOpen, setMenuOpen] = React.useState(false)

  React.useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.authenticated && data.user) setUser(data.user)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function logout() {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      .finally(() => { window.location.href = '/login' })
  }

  const linkStyle = { color: '#166534', textDecoration: 'none', fontWeight: '500', fontSize: '14px', padding: '6px 10px', borderRadius: '6px', transition: 'background 0.15s' }
  const btnStyle = { background: '#166534', color: '#fff', border: 'none', borderRadius: '6px', padding: '7px 16px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }
  const outlineBtnStyle = { background: 'transparent', color: '#166534', border: '1.5px solid #166534', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }

  function NavLink({ href, children }) {
    const isActive = typeof window !== 'undefined' && window.location.pathname === href
    return React.createElement('a', {
      href,
      style: { ...linkStyle, background: isActive ? '#dcfce7' : 'transparent' }
    }, children)
  }

  function renderLinks() {
    if (loading) return null

    if (!user) {
      return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        React.createElement(NavLink, { href: '/' }, 'Home'),
        React.createElement(NavLink, { href: '/marketplace' }, 'Marketplace'),
        React.createElement(NavLink, { href: '/auctions' }, 'Auctions'),
        React.createElement('div', { style: { display: 'flex', gap: '8px', marginLeft: '8px' } },
          React.createElement('a', { href: '/login', style: outlineBtnStyle }, 'Login'),
          React.createElement('a', { href: '/register', style: btnStyle }, 'Register')
        )
      )
    }

    if (user.role === 'buyer') {
      return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
        React.createElement(NavLink, { href: '/' }, 'Home'),
        React.createElement(NavLink, { href: '/marketplace' }, 'Marketplace'),
        React.createElement(NavLink, { href: '/auctions' }, 'Auctions'),
        React.createElement(NavLink, { href: '/orders' }, 'My Orders'),
        React.createElement(NavLink, { href: '/notifications' }, '🔔 Notifications'),
        React.createElement('span', { style: { marginLeft: '8px', fontSize: '13px', color: '#555' } }, `Hi, ${user.name.split(' ')[0]}`),
        React.createElement('button', { onClick: logout, style: outlineBtnStyle }, 'Logout')
      )
    }

    if (user.role === 'farmer') {
      return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
        React.createElement(NavLink, { href: '/' }, 'Home'),
        React.createElement(NavLink, { href: '/farmer' }, 'Dashboard'),
        React.createElement(NavLink, { href: '/farmer/crops' }, 'My Crops'),
        React.createElement(NavLink, { href: '/farmer/crops/new' }, '+ New Crop'),
        React.createElement(NavLink, { href: '/farmer/bids' }, 'Auctions'),
        React.createElement(NavLink, { href: '/farmer/orders' }, 'Orders'),
        React.createElement(NavLink, { href: '/farmer/delivery' }, 'Delivery'),
        React.createElement(NavLink, { href: '/notifications' }, '🔔 Notifications'),
        React.createElement('span', { style: { marginLeft: '8px', fontSize: '13px', color: '#555' } }, `Hi, ${user.name.split(' ')[0]}`),
        React.createElement('button', { onClick: logout, style: outlineBtnStyle }, 'Logout')
      )
    }

    if (user.role === 'admin') {
      return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
        React.createElement(NavLink, { href: '/admin' }, 'Dashboard'),
        React.createElement(NavLink, { href: '/admin/users' }, 'Users'),
        React.createElement(NavLink, { href: '/admin/crops' }, 'Crops'),
        React.createElement(NavLink, { href: '/admin/auctions' }, 'Auctions'),
        React.createElement(NavLink, { href: '/admin/orders' }, 'Orders'),
        React.createElement(NavLink, { href: '/admin/delivery' }, 'Deliveries'),
        React.createElement(NavLink, { href: '/admin/reviews' }, 'Reviews'),
        React.createElement('button', { onClick: logout, style: outlineBtnStyle }, 'Logout')
      )
    }

    return null
  }

  function renderMobileLinks() {
    if (loading || !menuOpen) return null

    const items = []
    const addLink = (href, label) => items.push(
      React.createElement('a', {
        key: href,
        href,
        style: { display: 'block', padding: '10px 16px', color: '#166534', textDecoration: 'none', fontWeight: '500', borderBottom: '1px solid #f0fdf4' },
        onClick: () => setMenuOpen(false)
      }, label)
    )

    if (!user) {
      addLink('/', 'Home')
      addLink('/marketplace', 'Marketplace')
      addLink('/auctions', 'Auctions')
      addLink('/login', 'Login')
      addLink('/register', 'Register')
    } else if (user.role === 'buyer') {
      addLink('/', 'Home')
      addLink('/marketplace', 'Marketplace')
      addLink('/auctions', 'Auctions')
      addLink('/orders', 'My Orders')
      addLink('/notifications', '🔔 Notifications')
      items.push(React.createElement('button', {
        key: 'logout',
        onClick: logout,
        style: { display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }
      }, 'Logout'))
    } else if (user.role === 'farmer') {
      addLink('/', 'Home')
      addLink('/farmer/crops', 'My Crops')
      addLink('/farmer/crops/new', '+ New Crop')
      addLink('/farmer/bids', 'Bids')
      addLink('/farmer/orders', 'Orders')
      addLink('/farmer/delivery', 'Delivery')
      addLink('/notifications', '🔔 Notifications')
      items.push(React.createElement('button', {
        key: 'logout',
        onClick: logout,
        style: { display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }
      }, 'Logout'))
    } else if (user.role === 'admin') {
      addLink('/admin', 'Dashboard')
      addLink('/admin/users', 'Users')
      addLink('/admin/crops', 'Crops')
      addLink('/admin/auctions', 'Auctions')
      addLink('/admin/orders', 'Orders')
      addLink('/admin/delivery', 'Deliveries')
      addLink('/admin/reviews', 'Reviews')
      items.push(React.createElement('button', {
        key: 'logout',
        onClick: logout,
        style: { display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }
      }, 'Logout'))
    }

    return React.createElement('div', {
      style: { position: 'absolute', top: '64px', left: 0, right: 0, background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, borderTop: '1px solid #e5e7eb' }
    }, ...items)
  }

  return React.createElement('nav', {
    style: { background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }
  },
    React.createElement('div', {
      style: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }
    },
      // Logo
      React.createElement('a', {
        href: '/',
        style: { textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }
      },
        React.createElement('span', {
          style: { fontSize: '22px', fontWeight: '800', color: '#166534', letterSpacing: '-0.5px' }
        }, '🌾 Krishify')
      ),
      // Desktop nav
      React.createElement('div', {
        style: { display: 'flex', alignItems: 'center', gap: '4px' },
        className: 'hidden-mobile'
      }, renderLinks()),
      // Mobile hamburger
      React.createElement('button', {
        onClick: () => setMenuOpen(!menuOpen),
        style: { background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'none' },
        className: 'mobile-hamburger',
        'aria-label': 'Toggle menu'
      },
        React.createElement('span', { style: { display: 'block', width: '22px', height: '2px', background: '#166534', marginBottom: '5px', transition: 'all 0.2s' } }),
        React.createElement('span', { style: { display: 'block', width: '22px', height: '2px', background: '#166534', marginBottom: '5px', transition: 'all 0.2s' } }),
        React.createElement('span', { style: { display: 'block', width: '22px', height: '2px', background: '#166534', transition: 'all 0.2s' } })
      ),
      renderMobileLinks()
    )
  )
}

module.exports = Navbar
