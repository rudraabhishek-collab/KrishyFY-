const React = require('react')

const S = {
  // Layout
  section: { padding: '80px 20px' },
  container: { maxWidth: '1200px', margin: '0 auto' },
  // Hero
  heroBg: {
    background: 'linear-gradient(135deg, #052e16 0%, #14532d 40%, #166534 100%)',
    padding: '100px 20px 80px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroTag: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    background: 'rgba(255,255,255,0.15)', borderRadius: '999px',
    padding: '6px 16px', fontSize: '13px', color: '#bbf7d0',
    fontWeight: '600', marginBottom: '24px', backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  heroH1: {
    fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: '900',
    color: '#fff', margin: '0 0 20px 0', lineHeight: '1.1',
    letterSpacing: '-1.5px',
  },
  heroSub: { fontSize: '18px', color: '#bbf7d0', margin: '0 0 36px 0', maxWidth: '540px', lineHeight: '1.6' },
  heroBtnPrimary: {
    display: 'inline-block', padding: '14px 28px', background: '#fff',
    color: '#166534', borderRadius: '10px', fontWeight: '800', fontSize: '15px',
    textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    transition: 'transform 0.15s', border: 'none', cursor: 'pointer',
  },
  heroBtnSecondary: {
    display: 'inline-block', padding: '13px 28px',
    background: 'rgba(255,255,255,0.12)', color: '#fff',
    border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: '10px',
    fontWeight: '700', fontSize: '15px', textDecoration: 'none',
    backdropFilter: 'blur(4px)',
  },
  // Stats bar
  statsBar: {
    background: '#fff', borderBottom: '1px solid #e5e7eb',
    padding: '28px 20px',
  },
  statItem: { textAlign: 'center' },
  statNum: { fontSize: '32px', fontWeight: '900', color: '#166534', lineHeight: 1 },
  statLabel: { fontSize: '13px', color: '#6b7280', fontWeight: '500', marginTop: '4px' },
  // Section headings
  sectionLabel: {
    display: 'inline-block', background: '#dcfce7', color: '#166534',
    borderRadius: '999px', padding: '4px 14px', fontSize: '12px',
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px',
  },
  sectionH2: {
    fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: '900',
    color: '#111827', margin: '0 0 16px 0', lineHeight: '1.15', letterSpacing: '-0.5px',
  },
  sectionSub: { fontSize: '17px', color: '#6b7280', lineHeight: '1.7', maxWidth: '560px' },
  // Cards
  card: {
    background: '#fff', borderRadius: '16px', padding: '28px',
    border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.2s, transform 0.2s',
  },
  featureIcon: {
    width: '52px', height: '52px', borderRadius: '14px',
    background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '24px', marginBottom: '16px', flexShrink: 0,
  },
  featureTitle: { fontSize: '17px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' },
  featureDesc: { fontSize: '14px', color: '#6b7280', lineHeight: '1.65', margin: 0 },
  // Steps
  stepNum: {
    width: '40px', height: '40px', borderRadius: '50%',
    background: 'linear-gradient(135deg,#166534,#15803d)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '800', fontSize: '15px', flexShrink: 0,
  },
  // CTA
  ctaBg: {
    background: 'linear-gradient(135deg, #052e16 0%, #166534 100%)',
    padding: '80px 20px', textAlign: 'center',
  },
  // Crop card
  cropCard: {
    background: '#fff', borderRadius: '16px', overflow: 'hidden',
    border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    transition: 'box-shadow 0.2s, transform 0.2s',
  },
  cropEmoji: {
    height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '64px', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
  },
  // Footer
  footer: {
    background: '#0a0a0a', color: '#9ca3af',
    padding: '60px 20px 32px',
  },
}

function HomePage() {
  return React.createElement('div', { style: { background: '#f9fafb' } },

    /* ── HERO ── */
    React.createElement('section', { style: S.heroBg },
      // decorative circles
      React.createElement('div', { style: { position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' } }),
      React.createElement('div', { style: { position: 'absolute', bottom: '-120px', left: '-60px', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' } }),
      React.createElement('div', { style: { ...S.container, position: 'relative', zIndex: 1 } },
        React.createElement('div', { style: { maxWidth: '680px' } },
          React.createElement('div', { style: S.heroTag }, '🌾 Digital Agricultural Marketplace'),
          React.createElement('h1', { style: S.heroH1 },
            'Your Farm.', React.createElement('br'), 'Your Produce.', React.createElement('br'),
            React.createElement('span', { style: { color: '#4ade80' } }, 'Your Market.')
          ),
          React.createElement('p', { style: S.heroSub },
            'Krishify brings the mandi to your doorstep — connecting farmers directly with buyers through verified listings, AI quality assessment, and digital payments.'
          ),
          React.createElement('div', { style: { display: 'flex', gap: '14px', flexWrap: 'wrap' } },
            React.createElement('a', { href: '/register', style: S.heroBtnPrimary }, '🚀 Get Started Free'),
            React.createElement('a', { href: '/marketplace', style: S.heroBtnSecondary }, '🌾 Browse Marketplace')
          ),
          React.createElement('div', { style: { display: 'flex', gap: '24px', marginTop: '40px', flexWrap: 'wrap' } },
            [['✓', 'Free to register'], ['✓', 'AI quality assessment'], ['✓', 'Secure payments']].map(([icon, text]) =>
              React.createElement('div', { key: text, style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#bbf7d0' } },
                React.createElement('span', { style: { fontWeight: '800', color: '#4ade80' } }, icon),
                text
              )
            )
          )
        )
      )
    ),

    /* ── STATS BAR ── */
    React.createElement('section', { style: S.statsBar },
      React.createElement('div', { style: { ...S.container, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' } },
        [['10,000+', 'Farmers Onboarded'], ['50,000+', 'Crops Listed'], ['₹2Cr+', 'Transactions Enabled'], ['98%', 'Satisfaction Rate']].map(([num, label]) =>
          React.createElement('div', { key: label, style: S.statItem },
            React.createElement('div', { style: S.statNum }, num),
            React.createElement('div', { style: S.statLabel }, label)
          )
        )
      )
    ),

    /* ── FOR FARMERS / BUYERS ── */
    React.createElement('section', { style: { ...S.section, background: '#fff' } },
      React.createElement('div', { style: S.container },
        React.createElement('div', { style: { textAlign: 'center', marginBottom: '56px' } },
          React.createElement('div', { style: S.sectionLabel }, 'Who is Krishify for?'),
          React.createElement('h2', { style: { ...S.sectionH2, textAlign: 'center', maxWidth: '100%' } }, 'Built for every part of the food chain'),
          React.createElement('p', { style: { ...S.sectionSub, margin: '0 auto' } }, 'Whether you grow it or buy it, Krishify makes agriculture simpler, fairer, and more transparent.')
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' } },
          // Farmer card
          React.createElement('div', { style: { ...S.card, border: '2px solid #dcfce7', background: 'linear-gradient(180deg,#f0fdf4,#fff)' } },
            React.createElement('div', { style: { fontSize: '48px', marginBottom: '16px' } }, '👨‍🌾'),
            React.createElement('h3', { style: { fontSize: '22px', fontWeight: '800', color: '#166534', margin: '0 0 12px 0' } }, 'For Farmers'),
            React.createElement('p', { style: { color: '#6b7280', fontSize: '14px', lineHeight: '1.65', marginBottom: '20px' } }, 'List your crops, get AI quality scores, create auctions, manage orders and deliveries — all from your phone.'),
            React.createElement('ul', { style: { listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '10px' } },
              ['Create verified crop listings', 'AI-assisted quality assessment', 'Run price auctions', 'Manage orders & delivery', 'Receive payments digitally'].map(item =>
                React.createElement('li', { key: item, style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151' } },
                  React.createElement('span', { style: { color: '#166534', fontWeight: '800', fontSize: '16px' } }, '✓'),
                  item
                )
              )
            ),
            React.createElement('a', { href: '/register', style: { display: 'block', background: '#166534', color: '#fff', padding: '12px 20px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '14px', textAlign: 'center' } }, 'Start Selling →')
          ),
          // Buyer card
          React.createElement('div', { style: { ...S.card, border: '2px solid #dbeafe', background: 'linear-gradient(180deg,#eff6ff,#fff)' } },
            React.createElement('div', { style: { fontSize: '48px', marginBottom: '16px' } }, '🛒'),
            React.createElement('h3', { style: { fontSize: '22px', fontWeight: '800', color: '#1e40af', margin: '0 0 12px 0' } }, 'For Buyers'),
            React.createElement('p', { style: { color: '#6b7280', fontSize: '14px', lineHeight: '1.65', marginBottom: '20px' } }, 'Discover verified produce, compare quality scores, bid in auctions, and track deliveries in real time.'),
            React.createElement('ul', { style: { listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '10px' } },
              ['Browse verified crop marketplace', 'View AI quality assessments', 'Participate in live auctions', 'Secure Razorpay TEST payments', 'Real-time delivery tracking'].map(item =>
                React.createElement('li', { key: item, style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151' } },
                  React.createElement('span', { style: { color: '#1e40af', fontWeight: '800', fontSize: '16px' } }, '✓'),
                  item
                )
              )
            ),
            React.createElement('a', { href: '/marketplace', style: { display: 'block', background: '#1e40af', color: '#fff', padding: '12px 20px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '14px', textAlign: 'center' } }, 'Browse Marketplace →')
          )
        )
      )
    ),

    /* ── HOW IT WORKS ── */
    React.createElement('section', { id: 'how-it-works', style: { ...S.section, background: '#f9fafb' } },
      React.createElement('div', { style: S.container },
        React.createElement('div', { style: { textAlign: 'center', marginBottom: '56px' } },
          React.createElement('div', { style: S.sectionLabel }, 'How it works'),
          React.createElement('h2', { style: { ...S.sectionH2, textAlign: 'center', maxWidth: '100%' } }, 'From field to sale in 5 steps'),
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0', position: 'relative' } },
          [
            ['📋', 'List Produce', 'Add crop name, quantity, price, location, and harvest date to your listing.'],
            ['🔍', 'Get Verified', 'A field agent visits your farm to physically verify the produce quality.'],
            ['🤖', 'AI Assessment', 'Upload images for an AI-assisted quality score and grade. TEST/DEMO mode.'],
            ['💰', 'Reach Buyers', 'Your listing appears on the marketplace. Run auctions to get the best price.'],
            ['✅', 'Complete Sale', 'Accept orders, receive payments, and manage delivery tracking.'],
          ].map(([icon, title, desc], i) =>
            React.createElement('div', { key: title, style: { ...S.card, borderRadius: '0', borderRight: i < 4 ? 'none' : undefined, position: 'relative', padding: '32px 24px' } },
              React.createElement('div', { style: { ...S.stepNum, marginBottom: '14px' } }, i + 1),
              React.createElement('div', { style: { fontSize: '28px', marginBottom: '10px' } }, icon),
              React.createElement('h3', { style: S.featureTitle }, title),
              React.createElement('p', { style: S.featureDesc }, desc)
            )
          )
        )
      )
    ),

    /* ── FEATURES GRID ── */
    React.createElement('section', { style: { ...S.section, background: '#fff' } },
      React.createElement('div', { style: S.container },
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '40px', alignItems: 'center' } },
          React.createElement('div', null,
            React.createElement('div', { style: S.sectionLabel }, 'Platform features'),
            React.createElement('h2', { style: S.sectionH2 }, 'Everything you need to trade agricultural produce'),
            React.createElement('p', { style: S.sectionSub }, 'Krishify provides a complete end-to-end platform — from listing crops to delivery tracking.'),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '32px' } },
              [
                ['🌾', 'Crop Listings', 'List with full details — quantity, price, location, harvest date'],
                ['🤖', 'AI Quality', 'TEST-mode AI scores crops with grade, confidence, and observations'],
                ['🏷️', 'Live Auctions', 'Create timed auctions. Buyers bid in real time. Best price wins'],
                ['💳', 'TEST Payments', 'Razorpay integration in TEST mode. No real money charged'],
                ['🚚', 'Delivery Track', 'Full status timeline from PACKED to DELIVERED with events'],
                ['⭐', 'Reviews', 'Buyers review completed orders. Build trust through ratings'],
              ].map(([icon, title, desc]) =>
                React.createElement('div', { key: title, style: { display: 'flex', gap: '12px', alignItems: 'flex-start' } },
                  React.createElement('div', { style: { ...S.featureIcon, width: '40px', height: '40px', fontSize: '18px', borderRadius: '10px', flexShrink: 0 } }, icon),
                  React.createElement('div', null,
                    React.createElement('p', { style: { fontWeight: '700', color: '#111827', margin: '0 0 4px 0', fontSize: '14px' } }, title),
                    React.createElement('p', { style: { fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: '1.5' } }, desc)
                  )
                )
              )
            )
          ),
          // AI Quality demo card
          React.createElement('div', { style: { ...S.card, border: '2px solid #dcfce7', padding: '32px' } },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
              React.createElement('h3', { style: { fontWeight: '800', fontSize: '17px', color: '#111827', margin: 0 } }, '🤖 AI Quality Assessment'),
              React.createElement('span', { style: { background: '#fef9c3', color: '#854d0e', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' } }, 'TEST / DEMO')
            ),
            React.createElement('div', { style: { background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderRadius: '12px', padding: '24px', marginBottom: '20px', textAlign: 'center' } },
              React.createElement('div', { style: { fontSize: '56px', fontWeight: '900', color: '#166534', lineHeight: 1 } }, '92'),
              React.createElement('div', { style: { fontSize: '14px', color: '#6b7280', marginTop: '4px' } }, 'Quality Score / 100'),
              React.createElement('div', { style: { display: 'inline-block', background: '#166534', color: '#fff', padding: '4px 16px', borderRadius: '999px', fontSize: '18px', fontWeight: '800', marginTop: '8px' } }, 'Grade A')
            ),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' } },
              [['Crop', 'Tomato'], ['Confidence', '91%'], ['Ripeness', 'High'], ['Damage', 'Low']].map(([k, v]) =>
                React.createElement('div', { key: k, style: { background: '#f9fafb', borderRadius: '8px', padding: '10px 12px' } },
                  React.createElement('div', { style: { fontSize: '11px', color: '#9ca3af', fontWeight: '600', marginBottom: '2px' } }, k),
                  React.createElement('div', { style: { fontWeight: '700', color: '#111827', fontSize: '14px' } }, v)
                )
              )
            ),
            React.createElement('p', { style: { fontSize: '11px', color: '#9ca3af', margin: 0, textAlign: 'center' } }, '⚠️ Illustrative demo data — not an official certification')
          )
        )
      )
    ),

    /* ── SAMPLE CROPS ── */
    React.createElement('section', { id: 'marketplace', style: { ...S.section, background: '#f9fafb' } },
      React.createElement('div', { style: S.container },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px', flexWrap: 'wrap', gap: '12px' } },
          React.createElement('div', null,
            React.createElement('div', { style: S.sectionLabel }, 'Marketplace'),
            React.createElement('h2', { style: { ...S.sectionH2, margin: '0' } }, 'Verified produce, direct from farms')
          ),
          React.createElement('a', { href: '/marketplace', style: { color: '#166534', textDecoration: 'none', fontWeight: '700', fontSize: '14px' } }, 'View all listings →')
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' } },
          [
            ['🍅', 'Tomatoes', 'Vegetables', '₹25/kg', '500 kg', 'Nashik, MH', 'A'],
            ['🌾', 'Wheat', 'Grains', '₹22/kg', '2 ton', 'Ludhiana, PB', 'B'],
            ['🧅', 'Onions', 'Vegetables', '₹18/kg', '1 ton', 'Pune, MH', 'A'],
            ['🌶️', 'Red Chilli', 'Spices', '₹80/kg', '200 kg', 'Guntur, AP', 'A'],
          ].map(([emoji, name, cat, price, qty, loc, grade]) =>
            React.createElement('div', { key: name, style: S.cropCard },
              React.createElement('div', { style: S.cropEmoji }, emoji),
              React.createElement('div', { style: { padding: '16px' } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' } },
                  React.createElement('h3', { style: { fontWeight: '700', fontSize: '16px', color: '#111827', margin: 0 } }, name),
                  React.createElement('span', { style: { background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' } }, 'Grade ' + grade)
                ),
                React.createElement('p', { style: { fontSize: '12px', color: '#9ca3af', margin: '0 0 8px 0' } }, cat),
                React.createElement('div', { style: { fontSize: '20px', fontWeight: '900', color: '#166534', marginBottom: '8px' } }, price),
                React.createElement('div', { style: { fontSize: '12px', color: '#6b7280' } }, '📦 ' + qty + ' • 📍 ' + loc)
              )
            )
          )
        ),
        React.createElement('div', { style: { textAlign: 'center', marginTop: '32px' } },
          React.createElement('a', { href: '/marketplace', style: { display: 'inline-block', padding: '12px 28px', background: '#166534', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '15px' } }, 'Browse All Crops →')
        )
      )
    ),

    /* ── TRUST ── */
    React.createElement('section', { id: 'about', style: { ...S.section, background: '#fff' } },
      React.createElement('div', { style: S.container },
        React.createElement('div', { style: { textAlign: 'center', marginBottom: '48px' } },
          React.createElement('div', { style: S.sectionLabel }, 'Why trust Krishify'),
          React.createElement('h2', { style: { ...S.sectionH2, textAlign: 'center', maxWidth: '100%' } }, 'Transparency built into every transaction'),
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' } },
          [
            ['🔍', 'Field Verified', '#dcfce7', '#166534', 'Produce is physically inspected by a Krishify agent at the farm before listing.'],
            ['🤖', 'AI Graded', '#dbeafe', '#1e40af', 'Images are analyzed to generate an AI quality score, grade, and observations.'],
            ['🔒', 'Secure Payments', '#f3e8ff', '#7c3aed', 'Razorpay TEST payment gateway. Signature verification prevents fraud.'],
            ['⭐', 'Buyer Reviews', '#fef9c3', '#854d0e', 'Only completed-order buyers can review. Prevents fake ratings.'],
          ].map(([icon, title, bg, col, desc]) =>
            React.createElement('div', { key: title, style: { ...S.card, textAlign: 'center', padding: '32px 24px' } },
              React.createElement('div', { style: { width: '60px', height: '60px', borderRadius: '16px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px' } }, icon),
              React.createElement('h3', { style: { fontWeight: '800', fontSize: '17px', color: col, margin: '0 0 10px 0' } }, title),
              React.createElement('p', { style: { fontSize: '14px', color: '#6b7280', lineHeight: '1.65', margin: 0 } }, desc)
            )
          )
        )
      )
    ),

    /* ── CTA ── */
    React.createElement('section', { style: S.ctaBg },
      React.createElement('div', { style: { ...S.container, maxWidth: '680px', textAlign: 'center' } },
        React.createElement('div', { style: { fontSize: '48px', marginBottom: '16px' } }, '🌾'),
        React.createElement('h2', { style: { fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '900', color: '#fff', margin: '0 0 16px 0', letterSpacing: '-1px' } }, 'Bring the market to your farm.'),
        React.createElement('p', { style: { fontSize: '17px', color: '#bbf7d0', margin: '0 0 36px 0', lineHeight: '1.6' } }, 'Join thousands of farmers and buyers already trading on Krishify. Register free in under 2 minutes.'),
        React.createElement('div', { style: { display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' } },
          React.createElement('a', { href: '/register', style: { ...S.heroBtnPrimary, fontSize: '16px', padding: '15px 32px' } }, '🚀 Join Krishify Free'),
          React.createElement('a', { href: '/marketplace', style: { ...S.heroBtnSecondary, fontSize: '16px', padding: '14px 32px' } }, 'Explore Marketplace')
        )
      )
    ),

    /* ── FOOTER ── */
    React.createElement('footer', { style: S.footer },
      React.createElement('div', { style: S.container },
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px', marginBottom: '48px' } },
          React.createElement('div', null,
            React.createElement('div', { style: { fontSize: '22px', fontWeight: '900', color: '#fff', marginBottom: '10px' } }, '🌾 Krishify'),
            React.createElement('p', { style: { fontSize: '14px', color: '#6b7280', lineHeight: '1.65', maxWidth: '240px', margin: 0 } }, 'The Digital Mandi That Comes to the Farmer. Connecting India\'s farmers directly with buyers.')
          ),
          React.createElement('div', null,
            React.createElement('p', { style: { fontWeight: '700', color: '#fff', marginBottom: '14px', fontSize: '14px' } }, 'Platform'),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
              [['Marketplace', '/marketplace'], ['Auctions', '/auctions'], ['How It Works', '#how-it-works']].map(([label, href]) =>
                React.createElement('a', { key: label, href, style: { color: '#6b7280', textDecoration: 'none', fontSize: '14px' } }, label)
              )
            )
          ),
          React.createElement('div', null,
            React.createElement('p', { style: { fontWeight: '700', color: '#fff', marginBottom: '14px', fontSize: '14px' } }, 'Account'),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
              [['Login', '/login'], ['Register', '/register'], ['Farmer Dashboard', '/farmer'], ['Buyer Dashboard', '/buyer/dashboard']].map(([label, href]) =>
                React.createElement('a', { key: label, href, style: { color: '#6b7280', textDecoration: 'none', fontSize: '14px' } }, label)
              )
            )
          ),
          React.createElement('div', null,
            React.createElement('p', { style: { fontWeight: '700', color: '#fff', marginBottom: '14px', fontSize: '14px' } }, 'Status'),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4ade80' } },
                React.createElement('div', { style: { width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' } }),
                'All systems operational'
              ),
              React.createElement('div', { style: { fontSize: '12px', color: '#6b7280' } }, '🔒 Razorpay TEST mode'),
              React.createElement('div', { style: { fontSize: '12px', color: '#6b7280' } }, '🤖 AI in DEMO mode')
            )
          )
        ),
        React.createElement('div', { style: { borderTop: '1px solid #1f2937', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' } },
          React.createElement('p', { style: { fontSize: '13px', color: '#6b7280', margin: 0 } }, '© 2026 Krishify — Digital Agricultural Marketplace'),
          React.createElement('div', { style: { display: 'flex', gap: '16px' } },
            React.createElement('a', { href: '#', style: { color: '#6b7280', textDecoration: 'none', fontSize: '13px' } }, 'Privacy'),
            React.createElement('a', { href: '#', style: { color: '#6b7280', textDecoration: 'none', fontSize: '13px' } }, 'Terms')
          )
        )
      )
    )
  )
}

module.exports = HomePage
