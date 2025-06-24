import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveUserProgress, getUserProgress } from '../lib/firebase';

const TechModulesPage = () => {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState({});
  const [selectedModule, setSelectedModule] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  // Módulos de tecnologia com conteúdo educativo
  const techModules = [
    {
      id: 'logic-programming',
      title: 'Lógica de Programação',
      description: 'Fundamentos essenciais para qualquer desenvolvedor',
      icon: '🧠',
      color: 'bg-purple-500',
      difficulty: 'Iniciante',
      estimatedTime: '30 min',
      topics: [
        'Variáveis e tipos de dados',
        'Estruturas condicionais',
        'Estruturas de repetição',
        'Funções e algoritmos'
      ],
      quiz: [
        {
          question: 'O que é uma variável em programação?',
          options: [
            'Um valor que nunca muda',
            'Um espaço na memória para armazenar dados',
            'Uma função matemática',
            'Um tipo de loop'
          ],
          correct: 1,
          explanation: 'Uma variável é um espaço reservado na memória do computador para armazenar dados que podem ser modificados durante a execução do programa.'
        },
        {
          question: 'Qual estrutura é usada para tomar decisões no código?',
          options: [
            'for',
            'while',
            'if/else',
            'function'
          ],
          correct: 2,
          explanation: 'A estrutura if/else permite que o programa tome decisões baseadas em condições, executando diferentes blocos de código dependendo do resultado.'
        },
        {
          question: 'O que é um algoritmo?',
          options: [
            'Uma linguagem de programação',
            'Um conjunto de instruções para resolver um problema',
            'Um tipo de variável',
            'Um erro no código'
          ],
          correct: 1,
          explanation: 'Um algoritmo é uma sequência lógica e finita de instruções que descrevem como resolver um problema ou executar uma tarefa.'
        },
        {
          question: 'Qual é a principal vantagem de usar funções?',
          options: [
            'Tornar o código mais lento',
            'Reutilizar código e organizar melhor o programa',
            'Usar mais memória',
            'Complicar o desenvolvimento'
          ],
          correct: 1,
          explanation: 'Funções permitem reutilizar código, organizar melhor o programa em módulos e facilitar a manutenção e depuração.'
        },
        {
          question: 'O que é um loop infinito?',
          options: [
            'Um loop que executa exatamente 10 vezes',
            'Um loop que nunca para de executar',
            'Um loop que executa apenas uma vez',
            'Um tipo especial de função'
          ],
          correct: 1,
          explanation: 'Um loop infinito é uma estrutura de repetição que nunca atende à condição de parada, executando indefinidamente e podendo travar o programa.'
        }
      ]
    },
    {
      id: 'python-fundamentals',
      title: 'Python Fundamentals',
      description: 'Introdução à linguagem Python',
      icon: '🐍',
      color: 'bg-green-500',
      difficulty: 'Iniciante',
      estimatedTime: '45 min',
      topics: [
        'Sintaxe básica do Python',
        'Tipos de dados e estruturas',
        'Funções e módulos',
        'Programação orientada a objetos'
      ],
      quiz: [
        {
          question: 'Como você declara uma lista em Python?',
          options: [
            'lista = (1, 2, 3)',
            'lista = [1, 2, 3]',
            'lista = {1, 2, 3}',
            'lista = 1, 2, 3'
          ],
          correct: 1,
          explanation: 'Em Python, listas são declaradas usando colchetes [] e podem conter elementos de diferentes tipos.'
        },
        {
          question: 'Qual é a diferença entre uma lista e uma tupla?',
          options: [
            'Não há diferença',
            'Listas são mutáveis, tuplas são imutáveis',
            'Tuplas são mais rápidas que listas',
            'Listas usam (), tuplas usam []'
          ],
          correct: 1,
          explanation: 'A principal diferença é que listas são mutáveis (podem ser modificadas) enquanto tuplas são imutáveis (não podem ser alteradas após criação).'
        },
        {
          question: 'Como você define uma função em Python?',
          options: [
            'function nome():',
            'def nome():',
            'func nome():',
            'define nome():'
          ],
          correct: 1,
          explanation: 'Em Python, funções são definidas usando a palavra-chave "def" seguida do nome da função e parênteses.'
        },
        {
          question: 'O que é indentação em Python?',
          options: [
            'Um tipo de comentário',
            'Uma forma de organizar o código em blocos',
            'Um erro de sintaxe',
            'Uma função especial'
          ],
          correct: 1,
          explanation: 'Indentação em Python é usada para definir blocos de código, substituindo as chaves {} de outras linguagens.'
        },
        {
          question: 'Qual método é usado para adicionar um elemento ao final de uma lista?',
          options: [
            'add()',
            'append()',
            'insert()',
            'push()'
          ],
          correct: 1,
          explanation: 'O método append() é usado para adicionar um elemento ao final de uma lista em Python.'
        }
      ]
    },
    {
      id: 'web-frontend',
      title: 'Desenvolvimento Front-end',
      description: 'HTML, CSS e JavaScript para web',
      icon: '🌐',
      color: 'bg-blue-500',
      difficulty: 'Intermediário',
      estimatedTime: '60 min',
      topics: [
        'HTML5 semântico',
        'CSS3 e responsividade',
        'JavaScript ES6+',
        'Manipulação do DOM'
      ],
      quiz: [
        {
          question: 'Qual tag HTML5 é usada para definir uma seção de navegação?',
          options: [
            '<navigation>',
            '<nav>',
            '<menu>',
            '<section>'
          ],
          correct: 1,
          explanation: 'A tag <nav> é um elemento semântico do HTML5 usado para definir seções de navegação na página.'
        },
        {
          question: 'Como você torna um layout responsivo com CSS?',
          options: [
            'Usando apenas pixels',
            'Usando Media Queries',
            'Usando apenas tabelas',
            'Não é possível'
          ],
          correct: 1,
          explanation: 'Media Queries permitem aplicar estilos CSS diferentes baseados nas características do dispositivo, como largura da tela.'
        },
        {
          question: 'O que é o DOM em JavaScript?',
          options: [
            'Uma linguagem de programação',
            'Document Object Model - representação da página',
            'Um tipo de variável',
            'Um framework'
          ],
          correct: 1,
          explanation: 'DOM (Document Object Model) é uma representação estruturada da página HTML que permite ao JavaScript manipular elementos dinamicamente.'
        },
        {
          question: 'Qual é a diferença entre let, const e var?',
          options: [
            'Não há diferença',
            'let e const têm escopo de bloco, var tem escopo de função',
            'var é mais moderno',
            'const é apenas para números'
          ],
          correct: 1,
          explanation: 'let e const foram introduzidos no ES6 com escopo de bloco, enquanto var tem escopo de função. const não pode ser reatribuído.'
        },
        {
          question: 'Como você seleciona um elemento por ID em JavaScript?',
          options: [
            'document.getElement("id")',
            'document.getElementById("id")',
            'document.selectId("id")',
            'document.findId("id")'
          ],
          correct: 1,
          explanation: 'document.getElementById() é o método padrão para selecionar um elemento HTML pelo seu atributo ID.'
        }
      ]
    },
    {
      id: 'backend-nodejs',
      title: 'Backend com Node.js',
      description: 'Desenvolvimento de APIs e servidores',
      icon: '⚙️',
      color: 'bg-yellow-500',
      difficulty: 'Intermediário',
      estimatedTime: '50 min',
      topics: [
        'Node.js e npm',
        'Express.js framework',
        'APIs RESTful',
        'Autenticação JWT'
      ],
      quiz: [
        {
          question: 'O que é Node.js?',
          options: [
            'Uma linguagem de programação',
            'Um runtime JavaScript para servidor',
            'Um banco de dados',
            'Um framework CSS'
          ],
          correct: 1,
          explanation: 'Node.js é um runtime que permite executar JavaScript no lado do servidor, fora do navegador.'
        },
        {
          question: 'O que significa REST em APIs?',
          options: [
            'Really Easy Server Technology',
            'Representational State Transfer',
            'Remote Execution Service Tool',
            'Rapid Enterprise Solution Technology'
          ],
          correct: 1,
          explanation: 'REST (Representational State Transfer) é um estilo arquitetural para desenvolvimento de APIs web baseado em princípios como stateless e uso de métodos HTTP.'
        },
        {
          question: 'Qual método HTTP é usado para criar um novo recurso?',
          options: [
            'GET',
            'POST',
            'PUT',
            'DELETE'
          ],
          correct: 1,
          explanation: 'POST é o método HTTP padrão usado para criar novos recursos no servidor.'
        },
        {
          question: 'O que é JWT?',
          options: [
            'JavaScript Web Technology',
            'JSON Web Token',
            'Java Web Toolkit',
            'Just Web Things'
          ],
          correct: 1,
          explanation: 'JWT (JSON Web Token) é um padrão para transmitir informações de forma segura entre partes como um objeto JSON compacto.'
        },
        {
          question: 'Qual é a porta padrão para servidores HTTP?',
          options: [
            '21',
            '80',
            '443',
            '8080'
          ],
          correct: 1,
          explanation: 'A porta 80 é a porta padrão para tráfego HTTP, enquanto 443 é para HTTPS.'
        }
      ]
    },
    {
      id: 'databases',
      title: 'Banco de Dados',
      description: 'SQL e NoSQL fundamentals',
      icon: '🗄️',
      color: 'bg-indigo-500',
      difficulty: 'Intermediário',
      estimatedTime: '40 min',
      topics: [
        'Modelagem de dados',
        'SQL básico e avançado',
        'Bancos NoSQL',
        'Índices e performance'
      ],
      quiz: [
        {
          question: 'O que significa SQL?',
          options: [
            'Simple Query Language',
            'Structured Query Language',
            'Standard Query Language',
            'System Query Language'
          ],
          correct: 1,
          explanation: 'SQL (Structured Query Language) é a linguagem padrão para gerenciar e manipular bancos de dados relacionais.'
        },
        {
          question: 'Qual comando SQL é usado para recuperar dados?',
          options: [
            'GET',
            'SELECT',
            'FETCH',
            'RETRIEVE'
          ],
          correct: 1,
          explanation: 'SELECT é o comando SQL usado para consultar e recuperar dados de uma ou mais tabelas.'
        },
        {
          question: 'O que é uma chave primária?',
          options: [
            'A primeira coluna da tabela',
            'Um identificador único para cada registro',
            'A coluna mais importante',
            'Uma senha para acessar a tabela'
          ],
          correct: 1,
          explanation: 'Uma chave primária é um campo (ou combinação de campos) que identifica unicamente cada registro em uma tabela.'
        },
        {
          question: 'Qual é a principal diferença entre SQL e NoSQL?',
          options: [
            'NoSQL é mais rápido',
            'SQL usa estrutura fixa, NoSQL é mais flexível',
            'NoSQL não armazena dados',
            'SQL é apenas para web'
          ],
          correct: 1,
          explanation: 'Bancos SQL usam esquemas fixos e relacionamentos, enquanto NoSQL oferece maior flexibilidade na estrutura dos dados.'
        },
        {
          question: 'O que é um índice em banco de dados?',
          options: [
            'Uma lista de todas as tabelas',
            'Uma estrutura que acelera consultas',
            'Um tipo de backup',
            'Uma forma de criptografia'
          ],
          correct: 1,
          explanation: 'Um índice é uma estrutura de dados que melhora a velocidade das operações de consulta em uma tabela.'
        }
      ]
    },
    {
      id: 'cloud-devops',
      title: 'Cloud e DevOps',
      description: 'Computação em nuvem e práticas DevOps',
      icon: '☁️',
      color: 'bg-cyan-500',
      difficulty: 'Avançado',
      estimatedTime: '55 min',
      topics: [
        'Serviços de nuvem (AWS, GCP, Azure)',
        'Contêineres e Docker',
        'CI/CD pipelines',
        'Monitoramento e logging'
      ],
      quiz: [
        {
          question: 'O que significa IaaS?',
          options: [
            'Internet as a Service',
            'Infrastructure as a Service',
            'Integration as a Service',
            'Information as a Service'
          ],
          correct: 1,
          explanation: 'IaaS (Infrastructure as a Service) fornece recursos de computação virtualizados pela internet, como servidores e armazenamento.'
        },
        {
          question: 'O que é Docker?',
          options: [
            'Uma linguagem de programação',
            'Uma plataforma de containerização',
            'Um banco de dados',
            'Um sistema operacional'
          ],
          correct: 1,
          explanation: 'Docker é uma plataforma que permite empacotar aplicações e suas dependências em contêineres leves e portáteis.'
        },
        {
          question: 'O que significa CI/CD?',
          options: [
            'Code Integration/Code Deployment',
            'Continuous Integration/Continuous Deployment',
            'Computer Intelligence/Computer Development',
            'Cloud Infrastructure/Cloud Development'
          ],
          correct: 1,
          explanation: 'CI/CD refere-se a Continuous Integration (Integração Contínua) e Continuous Deployment (Implantação Contínua), práticas para automatizar desenvolvimento e deploy.'
        },
        {
          question: 'Qual é a principal vantagem da computação em nuvem?',
          options: [
            'É sempre mais barata',
            'Escalabilidade e flexibilidade',
            'Não precisa de internet',
            'É mais segura que servidores locais'
          ],
          correct: 1,
          explanation: 'A principal vantagem é a escalabilidade e flexibilidade, permitindo ajustar recursos conforme a demanda.'
        },
        {
          question: 'O que é um microserviço?',
          options: [
            'Um serviço muito pequeno',
            'Uma arquitetura onde aplicações são divididas em serviços independentes',
            'Um tipo de banco de dados',
            'Uma linguagem de programação'
          ],
          correct: 1,
          explanation: 'Microserviços é uma arquitetura onde aplicações são decompostas em serviços pequenos, independentes e especializados.'
        }
      ]
    }
  ];

  useEffect(() => {
    if (user) {
      loadUserProgress();
    }
  }, [user]);

  const loadUserProgress = async () => {
    try {
      const progress = await getUserProgress(user.uid);
      setUserProgress(progress || {});
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    }
  };

  const startQuiz = (module) => {
    setSelectedModule(module);
    setCurrentQuiz(module.quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setScore(0);
    setShowResult(false);
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = async () => {
    if (selectedAnswer === '') return;

    const isCorrect = selectedAnswer === currentQuiz[currentQuestionIndex].correct;
    if (isCorrect) {
      setScore(score + 10);
    }

    if (currentQuestionIndex < currentQuiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
    } else {
      // Quiz finalizado
      const finalScore = score + (isCorrect ? 10 : 0);
      setScore(finalScore);
      setShowResult(true);
      
      // Salvar progresso
      await saveProgress(selectedModule.id, finalScore);
    }
  };

  const saveProgress = async (moduleId, finalScore) => {
    try {
      setLoading(true);
      const progressData = {
        [`techModules.${moduleId}`]: {
          completed: true,
          score: finalScore,
          completedAt: new Date().toISOString(),
          totalQuestions: currentQuiz.length
        }
      };
      
      await saveUserProgress(user.uid, progressData);
      await loadUserProgress();
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setSelectedModule(null);
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setScore(0);
    setShowResult(false);
  };

  const getModuleProgress = (moduleId) => {
    return userProgress.techModules?.[moduleId] || null;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Iniciante': return 'text-green-600 bg-green-100';
      case 'Intermediário': return 'text-yellow-600 bg-yellow-100';
      case 'Avançado': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (currentQuiz && !showResult) {
    const currentQuestion = currentQuiz[currentQuestionIndex];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header do Quiz */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{selectedModule.icon}</span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{selectedModule.title}</h1>
                  <p className="text-gray-600">Questão {currentQuestionIndex + 1} de {currentQuiz.length}</p>
                </div>
              </div>
              <button
                onClick={resetQuiz}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ✕ Sair
              </button>
            </div>
            
            {/* Barra de Progresso */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / currentQuiz.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Questão */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {currentQuestion.question}
            </h2>
            
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedAnswer === index
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium mr-3">{String.fromCharCode(65 + index)})</span>
                  {option}
                </button>
              ))}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Pontuação atual: {score} pontos
              </div>
              <button
                onClick={handleNextQuestion}
                disabled={selectedAnswer === ''}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedAnswer !== ''
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {currentQuestionIndex < currentQuiz.length - 1 ? 'Próxima' : 'Finalizar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    const percentage = (score / (currentQuiz.length * 10)) * 100;
    const passed = percentage >= 70;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <span className="text-6xl">{passed ? '🎉' : '📚'}</span>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {passed ? 'Parabéns!' : 'Continue Estudando!'}
            </h2>
            
            <div className="mb-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">{score} pontos</div>
              <div className="text-lg text-gray-600">
                {percentage.toFixed(0)}% de aproveitamento
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {score / 10} de {currentQuiz.length} questões corretas
              </div>
            </div>
            
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-6 ${
              passed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {passed ? 'Módulo Concluído!' : 'Tente Novamente'}
            </div>
            
            <div className="space-y-3">
              <button
                onClick={resetQuiz}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Voltar aos Módulos
              </button>
              <button
                onClick={() => {
                  setShowResult(false);
                  setCurrentQuestionIndex(0);
                  setSelectedAnswer('');
                  setScore(0);
                }}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Refazer Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Módulos de Tecnologia 💻
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Aprenda desenvolvimento de sistemas, programação e tecnologias modernas através de módulos interativos e quizzes práticos.
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {Object.keys(userProgress.techModules || {}).length}
            </div>
            <div className="text-gray-600">Módulos Completados</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {Object.values(userProgress.techModules || {}).reduce((total, module) => total + (module.score || 0), 0)}
            </div>
            <div className="text-gray-600">Pontos Totais</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {techModules.length}
            </div>
            <div className="text-gray-600">Módulos Disponíveis</div>
          </div>
        </div>

        {/* Grid de Módulos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techModules.map((module) => {
            const progress = getModuleProgress(module.id);
            const isCompleted = progress?.completed || false;
            
            return (
              <div key={module.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Header do Card */}
                <div className={`${module.color} p-4 text-white relative`}>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{module.icon}</span>
                    {isCompleted && (
                      <div className="bg-white bg-opacity-20 rounded-full p-1">
                        <span className="text-sm">✓</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mt-2">{module.title}</h3>
                </div>
                
                {/* Conteúdo do Card */}
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{module.description}</p>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                      {module.difficulty}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
                      ⏱️ {module.estimatedTime}
                    </span>
                  </div>
                  
                  {/* Tópicos */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Você vai aprender:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {module.topics.slice(0, 3).map((topic, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                          {topic}
                        </li>
                      ))}
                      {module.topics.length > 3 && (
                        <li className="text-blue-600 text-xs">+{module.topics.length - 3} tópicos</li>
                      )}
                    </ul>
                  </div>
                  
                  {/* Progresso */}
                  {isCompleted && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-700 font-medium">Concluído!</span>
                        <span className="text-green-600">{progress.score} pontos</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Botão */}
                  <button
                    onClick={() => startQuiz(module)}
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                      isCompleted
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Carregando...' : isCompleted ? 'Refazer Quiz' : 'Iniciar Quiz'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Rodapé */}
        <div className="text-center mt-12 p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Continue Aprendendo!</h3>
          <p className="text-gray-600">
            Complete todos os módulos para se tornar um desenvolvedor completo. 
            Cada quiz concluído com 70% ou mais adiciona pontos ao seu perfil.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TechModulesPage;

