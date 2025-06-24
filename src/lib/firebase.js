// Firebase configuration and services for IAPrender Web
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
  runTransaction,
  deleteDoc
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQkOC91etsD-CmPhb8Tmo349odykZ-79k",
  authDomain: "iaprenderapp.firebaseapp.com",
  projectId: "iaprenderapp",
  storageBucket: "iaprenderapp.firebasestorage.app",
  messagingSenderId: "808330818308",
  appId: "1:808330818308:web:a7365b0f60a699206e1651"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

class FirebaseWebService {
  // Authentication methods
  async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async signUpWithEmail(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });

      // Create user document in Firestore
      console.log("Attempting to create user document for:", userCredential.user.uid, displayName);
      await this.createUserDocument(userCredential.user, displayName);
      
      return userCredential;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  }

  getCurrentUser() {
    return auth.currentUser;
  }

  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }

  // User management
  async createUserDocument(user, displayName) {
    const userDoc = {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      role: 'student', // Default role
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', user.uid), userDoc);
  }

  // Progress management
  async saveUserProgress(gameId, score, completed) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const userRef = doc(db, 'users', user.uid);
    
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const userData = userDoc.data();
      
      if (userData) {
        const progress = userData.progress || {};
        const completedGames = progress.completedGames || [];
        const totalScore = progress.totalScore || 0;

        // Update completed games
        if (completed && !completedGames.includes(gameId)) {
          completedGames.push(gameId);
        }

        // Update total score
        const newTotalScore = totalScore + score;

        transaction.update(userRef, {
          'progress.completedGames': completedGames,
          'progress.totalScore': newTotalScore,
          'progress.lastPlayed': serverTimestamp()
        });
      }
    });
  }

  async getUserProgress() {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    return userDoc.data()?.progress || {};
  }

  // Chat functionality
  async sendMessageToAssistant(message) {
    try {
      const user = this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Save user message
      const chatRef = collection(db, 'chats', user.uid, 'messages');
      await addDoc(chatRef, {
        text: message,
        sender: 'user',
        timestamp: serverTimestamp(),
        userId: user.uid
      });

      // Generate assistant response
      const assistantResponse = await this.generateAssistantResponse(message);

      // Save assistant response
      await addDoc(chatRef, {
        text: assistantResponse,
        sender: 'assistant',
        timestamp: serverTimestamp(),
        userId: user.uid
      });

      return assistantResponse;
    } catch (error) {
      throw error;
    }
  }

  async getChatHistory() {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const messagesRef = collection(db, 'chats', user.uid, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async generateAssistantResponse(userMessage) {
    try {
      // Use Groq API for intelligent responses
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: `Você é um assistente educacional especializado em ajudar estudantes brasileiros. 
              Responda sempre em português brasileiro de forma clara, educativa e encorajadora. 
              Foque em temas educacionais como matemática, português, ciências e tecnologia.
              Seja empático, motivador e use uma linguagem acessível para estudantes.
              Mantenha as respostas concisas mas informativas (máximo 200 palavras).
              Se o estudante demonstrar dificuldades emocionais, seja acolhedor e sugira buscar ajuda profissional quando necessário.`
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage = data.choices?.[0]?.message?.content;
        
        if (assistantMessage) {
          return assistantMessage.trim();
        } else {
          return this.getFallbackResponse(userMessage);
        }
      } else {
        console.error('Erro na API Groq:', response.status, response.statusText);
        return this.getFallbackResponse(userMessage);
      }
    } catch (error) {
      console.error('Erro ao conectar com API Groq:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  getFallbackResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    if (message.includes('ajuda') || message.includes('help')) {
      return 'Olá! Sou seu assistente de aprendizado. Posso te ajudar com dúvidas sobre os jogos, explicar conceitos ou dar dicas para melhorar seu desempenho. O que você gostaria de saber?';
    }
    
    if (message.includes('jogo') || message.includes('game')) {
      return 'Temos vários jogos educativos disponíveis! Cada um foi desenvolvido para ensinar conceitos específicos de forma divertida. Qual jogo você está jogando ou gostaria de experimentar?';
    }
    
    if (message.includes('progresso') || message.includes('progress')) {
      return 'Seu progresso está sendo salvo automaticamente! Você pode ver suas conquistas, pontuação total e jogos completados na tela de perfil. Continue assim!';
    }
    
    if (message.includes('dificuldade') || message.includes('difícil')) {
      return 'Entendo que alguns jogos podem ser desafiadores. Lembre-se: o aprendizado acontece quando saímos da zona de conforto. Tente quebrar o problema em partes menores e não hesite em tentar novamente!';
    }

    if (message.includes('matemática') || message.includes('math')) {
      return 'A matemática é fundamental! Nossos jogos de matemática cobrem operações básicas, porcentagens e raciocínio lógico. Pratique regularmente e você verá uma melhora significativa!';
    }

    if (message.includes('português') || message.includes('grammar')) {
      return 'O português é uma língua rica e complexa. Nossos jogos focam em gramática, vocabulário e interpretação. A leitura regular também ajuda muito no aprendizado!';
    }

    if (message.includes('pontuação') || message.includes('score')) {
      return 'Para melhorar sua pontuação, foque na precisão primeiro, depois na velocidade. Cada resposta correta vale 10 pontos, e jogos perfeitos dão bônus extra!';
    }

    if (message.includes('tecnologia') || message.includes('programação') || message.includes('código')) {
      return 'A tecnologia está em constante evolução! Nossos módulos de tecnologia cobrem desde lógica de programação até desenvolvimento web e DevOps. Comece pelos fundamentos e vá progredindo gradualmente!';
    }

    if (message.includes('python')) {
      return 'Python é uma excelente linguagem para iniciantes! É fácil de aprender, tem sintaxe clara e é muito versátil. Nosso módulo de Python Fundamentals te ensina desde variáveis até estruturas de dados. Quer começar?';
    }

    if (message.includes('javascript') || message.includes('js')) {
      return 'JavaScript é a linguagem da web! Com ela você pode criar sites interativos, aplicações web e até mesmo aplicativos móveis. Nosso módulo de Frontend Development te ensina JavaScript moderno!';
    }

    if (message.includes('banco de dados') || message.includes('sql')) {
      return 'Bancos de dados são essenciais para armazenar e organizar informações! SQL é a linguagem padrão para trabalhar com dados. Nosso módulo te ensina desde consultas básicas até otimização de performance!';
    }

    if (message.includes('cloud') || message.includes('nuvem')) {
      return 'A computação em nuvem revolucionou a tecnologia! Nosso módulo de Cloud e DevOps te ensina sobre AWS, Docker, CI/CD e muito mais. É o futuro da infraestrutura!';
    }
    
    return 'Interessante! Conte-me mais sobre isso. Estou aqui para te ajudar no seu processo de aprendizado. Há algo específico que você gostaria de saber ou discutir?';
  }

  // Emotional support functions
  async saveEmotionalSupportSession(sessionData) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      await addDoc(collection(db, 'emotionalSupport'), {
        userId: user.uid,
        ...sessionData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao salvar sessão de suporte emocional:', error);
    }
  }

  generateEmotionalResponse(mood, situation) {
    const responses = {
      ansioso: {
        message: "Entendo que você está se sentindo ansioso. A ansiedade é uma resposta natural do nosso corpo, mas podemos trabalhar juntos para gerenciá-la.",
        techniques: [
          "Respiração profunda: Inspire por 4 segundos, segure por 4, expire por 6",
          "Técnica 5-4-3-2-1: Identifique 5 coisas que vê, 4 que toca, 3 que ouve, 2 que cheira, 1 que saboreia",
          "Mindfulness: Foque no momento presente, sem julgamentos"
        ],
        resources: [
          "Centro de Valorização da Vida (CVV): 188",
          "CAPS (Centro de Atenção Psicossocial) da sua região",
          "Aplicativo Sanvello para exercícios de ansiedade"
        ]
      },
      triste: {
        message: "Sinto muito que você esteja passando por um momento difícil. A tristeza é uma emoção válida e importante. Vamos encontrar maneiras de cuidar de você.",
        techniques: [
          "Permita-se sentir: Não reprima suas emoções, elas são válidas",
          "Atividade física leve: Uma caminhada pode ajudar a liberar endorfinas",
          "Conexão social: Converse com alguém de confiança",
          "Autocuidado: Faça algo que normalmente te traz prazer"
        ],
        resources: [
          "Centro de Valorização da Vida (CVV): 188",
          "Psicólogos online: Zenklub, Vittude",
          "Grupos de apoio locais"
        ]
      },
      estressado: {
        message: "O estresse pode ser muito desafiador. Vamos trabalhar em estratégias para reduzir essa sobrecarga e encontrar um equilíbrio.",
        techniques: [
          "Organização: Faça uma lista de prioridades",
          "Pausas regulares: Descanse a cada 25-30 minutos de atividade",
          "Exercícios de relaxamento muscular progressivo",
          "Estabeleça limites saudáveis"
        ],
        resources: [
          "Aplicativo Headspace para meditação",
          "Técnicas de gestão de tempo (Pomodoro)",
          "Suporte psicológico online"
        ]
      },
      confuso: {
        message: "É normal se sentir confuso às vezes. Vamos organizar seus pensamentos e encontrar clareza juntos.",
        techniques: [
          "Escreva seus pensamentos: Coloque no papel o que está sentindo",
          "Converse com alguém de confiança",
          "Divida problemas grandes em partes menores",
          "Pratique a autocompaixão"
        ],
        resources: [
          "Orientação vocacional online",
          "Psicólogos especializados em orientação",
          "Grupos de apoio para jovens"
        ]
      },
      raiva: {
        message: "A raiva é uma emoção natural, mas é importante expressá-la de forma saudável. Vamos trabalhar em estratégias para gerenciar esses sentimentos.",
        techniques: [
          "Conte até 10 antes de reagir",
          "Exercício físico para liberar a tensão",
          "Identifique o que realmente está causando a raiva",
          "Pratique comunicação assertiva"
        ],
        resources: [
          "Técnicas de comunicação não-violenta",
          "Terapia cognitivo-comportamental",
          "Grupos de controle da raiva"
        ]
      }
    };

    const response = responses[mood] || responses.confuso;
    
    // Adicionar recursos de emergência se necessário
    if (situation && (situation.includes('suicídio') || situation.includes('morte') || situation.includes('machucar'))) {
      return this.getEmergencyResponse();
    }

    return response;
  }

  getEmergencyResponse() {
    return {
      message: "Percebo que você pode estar passando por um momento muito difícil. Sua vida é valiosa e existem pessoas treinadas para te ajudar agora mesmo.",
      isEmergency: true,
      contacts: [
        {
          name: "Centro de Valorização da Vida (CVV)",
          phone: "188",
          description: "Prevenção do suicídio - 24h gratuito"
        },
        {
          name: "CAPS (Centro de Atenção Psicossocial)",
          phone: "Procure o mais próximo",
          description: "Atendimento psicológico gratuito"
        },
        {
          name: "SAMU",
          phone: "192",
          description: "Emergências médicas"
        },
        {
          name: "Polícia Militar",
          phone: "190",
          description: "Emergências gerais"
        }
      ],
      message: "Sua vida tem valor. Existem pessoas treinadas para te ajudar neste momento difícil. Por favor, entre em contato com um dos serviços acima ou vá ao hospital mais próximo."
    };
  }

  // Error handling
  handleAuthError(error) {
    const errorMessages = {
      'auth/user-not-found': 'Usuário não encontrado. Verifique o email.',
      'auth/wrong-password': 'Senha incorreta.',
      'auth/email-already-in-use': 'Este email já está em uso.',
      'auth/weak-password': 'A senha é muito fraca.',
      'auth/invalid-email': 'Email inválido.',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    };

    return new Error(errorMessages[error.code] || 'Erro de autenticação. Tente novamente.');
  }

  // Game data (simplified for web)
  getAvailableGames() {
    return [
      {
        id: 'quiz_matematica',
        title: 'Quiz de Matemática',
        description: 'Teste seus conhecimentos em matemática básica',
        category: 'Matemática',
        difficulty: 'Fácil',
        icon: '🧮',
        color: '#10B981',
        questions: [
          {
            question: "Quanto é 15 + 27?",
            options: ["40", "42", "45", "48"],
            correct: 1
          },
          {
            question: "Qual é o resultado de 8 × 7?",
            options: ["54", "56", "58", "60"],
            correct: 1
          },
          {
            question: "Quanto é 144 ÷ 12?",
            options: ["10", "11", "12", "13"],
            correct: 2
          }
        ]
      },
      {
        id: 'quiz_portugues',
        title: 'Quiz de Português',
        description: 'Desafie-se com questões de gramática e interpretação',
        category: 'Português',
        difficulty: 'Médio',
        icon: '📚',
        color: '#3B82F6',
        questions: [
          {
            question: "Qual é o plural de 'cidadão'?",
            options: ["cidadãos", "cidadões", "cidadães", "cidadans"],
            correct: 0
          },
          {
            question: "Qual palavra está corretamente acentuada?",
            options: ["médico", "medico", "médíco", "medicô"],
            correct: 0
          },
          {
            question: "Qual é o sinônimo de 'feliz'?",
            options: ["triste", "alegre", "bravo", "cansado"],
            correct: 1
          }
        ]
      },
      {
        id: 'quiz_ciencias',
        title: 'Quiz de Ciências',
        description: 'Explore o mundo da ciência com perguntas divertidas',
        category: 'Ciências',
        difficulty: 'Médio',
        icon: '🔬',
        color: '#EF4444',
        questions: [
          {
            question: "Qual é o planeta mais próximo do Sol?",
            options: ["Vênus", "Terra", "Mercúrio", "Marte"],
            correct: 2
          },
          {
            question: "Quantos ossos tem o corpo humano adulto?",
            options: ["206", "208", "210", "212"],
            correct: 0
          },
          {
            question: "Qual é a fórmula química da água?",
            options: ["H2O", "CO2", "O2", "H2SO4"],
            correct: 0
          }
        ]
      }
    ];
  }
}

export default new FirebaseWebService();

// Teacher area functions
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const updateUserRole = async (uid, role) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      role: role,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
};

export const getAllStudents = async () => {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    const students = [];
    
    for (const doc of querySnapshot.docs) {
      const userData = doc.data();
      // Get progress data for each student
      const progressData = await getUserProgress(userData.uid);
      students.push({
        ...userData,
        progress: progressData
      });
    }
    
    return students;
  } catch (error) {
    throw error;
  }
};

export const getStudentProgress = async (studentUid) => {
  try {
    const studentData = await getUserData(studentUid);
    const progressData = await getUserProgress(studentUid);
    
    return {
      student: studentData,
      progress: progressData
    };
  } catch (error) {
    throw error;
  }
};

// Task management functions
export const createTask = async (teacherUid, taskData) => {
  try {
    const taskRef = await addDoc(collection(db, 'tasks'), {
      ...taskData,
      teacherUid: teacherUid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return taskRef.id;
  } catch (error) {
    throw error;
  }
};

export const getTasksByTeacher = async (teacherUid) => {
  try {
    const tasksRef = collection(db, 'tasks');
    const querySnapshot = await getDocs(tasksRef);
    const tasks = [];
    
    querySnapshot.forEach((doc) => {
      const taskData = doc.data();
      if (taskData.teacherUid === teacherUid) {
        tasks.push({
          id: doc.id,
          ...taskData
        });
      }
    });
    
    return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    throw error;
  }
};

export const getTasksForStudent = async (studentUid) => {
  try {
    const tasksRef = collection(db, 'tasks');
    const querySnapshot = await getDocs(tasksRef);
    const tasks = [];
    
    querySnapshot.forEach((doc) => {
      const taskData = doc.data();
      if (taskData.assignedTo && taskData.assignedTo.includes(studentUid)) {
        tasks.push({
          id: doc.id,
          ...taskData
        });
      }
    });
    
    return tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  } catch (error) {
    throw error;
  }
};

export const updateTask = async (taskId, updateData) => {
  try {
    await updateDoc(doc(db, 'tasks', taskId), {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
  } catch (error) {
    throw error;
  }
};

// Task submission functions
export const submitTask = async (taskId, studentUid, submissionData) => {
  try {
    const submissionRef = await addDoc(collection(db, 'taskSubmissions'), {
      taskId: taskId,
      studentUid: studentUid,
      ...submissionData,
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    });
    
    return submissionRef.id;
  } catch (error) {
    throw error;
  }
};

export const getTaskSubmissions = async (taskId) => {
  try {
    const submissionsRef = collection(db, 'taskSubmissions');
    const querySnapshot = await getDocs(submissionsRef);
    const submissions = [];
    
    for (const doc of querySnapshot.docs) {
      const submissionData = doc.data();
      if (submissionData.taskId === taskId) {
        // Get student data
        const studentData = await getUserData(submissionData.studentUid);
        submissions.push({
          id: doc.id,
          ...submissionData,
          student: studentData
        });
      }
    }
    
    return submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  } catch (error) {
    throw error;
  }
};

export const gradeSubmission = async (submissionId, grade, feedback) => {
  try {
    await updateDoc(doc(db, 'taskSubmissions', submissionId), {
      grade: grade,
      feedback: feedback,
      status: 'graded',
      gradedAt: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
};

// Progress tracking functions for tech modules
export const saveUserProgress = async (uid, progressData) => {
  try {
    const userProgressRef = doc(db, 'userProgress', uid);
    await updateDoc(userProgressRef, {
      ...progressData,
      lastUpdated: new Date().toISOString()
    }).catch(async () => {
      // If document doesn't exist, create it
      await setDoc(userProgressRef, {
        ...progressData,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
    });
  } catch (error) {
    throw error;
  }
};

export const getUserProgress = async (uid) => {
  try {
    const progressDoc = await getDoc(doc(db, 'userProgress', uid));
    if (progressDoc.exists()) {
      return progressDoc.data();
    }
    return null;
  } catch (error) {
    throw error;
  }
};

// Chat functions
export const saveMessage = async (uid, message, isUser = true) => {
  try {
    await addDoc(collection(db, 'chatMessages'), {
      uid: uid,
      message: message,
      isUser: isUser,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
};

export const getChatHistory = async (uid) => {
  try {
    const messagesRef = collection(db, 'chatMessages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).filter(message => message.uid === uid);
  } catch (error) {
    throw error;
  }
};

