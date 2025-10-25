'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabase/client';
import { Questionnaire } from '@/lib/supabase';
import { ArrowLeft, TrendingUp, Moon, Pill, Activity, BarChart3 } from 'lucide-react';
import SleepAnalysisChart from '@/components/insights/SleepAnalysisChart';
import SubstanceAnalysisChart from '@/components/insights/SubstanceAnalysisChart';
import CorrelationHeatMap from '@/components/insights/CorrelationHeatMap';

type TabType = 'sleep' | 'substances' | 'correlations';

function InsightsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('sleep');

  useEffect(() => {
    loadQuestionnaires();
  }, [user]);

  const loadQuestionnaires = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('questionnaires')
        .select('*')
        .eq('patient_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(50); // Últimos 50 registros

      if (error) throw error;
      setQuestionnaires(data || []);
    } catch (error) {
      console.error('Error loading questionnaires:', error);
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

  return (
    <ProtectedRoute requiredRole="patient">
      <div className="min-h-screen bg-background-light">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/patient/dashboard')}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-primary">
                  Análise de Hábitos e Padrões
                </h1>
                <p className="text-gray-600 text-sm">
                  Explore como seu sono, medicamentos e substâncias afetam seu humor
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : questionnaires.length < 2 ? (
            /* Empty State */
            <div className="card text-center py-12">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Dados Insuficientes para Análise
              </h3>
              <p className="text-gray-600 mb-6">
                Responda pelo menos 2 questionários para ver análises detalhadas sobre
                seus hábitos e padrões de humor.
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
              {/* Info Banner */}
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg mb-8">
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2">
                      Entenda Seus Padrões
                    </h2>
                    <p className="text-white/90 text-sm">
                      Use estas análises para identificar o que afeta seu humor e compartilhe
                      com seu médico. Padrões claros podem ajudar a ajustar seu tratamento.
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <span className="bg-white/20 px-3 py-1 rounded-full">
                        📊 {questionnaires.length} questionários analisados
                      </span>
                      <span className="bg-white/20 px-3 py-1 rounded-full">
                        📅 {Math.floor(questionnaires.length / 4)} meses de dados
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
                        Veja como a quantidade e qualidade do seu sono impactam seus sintomas
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
                        Monitore sua adesão aos medicamentos e o uso de álcool e outras substâncias
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
                        Descubra quais fatores têm maior impacto no seu humor
                      </p>
                    </div>
                    <CorrelationHeatMap questionnaires={questionnaires} />
                  </div>
                )}
              </div>

              {/* Footer Info */}
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  💡 Dica Importante
                </h4>
                <p className="text-sm text-blue-800">
                  Estas análises são ferramentas para auxiliar você e seu médico. Não use
                  estas informações para alterar sua medicação ou tratamento sem orientação
                  médica. Continue respondendo os questionários semanalmente para análises
                  mais precisas.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default InsightsPage;
