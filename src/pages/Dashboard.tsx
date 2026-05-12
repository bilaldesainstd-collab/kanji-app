import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, BookOpen, Zap, Search, ShieldCheck } from 'lucide-react';
import { kanjiN5 } from '../data/kanjiN5';
import { Printer } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  // 📊 Data Constants
  const totalKanji = kanjiN5.length; // 103
  
  // ✅ FIX: Hitung masteredCount HANYA untuk kanji N5 (ID 1-103)
  // Filter biar nggak ngitung ID random kalau ada data sampah
  const masteredCount = user.masteredKanji.filter(id => {
    const numId = parseInt(id, 10);
    return numId >= 1 && numId <= totalKanji;
  }).length;
  
  const newCount = totalKanji - masteredCount;
  
  // 📈 Progress Calculations
  const n5Percent = totalKanji > 0 ? Math.min(100, Math.round((masteredCount / totalKanji) * 100)) : 0;
  const xpInLevel = user.xp % 100;
  const rank = user.level >= 10 ? "KANJI MASTER" : user.level >= 7 ? "SENSEI" : user.level >= 4 ? "APPRENTICE" : "NOVICE";

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
      className="min-h-screen bg-dark-bg text-gray-200 p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* 🔝 HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-cyber-border pb-4">
        {/* Kiri: Judul & Rank */}
        <div>
          <h1 className="text-2xl md:text-3xl font-cyber text-white tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-neon-cyan" />
            NEOTOKYO
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Trophy className="w-4 h-4 text-neon-yellow" />
            <span className="font-mono text-sm text-neon-yellow tracking-wide">{rank}</span>
          </div>
        </div>

        {/* Kanan: Username & Logout */}
        <div className="text-right w-full md:w-auto">
          <p className="text-sm font-mono text-neon-cyan tracking-wide mb-1 truncate">
            {user.username.toUpperCase()}
          </p>
          <button 
            onClick={handleLogout}
            className="text-xs font-mono text-gray-500 hover:text-red-400 hover:underline transition-colors cursor-pointer"
          >
            [ LOGOUT // TERMINATE SESSION ]
          </button>
        </div>
      </header>

      {/* 📊 STATS CARDS (Linked to Mastery Data) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Kanji */}
        <div className="bg-cyber-surface/60 backdrop-blur-md border border-gray-500/30 rounded-xl p-4 text-center">
          <p className="text-xs font-mono text-gray-400 mb-1">TOTAL KANJI (N5)</p>
          <p className="text-3xl font-cyber text-white">{totalKanji}</p>
        </div>
        
        {/* Mastered Count */}
        <div className="bg-cyber-surface/60 backdrop-blur-md border border-neon-pink/30 rounded-xl p-4 text-center">
          <p className="text-xs font-mono text-gray-400 mb-1">MASTERED</p>
          <p className="text-3xl font-cyber text-neon-pink drop-shadow-[0_0_8px_rgba(255,0,255,0.5)]">{masteredCount}</p>
        </div>
        
        {/* New/Locked Count */}
        <div className="bg-cyber-surface/60 backdrop-blur-md border border-neon-yellow/30 rounded-xl p-4 text-center">
          <p className="text-xs font-mono text-gray-400 mb-1">NEW (LOCKED)</p>
          <p className="text-3xl font-cyber text-neon-yellow drop-shadow-[0_0_8px_rgba(255,242,0,0.5)]">{newCount}</p>
        </div>
        
        {/* Level */}
        <div className="bg-cyber-surface/60 backdrop-blur-md border border-neon-cyan/30 rounded-xl p-4 text-center">
          <p className="text-xs font-mono text-gray-400 mb-1">YOUR LEVEL</p>
          <p className="text-3xl font-cyber text-neon-cyan">{user.level}</p>
        </div>
      </div>

      {/* 📈 PROGRESS SECTION (N5 % + XP Bar) */}
      <div className="w-full md:w-3/4 mx-auto mb-8 space-y-4 bg-cyber-surface/30 border border-cyber-border rounded-xl p-4">
        
        {/* N5 Mastery Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono text-gray-400">
            <span>N5 MASTERY PROGRESS</span>
            <span className="text-neon-cyan">{n5Percent}%</span>
          </div>
          <div className="h-2.5 bg-dark-bg border border-cyber-border rounded-full overflow-hidden">
            <motion.div
              key={`n5-${n5Percent}`} // ✅ FIX: key biar animasi jalan tiap nilai berubah
              initial={{ width: 0 }}
              animate={{ width: `${n5Percent}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
              className="h-full bg-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.6)]"
            />
          </div>
        </div>

        {/* XP Progress */}
        <div className="space-y-1 pt-2 border-t border-cyber-border/50">
          <div className="flex justify-between text-xs font-mono text-gray-400">
            <span>XP TO NEXT LEVEL</span>
            <span className="text-neon-yellow">{xpInLevel} / 100</span>
          </div>
          <div className="h-2 bg-dark-bg border border-cyber-border rounded-full overflow-hidden">
            <motion.div
              key={`xp-${xpInLevel}`} // ✅ FIX: key biar animasi jalan tiap nilai berubah
              initial={{ width: 0 }}
              animate={{ width: `${xpInLevel}%` }}
              transition={{ type: "spring", stiffness: 60, damping: 20 }}
              className="h-full bg-gradient-to-r from-neon-yellow to-orange-500 shadow-[0_0_10px_rgba(255,242,0,0.5)]"
            />
          </div>
        </div>
      </div>

      {/* 🃏 MENU CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => navigate('/flashcards')} className="group bg-cyber-surface/60 backdrop-blur-md border border-neon-pink/40 hover:border-neon-pink rounded-xl p-5 text-left transition-all hover:shadow-neon-pink/30">
          <div className="flex items-center gap-3 mb-1"><BookOpen className="w-6 h-6 text-neon-pink group-hover:scale-110 transition-transform"/><span className="font-cyber text-lg text-white">FLASHCARDS DRILL</span></div>
          <p className="text-sm font-mono text-gray-400">Spaced repetition & flip cards</p>
        </button>
        
        <button onClick={() => navigate('/quiz')} className="group bg-cyber-surface/60 backdrop-blur-md border border-neon-pink/40 hover:border-neon-pink rounded-xl p-5 text-left transition-all hover:shadow-neon-pink/30">
          <div className="flex items-center gap-3 mb-1"><Zap className="w-6 h-6 text-neon-pink group-hover:scale-110 transition-transform"/><span className="font-cyber text-lg text-white">QUIZ SURVIVAL</span></div>
          <p className="text-sm font-mono text-gray-400">Test knowledge for bonus XP</p>
        </button>

        <button onClick={() => navigate('/browse-kanji')} className="group bg-cyber-surface/60 backdrop-blur-md border border-neon-cyan/40 hover:border-neon-cyan rounded-xl p-5 text-left transition-all hover:shadow-neon-cyan/30">
          <div className="flex items-center gap-3 mb-1"><Search className="w-6 h-6 text-neon-cyan group-hover:scale-110 transition-transform"/><span className="font-cyber text-lg text-white">BROWSE ALL KANJI</span></div>
          <p className="text-sm font-mono text-gray-400">{totalKanji} Items • {masteredCount} Mastered</p>
        </button>

        <button onClick={() => navigate('/print-cards')} className="group bg-cyber-surface/60 backdrop-blur-md border border-gray-500/40 hover:border-gray-300 rounded-xl p-5 text-left transition-all">
          <div className="flex items-center gap-3 mb-1"><Printer className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors"/><span className="font-cyber text-lg text-white">PRINT FLASHCARDS</span></div>
          <p className="text-sm font-mono text-gray-400">Generate A4 cut-out sheets (B&W)</p>
        </button>
      </div>
    </motion.div>
  );
}