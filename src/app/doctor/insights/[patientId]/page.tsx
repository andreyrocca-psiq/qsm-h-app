'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabase/client';
import { Questionnaire, Profile } from '@/lib/supabase';
import { ArrowLeft, TrendingUp, Moon, Pill, Activity, BarChart3, User } from 'lucide-react';
import SleepAnalysisChart from '@/components/insights/SleepAnalysisChart';
import SubstanceAnalysisChart from '@/components/insights/SubstanceAnalysisChart';
import CorrelationHeatMap from '@/components/insights/CorrelationHeatMap';
import { logPatientDataView } from '@/lib/audit';

type TabType = 'sleep' | 'substances' | 'correlations';

function DoctorInsightsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const patientId = params.patientId as string;

  const [patient, setPatient] = useState<Profile | null>(null);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('sleep');
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (user && patientId) {
      checkAccessAndLoadData();
    }
  }, [user, patientId]);

  const checkAccessAndLoadData = async () => {
    if (!user) return;

    try {
      // Verificar se o médico tem acesso ao paciente
      const { data: connection, error: accessError } = await supabase
        .from('doctor_patient')
        .select('*')
        .eq('doctor_id', user.id)
        .eq('patient_id', patientId)
        .not('accepted_at', 'is', null)
        .single();

      if (accessError || !connection) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      setHasAccess(true);

      // Log audit trail
      await logPatientDataView(user.id, patientId);

      // Carregar dados do paciente
      const { data: patientData, error: patientError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', patientId)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Carregar questionários
      const { data: questionnairesData, error: questionnairesError } = await supabase
        .from('questionnaires')
        .select('*')
        .eq('patient_id', patientId)
        .order('completed_at', { ascending: false })
        .limit(50);

      if (questionnairesError) throw questionnairesError;
      setQuestionnaires(questionnairesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: 'sleep' as TabType,
      label: 'Sono',
      icon: Moon,
      color: 'blue',
    },
    {
      id: 'substances' as TabType,
      label: 'Medicamentos & Substâncias',
      icon: Pill,
      color: 'green',
    },
    {
      id: 'correlations' as TabType,
      label: 'Correlações',
      icon: BarChart3,
      color: 'purple',
    },
  ];

  if (loading) {
    return (
      <ProtectedRoute requiredRole="doctor">
        <div className="min-h-screen bg-background-light flex justify-center items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!hasAccess) {
    return (
      <ProtectedRoute requiredRole="doctor">
        <div className="min-h-screen bg-background-light">
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/doctor/dashboard')}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-primary">
                  Acesso Negado
                </h1>
              </div>
            </div>
          </header>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="card text-center py-12">
              <Activity className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Você não tem acesso aos dados deste paciente
              </h3>
              <p className="text-gray-600 mb-6">
                Apenas médicos conectados a este paciente podem visualizar seus dados.
              </p>
              <button
                onClick={() => router.push('/doctor/dashboard')}
                className="btn-primary"
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="doctor">
      <div className="min-h-screen bg-background-light">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/doctor/dashboard')}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-primary">
                  Análise de Hábitos e Padrões
                </h1>
                <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                  <User className="w-4 h-4" />
                  <span>Paciente: {patient?.full_name}</span>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {questionnaires.length < 2 ? (
            /* Empty State */
            <div className="card text-center py-12">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Dados Insuficientes para Análise
              </h3>
              <p className="text-gray-600">
                Este paciente precisa responder pelo menos 2 questionários para gerar
                análises detalhadas sobre hábitos e padrões de humor.
              </p>
            </div>
          ) : (
            <>
              {/* Info Banner */}
              <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 rounded-lg shadow-lg mb-8">
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2">
                      Análise Clínica de {patient?.full_name}
                    </h2>
                    <p className="text-white/90 text-sm">
                      Estas análises ajudam a identificar padrões e fatores que impactam
                      o humor do paciente. Use estes insights para ajustes no tratamento.
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <span className="bg-white/20 px-3 py-1 rounded-full">
                        📊 {questionnaires.length} questionários
                      </span>
                      <span className="bg-white/20 px-3 py-1 rounded-full">
                        📅 {Math.floor(questionnaires.length / 4)} meses
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                        isActive
                          ? `bg-${tab.color}-500 text-white shadow-lg`
                          : `bg-white text-gray-600 hover:bg-gray-50`
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="transition-all">
                {activeTab === 'sleep' && (
                  <div>
                    <div className="mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Análise do Sono
                      </h2>
                      <p className="text-gray-600">
                        Relação entre quantidade/qualidade do sono e sintomas
                      </p>
                    </div>
                    <SleepAnalysisChart questionnaires={questionnaires} />
                  </div>
                )}

                {activeTab === 'substances' && (
                  <div>
                    <div className="mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Medicamentos e Substâncias
                      </h2>
                      <p className="text-gray-600">
                        Adesão aos medicamentos e uso de álcool/substâncias
                      </p>
                    </div>
                    <SubstanceAnalysisChart questionnaires={questionnaires} />
                  </div>
                )}

                {activeTab === 'correlations' && (
                  <div>
                    <div className="mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Análise de Correlações
                      </h2>
                      <p className="text-gray-600">
                        Fatores com maior impacto no humor do paciente
                      </p>
                    </div>
                    <CorrelationHeatMap questionnaires={questionnaires} />
                  </div>
                )}
              </div>

              {/* Footer Info */}
              <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-900 mb-2">
                  ⚕️ Nota Clínica
                </h4>
                <p className="text-sm text-amber-800">
                  As correlações estatísticas apresentadas são ferramentas auxiliares
                  e devem ser interpretadas no contexto clínico completo do paciente.
                  Dados de longo prazo (8+ semanas) oferecem análises mais robustas.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default DoctorInsightsPage;
