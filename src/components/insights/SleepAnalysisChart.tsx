'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Questionnaire } from '@/lib/supabase';

interface SleepAnalysisChartProps {
  questionnaires: Questionnaire[];
}

// Converter resposta de texto para valores numéricos
function parseSleepHours(sleepHours: string): number {
  if (sleepHours.includes('Menos de 4')) return 3;
  if (sleepHours.includes('4 e 6')) return 5;
  if (sleepHours.includes('6 e 8')) return 7;
  if (sleepHours.includes('8 e 10')) return 9;
  if (sleepHours.includes('Mais de 10')) return 11;
  return 7; // default
}

function parseSleepQuality(quality: string): number {
  if (quality.includes('Muito ruim')) return 1;
  if (quality.includes('Ruim')) return 2;
  if (quality.includes('Regular')) return 3;
  if (quality.includes('Boa')) return 4;
  if (quality.includes('Muito boa')) return 5;
  return 3; // default
}

function parseSleepRoutine(routine: string): number {
  if (routine.includes('variaram muito')) return 1; // Irregular
  if (routine.includes('alguma variação')) return 2; // Parcialmente regular
  if (routine.includes('rotina regular')) return 3; // Regular
  return 2; // default
}

export default function SleepAnalysisChart({ questionnaires }: SleepAnalysisChartProps) {
  const chartData = useMemo(() => {
    return questionnaires
      .slice()
      .reverse()
      .map((q) => ({
        date: format(new Date(q.completed_at), 'dd/MM', { locale: ptBR }),
        fullDate: q.completed_at,
        hours: parseSleepHours(q.sleep_hours),
        quality: parseSleepQuality(q.sleep_quality),
        routine: parseSleepRoutine(q.sleep_routine),
        depressive: q.dep_total,
        activation: q.act_total,
      }));
  }, [questionnaires]);

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Sem dados suficientes para análise
      </div>
    );
  }

  const averageHours = chartData.reduce((sum, d) => sum + d.hours, 0) / chartData.length;
  const averageQuality = chartData.reduce((sum, d) => sum + d.quality, 0) / chartData.length;

  return (
    <div className="space-y-6">
      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-600 mb-1">Média de Sono</div>
          <div className="text-2xl font-bold text-blue-900">
            {averageHours.toFixed(1)}h
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {averageHours < 6 ? '⚠️ Abaixo do ideal' : averageHours < 9 ? '✅ Adequado' : '⚠️ Acima do ideal'}
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-purple-600 mb-1">Qualidade Média</div>
          <div className="text-2xl font-bold text-purple-900">
            {averageQuality.toFixed(1)}/5
          </div>
          <div className="text-xs text-purple-600 mt-1">
            {averageQuality < 3 ? '⚠️ Precisa melhorar' : averageQuality < 4 ? '👍 Razoável' : '✅ Excelente'}
          </div>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg">
          <div className="text-sm text-indigo-600 mb-1">Total de Registros</div>
          <div className="text-2xl font-bold text-indigo-900">
            {chartData.length}
          </div>
          <div className="text-xs text-indigo-600 mt-1">
            {chartData.length < 4 ? 'Colete mais dados' : 'Dados suficientes'}
          </div>
        </div>
      </div>

      {/* Gráfico de Horas de Sono e Humor */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Horas de Sono vs Sintomas
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
            />
            <YAxis yAxisId="left" label={{ value: 'Horas', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Sintomas', angle: 90, position: 'insideRight' }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                      <p className="font-semibold">{payload[0].payload.date}</p>
                      <p className="text-blue-600">Sono: {payload[0].payload.hours}h</p>
                      <p className="text-red-600">Depressivos: {payload[0].payload.depressive}</p>
                      <p className="text-orange-600">Ativação: {payload[0].payload.activation}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="hours"
              fill="#3B82F6"
              fillOpacity={0.2}
              stroke="#3B82F6"
              strokeWidth={2}
              name="Horas de Sono"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="depressive"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Sintomas Depressivos"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="activation"
              stroke="#F97316"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Sintomas de Ativação"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Qualidade do Sono */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Qualidade do Sono ao Longo do Tempo
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const qualityLabels = ['', 'Muito ruim', 'Ruim', 'Regular', 'Boa', 'Muito boa'];
                  const routineLabels = ['', 'Irregular', 'Parcial', 'Regular'];
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                      <p className="font-semibold">{payload[0].payload.date}</p>
                      <p className="text-purple-600">
                        Qualidade: {qualityLabels[payload[0].payload.quality]}
                      </p>
                      <p className="text-indigo-600">
                        Rotina: {routineLabels[payload[0].payload.routine]}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar dataKey="quality" fill="#A855F7" name="Qualidade (1-5)" />
            <Bar dataKey="routine" fill="#6366F1" name="Rotina (1-3)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
