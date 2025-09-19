import React from 'react'
import { Link, NavLink } from 'react-router-dom'

const navItems: Array<{ label: string; path: string }> = [
  { label: 'Home', path: '/' },
  { label: 'Features', path: '/features' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'About', path: '/about' },
]

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header__container">
        <h1 className="header__logo">
          <Link to="/" className="header__logo-link">
            AI Product Page Generator
          </Link>
        </h1>
        <nav className="header__nav" aria-label="Primary navigation">
          <ul className="header__nav-list">
            {navItems.map(item => (
              <li key={item.path} className="header__nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `header__nav-link${isActive ? ' header__nav-link--active' : ''}`}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
