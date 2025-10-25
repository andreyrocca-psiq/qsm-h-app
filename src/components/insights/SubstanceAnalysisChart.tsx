'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Cell,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Questionnaire } from '@/lib/supabase';

interface SubstanceAnalysisChartProps {
  questionnaires: Questionnaire[];
}

// Converter respostas de texto para valores numéricos
function parseMedication(medication: string): number {
  if (medication.includes('todas as doses')) return 4; // Ótimo
  if (medication.includes('1 ou 2 doses')) return 3; // Bom
  if (medication.includes('3 ou mais')) return 2; // Razoável
  if (medication.includes('maioria dos dias')) return 1; // Ruim
  return 3; // default
}

function parseAlcohol(alcohol: string): number {
  if (alcohol.includes('Não')) return 0;
  if (alcohol.includes('1 a 2')) return 1;
  if (alcohol.includes('3 ou mais')) return 2;
  return 0; // default
}

function parseDrugs(drugs: string): number {
  if (drugs.includes('Não')) return 0;
  if (drugs.includes('Sim')) return 1;
  return 0; // default
}

function parseExercise(exercise: string): number {
  if (exercise.includes('Nenhum')) return 0;
  if (exercise.includes('1 a 2')) return 1;
  if (exercise.includes('3 a 4')) return 2;
  if (exercise.includes('5 dias')) return 3;
  return 1; // default
}

export default function SubstanceAnalysisChart({ questionnaires }: SubstanceAnalysisChartProps) {
  const chartData = useMemo(() => {
    return questionnaires
      .slice()
      .reverse()
      .map((q) => ({
        date: format(new Date(q.completed_at), 'dd/MM', { locale: ptBR }),
        fullDate: q.completed_at,
        medication: parseMedication(q.medication),
        alcohol: parseAlcohol(q.alcohol),
        drugs: parseDrugs(q.drugs),
        exercise: parseExercise(q.exercise),
        depressive: q.dep_total,
        activation: q.act_total,
        combined: q.combined_total,
      }));
  }, [questionnaires]);

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Sem dados suficientes para análise
      </div>
    );
  }

  // Estatísticas
  const medicationAdherence = (chartData.reduce((sum, d) => sum + d.medication, 0) / chartData.length / 4) * 100;
  const alcoholFrequency = chartData.filter(d => d.alcohol > 0).length;
  const drugsFrequency = chartData.filter(d => d.drugs > 0).length;
  const exerciseAverage = chartData.reduce((sum, d) => sum + d.exercise, 0) / chartData.length;

  // Calcular correlação (simplificado)
  const alcoholDays = chartData.filter(d => d.alcohol > 0);
  const noAlcoholDays = chartData.filter(d => d.alcohol === 0);
  const avgMoodWithAlcohol = alcoholDays.length > 0
    ? alcoholDays.reduce((sum, d) => sum + d.combined, 0) / alcoholDays.length
    : 0;
  const avgMoodWithoutAlcohol = noAlcoholDays.length > 0
    ? noAlcoholDays.reduce((sum, d) => sum + d.combined, 0) / noAlcoholDays.length
    : 0;

  const poorMedicationDays = chartData.filter(d => d.medication <= 2);
  const goodMedicationDays = chartData.filter(d => d.medication > 2);
  const avgMoodPoorMedication = poorMedicationDays.length > 0
    ? poorMedicationDays.reduce((sum, d) => sum + d.combined, 0) / poorMedicationDays.length
    : 0;
  const avgMoodGoodMedication = goodMedicationDays.length > 0
    ? goodMedicationDays.reduce((sum, d) => sum + d.combined, 0) / goodMedicationDays.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-600 mb-1">Adesão a Medicamentos</div>
          <div className="text-2xl font-bold text-green-900">
            {medicationAdherence.toFixed(0)}%
          </div>
          <div className="text-xs text-green-600 mt-1">
            {medicationAdherence >= 90 ? '✅ Excelente' : medicationAdherence >= 75 ? '👍 Bom' : '⚠️ Precisa melhorar'}
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg">
          <div className="text-sm text-amber-600 mb-1">Uso de Álcool</div>
          <div className="text-2xl font-bold text-amber-900">
            {alcoholFrequency}x
          </div>
          <div className="text-xs text-amber-600 mt-1">
            em {chartData.length} semanas
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-sm text-red-600 mb-1">Uso de Drogas</div>
          <div className="text-2xl font-bold text-red-900">
            {drugsFrequency}x
          </div>
          <div className="text-xs text-red-600 mt-1">
            {drugsFrequency === 0 ? '✅ Nenhum uso' : `em ${chartData.length} semanas`}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-600 mb-1">Exercício Médio</div>
          <div className="text-2xl font-bold text-blue-900">
            {exerciseAverage.toFixed(1)}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {exerciseAverage < 1 ? '⚠️ Sedentário' : exerciseAverage < 2 ? '👍 Razoável' : '✅ Ativo'}
          </div>
        </div>
      </div>

      {/* Gráfico de Adesão a Medicamentos vs Humor */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Adesão a Medicamentos e Sintomas
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" domain={[0, 4]} label={{ value: 'Adesão', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Sintomas', angle: 90, position: 'insideRight' }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const medLabels = ['', 'Muito ruim', 'Ruim', 'Bom', 'Ótimo'];
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                      <p className="font-semibold">{payload[0].payload.date}</p>
                      <p className="text-green-600">
                        Medicação: {medLabels[payload[0].payload.medication]}
                      </p>
                      <p className="text-gray-600">
                        Sintomas Totais: {payload[0].payload.combined}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="medication" fill="#10B981" name="Adesão a Medicamentos">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.medication > 2 ? '#10B981' : '#F59E0B'} />
              ))}
            </Bar>
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="combined"
              stroke="#6366F1"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Sintomas Totais"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Substâncias e Exercício */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Uso de Substâncias e Atividade Física
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                      <p className="font-semibold">{payload[0].payload.date}</p>
                      <p className="text-amber-600">
                        Álcool: {payload[0].payload.alcohol === 0 ? 'Não' : payload[0].payload.alcohol === 1 ? '1-2x' : '3+ vezes'}
                      </p>
                      <p className="text-red-600">
                        Drogas: {payload[0].payload.drugs === 0 ? 'Não' : 'Sim'}
                      </p>
                      <p className="text-blue-600">
                        Exercício: {payload[0].payload.exercise} (0-3)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar dataKey="alcohol" fill="#F59E0B" name="Álcool (0-2)" />
            <Bar dataKey="drugs" fill="#EF4444" name="Drogas (0-1)" />
            <Bar dataKey="exercise" fill="#3B82F6" name="Exercício (0-3)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights de Correlação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
          <h5 className="font-semibold text-purple-900 mb-2">
            💊 Impacto da Medicação
          </h5>
          <p className="text-sm text-gray-700">
            Sintomas médios quando <strong>toma medicação corretamente</strong>:{' '}
            <span className="font-bold text-green-600">{avgMoodGoodMedication.toFixed(1)}</span>
          </p>
          <p className="text-sm text-gray-700">
            Sintomas médios quando <strong>esquece medicação</strong>:{' '}
            <span className="font-bold text-red-600">{avgMoodPoorMedication.toFixed(1)}</span>
          </p>
          {avgMoodPoorMedication > avgMoodGoodMedication && (
            <p className="text-xs text-purple-600 mt-2">
              ⚠️ Seus sintomas são piores quando você não toma a medicação regularmente!
            </p>
          )}
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
          <h5 className="font-semibold text-amber-900 mb-2">
            🍺 Impacto do Álcool
          </h5>
          <p className="text-sm text-gray-700">
            Sintomas médios <strong>com álcool</strong>:{' '}
            <span className="font-bold text-amber-600">{avgMoodWithAlcohol.toFixed(1)}</span>
          </p>
          <p className="text-sm text-gray-700">
            Sintomas médios <strong>sem álcool</strong>:{' '}
            <span className="font-bold text-green-600">{avgMoodWithoutAlcohol.toFixed(1)}</span>
          </p>
          {avgMoodWithAlcohol > avgMoodWithoutAlcohol && (
            <p className="text-xs text-amber-600 mt-2">
              ⚠️ Seus sintomas são piores nas semanas em que você consome álcool!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
