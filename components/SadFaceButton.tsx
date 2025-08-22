import { motion } from 'framer-motion';

interface SadFaceButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function SadFaceButton({ onClick, disabled = false }: SadFaceButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="relative group touch-manipulation"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Clean Sad Face Container */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36">
        {/* Simple Cloud */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-16 h-8 bg-gradient-to-b from-gray-300 to-gray-500 rounded-full shadow-md border border-gray-400">
            {/* Simple Cloud Highlight */}
            <div className="absolute top-1 left-2 w-4 h-2 bg-gray-200 rounded-full opacity-60"></div>
            <div className="absolute top-2 right-2 w-3 h-1.5 bg-gray-200 rounded-full opacity-60"></div>
          </div>
        </div>

        {/* Main Face Circle */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500 rounded-full shadow-lg border-3 border-blue-600 group-hover:shadow-xl transition-all duration-300">
          {/* Simple Highlight */}
          <div className="absolute top-3 left-6 w-12 h-6 bg-gradient-to-b from-blue-200 to-transparent rounded-full opacity-50"></div>
          
          {/* Left Eye - Spread further apart */}
          <div className="absolute top-10 left-8 w-5 h-5 bg-black rounded-full">
            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full"></div>
            {/* Simple sad eyebrow */}
            <div className="absolute -top-0.5 left-0 w-5 h-0.5 bg-black rounded-full transform rotate-6"></div>
          </div>
          
          {/* Right Eye - Spread further apart */}
          <div className="absolute top-10 right-8 w-5 h-5 bg-black rounded-full">
            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full"></div>
            {/* Simple sad eyebrow */}
            <div className="absolute -top-0.5 right-0 w-5 h-0.5 bg-black rounded-full transform -rotate-6"></div>
          </div>
          
          {/* Sad Mouth - Cleaner curve */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-12 h-6 border-t-3 border-black rounded-full"></div>
          
          {/* Simple Cheek Highlights */}
          <div className="absolute bottom-6 left-6 w-3 h-1.5 bg-blue-200 rounded-full opacity-60"></div>
          <div className="absolute bottom-6 right-6 w-3 h-1.5 bg-blue-200 rounded-full opacity-60"></div>
          
          {/* Simple Tear Drop */}
          <motion.div
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-2 bg-blue-300 rounded-full"
            animate={{ 
              y: [0, 3, 0],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: 0.5
            }}
            style={{
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }}
          />
        </div>
        
        {/* Simple Shadow */}
        <div className="absolute -bottom-1 left-1 right-1 h-2 bg-black opacity-20 rounded-full blur-sm"></div>
        
        {/* Hover Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-lg"></div>
      </div>
      
      {/* Text Label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mt-3"
      >
        <h3 className="text-sm sm:text-base md:text-lg font-bold text-blue-800 mb-1 font-fredoka">
          Feelin&apos; Down
        </h3>
        <p className="text-xs text-blue-600 font-medium">
          🌧️
        </p>
      </motion.div>
      
      {/* Simple Floating Rain Drops */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-2 left-2 w-1 h-1.5 bg-blue-300 rounded-full"
          animate={{ 
            y: [0, -6, 0],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            delay: 0
          }}
        />
        <motion.div
          className="absolute top-4 right-4 w-0.5 h-1 bg-blue-300 rounded-full"
          animate={{ 
            y: [0, -4, 0],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ 
            duration: 1.2,
            repeat: Infinity,
            delay: 0.6
          }}
        />
        <motion.div
          className="absolute bottom-6 left-4 w-0.5 h-1 bg-blue-300 rounded-full"
          animate={{ 
            y: [0, -5, 0],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ 
            duration: 1.8,
            repeat: Infinity,
            delay: 1.2
          }}
        />
      </div>
    </motion.button>
  );
} 