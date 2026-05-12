import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Flashcards from './pages/Flashcards';
import Quiz from './pages/Quiz';
import BrowseKanji from './pages/BrowseKanji';
import KanjiPrintModule from './pages/KanjiPrintModule';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Container utama: relative biar z-index anak elemen teratur */}
        <div className="relative min-h-screen bg-dark-bg text-gray-200 selection:bg-neon-cyan selection:text-black">
          
          {/* 📺 CRT SCANLINES OVERLAY */}
          <div
            className="fixed inset-0 z-50 pointer-events-none"
            style={{
              // background: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15) 0px, rgba(0, 0, 0, 0.15) 1px, transparent 1px, transparent 2px)',
            }}
          />

          {/* 🛣️ ROUTING */}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="/browse-kanji" element={<ProtectedRoute><BrowseKanji /></ProtectedRoute>} />
            <Route path="/print-cards" element={<ProtectedRoute><KanjiPrintModule /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;