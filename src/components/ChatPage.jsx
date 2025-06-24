import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FirebaseWebService from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  User, 
  MessageCircle,
  Lightbulb,
  Loader2
} from 'lucide-react';

const ChatPage = ({ onNavigate }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      setLoadingHistory(true);
      const history = await FirebaseWebService.getChatHistory();
      setMessages(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (messageText = inputText) => {
    if (!messageText.trim() || loading) return;

    if (!user) {
      alert('Você precisa estar logado para usar o assistente.');
      return;
    }

    const userMessage = messageText.trim();
    setInputText('');
    setLoading(true);

    // Add user message immediately
    const userMsg = {
      id: Date.now().toString(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date(),
      userId: user.uid
    };
    
    setMessages(prev => [...prev, userMsg]);

    try {
      // Send message to assistant
      const assistantResponse = await FirebaseWebService.sendMessageToAssistant(userMessage);
      
      // Add assistant response
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        text: assistantResponse,
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove user message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMsg.id));
      alert('Não foi possível enviar a mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const suggestions = [
    'Como posso melhorar minha pontuação nos jogos?',
    'Quais jogos são melhores para aprender matemática?',
    'Como funciona o sistema de progresso?',
    'Preciso de ajuda com português',
    'Explique sobre os jogos de ciências'
  ];

  const renderMessage = (message, index) => {
    const isUser = message.sender === 'user';
    
    return (
      <div
        key={message.id || index}
        className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isUser && (
          <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
            <Bot className="h-5 w-5 text-blue-600" />
          </div>
        )}
        
        <div
          className={`max-w-[80%] p-3 rounded-lg ${
            isUser 
              ? 'bg-blue-600 text-white rounded-br-sm' 
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.text}</p>
          <p className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
            {formatTime(message.timestamp)}
          </p>
        </div>
        
        {isUser && (
          <div className="bg-blue-600 p-2 rounded-full flex-shrink-0">
            <User className="h-5 w-5 text-white" />
          </div>
        )}
      </div>
    );
  };

  const renderWelcomeMessage = () => (
    <div className="text-center py-8 px-4">
      <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <Bot className="h-8 w-8 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Olá! Sou seu Assistente Virtual
      </h3>
      <p className="text-gray-600 mb-6">
        Estou aqui para te ajudar com suas dúvidas sobre os jogos e conteúdos educativos. 
        Pode me perguntar qualquer coisa!
      </p>
      
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 mb-3">Sugestões de perguntas:</p>
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="block w-full text-left"
            onClick={() => sendMessage(suggestion)}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <CardTitle>Assistente Virtual</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Você precisa estar logado para conversar com o assistente.
            </p>
            <Button onClick={() => onNavigate('login')}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={() => onNavigate('dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <div className="flex items-center gap-3 ml-4">
              <Bot className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Assistente Virtual</h1>
                <p className="text-sm text-gray-600">
                  {user ? `Logado como ${user.displayName}` : 'Não logado'}
                </p>
              </div>
            </div>
            <div className="ml-auto">
              <Badge variant="secondary">Online</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 p-4">
          <Card className="h-full flex flex-col">
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[60vh] p-4" ref={scrollAreaRef}>
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-600">Carregando conversa...</span>
                  </div>
                ) : messages.length === 0 ? (
                  renderWelcomeMessage()
                ) : (
                  <div>
                    {messages.map(renderMessage)}
                    {loading && (
                      <div className="flex gap-3 mb-4">
                        <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                          <Bot className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg rounded-bl-sm">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-gray-600">Assistente está digitando...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1"
              disabled={loading}
              maxLength={500}
            />
            <Button 
              type="submit" 
              disabled={!inputText.trim() || loading}
              size="icon"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            Pressione Enter para enviar • {inputText.length}/500 caracteres
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length > 0 && (
        <div className="bg-white border-t p-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-gray-600 mb-2">Perguntas rápidas:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage(suggestion)}
                  disabled={loading}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;

