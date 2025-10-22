# QSM-H - Questionário Semanal de Monitoramento de Humor

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Aplicativo web progressivo (PWA) para monitoramento semanal de humor em pacientes com transtornos de humor, desenvolvido com Next.js, TypeScript, Tailwind CSS e Supabase.

## 📋 Sobre o Projeto

O QSM-H é uma ferramenta digital para auxiliar no acompanhamento de pacientes com transtornos de humor. O aplicativo permite:

- **Para Pacientes:**
  - Responder questionários semanais (PHQ-9 e PMQ-9)
  - Visualizar evolução através de gráficos interativos
  - Receber lembretes semanais por notificação push
  - Acessar histórico completo de avaliações

- **Para Médicos:**
  - Acompanhar múltiplos pacientes
  - Visualizar dados e gráficos de evolução
  - Identificar tendências e padrões
  - Acesso em tempo real aos questionários

## 🚀 Tecnologias

- **Frontend:**
  - [Next.js 14](https://nextjs.org/) - Framework React
  - [TypeScript](https://www.typescriptlang.org/) - Tipagem estática
  - [Tailwind CSS](https://tailwindcss.com/) - Estilização
  - [Recharts](https://recharts.org/) - Gráficos interativos
  - [Lucide React](https://lucide.dev/) - Ícones

- **Backend:**
  - [Supabase](https://supabase.com/) - Backend as a Service
  - PostgreSQL - Banco de dados
  - Row Level Security (RLS) - Segurança de dados

- **PWA:**
  - Service Workers - Funcionalidade offline
  - Web Push API - Notificações push
  - Manifest.json - Instalação no dispositivo

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ e npm/yarn
- Conta no Supabase

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/andreyrocca-psiq/qsm-h-app.git
cd qsm-h-app
```

### Passo 2: Instalar Dependências

```bash
npm install
# ou
yarn install
```

### Passo 3: Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. No SQL Editor do Supabase, execute o script `supabase/schema.sql`
3. Copie as credenciais do projeto

### Passo 4: Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha as variáveis no `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Passo 5: Executar em Desenvolvimento

```bash
npm run dev
# ou
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🏗️ Estrutura do Projeto

```
qsm-h-app/
├── public/
│   ├── icons/              # Ícones do PWA
│   ├── manifest.json       # Manifest do PWA
│   └── sw.js              # Service Worker
├── src/
│   ├── app/               # Páginas e rotas (Next.js App Router)
│   │   ├── auth/          # Autenticação (login, signup)
│   │   ├── patient/       # Área do paciente
│   │   └── doctor/        # Área do médico
│   ├── components/        # Componentes React
│   │   ├── charts/        # Componentes de gráficos
│   │   └── questionnaire/ # Componentes do questionário
│   ├── contexts/          # Contextos React (Auth)
│   └── lib/              # Utilitários e configurações
│       ├── supabase.ts    # Cliente Supabase
│       ├── questionnaire-data.ts  # Dados do questionário
│       └── notifications.ts       # Sistema de notificações
├── supabase/
│   ├── schema.sql         # Schema do banco de dados
│   └── README.md          # Instruções do Supabase
└── package.json
```

## 📊 Banco de Dados

### Tabelas Principais

- **profiles** - Perfis de usuários (pacientes e médicos)
- **questionnaires** - Respostas dos questionários
- **doctor_patient** - Relacionamento médico-paciente
- **push_subscriptions** - Assinaturas de notificações push

Veja o schema completo em `supabase/schema.sql`

## 🔐 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) para proteção de dados
- Criptografia de dados em trânsito (HTTPS)
- Isolamento de dados entre pacientes e médicos

## 📱 PWA - Instalação no Celular

### Android (Chrome)

1. Acesse o site pelo Chrome
2. Toque no menu (⋮) > "Instalar app"
3. Confirme a instalação

### iOS (Safari)

1. Acesse o site pelo Safari
2. Toque no botão de compartilhar
3. Role para baixo e toque em "Adicionar à Tela de Início"

## 🔔 Notificações Push

### Configuração VAPID

Para habilitar notificações push, gere chaves VAPID:

```bash
npx web-push generate-vapid-keys
```

Adicione as chaves ao `.env.local`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=sua_chave_publica
VAPID_PRIVATE_KEY=sua_chave_privada
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push para o GitHub
2. Conecte o repositório na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente
4. Deploy automático!

### Outras Plataformas

O projeto é compatível com:
- Netlify
- AWS Amplify
- Google Cloud Run
- Qualquer plataforma que suporte Next.js

## 📈 Funcionalidades Futuras

- [ ] Exportação de PDF com histórico completo
- [ ] Sistema de lembretes personalizáveis
- [ ] Integração com e-mail para convites
- [ ] Modo offline completo
- [ ] Análise de padrões com IA
- [ ] Multi-idioma (EN, ES)

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍⚕️ Créditos

Questionário desenvolvido pelo **Dr. Andrey Rocca**, baseado nas escalas PHQ-9 e PMQ-9 de domínio público.

Publicado em [transtornobipolar.net](https://transtornobipolar.net)

## 📞 Suporte

Para dúvidas ou sugestões, abra uma [issue](https://github.com/andreyrocca-psiq/qsm-h-app/issues) ou entre em contato.

---

Feito com ❤️ para ajudar no cuidado da saúde mental
