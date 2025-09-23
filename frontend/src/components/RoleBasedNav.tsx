import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Home, 
  Calendar, 
  Heart, 
  BookOpen, 
  MessageCircle,
  BarChart3,
  Users,
  Settings,
  Youtube,
  ChevronDown,
  Shield,
  Bot,
  Wind
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import EmergencyButton from './EmergencyButton'

const RoleBasedNav = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false)
  const { user, logout } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const location = useLocation()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAdminDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getNavItems = () => {
    if (!user) {
      return [
        { path: '/', label: t('nav.home'), icon: Home },
        { path: '/resources', label: t('nav.resources'), icon: BookOpen },
      ]
    }

    const baseItems = [
      { path: '/', label: t('nav.home'), icon: Home },
      { path: '/resources', label: t('nav.resources'), icon: BookOpen },
      { path: '/peer-community', label: 'Peer Community', icon: Users },
      { path: '/ai-chatbot', label: 'AI Chatbot', icon: Bot },
    ]

    switch (user.role) {
      case 'student':
        return [
          ...baseItems,
          { path: '/dashboard', label: t('nav.dashboard'), icon: Home },
          { path: '/bookings', label: t('nav.bookings'), icon: Calendar },
          { path: '/screening', label: t('nav.screening'), icon: Heart },
        ]
      
      case 'counsellor':
        return [
          ...baseItems,
          { path: '/counsellor-dashboard', label: 'My Dashboard', icon: Home },
          { path: '/counsellor-bookings', label: 'My Bookings', icon: Calendar },
          { path: '/counsellor-profile', label: 'Profile', icon: User },
        ]
      
      case 'admin':
        return [
          ...baseItems,
          { path: '/admin', label: 'Dashboard', icon: BarChart3 },
          { 
            type: 'dropdown',
            label: 'Admin Tools',
            icon: Shield,
            items: [
              { path: '/admin/users', label: 'Manage Users', icon: Users },
              { path: '/admin/videos', label: 'Video Manager', icon: Youtube },
              { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
            ]
          },
        ]
      
      default:
        return baseItems
    }
  }

  const navItems = getNavItems()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-gray-900 hidden sm:inline">
              <span className="hidden lg:inline">Rapy</span>
              <span className="lg:hidden">Rapy</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item, index) => (
              item.type === 'dropdown' ? (
                <div key={index} className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 whitespace-nowrap ${
                      adminDropdownOpen
                        ? 'text-primary-600 bg-primary-50 shadow-sm'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${adminDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {adminDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                    >
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={() => setAdminDropdownOpen(false)}
                          className={`flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors ${
                            isActive(subItem.path) ? 'bg-primary-50 text-primary-600' : ''
                          }`}
                        >
                          <subItem.icon className="w-4 h-4" />
                          <span>{subItem.label}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 whitespace-nowrap ${
                    isActive(item.path)
                      ? 'text-primary-600 bg-primary-50 shadow-sm'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            ))}
          </div>

          {/* Tablet Navigation (medium screens) */}
          <div className="hidden md:flex lg:hidden items-center space-x-4">
            {navItems.slice(0, 3).map((item, index) => (
              item.type === 'dropdown' ? (
                <div key={index} className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                    className={`px-2 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                      adminDropdownOpen
                        ? 'text-primary-600 bg-primary-50 shadow-sm'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden sm:inline truncate">{item.label}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${adminDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {adminDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                    >
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={() => setAdminDropdownOpen(false)}
                          className={`flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors ${
                            isActive(subItem.path) ? 'bg-primary-50 text-primary-600' : ''
                          }`}
                        >
                          <subItem.icon className="w-4 h-4" />
                          <span>{subItem.label}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-2 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                    isActive(item.path)
                      ? 'text-primary-600 bg-primary-50 shadow-sm'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline truncate">{item.label}</span>
                </Link>
              )
            ))}
            {navItems.length > 3 && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Emergency Button */}
            <EmergencyButton />
            
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'hi' | 'ta')}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="ta">தமிழ்</option>
            </select>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-sm text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm text-gray-700 hover:text-primary-600 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Emergency Button for Mobile */}
                <div className="px-3 py-2">
                  <EmergencyButton className="w-full justify-center" />
                </div>
                
                {navItems.map((item, index) => (
                  item.type === 'dropdown' ? (
                    <div key={index}>
                      <div className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-700">
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      <div className="ml-6 space-y-1">
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center space-x-2 block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                              isActive(subItem.path)
                                ? 'text-primary-600 bg-primary-50'
                                : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                            }`}
                          >
                            <subItem.icon className="w-4 h-4" />
                            <span>{subItem.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-2 block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive(item.path)
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                ))}

                {/* Mobile Language Selector */}
                <div className="px-3 py-2">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'en' | 'hi' | 'ta')}
                    className="w-full text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी</option>
                    <option value="ta">தமிழ்</option>
                  </select>
                </div>

                {/* Mobile User Menu */}
                {user ? (
                  <div className="px-3 py-2 border-t border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout()
                        setIsOpen(false)
                      }}
                      className="flex items-center space-x-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                ) : (
                  <div className="px-3 py-2 border-t border-gray-200 space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block text-sm text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      {t('nav.login')}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="block btn-primary text-sm text-center"
                    >
                      {t('nav.register')}
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default RoleBasedNav
