const React = require('react');

module.exports = {
  BrowserRouter: ({ children }) => React.createElement('div', { 'data-testid': 'browser-router' }, children),
  Link: ({ children, to }) => React.createElement('a', { href: to, 'data-testid': 'mock-link' }, children),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/test' }),
};
