import React, { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Phone, Users, BookOpen, Smile } from 'lucide-react';
import FirebaseWebService from '../lib/firebase';

const EmotionalSupportModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState('initial');
  const [selectedMood, setSelectedMood] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [supportResponse, setSupportResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const moodOptions = [
    { id: 'anxious', label: 'Ansioso(a)', emoji: '😰', color: 'bg-yellow-100 border-yellow-300' },
    { id: 'sad', label: 'Triste', emoji: '😢', color: 'bg-blue-100 border-blue-300' },
    { id: 'stressed', label: 'Estressado(a)', emoji: '😤', color: 'bg-red-100 border-red-300' },
    { id: 'overwhelmed', label: 'Sobrecarregado(a)', emoji: '😵', color: 'bg-purple-100 border-purple-300' },
    { id: 'lonely', label: 'Sozinho(a)', emoji: '😔', color: 'bg-gray-100 border-gray-300' },
    { id: 'angry', label: 'Irritado(a)', emoji: '😠', color: 'bg-orange-100 border-orange-300' },
    { id: 'confused', label: 'Confuso(a)', emoji: '😕', color: 'bg-indigo-100 border-indigo-300' },
    { id: 'tired', label: 'Cansado(a)', emoji: '😴', color: 'bg-green-100 border-green-300' }
  ];

  const emergencyContacts = [
    { name: 'CVV - Centro de Valorização da Vida', phone: '188', description: 'Prevenção do suicídio - 24h gratuito' },
    { name: 'CAPS - Centro de Atenção Psicossocial', phone: '136', description: 'Saúde mental - Disque Saúde' },
    { name: 'Polícia Militar', phone: '190', description: 'Emergências gerais' },
    { name: 'SAMU', phone: '192', description: 'Emergências médicas' }
  ];

  const selfCareActivities = [
    { icon: '🧘', title: 'Respiração Profunda', description: 'Inspire por 4 segundos, segure por 4, expire por 6' },
    { icon: '🚶', title: 'Caminhada', description: 'Uma caminhada de 10 minutos pode melhorar o humor' },
    { icon: '💧', title: 'Hidratação', description: 'Beba um copo de água e observe como se sente' },
    { icon: '🎵', title: 'Música Relaxante', description: 'Ouça uma música que te acalme' },
    { icon: '📱', title: 'Contato Social', description: 'Converse com alguém de confiança' },
    { icon: '📝', title: 'Escrever', description: 'Anote seus sentimentos em um papel' }
  ];

  const generatePsychologicalResponse = async (mood, message) => {
    setIsLoading(true);
    try {
      // Simular resposta de um psicólogo experiente baseada no humor e mensagem
      const responses = {
        anxious: {
          immediate: "Entendo que você está se sentindo ansioso(a). A ansiedade é uma resposta natural do nosso corpo, mas quando se torna intensa, pode ser desconfortável. Primeiro, vamos focar na sua respiração.",
          guidance: "Técnicas que podem ajudar agora: 1) Respiração 4-7-8: inspire por 4, segure por 7, expire por 8. 2) Nomeie 5 coisas que você vê, 4 que você ouve, 3 que você toca, 2 que você cheira, 1 que você saboreia. 3) Lembre-se: este sentimento é temporário.",
          longTerm: "Para o futuro, considere: estabelecer uma rotina de exercícios leves, praticar mindfulness diariamente, e se a ansiedade persistir, buscar ajuda profissional é um sinal de força, não fraqueza."
        },
        sad: {
          immediate: "Sinto muito que você esteja passando por um momento difícil. A tristeza é uma emoção válida e importante - ela nos ajuda a processar experiências difíceis. Você não está sozinho(a).",
          guidance: "Permita-se sentir essa emoção sem julgamento. Algumas coisas que podem ajudar: conversar com alguém de confiança, fazer uma atividade que normalmente te dá prazer (mesmo que pequena), ou simplesmente descansar.",
          longTerm: "Lembre-se de que é normal ter dias difíceis. Se a tristeza persistir por várias semanas ou interferir nas suas atividades diárias, considere conversar com um profissional de saúde mental."
        },
        stressed: {
          immediate: "O estresse pode ser muito desgastante. Reconhecer que você está estressado(a) já é um primeiro passo importante. Vamos trabalhar para diminuir essa tensão agora.",
          guidance: "Técnicas imediatas: faça uma pausa de 5 minutos, pratique respiração profunda, alongue o pescoço e ombros, ou faça uma lista das suas prioridades para organizar os pensamentos.",
          longTerm: "Para gerenciar o estresse a longo prazo: identifique as principais fontes de estresse, aprenda a dizer 'não' quando necessário, e desenvolva uma rede de apoio social."
        },
        overwhelmed: {
          immediate: "Sentir-se sobrecarregado(a) pode ser muito angustiante. É como se tudo fosse urgente ao mesmo tempo. Vamos quebrar isso em partes menores e mais manejáveis.",
          guidance: "Agora: pare tudo por 10 minutos. Respire fundo. Faça uma lista de tudo que está te preocupando. Depois, marque apenas 1-2 itens como realmente urgentes para hoje.",
          longTerm: "Aprenda a priorizar tarefas, delegue quando possível, e lembre-se: você não precisa fazer tudo perfeitamente. 'Bom o suficiente' às vezes é exatamente o que precisamos."
        },
        lonely: {
          immediate: "A solidão pode ser muito dolorosa. É importante saber que sentir-se sozinho(a) não significa que você está realmente sozinho(a) - muitas pessoas se importam com você.",
          guidance: "Considere: enviar uma mensagem para um amigo ou familiar, participar de uma atividade online, ou até mesmo conversar com alguém em um espaço público como uma cafeteria.",
          longTerm: "Construir conexões leva tempo. Considere se juntar a grupos com interesses similares, fazer trabalho voluntário, ou participar de atividades comunitárias."
        },
        angry: {
          immediate: "A raiva é uma emoção natural que geralmente indica que algo importante para você foi ameaçado ou violado. É válido sentir raiva, mas vamos canalizá-la de forma saudável.",
          guidance: "Para agora: conte até 10 (ou 100), faça exercício físico intenso por alguns minutos, ou escreva sobre o que está te irritando sem se censurar.",
          longTerm: "Identifique os gatilhos da sua raiva, pratique comunicação assertiva para expressar suas necessidades, e considere técnicas de relaxamento regulares."
        },
        confused: {
          immediate: "Sentir-se confuso(a) pode ser frustrante, especialmente quando precisamos tomar decisões. É normal não ter todas as respostas imediatamente.",
          guidance: "Tente: escrever sobre a situação que está te confundindo, conversar com alguém de confiança para ter uma perspectiva externa, ou dar um tempo para a situação antes de tomar decisões importantes.",
          longTerm: "Lembre-se de que a confusão é temporária. Às vezes, precisamos de mais informações ou simplesmente de tempo para que as coisas se esclareçam."
        },
        tired: {
          immediate: "O cansaço pode ser físico, mental ou emocional. É importante honrar essa necessidade do seu corpo e mente de descansar.",
          guidance: "Se possível: tire uma soneca de 20 minutos, faça uma atividade relaxante, ou simplesmente permita-se não ser produtivo(a) por um tempo.",
          longTerm: "Avalie seus padrões de sono, nutrição e exercício. Cansaço persistente pode indicar necessidade de mudanças no estilo de vida ou consulta médica."
        }
      };

      const response = responses[mood] || responses.anxious;
      
      let fullResponse = `${response.immediate}\n\n${response.guidance}\n\n${response.longTerm}`;
      
      if (message.trim()) {
        fullResponse += `\n\nSobre o que você compartilhou: "${message}" - Obrigado por confiar em mim com seus sentimentos. Cada pessoa é única, e suas experiências são válidas. Se você sente que precisa de mais apoio, não hesite em procurar ajuda profissional.`;
      }

      setSupportResponse(fullResponse);
      setCurrentStep('response');
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      setSupportResponse('Desculpe, houve um erro. Por favor, tente novamente ou procure ajuda profissional se necessário.');
      setCurrentStep('response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setCurrentStep('message');
  };

  const handleSubmitMessage = () => {
    generatePsychologicalResponse(selectedMood, userMessage);
  };

  const resetModal = () => {
    setCurrentStep('initial');
    setSelectedMood('');
    setUserMessage('');
    setSupportResponse('');
    setIsLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Heart className="h-6 w-6 text-pink-500" />
            <h2 className="text-xl font-semibold text-gray-800">Suporte Emocional</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 'initial' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Como você está se sentindo agora?
                </h3>
                <p className="text-gray-600">
                  Escolha a opção que melhor descreve seu estado emocional atual. 
                  Estou aqui para te ajudar com orientações personalizadas.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => handleMoodSelect(mood.id)}
                    className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${mood.color} hover:scale-105`}
                  >
                    <div className="text-2xl mb-2">{mood.emoji}</div>
                    <div className="text-sm font-medium text-gray-700">{mood.label}</div>
                  </button>
                ))}
              </div>

              {/* Emergency Section */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2 flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Em caso de emergência
                </h4>
                <p className="text-red-700 text-sm mb-3">
                  Se você está pensando em se machucar ou está em crise, procure ajuda imediatamente:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium text-red-800">{contact.name}</span>
                      <br />
                      <span className="text-red-600">📞 {contact.phone}</span>
                      <br />
                      <span className="text-red-600 text-xs">{contact.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 'message' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Conte-me mais sobre como você está se sentindo
                </h3>
                <p className="text-gray-600">
                  Compartilhe o que está acontecendo. Suas palavras me ajudarão a oferecer 
                  orientações mais personalizadas. (Opcional)
                </p>
              </div>

              <div className="space-y-4">
                <textarea
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Descreva o que você está sentindo ou vivenciando... (opcional)"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={6}
                />

                <div className="flex space-x-3">
                  <button
                    onClick={() => setCurrentStep('initial')}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleSubmitMessage}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Preparando orientação...' : 'Receber Orientação'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'response' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-800 mb-4 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Orientação Personalizada
                </h3>
                <div className="text-blue-700 whitespace-pre-line leading-relaxed">
                  {supportResponse}
                </div>
              </div>

              {/* Self-care activities */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h4 className="font-medium text-green-800 mb-4 flex items-center">
                  <Smile className="h-5 w-5 mr-2" />
                  Atividades de Autocuidado
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selfCareActivities.map((activity, index) => (
                    <div key={index} className="bg-white p-3 rounded border border-green-200">
                      <div className="flex items-start space-x-3">
                        <span className="text-lg">{activity.icon}</span>
                        <div>
                          <h5 className="font-medium text-green-800 text-sm">{activity.title}</h5>
                          <p className="text-green-700 text-xs">{activity.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional help reminder */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-800 mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Lembre-se
                </h4>
                <p className="text-purple-700 text-sm">
                  Estas orientações são um primeiro apoio, mas não substituem o acompanhamento 
                  profissional. Se você está enfrentando dificuldades persistentes, considere 
                  buscar ajuda de um psicólogo ou psiquiatra. Cuidar da saúde mental é tão 
                  importante quanto cuidar da saúde física.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={resetModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Nova Consulta
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Obrigado pela Ajuda
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmotionalSupportModal;

