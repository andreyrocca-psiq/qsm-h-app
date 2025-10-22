export interface Question {
  id: string;
  text: string;
}

export interface HabitQuestion {
  id?: string;
  type?: 'category';
  title?: string;
  icon?: string;
  text?: string;
  options?: string[];
}

export const depressiveQuestions: Question[] = [
  { id: 'dep1', text: 'Teve pouco interesse ou prazer em fazer as coisas' },
  { id: 'dep2', text: 'Se sentiu para baixo, deprimido(a) ou sem esperança' },
  { id: 'dep3', text: 'Teve dificuldade para pegar no sono, continuar dormindo ou dormiu demais' },
  { id: 'dep4', text: 'Se sentiu cansado(a) ou com pouca energia' },
  { id: 'dep5', text: 'Teve falta de apetite ou comeu demais' },
  { id: 'dep6', text: 'Se sentiu mal consigo mesmo(a) - ou achou que é um fracasso ou que decepcionou sua família ou você mesmo(a)' },
  { id: 'dep7', text: 'Teve dificuldade para se concentrar nas coisas, como ler jornal ou ver televisão' },
  { id: 'dep8', text: 'Se movimentou ou falou tão devagar que outras pessoas poderiam ter notado; ou o oposto - ficou tão agitado(a) ou inquieto(a) que você ficou andando de um lado para o outro muito mais do que de costume' },
  { id: 'dep9', text: 'Pensou em se ferir de alguma maneira ou que seria melhor estar morto(a)' }
];

export const activationQuestions: Question[] = [
  { id: 'act1', text: 'Teve menos sono que o habitual ou nenhum sono, e ainda se sentiu energizado(a)' },
  { id: 'act2', text: 'Se sentiu facilmente irritado(a)' },
  { id: 'act3', text: 'Se sentiu hiperativo(a) ou mais ativo que o habitual' },
  { id: 'act4', text: 'Agiu impulsivamente ou fez coisas sem pensar nas consequências' },
  { id: 'act5', text: 'Se sentiu acelerado(a) ou inquieto(a)' },
  { id: 'act6', text: 'Se sentiu distraído(a) com facilidade' },
  { id: 'act7', text: 'Sentiu pressão para continuar falando ou falou mais que o habitual' },
  { id: 'act8', text: 'Se sentiu argumentativo(a)' },
  { id: 'act9', text: 'Teve pensamentos acelerados' }
];

export const habitQuestions: HabitQuestion[] = [
  {
    type: 'category',
    title: 'Sono',
    icon: 'moon'
  },
  {
    id: 'sleep_hours',
    text: 'Em média, quantas horas você dormiu por noite na última semana?',
    options: [
      'Menos de 4 horas',
      'Entre 4 e 6 horas',
      'Entre 6 e 8 horas',
      'Entre 8 e 10 horas',
      'Mais de 10 horas'
    ]
  },
  {
    id: 'sleep_quality',
    text: 'Como você classificaria a qualidade do seu sono na última semana?',
    options: [
      'Muito ruim',
      'Ruim',
      'Regular',
      'Boa',
      'Muito boa'
    ]
  },
  {
    id: 'sleep_routine',
    text: 'Na última semana, você foi dormir e acordou em horários muito diferentes a cada dia?',
    options: [
      'Sim, meus horários variaram muito',
      'Um pouco, tive alguma variação',
      'Não, mantive uma rotina regular'
    ]
  },
  {
    type: 'category',
    title: 'Uso de Medicamentos',
    icon: 'pill'
  },
  {
    id: 'medication',
    text: 'Na última semana, você deixou de tomar alguma dose da sua medicação prescrita?',
    options: [
      'Não, tomei todas as doses corretamente',
      'Sim, esqueci 1 ou 2 doses',
      'Sim, esqueci 3 ou mais doses',
      'Não tomei a medicação na maioria dos dias'
    ]
  },
  {
    type: 'category',
    title: 'Atividade Física',
    icon: 'activity'
  },
  {
    id: 'exercise',
    text: 'Em quantos dias você praticou pelo menos 30 minutos de atividade física na última semana?',
    options: [
      'Nenhum dia',
      '1 a 2 dias',
      '3 a 4 dias',
      '5 dias ou mais'
    ]
  },
  {
    type: 'category',
    title: 'Uso de Substâncias',
    icon: 'droplet'
  },
  {
    id: 'alcohol',
    text: 'Na última semana, você consumiu bebidas alcoólicas?',
    options: [
      'Não',
      'Sim, 1 a 2 vezes',
      'Sim, 3 ou mais vezes'
    ]
  },
  {
    id: 'drugs',
    text: 'Na última semana, você fez uso de alguma outra substância (drogas não prescritas)?',
    options: [
      'Não',
      'Sim, uma ou mais vezes'
    ]
  }
];

export const ratingOptions = [
  { value: 0, label: '0', sublabel: 'Nenhuma vez' },
  { value: 1, label: '1', sublabel: 'Vários dias' },
  { value: 2, label: '2', sublabel: 'Mais da metade' },
  { value: 3, label: '3', sublabel: 'Quase todos' }
];

export function getDepressiveSeverity(score: number): {
  level: string;
  class: string;
  description: string;
} {
  if (score <= 4) {
    return {
      level: 'Mínima',
      class: 'minimal',
      description: 'Pontuação indica sintomas depressivos de nível mínimo.'
    };
  } else if (score <= 9) {
    return {
      level: 'Leve',
      class: 'leve',
      description: 'Pontuação indica sintomas depressivos de nível leve.'
    };
  } else if (score <= 14) {
    return {
      level: 'Moderada',
      class: 'moderada',
      description: 'Pontuação indica sintomas depressivos de nível moderado.'
    };
  } else if (score <= 19) {
    return {
      level: 'Moderadamente Severa',
      class: 'severa',
      description: 'Pontuação indica sintomas depressivos moderadamente severos.'
    };
  } else {
    return {
      level: 'Severa',
      class: 'severa',
      description: 'Pontuação indica sintomas depressivos de nível severo.'
    };
  }
}

export function getActivationSeverity(score: number): {
  level: string;
  class: string;
  description: string;
} {
  if (score < 5) {
    return {
      level: 'Remissão',
      class: 'remissao',
      description: 'Pontuação indica sintomas de ativação em remissão.'
    };
  } else if (score < 10) {
    return {
      level: 'Sublimiares',
      class: 'sublimiares',
      description: 'Pontuação indica sintomas de ativação sublimiares.'
    };
  } else {
    return {
      level: 'Elevados',
      class: 'elevados',
      description: 'Pontuação indica sintomas de ativação elevados.'
    };
  }
}
