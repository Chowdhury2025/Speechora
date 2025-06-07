import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/common/Header';

const categories = [
  {
    title: 'Requests',
    items: ['I want toy', 'I want to play', 'I want snack', 'I want music', 'I want to go']
  },
  {
    title: 'Needs',
    items: ['I need help', 'I\'m tired', 'I need potty', 'I need break', 'I\'m sick']
  },
  {
    title: 'Comfort',
    items: ['I want hug', 'I want quiet', 'I need space', 'I\'m cold', 'I\'m hot']
  },
  {
    title: 'Routine',
    items: ['I\'m hungry', 'I want more', 'I\'m done', 'I need drink']
  }
];

const IWantNeedsPage = () => {
  const [selectedPhrase, setSelectedPhrase] = useState('');
  const speechSynthesisRef = useRef(null);

  useEffect(() => {
    // Initialize speech synthesis
    speechSynthesisRef.current = window.speechSynthesis;
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  const speakPhrase = (phrase) => {
    setSelectedPhrase(phrase);
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.rate = 0.9; // Slightly slower for better comprehension
      speechSynthesisRef.current.speak(utterance);
    }
  };

  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <Header title='I Want / Needs' />

      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        {/* Selected Phrase Display */}
        <motion.div 
          className="mb-8 p-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-xl text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            {selectedPhrase || "Click a phrase to hear it!"}
          </h2>
          {selectedPhrase && (
            <button
              onClick={() => speakPhrase(selectedPhrase)}
              className="px-6 py-3 bg-white text-purple-600 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              🔊 Say it again
            </button>
          )}
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              className="p-6 bg-white rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{category.title}</h3>
              <div className="grid grid-cols-1 gap-3">
                {category.items.map((phrase, phraseIndex) => (
                  <motion.button
                    key={phraseIndex}
                    onClick={() => speakPhrase(phrase)}
                    className={`p-4 rounded-lg text-left text-lg font-medium transition-all
                      ${selectedPhrase === phrase 
                        ? 'bg-purple-600 text-white shadow-lg transform scale-105' 
                        : 'bg-gray-100 text-gray-700 hover:bg-purple-100'}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {phrase}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default IWantNeedsPage;
