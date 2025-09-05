import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { DailyPromptResponse } from '../lib/dailyPrompts';
import { 
  createJoyCardFromResponse, 
  downloadJoyCard, 
  shareJoyCard, 
  JOY_CARD_TEMPLATES,
  JoyCardTemplate 
} from '../lib/joyCards';

interface JoyCardGeneratorProps {
  response: DailyPromptResponse;
  onClose: () => void;
}

export default function JoyCardGenerator({ response, onClose }: JoyCardGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<JoyCardTemplate>(JOY_CARD_TEMPLATES[0]);
  const [generatedCard, setGeneratedCard] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const generateCard = async () => {
    setIsGenerating(true);
    try {
      const cardDataUrl = await createJoyCardFromResponse(response, selectedTemplate.id);
      setGeneratedCard(cardDataUrl);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating joy card:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedCard) {
      const fileName = `joy-card-${new Date().toISOString().split('T')[0]}.png`;
      downloadJoyCard(generatedCard, fileName);
    }
  };

  const handleShare = () => {
    if (generatedCard) {
      const shareText = `"${response.response}" - My joy today! 🌟`;
      shareJoyCard(generatedCard, shareText);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Create Joy Card ✨</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 mt-2">Share your joy with the world!</p>
        </div>

        <div className="p-6">
          {!showPreview ? (
            /* Template Selection */
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Your Style</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {JOY_CARD_TEMPLATES.map((template) => (
                    <motion.button
                      key={template.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedTemplate(template)}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        selectedTemplate.id === template.id
                          ? 'border-purple-500 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="w-full h-24 rounded-lg mb-2"
                        style={{ background: template.backgroundColor }}
                      />
                      <p className="text-sm font-medium text-gray-700">{template.name}</p>
                      {selectedTemplate.id === template.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                        >
                          <span className="text-white text-xs">✓</span>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Preview</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Prompt:</span> {response.promptText}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Your Response:</span> {response.response}
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateCard}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Your Joy Card...
                  </div>
                ) : (
                  'Generate Joy Card ✨'
                )}
              </motion.button>
            </div>
          ) : (
            /* Card Preview and Actions */
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Joy Card is Ready! 🎉</h3>
                {generatedCard && (
                  <div className="text-center">
                    <Image
                      src={generatedCard}
                      alt="Generated Joy Card"
                      width={400}
                      height={300}
                      className="mx-auto mb-4 rounded-lg shadow-lg"
                      unoptimized
                    />
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={handleDownload}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        📥 Download
                      </button>
                      <button
                        onClick={handleShare}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        📤 Share
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPreview(false)}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  ← Try Different Style
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
