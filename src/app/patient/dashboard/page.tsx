'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import MoodLineChart from '@/components/charts/LineChart';
import { supabase } from '@/lib/supabase/client';
import { Questionnaire } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingDown, TrendingUp, Calendar, LogOut, FileText, Bell, Users, X, Search, BarChart3 } from 'lucide-react';

interface Invite {
  id: string;
  invited_at: string;
  doctor: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface Connection {
  id: string;
  connectedAt: string;
  doctor: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface Doctor {
  id: string;
  name: string;
  email: string;
  status: 'none' | 'pending' | 'connected';
}

function PatientDashboard() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);

  // Sharing system states
  const [invites, setInvites] = useState<Invite[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [showInvitesModal, setShowInvitesModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);

  // Share with doctor states
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<Doctor[]>([]);
  const [searching, setSearching] = useState(false);
  const [shareError, setShareError] = useState('');
  const [shareSuccess, setShareSuccess] = useState('');

  useEffect(() => {
    loadQuestionnaires();
    loadInvites();
    loadConnections();
  }, [user]);

  const loadQuestionnaires = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('questionnaires')
        .select('*')
        .eq('patient_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setQuestionnaires(data || []);
    } catch (error) {
      console.error('Error loading questionnaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInvites = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/invites');
      const data = await response.json();
      setInvites(data.invites || []);
    } catch (error) {
      console.error('Error loading invites:', error);
    }
  };

  const loadConnections = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/connections');
      const data = await response.json();
      setConnections(data.connections || []);
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/invites/${inviteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });

      if (response.ok) {
        await loadInvites();
        await loadConnections();
      } else {
        const data = await response.json();
        console.error('Error accepting invite:', data.error);
      }
    } catch (error) {
      console.error('Error accepting invite:', error);
    }
  };

  const handleRejectInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/invites/${inviteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });

      if (response.ok) {
        await loadInvites();
      } else {
        const data = await response.json();
        console.error('Error rejecting invite:', data.error);
      }
    } catch (error) {
      console.error('Error rejecting invite:', error);
    }
  };

  const handleSearchDoctor = async () => {
    if (!searchEmail || !searchEmail.includes('@')) {
      setShareError('Por favor, insira um email válido');
      return;
    }

    setSearching(true);
    setShareError('');
    setSearchResults([]);

    try {
      const response = await fetch(`/api/doctors?email=${encodeURIComponent(searchEmail)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar profissionais');
      }

      setSearchResults(data.doctors || []);
      if (data.doctors.length === 0) {
        setShareError('Nenhum profissional de saúde encontrado com este email');
      }
    } catch (error: any) {
      setShareError(error.message);
    } finally {
      setSearching(false);
    }
  };

  const handleShareWithDoctor = async (doctorEmail: string) => {
    setShareError('');
    setShareSuccess('');

    try {
      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao compartilhar com profissional de saúde');
      }

      setShareSuccess('Compartilhamento enviado com sucesso!');
      setSearchResults([]);
      setSearchEmail('');

      setTimeout(() => {
        setShowShareModal(false);
        setShareSuccess('');
        loadConnections();
      }, 2000);
    } catch (error: any) {
      setShareError(error.message);
    }
  };

  const handleRemoveConnection = async (connectionId: string) => {
    if (!confirm('Tem certeza que deseja desvincular este profissional de saúde?')) {
      return;
    }

    try {
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadConnections();
      } else {
        const data = await response.json();
        console.error('Error removing connection:', data.error);
      }
    } catch (error) {
      console.error('Error removing connection:', error);
    }
  };

  const chartData = questionnaires
    .slice()
    .reverse()
    .map((q) => ({
      date: q.completed_at,
      depressive: q.dep_total,
      activation: q.act_total,
    }));

  const latestQuestionnaire = questionnaires[0];
  const previousQuestionnaire = questionnaires[1];

  const getTrend = (current: number, previous: number | undefined) => {
    if (!previous) return null;
    const diff = current - previous;
    return {
      value: Math.abs(diff),
      isIncrease: diff > 0,
      isDecrease: diff < 0,
    };
  };

  const depTrend = latestQuestionnaire && previousQuestionnaire
    ? getTrend(latestQuestionnaire.dep_total, previousQuestionnaire.dep_total)
    : null;

  const actTrend = latestQuestionnaire && previousQuestionnaire
    ? getTrend(latestQuestionnaire.act_total, previousQuestionnaire.act_total)
    : null;

  return (
    <ProtectedRoute requiredRole="patient">
      <div className="min-h-screen bg-background-light">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary">Dashboard - Paciente</h1>
              <p className="text-gray-600 text-sm">Olá, {profile?.full_name}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Notification Bell for Invites */}
              <button
                onClick={() => setShowInvitesModal(true)}
                className="relative p-2 text-gray-600 hover:text-primary transition-colors rounded-lg hover:bg-gray-100"
              >
                <Bell className="w-6 h-6" />
                {invites.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {invites.length > 9 ? '9+' : invites.length}
                  </span>
                )}
              </button>

              {/* Connections Button */}
              <button
                onClick={() => setShowConnectionsModal(true)}
                className="relative p-2 text-gray-600 hover:text-primary transition-colors rounded-lg hover:bg-gray-100"
                title="Meus Profissionais de Saúde"
              >
                <Users className="w-6 h-6" />
                {connections.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {connections.length}
                  </span>
                )}
              </button>

              <button
                onClick={signOut}
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sair
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : questionnaires.length === 0 ? (
            /* Empty State */
            <div className="card text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Nenhum questionário respondido ainda
              </h3>
              <p className="text-gray-600 mb-6">
                Comece respondendo seu primeiro questionário semanal
              </p>
              <button
                onClick={() => router.push('/patient/questionnaire')}
                className="btn-primary"
              >
                Responder Questionário
              </button>
            </div>
          ) : (
            <>
              {/* Quick Actions */}
              <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/patient/questionnaire')}
                  className="btn-primary flex items-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Responder Novo Questionário
                </button>
                <button
                  onClick={() => router.push('/patient/insights')}
                  className="btn-secondary flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700"
                >
                  <BarChart3 className="w-5 h-5" />
                  Ver Análises e Padrões
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Compartilhar com Profissional de Saúde
                </button>
              </div>

              {/* Latest Stats */}
              {latestQuestionnaire && (
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="card">
                    <div className="text-sm text-gray-600 mb-2">Última Avaliação</div>
                    <div className="text-2xl font-bold text-primary-dark">
                      {format(new Date(latestQuestionnaire.completed_at), "dd 'de' MMMM", {
                        locale: ptBR,
                      })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {format(new Date(latestQuestionnaire.completed_at), 'HH:mm')}
                    </div>
                  </div>

                  <div className="card">
                    <div className="text-sm text-gray-600 mb-2 flex items-center justify-between">
                      <span>Sintomas Depressivos</span>
                      {depTrend && depTrend.isDecrease && (
                        <TrendingDown className="w-5 h-5 text-green-500" />
                      )}
                      {depTrend && depTrend.isIncrease && (
                        <TrendingUp className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="text-3xl font-bold text-primary-dark">
                      {latestQuestionnaire.dep_total}
                      <span className="text-lg text-gray-500">/27</span>
                    </div>
                    {depTrend && (
                      <div
                        className={`text-xs mt-1 ${
                          depTrend.isDecrease ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {depTrend.isDecrease ? '-' : '+'}
                        {depTrend.value} desde última avaliação
                      </div>
                    )}
                  </div>

                  <div className="card">
                    <div className="text-sm text-gray-600 mb-2 flex items-center justify-between">
                      <span>Sintomas de Ativação</span>
                      {actTrend && actTrend.isDecrease && (
                        <TrendingDown className="w-5 h-5 text-green-500" />
                      )}
                      {actTrend && actTrend.isIncrease && (
                        <TrendingUp className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="text-3xl font-bold text-primary-dark">
                      {latestQuestionnaire.act_total}
                      <span className="text-lg text-gray-500">/27</span>
                    </div>
                    {actTrend && (
                      <div
                        className={`text-xs mt-1 ${
                          actTrend.isDecrease ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {actTrend.isDecrease ? '-' : '+'}
                        {actTrend.value} desde última avaliação
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Chart */}
              {chartData.length > 1 && (
                <div className="card mb-8">
                  <h3 className="text-xl font-semibold text-primary mb-4">
                    Evolução dos Sintomas
                  </h3>
                  <MoodLineChart data={chartData} />
                </div>
              )}

              {/* History */}
              <div className="card">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Histórico de Avaliações
                </h3>
                <div className="space-y-3">
                  {questionnaires.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-4 bg-background-light rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {format(new Date(q.completed_at), "dd/MM/yyyy 'às' HH:mm")}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Depressivos: {q.dep_total}/27 | Ativação: {q.act_total}/27 | Total:{' '}
                          {q.combined_total}/54
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-primary-dark">
                        {q.combined_total}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Invites Modal */}
        {showInvitesModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-primary">
                  Convites Pendentes ({invites.length})
                </h3>
                <button
                  onClick={() => setShowInvitesModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {invites.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  Nenhum convite pendente
                </p>
              ) : (
                <div className="space-y-3">
                  {invites.map((invite) => (
                    <div key={invite.id} className="border p-4 rounded-lg">
                      <div className="font-semibold text-gray-900">{invite.doctor.full_name}</div>
                      <div className="text-sm text-gray-600">{invite.doctor.email}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Enviado em {format(new Date(invite.invited_at), "dd/MM/yyyy 'às' HH:mm")}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleAcceptInvite(invite.id)}
                          className="btn-primary flex-1 text-sm py-2"
                        >
                          Aceitar
                        </button>
                        <button
                          onClick={() => handleRejectInvite(invite.id)}
                          className="btn-secondary flex-1 text-sm py-2"
                        >
                          Recusar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Share with Doctor Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-primary">
                  Compartilhar com Profissional de Saúde
                </h3>
                <button
                  onClick={() => {
                    setShowShareModal(false);
                    setSearchEmail('');
                    setSearchResults([]);
                    setShareError('');
                    setShareSuccess('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email do Profissional de Saúde
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      placeholder="medico@exemplo.com"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      disabled={searching}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSearchDoctor();
                        }
                      }}
                    />
                    <button
                      onClick={handleSearchDoctor}
                      disabled={searching}
                      className="btn-primary px-4 py-2 flex items-center gap-2"
                    >
                      <Search className="w-5 h-5" />
                      {searching ? 'Buscando...' : 'Buscar'}
                    </button>
                  </div>
                </div>

                {shareError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {shareError}
                  </div>
                )}

                {shareSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {shareSuccess}
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Resultados:</h4>
                    {searchResults.map((doctor) => (
                      <div key={doctor.id} className="border p-4 rounded-lg">
                        <div className="font-semibold text-gray-900">{doctor.name}</div>
                        <div className="text-sm text-gray-600">{doctor.email}</div>
                        <div className="mt-3">
                          {doctor.status === 'connected' ? (
                            <div className="text-sm text-green-600 font-medium">
                              Já conectado
                            </div>
                          ) : doctor.status === 'pending' ? (
                            <div className="text-sm text-yellow-600 font-medium">
                              Convite pendente
                            </div>
                          ) : (
                            <button
                              onClick={() => handleShareWithDoctor(doctor.email)}
                              className="btn-primary w-full text-sm py-2"
                            >
                              Compartilhar meus dados
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Connections Modal */}
        {showConnectionsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-primary">
                  Meus Profissionais de Saúde ({connections.length})
                </h3>
                <button
                  onClick={() => setShowConnectionsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {connections.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Você ainda não tem profissionais de saúde conectados
                  </p>
                  <button
                    onClick={() => {
                      setShowConnectionsModal(false);
                      setShowShareModal(true);
                    }}
                    className="btn-primary"
                  >
                    Compartilhar com Profissional de Saúde
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {connections.map((connection) => (
                    <div key={connection.id} className="border p-4 rounded-lg">
                      <div className="font-semibold text-gray-900">
                        {connection.doctor.full_name}
                      </div>
                      <div className="text-sm text-gray-600">{connection.doctor.email}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Conectado em{' '}
                        {format(new Date(connection.connectedAt), "dd/MM/yyyy 'às' HH:mm")}
                      </div>
                      <button
                        onClick={() => handleRemoveConnection(connection.id)}
                        className="mt-3 w-full btn-secondary text-sm py-2 text-red-600 hover:bg-red-50"
                      >
                        Desvincular
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default PatientDashboard;
