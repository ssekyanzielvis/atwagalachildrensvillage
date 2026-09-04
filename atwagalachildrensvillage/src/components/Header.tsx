'use client';

import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const theme = useAppStore((state) => state.theme);

  const navLinks = [
    { to: '/', label: 'Home' },
    { 
      label: 'About Us', 
      dropdown: [
        { to: '/about', label: 'Who We Are' },
        { to: '/leadership', label: 'Leadership' },
        { to: '/core-values', label: 'Core Values' },
        { to: '/achievements', label: 'Achievements' },
      ]
    },
    { to: '/programs', label: 'Programs' },
    { to: '/news', label: 'News' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/donate', label: 'Donate' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full shadow-md" style={{ backgroundColor: theme.primaryColor }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center space-x-3" onClick={() => setIsMenuOpen(false)}>
            <img src="/icon.jpeg" alt="Atwagala Children's Village" className="h-10 w-auto md:h-12" />
            <h1 className="text-lg md:text-xl font-bold hidden sm:block text-white">Atwagala Children’s Village</h1>
          </Link>

          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link, idx) => {
              if (link.dropdown) {
                return (
                  <div key={idx} className="relative group">
                    <button className="flex items-center gap-1 px-4 py-2 rounded-md text-white hover:bg-white/10 transition-colors duration-200 font-medium">
                      {link.label} <ChevronDown size={16} className="group-hover:rotate-180 transition-transform" />
                    </button>
                    <div className="absolute top-full left-0 mt-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="bg-white rounded-md shadow-xl py-2 border border-gray-100 overflow-hidden">
                        {link.dropdown.map(sublink => (
                          <NavLink
                            key={sublink.to}
                            to={sublink.to}
                            className={({ isActive }) =>
                              `block px-4 py-2 text-gray-800 hover:bg-purple-50 hover:text-purple-700 transition-colors text-sm font-medium ${isActive ? 'bg-purple-50 text-purple-700 font-bold' : ''}`
                            }
                          >
                            {sublink.label}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              }
              return (
                <NavLink
                  key={link.to || idx}
                  to={link.to!}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md text-white hover:bg-white/10 transition-colors duration-200 font-medium ${isActive ? 'bg-white/10' : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              )
            })}
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-md text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-white/20 max-h-[70vh] overflow-y-auto">
            {navLinks.map((link, idx) => {
              if (link.dropdown) {
                return (
                  <div key={idx} className="block mb-2">
                    <div className="px-4 py-2 text-white/60 font-bold uppercase text-[10px] tracking-wider">{link.label}</div>
                    {link.dropdown.map(sublink => (
                      <NavLink
                        key={sublink.to}
                        to={sublink.to}
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) =>
                          `block px-8 py-2.5 text-white hover:bg-white/10 transition-colors duration-200 font-medium text-sm ${isActive ? 'bg-white/10 border-l-2 border-white' : ''}`
                        }
                      >
                        {sublink.label}
                      </NavLink>
                    ))}
                  </div>
                );
              }
              return (
                <NavLink
                  key={link.to || idx}
                  to={link.to!}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 text-white hover:bg-white/10 transition-colors duration-200 font-medium ${isActive ? 'bg-white/10 border-l-2 border-white' : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              )
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
