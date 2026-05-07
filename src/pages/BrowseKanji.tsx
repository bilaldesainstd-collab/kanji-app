import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, ArrowLeft, CheckCircle, Circle } from 'lucide-react';
import { kanjiN5 } from '../data/kanjiN5';

export default function BrowseKanji() {
  const { user, toggleKanjiMastered } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return kanjiN5;
    const q = search.toLowerCase();
    return kanjiN5.filter(k => 
      k.meaning.toLowerCase().includes(q) || 
      k.reading.toLowerCase().includes(q) || 
      k.id.toString().includes(q)
    );
  }, [search]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-dark-bg text-gray-200 p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-neon-cyan hover:underline font-mono text-sm">
          <ArrowLeft className="w-4 h-4" /> BACK
        </button>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search ID, Reading, or Meaning..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-cyber-surface border border-cyber-border rounded-lg pl-10 pr-4 py-2 text-sm font-mono text-neon-cyan focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_10px_rgba(0,243,255,0.3)] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 font-mono text-sm text-gray-400">
        <span>SHOWING: {filtered.length} / {kanjiN5.length}</span>
        <span className="text-neon-cyan">MASTERED: {user.masteredKanji.length}</span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
        {filtered.map((k) => {
          const isMastered = user.masteredKanji.includes(k.id.toString());
          return (
            <motion.div 
              key={k.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleKanjiMastered(k.id.toString())}
              className={`relative aspect-square rounded-lg flex flex-col items-center justify-center font-mono border transition-all cursor-pointer select-none ${
                isMastered
                  ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan shadow-[0_0_12px_rgba(0,243,255,0.4)] hover:shadow-[0_0_24px_rgba(0,243,255,0.7)]'
                  : 'bg-cyber-surface/60 border-cyber-border text-gray-500 hover:border-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="absolute top-1.5 right-1.5">
                {isMastered ? <CheckCircle className="w-3.5 h-3.5 text-neon-cyan drop-shadow-[0_0_4px_rgba(0,243,255,0.8)]" /> : <Circle className="w-3.5 h-3.5 text-gray-600" />}
              </div>
              <span className="text-[10px] opacity-50">#{k.id}</span>
              <span className="text-lg md:text-xl font-bold mt-1">{k.kanji}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}