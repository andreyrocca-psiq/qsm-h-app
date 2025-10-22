# Configuração do Supabase

Este documento descreve como configurar o banco de dados Supabase para o aplicativo QSM-H.

## Passo 1: Criar um Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Anote a URL do projeto e as chaves API (anon key e service_role key)

## Passo 2: Configurar o Banco de Dados

1. No painel do Supabase, vá para SQL Editor
2. Copie todo o conteúdo do arquivo `schema.sql`
3. Cole no SQL Editor e execute

Isso criará:
- Tabelas: `profiles`, `doctor_patient`, `questionnaires`, `notifications`, `push_subscriptions`
- Políticas de segurança (RLS)
- Índices para melhor performance
- Triggers automáticos

## Passo 3: Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Preencha as variáveis com os valores do seu projeto Supabase:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima (anon key)
   - `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço (service_role key)

## Passo 4: Configurar Autenticação

No painel do Supabase:

1. Vá para Authentication > Providers
2. Habilite Email/Password authentication
3. Configure o template de email de confirmação (opcional)
4. Configure redirect URLs:
   - Development: `http://localhost:3000/**`
   - Production: `https://seu-dominio.com/**`

## Estrutura do Banco de Dados

### Tabela `profiles`
Estende `auth.users` com informações adicionais:
- `id`: UUID (PK, FK para auth.users)
- `role`: 'patient' ou 'doctor'
- `full_name`: Nome completo
- `phone`: Telefone
- Timestamps

### Tabela `doctor_patient`
Relacionamento entre médicos e pacientes:
- `doctor_id`: UUID (FK para profiles)
- `patient_id`: UUID (FK para profiles)
- `invited_at`: Data do convite
- `accepted_at`: Data da aceitação

### Tabela `questionnaires`
Armazena respostas dos questionários:
- Respostas PHQ-9 (dep1-dep9)
- Respostas PMQ-9 (act1-act9)
- Pontuações calculadas automaticamente
- Respostas de hábitos (sono, medicação, etc.)

### Tabela `push_subscriptions`
Armazena assinaturas de notificações push:
- `endpoint`: URL de notificação
- `p256dh` e `auth`: Chaves de criptografia

## Segurança (RLS)

Todas as tabelas têm Row Level Security habilitado:
- Pacientes só veem seus próprios dados
- Médicos veem dados dos pacientes vinculados
- Ninguém pode modificar dados de outros usuários
