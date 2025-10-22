'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScaleQuestion from '@/components/questionnaire/ScaleQuestion';
import HabitQuestion from '@/components/questionnaire/HabitQuestion';
import ProgressCircle from '@/components/questionnaire/ProgressCircle';
import {
  depressiveQuestions,
  activationQuestions,
  habitQuestions,
  getDepressiveSeverity,
  getActivationSeverity,
} from '@/lib/questionnaire-data';
import { supabase } from '@/lib/supabase';

interface Answers {
  [key: string]: number | string | null;
}

function QuestionnairePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate progress
  const totalQuestions = depressiveQuestions.length + activationQuestions.length + habitQuestions.filter(q => q.id).length;
  const answeredCount = Object.values(answers).filter(v => v !== null && v !== undefined).length;

  const handleScaleAnswer = (id: string, value: number) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleHabitAnswer = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const calculateScores = () => {
    let depScore = 0;
    let actScore = 0;

    depressiveQuestions.forEach(q => {
      depScore += (answers[q.id] as number) || 0;
    });

    activationQuestions.forEach(q => {
      actScore += (answers[q.id] as number) || 0;
    });

    return { depScore, actScore, totalScore: depScore + actScore };
  };

  const handleSubmit = async () => {
    // Validate all questions are answered
    const allIds = [
      ...depressiveQuestions.map(q => q.id),
      ...activationQuestions.map(q => q.id),
      ...habitQuestions.filter(q => q.id).map(q => q.id!),
    ];

    const unanswered = allIds.filter(id => answers[id] === undefined || answers[id] === null);

    if (unanswered.length > 0) {
      setError(`Por favor, responda todas as ${totalQuestions} questões. Faltam ${unanswered.length}.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare data for database
      const questionnaireData = {
        patient_id: user!.id,
        // Depressive symptoms
        dep1: answers.dep1 as number,
        dep2: answers.dep2 as number,
        dep3: answers.dep3 as number,
        dep4: answers.dep4 as number,
        dep5: answers.dep5 as number,
        dep6: answers.dep6 as number,
        dep7: answers.dep7 as number,
        dep8: answers.dep8 as number,
        dep9: answers.dep9 as number,
        // Activation symptoms
        act1: answers.act1 as number,
        act2: answers.act2 as number,
        act3: answers.act3 as number,
        act4: answers.act4 as number,
        act5: answers.act5 as number,
        act6: answers.act6 as number,
        act7: answers.act7 as number,
        act8: answers.act8 as number,
        act9: answers.act9 as number,
        // Habits
        sleep_hours: answers.sleep_hours as string,
        sleep_quality: answers.sleep_quality as string,
        sleep_routine: answers.sleep_routine as string,
        medication: answers.medication as string,
        exercise: answers.exercise as string,
        alcohol: answers.alcohol as string,
        drugs: answers.drugs as string,
      };

      const { error: dbError } = await supabase
        .from('questionnaires')
        .insert([questionnaireData]);

      if (dbError) throw dbError;

      setShowResults(true);
    } catch (err: any) {
      console.error('Error saving questionnaire:', err);
      setError('Erro ao salvar questionário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const { depScore, actScore, totalScore } = calculateScores();
  const depSeverity = getDepressiveSeverity(depScore);
  const actSeverity = getActivationSeverity(actScore);

  let habitCounter = 0;
  let currentCategory = '';

  return (
    <ProtectedRoute requiredRole="patient">
      <div className="min-h-screen bg-background-light py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="card mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Questionário Semanal de Monitoramento de Humor (QSM-H)
            </h1>
            <p className="text-gray-600">
              Preencha com base em como você se sentiu na última semana
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border-l-4 border-primary rounded-lg p-5 mb-8">
            <h4 className="font-semibold text-primary mb-2">Instruções de Preenchimento</h4>
            <p className="text-gray-700">
              Por favor, responda com base em como você se sentiu <strong>na última semana.</strong>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-5 mb-8">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {!showResults ? (
            <>
              {/* Part A - Depressive Symptoms */}
              <div className="card mb-8">
                <h3 className="text-2xl font-semibold text-primary mb-4 pb-4 border-b border-gray-200">
                  Parte A - Sintomas depressivos
                </h3>
                <p className="text-gray-600 italic mb-6">
                  Durante a última semana, com que frequência você...
                </p>
                <div>
                  {depressiveQuestions.map((question, index) => (
                    <ScaleQuestion
                      key={question.id}
                      id={question.id}
                      questionNumber={index + 1}
                      text={question.text}
                      value={(answers[question.id] as number) ?? null}
                      onChange={(value) => handleScaleAnswer(question.id, value)}
                    />
                  ))}
                </div>
              </div>

              {/* Part B - Activation Symptoms */}
              <div className="card mb-8">
                <h3 className="text-2xl font-semibold text-primary mb-4 pb-4 border-b border-gray-200">
                  Parte B - Sintomas de ativação (mania/hipomania)
                </h3>
                <p className="text-gray-600 italic mb-6">
                  Durante a última semana, com que frequência você...
                </p>
                <div>
                  {activationQuestions.map((question, index) => (
                    <ScaleQuestion
                      key={question.id}
                      id={question.id}
                      questionNumber={index + 1}
                      text={question.text}
                      value={(answers[question.id] as number) ?? null}
                      onChange={(value) => handleScaleAnswer(question.id, value)}
                    />
                  ))}
                </div>
              </div>

              {/* Part C - Habits */}
              <div className="card mb-8">
                <h3 className="text-2xl font-semibold text-primary mb-4 pb-4 border-b border-gray-200">
                  Parte C: Hábitos e rotina
                </h3>
                <div>
                  {habitQuestions.map((question) => {
                    if (question.type === 'category') {
                      currentCategory = question.title!;
                      return null;
                    }

                    habitCounter++;

                    return (
                      <HabitQuestion
                        key={question.id}
                        id={question.id!}
                        questionNumber={habitCounter}
                        text={question.text!}
                        options={question.options!}
                        value={(answers[question.id!] as string) ?? null}
                        onChange={(value) => handleHabitAnswer(question.id!, value)}
                        category={question.icon}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center gap-4 mb-8">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-lg px-8 py-4"
                >
                  {loading ? 'Salvando...' : 'Ver Resultado'}
                </button>
              </div>

              {/* Progress Circle */}
              <ProgressCircle answered={answeredCount} total={totalQuestions} />
            </>
          ) : (
            /* Results Section */
            <div className="card">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-primary mb-2">
                  RESULTADOS DO QSM-H
                </h3>
                <p className="text-gray-600">Questionário Semanal de Monitoramento de Humor</p>
              </div>

              {/* Total Score */}
              <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl p-8 text-center mb-8">
                <h3 className="text-xl font-semibold mb-2">Pontuação Total Combinada</h3>
                <div className="text-5xl font-bold mb-2">{totalScore}/54</div>
                <p>Soma das duas escalas (máximo: 54 pontos)</p>
              </div>

              {/* Individual Scores */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-background-light rounded-xl p-6 text-center">
                  <div className="text-sm text-gray-600 mb-2">
                    Sintomas Depressivos<br />(PHQ-9)
                  </div>
                  <div className="text-4xl font-bold text-primary-dark">{depScore}/27</div>
                </div>
                <div className="bg-background-light rounded-xl p-6 text-center">
                  <div className="text-sm text-gray-600 mb-2">
                    Sintomas de Ativação<br />(PMQ-9)
                  </div>
                  <div className="text-4xl font-bold text-primary-dark">{actScore}/27</div>
                </div>
              </div>

              {/* Interpretations */}
              <div className="space-y-4 mb-8">
                <div className={`interpretation-box ${depSeverity.class}`}>
                  <h4 className="font-semibold mb-2">
                    SINTOMAS DEPRESSIVOS: {depSeverity.level} ({depScore}/27)
                  </h4>
                  <p>{depSeverity.description}</p>
                </div>

                <div className={`interpretation-box ${actSeverity.class}`}>
                  <h4 className="font-semibold mb-2">
                    SINTOMAS DE ATIVAÇÃO: {actSeverity.level} ({actScore}/27)
                  </h4>
                  <p>{actSeverity.description}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/patient/dashboard')}
                  className="btn-primary"
                >
                  Ver Dashboard
                </button>
                <button
                  onClick={() => {
                    setAnswers({});
                    setShowResults(false);
                  }}
                  className="btn-secondary"
                >
                  Novo Questionário
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default QuestionnairePage;
