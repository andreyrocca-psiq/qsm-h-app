'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabase/client';
import { Profile, Questionnaire } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users, LogOut, Mail, Plus, Bell, X, BarChart3 } from 'lucide-react';
import MoodLineChart from '@/components/charts/LineChart';
import { logPatientDataView } from '@/lib/audit';

interface PatientWithData extends Profile {
  questionnaires: Questionnaire[];
  latestQuestionnaire?: Questionnaire;
}

interface Invite {
  id: string;
  invitedAt: string;
  patient: {
    id: string;
    full_name: string;
    email: string;
  };
}

function DoctorDashboard() {
  const { user, profile, signOut } = useAuth();
  const [patients, setPatients] = useState<PatientWithData[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientWithData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [showPendingInvites, setShowPendingInvites] = useState(false);

  useEffect(() => {
    loadPatients();
    loadPendingInvites();
  }, [user]);

  // Log audit when doctor views patient data
  useEffect(() => {
    if (selectedPatient && user) {
      logPatientDataView(user.id, selectedPatient.id);
    }
  }, [selectedPatient, user]);

  const loadPatients = async () => {
    if (!user) return;

    try {
      // Get doctor-patient relationships
      const { data: relationships, error: relError } = await supabase
        .from('doctor_patient')
        .select('patient_id')
        .eq('doctor_id', user.id)
        .not('accepted_at', 'is', null);

      if (relError) throw relError;

      if (!relationships || relationships.length === 0) {
        setLoading(false);
        return;
      }

      const patientIds = relationships.map((r: { patient_id: string }) => r.patient_id);

      // Get patient profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', patientIds);

      if (profilesError) throw profilesError;

      // Get questionnaires for each patient
      const patientsWithData: PatientWithData[] = await Promise.all(
        (profilesData || []).map(async (patient: Profile) => {
          const { data: questionnairesData } = await supabase
            .from('questionnaires')
            .select('*')
            .eq('patient_id', patient.id)
            .order('completed_at', { ascending: false })
            .limit(20);

          return {
            ...patient,
            questionnaires: questionnairesData || [],
            latestQuestionnaire: questionnairesData?.[0],
          };
        })
      );

      setPatients(patientsWithData);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingInvites = async () => {
    try {
      const response = await fetch('/api/invites');
      const data = await response.json();
      setPendingInvites(data.invites || []);
    } catch (error) {
      console.error('Error loading pending invites:', error);
    }
  };

  const handleInvitePatient = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      setInviteError('Por favor, insira um email válido');
      return;
    }

    setInviting(true);
    setInviteError('');
    setInviteSuccess('');

    try {
      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientEmail: inviteEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar convite');
      }

      setInviteSuccess(data.message);
      setInviteEmail('');
      loadPendingInvites();

      // Fechar modal após 2 segundos
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteSuccess('');
      }, 2000);
    } catch (error: any) {
      setInviteError(error.message);
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/invites/${inviteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadPendingInvites();
      }
    } catch (error) {
      console.error('Error canceling invite:', error);
    }
  };

  const selectedChartData = selectedPatient
    ? selectedPatient.questionnaires
        .slice()
        .reverse()
        .map((q) => ({
          date: q.completed_at,
          depressive: q.dep_total,
          activation: q.act_total,
        }))
    : [];

  return (
    <ProtectedRoute requiredRole="doctor">
      <div className="min-h-screen bg-background-light">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary">Dashboard - Médico</h1>
              <p className="text-gray-600 text-sm">Olá, Dr(a). {profile?.full_name}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              {pendingInvites.length > 0 && (
                <button
                  onClick={() => setShowPendingInvites(true)}
                  className="relative p-2 text-gray-600 hover:text-primary transition-colors"
                >
                  <Bell className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingInvites.length}
                  </span>
                </button>
              )}
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
          ) : (
            <>
              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="card">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Total de Pacientes</div>
                      <div className="text-2xl font-bold text-primary-dark">{patients.length}</div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="text-sm text-gray-600 mb-2">Avaliações Esta Semana</div>
                  <div className="text-2xl font-bold text-primary-dark">
                    {patients.reduce((acc, p) => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return (
                        acc +
                        p.questionnaires.filter(
                          (q) => new Date(q.completed_at) > weekAgo
                        ).length
                      );
                    }, 0)}
                  </div>
                </div>

                <div className="card">
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Convidar Paciente
                  </button>
                </div>
              </div>

              {patients.length === 0 ? (
                /* Empty State */
                <div className="card text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Nenhum paciente vinculado ainda
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Convide seus pacientes para começar a acompanhar o progresso deles
                  </p>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="btn-primary"
                  >
                    Convidar Primeiro Paciente
                  </button>
                </div>
              ) : (
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Patients List */}
                  <div className="card">
                    <h3 className="text-xl font-semibold text-primary mb-4">Meus Pacientes</h3>
                    <div className="space-y-3">
                      {patients.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => setSelectedPatient(patient)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            selectedPatient?.id === patient.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">
                                {patient.full_name}
                              </div>
                              {patient.latestQuestionnaire && (
                                <div className="text-sm text-gray-600 mt-1">
                                  Última avaliação:{' '}
                                  {format(
                                    new Date(patient.latestQuestionnaire.completed_at),
                                    'dd/MM/yyyy'
                                  )}
                                </div>
                              )}
                              <div className="flex gap-4 mt-2 text-xs">
                                <span className="text-red-600">
                                  Dep: {patient.latestQuestionnaire?.dep_total || '-'}/27
                                </span>
                                <span className="text-orange-600">
                                  Ativ: {patient.latestQuestionnaire?.act_total || '-'}/27
                                </span>
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-primary-dark">
                              {patient.latestQuestionnaire?.combined_total || '-'}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Patient Details */}
                  {selectedPatient ? (
                    <div className="card">
                      <h3 className="text-xl font-semibold text-primary mb-4">
                        {selectedPatient.full_name}
                      </h3>

                      {selectedPatient.questionnaires.length === 0 ? (
                        <div className="text-center py-8 text-gray-600">
                          Paciente ainda não respondeu nenhum questionário
                        </div>
                      ) : (
                        <>
                          {/* Latest Stats */}
                          {selectedPatient.latestQuestionnaire && (
                            <div className="mb-6">
                              <div className="text-sm text-gray-600 mb-3">
                                Última Avaliação -{' '}
                                {format(
                                  new Date(selectedPatient.latestQuestionnaire.completed_at),
                                  "dd 'de' MMMM",
                                  { locale: ptBR }
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-red-50 p-3 rounded-lg">
                                  <div className="text-xs text-red-600 mb-1">Depressivos</div>
                                  <div className="text-2xl font-bold text-red-700">
                                    {selectedPatient.latestQuestionnaire.dep_total}/27
                                  </div>
                                </div>
                                <div className="bg-orange-50 p-3 rounded-lg">
                                  <div className="text-xs text-orange-600 mb-1">Ativação</div>
                                  <div className="text-2xl font-bold text-orange-700">
                                    {selectedPatient.latestQuestionnaire.act_total}/27
                                  </div>
                                </div>
                              </div>
                              {selectedPatient.questionnaires.length >= 2 && (
                                <button
                                  onClick={() => router.push(`/doctor/insights/${selectedPatient.id}`)}
                                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                                >
                                  <BarChart3 className="w-5 h-5" />
                                  Ver Análises Detalhadas
                                </button>
                              )}
                            </div>
                          )}

                          {/* Chart */}
                          {selectedChartData.length > 1 && (
                            <div className="mb-6">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                Evolução
                              </h4>
                              <MoodLineChart data={selectedChartData} />
                            </div>
                          )}

                          {/* History */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">
                              Histórico (últimas 5)
                            </h4>
                            <div className="space-y-2">
                              {selectedPatient.questionnaires.slice(0, 5).map((q) => (
                                <div
                                  key={q.id}
                                  className="text-sm p-2 bg-background-light rounded"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600">
                                      {format(new Date(q.completed_at), 'dd/MM/yyyy')}
                                    </span>
                                    <span className="font-semibold">
                                      {q.dep_total} / {q.act_total}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="card flex items-center justify-center text-gray-500">
                      Selecione um paciente para ver detalhes
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full">
              <h3 className="text-xl font-semibold text-primary mb-4">Convidar Paciente</h3>
              <p className="text-gray-600 mb-4">
                Digite o e-mail do paciente que você deseja convidar para compartilhar dados.
              </p>

              {inviteError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                  {inviteError}
                </div>
              )}

              {inviteSuccess && (
                <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">
                  ✅ {inviteSuccess}
                </div>
              )}

              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  setInviteError('');
                }}
                placeholder="email@paciente.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={inviting}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleInvitePatient}
                  className="btn-primary flex-1 disabled:opacity-50"
                  disabled={inviting}
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  {inviting ? 'Enviando...' : 'Enviar Convite'}
                </button>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                    setInviteError('');
                    setInviteSuccess('');
                  }}
                  className="btn-secondary flex-1"
                  disabled={inviting}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pending Invites Modal */}
        {showPendingInvites && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-primary">
                  Convites Pendentes ({pendingInvites.length})
                </h3>
                <button
                  onClick={() => setShowPendingInvites(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {pendingInvites.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  Nenhum convite pendente
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingInvites.map((invite) => (
                    <div key={invite.id} className="border p-4 rounded-lg">
                      <div className="font-semibold">{invite.patient.full_name}</div>
                      <div className="text-sm text-gray-600">{invite.patient.email}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Convidado em {format(new Date(invite.invitedAt), 'dd/MM/yyyy')}
                      </div>
                      <button
                        onClick={() => handleCancelInvite(invite.id)}
                        className="mt-3 text-sm text-red-600 hover:text-red-700"
                      >
                        Cancelar Convite
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

export default DoctorDashboard;
