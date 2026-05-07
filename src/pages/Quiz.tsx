import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { kanjiN5, type KanjiData } from '../data/kanjiN5';

// 🎲 Fisher-Yates Shuffle (O(n) - optimal buat randomisasi)
const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export default function Quiz() {
  const { user, addXp } = useAuth();
  const navigate = useNavigate();

  const [sessionDeck, setSessionDeck] = useState<KanjiData[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [shake, setShake] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // 📊 Generate Adaptive Deck berdasarkan Level
  useEffect(() => {
    if (!user) return;
    
    // Scaling: Lvl 1-2 = 20 soal, Lvl 3-4 = 45 soal, Lvl 5-6 = 70 soal, Lvl 7+ = 103 soal
    const poolSize = user.level <= 2 ? 20 : user.level <= 4 ? 45 : user.level <= 6 ? 70 : 103;
    
    // Ambil kanji sesuai pool, lalu acak urutannya
    const filtered = kanjiN5.filter(k => k.id <= poolSize);
    setSessionDeck(shuffleArray(filtered));
    
    // Reset state quiz tiap deck baru digenerate
    setQIndex(0);
    setScore(0);
    setFeedback(null);
  }, [user?.level, user?.username]);

  const current = sessionDeck[qIndex];

  // 🎯 Generate 1 Benar + 3 Salah dari POOL YANG SAMA (biar relevan)
  const options = useMemo(() => {
    if (!current || sessionDeck.length === 0) return [];
    const others = sessionDeck.filter(k => k.id !== current.id).map(k => k.meaning);
    const selectedWrongs = others.sort(() => 0.5 - Math.random()).slice(0, 3);
    return shuffleArray([...selectedWrongs, current.meaning]);
  }, [qIndex, sessionDeck]);

  const handleAnswer = (selected: string) => {
    if (feedback || !current) return;
    
    const isCorrect = selected === current.meaning;
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      addXp(15);
      setScore(s => s + 1);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }

    setTimeout(() => {
      if (qIndex + 1 < sessionDeck.length) {
        setQIndex(prev => prev + 1);
        setFeedback(null);
      } else {
        setIsSyncing(true);
        setTimeout(() => navigate('/dashboard', { replace: true }), 1800);
      }
    }, 1000);
  };

  if (isSyncing) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center font-mono text-neon-cyan">
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.2 }}>
          <div className="text-2xl tracking-widest">SYNCING DATA...</div>
          <div className="w-48 h-1 bg-cyber-surface mt-4 rounded overflow-hidden border border-cyber-border">
            <motion.div initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 1.5 }} className="h-full bg-neon-yellow shadow-neon-yellow" />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user || sessionDeck.length === 0) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center text-center p-4">
        <p className="text-xl font-mono text-gray-400 animate-pulse">GENERATING NEURAL QUIZ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-gray-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-neon-cyan pointer-events-none z-50" />
        )}
        {feedback === 'wrong' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-red-500/40 pointer-events-none z-50" />
        )}
      </AnimatePresence>

      <motion.div
        animate={shake ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.45 }}
        className="w-full max-w-lg bg-cyber-surface border border-cyber-border rounded-2xl p-6 shadow-lg relative z-10"
      >
        <div className="flex justify-between items-center mb-6 font-mono text-xs">
          <button onClick={() => navigate('/dashboard')} className="text-neon-cyan hover:underline">← BACK</button>
          <span>Q {qIndex + 1}/{sessionDeck.length} | LVL POOL</span>
          <span className="text-neon-yellow">SCORE: {score}</span>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-5xl font-cyber text-white mb-2 drop-shadow-neon-cyan">{current.kanji}</h2>
          <p className="text-sm font-mono text-gray-500">PILIH ARTI YANG BENAR</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {options.map((opt, i) => (
            <button
              key={`${qIndex}-${i}`}
              onClick={() => handleAnswer(opt)}
              disabled={feedback !== null}
              className={`w-full p-3 rounded-lg font-mono text-sm border transition-all duration-200 ${
                feedback === 'correct' && opt === current.meaning
                  ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-neon-cyan'
                  : feedback === 'wrong' && opt === current.meaning
                  ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                  : feedback === 'wrong' && opt !== current.meaning
                  ? 'bg-red-500/20 border-red-500/50 text-red-300'
                  : 'bg-dark-bg border-cyber-border text-gray-300 hover:border-neon-pink hover:text-neon-pink'
              } disabled:cursor-not-allowed`}
            >
              {opt}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}