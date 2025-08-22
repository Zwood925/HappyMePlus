import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

export default function BottomNavigation() {
  const router = useRouter();

  const navItems = [
    {
      path: '/',
      icon: '🏠',
      label: 'Home',
      active: router.pathname === '/'
    },
    {
      path: '/community',
      icon: '🌍',
      label: 'Community',
      active: router.pathname === '/community'
    },
    {
      path: '/journal',
      icon: '📝',
      label: 'Journal',
      active: router.pathname.startsWith('/journal')
    },
    {
      path: '/groups',
      icon: '👥',
      label: 'Groups',
      active: router.pathname.startsWith('/groups')
    },
    {
      path: '/settings',
      icon: '⚙️',
      label: 'Settings',
      active: router.pathname === '/settings'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <motion.div
              className={`flex flex-col items-center justify-center w-full h-full cursor-pointer transition-colors ${
                item.active 
                  ? 'text-purple-600' 
                  : 'text-gray-500 hover:text-purple-500'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className={`text-xs font-medium ${item.active ? 'font-semibold' : ''}`}>
                {item.label}
              </div>
              {item.active && (
                <motion.div
                  className="absolute bottom-0 w-8 h-1 bg-purple-600 rounded-t-full"
                  layoutId="activeTab"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
