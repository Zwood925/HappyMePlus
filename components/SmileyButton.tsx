import { motion } from 'framer-motion';

interface SmileyButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function SmileyButton({ onClick, disabled = false }: SmileyButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="relative group touch-manipulation"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* 3D Smiley Face Container */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48">
        {/* Main Face Circle */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-full shadow-2xl border-4 border-yellow-600 transform rotate-3 group-hover:rotate-0 transition-transform duration-300">
          {/* 3D Effect - Top highlight */}
          <div className="absolute top-2 left-4 w-16 h-8 bg-gradient-to-b from-yellow-200 to-transparent rounded-full opacity-60"></div>
          
          {/* Left Eye */}
          <div className="absolute top-8 left-8 w-6 h-6 bg-black rounded-full shadow-inner">
            <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full"></div>
          </div>
          
          {/* Right Eye */}
          <div className="absolute top-8 right-8 w-6 h-6 bg-black rounded-full shadow-inner">
            <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full"></div>
          </div>
          
          {/* Smile */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-8 border-b-4 border-black rounded-full"></div>
          
          {/* Cheek Highlights */}
          <div className="absolute bottom-4 left-4 w-4 h-2 bg-pink-300 rounded-full opacity-60"></div>
          <div className="absolute bottom-4 right-4 w-4 h-2 bg-pink-300 rounded-full opacity-60"></div>
        </div>
        
        {/* 3D Shadow */}
        <div className="absolute -bottom-2 left-2 right-2 h-4 bg-black opacity-20 rounded-full blur-sm"></div>
        
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl"></div>
      </div>
      
      {/* Text Label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mt-4"
      >
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-purple-800 mb-1 font-fredoka animate-bounce-gentle">
          I Feel Good!
        </h3>
        <p className="text-xs sm:text-sm text-purple-600 font-medium font-comic">
          Click me! 🎉
        </p>
      </motion.div>
      
              {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-4 left-4 w-2 h-2 bg-yellow-300 rounded-full animate-sparkle"
            animate={{ 
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: 0
            }}
          />
          <motion.div
            className="absolute top-6 right-6 w-1 h-1 bg-pink-300 rounded-full animate-sparkle"
            animate={{ 
              y: [0, -8, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              delay: 0.5
            }}
          />
          <motion.div
            className="absolute bottom-8 left-6 w-1.5 h-1.5 bg-orange-300 rounded-full animate-sparkle"
            animate={{ 
              y: [0, -6, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 1.8,
              repeat: Infinity,
              delay: 1
            }}
          />
          <motion.div
            className="absolute top-2 right-2 w-1 h-1 bg-blue-300 rounded-full animate-sparkle"
            animate={{ 
              y: [0, -5, 0],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ 
              duration: 1.2,
              repeat: Infinity,
              delay: 0.8
            }}
          />
        </div>
    </motion.button>
  );
} 