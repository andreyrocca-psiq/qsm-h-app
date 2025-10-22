# Guia de Configuração do Supabase para QSM-H

Este guia irá ajudá-lo a configurar completamente a integração do Supabase com o aplicativo QSM-H.

## Pré-requisitos

- Conta no Supabase (https://supabase.com)
- Projeto criado no Supabase
- Node.js e npm instalados

## Passo 1: Obter as Credenciais do Supabase

1. Acesse o painel do Supabase: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **Settings** (Configurações) > **API**
4. Copie as seguintes informações:
   - **Project URL** (URL do Projeto)
   - **anon/public key** (Chave pública/anônima)
   - **service_role key** (Chave de serviço - mantenha secreta!)

## Passo 2: Configurar as Variáveis de Ambiente

1. Abra o arquivo `.env.local` na raiz do projeto
2. Preencha com suas credenciais do Supabase:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_publica_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_aqui

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Web Push Notifications (VAPID Keys) - Opcional por enquanto
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

## Passo 3: Criar o Schema do Banco de Dados

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New query** (Nova consulta)
3. Abra o arquivo `supabase-schema.sql` deste projeto
4. Copie todo o conteúdo do arquivo
5. Cole no SQL Editor do Supabase
6. Clique em **Run** (Executar)

Isso irá criar todas as tabelas necessárias:
- `profiles` - Perfis de usuários (pacientes e médicos)
- `doctor_patients` - Relacionamento entre médicos e pacientes
- `questionnaires` - Questionários PHQ-9 e PMQ-9
- `push_subscriptions` - Assinaturas para notificações push
- `user_consents` - Consentimentos LGPD
- `audit_logs` - Logs de auditoria
- `data_deletion_requests` - Solicitações de exclusão de dados

## Passo 4: Configurar Autenticação

1. No painel do Supabase, vá em **Authentication** > **Providers**
2. Certifique-se de que **Email** está habilitado
3. Configure as seguintes opções:
   - **Enable email confirmations**: Ativado (recomendado para produção)
   - **Secure email change**: Ativado
   - **Secure password change**: Ativado

### Configurar URLs de Redirecionamento

1. Vá em **Authentication** > **URL Configuration**
2. Adicione as seguintes URLs:
   - **Site URL**: `http://localhost:3000` (desenvolvimento)
   - **Redirect URLs**:
     - `http://localhost:3000/**`
     - Sua URL de produção quando estiver pronto

## Passo 5: Configurar Row Level Security (RLS)

O script SQL já configura automaticamente as políticas de segurança. Verifique se estão ativas:

1. Vá em **Database** > **Tables**
2. Para cada tabela, clique em **...** > **View policies**
3. Confirme que as políticas estão ativas

As políticas garantem que:
- Usuários só podem ver e editar seus próprios dados
- Médicos podem ver dados de pacientes autorizados
- Pacientes podem aceitar convites de médicos

## Passo 6: Testar a Integração

1. Instale as dependências (se ainda não fez):
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

3. Acesse http://localhost:3000
4. Teste o registro de usuário:
   - Vá em "Cadastro"
   - Crie uma conta de paciente ou médico
   - Verifique se o perfil foi criado no Supabase (Database > Tables > profiles)

## Passo 7: Configurar Notificações Push (Opcional)

Para habilitar notificações push semanais:

1. Gere chaves VAPID em: https://www.attheminute.com/vapid-key-generator
2. Adicione as chaves ao `.env.local`:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=sua_chave_publica_vapid
VAPID_PRIVATE_KEY=sua_chave_privada_vapid
```

## Verificação de Segurança

Execute estas verificações de segurança:

### 1. Verificar RLS nas Tabelas
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```
Todas as tabelas devem ter `rowsecurity = true`

### 2. Testar Isolamento de Dados
- Crie dois usuários diferentes
- Tente acessar dados de um usuário com outro
- Deve retornar vazio ou erro de permissão

### 3. Verificar Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

## Estrutura de Dados

### Perfis (profiles)
- `id`: UUID do usuário (referência ao auth.users)
- `role`: 'patient' ou 'doctor'
- `full_name`: Nome completo
- `phone`: Telefone (opcional)

### Questionários (questionnaires)
- Armazena respostas do PHQ-9 (depressão)
- Armazena respostas do PMQ-9 (ativação)
- Armazena hábitos (sono, medicação, exercício, etc.)

### Relacionamento Médico-Paciente (doctor_patients)
- Médicos podem convidar pacientes
- Pacientes devem aceitar o convite
- Médicos só veem dados de pacientes que aceitaram

## Resolução de Problemas

### Erro: "Invalid API key"
- Verifique se copiou corretamente as chaves do Supabase
- Certifique-se de usar a chave anon/public (não a service_role) no frontend

### Erro: "New row violates row-level security policy"
- Verifique se as políticas RLS estão configuradas corretamente
- Execute o script SQL novamente

### Erro: "relation does not exist"
- O schema não foi criado corretamente
- Execute o script `supabase-schema.sql` no SQL Editor

### Usuário criado mas perfil não aparece
- Verifique se o trigger `on_auth_user_created` está ativo
- Execute esta query para verificar:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

## Próximos Passos

1. Configure o ambiente de produção
2. Adicione sua URL de produção nas configurações de autenticação
3. Configure backups automáticos no Supabase
4. Configure alertas de monitoramento
5. Implemente notificações por e-mail (opcional)

## Suporte

Se encontrar problemas:
1. Verifique os logs no Supabase Dashboard
2. Verifique o console do navegador para erros
3. Consulte a documentação do Supabase: https://supabase.com/docs

## Recursos Úteis

- Documentação Supabase: https://supabase.com/docs
- Documentação Next.js: https://nextjs.org/docs
- Documentação TypeScript: https://www.typescriptlang.org/docs

## Conformidade LGPD

O aplicativo já está configurado para conformidade com LGPD:
- Consentimentos são registrados na tabela `user_consents`
- Ações são auditadas na tabela `audit_logs`
- Usuários podem solicitar exclusão de dados
- Dados são mantidos pelo período mínimo necessário

---

Desenvolvido para o projeto QSM-H
