import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { kanjiN5, type KanjiData } from '../data/kanjiN5';

const RATING_BUTTONS = [
  { quality: 0, label: 'AGAIN', color: 'text-red-400 border-red-400 hover:bg-red-400/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]', desc: '< 10m' },
  { quality: 1, label: 'HARD', color: 'text-orange-400 border-orange-400 hover:bg-orange-400/20 hover:shadow-[0_0_15px_rgba(249,115,22,0.5)]', desc: '1d' },
  { quality: 2, label: 'GOOD', color: 'text-neon-cyan border-neon-cyan hover:bg-neon-cyan/20 hover:shadow-neon-cyan', desc: '3d' },
  { quality: 3, label: 'EASY', color: 'text-green-400 border-green-400 hover:bg-green-400/20 hover:shadow-[0_0_15px_rgba(74,222,128,0.5)]', desc: '7d+' },
];

export default function Flashcards() {
  const { user, updateSRS } = useAuth();
  const navigate = useNavigate();
  
  // 📦 Session State
  const [sessionDeck, setSessionDeck] = useState<KanjiData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratedIds, setRatedIds] = useState<Set<string>>(new Set());
  const [isReady, setIsReady] = useState(false);

  // 🔒 Load or Restore Session
  useEffect(() => {
    if (!user || isReady) return;

    const stored = sessionStorage.getItem('cyberkanji_session');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSessionDeck(parsed.deck);
        setCurrentIndex(parsed.index);
        setRatedIds(new Set(parsed.ratedIds));
      } catch {
        // Fallback to fresh deck if parse error
        initFreshDeck();
      }
    } else {
      initFreshDeck();
    }
    setIsReady(true);
  }, [user, isReady]);

  const initFreshDeck = () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = kanjiN5.filter(k => {
      const srs = user!.srsData?.[k.id.toString()];
      if (!srs) return true;
      const next = new Date(srs.nextReview); next.setHours(0, 0, 0, 0);
      return next <= today;
    });
    setSessionDeck(due);
    setCurrentIndex(0);
    setRatedIds(new Set());
  };

  // 💾 Save Session to sessionStorage on every change
  useEffect(() => {
    if (!isReady) return;
    sessionStorage.setItem('cyberkanji_session', JSON.stringify({
      deck: sessionDeck,
      index: currentIndex,
      ratedIds: Array.from(ratedIds)
    }));
  }, [sessionDeck, currentIndex, ratedIds, isReady]);

  // 🛡️ Clamp index otomatis kalau deck berubah (misal pas reload/refresh)
  useEffect(() => {
    if (sessionDeck.length > 0 && currentIndex >= sessionDeck.length) {
      setCurrentIndex(sessionDeck.length - 1);
    }
  }, [sessionDeck.length, currentIndex]);

  const current = sessionDeck[currentIndex];
  const isRated = current ? ratedIds.has(current.id.toString()) : false;

  // Empty State
  if (!isReady || sessionDeck.length === 0) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center text-center p-4">
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-cyber text-neon-cyan mb-4">
          🌙 ALL CAUGHT UP, RUNNER
        </motion.h2>
        <p className="font-mono text-gray-400 mb-6">No cards due for review today.</p>
        <button onClick={() => navigate('/dashboard')} className="px-6 py-2 border border-neon-cyan text-neon-cyan rounded hover:bg-neon-cyan/10 transition-all font-mono">
          BACK TO DASHBOARD
        </button>
      </div>
    );
  }

  const handleRate = (quality: number) => {
    if (!current || isRated) return;
    
    updateSRS(current.id.toString(), quality);
    setRatedIds(prev => new Set(prev).add(current.id.toString()));
    
    setTimeout(() => {
      setIsFlipped(false);
      if (currentIndex < sessionDeck.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }, 350);
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const nextCard = () => {
    if (currentIndex < sessionDeck.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Ganti fungsi resetSession lama dengan ini:
  const resetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    //setRatedIds(new Set()); // Opsional: reset status "DONE" biar bisa rate ulang dari awal
  };

  return (
    <div className="min-h-screen bg-dark-bg text-gray-200 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-4 font-mono text-xs text-gray-400">
          <button onClick={() => navigate('/dashboard')} className="text-neon-cyan hover:underline">← BACK</button>
          <span>DUE: {sessionDeck.length} | CARD {currentIndex + 1}</span>
        </div>

        {/* 3D FLIP CARD */}
        <div className="relative w-full h-72 mx-auto mb-6" style={{ perspective: '1000px' }}>
          <motion.div
            className={`relative w-full h-full cursor-pointer ${isRated ? 'opacity-60 grayscale-[0.3]' : ''}`}
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => !isRated && setIsFlipped(!isFlipped)}
          >
            <div className="absolute inset-0 bg-cyber-surface border-2 border-neon-cyan/50 rounded-2xl flex flex-col items-center justify-center p-6" style={{ backfaceVisibility: 'hidden' }}>
              <span className="text-6xl md:text-7xl font-cyber text-white drop-shadow-neon-cyan mb-4">{current.kanji}</span>
              {isRated ? (
                <span className="absolute top-4 right-4 text-neon-cyan font-bold text-xs bg-cyber-surface/90 px-2 py-1 rounded border border-neon-cyan/40 shadow-[0_0_8px_rgba(0,243,255,0.4)]">
                  ✅ DONE
                </span>
              ) : (
                <p className="text-xs font-mono text-neon-cyan/70 tracking-widest">TAP TO FLIP</p>
              )}
            </div>
            <div className="absolute inset-0 bg-cyber-surface border-2 border-neon-pink/50 rounded-2xl flex flex-col items-center justify-center p-6" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <span className="text-3xl font-cyber text-neon-pink mb-2">{current.reading}</span>
              <span className="text-xl text-white font-mono text-center">{current.meaning}</span>
            </div>
          </motion.div>
        </div>

        {/* RATING BUTTONS */}
        <AnimatePresence>
          {isFlipped && !isRated && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="grid grid-cols-4 gap-2 mb-4"
            >
              {RATING_BUTTONS.map(btn => (
                <button
                  key={btn.quality}
                  onClick={() => handleRate(btn.quality)}
                  className={`flex flex-col items-center justify-center py-3 rounded-lg border font-mono text-xs transition-all duration-200 ${btn.color}`}
                >
                  <span className="font-bold">{btn.label}</span>
                  <span className="text-[10px] opacity-70 mt-1">{btn.desc}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* NAVIGATION BUTTONS */}
        <div className="flex gap-4 justify-center">
          <button onClick={prevCard} disabled={currentIndex === 0} className="p-3 rounded-lg border border-cyber-border bg-cyber-surface text-gray-400 hover:text-neon-cyan hover:border-neon-cyan disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={resetSession} className="p-3 rounded-lg border border-cyber-border bg-cyber-surface text-gray-400 hover:text-neon-yellow hover:border-neon-yellow transition-all">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button onClick={nextCard} disabled={currentIndex === sessionDeck.length - 1} className="p-3 rounded-lg border border-cyber-border bg-cyber-surface text-gray-400 hover:text-neon-cyan hover:border-neon-cyan disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}