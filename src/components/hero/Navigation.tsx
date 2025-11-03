import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const navItems = [
  { label: 'PROJECTS', href: '#projects' },
];

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 2.5, duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-black-base/95 backdrop-blur-lg border-b border-gray-dark' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Desktop Layout: Logo and Links in Left Section */}
        <div className="flex items-center justify-between">
          {/* Left Section: Logo + Links */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <motion.a 
              href="#hero"
              className="text-xl font-heading font-bold text-orange-primary cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              AP
            </motion.a>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex gap-8">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  className="text-sm font-mono text-white-dim hover:text-orange-primary transition-colors cursor-pointer"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.7 + (index * 0.1) }}
                >
                  {item.label}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden text-orange-primary cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.7 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 py-4 border-t border-gray-dark"
          >
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block py-2 text-sm font-mono text-white-dim hover:text-orange-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};
