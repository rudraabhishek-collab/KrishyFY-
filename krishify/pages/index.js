const React = require('react')

function HomePage() {
  return React.createElement(
    'div',
    { className: 'min-h-screen bg-background' },
    // Navbar
    React.createElement(
      'nav',
      { className: 'border-b border-border bg-background px-6 py-3 flex items-center justify-between max-w-7xl mx-auto' },
      React.createElement(
        'div',
        { className: 'flex items-center gap-3' },
        React.createElement('span', { className: 'text-xl font-bold tracking-wider' }, 'Krishify')
      ),
      React.createElement(
        'ul',
        { className: 'flex items-center gap-8 text-sm font-medium' },
        React.createElement('li', null,
          React.createElement('a', { href: '#how-it-works', className: 'color-primary hover:underline' }, 'How It Works')
        ),
        React.createElement('li', null,
          React.createElement('a', { href: '#for-farmers', className: 'color-primary hover:underline' }, 'For Farmers')
        ),
        React.createElement('li', null,
          React.createElement('a', { href: '#for-buyers', className: 'color-primary hover:underline' }, 'For Buyers')
        ),
        React.createElement('li', null,
          React.createElement('a', { href: '#about', className: 'color-primary hover:underline' }, 'About')
        )
      ),
      React.createElement(
        'div',
        { className: 'flex items-center gap-3' },
        React.createElement(
          'a',
          { href: '/login', className: 'inline-block px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors' },
          'Login'
        ),
        React.createElement(
          'a',
          { href: '/get-started', className: 'inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary/80 transition-colors' },
          'Get Started'
        )
      )
    ),
    // Hero
    React.createElement(
      'section',
      { className: 'min-h-[60vh] flex flex-col items-center justify-center py-12 px-6 md:px-12 lg:px-20' },
      React.createElement(
        'div',
        { className: 'text-center w-full max-w-4xl' },
        React.createElement('h1', { className: 'text-5xl md:text-6xl lg:text-7xl font-bold text-primary mb-4' }, 'Your Farm. Your Produce. Your Market.'),
        React.createElement('p', { className: 'text-lg md:text-xl text-muted-foreground mb-8' }, 'The Digital Mandi That Comes to the Farmer.'),
        React.createElement(
          'div',
          { className: 'space-y-4' },
          React.createElement(
            'a',
            { href: '#how-it-works', className: 'inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-secondary/80 transition-colors' },
            'Sell Your Produce'
          ),
          React.createElement(
            'a',
            { href: '#how-it-works', className: 'inline-block px-6 py-3 border-2 border-primary text-primary rounded-md hover:bg-primary/10 transition-colors' },
            'Explore Marketplace'
          )
        )
      )
    ),
    // Problem Section
    React.createElement(
      'section',
      { className: 'py-16 px-6 md:px-12 lg:px-20 bg-background' },
      React.createElement(
        'div',
        { className: 'max-w-4xl mx-auto' },
        React.createElement('h2', { className: 'text-3xl md:text-4xl font-bold text-primary mb-8' }, 'The market shouldn\'t be miles away.'),
        React.createElement('p', { className: 'text-lg text-muted-foreground mb-10' }, 'Farmers should not have to travel long distances to a mandi just to find buyers.'),
        React.createElement('div', { className: 'space-y-6' },
          React.createElement('div', null,
            React.createElement('h3', { className: 'font-medium text-primary mb-2' }, 'Long journeys'),
            React.createElement('p', { className: 'text-small text-muted-foreground' }, 'Farmers may need to transport their produce to distant markets simply to find buyers.')
          ),
          React.createElement('div', null,
            React.createElement('h3', { className: 'font-medium text-primary mb-2' }, 'Transportation costs'),
            React.createElement('p', { className: 'text-small text-muted-foreground' }, 'Moving agricultural produce costs time and money.')
          ),
          React.createElement('div', null,
            React.createElement('h3', { className: 'font-medium text-primary mb-2' }, 'Limited buyer access'),
            React.createElement('p', { className: 'text-small text-muted-foreground' }, 'A farmer may only reach a small number of buyers at the local market.')
          ),
          React.createElement('div', null,
            React.createElement('h3', { className: 'font-medium text-primary mb-2' }, 'Difficult price discovery'),
            React.createElement('p', { className: 'text-small text-muted-foreground' }, 'Farmers can have limited visibility into competing offers.')
          ),
          React.createElement('div', null,
            React.createElement('h3', { className: 'font-medium text-primary mb-2' }, 'Quality verification'),
            React.createElement('p', { className: 'text-small text-muted-foreground' }, 'Buyers need reliable information about the quality of produce before purchasing.')
          )
        )
      )
    ),
    // Solution Section
    React.createElement(
      'section',
      { className: 'py-16 px-6 md:px-12 lg:px-20 bg-background' },
      React.createElement(
        'div',
        { className: 'max-w-6xl mx-auto' },
        React.createElement('h2', { className: 'text-3xl md:text-4xl font-bold text-primary mb-10' }, 'Krishify brings the market to the farm.'),
        React.createElement('div', { className: 'space-y-8' },
          React.createElement('div', { className: 'group relative pl-8' },
            React.createElement('div', { className: 'absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-sm' }, '1'),
            React.createElement('div', null,
              React.createElement('h3', { className: 'font-medium text-primary mb-1' }, 'List Your Produce'),
              React.createElement('p', { className: 'text-small text-muted-foreground' }, 'Farmer lists crop, quantity, harvest information, location and images via the Krishify platform.')
            )
          ),
          React.createElement('div', { className: 'group relative pl-8' },
            React.createElement('div', { className: 'absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-sm' }, '2'),
            React.createElement('div', null,
              React.createElement('h3', { className: 'font-medium text-primary mb-1' }, 'Get Verified'),
              React.createElement('p', { className: 'text-small text-muted-foreground' }, 'A Krishify field agent visits the farmer and physically inspects the produce at the farm location.')
            )
          ),
          React.createElement('div', { className: 'group relative pl-8' },
            React.createElement('div', { className: 'absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-sm' }, '3'),
            React.createElement('div', null,
              React.createElement('h3', { className: 'font-medium text-primary mb-1' }, 'AI-Assisted Quality Assessment'),
              React.createElement('p', { className: 'text-small text-muted-foreground' }, 'Images and inspection information are analyzed to generate an indicative quality assessment. AI assists the verification process. Final verification remains human-led.'),
              React.createElement('span', { className: 'ml-2 text-xs font-normal' }, 'AI assists the verification process. Final verification remains human-led.')
            )
          ),
          React.createElement('div', { className: 'group relative pl-8' },
            React.createElement('div', { className: 'absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-sm' }, '4'),
            React.createElement('div', null,
              React.createElement('h3', { className: 'font-medium text-primary mb-1' }, 'Reach More Buyers'),
              React.createElement('p', { className: 'text-small text-muted-foreground' }, 'Verified produce becomes discoverable to eligible buyers, including private and government buyer accounts. Do not claim government partnership.')
            )
          ),
          React.createElement('div', { className: 'group relative pl-8' },
            React.createElement('div', { className: 'absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-sm' }, '5'),
            React.createElement('div', null,
              React.createElement('h3', { className: 'font-medium text-primary mb-1' }, 'Sell Digitally'),
              React.createElement('p', { className: 'text-small text-muted-foreground' }, 'Buyers can make offers and complete transactions digitally. Razorpay integration coming later.')
            )
          )
        )
      )
    ),
    // Why Krishify
    React.createElement(
      'section',
      { className: 'py-16 px-6 md:px-12 lg:px-20 bg-gray-50' },
      React.createElement(
        'div',
        { className: 'max-w-6xl mx-auto' },
        React.createElement('h2', { className: 'text-3xl md:text-4xl font-bold text-primary mb-10' }, 'Why Krishify'),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
          React.createElement('div', null,
            React.createElement('h3', { className: 'font-medium text-primary mb-3' }, 'For Farmers'),
            React.createElement('ul', { className: 'space-y-3 text-small text-muted-foreground' },
              React.createElement('li', null, 'Sell from your village'),
              React.createElement('li', null, 'Reduce unnecessary travel'),
              React.createElement('li', null, 'Reach more buyers'),
              React.createElement('li', null, 'Transparent offers'),
              React.createElement('li', null, 'Verified produce listing'),
              React.createElement('li', null, 'Digital transaction experience')
            )
          ),
          React.createElement('div', null,
            React.createElement('h3', { className: 'font-medium text-primary mb-3' }, 'For Buyers'),
            React.createElement('ul', { className: 'space-y-3 text-small text-muted-foreground' },
              React.createElement('li', null, 'Discover verified produce'),
              React.createElement('li', null, 'Quality information'),
              React.createElement('li', null, 'Direct sourcing'),
              React.createElement('li', null, 'Transparent offers'),
              React.createElement('li', null, 'Better visibility into available crops')
            )
          )
        )
      )
    ),
    // Quality Section
    React.createElement(
      'section',
      { className: 'py-16 px-6 md:px-12 lg:px-20 bg-background' },
      React.createElement(
        'div',
        { className: 'max-w-4xl mx-auto' },
        React.createElement('h2', { className: 'text-3xl md:text-4xl font-bold text-primary mb-10' }, 'Quality information, before the deal.'),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center' },
          React.createElement('div', null,
            React.createElement('p', { className: 'text-6xl font-bold text-primary' }, 'Tomato'),
            React.createElement('p', { className: 'text-sm text-muted-foreground mb-2' }, 'Crop')
          ),
          React.createElement('div', null,
            React.createElement('p', { className: 'text-6xl font-bold text-primary' }, '92'),
            React.createElement('p', { className: 'text-sm text-muted-foreground mb-2' }, 'Quality Score')
          ),
          React.createElement('div', null,
            React.createElement('p', { className: 'text-6xl font-bold text-primary' }, 'Grade A'),
            React.createElement('p', { className: 'text-sm text-muted-foreground mb-2' }, 'Quality Assessment')
          )
        ),
        React.createElement('div', { className: 'mt-8 pt-8 border-t border-border' },
          React.createElement('div', { className: 'grid grid-cols-2 gap-4 text-small text-muted-foreground' },
            React.createElement('div', null,
              React.createElement('p', { className: 'font-medium' }, 'Visible Damage'),
              React.createElement('p', null, 'Low')
            ),
            React.createElement('div', null,
              React.createElement('p', { className: 'font-medium' }, 'Ripeness'),
              React.createElement('p', null, 'High')
            )
          ),
          React.createElement('div', { className: 'mt-4' },
            React.createElement('p', { className: 'text-xs font-medium text-primary' }, 'Confidence:'),
            React.createElement('p', { className: 'text-primary' }, '91%')
          )
        ),
        React.createElement('p', { className: 'mt-6 text-center text-xs text-muted-foreground' },
          React.createElement('span', { className: 'font-medium' }, 'Sample AI assessment'),
          React.createElement('span', { className: 'ml-2 text-primary cursor-not-allowed' }, 'Illustrative data — not an official agricultural certification.')
        )
      )
    ),
    // Marketplace Preview
    React.createElement(
      'section',
      { className: 'py-16 px-6 md:px-12 lg:px-20 bg-gray-50' },
      React.createElement(
        'div',
        { className: 'max-w-6xl mx-auto' },
        React.createElement('h2', { className: 'text-3xl md:text-4xl font-bold text-primary mb-10' }, 'Verified produce. More choices.'),
        React.createElement('p', { className: 'text-lg text-muted-foreground mb-10' },
          React.createElement('span', { className: 'font-medium' }, 'Marketplace Preview'),
          React.createElement('span', { className: 'ml-2 text-primary cursor-not-allowed' }, 'Displayed data is demonstration content.')
        ),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
          React.createElement('div', { key: 1, className: 'group border rounded-lg p-6 bg-white hover:border-primary transition-colors' },
            React.createElement('div', { className: 'h-48 rounded-t-lg overflow-hidden bg-gray-200' },
              React.createElement('img', { src: '/placeholder-crop-1.jpg', alt: 'Wheat', className: 'w-full h-full object-cover' }),
              React.createElement('span', { className: 'absolute bottom-2 left-2 px-2 py-1 text-xs bg-primary text-white rounded' }, 'Verified')
            ),
            React.createElement('div', { className: 'p-4' },
              React.createElement('h3', { className: 'font-medium text-primary mb-1' }, 'Wheat'),
              React.createElement('p', { className: 'text-sm text-muted-foreground mb-1' }, 'Sample quantity'),
              React.createElement('p', { className: 'text-xs font-medium text-primary' }, 'Grade A')
            )
          ),
          React.createElement('div', { key: 2, className: 'group border rounded-lg p-6 bg-white hover:border-primary transition-colors' },
            React.createElement('div', { className: 'h-48 rounded-t-lg overflow-hidden bg-gray-200' },
              React.createElement('img', { src: '/placeholder-crop-2.jpg', alt: 'Tomatoes', className: 'w-full h-full object-cover' }),
              React.createElement('span', { className: 'absolute bottom-2 left-2 px-2 py-1 text-xs bg-primary text-white rounded' }, 'Verified')
            ),
            React.createElement('div', { className: 'p-4' },
              React.createElement('h3', { className: 'font-medium text-primary mb-1' }, 'Tomatoes'),
              React.createElement('p', { className: 'text-sm text-muted-foreground mb-1' }, 'Sample quantity'),
              React.createElement('p', { className: 'text-xs font-medium text-primary' }, 'Grade A')
            )
          ),
          React.createElement('div', { key: 3, className: 'group border rounded-lg p-6 bg-white hover:border-primary transition-colors' },
            React.createElement('div', { className: 'h-48 rounded-t-lg overflow-hidden bg-gray-200' },
              React.createElement('img', { src: '/placeholder-crop-3.jpg', alt: 'Mustard', className: 'w-full h-full object-cover' }),
              React.createElement('span', { className: 'absolute bottom-2 left-2 px-2 py-1 text-xs bg-primary text-white rounded' }, 'Verified')
            ),
            React.createElement('div', { className: 'p-4' },
              React.createElement('h3', { className: 'font-medium text-primary mb-1' }, 'Mustard'),
              React.createElement('p', { className: 'text-sm text-muted-foreground mb-1' }, 'Sample quantity'),
              React.createElement('p', { className: 'text-xs font-medium text-primary' }, 'Grade A')
            )
          ),
          React.createElement('div', { key: 4, className: 'group border rounded-lg p-6 bg-white hover:border-primary transition-colors' },
            React.createElement('div', { className: 'h-48 rounded-t-lg overflow-hidden bg-gray-200' },
              React.createElement('img', { src: '/placeholder-crop-4.jpg', alt: 'Onions', className: 'w-full h-full object-cover' }),
              React.createElement('span', { className: 'absolute bottom-2 left-2 px-2 py-1 text-xs bg-primary text-white rounded' }, 'Verified')
            ),
            React.createElement('div', { className: 'p-4' },
              React.createElement('h3', { className: 'font-medium text-primary mb-1' }, 'Onions'),
              React.createElement('p', { className: 'text-sm text-muted-foreground mb-1' }, 'Sample quantity'),
              React.createElement('p', { className: 'text-xs font-medium text-primary' }, 'Grade A')
            )
          )
        )
      )
    ),
    // Trust Section
    React.createElement(
      'section',
      { className: 'py-16 px-6 md:px-12 lg:px-20 bg-background' },
      React.createElement(
        'div',
        { className: 'max-w-6xl mx-auto' },
        React.createElement('h2', { className: 'text-3xl md:text-4xl font-bold text-primary mb-10' }, 'How Krishify builds trust'),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-8' },
          React.createElement('div', null,
            React.createElement('div', { className: 'w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4' },
              React.createElement('svg', { className: 'w-6 h-6 text-primary', viewBox: '0 0 24 24', fill: 'currentColor' },
                React.createElement('path', { d: 'M12 2l3.09 6.26L22 9.5l-5.91 2.1L12 17l7 2-4.09-3.2L2 9.5 12 2z' })
              )),
            React.createElement('h3', { className: 'font-medium text-primary mb-2' }, 'Field Verified'),
            React.createElement('p', { className: 'text-small text-muted-foreground' }, 'Produce is physically inspected by a field agent at the farmer\'s location.')
          ),
          React.createElement('div', null,
            React.createElement('div', { className: 'w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4' },
              React.createElement('svg', { className: 'w-6 h-6 text-primary', viewBox: '0 0 24 24', fill: 'currentColor' },
                React.createElement('path', { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 13.06L8.94 15.02l-1.06-1.06L12 15.72l3.06-3.06l1.06 1.06L15.06 12l-3.06 3.06z' })
              )),
            React.createElement('h3', { className: 'font-medium text-primary mb-2' }, 'AI Assisted'),
            React.createElement('p', { className: 'text-small text-muted-foreground' }, 'AI helps analyze submitted produce imagery to support the verification process.')
          ),
          React.createElement('div', null,
            React.createElement('div', { className: 'w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4' },
              React.createElement('svg', { className: 'w-6 h-6 text-primary', viewBox: '0 0 24 24', fill: 'currentColor' },
                React.createElement('path', { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 11.06L8.94 15.02L5 19.16l1.6 1.6L12 17.09l5.16 1.28L19.16 5.16l-1.6-1.6L12 11.06z' })
              )),
            React.createElement('h3', { className: 'font-medium text-primary mb-2' }, 'Verified Buyers'),
            React.createElement('p', { className: 'text-small text-muted-foreground' }, 'Only eligible buyer accounts can participate in commercial transactions.')
          ),
          React.createElement('div', null,
            React.createElement('div', { className: 'w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4' },
              React.createElement('svg', { className: 'w-6 h-6 text-primary', viewBox: '0 0 24 24', fill: 'currentColor' },
                React.createElement('path', { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.06l-5.06 3.42l1.42 5.06l3.42-5.06L13 20.06l5.06 3.42l-3.42 5.06L11 19l-5.06-3.42l3.42-5.06L9 15l5.06-3.42z' })
              )),
            React.createElement('h3', { className: 'font-medium text-primary mb-2' }, 'Digital Payments'),
            React.createElement('p', { className: 'text-small text-muted-foreground' }, 'Future transactions will support secure digital payment infrastructure.')
          )
        )
      )
    ),
    // Impact Section
    React.createElement(
      'section',
      { className: 'py-16 px-6 md:px-12 lg:px-20' },
      React.createElement(
        'div',
        { className: 'max-w-3xl mx-auto' },
        React.createElement('h2', { className: 'text-3xl md:text-4xl font-bold text-primary mb-6' }, 'Less travel. More access. Better opportunities.'),
        React.createElement('p', { className: 'text-lg text-muted-foreground mb-8' }, 'Krishify aims to reduce unnecessary movement of agricultural produce and connect farmers with a broader buyer network.'),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
          React.createElement('div', null,
            React.createElement('p', { className: 'font-medium text-primary mb-1' }, 'Reduce travel'),
            React.createElement('p', { className: 'text-small text-muted-foreground' }, 'Farmers can list produce from their village instead of travelling to distant mandis.')
          ),
          React.createElement('div', null,
            React.createElement('p', { className: 'font-medium text-primary mb-1' }, 'More access'),
            React.createElement('p', { className: 'text-small text-muted-foreground' }, 'Buyers from different regions and sectors can discover verified produce.')
          ),
          React.createElement('div', null,
            React.createElement('p', { className: 'font-medium text-primary mb-1' }, 'Better opportunities'),
            React.createElement('p', { className: 'text-small text-muted-foreground' }, 'Fairer prices and more choices for both farmers and buyers.')
          )
        )
      )
    ),
    // Final CTA
    React.createElement(
      'section',
      { className: 'py-16 px-6 md:px-12 lg:px-20 bg-primary text-white' },
      React.createElement(
        'div',
        { className: 'max-w-3xl mx-auto text-center' },
        React.createElement('h2', { className: 'text-4xl md:text-5xl font-bold mb-4' }, 'Bring the market to your farm.'),
        React.createElement('p', { className: 'text-lg md:text-xl mb-8 max-w-2xl mx-auto' }, 'Krishify is building a simpler way for farmers to connect with buyers without making the mandi journey the first step.'),
        React.createElement('div', { className: 'space-y-4' },
          React.createElement('a', { href: '#how-it-works', className: 'inline-block px-6 py-3 bg-white text-primary font-medium rounded-md hover:bg-primary/10 transition-colors' }, 'Get Started'),
          React.createElement('a', { href: '#how-it-works', className: 'inline-block px-6 py-3 border border-white text-white font-medium rounded-md hover:bg-white/10 transition-colors' }, 'Learn How It Works')
        )
      )
    ),
    // Footer
    React.createElement(
      'footer',
      { className: 'border-t border-border pt-12 px-6 md:px-12 lg:px-20 bg-background' },
      React.createElement(
        'div',
        { className: 'max-w-7xl mx-auto' },
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12' },
          React.createElement('div', null,
            React.createElement('span', { className: 'text-2xl font-bold tracking-wider' }, 'Krishify'),
            React.createElement('p', { className: 'text-small text-muted-foreground mt-2' }, 'The Digital Mandi That Comes to the Farmer.')
          ),
          React.createElement('div', null,
            React.createElement('h4', { className: 'font-medium text-primary mb-3' }, 'Company'),
            React.createElement('ul', { className: 'space-y-2 text-small text-muted-foreground' },
              React.createElement('li', null,
                React.createElement('a', { href: '#how-it-works', className: 'hover:underline' }, 'How It Works')
              ),
              React.createElement('li', null,
                React.createElement('a', { href: '#for-farmers', className: 'hover:underline' }, 'For Farmers')
              ),
              React.createElement('li', null,
                React.createElement('a', { href: '#for-buyers', className: 'hover:underline' }, 'For Buyers')
              ),
              React.createElement('li', null,
                React.createElement('a', { href: '#about', className: 'hover:underline' }, 'About')
              )
            )
          ),
          React.createElement('div', null,
            React.createElement('h4', { className: 'font-medium text-primary mb-3' }, 'Product'),
            React.createElement('ul', { className: 'space-y-2 text-small text-muted-foreground' },
              React.createElement('li', null, React.createElement('a', { href: '#' }, 'Features')),
              React.createElement('li', null, React.createElement('a', { href: '#' }, 'Roadmap')),
              React.createElement('li', null, React.createElement('a', { href: '#' }, 'Privacy'))
            )
          ),
          React.createElement('div', null,
            React.createElement('h4', { className: 'font-medium text-primary mb-3' }, 'Legal'),
            React.createElement('ul', { className: 'space-y-2 text-small text-muted-foreground' },
              React.createElement('li', null, React.createElement('a', { href: '#' }, 'Terms')),
              React.createElement('li', null, React.createElement('a', { href: '#' }, 'Privacy Policy'))
            )
          )
        ),
        React.createElement('div', { className: 'pt-8 border-t border-border flex flex-col items-center gap-4' },
          React.createElement('p', { className: 'text-xs text-muted-foreground' }, '© 2026 Krishify'),
          React.createElement('div', { className: 'flex gap-3' },
            React.createElement('a', { href: '#', className: 'text-sm text-muted-foreground hover:underline', title: 'Twitter' }, 'Twitter'),
            React.createElement('a', { href: '#', className: 'text-sm text-muted-foreground hover:underline', title: 'LinkedIn' }, 'LinkedIn')
          )
        )
      )
    )
  )
}

module.exports = HomePage