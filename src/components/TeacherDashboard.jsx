import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getAllStudents, 
  createTask, 
  getTasksByTeacher, 
  updateTask, 
  deleteTask,
  getTaskSubmissions,
  gradeSubmission,
  updateUserRole
} from '../lib/firebase';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'quiz',
    dueDate: '',
    assignedTo: [],
    points: 100
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, tasksData] = await Promise.all([
        getAllStudents(),
        getTasksByTeacher(user.uid)
      ]);
      setStudents(studentsData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      setLoading(true);
      await createTask(user.uid, newTask);
      setNewTask({
        title: '',
        description: '',
        type: 'quiz',
        dueDate: '',
        assignedTo: [],
        points: 100
      });
      setShowCreateTask(false);
      await loadData();
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await deleteTask(taskId);
        await loadData();
      } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
      }
    }
  };

  const getStudentStats = () => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => 
      s.progress && Object.keys(s.progress).length > 0
    ).length;
    const averageScore = students.reduce((acc, s) => {
      const techModules = s.progress?.techModules || {};
      const scores = Object.values(techModules).map(m => m.score || 0);
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      return acc + avgScore;
    }, 0) / (totalStudents || 1);

    return { totalStudents, activeStudents, averageScore: Math.round(averageScore) };
  };

  const stats = getStudentStats();

  if (loading && students.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Área do Professor 👨‍🏫
              </h1>
              <p className="text-gray-600">
                Gerencie seus alunos, acompanhe o progresso e crie tarefas personalizadas
              </p>
            </div>
            <button
              onClick={() => setShowCreateTask(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              + Nova Tarefa
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total de Alunos</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Alunos Ativos</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pontuação Média</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.averageScore}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Tarefas Criadas</p>
                <p className="text-2xl font-bold text-purple-600">{tasks.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Visão Geral', icon: '📊' },
                { id: 'students', label: 'Alunos', icon: '👥' },
                { id: 'tasks', label: 'Tarefas', icon: '📝' },
                { id: 'reports', label: 'Relatórios', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Visão Geral */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Atividade Recente</h3>
                
                {/* Progresso dos Módulos */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Progresso nos Módulos de Tecnologia</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: 'Lógica de Programação', completed: students.filter(s => s.progress?.techModules?.['logic-programming']?.completed).length },
                      { name: 'Python Fundamentals', completed: students.filter(s => s.progress?.techModules?.['python-fundamentals']?.completed).length },
                      { name: 'Desenvolvimento Web', completed: students.filter(s => s.progress?.techModules?.['web-frontend']?.completed).length }
                    ].map((module, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg">
                        <h5 className="font-medium text-gray-800">{module.name}</h5>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{module.completed} de {stats.totalStudents} alunos</span>
                            <span>{Math.round((module.completed / (stats.totalStudents || 1)) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${(module.completed / (stats.totalStudents || 1)) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alunos com Melhor Desempenho */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Top 5 Alunos</h4>
                  <div className="space-y-3">
                    {students
                      .sort((a, b) => {
                        const aScore = Object.values(a.progress?.techModules || {}).reduce((acc, m) => acc + (m.score || 0), 0);
                        const bScore = Object.values(b.progress?.techModules || {}).reduce((acc, m) => acc + (m.score || 0), 0);
                        return bScore - aScore;
                      })
                      .slice(0, 5)
                      .map((student, index) => {
                        const totalScore = Object.values(student.progress?.techModules || {}).reduce((acc, m) => acc + (m.score || 0), 0);
                        return (
                          <div key={student.uid} className="flex items-center justify-between bg-white p-3 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-lg mr-3">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                              </span>
                              <span className="font-medium">{student.displayName || student.email}</span>
                            </div>
                            <span className="text-purple-600 font-bold">{totalScore} pts</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Alunos */}
            {activeTab === 'students' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Lista de Alunos</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aluno
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Módulos Completados
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pontuação Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Último Acesso
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => {
                        const techModules = student.progress?.techModules || {};
                        const completedModules = Object.values(techModules).filter(m => m.completed).length;
                        const totalScore = Object.values(techModules).reduce((acc, m) => acc + (m.score || 0), 0);
                        
                        return (
                          <tr key={student.uid} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <span className="text-purple-600 font-medium">
                                      {(student.displayName || student.email).charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {student.displayName || 'Sem nome'}
                                  </div>
                                  <div className="text-sm text-gray-500">{student.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {completedModules} módulos
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {totalScore} pontos
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.lastLoginAt ? new Date(student.lastLoginAt).toLocaleDateString('pt-BR') : 'Nunca'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => setSelectedStudent(student)}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                Ver Detalhes
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tarefas */}
            {activeTab === 'tasks' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Tarefas Criadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tasks.map((task) => (
                    <div key={task.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-lg font-medium text-gray-800">{task.title}</h4>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{task.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Tipo:</span>
                          <span className="font-medium">{task.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Prazo:</span>
                          <span className="font-medium">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : 'Sem prazo'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Pontos:</span>
                          <span className="font-medium">{task.points}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Atribuída a:</span>
                          <span className="font-medium">{task.assignedTo?.length || 0} alunos</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Relatórios */}
            {activeTab === 'reports' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Relatórios de Desempenho</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-600 text-center">
                    Funcionalidade de relatórios em desenvolvimento. 
                    Em breve você poderá exportar dados detalhados de progresso dos alunos.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Criar Tarefa */}
        {showCreateTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Nova Tarefa</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Digite o título da tarefa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    rows="3"
                    placeholder="Descreva a tarefa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={newTask.type}
                    onChange={(e) => setNewTask({...newTask, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="quiz">Quiz</option>
                    <option value="exercise">Exercício</option>
                    <option value="project">Projeto</option>
                    <option value="reading">Leitura</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Entrega
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pontos
                  </label>
                  <input
                    type="number"
                    value={newTask.points}
                    onChange={(e) => setNewTask({...newTask, points: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    min="1"
                    max="1000"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateTask(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={!newTask.title || !newTask.description || loading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Criando...' : 'Criar Tarefa'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalhes do Aluno */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Detalhes do Aluno: {selectedStudent.displayName || selectedStudent.email}
                </h3>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Informações Básicas */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">Informações Básicas</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium">{selectedStudent.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Último acesso:</span>
                      <p className="font-medium">
                        {selectedStudent.lastLoginAt ? 
                          new Date(selectedStudent.lastLoginAt).toLocaleDateString('pt-BR') : 
                          'Nunca'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progresso nos Módulos */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">Progresso nos Módulos de Tecnologia</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedStudent.progress?.techModules || {}).map(([moduleId, moduleData]) => (
                      <div key={moduleId} className="bg-white p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize">
                            {moduleId.replace('-', ' ')}
                          </span>
                          <div className="text-right">
                            <span className="text-green-600 font-bold">{moduleData.score || 0} pts</span>
                            {moduleData.completed && (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Concluído
                              </span>
                            )}
                          </div>
                        </div>
                        {moduleData.completedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Concluído em: {new Date(moduleData.completedAt).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    ))}
                    {Object.keys(selectedStudent.progress?.techModules || {}).length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        Nenhum módulo iniciado ainda
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;

