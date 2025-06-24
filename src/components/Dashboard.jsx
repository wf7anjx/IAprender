import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  BookOpen, 
  Calculator, 
  Microscope, 
  Brain, 
  MessageCircle,
  Trophy,
  Target,
  Clock,
  LogOut
} from 'lucide-react';

const Dashboard = ({ onNavigate }) => {
  const { user, userProgress, signOut } = useAuth();

  const modules = [
    {
      id: 'math',
      title: 'Matemática',
      description: 'Operações, lógica e resolução de problemas',
      icon: Calculator,
      color: 'bg-green-500',
      totalGames: 1,
      route: 'games'
    },
    {
      id: 'portuguese',
      title: 'Português',
      description: 'Gramática, interpretação e vocabulário',
      icon: BookOpen,
      color: 'bg-blue-500',
      totalGames: 1,
      route: 'games'
    },
    {
      id: 'science',
      title: 'Ciências',
      description: 'Biologia, física e química básica',
      icon: Microscope,
      color: 'bg-red-500',
      totalGames: 1,
      route: 'games'
    },
    {
      id: 'logic',
      title: 'Lógica',
      description: 'Raciocínio lógico e sequências',
      icon: Brain,
      color: 'bg-purple-500',
      totalGames: 0,
      route: 'games'
    },
    {
      id: 'assistant',
      title: 'Assistente Virtual',
      description: 'Chat com IA para tirar dúvidas',
      icon: MessageCircle,
      color: 'bg-orange-500',
      totalGames: 0,
      route: 'chat'
    }
  ];

  const getCompletedGamesForModule = (moduleId) => {
    if (!userProgress?.completedGames) return 0;
    
    const moduleGameIds = {
      math: ['quiz_matematica'],
      portuguese: ['quiz_portugues'],
      science: ['quiz_ciencias'],
      logic: [],
      assistant: []
    };

    const moduleGames = moduleGameIds[moduleId] || [];
    return moduleGames.filter(gameId => userProgress.completedGames.includes(gameId)).length;
  };

  const getProgressPercentage = (moduleId) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module || module.totalGames === 0) return 0;
    
    const completed = getCompletedGamesForModule(moduleId);
    return Math.round((completed / module.totalGames) * 100);
  };

  const totalGames = modules.reduce((acc, module) => acc + module.totalGames, 0);
  const completedGames = userProgress?.completedGames?.length || 0;
  const overallProgress = totalGames > 0 ? Math.round((completedGames / totalGames) * 100) : 0;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">IAPrender</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Olá, {user?.displayName || 'Estudante'}!
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo de volta! 👋
          </h2>
          <p className="text-gray-600">
            Continue sua jornada de aprendizado e alcance novos objetivos.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Trophy className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {userProgress?.totalScore || 0}
                  </p>
                  <p className="text-sm text-gray-600">Pontos Totais</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {completedGames}
                  </p>
                  <p className="text-sm text-gray-600">Jogos Completados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {overallProgress}%
                  </p>
                  <p className="text-sm text-gray-600">Progresso Geral</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {modules.filter(m => m.totalGames > 0).length}
                  </p>
                  <p className="text-sm text-gray-600">Módulos Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Seu Progresso</CardTitle>
            <CardDescription>
              Acompanhe seu desenvolvimento em cada módulo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progresso Geral</span>
                <span className="text-sm text-gray-600">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
              <p className="text-sm text-gray-600">
                {completedGames} de {totalGames} jogos completados
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Modules Grid */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Módulos de Aprendizado
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => {
              const Icon = module.icon;
              const completedGames = getCompletedGamesForModule(module.id);
              const progressPercentage = getProgressPercentage(module.id);
              
              return (
                <Card key={module.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`${module.color} p-3 rounded-lg text-white`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        {module.totalGames > 0 && (
                          <Badge variant="secondary" className="mt-1">
                            {completedGames}/{module.totalGames} completos
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {module.description}
                    </CardDescription>
                    
                    {module.totalGames > 0 && (
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progresso</span>
                          <span>{progressPercentage}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                    )}
                    
                    <Button 
                      className="w-full" 
                      onClick={() => onNavigate(module.route)}
                    >
                      {module.route === 'chat' ? 'Conversar' : 'Jogar'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse rapidamente suas funcionalidades favoritas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-16 justify-start gap-3"
                onClick={() => onNavigate('games')}
              >
                <BookOpen className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-medium">Continuar Jogando</div>
                  <div className="text-sm text-gray-600">Pratique com nossos quizzes</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-16 justify-start gap-3"
                onClick={() => onNavigate('chat')}
              >
                <MessageCircle className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-medium">Assistente Virtual</div>
                  <div className="text-sm text-gray-600">Tire suas dúvidas com IA</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

