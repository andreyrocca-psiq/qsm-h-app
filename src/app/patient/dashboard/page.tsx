'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import MoodLineChart from '@/components/charts/LineChart';
import { supabase, Questionnaire } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingDown, TrendingUp, Calendar, LogOut, FileText } from 'lucide-react';

function PatientDashboard() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);

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
        .limit(20);

      if (error) throw error;
      setQuestionnaires(data || []);
    } catch (error) {
      console.error('Error loading questionnaires:', error);
    } finally {
      setLoading(false);
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
              <div className="mb-8">
                <button
                  onClick={() => router.push('/patient/questionnaire')}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  <Calendar className="w-5 h-5" />
                  Responder Novo Questionário
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
      </div>
    </ProtectedRoute>
  );
}

export default PatientDashboard;
