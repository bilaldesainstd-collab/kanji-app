import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Terminal, User, Lock, ArrowRight } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise((res) => setTimeout(res, 600));

    const success = register(username, password);
    if (success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError('>> REGISTRATION FAILED: Username already exists in the grid.');
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="min-h-screen flex items-center justify-center bg-dark-bg p-4"
    >
      <div className="w-full max-w-md bg-cyber-surface border border-neon-pink/30 rounded-lg p-6 shadow-lg">
        {/* Header Terminal */}
        <div className="flex items-center gap-2 mb-6 text-neon-pink border-b border-neon-pink/20 pb-3">
          <Terminal className="w-5 h-5" />
          <span className="font-mono text-sm tracking-widest">TERMINAL_AUTH // REG_SEQ</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-900/20 border border-red-500/50 text-red-400 p-2 text-sm font-mono rounded"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-400 flex items-center gap-2">
              <User className="w-3 h-3" /> NEW_USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="create_handle..."
              className="w-full bg-dark-bg border border-neon-pink/40 rounded px-3 py-2 text-neon-pink font-mono focus:outline-none focus:border-neon-pink focus:shadow-[0_0_10px_rgba(255,0,255,0.4)] transition-all duration-300"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-400 flex items-center gap-2">
              <Lock className="w-3 h-3" /> CREATE_PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-dark-bg border border-neon-pink/40 rounded px-3 py-2 text-neon-pink font-mono focus:outline-none focus:border-neon-pink focus:shadow-[0_0_10px_rgba(255,0,255,0.4)] transition-all duration-300"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-neon-pink/10 border border-neon-pink text-neon-pink font-mono py-2 rounded hover:bg-neon-pink/20 hover:shadow-neon-pink transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'CREATING IDENTITY...' : (
              <>REGISTER_TO_NETWORK <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-mono text-gray-500">
          Already connected?{' '}
          <Link to="/login" className="text-neon-cyan hover:text-neon-cyan/80 hover:underline transition-colors">
            [LOGIN_TO_SYSTEM]
          </Link>
        </div>
      </div>
    </motion.div>
  );
}