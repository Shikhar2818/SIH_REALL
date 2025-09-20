import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import RoleBasedNav from './RoleBasedNav'
import Footer from './Footer'
import ChatWidget from './ChatWidget'

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <RoleBasedNav />
      <motion.main
        className="flex-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </motion.main>
      <Footer />
      <ChatWidget />
    </div>
  )
}

export default Layout
