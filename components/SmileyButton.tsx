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
      {/* Clean Smiley Face Container */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36">
        {/* Main Face Circle */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-full shadow-lg border-3 border-yellow-600 group-hover:shadow-xl transition-all duration-300">
          {/* Simple Highlight */}
          <div className="absolute top-3 left-6 w-12 h-6 bg-gradient-to-b from-yellow-200 to-transparent rounded-full opacity-50"></div>
          
          {/* Left Eye - Spread further apart */}
          <div className="absolute top-10 left-8 w-5 h-5 bg-black rounded-full">
            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
          
          {/* Right Eye - Spread further apart */}
          <div className="absolute top-10 right-8 w-5 h-5 bg-black rounded-full">
            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
          
          {/* Happy Smile - Cleaner curve */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-12 h-6 border-b-3 border-black rounded-full"></div>
          
          {/* Simple Cheek Highlights */}
          <div className="absolute bottom-6 left-6 w-3 h-1.5 bg-pink-300 rounded-full opacity-60"></div>
          <div className="absolute bottom-6 right-6 w-3 h-1.5 bg-pink-300 rounded-full opacity-60"></div>
        </div>
        
        {/* Simple Shadow */}
        <div className="absolute -bottom-1 left-1 right-1 h-2 bg-black opacity-20 rounded-full blur-sm"></div>
        
        {/* Hover Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-lg"></div>
      </div>
      
      {/* Text Label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mt-3"
      >
        <h3 className="text-sm sm:text-base md:text-lg font-bold text-purple-800 mb-1 font-fredoka">
          I Feel Good!
        </h3>
        <p className="text-xs text-purple-600 font-medium">
          🎉
        </p>
      </motion.div>
      
      {/* Simple Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-2 left-2 w-1.5 h-1.5 bg-yellow-300 rounded-full"
          animate={{ 
            y: [0, -8, 0],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            delay: 0
          }}
        />
        <motion.div
          className="absolute top-4 right-4 w-1 h-1 bg-pink-300 rounded-full"
          animate={{ 
            y: [0, -6, 0],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ 
            duration: 1.8,
            repeat: Infinity,
            delay: 0.8
          }}
        />
        <motion.div
          className="absolute bottom-6 left-4 w-1 h-1 bg-orange-300 rounded-full"
          animate={{ 
            y: [0, -5, 0],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            delay: 1.2
          }}
        />
      </div>
    </motion.button>
  );
} 