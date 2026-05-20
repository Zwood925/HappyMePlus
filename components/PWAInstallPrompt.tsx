import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true); // Default true to prevent flicker
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(isAppInstalled);

    // Detect if they are on an iPhone/iPad
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Android/Chrome native install listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsStandalone(false); 
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // If already installed, or not supported, hide completely
  if (isStandalone) return null;
  if (!deferredPrompt && !isIOS) return null;

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSPrompt(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <>
      {/* The Floating Action Button */}
      <div className="fixed bottom-24 left-0 right-0 flex justify-center z-40 pointer-events-none px-4">
        <motion.button
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={handleInstallClick}
          className="pointer-events-auto bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 transform hover:scale-105 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Install App
        </motion.button>
      </div>

      {/* iOS Instructions Modal */}
      <AnimatePresence>
        {showIOSPrompt && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-end sm:items-center justify-center p-4 pb-12"
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm relative"
            >
              <button 
                onClick={() => setShowIOSPrompt(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-2"
              >
                ✕
              </button>
              
              <div className="text-center mt-2">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-3xl shadow-lg">
                  ✨
                </div>
                <h3 className="text-2xl font-bold mb-2">Install HappyMe+</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Install this app on your iPhone home screen for quick, native access!
                </p>
                
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="text-2xl">1️⃣</div>
                    <p className="text-sm text-gray-700">Tap the <b>Share</b> button at the bottom of Safari.</p>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="text-2xl">2️⃣</div>
                    <p className="text-sm text-gray-700">Scroll down and tap <b>Add to Home Screen</b> ➕</p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowIOSPrompt(false)}
                  className="mt-6 w-full bg-gray-900 text-white font-semibold py-4 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}