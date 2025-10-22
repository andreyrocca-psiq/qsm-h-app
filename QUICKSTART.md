# 🚀 Guia de Início Rápido

Este guia irá te ajudar a configurar e executar o QSM-H em poucos minutos.

## ⚡ Configuração Rápida

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Supabase

Acesse [supabase.com](https://supabase.com) e:

1. Crie um novo projeto
2. Vá para SQL Editor
3. Copie e execute o conteúdo de `supabase/schema.sql`
4. Vá para Settings > API
5. Copie a URL e as keys

### 3. Configurar Ambiente

Crie o arquivo `.env.local`:

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Executar

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📱 Testando o App

### Como Paciente

1. Clique em "Criar Conta"
2. Selecione "Paciente"
3. Preencha seus dados
4. Acesse o Dashboard
5. Clique em "Responder Questionário"
6. Complete o QSM-H
7. Veja seus resultados e gráficos!

### Como Médico

1. Clique em "Criar Conta"
2. Selecione "Médico"
3. Preencha seus dados
4. Acesse o Dashboard
5. Veja a lista de pacientes (inicialmente vazia)
6. Use "Convidar Paciente" para adicionar pacientes

## 🔧 Problemas Comuns

### Erro de Conexão com Supabase

- Verifique se as credenciais estão corretas no `.env.local`
- Certifique-se de que executou o schema SQL no Supabase
- Verifique se o projeto está ativo no Supabase

### Notificações não funcionam

- As notificações push requerem HTTPS em produção
- Em desenvolvimento, use `localhost` (funciona com HTTP)
- Configure as chaves VAPID no `.env.local`

### Erro ao criar conta

- Verifique se o email ainda não está cadastrado
- Confirme que o Supabase Auth está habilitado
- Verifique os logs do console do navegador

## 📚 Próximos Passos

- Leia a [Documentação Completa](README.md)
- Configure [Notificações Push](#notificações-push)
- Faça o [Deploy na Vercel](#deploy-vercel)
- Personalize o tema e cores

## 🆘 Precisa de Ajuda?

- Consulte a [documentação do Supabase](https://supabase.com/docs)
- Abra uma [issue no GitHub](https://github.com/andreyrocca-psiq/qsm-h-app/issues)
- Verifique os logs do console (F12)

---

Boa sorte! 🎉
