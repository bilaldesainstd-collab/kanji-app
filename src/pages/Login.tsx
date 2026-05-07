import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Terminal, User, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load username jika pernah dicentang "Remember Me"
  useEffect(() => {
    const remembered = localStorage.getItem('cyberkanji_remember_user');
    if (remembered) {
      setUsername(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulasi delay jaringan biar vibe terminal terasa
    await new Promise((res) => setTimeout(res, 600));

    const success = login(username, password);
    if (success) {
      if (rememberMe) {
        localStorage.setItem('cyberkanji_remember_user', username);
      } else {
        localStorage.removeItem('cyberkanji_remember_user');
      }
      navigate('/dashboard', { replace: true });
    } else {
      setError('>> ACCESS DENIED: Invalid credentials.');
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
      <div className="w-full max-w-md bg-cyber-surface border border-neon-cyan/30 rounded-lg p-6 shadow-lg">
        {/* Header Terminal */}
        <div className="flex items-center gap-2 mb-6 text-neon-cyan border-b border-neon-cyan/20 pb-3">
          <Terminal className="w-5 h-5" />
          <span className="font-mono text-sm tracking-widest">TERMINAL_AUTH // LOGIN_SEQ</span>
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

          {/* Username Input */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-400 flex items-center gap-2">
              <User className="w-3 h-3" /> USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="enter_handle..."
              className="w-full bg-dark-bg border border-neon-cyan/40 rounded px-3 py-2 text-neon-cyan font-mono focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_10px_rgba(0,243,255,0.4)] transition-all duration-300"
              required
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-400 flex items-center gap-2">
              <Lock className="w-3 h-3" /> PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-dark-bg border border-neon-cyan/40 rounded px-3 py-2 text-neon-cyan font-mono focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_10px_rgba(0,243,255,0.4)] transition-all duration-300"
              required
            />
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-neon-cyan rounded border-gray-600 bg-dark-bg cursor-pointer"
            />
            <label htmlFor="remember" className="text-xs font-mono text-gray-400 cursor-pointer select-none">
              REMEMBER SESSION
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan font-mono py-2 rounded hover:bg-neon-cyan/20 hover:shadow-neon-cyan transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'AUTHENTICATING...' : (
              <>INITIALIZE SESSION <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-mono text-gray-500">
          No account?{' '}
          <Link to="/register" className="text-neon-pink hover:text-neon-pink/80 hover:underline transition-colors">
            [REGISTER_NEW_USER]
          </Link>
        </div>
      </div>
    </motion.div>
  );
}