import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FirebaseWebService from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  Clock, 
  Trophy,
  RotateCcw,
  Home
} from 'lucide-react';

const GamesPage = ({ onNavigate }) => {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, userProgress, refreshProgress } = useAuth();

  useEffect(() => {
    const availableGames = FirebaseWebService.getAvailableGames();
    setGames(availableGames);
  }, []);

  const isGameCompleted = (gameId) => {
    return userProgress?.completedGames?.includes(gameId) || false;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-500';
      case 'Médio': return 'bg-yellow-500';
      case 'Difícil': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const startGame = (game) => {
    setSelectedGame(game);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setGameCompleted(false);
    setShowResult(false);
  };

  const selectAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const nextQuestion = async () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === selectedGame.questions[currentQuestion].correct;
    const newScore = score + (isCorrect ? 10 : 0);
    setScore(newScore);

    if (currentQuestion < selectedGame.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Game completed
      setGameCompleted(true);
      setShowResult(true);
      
      try {
        setLoading(true);
        await FirebaseWebService.saveUserProgress(selectedGame.id, newScore, true);
        await refreshProgress();
      } catch (error) {
        console.error('Error saving progress:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setGameCompleted(false);
    setShowResult(false);
  };

  const backToGames = () => {
    setSelectedGame(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setGameCompleted(false);
    setShowResult(false);
  };

  if (selectedGame) {
    const question = selectedGame.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / selectedGame.questions.length) * 100;

    if (showResult) {
      const percentage = Math.round((score / (selectedGame.questions.length * 10)) * 100);
      
      return (
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4">
                  <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
                </div>
                <CardTitle className="text-2xl">Parabéns! 🎉</CardTitle>
                <CardDescription>
                  Você completou o {selectedGame.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{score}</div>
                    <div className="text-sm text-blue-800">Pontos</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{percentage}%</div>
                    <div className="text-sm text-green-800">Acertos</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button onClick={restartGame} variant="outline" className="w-full">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Jogar Novamente
                  </Button>
                  <Button onClick={backToGames} className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar aos Jogos
                  </Button>
                  <Button onClick={() => onNavigate('dashboard')} variant="outline" className="w-full">
                    <Home className="h-4 w-4 mr-2" />
                    Ir para Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" onClick={backToGames}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedGame.title}</CardTitle>
                <Badge className={getDifficultyColor(selectedGame.difficulty)}>
                  {selectedGame.difficulty}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Pergunta {currentQuestion + 1} de {selectedGame.questions.length}</span>
                  <span>Pontuação: {score}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <Button
                      key={index}
                      variant={selectedAnswer === index ? "default" : "outline"}
                      className="w-full text-left justify-start h-auto p-4"
                      onClick={() => selectAnswer(index)}
                    >
                      <span className="mr-3 font-bold">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={nextQuestion} 
                disabled={selectedAnswer === null || loading}
                className="w-full"
              >
                {loading ? (
                  'Salvando...'
                ) : currentQuestion < selectedGame.questions.length - 1 ? (
                  'Próxima Pergunta'
                ) : (
                  'Finalizar Jogo'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={() => onNavigate('dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 ml-4">Jogos Educativos</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Escolha um Jogo
          </h2>
          <p className="text-gray-600">
            Teste seus conhecimentos com nossos quizzes interativos
          </p>
        </div>

        {user && (
          <Alert className="mb-8">
            <Trophy className="h-4 w-4" />
            <AlertDescription>
              Você tem {userProgress?.totalScore || 0} pontos totais e completou {userProgress?.completedGames?.length || 0} jogos.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Card key={game.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="text-2xl">{game.icon}</div>
                  {isGameCompleted(game.id) && (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  )}
                </div>
                <CardTitle className="text-lg">{game.title}</CardTitle>
                <CardDescription>{game.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getDifficultyColor(game.difficulty)}>
                      {game.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {game.questions.length} perguntas
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Categoria</div>
                    <div className="font-medium">{game.category}</div>
                  </div>

                  <Button 
                    onClick={() => startGame(game)} 
                    className="w-full"
                    style={{ backgroundColor: game.color }}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isGameCompleted(game.id) ? 'Jogar Novamente' : 'Começar Jogo'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Como Jogar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-lg w-fit mx-auto mb-3">
                  <Play className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Escolha um Jogo</h3>
                <p className="text-sm text-gray-600">
                  Selecione o jogo que deseja jogar baseado na categoria e dificuldade
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-lg w-fit mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">2. Responda as Perguntas</h3>
                <p className="text-sm text-gray-600">
                  Leia cada pergunta com atenção e escolha a resposta correta
                </p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 p-3 rounded-lg w-fit mx-auto mb-3">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold mb-2">3. Ganhe Pontos</h3>
                <p className="text-sm text-gray-600">
                  Cada resposta correta vale 10 pontos. Seu progresso é salvo automaticamente
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GamesPage;

