import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface SRSCardData {
  interval: number;
  easeFactor: number;
  nextReview: string;
  repetitions: number;
}

export interface User {
  username: string;
  xp: number;
  level: number;
  masteredKanji: string[];
  srsData: Record<string, SRSCardData>;
}

interface ProfileData {
  password: string;
  xp: number;
  level: number;
  masteredKanji: string[];
  srsData: Record<string, SRSCardData>;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string) => boolean;
  logout: () => void;
  addXp: (amount: number) => void;
  toggleKanjiMastered: (kanjiId: string) => void;
  updateSRS: (kanjiId: string, quality: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_SESSION = 'cyberkanji_session';
const STORAGE_PROFILES = 'cyberkanji_profiles';

const calcLevel = (xp: number) => Math.floor(xp / 100) + 1;

// 🧠 Simplified SM-2 Logic
const calculateNextReview = (current: SRSCardData | undefined, quality: number): SRSCardData => {
  const today = new Date();
  const { interval = 0, easeFactor = 2.5, repetitions = 0 } = current || {};
  
  let newInterval = interval;
  let newEase = easeFactor;
  let newReps = repetitions;

  if (quality < 2) {
    newInterval = quality === 0 ? 0 : Math.max(1, Math.round(interval * 1.2));
    newReps = 0;
    newEase = Math.max(1.3, easeFactor - 0.2);
  } else {
    if (repetitions === 0) newInterval = 1;
    else if (repetitions === 1) newInterval = 3;
    else newInterval = Math.round(interval * easeFactor);
    
    if (quality === 3) newInterval = Math.round(newInterval * 1.5);
    
    newReps = repetitions + 1;
    newEase = Math.max(1.3, easeFactor + 0.1 - (3 - quality) * 0.05);
  }

  const nextReview = new Date(today);
  nextReview.setDate(today.getDate() + newInterval);
  
  return { interval: newInterval, easeFactor: newEase, nextReview: nextReview.toISOString(), repetitions: newReps };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // ✅ State loading

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_SESSION);
    if (stored) {
      try { setUser(JSON.parse(stored) as User); }
      catch { localStorage.removeItem(STORAGE_SESSION); }
    }
    setIsLoading(false); // ✅ Selesai baca localStorage
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_SESSION, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_SESSION);
  }, [user]);

  // ✅ FIX: Tambahin nama parameter `data` + tipe yang bener
  const saveProfile = (username: string,  data: Omit<ProfileData, 'password'>) => {
    const raw = localStorage.getItem(STORAGE_PROFILES);
    const profiles: Record<string, ProfileData> = raw ? JSON.parse(raw) : {};
    if (profiles[username]) {
      profiles[username] = { ...profiles[username], ...data };
      localStorage.setItem(STORAGE_PROFILES, JSON.stringify(profiles));
    }
  };

  const login = useCallback((username: string, password: string): boolean => {
    const raw = localStorage.getItem(STORAGE_PROFILES);
    const profiles: Record<string, ProfileData> = raw ? JSON.parse(raw) : {};

    if (profiles[username] && profiles[username].password === password) {
      const { password: _, ...userData } = profiles[username];
      // ✅ FIX: Pastikan srsData selalu ada (fallback ke {})
      setUser({ username, ...userData, srsData: userData.srsData || {} });
      return true;
    }
    return false;
  }, []);

  const register = useCallback((username: string, password: string): boolean => {
    const raw = localStorage.getItem(STORAGE_PROFILES);
    const profiles: Record<string, ProfileData> = raw ? JSON.parse(raw) : {};

    if (profiles[username]) return false;

    profiles[username] = { password, xp: 0, level: 1, masteredKanji: [], srsData: {} };
    localStorage.setItem(STORAGE_PROFILES, JSON.stringify(profiles));

    setUser({ username, xp: 0, level: 1, masteredKanji: [], srsData: {} });
    return true;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const addXp = useCallback((amount: number) => {
    setUser(prev => {
      if (!prev) return null;
      const newXP = prev.xp + amount;
      const updated = { ...prev, xp: newXP, level: calcLevel(newXP) };
      // ✅ FIX: Safe access srsData
      saveProfile(prev.username, { 
        xp: newXP, 
        level: updated.level, 
        masteredKanji: prev.masteredKanji, 
        srsData: prev.srsData || {} 
      });
      return updated;
    });
  }, []);

  const toggleKanjiMastered = useCallback((kanjiId: string) => {
    setUser(prev => {
      if (!prev) return null;
      const isMastered = prev.masteredKanji.includes(kanjiId);
      const newMastered = isMastered 
        ? prev.masteredKanji.filter(id => id !== kanjiId) 
        : [...prev.masteredKanji, kanjiId];
      const xpDelta = isMastered ? -25 : 25;
      const newXP = Math.max(0, prev.xp + xpDelta);
      const updated = { ...prev, xp: newXP, level: calcLevel(newXP), masteredKanji: newMastered };
      // ✅ FIX: Safe access srsData
      saveProfile(prev.username, { 
        xp: newXP, 
        level: updated.level, 
        masteredKanji: newMastered, 
        srsData: prev.srsData || {} 
      });
      return updated;
    });
  }, []);

  // 🧠 SRS UPDATE + Auto-Mastery Logic
const updateSRS = useCallback((kanjiId: string, quality: number) => {
  setUser(prev => {
    if (!prev) return null;
    
    const srsData = prev.srsData || {};
    const currentSRS = srsData[kanjiId];
    const nextSRS = calculateNextReview(currentSRS, quality);
    const newSrsData = { ...srsData, [kanjiId]: nextSRS };

    // ✅ AUTO-MASTERY RULE:
    // Kalau interval review >= 21 hari & belum ada di list mastered → tambahin
    // Kalau klik AGAIN (quality 0) & udah mastered → cabut status mastered
    const MASTER_THRESHOLD_DAYS = 21;
    let newMastered = [...prev.masteredKanji];

    if (nextSRS.interval >= MASTER_THRESHOLD_DAYS && !newMastered.includes(kanjiId)) {
      newMastered.push(kanjiId);
    } else if (quality === 0 && newMastered.includes(kanjiId)) {
      newMastered = newMastered.filter(id => id !== kanjiId);
    }

    const xpGain = quality >= 2 ? 5 : 2;
    const newXP = prev.xp + xpGain;
    
    saveProfile(prev.username, { 
      xp: newXP, 
      level: calcLevel(newXP), 
      masteredKanji: newMastered, 
      srsData: newSrsData 
    });
    
    return { ...prev, xp: newXP, level: calcLevel(newXP), masteredKanji: newMastered, srsData: newSrsData };
  });
}, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, addXp, toggleKanjiMastered, updateSRS }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an <AuthProvider />');
  return context;
};