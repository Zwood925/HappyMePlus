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
      {/* 3D Sad Face Container */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48">
        {/* Storm Cloud */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="relative">
            {/* Main Cloud */}
            <div className="w-20 h-12 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full shadow-lg border-2 border-gray-500">
              {/* Cloud Highlights */}
              <div className="absolute top-1 left-2 w-6 h-3 bg-gray-300 rounded-full opacity-60"></div>
              <div className="absolute top-2 right-3 w-4 h-2 bg-gray-300 rounded-full opacity-60"></div>
              
              {/* Rain Drops */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                <motion.div
                  className="w-1 h-3 bg-blue-400 rounded-full"
                  animate={{ 
                    y: [0, 8, 0],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 1.2,
                    repeat: Infinity,
                    delay: 0
                  }}
                />
              </div>
              <div className="absolute bottom-0 left-1/3 transform -translate-x-1/2">
                <motion.div
                  className="w-0.5 h-2 bg-blue-400 rounded-full"
                  animate={{ 
                    y: [0, 6, 0],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 1.2,
                    repeat: Infinity,
                    delay: 0.3
                  }}
                />
              </div>
              <div className="absolute bottom-0 right-1/3 transform -translate-x-1/2">
                <motion.div
                  className="w-0.5 h-2.5 bg-blue-400 rounded-full"
                  animate={{ 
                    y: [0, 7, 0],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 1.2,
                    repeat: Infinity,
                    delay: 0.6
                  }}
                />
              </div>
            </div>
            
            {/* Lightning */}
            <motion.div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-yellow-300"
              animate={{ 
                opacity: [0, 1, 0],
                scaleY: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 0.8,
                repeat: Infinity,
                delay: 1.5
              }}
              style={{
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
              }}
            />
          </div>
        </div>

        {/* Main Face Circle */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500 rounded-full shadow-2xl border-4 border-blue-600 transform -rotate-2 group-hover:rotate-0 transition-transform duration-300">
          {/* 3D Effect - Top highlight */}
          <div className="absolute top-2 left-4 w-16 h-8 bg-gradient-to-b from-blue-200 to-transparent rounded-full opacity-60"></div>
          
          {/* Left Eye */}
          <div className="absolute top-8 left-8 w-6 h-6 bg-black rounded-full shadow-inner">
            <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full"></div>
            {/* Sad eyebrow */}
            <div className="absolute -top-1 left-0 w-6 h-1 bg-black rounded-full transform rotate-12"></div>
          </div>
          
          {/* Right Eye */}
          <div className="absolute top-8 right-8 w-6 h-6 bg-black rounded-full shadow-inner">
            <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full"></div>
            {/* Sad eyebrow */}
            <div className="absolute -top-1 right-0 w-6 h-1 bg-black rounded-full transform -rotate-12"></div>
          </div>
          
          {/* Sad Mouth */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-8 border-b-4 border-black rounded-full transform rotate-180"></div>
          
          {/* Tear Drop */}
          <motion.div
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-3 bg-blue-300 rounded-full"
            animate={{ 
              y: [0, 4, 0],
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
          
          {/* Cheek Highlights */}
          <div className="absolute bottom-4 left-4 w-4 h-2 bg-blue-200 rounded-full opacity-60"></div>
          <div className="absolute bottom-4 right-4 w-4 h-2 bg-blue-200 rounded-full opacity-60"></div>
        </div>
        
        {/* 3D Shadow */}
        <div className="absolute -bottom-2 left-2 right-2 h-4 bg-black opacity-20 rounded-full blur-sm"></div>
        
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl"></div>
      </div>
      
      {/* Text Label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mt-4"
      >
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-800 mb-1 font-fredoka animate-bounce-gentle">
          Feelin' Down
        </h3>
        <p className="text-xs sm:text-sm text-blue-600 font-medium font-comic">
          Need a hug? 🌧️
        </p>
      </motion.div>
      
      {/* Floating Rain Drops */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-4 left-4 w-1 h-2 bg-blue-300 rounded-full"
          animate={{ 
            y: [0, -8, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            delay: 0
          }}
        />
        <motion.div
          className="absolute top-6 right-6 w-0.5 h-1.5 bg-blue-300 rounded-full"
          animate={{ 
            y: [0, -6, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 1.2,
            repeat: Infinity,
            delay: 0.4
          }}
        />
        <motion.div
          className="absolute bottom-8 left-6 w-1 h-2 bg-blue-300 rounded-full"
          animate={{ 
            y: [0, -7, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 1.8,
            repeat: Infinity,
            delay: 0.8
          }}
        />
        <motion.div
          className="absolute top-2 right-2 w-0.5 h-1 bg-blue-300 rounded-full"
          animate={{ 
            y: [0, -5, 0],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{ 
            duration: 1.1,
            repeat: Infinity,
            delay: 1.2
          }}
        />
      </div>
    </motion.button>
  );
} 