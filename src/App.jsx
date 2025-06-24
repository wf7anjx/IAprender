import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import GamesPage from './components/GamesPage';
import TechModulesPage from './components/TechModulesPage';
import ChatPage from './components/ChatPage';
import TeacherDashboard from './components/TeacherDashboard';
import EmotionalSupportModal from './components/EmotionalSupportModal';
import { getUserData } from './lib/firebase';
import { Loader2, GraduationCap, Heart } from 'lucide-react';
import './App.css';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userData, setUserData] = useState(null);
  const [userDataLoading, setUserDataLoading] = useState(true);
  const [isEmotionalSupportOpen, setIsEmotionalSupportOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  const navigate = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setUserDataLoading(false);
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const data = await getUserData(user.uid);
      setUserData(data);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setUserDataLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentPage('dashboard');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      setCurrentPage('login');
    } else if (!loading && user && currentPage === 'login') {
      setCurrentPage('dashboard');
    }
  }, [user, loading, currentPage]);

  if (loading || userDataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="h-12 w-12 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">IAPrender</h1>
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando aplicação...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  // If user is a teacher, show teacher dashboard
  if (userData?.role === 'teacher') {
    return (
      <>
        <TeacherDashboard />
        {/* Floating Emotional Support Button for Teachers */}
        <button
          onClick={() => setIsEmotionalSupportOpen(true)}
          className="fixed bottom-6 right-6 bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-40"
          title="Precisa de suporte emocional?"
        >
          <Heart className="h-6 w-6" />
        </button>
        <EmotionalSupportModal
          isOpen={isEmotionalSupportOpen}
          onClose={() => setIsEmotionalSupportOpen(false)}
        />
      </>
    );
  }

  // Student interface with navigation
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={navigate} />;
      case 'games':
        return <GamesPage onNavigate={navigate} />;
      case 'tech-modules':
        return <TechModulesPage onNavigate={navigate} />;
      case 'chat':
        return <ChatPage onNavigate={navigate} />;
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-800">IAPrender</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'dashboard'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setCurrentPage('games')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'games'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🎮 Jogos Básicos
              </button>
              <button
                onClick={() => setCurrentPage('tech-modules')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'tech-modules'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                💻 Módulos Tech
              </button>
              <button
                onClick={() => setCurrentPage('chat')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'chat'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🤖 Assistente
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Olá, {user?.displayName || 'Estudante'}!
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('games')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                currentPage === 'games'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎮 Jogos Básicos
            </button>
            <button
              onClick={() => setCurrentPage('tech-modules')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                currentPage === 'tech-modules'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              💻 Módulos Tech
            </button>
            <button
              onClick={() => setCurrentPage('chat')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                currentPage === 'chat'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🤖 Assistente
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {renderCurrentPage()}
      </main>

      {/* Floating Emotional Support Button */}
      <button
        onClick={() => setIsEmotionalSupportOpen(true)}
        className="fixed bottom-6 right-6 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-40 flex items-center space-x-2"
        title="Precisa de suporte emocional?"
      >
        <Heart className="h-5 w-5" />
        <span className="hidden sm:inline text-sm font-medium">Estou Mal</span>
      </button>

      {/* Emotional Support Modal */}
      <EmotionalSupportModal
        isOpen={isEmotionalSupportOpen}
        onClose={() => setIsEmotionalSupportOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
