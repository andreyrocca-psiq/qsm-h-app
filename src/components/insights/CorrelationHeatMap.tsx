'use client';

import { useMemo } from 'react';
import { Questionnaire } from '@/lib/supabase';

interface CorrelationHeatMapProps {
  questionnaires: Questionnaire[];
}

// Funções de parsing (mesmas dos outros componentes)
function parseSleepHours(sleepHours: string): number {
  if (sleepHours.includes('Menos de 4')) return 3;
  if (sleepHours.includes('4 e 6')) return 5;
  if (sleepHours.includes('6 e 8')) return 7;
  if (sleepHours.includes('8 e 10')) return 9;
  if (sleepHours.includes('Mais de 10')) return 11;
  return 7;
}

function parseSleepQuality(quality: string): number {
  if (quality.includes('Muito ruim')) return 1;
  if (quality.includes('Ruim')) return 2;
  if (quality.includes('Regular')) return 3;
  if (quality.includes('Boa')) return 4;
  if (quality.includes('Muito boa')) return 5;
  return 3;
}

function parseMedication(medication: string): number {
  if (medication.includes('todas as doses')) return 4;
  if (medication.includes('1 ou 2 doses')) return 3;
  if (medication.includes('3 ou mais')) return 2;
  if (medication.includes('maioria dos dias')) return 1;
  return 3;
}

function parseAlcohol(alcohol: string): number {
  if (alcohol.includes('Não')) return 0;
  if (alcohol.includes('1 a 2')) return 1;
  if (alcohol.includes('3 ou mais')) return 2;
  return 0;
}

function parseDrugs(drugs: string): number {
  if (drugs.includes('Não')) return 0;
  if (drugs.includes('Sim')) return 1;
  return 0;
}

function parseExercise(exercise: string): number {
  if (exercise.includes('Nenhum')) return 0;
  if (exercise.includes('1 a 2')) return 1;
  if (exercise.includes('3 a 4')) return 2;
  if (exercise.includes('5 dias')) return 3;
  return 1;
}

// Calcular correlação de Pearson (simplificado)
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const avgX = x.reduce((a, b) => a + b, 0) / n;
  const avgY = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - avgX;
    const dy = y[i] - avgY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  if (denomX === 0 || denomY === 0) return 0;

  return numerator / Math.sqrt(denomX * denomY);
}

export default function CorrelationHeatMap({ questionnaires }: CorrelationHeatMapProps) {
  const correlations = useMemo(() => {
    if (questionnaires.length < 3) return null;

    const data = questionnaires.map(q => ({
      sleepHours: parseSleepHours(q.sleep_hours),
      sleepQuality: parseSleepQuality(q.sleep_quality),
      medication: parseMedication(q.medication),
      alcohol: parseAlcohol(q.alcohol),
      drugs: parseDrugs(q.drugs),
      exercise: parseExercise(q.exercise),
      depressive: q.dep_total,
      activation: q.act_total,
      combined: q.combined_total,
    }));

    const factors = [
      { key: 'sleepHours', label: 'Horas de Sono' },
      { key: 'sleepQuality', label: 'Qualidade do Sono' },
      { key: 'medication', label: 'Adesão Medicação' },
      { key: 'alcohol', label: 'Uso de Álcool' },
      { key: 'drugs', label: 'Uso de Drogas' },
      { key: 'exercise', label: 'Exercício' },
    ];

    const outcomes = [
      { key: 'depressive', label: 'Sintomas Depressivos' },
      { key: 'activation', label: 'Sintomas de Ativação' },
      { key: 'combined', label: 'Sintomas Totais' },
    ];

    const results = [];

    for (const factor of factors) {
      for (const outcome of outcomes) {
        const x = data.map(d => d[factor.key as keyof typeof d] as number);
        const y = data.map(d => d[outcome.key as keyof typeof d] as number);
        const corr = calculateCorrelation(x, y);

        results.push({
          factor: factor.label,
          outcome: outcome.label,
          correlation: corr,
        });
      }
    }

    return results;
  }, [questionnaires]);

  if (!correlations || questionnaires.length < 3) {
    return (
      <div className="text-center py-8 text-gray-500">
        Colete pelo menos 3 questionários para ver correlações
      </div>
    );
  }

  // Agrupar por outcome
  const depressiveCorr = correlations.filter(c => c.outcome === 'Sintomas Depressivos');
  const activationCorr = correlations.filter(c => c.outcome === 'Sintomas de Ativação');
  const combinedCorr = correlations.filter(c => c.outcome === 'Sintomas Totais');

  const getColorClass = (corr: number) => {
    const abs = Math.abs(corr);
    if (abs < 0.2) return 'bg-gray-100 text-gray-600';
    if (abs < 0.4) return corr > 0 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700';
    if (abs < 0.6) return corr > 0 ? 'bg-orange-200 text-orange-800' : 'bg-blue-200 text-blue-800';
    return corr > 0 ? 'bg-red-200 text-red-900' : 'bg-green-200 text-green-900';
  };

  const getInterpretation = (corr: number) => {
    const abs = Math.abs(corr);
    if (abs < 0.2) return 'Sem correlação';
    if (abs < 0.4) return 'Correlação fraca';
    if (abs < 0.6) return 'Correlação moderada';
    return 'Correlação forte';
  };

  const renderCorrelationRow = (item: typeof correlations[0]) => (
    <div key={`${item.factor}-${item.outcome}`} className="flex items-center gap-3">
      <div className="flex-1 text-sm font-medium text-gray-700">
        {item.factor}
      </div>
      <div
        className={`px-3 py-2 rounded-lg text-center min-w-[100px] ${getColorClass(item.correlation)}`}
      >
        <div className="font-bold">{item.correlation.toFixed(2)}</div>
        <div className="text-xs">{getInterpretation(item.correlation)}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Legenda */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-purple-200">
        <h5 className="font-semibold text-gray-900 mb-2">
          📊 Como Interpretar as Correlações
        </h5>
        <div className="text-sm text-gray-700 space-y-1">
          <p>
            <span className="font-semibold text-red-600">Correlação positiva</span> (vermelha/laranja):{' '}
            quando o fator aumenta, os sintomas também aumentam
          </p>
          <p>
            <span className="font-semibold text-green-600">Correlação negativa</span> (verde/azul):{' '}
            quando o fator aumenta, os sintomas diminuem
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Valores: -1.0 (correlação negativa perfeita) a +1.0 (correlação positiva perfeita)
          </p>
        </div>
      </div>

      {/* Sintomas Depressivos */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-semibold text-red-700 mb-4">
          😔 Correlações com Sintomas Depressivos
        </h4>
        <div className="space-y-2">
          {depressiveCorr.map(renderCorrelationRow)}
        </div>
      </div>

      {/* Sintomas de Ativação */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-semibold text-orange-700 mb-4">
          ⚡ Correlações com Sintomas de Ativação
        </h4>
        <div className="space-y-2">
          {activationCorr.map(renderCorrelationRow)}
        </div>
      </div>

      {/* Sintomas Totais */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-semibold text-purple-700 mb-4">
          📈 Correlações com Sintomas Totais
        </h4>
        <div className="space-y-2">
          {combinedCorr.map(renderCorrelationRow)}
        </div>
      </div>

      {/* Insights Automáticos */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
        <h5 className="font-semibold text-indigo-900 mb-3">
          💡 Insights Principais
        </h5>
        <div className="space-y-2 text-sm">
          {combinedCorr
            .filter(c => Math.abs(c.correlation) > 0.3)
            .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
            .slice(0, 3)
            .map((c, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-lg">
                  {c.correlation > 0 ? '📈' : '📉'}
                </span>
                <p className="text-gray-700">
                  <strong>{c.factor}</strong> tem {' '}
                  {c.correlation > 0 ? 'correlação positiva' : 'correlação negativa'}{' '}
                  com seus sintomas totais ({Math.abs(c.correlation).toFixed(2)})
                </p>
              </div>
            ))}
          {combinedCorr.filter(c => Math.abs(c.correlation) > 0.3).length === 0 && (
            <p className="text-gray-600">
              Continue coletando dados para identificar padrões mais claros.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
