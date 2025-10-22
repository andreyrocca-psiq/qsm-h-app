'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase, Profile, Questionnaire } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users, LogOut, Mail, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import MoodLineChart from '@/components/charts/LineChart';
import { logPatientDataView } from '@/lib/audit';

interface PatientWithData extends Profile {
  questionnaires: Questionnaire[];
  latestQuestionnaire?: Questionnaire;
}

function DoctorDashboard() {
  const { user, profile, signOut } = useAuth();
  const [patients, setPatients] = useState<PatientWithData[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientWithData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    loadPatients();
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

      const patientIds = relationships.map((r) => r.patient_id);

      // Get patient profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', patientIds);

      if (profilesError) throw profilesError;

      // Get questionnaires for each patient
      const patientsWithData: PatientWithData[] = await Promise.all(
        (profilesData || []).map(async (patient) => {
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

  const handleInvitePatient = async () => {
    // This would require email integration
    // For now, it's a placeholder
    alert('Funcionalidade de convite será implementada em breve!');
    setShowInviteModal(false);
    setInviteEmail('');
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
            <button
              onClick={signOut}
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
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
                              <div className="grid grid-cols-2 gap-4">
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
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@paciente.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <div className="flex gap-3">
                <button onClick={handleInvitePatient} className="btn-primary flex-1">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Enviar Convite
                </button>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default DoctorDashboard;
